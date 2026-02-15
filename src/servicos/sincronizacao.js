import { api } from './api';
import { bancoLocal } from './bancoLocal';

export const servicoSincronizacao = {
    sincronizarAlunos: async () => {
        try {
            const alunos = await api.obter('/alunos');
            await bancoLocal.salvarAlunos(alunos);
            console.log('Alunos sincronizados:', alunos.length);
            return { sucesso: true, quantidade: alunos.length };
        } catch (erro) {
            console.error('Erro na sincronização de alunos:', erro);
            return { sucesso: false, erro: erro.message };
        }
    },

    sincronizarRegistros: async () => {
        try {
            const pendentes = await bancoLocal.listarRegistrosPendentes();
            // Filtrar manualmente caso o índice não funcione como esperado com booleanos
            const naoSincronizados = pendentes.filter(r => !r.sincronizado);

            if (naoSincronizados.length === 0) return { sucesso: true, enviados: 0 };

            const resposta = await api.enviar('/acessos', naoSincronizados);

            // A resposta já é JSON
            const idsSincronizados = resposta
                .filter(r => r.status === 'sincronizado')
                .map(r => r.id);

            await bancoLocal.marcarComoSincronizado(idsSincronizados);

            console.log('Registros enviados:', idsSincronizados.length);
            return { sucesso: true, enviados: idsSincronizados.length };
        } catch (erro) {
            console.error('Erro na sincronização de registros:', erro);
            return { sucesso: false, erro: erro.message };
        }
    },

    sincronizarTurmas: async () => {
        try {
            const turmas = await api.obter('/turmas');
            if (Array.isArray(turmas)) {
                await bancoLocal.salvarTurmas(turmas);
                console.log('Turmas sincronizadas:', turmas.length);
                return { sucesso: true, quantidade: turmas.length };
            }
        } catch (erro) {
            console.error('Erro na sincronização de turmas:', erro);
            return { sucesso: false, erro: erro.message };
        }
    },

    sincronizarTudo: async () => {
        console.log('Iniciando sincronização universal...');
        const [alunos, turmas, registros] = await Promise.all([
            servicoSincronizacao.sincronizarAlunos(),
            servicoSincronizacao.sincronizarTurmas(),
            servicoSincronizacao.sincronizarRegistros()
        ]);

        return { alunos, turmas, registros };
    },

    iniciarOuvintes: () => {
        window.addEventListener('online', () => {
            console.log('Online detectado. Iniciando sincronização...');
            servicoSincronizacao.sincronizarRegistros();
            servicoSincronizacao.sincronizarAlunos();
            servicoSincronizacao.sincronizarTurmas();
        });
    }
};
