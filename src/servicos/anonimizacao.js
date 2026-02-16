import { bancoLocal } from './bancoLocal';
import { obterDataCorrigida } from '../utilitarios/relogio';
import {
    anonimizarAluno,
    criarRegistroAnonimizacao,
    validarAnonimizacao,
    preservarDadosEstatisticos
} from '../utilitarios/anonimizador';
import { registrarAuditoria, ACOES_AUDITORIA } from './auditoria';

/**
 * Serviço de Anonimização de Dados LGPD
 */

/**
 * Anonimizar dados de um aluno
 */
export const anonimizarDadosAluno = async (matricula, executadoPor, motivo = null) => {
    const banco = await bancoLocal.iniciarBanco();

    // Buscar aluno
    const aluno = await banco.get('alunos', matricula);

    // Validar se pode anonimizar
    const validacao = validarAnonimizacao(aluno);
    if (!validacao.valido) {
        throw new Error(`Não é possível anonimizar: ${validacao.erros.join(', ')}`);
    }

    // Preservar dados antes da anonimização
    const dadosOriginais = { ...aluno };
    const dadosPreservados = preservarDadosEstatisticos(aluno);

    // Anonimizar
    const alunoAnonimizado = await anonimizarAluno(aluno);

    // Salvar aluno anonimizado
    await banco.put('alunos', alunoAnonimizado);

    // Criar registro de anonimização
    const registroAnonimizacao = await criarRegistroAnonimizacao({
        entidadeTipo: 'aluno',
        entidadeIdOriginal: matricula,
        motivo: motivo || 'Anonimização solicitada pelo administrador',
        executadoPor,
        dadosPreservados
    });

    registroAnonimizacao.sincronizado = 0; // Flag para sincronização

    await banco.put('registros_anonimizacao', registroAnonimizacao);

    // Registrar em auditoria
    try {
        await registrarAuditoria({
            usuarioEmail: executadoPor,
            acao: 'ANONIMIZAR_ALUNO',
            entidadeTipo: 'aluno',
            entidadeId: matricula,
            dadosAnteriores: dadosOriginais,
            dadosNovos: alunoAnonimizado
        });
    } catch (error) {
        console.warn('Falha ao registrar auditoria:', error);
    }

    return {
        sucesso: true,
        alunoAnonimizado,
        registroAnonimizacao
    };
};

/**
 * Anonimizar múltiplos alunos em lote
 */
export const anonimizarLote = async (matriculas, executadoPor, motivo = null) => {
    const resultados = {
        sucesso: [],
        falhas: []
    };

    for (const matricula of matriculas) {
        try {
            const resultado = await anonimizarDadosAluno(matricula, executadoPor, motivo);
            resultados.sucesso.push({ matricula, ...resultado });
        } catch (error) {
            resultados.falhas.push({
                matricula,
                erro: error.message
            });
        }
    }

    return resultados;
};

/**
 * Obter histórico de anonimizações
 */
export const obterHistoricoAnonimizacoes = async (limite = 50) => {
    const banco = await bancoLocal.iniciarBanco();

    const registros = await banco.getAll('registros_anonimizacao');

    // Ordenar por data (mais recente primeiro)
    registros.sort((a, b) =>
        new Date(b.data_anonimizacao) - new Date(a.data_anonimizacao)
    );

    return registros.slice(0, limite);
};

/**
 * Obter estatísticas de anonimização
 */
export const obterEstatisticasAnonimizacao = async () => {
    const banco = await bancoLocal.iniciarBanco();

    const todosAlunos = await banco.getAll('alunos');
    const registrosAnonimizacao = await banco.getAll('registros_anonimizacao');

    const alunosAnonimizados = todosAlunos.filter(a => a.anonimizado === true);

    // Estatísticas por período
    const hoje = obterDataCorrigida();
    const ultimos30Dias = new Date(hoje);
    ultimos30Dias.setDate(ultimos30Dias.getDate() - 30);

    const anonimizacoesRecentes = registrosAnonimizacao.filter(r =>
        new Date(r.data_anonimizacao) >= ultimos30Dias
    );

    return {
        totalAlunos: todosAlunos.length,
        alunosAnonimizados: alunosAnonimizados.length,
        totalAnonimizacoes: registrosAnonimizacao.length,
        anonimizacoesUltimos30Dias: anonimizacoesRecentes.length,
        percentualAnonimizado: todosAlunos.length > 0
            ? ((alunosAnonimizados.length / todosAlunos.length) * 100).toFixed(1)
            : 0
    };
};

/**
 * Verificar alunos elegíveis para anonimização
 * (Inativos há mais de X dias e sem consentimento válido)
 */
export const verificarElegiveisAnonimizacao = async (diasInatividade = 365) => {
    const banco = await bancoLocal.iniciarBanco();

    const todosAlunos = await banco.getAll('alunos');
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - diasInatividade);

    const elegiveis = todosAlunos.filter(aluno => {
        // Já anonimizado
        if (aluno.anonimizado) return false;

        // Status ativo
        if (aluno.status === 'ATIVO') return false;

        // Verificar data de inativação
        if (aluno.data_inativacao) {
            const dataInativacao = new Date(aluno.data_inativacao);
            return dataInativacao < dataLimite;
        }

        return false;
    });

    return elegiveis;
};

export default {
    anonimizarDadosAluno,
    anonimizarLote,
    obterHistoricoAnonimizacoes,
    obterEstatisticasAnonimizacao,
    verificarElegiveisAnonimizacao
};
