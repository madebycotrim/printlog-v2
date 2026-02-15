/**
 * Utilitários para Anonimização de Dados (LGPD Art. 12º)
 */

/**
 * Gerar hash criptográfico de um identificador
 */
export const gerarHash = async (texto) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

/**
 * Gerar ID anônimo baseado em hash
 */
export const gerarIdAnonimo = async (identificadorOriginal) => {
    const hash = await gerarHash(identificadorOriginal);
    return `ANON-${hash.substring(0, 8).toUpperCase()}`;
};

/**
 * Anonimizar nome completo
 */
export const anonimizarNome = async (nomeOriginal, matricula) => {
    const idAnonimo = await gerarIdAnonimo(matricula);
    return `ANONIMIZADO ${idAnonimo}`;
};

/**
 * Criar registro de dados preservados (metadados estatísticos)
 */
export const preservarDadosEstatisticos = (aluno) => {
    // Preservar apenas dados não sensíveis para análises estatísticas
    return {
        turma_id: aluno.turma_id || null,
        status: aluno.status || 'INATIVO',
        ano_cadastro: aluno.data_cadastro
            ? new Date(aluno.data_cadastro).getFullYear()
            : null
    };
};

/**
 * Anonimizar dados de aluno
 */
export const anonimizarAluno = async (aluno) => {
    const nomeAnonimo = await anonimizarNome(aluno.nome_completo, aluno.matricula);
    const matriculaHash = await gerarHash(aluno.matricula);

    // Preservar dados estatísticos
    const dadosPreservados = preservarDadosEstatisticos(aluno);

    // Retornar aluno anonimizado
    return {
        matricula: aluno.matricula, // Mantém a chave primária
        nome_completo: nomeAnonimo,
        turma_id: dadosPreservados.turma_id,
        status: 'ANONIMIZADO',
        foto_url: null,
        consentimento_valido: false,
        data_inativacao: aluno.data_inativacao || new Date().toISOString(),
        anonimizado: true,
        data_anonimizacao: new Date().toISOString()
    };
};

/**
 * Criar registro de auditoria de anonimização
 */
export const criarRegistroAnonimizacao = async ({
    entidadeTipo,
    entidadeIdOriginal,
    motivo,
    executadoPor,
    dadosPreservados
}) => {
    const idHash = await gerarHash(entidadeIdOriginal);

    return {
        id: crypto.randomUUID(),
        entidade_tipo: entidadeTipo,
        entidade_id_original: entidadeIdOriginal,
        entidade_id_hash: idHash,
        data_anonimizacao: new Date().toISOString(),
        motivo: motivo || 'Anonimização solicitada',
        executado_por: executadoPor,
        dados_preservados: JSON.stringify(dadosPreservados),
        created_at: new Date().toISOString()
    };
};

/**
 * Validar se pode anonimizar
 */
export const validarAnonimizacao = (aluno) => {
    const erros = [];

    if (!aluno) {
        erros.push('Aluno não encontrado');
        return { valido: false, erros };
    }

    if (aluno.anonimizado) {
        erros.push('Este aluno já foi anonimizado');
    }

    if (aluno.status === 'ATIVO') {
        erros.push('Não é possível anonimizar alunos com status ATIVO');
    }

    return {
        valido: erros.length === 0,
        erros
    };
};

export default {
    gerarHash,
    gerarIdAnonimo,
    anonimizarNome,
    preservarDadosEstatisticos,
    anonimizarAluno,
    criarRegistroAnonimizacao,
    validarAnonimizacao
};
