import { bancoLocal } from './bancoLocal';
import { obterDataCorrigida } from '../utilitarios/relogio';

/**
 * Serviço de Retenção de Dados LGPD
 * Gerencia políticas de retenção e identifica dados expirados
 */

/**
 * Criar ou atualizar política de retenção
 */
export const criarPoliticaRetencao = async ({
    entidadeTipo,
    periodoRetencaoDias,
    acaoExpiracao = 'ANONIMIZAR',
    descricao = null,
    criadaPor = null
}) => {
    const banco = await bancoLocal.iniciarBanco();

    const politica = {
        id: crypto.randomUUID(),
        entidade_tipo: entidadeTipo,
        periodo_retencao_dias: periodoRetencaoDias,
        acao_expiracao: acaoExpiracao,
        ativa: true,
        descricao,
        criada_em: obterDataCorrigida().toISOString(),
        atualizada_em: obterDataCorrigida().toISOString(),
        criada_por: criadaPor
    };

    await banco.put('politicas_retencao', politica);
    return politica;
};

/**
 * Obter política de retenção para um tipo de entidade
 */
export const obterPoliticaRetencao = async (entidadeTipo) => {
    const banco = await bancoLocal.iniciarBanco();

    const politicas = await banco.getAllFromIndex(
        'politicas_retencao',
        'entidade_tipo',
        entidadeTipo
    );

    // Retornar apenas políticas ativas
    const politicasAtivas = politicas.filter(p => p.ativa);
    return politicasAtivas.length > 0 ? politicasAtivas[0] : null;
};

/**
 * Calcular data de expiração baseada na política
 */
export const calcularDataExpiracao = (dataCadastro, periodoRetencaoDias) => {
    const data = new Date(dataCadastro);
    data.setDate(data.getDate() + periodoRetencaoDias);
    return data;
};

/**
 * Verificar se um registro está expirado
 */
export const verificarExpiracao = (dataCadastro, periodoRetencaoDias) => {
    const dataExpiracao = calcularDataExpiracao(dataCadastro, periodoRetencaoDias);
    const agora = obterDataCorrigida();
    return agora > dataExpiracao;
};

/**
 * Listar alunos com dados expirados
 */
export const listarAlunosExpirados = async () => {
    const banco = await bancoLocal.iniciarBanco();

    // Obter política de retenção para alunos
    const politica = await obterPoliticaRetencao('aluno');

    if (!politica) {
        console.warn('Nenhuma política de retenção definida para alunos');
        return [];
    }

    const todosAlunos = await banco.getAll('alunos');

    // Filtrar apenas alunos inativos e já anonimizados
    const alunosExpirados = todosAlunos.filter(aluno => {
        // Pular se já anonimizado
        if (aluno.anonimizado) return false;

        // Pular se estiver ativo
        if (aluno.status === 'ATIVO') return false;

        // Verificar data de cadastro ou inativação
        const dataReferencia = aluno.data_inativacao || aluno.data_cadastro;

        if (!dataReferencia) {
            // Se não tem data, considerar como não expirado
            return false;
        }

        return verificarExpiracao(dataReferencia, politica.periodo_retencao_dias);
    });

    return alunosExpirados.map(aluno => ({
        ...aluno,
        politica_aplicada: politica,
        data_expiracao: calcularDataExpiracao(
            aluno.data_inativacao || aluno.data_cadastro,
            politica.periodo_retencao_dias
        )
    }));
};

/**
 * Listar registros de acesso expirados
 */
export const listarAcessosExpirados = async () => {
    const banco = await bancoLocal.iniciarBanco();

    // Obter política de retenção para acessos
    const politica = await obterPoliticaRetencao('acesso');

    if (!politica) {
        console.warn('Nenhuma política de retenção definida para acessos');
        return [];
    }

    const todosAcessos = await banco.getAll('registros_acesso');

    const acessosExpirados = todosAcessos.filter(acesso => {
        return verificarExpiracao(acesso.timestamp, politica.periodo_retencao_dias);
    });

    return acessosExpirados.map(acesso => ({
        ...acesso,
        politica_aplicada: politica,
        data_expiracao: calcularDataExpiracao(
            acesso.timestamp,
            politica.periodo_retencao_dias
        )
    }));
};

