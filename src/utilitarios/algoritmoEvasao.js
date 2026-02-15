import { format, subDays, startOfDay, parseISO } from 'date-fns';

/**
 * Calcula métricas de frequência e atrasos para um aluno específico
 * @param {string} alunoMatricula - Matrícula do aluno
 * @param {Array} registros - Todos os registros de acesso
 * @param {Object} aluno - Dados do aluno (para extrair turno)
 * @returns {Object} Métricas calculadas
 */
export function calcularMetricasFrequencia(alunoMatricula, registros, aluno) {
    const hoje = new Date();
    const seteDiasAtras = subDays(hoje, 7);
    const trintaDiasAtras = subDays(hoje, 30);

    // Filtrar registros do aluno
    const registrosAluno = registros.filter(r => r.aluno_matricula === alunoMatricula);

    // Separar por período
    const registros7dias = registrosAluno.filter(r =>
        new Date(r.timestamp) >= seteDiasAtras
    );
    const registros30dias = registrosAluno.filter(r =>
        new Date(r.timestamp) >= trintaDiasAtras
    );

    // Determinar horário oficial baseado no turno
    const turno = aluno.turma_id ? extrairTurno(aluno.turma_id) : null;
    const horarioOficial = obterHorarioOficial(turno);

    // Calcular dias únicos com presença
    const diasPresentes7 = contarDiasUnicos(registros7dias.filter(r => r.tipo_movimentacao === 'ENTRADA'));
    const diasPresentes30 = contarDiasUnicos(registros30dias.filter(r => r.tipo_movimentacao === 'ENTRADA'));

    // Dias úteis no período
    const diasUteis7 = contarDiasUteis(seteDiasAtras, hoje);
    const diasUteis30 = contarDiasUteis(trintaDiasAtras, hoje);

    // Percentual de presença
    const presenca7dias = diasUteis7 > 0 ? (diasPresentes7 / diasUteis7) * 100 : 100;
    const presenca30dias = diasUteis30 > 0 ? (diasPresentes30 / diasUteis30) * 100 : 100;

    // Calcular atrasos
    const entradas7dias = registros7dias.filter(r => r.tipo_movimentacao === 'ENTRADA');
    const entradas30dias = registros30dias.filter(r => r.tipo_movimentacao === 'ENTRADA');

    const atrasos7dias = entradas7dias.filter(r => estaAtrasado(r, horarioOficial));
    const atrasos30dias = entradas30dias.filter(r => estaAtrasado(r, horarioOficial));

    const percentualAtrasos7 = entradas7dias.length > 0
        ? (atrasos7dias.length / entradas7dias.length) * 100
        : 0;
    const percentualAtrasos30 = entradas30dias.length > 0
        ? (atrasos30dias.length / entradas30dias.length) * 100
        : 0;

    // Detectar padrão de faltas (ex: sempre às sextas)
    const padraoFaltas = detectarPadraoFaltas(registros30dias);

    return {
        presenca7dias: Math.round(presenca7dias),
        presenca30dias: Math.round(presenca30dias),
        diasPresentes7,
        diasPresentes30,
        diasUteis7,
        diasUteis30,
        percentualAtrasos7: Math.round(percentualAtrasos7),
        percentualAtrasos30: Math.round(percentualAtrasos30),
        totalAtrasos7: atrasos7dias.length,
        totalAtrasos30: atrasos30dias.length,
        padraoFaltas,
        tendencia: presenca7dias < presenca30dias ? 'DECLINANDO' : 'ESTAVEL',
        aumentoAtrasos: percentualAtrasos7 > percentualAtrasos30 * 1.3 // 30% de aumento
    };
}

/**
 * Detecta alunos em risco de evasão com base em métricas
 * @param {Array} todosRegistros - Todos os registros de acesso
 * @param {Array} alunos - Lista de todos os alunos
 * @returns {Array} Lista de alunos em risco ordenada por prioridade
 */
