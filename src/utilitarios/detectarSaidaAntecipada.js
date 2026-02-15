import { bancoLocal } from '../servicos/bancoLocal';
import { format, parse } from 'date-fns';

/**
 * Detecta saídas antecipadas baseadas nos horários configurados
 */

/**
 * Extrai o turno do ID da turma (ex: "3ª A - Matutino" -> "Matutino")
 */
function extrairTurno(turmaId) {
    if (!turmaId) return null;
    const partes = turmaId.split(' - ');
    return partes.length > 1 ? partes[1] : null;
}

/**
 * Obtém o horário oficial de saída para um turno
 */
async function obterHorarioSaida(turno) {
    const banco = await bancoLocal.iniciarBanco();

    const chaveConfig = {
        'Matutino': 'horario_saida_matutino',
        'Vespertino': 'horario_saida_vespertino',
        'Noturno': 'horario_saida_noturno'
    };

    const chave = chaveConfig[turno];
    if (!chave) return '12:00'; // Default

    try {
        const config = await banco.get('configuracoes_alertas', chave);
        return config ? config.valor : '12:00';
    } catch {
        return '12:00';
    }
}

/**
 * Obtém a tolerância em minutos
 */
async function obterTolerancia() {
    const banco = await bancoLocal.iniciarBanco();

    try {
        const config = await banco.get('configuracoes_alertas', 'minutos_tolerancia');
        return config ? parseInt(config.valor) : 15;
    } catch {
        return 15;
    }
}

/**
 * Verifica se os alertas estão habilitados
 */
async function alertasHabilitados() {
    const banco = await bancoLocal.iniciarBanco();

    try {
        const config = await banco.get('configuracoes_alertas', 'alertas_habilitados');
        return config ? config.valor === 'true' : true;
    } catch {
        return true;
    }
}

/**
 * Detecta se uma saída é antecipada
 * @param {Object} registroSaida - Registro de saída
 * @param {Object} aluno - Dados do aluno
 * @returns {Object|null} - Dados da saída antecipada ou null
 */
export async function detectarSaidaAntecipada(registroSaida, aluno) {
    if (!aluno || !aluno.turma_id) return null;

    const habilitado = await alertasHabilitados();
    if (!habilitado) return null;

    const turno = extrairTurno(aluno.turma_id);
    if (!turno) return null;

    const horarioOficial = await obterHorarioSaida(turno);
    const tolerancia = await obterTolerancia();

    // Extrair hora da saída
    const timestampSaida = new Date(registroSaida.timestamp);
    const horaSaida = format(timestampSaida, 'HH:mm');

    // Calcular hora oficial com tolerância
    const [horaOf, minOf] = horarioOficial.split(':').map(Number);
    const minutosOficiais = horaOf * 60 + minOf;
    const minutosComTolerancia = minutosOficiais - tolerancia;

    const [horaSai, minSai] = horaSaida.split(':').map(Number);
    const minutosSaida = horaSai * 60 + minSai;

    // Se saiu antes do horário com tolerância, é antecipada
    if (minutosSaida < minutosComTolerancia) {
        const antecipacao = minutosComTolerancia - minutosSaida;

        return {
            aluno_matricula: aluno.matricula,
            registro_saida_id: registroSaida.id,
            data_saida: format(timestampSaida, 'yyyy-MM-dd'),
            hora_saida: horaSaida,
            hora_esperada: horarioOficial,
            minutos_antecipacao: antecipacao,
            turno: turno,
            aluno: aluno
        };
    }

    return null;
}

/**
 * Processa todas as saídas do dia e detecta antecipadas
 */
export async function processarSaidasDoDia() {
    const banco = await bancoLocal.iniciarBanco();

    const hoje = format(new Date(), 'yyyy-MM-dd');
    const registros = await banco.getAll('registros_acesso');
    const alunos = await banco.getAll('alunos');

    const saidasHoje = registros.filter(r =>
        r.tipo_movimentacao === 'SAIDA' &&
        r.timestamp.startsWith(hoje)
    );

    const saidasAntecipadas = [];

    for (const saida of saidasHoje) {
        const aluno = alunos.find(a => a.matricula === saida.aluno_matricula);
        if (!aluno) continue;

        const antecipada = await detectarSaidaAntecipada(saida, aluno);
        if (antecipada) {
            // Verificar se já foi registrada
            const jaRegistrada = await banco.get('saidas_antecipadas', antecipada.registro_saida_id);
            if (!jaRegistrada) {
                saidasAntecipadas.push(antecipada);
            }
        }
    }

    return saidasAntecipadas;
}

/**
 * Lista saídas antecipadas pendentes de autorização
 */
export async function listarPendentes() {
    const banco = await bancoLocal.iniciarBanco();

    let saidas = await banco.getAll('saidas_antecipadas');
    saidas = saidas.filter(s => !s.autorizada);

    // Enriquecer com dados do aluno
    const alunos = await banco.getAll('alunos');
    return saidas.map(s => {
        const aluno = alunos.find(a => a.matricula === s.aluno_matricula);
        return { ...s, aluno };
    });
}

/**
 * Autoriza uma saída antecipada
 */
export async function autorizarSaida(id, dadosAutorizacao, usuarioEmail) {
    const banco = await bancoLocal.iniciarBanco();

    const saida = await banco.get('saidas_antecipadas', id);
    if (!saida) {
        throw new Error('Saída antecipada não encontrada');
    }

    saida.autorizada = true;
    saida.autorizada_por = usuarioEmail;
    saida.autorizada_em = new Date().toISOString();
    saida.motivo = dadosAutorizacao.motivo || saida.motivo;
    saida.responsavel_retirada = dadosAutorizacao.responsavel_retirada || saida.responsavel_retirada;
    saida.contato_responsavel = dadosAutorizacao.contato_responsavel || saida.contato_responsavel;
    saida.observacoes = dadosAutorizacao.observacoes || saida.observacoes;

    await banco.put('saidas_antecipadas', saida);

    return saida;
}

/**
 * Registra uma nova saída antecipada
 */
export async function registrarSaidaAntecipada(dados) {
    const banco = await bancoLocal.iniciarBanco();

    const saida = {
        id: dados.registro_saida_id || crypto.randomUUID(),
        aluno_matricula: dados.aluno_matricula,
        registro_saida_id: dados.registro_saida_id,
        data_saida: dados.data_saida,
        hora_saida: dados.hora_saida,
        hora_esperada: dados.hora_esperada,
        minutos_antecipacao: dados.minutos_antecipacao,
        motivo: dados.motivo || null,
        responsavel_retirada: dados.responsavel_retirada || null,
        contato_responsavel: dados.contato_responsavel || null,
        autorizada: false,
        autorizada_por: null,
        autorizada_em: null,
        observacoes: null,
        criada_em: new Date().toISOString()
    };

    await banco.add('saidas_antecipadas', saida);

    return saida;
}
