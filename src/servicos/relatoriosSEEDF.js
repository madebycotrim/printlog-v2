import { exportarParaPDF } from '../utilitarios/geradorPDF';
import { format } from 'date-fns';

export const gerarRelatorioSEEDF = (tipo, logs, alunos, turmas) => {
    if (tipo === 'FREQUENCIA_MENSAL') {
        const titulo = 'RELATÓRIO DE FREQUÊNCIA MENSAL (SEEDF)';
        const colunas = ['Data/Hora', 'Aluno', 'Turma', 'Movimento', 'Validado Por'];

        // Preparar dados
        const dados = logs.map(log => {
            const aluno = alunos.find(a => a.matricula === log.aluno_matricula);
            return [
                format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm'),
                aluno ? aluno.nome_completo : 'Aluno não encontrado',
                aluno ? aluno.turma_id : '-',
                log.tipo_movimentacao,
                log.autorizado_por || 'Sistema'
            ];
        });

        exportarParaPDF(titulo, colunas, dados, 'Frequencia_Mensal_SEEDF.pdf');
    }

    else if (tipo === 'AUSENCIAS_CONSECUTIVAS') {
        // Lógica simplificada para identificar quem NÃO tem logs recentes (exemplo)
        // Em um caso real, seria mais complexo comparar dias úteis x presenças
        const titulo = 'RELATÓRIO DE AUSÊNCIAS / EVASÃO';
        const colunas = ['Matrícula', 'Nome do Aluno', 'Turma', 'Último Acesso Conhecido'];

        // Filtrar alunos sem acesso nos últimos 3 dias (exemplo)
        const tresDiasAtras = new Date();
        tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);

        const alunosAusentes = alunos.filter(aluno => {
            const ultimoAcesso = logs
                .filter(l => l.aluno_matricula === aluno.matricula)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

            if (!ultimoAcesso) return true; // Nunca acessou
            return new Date(ultimoAcesso.timestamp) < tresDiasAtras;
        });

        const dados = alunosAusentes.map(aluno => {
            const ultimoAcesso = logs.find(l => l.aluno_matricula === aluno.matricula);
            return [
                aluno.matricula,
                aluno.nome_completo,
                aluno.turma_id,
                ultimoAcesso ? format(new Date(ultimoAcesso.timestamp), 'dd/MM/yyyy') : 'Nunca'
            ];
        });

        exportarParaPDF(titulo, colunas, dados, 'Relatorio_Ausencias.pdf');
    }

    else if (tipo === 'FLUXO_HORARIOS') {
        const titulo = 'ANÁLISE DE FLUXO POR HORÁRIO';
        const colunas = ['Faixa Horária', 'Total Entradas', 'Total Saídas'];

        // Agrupar por hora
        const faixas = {};
        for (let i = 6; i <= 22; i++) {
            faixas[`${i}:00 - ${i}:59`] = { entradas: 0, saidas: 0 };
        }

        logs.forEach(log => {
            const hora = new Date(log.timestamp).getHours();
            if (hora >= 6 && hora <= 22) {
                const chave = `${hora}:00 - ${hora}:59`;
                if (log.tipo_movimentacao === 'ENTRADA') faixas[chave].entradas++;
                else faixas[chave].saidas++;
            }
        });

        const dados = Object.keys(faixas).map(faixa => [
            faixa,
            faixas[faixa].entradas.toString(),
            faixas[faixa].saidas.toString()
        ]);

        exportarParaPDF(titulo, colunas, dados, 'Fluxo_Horarios.pdf');
    }
};
