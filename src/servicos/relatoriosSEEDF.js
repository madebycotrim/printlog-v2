import { bancoLocal } from './bancoLocal';
import { justificativasService } from './justificativas';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Serviço para gerar relatórios oficiais no formato SEEDF
 */
export const relatoriosSEEDF = {
    /**
     * Gera relatório de frequência por turma
     */
    async gerarRelatorioFrequencia(turmaId, dataInicio, dataFim) {
        const banco = await bancoLocal.iniciarBanco();

        // Buscar alunos da turma
        const todosAlunos = await banco.getAll('alunos');
        const alunosDaTurma = todosAlunos.filter(a => a.turma_id === turmaId);

        // Buscar registros do período
        const todosRegistros = await banco.getAll('registros_acesso');
        const registrosPeriodo = todosRegistros.filter(r => {
            const dataReg = r.timestamp.split('T')[0];
            return dataReg >= dataInicio && dataReg <= dataFim;
        });

        // Calcular dias úteis
        const diasUteis = eachDayOfInterval({
            start: new Date(dataInicio),
            end: new Date(dataFim)
        }).filter(dia => !isWeekend(dia));

        // Calcular frequência por aluno
        const relatorio = alunosDaTurma.map(aluno => {
            const registrosAluno = registrosPeriodo.filter(r => r.aluno_matricula === aluno.matricula);
            const entradas = registrosAluno.filter(r => r.tipo_movimentacao === 'ENTRADA');

            // Contar dias únicos com presença
            const diasPresentes = new Set(
                entradas.map(e => e.timestamp.split('T')[0])
            ).size;

            const diasAusentes = diasUteis.length - diasPresentes;
            const percentualFrequencia = diasUteis.length > 0
                ? (diasPresentes / diasUteis.length) * 100
                : 100;

            return {
                matricula: aluno.matricula,
                nome: aluno.nome_completo,
                turma: aluno.turma_id,
                dias_letivos: diasUteis.length,
                dias_presentes: diasPresentes,
                dias_ausentes: diasAusentes,
                percentual_frequencia: Math.round(percentualFrequencia * 10) / 10,
                status_frequencia: percentualFrequencia >= 75 ? 'APROVADO' : 'REPROVADO'
            };
        });

        return {
            turma: turmaId,
            periodo: { inicio: dataInicio, fim: dataFim },
            dias_letivos: diasUteis.length,
            total_alunos: alunosDaTurma.length,
            gerado_em: new Date().toISOString(),
            alunos: relatorio.sort((a, b) => a.nome.localeCompare(b.nome))
        };
    },

    /**
     * Gera relatório de faltas com justificativas
     */
    async gerarRelatorioFaltas(turmaId, dataInicio, dataFim) {
        const banco = await bancoLocal.iniciarBanco();

        // Buscar alunos da turma
        const todosAlunos = await banco.getAll('alunos');
        const alunosDaTurma = turmaId === 'TODAS'
            ? todosAlunos
            : todosAlunos.filter(a => a.turma_id === turmaId);

        // Buscar registros e justificativas
        const todosRegistros = await banco.getAll('registros_acesso');
        const todasJustificativas = await banco.getAll('justificativas');

        const registrosPeriodo = todosRegistros.filter(r => {
            const dataReg = r.timestamp.split('T')[0];
            return dataReg >= dataInicio && dataReg <= dataFim;
        });

        // Calcular dias úteis
        const diasUteis = eachDayOfInterval({
            start: new Date(dataInicio),
            end: new Date(dataFim)
        }).filter(dia => !isWeekend(dia));

        // Gerar relatório por aluno
        const relatorio = alunosDaTurma.map(aluno => {
            const registrosAluno = registrosPeriodo.filter(r => r.aluno_matricula === aluno.matricula);
            const entradas = registrosAluno.filter(r => r.tipo_movimentacao === 'ENTRADA');

            const diasPresentes = new Set(
                entradas.map(e => e.timestamp.split('T')[0])
            ).size;

            const diasAusentes = diasUteis.length - diasPresentes;

            // Buscar justificativas do período
            const justificativasAluno = todasJustificativas.filter(j =>
                j.aluno_matricula === aluno.matricula &&
                j.status === 'APROVADA' &&
                j.data_inicio <= dataFim &&
                j.data_fim >= dataInicio
            );

            const diasJustificados = justificativasAluno.reduce((total, j) => {
                const diasJust = eachDayOfInterval({
                    start: new Date(j.data_inicio),
                    end: new Date(j.data_fim)
                }).filter(dia => !isWeekend(dia) &&
                    format(dia, 'yyyy-MM-dd') >= dataInicio &&
                    format(dia, 'yyyy-MM-dd') <= dataFim
                );
                return total + diasJust.length;
            }, 0);

            const diasFaltasInjustificadas = Math.max(0, diasAusentes - diasJustificados);

            return {
                matricula: aluno.matricula,
                nome: aluno.nome_completo,
                turma: aluno.turma_id,
                dias_letivos: diasUteis.length,
                dias_presentes: diasPresentes,
                total_faltas: diasAusentes,
                faltas_justificadas: diasJustificados,
                faltas_injustificadas: diasFaltasInjustificadas,
                justificativas: justificativasAluno.map(j => ({
                    tipo: j.tipo,
                    periodo: `${format(new Date(j.data_inicio), 'dd/MM/yyyy')} a ${format(new Date(j.data_fim), 'dd/MM/yyyy')}`,
                    aprovada_por: j.revisada_por
                }))
            };
        });

        return {
            turma: turmaId,
            periodo: { inicio: dataInicio, fim: dataFim },
            dias_letivos: diasUteis.length,
            total_alunos: alunosDaTurma.length,
            gerado_em: new Date().toISOString(),
            alunos: relatorio
                .filter(a => a.total_faltas > 0) // Apenas alunos com faltas
                .sort((a, b) => b.total_faltas - a.total_faltas)
        };
    },

    /**
     * Gera relatório consolidado da escola
     */
    async gerarRelatorioConsolidado(dataInicio, dataFim) {
        const banco = await bancoLocal.iniciarBanco();

        const turmas = await banco.getAll('turmas');
        const relatoriosPorTurma = [];

        for (const turma of turmas) {
            const relFreq = await this.gerarRelatorioFrequencia(turma.id, dataInicio, dataFim);
            const relFaltas = await this.gerarRelatorioFaltas(turma.id, dataInicio, dataFim);

            relatoriosPorTurma.push({
                turma: turma.id,
                serie: turma.serie,
                turno: turma.turno,
                total_alunos: relFreq.total_alunos,
                dias_letivos: relFreq.dias_letivos,
                frequencia_media: relFreq.alunos.length > 0
                    ? Math.round(
                        relFreq.alunos.reduce((sum, a) => sum + a.percentual_frequencia, 0) / relFreq.alunos.length * 10
                    ) / 10
                    : 0,
                total_faltas: relFaltas.alunos.reduce((sum, a) => sum + a.total_faltas, 0),
                faltas_justificadas: relFaltas.alunos.reduce((sum, a) => sum + a.faltas_justificadas, 0),
                alunos_frequencia_critica: relFreq.alunos.filter(a => a.percentual_frequencia < 75).length
            });
        }

        return {
            periodo: { inicio: dataInicio, fim: dataFim },
            gerado_em: new Date().toISOString(),
            total_turmas: turmas.length,
            turmas: relatoriosPorTurma.sort((a, b) => a.turma.localeCompare(b.turma)),
            resumo: {
                total_alunos: relatoriosPorTurma.reduce((sum, t) => sum + t.total_alunos, 0),
                frequencia_media_geral: relatoriosPorTurma.length > 0
                    ? Math.round(
                        relatoriosPorTurma.reduce((sum, t) => sum + t.frequencia_media, 0) / relatoriosPorTurma.length * 10
                    ) / 10
                    : 0,
                total_faltas_geral: relatoriosPorTurma.reduce((sum, t) => sum + t.total_faltas, 0),
                alunos_risco_total: relatoriosPorTurma.reduce((sum, t) => sum + t.alunos_frequencia_critica, 0)
            }
        };
    },

    /**
     * Gera relatório de saídas antecipadas
     */
    async gerarRelatorioSaidasAntecipadas(dataInicio, dataFim) {
        const banco = await bancoLocal.iniciarBanco();

        const saidas = await banco.getAll('saidas_antecipadas');
        const saidasPeriodo = saidas.filter(s =>
            s.data_saida >= dataInicio && s.data_saida <= dataFim
        );

        // Enriquecer com dados dos alunos
        const alunos = await banco.getAll('alunos');
        const relatorio = saidasPeriodo.map(s => {
            const aluno = alunos.find(a => a.matricula === s.aluno_matricula);
            return {
                ...s,
                nome_aluno: aluno?.nome_completo || 'Desconhecido',
                turma: aluno?.turma_id || 'N/A'
            };
        });

        return {
            periodo: { inicio: dataInicio, fim: dataFim },
            gerado_em: new Date().toISOString(),
            total_saidas_antecipadas: relatorio.length,
            autorizadas: relatorio.filter(s => s.autorizada).length,
            nao_autorizadas: relatorio.filter(s => !s.autorizada).length,
            saidas: relatorio.sort((a, b) => new Date(b.data_saida + ' ' + b.hora_saida) - new Date(a.data_saida + ' ' + a.hora_saida))
        };
    }
};
