import { openDB } from 'idb';

const NOME_BANCO = 'SCAE_DB';
const VERSAO_BANCO = 7; // Incrementado para garantir criação das stores LGPD

export const iniciarBanco = async () => {
    return openDB(NOME_BANCO, VERSAO_BANCO, {
        upgrade(banco, oldVersion, newVersion, transaction) {
            // Store para alunos (leitura para validação)
            if (!banco.objectStoreNames.contains('alunos')) {
                const store = banco.createObjectStore('alunos', { keyPath: 'matricula' });
                store.createIndex('turma_id', 'turma_id');
                store.createIndex('status', 'status');
            }

            // Store para registros offline
            if (!banco.objectStoreNames.contains('registros_acesso')) {
                const store = banco.createObjectStore('registros_acesso', { keyPath: 'id' });
                store.createIndex('sincronizado', 'sincronizado');
                store.createIndex('timestamp', 'timestamp');
                store.createIndex('aluno_matricula', 'aluno_matricula');
                store.createIndex('tipo_movimentacao', 'tipo_movimentacao'); // Otimiza relatórios
            }

            // v2 - Store para Turmas
            if (!banco.objectStoreNames.contains('turmas')) {
                const store = banco.createObjectStore('turmas', { keyPath: 'id' });
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

            // v4 - Sprint 1: Segurança (Apenas Auditoria e Usuários mantidos)

            // Logs de Auditoria
            if (!banco.objectStoreNames.contains('logs_auditoria')) {
                const store = banco.createObjectStore('logs_auditoria', { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp');
                store.createIndex('usuario_email', 'usuario_email');
                store.createIndex('acao', 'acao');
                store.createIndex('entidade_tipo', 'entidade_tipo');
            }

            // Usuários (RBAC)
            if (!banco.objectStoreNames.contains('usuarios')) {
                const store = banco.createObjectStore('usuarios', { keyPath: 'email' });
                store.createIndex('papel', 'papel');
                store.createIndex('ativo', 'ativo');
            }
            // v5 - Fila de Pendências e Sincronização Inteligente
            if (!banco.objectStoreNames.contains('fila_pendencias')) {
                const store = banco.createObjectStore('fila_pendencias', { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp');
                store.createIndex('colecao', 'colecao');
            }

            // Atualizações de índices para sincronização
            if (oldVersion < 7) {
                const storeAlunos = transaction.objectStore('alunos');
                if (!storeAlunos.indexNames.contains('sincronizado')) storeAlunos.createIndex('sincronizado', 'sincronizado');

                const storeTurmas = transaction.objectStore('turmas');
                if (!storeTurmas.indexNames.contains('sincronizado')) storeTurmas.createIndex('sincronizado', 'sincronizado');
            }
        },
    });
};

export const bancoLocal = {
    iniciarBanco,

    // --- Fila de Pendências (Offline Support) ---
    adicionarPendencia: async (acao, colecao, dadoId, dadosExtras = null) => {
        const banco = await iniciarBanco();
        await banco.put('fila_pendencias', {
            id: crypto.randomUUID(),
            acao, // 'DELETE', 'UPDATE', 'CREATE'
            colecao, // 'alunos', 'turmas'
            dado_id: dadoId,
            dados_extras: dadosExtras,
            timestamp: new Date().toISOString()
        });
    },

    listarPendencias: async () => {
        const banco = await iniciarBanco();
        return await banco.getAllFromIndex('fila_pendencias', 'timestamp');
    },

    removerPendencia: async (id) => {
        const banco = await iniciarBanco();
        await banco.delete('fila_pendencias', id);
    },

    // --- Alunos ---
    salvarAlunos: async (alunos, sincronizado = 1) => {
        const banco = await iniciarBanco();
        const transacao = banco.transaction('alunos', 'readwrite');

        // Se sincronizado=1 (vindo da API), substituir tudo (Server Truth)
        // MAS preservar quem tem sincronizado=0 (criado offline)
        if (sincronizado === 1) {
            const locais = await transacao.store.getAll();
            const pendentes = locais.filter(a => a.sincronizado === 0);

            await transacao.store.clear();

            // Re-inserir pendentes
            for (const p of pendentes) {
                await transacao.store.put(p);
            }
        }

        // Inserir novos/atualizados
        for (const aluno of alunos) {
            await transacao.store.put({ ...aluno, sincronizado }); // 1 ou 0
        }

        await transacao.done;
    },

    // Salvar um único aluno (uso local/offline)
    salvarAluno: async (aluno) => {
        const banco = await iniciarBanco();
        await banco.put('alunos', { ...aluno, sincronizado: 0 }); // Marca como pendente
    },

    deletarAluno: async (matricula) => {
        const banco = await iniciarBanco();
        await banco.delete('alunos', matricula);
    },

    // --- Turmas ---
    salvarTurmas: async (turmas, sincronizado = 1) => {
        const banco = await iniciarBanco();
        const transacao = banco.transaction('turmas', 'readwrite');

        if (sincronizado === 1) {
            const locais = await transacao.store.getAll();
            const pendentes = locais.filter(t => t.sincronizado === 0);

            await transacao.store.clear();

            for (const p of pendentes) {
                await transacao.store.put(p);
            }
        }

        for (const t of turmas) {
            await transacao.store.put({ ...t, sincronizado });
        }
        await transacao.done;
    },

    importarAlunos: async (novosAlunos) => {
        const banco = await iniciarBanco();
        const transacao = banco.transaction('alunos', 'readwrite');
        await Promise.all([
            ...novosAlunos.map(aluno => transacao.store.put({ ...aluno, sincronizado: 0 }))
        ]);
        await transacao.done;
    },

    buscarAluno: async (matricula) => {
        const banco = await iniciarBanco();
        return await banco.get('alunos', matricula);
    },

    buscarAlunosPorNome: async (termo) => {
        const banco = await iniciarBanco();
        const todosAlunos = await banco.getAll('alunos');

        // Busca case-insensitive
        const termoLower = termo.toLowerCase().trim();

        if (!termoLower) return [];

        // Filtrar alunos que contenham o termo no nome
        const resultados = todosAlunos.filter(aluno =>
            aluno.nome_completo.toLowerCase().includes(termoLower)
        );

        // Ordenar por relevância (nome começa com o termo primeiro)
        resultados.sort((a, b) => {
            const aNomeStart = a.nome_completo.toLowerCase().startsWith(termoLower);
            const bNomeStart = b.nome_completo.toLowerCase().startsWith(termoLower);

            if (aNomeStart && !bNomeStart) return -1;
            if (!aNomeStart && bNomeStart) return 1;
            return a.nome_completo.localeCompare(b.nome_completo);
        });

        // Limitar a 10 resultados
        return resultados.slice(0, 10);
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
    },

    // --- Usuários e Permissões ---
    listarUsuarios: async () => {
        const banco = await iniciarBanco();
        return await banco.getAll('usuarios');
    },

    salvarUsuario: async (usuario) => {
        const banco = await iniciarBanco();
        await banco.put('usuarios', {
            ...usuario,
            atualizado_em: new Date().toISOString()
        });
    },

    deletarUsuario: async (email) => {
        const banco = await iniciarBanco();
        await banco.delete('usuarios', email);
    }
};