export function detectarAlunosEmRisco(todosRegistros, alunos) {
    const alunosComRisco = [];

    alunos.forEach(aluno => {
        const metricas = calcularMetricasFrequencia(aluno.matricula, todosRegistros, aluno);

        let scoreRisco = 0;
        const motivos = [];

        // Critério 1: Presença baixa (< 75% nos últimos 7 dias)
        if (metricas.presenca7dias < 75) {
            scoreRisco += 3;
            motivos.push(`Presença de apenas ${metricas.presenca7dias}% na última semana`);
        }

        // Critério 2: Tendência de declínio
        if (metricas.tendencia === 'DECLINANDO' && metricas.presenca30dias - metricas.presenca7dias >= 20) {
            scoreRisco += 2;
            motivos.push('Queda acentuada na frequência');
        }

        // Critério 3: Aumento significativo de atrasos
        if (metricas.aumentoAtrasos && metricas.totalAtrasos7 >= 2) {
            scoreRisco += 2;
            motivos.push(`Aumento de ${Math.round((metricas.percentualAtrasos7 / metricas.percentualAtrasos30 - 1) * 100)}% nos atrasos`);
        }

        // Critério 4: Padrão de faltas específico
        if (metricas.padraoFaltas.detectado) {
            scoreRisco += 1;
            motivos.push(`Faltas recorrentes: ${metricas.padraoFaltas.descricao}`);
        }

        // Critério 5: Ausência completa recente
        if (metricas.diasPresentes7 === 0) {
            scoreRisco += 4;
            motivos.push('⚠️ SEM REGISTROS nos últimos 7 dias');
        }

        // Considerar em risco se score >= 3
        if (scoreRisco >= 3) {
            alunosComRisco.push({
                aluno,
                metricas,
                scoreRisco,
                motivos,
                prioridade: scoreRisco >= 5 ? 'ALTA' : scoreRisco >= 3 ? 'MÉDIA' : 'BAIXA'
            });
        }
    });

    // Ordenar por score (maior risco primeiro)
    return alunosComRisco.sort((a, b) => b.scoreRisco - a.scoreRisco);
}

// --- Funções Auxiliares ---

function extrairTurno(turmaId) {
    if (!turmaId) return null;
    const partes = turmaId.split(' - ');
    return partes.length > 1 ? partes[1] : null;
}

function obterHorarioOficial(turno) {
    const horarios = {
        'Matutino': '07:30',
        'Vespertino': '13:30',
        'Noturno': '19:00'
    };
    return horarios[turno] || '07:30';
}

function estaAtrasado(registro, horarioOficial) {
    const horaEntrada = format(parseISO(registro.timestamp), 'HH:mm');
    return horaEntrada > horarioOficial;
}

function contarDiasUnicos(registros) {
    const diasUnicos = new Set();
    registros.forEach(r => {
        const dia = format(startOfDay(parseISO(r.timestamp)), 'yyyy-MM-dd');
        diasUnicos.add(dia);
    });
    return diasUnicos.size;
}

function contarDiasUteis(inicio, fim) {
    let contador = 0;
    let data = new Date(inicio);

    while (data <= fim) {
        const diaSemana = data.getDay();
        // Segunda (1) a Sexta (5)
        if (diaSemana !== 0 && diaSemana !== 6) {
            contador++;
        }
        data = subDays(data, -1); // Avançar 1 dia
    }

    return contador;
}

function detectarPadraoFaltas(registros30dias) {
    // Detectar se há um dia da semana sem presenças
    const presencasPorDia = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const totalPorDia = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    const entradas = registros30dias.filter(r => r.tipo_movimentacao === 'ENTRADA');

    // Contar presenças por dia da semana
    entradas.forEach(r => {
        const data = parseISO(r.timestamp);
        const diaSemana = data.getDay();
        presencasPorDia[diaSemana]++;
    });

    // Contar dias úteis por dia da semana nos últimos 30 dias
    const hoje = new Date();
    const trintaDiasAtras = subDays(hoje, 30);
    let data = new Date(trintaDiasAtras);

    while (data <= hoje) {
        const diaSemana = data.getDay();
        if (diaSemana !== 0 && diaSemana !== 6) {
            totalPorDia[diaSemana]++;
        }
        data = subDays(data, -1);
    }

    // Detectar dia com < 50% de presença
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    for (let dia = 1; dia <= 5; dia++) {
        if (totalPorDia[dia] > 0) {
            const percentual = (presencasPorDia[dia] / totalPorDia[dia]) * 100;
            if (percentual < 50) {
                return {
                    detectado: true,
                    descricao: `Baixa frequência às ${diasSemana[dia]}s (${Math.round(percentual)}%)`
                };
            }
        }
    }

    return { detectado: false, descricao: null };
}
