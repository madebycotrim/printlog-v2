import { bancoLocal } from './bancoLocal';
import { obterDataCorrigida } from '../utilitarios/relogio';
import { calcularMetricasFrequencia } from '../utilitarios/algoritmoEvasao';

/**
 * Serviço de Estatísticas Executivas
 * Fornece KPIs e dados agregados para o dashboard da direção
 */

/**
 * Calcular estatísticas gerais do sistema
 */
export const obterEstatisticasGerais = async () => {
    const banco = await bancoLocal.iniciarBanco();

    const todosAlunos = await banco.getAll('alunos');
    const todasTurmas = await banco.getAll('turmas');
    const todosRegistros = await banco.getAll('registros_acesso');

    const alunosAtivos = todosAlunos.filter(a => a.status === 'ATIVO' && !a.anonimizado);

    return {
        totalAlunos: todosAlunos.length,
        alunosAtivos: alunosAtivos.length,
        totalTurmas: todasTurmas.length,
        totalRegistros: todosRegistros.length
    };
};

/**
 * Calcular presença do dia atual
 */
export const obterPresencaHoje = async () => {
    const banco = await bancoLocal.iniciarBanco();

    const todosAlunos = await banco.getAll('alunos');
    const todosRegistros = await banco.getAll('registros_acesso');

    const alunosAtivos = todosAlunos.filter(a => a.status === 'ATIVO' && !a.anonimizado);

    // Hoje (início do dia)
    const hoje = obterDataCorrigida();
    hoje.setHours(0, 0, 0, 0);

    // Filtrar registros de hoje
    const registrosHoje = todosRegistros.filter(r => {
        const dataRegistro = new Date(r.timestamp);
        return dataRegistro >= hoje;
    });

    // Agrupar por aluno para encontrar último movimento
    const ultimosMovimentos = {};
    registrosHoje.forEach(registro => {
        const matricula = registro.aluno_matricula;
        if (!ultimosMovimentos[matricula] ||
            new Date(registro.timestamp) > new Date(ultimosMovimentos[matricula].timestamp)) {
            ultimosMovimentos[matricula] = registro;
        }
    });

    // Contar presentes (última movimentação foi ENTRADA)
    const alunosPresentes = Object.values(ultimosMovimentos)
        .filter(r => r.tipo_movimentacao === 'ENTRADA')
        .map(r => r.aluno_matricula);

    const totalPresentes = alunosPresentes.length;
    const totalAtivos = alunosAtivos.length;
    const percentualPresenca = totalAtivos > 0
        ? ((totalPresentes / totalAtivos) * 100).toFixed(1)
        : 0;

    return {
        totalPresentes,
        totalAtivos,
        percentualPresenca: parseFloat(percentualPresenca),
        alunosPresentes
    };
};

/**
 * Calcular taxa de evasão e identificar alunos em risco
 */
export const obterRiscoEvasao = async () => {
    const banco = await bancoLocal.iniciarBanco();

    const todosAlunos = await banco.getAll('alunos');
    const todosRegistros = await banco.getAll('registros_acesso');

    const alunosAtivos = todosAlunos.filter(a => a.status === 'ATIVO' && !a.anonimizado);

    //Calcular métricas para cada aluno
    const alunosComRisco = [];

    for (const aluno of alunosAtivos) {
        const metricas = calcularMetricasFrequencia(aluno.matricula, todosRegistros, aluno);

        // Considerar em risco se presença < 75% nos últimos 7 dias
        const emRisco = metricas.presenca7dias < 75 ||
            (metricas.tendencia === 'DECLINANDO' && metricas.presenca30dias - metricas.presenca7dias >= 20);

        if (emRisco) {
            // Calcular score de risco (0-1)
            let score = 0;
            if (metricas.diasPresentes7 === 0) score = 1.0;
            else if (metricas.presenca7dias < 50) score = 0.8;
            else if (metricas.presenca7dias < 75) score = 0.5;
            if (metricas.tendencia === 'DECLINANDO') score += 0.1;
            score = Math.min(1.0, score);

            alunosComRisco.push({
                ...aluno,
                riscoEvasao: {
                    score: parseFloat(score.toFixed(2)),
                    nivel: score >= 0.7 ? 'CRÍTICO' : score >= 0.5 ? 'ALTO' : 'MÉDIO',
                    metricas
                }
            });
        }
    }

    // Ordenar por score de risco (maior primeiro)
    alunosComRisco.sort((a, b) => b.riscoEvasao.score - a.riscoEvasao.score);

    const taxaRisco = alunosAtivos.length > 0
        ? ((alunosComRisco.length / alunosAtivos.length) * 100).toFixed(1)
        : 0;

    return {
        totalEmRisco: alunosComRisco.length,
        taxaRisco: parseFloat(taxaRisco),
        alunosEmRisco: alunosComRisco.slice(0, 10) // Top 10
    };
};

