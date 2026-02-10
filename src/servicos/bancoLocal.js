import { openDB } from 'idb';

const NOME_BANCO = 'SCAE_DB';
const VERSAO_BANCO = 3;

export const iniciarBanco = async () => {
    return openDB(NOME_BANCO, VERSAO_BANCO, {
        upgrade(banco, oldVersion, newVersion, transaction) {
            // Store para alunos (leitura para validação)
            if (!banco.objectStoreNames.contains('alunos')) {
                const store = banco.createObjectStore('alunos', { keyPath: 'matricula' });
                store.createIndex('turma_id', 'turma_id'); // Optimization for filtering by class
                store.createIndex('status', 'status'); // Access control
            }

            // Store para registros offline
            if (!banco.objectStoreNames.contains('registros_acesso')) {
                const store = banco.createObjectStore('registros_acesso', { keyPath: 'id' });
                store.createIndex('sincronizado', 'sincronizado');
                store.createIndex('timestamp', 'timestamp');
                store.createIndex('aluno_matricula', 'aluno_matricula');
            }

            // v2 - Store para Turmas
            if (!banco.objectStoreNames.contains('turmas')) {
                const store = banco.createObjectStore('turmas', { keyPath: 'id' });
                // v3 indexes
                store.createIndex('ano_letivo', 'ano_letivo');
                store.createIndex('serie', 'serie');
                store.createIndex('turno', 'turno');
            } else if (oldVersion < 3) {
                // Add indexes to existing store if upgrading
                const store = transaction.objectStore('turmas');
                if (!store.indexNames.contains('ano_letivo')) store.createIndex('ano_letivo', 'ano_letivo');
                if (!store.indexNames.contains('serie')) store.createIndex('serie', 'serie');
                if (!store.indexNames.contains('turno')) store.createIndex('turno', 'turno');
            }

            // v3 - Configurações
            if (!banco.objectStoreNames.contains('configuracoes')) {
                banco.createObjectStore('configuracoes', { keyPath: 'chave' });
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