/**
 * Obter estatísticas de retenção
 */
export const obterEstatisticasRetencao = async () => {
    const banco = await bancoLocal.iniciarBanco();

    const todosAlunos = await banco.getAll('alunos');
    const todosAcessos = await banco.getAll('registros_acesso');
    const politicas = await banco.getAll('politicas_retencao');

    const alunosExpirados = await listarAlunosExpirados();
    const acessosExpirados = await listarAcessosExpirados();

    return {
        politicasAtivas: politicas.filter(p => p.ativa).length,
        totalAlunos: todosAlunos.length,
        alunosExpirados: alunosExpirados.length,
        totalAcessos: todosAcessos.length,
        acessosExpirados: acessosExpirados.length,
        percentualAlunosExpirados: todosAlunos.length > 0
            ? ((alunosExpirados.length / todosAlunos.length) * 100).toFixed(1)
            : 0
    };
};

/**
 * Inicializar políticas de retenção padrão
 */
export const inicializarPoliticasPadrao = async (criadoPor = 'sistema') => {
    const banco = await bancoLocal.iniciarBanco();

    // Verificar se já existem políticas
    const politicasExistentes = await banco.getAll('politicas_retencao');
    if (politicasExistentes.length > 0) {
        console.log('Políticas de retenção já existem');
        return politicasExistentes;
    }

    // Criar políticas padrão conforme LGPD
    const politicas = [
        {
            entidadeTipo: 'aluno',
            periodoRetencaoDias: 1825, // 5 anos
            acaoExpiracao: 'ANONIMIZAR',
            descricao: 'Dados de alunos são retidos por 5 anos após inativação',
            criadaPor
        },
        {
            entidadeTipo: 'acesso',
            periodoRetencaoDias: 730, // 2 anos
            acaoExpiracao: 'DELETAR',
            descricao: 'Registros de acesso são retidos por 2 anos',
            criadaPor
        }
    ];

    const politicasCriadas = [];
    for (const politica of politicas) {
        const novaPolitica = await criarPoliticaRetencao(politica);
        politicasCriadas.push(novaPolitica);
    }

    return politicasCriadas;
};

/**
 * Calcular status de retenção de um aluno
 */
export const obterStatusRetencaoAluno = async (aluno) => {
    const politica = await obterPoliticaRetencao('aluno');

    if (!politica) {
        return {
            temPolitica: false,
            status: 'SEM_POLITICA'
        };
    }

    if (aluno.anonimizado) {
        return {
            temPolitica: true,
            status: 'ANONIMIZADO',
            politica
        };
    }

    if (aluno.status === 'ATIVO') {
        return {
            temPolitica: true,
            status: 'ATIVO',
            politica
        };
    }

    const dataReferencia = aluno.data_inativacao || aluno.data_cadastro;

    if (!dataReferencia) {
        return {
            temPolitica: true,
            status: 'SEM_DATA',
            politica
        };
    }

    const dataExpiracao = calcularDataExpiracao(dataReferencia, politica.periodo_retencao_dias);
    const agora = obterDataCorrigida();
    const expirado = agora > dataExpiracao;

    // Calcular dias restantes
    const diasRestantes = Math.ceil((dataExpiracao - agora) / (1000 * 60 * 60 * 24));

    return {
        temPolitica: true,
        status: expirado ? 'EXPIRADO' : 'ATIVO',
        dataReferencia,
        dataExpiracao,
        diasRestantes: expirado ? 0 : diasRestantes,
        politica
    };
};

export default {
    criarPoliticaRetencao,
    obterPoliticaRetencao,
    calcularDataExpiracao,
    verificarExpiracao,
    listarAlunosExpirados,
    listarAcessosExpirados,
    obterEstatisticasRetencao,
    inicializarPoliticasPadrao,
    obterStatusRetencaoAluno
};
