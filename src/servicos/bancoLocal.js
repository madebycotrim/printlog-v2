import { openDB } from 'idb';

const NOME_BANCO = 'SCAE_DB';
const VERSAO_BANCO = 1;

export const iniciarBanco = async () => {
    return openDB(NOME_BANCO, VERSAO_BANCO, {
        upgrade(banco) {
            // Store para alunos (leitura para validação)
            if (!banco.objectStoreNames.contains('alunos')) {
                banco.createObjectStore('alunos', { keyPath: 'matricula' });
            }

            // Store para registros offline
            if (!banco.objectStoreNames.contains('registros_acesso')) {
                const store = banco.createObjectStore('registros_acesso', { keyPath: 'id' });
                store.createIndex('sincronizado', 'sincronizado');
                store.createIndex('timestamp', 'timestamp');
                store.createIndex('aluno_matricula', 'aluno_matricula'); // New index for performance
            }
        },
    });
};

export const bancoLocal = {
    iniciarBanco,

    // Alunos
    salvarAlunos: async (alunos) => {
        const banco = await iniciarBanco();
        const transacao = banco.transaction('alunos', 'readwrite');
        await Promise.all([
            transacao.store.clear(),
            ...alunos.map(aluno => transacao.store.put(aluno))
        ]);
        await transacao.done;
    },

    importarAlunos: async (novosAlunos) => {
        const banco = await iniciarBanco();
        const transacao = banco.transaction('alunos', 'readwrite');
        await Promise.all([
            ...novosAlunos.map(aluno => transacao.store.put(aluno))
        ]);
        await transacao.done;
    },

    buscarAluno: async (matricula) => {
        const banco = await iniciarBanco();
        return await banco.get('alunos', matricula);
    },

    contarAlunos: async () => {
        const banco = await iniciarBanco();
        return await banco.count('alunos');
    },

    // Registros
    salvarRegistro: async (registro) => {
        const banco = await iniciarBanco();
        // Usar 0 para false, 1 para true para indexação robusta
        await banco.put('registros_acesso', { ...registro, sincronizado: 0 });
    },

    listarRegistrosPendentes: async () => {
        const banco = await iniciarBanco();
        // 0 = false
        return await banco.getAllFromIndex('registros_acesso', 'sincronizado', 0);
    },

    marcarComoSincronizado: async (ids) => {
        const banco = await iniciarBanco();
        const transacao = banco.transaction('registros_acesso', 'readwrite');
        for (const id of ids) {
            const registro = await transacao.store.get(id);
            if (registro) {
                registro.sincronizado = 1;
                await transacao.store.put(registro);
            }
        }
        await transacao.done;
    },

    // v2.5 - Evacuação e Painel
    listarAlunosPresentes: async () => {
        const banco = await iniciarBanco();

        // Obter todos os registros e alunos
        // Otimização: Em produção real, usar índice 'timestamp'
        const registros = await banco.getAll('registros_acesso');
        const alunos = await banco.getAll('alunos');

        // Criar mapa de alunos para acesso rápido
        const mapaAlunos = new Map(alunos.map(a => [a.matricula, a]));

        // Agrupar registros por matrícula para encontrar o último movimento
        const ultimosMovimentos = {};

        registros.forEach(registro => {
            const matricula = registro.aluno_matricula;
            // Se não tem registro ou esse é mais recente
            if (!ultimosMovimentos[matricula] || new Date(registro.timestamp) > new Date(ultimosMovimentos[matricula].timestamp)) {
                ultimosMovimentos[matricula] = registro;
            }
        });

        // Filtrar apenas quem teve ENTRADA como último movimento
        const presentes = Object.values(ultimosMovimentos)
            .filter(r => r.tipo_movimentacao === 'ENTRADA')
            .map(r => {
                const infoAluno = mapaAlunos.get(r.aluno_matricula) || { nome_completo: 'Desconhecido', turma_id: '?' };
                return {
                    ...r,
                    nome_completo: infoAluno.nome_completo,
                    turma_id: infoAluno.turma_id,
                    matricula: r.aluno_matricula // Garantir que matricula está no topo
                };
            });

        return presentes;
    }
};