/**
 * Obter tendência de presença dos últimos N dias
 */
export const obterTendenciaPresenca = async (dias = 30) => {
    const banco = await bancoLocal.iniciarBanco();

    const todosAlunos = await banco.getAll('alunos');
    const todosRegistros = await banco.getAll('registros_acesso');

    const alunosAtivos = todosAlunos.filter(a => a.status === 'ATIVO' && !a.anonimizado);
    const totalAtivos = alunosAtivos.length;

    // Calcular data inicial
    const hoje = obterDataCorrigida();
    const dataInicial = new Date(hoje);
    dataInicial.setDate(dataInicial.getDate() - dias);
    dataInicial.setHours(0, 0, 0, 0);

    // Agrupar por dia
    const presencaPorDia = [];

    for (let i = 0; i < dias; i++) {
        const dia = new Date(dataInicial);
        dia.setDate(dia.getDate() + i);

        const diaFim = new Date(dia);
        diaFim.setHours(23, 59, 59, 999);

        // Registros deste dia
        const registrosDia = todosRegistros.filter(r => {
            const dataRegistro = new Date(r.timestamp);
            return dataRegistro >= dia && dataRegistro <= diaFim;
        });

        // Último movimento de cada aluno
        const ultimosMovimentos = {};
        registrosDia.forEach(registro => {
            const matricula = registro.aluno_matricula;
            if (!ultimosMovimentos[matricula] ||
                new Date(registro.timestamp) > new Date(ultimosMovimentos[matricula].timestamp)) {
                ultimosMovimentos[matricula] = registro;
            }
        });

        const presentes = Object.values(ultimosMovimentos)
            .filter(r => r.tipo_movimentacao === 'ENTRADA').length;

        const percentual = totalAtivos > 0 ? (presentes / totalAtivos) * 100 : 0;

        presencaPorDia.push({
            data: dia.toISOString().split('T')[0],
            presentes,
            percentual: parseFloat(percentual.toFixed(1))
        });
    }

    return presencaPorDia;
};

/**
 * Obter presença por turno
 */
export const obterPresencaPorTurno = async () => {
    const banco = await bancoLocal.iniciarBanco();

    const todosAlunos = await banco.getAll('alunos');
    const todasTurmas = await banco.getAll('turmas');
    const todosRegistros = await banco.getAll('registros_acesso');

    // Criar mapa de turmas
    const mapaTurmas = new Map(todasTurmas.map(t => [t.id, t]));

    // Hoje
    const hoje = obterDataCorrigida();
    hoje.setHours(0, 0, 0, 0);

    const registrosHoje = todosRegistros.filter(r => new Date(r.timestamp) >= hoje);

    // Último movimento por aluno
    const ultimosMovimentos = {};
    registrosHoje.forEach(registro => {
        const matricula = registro.aluno_matricula;
        if (!ultimosMovimentos[matricula] ||
            new Date(registro.timestamp) > new Date(ultimosMovimentos[matricula].timestamp)) {
            ultimosMovimentos[matricula] = registro;
        }
    });

    // Presentes
    const presentes = Object.values(ultimosMovimentos)
        .filter(r => r.tipo_movimentacao === 'ENTRADA')
        .map(r => r.aluno_matricula);

    // Agrupar por turno
    const presencaPorTurno = {
        'Matutino': 0,
        'Vespertino': 0,
        'Noturno': 0,
        'Integral': 0,
        'Outros': 0
    };

    const totalPorTurno = {
        'Matutino': 0,
        'Vespertino': 0,
        'Noturno': 0,
        'Integral': 0,
        'Outros': 0
    };

    todosAlunos.forEach(aluno => {
        if (aluno.status !== 'ATIVO' || aluno.anonimizado) return;

        const turma = mapaTurmas.get(aluno.turma_id);
        const turno = turma?.turno || 'Outros';

        const turnoKey = turno.includes('Matutino') ? 'Matutino' :
            turno.includes('Vespertino') ? 'Vespertino' :
                turno.includes('Noturno') ? 'Noturno' :
                    turno.includes('Integral') ? 'Integral' : 'Outros';

        totalPorTurno[turnoKey]++;

        if (presentes.includes(aluno.matricula)) {
            presencaPorTurno[turnoKey]++;
        }
    });

    return Object.keys(presencaPorTurno).map(turno => ({
        turno,
        presentes: presencaPorTurno[turno],
        total: totalPorTurno[turno],
        percentual: totalPorTurno[turno] > 0
            ? parseFloat(((presencaPorTurno[turno] / totalPorTurno[turno]) * 100).toFixed(1))
            : 0
    }));
};

