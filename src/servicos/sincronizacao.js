import { api } from './api';
import { bancoLocal } from './bancoLocal';

export const servicoSincronizacao = {
    // 1. Processar Fila de Pendências (DELETE/UPDATE Offline)
    processarPendencias: async () => {
        try {
            const pendencias = await bancoLocal.listarPendencias();
            if (pendencias.length === 0) return { sucesso: true, processados: 0 };

            console.log(`Sync: Processando ${pendencias.length} pendências...`);
            let processados = 0;

            for (const p of pendencias) {
                try {
                    if (p.acao === 'DELETE' && p.colecao === 'alunos') {
                        await api.remover(`/alunos?matricula=${p.dado_id}`);
                        await bancoLocal.removerPendencia(p.id);
                        processados++;
                    }
                    // Outras ações (UPDATE, CREATE) podem ser adicionadas aqui
                } catch (erroItem) {
                    console.error(`Falha ao processar pendência ${p.id}:`, erroItem);
                    // Não remove da fila para tentar novamente depois
                }
            }
            return { sucesso: true, processados };
        } catch (erro) {
            console.error('Erro na fila de pendências:', erro);
            return { sucesso: false, erro: erro.message };
        }
    },

    sincronizarAlunos: async () => {
        try {
            // 1. Processar pendências antes de puxar
            await servicoSincronizacao.processarPendencias();

            // 2. Push: Enviar alunos criados offline (sincronizado=0)
            const banco = await bancoLocal.iniciarBanco();
            const alunosLocais = await banco.getAll('alunos');
            const novos = alunosLocais.filter(a => a.sincronizado === 0);

            for (const novo of novos) {
                try {
                    // Remover campo local antes de enviar
                    const { sincronizado, ...dadosEnvio } = novo;
                    await api.enviar('/alunos', dadosEnvio);
                    // Atualizar localmente para sincronizado=1
                    await banco.put('alunos', { ...novo, sincronizado: 1 });
                } catch (e) {
                    console.error('Erro ao enviar aluno offline:', e);
                }
            }

            // 3. Pull: Baixar versão oficial do servidor
            const alunosServidor = await api.obter('/alunos');

            // 4. Merge Inteligente (bancoLocal.salvarAlunos já preserva locais não-sincronizados)
            await bancoLocal.salvarAlunos(alunosServidor, 1);

            console.log('Alunos sincronizados (Smart Sync):', alunosServidor.length);
            return { sucesso: true, quantidade: alunosServidor.length };
        } catch (erro) {
            console.error('Erro na sincronização de alunos:', erro);
            return { sucesso: false, erro: erro.message };
        }
    },

    sincronizarRegistros: async () => {
        try {
            // 1. Push (Enviar Locais)
            const pendentes = await bancoLocal.listarRegistrosPendentes();
            const naoSincronizados = pendentes.filter(r => !r.sincronizado); // double check

            let enviadosCount = 0;
            if (naoSincronizados.length > 0) {
                const resposta = await api.enviar('/acessos', naoSincronizados);
                const idsSincronizados = resposta
                    .filter(r => r.status === 'sincronizado')
                    .map(r => r.id);

                await bancoLocal.marcarComoSincronizado(idsSincronizados);
                enviadosCount = idsSincronizados.length;
            }

            // 2. Pull (Baixar do Servidor - Últimas 24h ou tudo se for leve)
            // Para evitar tráfego excessivo, podemos baixar apenas os recentes ou implementar paginação depois.
            // Por enquanto, baixamos tudo do dia (a API deve suportar filtro de data)
            try {
                // TODO: Adicionar filtro de data na API para otimizar
                const registrosServidor = await api.obter('/acessos');

                const banco = await bancoLocal.iniciarBanco();
                const tx = banco.transaction('registros_acesso', 'readwrite');

                for (const r of registrosServidor) {
                    // Só salva se não existir ou (opcional) se for atualização
                    // Como logs são imutáveis, putIfAbsent ou verificação simples serve
                    const existente = await tx.store.get(r.id);
                    if (!existente) {
                        await tx.store.put({ ...r, sincronizado: 1 });
                    }
                }
                await tx.done;
                console.log('Registros baixados do servidor:', registrosServidor.length);
            } catch (erroPull) {
                console.warn('Erro ao baixar registros (Pull):', erroPull);
                // Não falha o sync inteiro se o pull falhar, pois o push pode ter funcionado
            }

            return { sucesso: true, enviados: enviadosCount };
        } catch (erro) {
            console.error('Erro na sincronização de registros:', erro);
            return { sucesso: false, erro: erro.message };
        }
    },

    sincronizarTurmas: async () => {
        try {
            const turmas = await api.obter('/turmas');
            if (Array.isArray(turmas)) {
                await bancoLocal.salvarTurmas(turmas, 1);
                console.log('Turmas sincronizadas:', turmas.length);
                return { sucesso: true, quantidade: turmas.length };
            }
        } catch (erro) {
            console.error('Erro na sincronização de turmas:', erro);
            return { sucesso: false, erro: erro.message };
        }
    },

    sincronizarTudo: async () => {
        if (!navigator.onLine) {
            console.log('Sem conexão. Sincronização adiada.');
            return { sucesso: false, erro: 'Sem conexão com a internet' };
        }

        console.log('Iniciando Smart Sync...');

        // 1. Processar Pendências Críticas (Deletes)
        await servicoSincronizacao.processarPendencias();

        // 2. Executar Syncs em Paralelo com Tolerância a Falhas
        const resultados = await Promise.allSettled([
            servicoSincronizacao.sincronizarAlunos(),
            servicoSincronizacao.sincronizarTurmas(),
            servicoSincronizacao.sincronizarRegistros()
        ]);

        // Logar resultados
        resultados.forEach((res, index) => {
            const labels = ['Alunos', 'Turmas', 'Registros'];
            if (res.status === 'rejected') {
                console.error(`Falha em ${labels[index]}:`, res.reason);
            }
        });

        return {
            alunos: resultados[0].status === 'fulfilled' ? resultados[0].value : { sucesso: false },
            turmas: resultados[1].status === 'fulfilled' ? resultados[1].value : { sucesso: false },
            registros: resultados[2].status === 'fulfilled' ? resultados[2].value : { sucesso: false }
        };
    },

    iniciarOuvintes: () => {
        window.addEventListener('online', () => {
            console.log('Online detectado. Iniciando sincronização...');
            servicoSincronizacao.sincronizarTudo();
        });
    }
};