/**
 * Obter top turmas por presença
 */
export const obterTopTurmasPorPresenca = async (limite = 10) => {
    const banco = await bancoLocal.iniciarBanco();

    const todosAlunos = await banco.getAll('alunos');
    const todasTurmas = await banco.getAll('turmas');
    const todosRegistros = await banco.getAll('registros_acesso');

    const hoje = obterDataCorrigida();
    hoje.setHours(0, 0, 0, 0);

    const registrosHoje = todosRegistros.filter(r => new Date(r.timestamp) >= hoje);

    // Último movimento por aluno
    const ultimosMovimentos = {};
    registrosHoje.forEach(registro => {
        const matricula = registro.aluno_matricula;
        if (!ultimosMovimentos[matricula] ||
            new Date(registro.timestamp) > new Date(ultimosMovimentos[matricula].timestamp)) {
            ultimosMovimentos[matricula] = registro;
        }
    });

    const presentes = Object.values(ultimosMovimentos)
        .filter(r => r.tipo_movimentacao === 'ENTRADA')
        .map(r => r.aluno_matricula);

    // Agrupar por turma
    const estatisticasPorTurma = {};

    todasTurmas.forEach(turma => {
        estatisticasPorTurma[turma.id] = {
            turma,
            total: 0,
            presentes: 0,
            nomeExibicao: `${turma.serie} ${turma.letra} - ${turma.turno}`
        };
    });

    todosAlunos.forEach(aluno => {
        if (aluno.status !== 'ATIVO' || aluno.anonimizado) return;

        if (estatisticasPorTurma[aluno.turma_id]) {
            estatisticasPorTurma[aluno.turma_id].total++;

            if (presentes.includes(aluno.matricula)) {
                estatisticasPorTurma[aluno.turma_id].presentes++;
            }
        }
    });

    // Calcular percentual e ordenar
    const ranking = Object.values(estatisticasPorTurma)
        .map(stat => ({
            ...stat,
            percentual: stat.total > 0
                ? parseFloat(((stat.presentes / stat.total) * 100).toFixed(1))
                : 0
        }))
        .filter(stat => stat.total > 0)
        .sort((a, b) => b.percentual - a.percentual)
        .slice(0, limite);

    return ranking;
};

/**
 * Obter alertas pendentes
 */
export const obterAlertas = async () => {
    const riscoEvasao = await obterRiscoEvasao();

    const alertas = [
        {
            tipo: 'EVASAO',
            quantidade: riscoEvasao.totalEmRisco,
            mensagem: `${riscoEvasao.totalEmRisco} aluno${riscoEvasao.totalEmRisco !== 1 ? 's' : ''} em risco de evasão`,
            severidade: riscoEvasao.totalEmRisco > 10 ? 'ALTA' : riscoEvasao.totalEmRisco > 5 ? 'MEDIA' : 'BAIXA'
        }
    ];

    return alertas;
};

/**
 * Obter dashboard completo
 */
export const obterDashboardExecutivo = async () => {
    const [
        estatisticasGerais,
        presencaHoje,
        riscoEvasao,
        tendenciaPresenca,
        presencaPorTurno,
        topTurmas,
        alertas
    ] = await Promise.all([
        obterEstatisticasGerais(),
        obterPresencaHoje(),
        obterRiscoEvasao(),
        obterTendenciaPresenca(30),
        obterPresencaPorTurno(),
        obterTopTurmasPorPresenca(10),
        obterAlertas()
    ]);

    return {
        estatisticasGerais,
        presencaHoje,
        riscoEvasao,
        tendenciaPresenca,
        presencaPorTurno,
        topTurmas,
        alertas,
        atualizadoEm: obterDataCorrigida().toISOString()
    };
};

export default {
    obterEstatisticasGerais,
    obterPresencaHoje,
    obterRiscoEvasao,
    obterTendenciaPresenca,
    obterPresencaPorTurno,
    obterTopTurmasPorPresenca,
    obterAlertas,
    obterDashboardExecutivo
};
