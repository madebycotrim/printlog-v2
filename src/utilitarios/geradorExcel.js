import * as XLSX from 'xlsx';
import { format } from 'date-fns';

/**
 * Gerador de Excel para relatórios SEEDF
 */

/**
 * Gera Excel do relatório de frequência
 */
export function gerarExcelFrequencia(dados) {
    const wb = XLSX.utils.book_new();

    // Folha: Resumo
    const resumoData = [
        ['RELATÓRIO DE FREQUÊNCIA ESCOLAR'],
        [''],
        ['Turma:', dados.turma],
        ['Período:', `${format(new Date(dados.periodo.inicio), 'dd/MM/yyyy')} a ${format(new Date(dados.periodo.fim), 'dd/MM/yyyy')}`],
        ['Total de Alunos:', dados.total_alunos],
        ['Dias Letivos:', dados.dias_letivos],
        ['Gerado em:', format(new Date(dados.gerado_em), 'dd/MM/yyyy HH:mm')],
        [''],
        ['DADOS POR ALUNO'],
        ['Matrícula', 'Nome', 'Dias Presentes', 'Dias Ausentes', '% Frequência', 'Status']
    ];

    dados.alunos.forEach(aluno => {
        resumoData.push([
            aluno.matricula,
            aluno.nome,
            aluno.dias_presentes,
            aluno.dias_ausentes,
            aluno.percentual_frequencia / 100, // Formato percentual
            aluno.status_frequencia
        ]);
    });

    const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);

    // Formatação
    wsResumo['!cols'] = [
        { wch: 15 }, // Matrícula
        { wch: 40 }, // Nome
        { wch: 15 }, // Presentes
        { wch: 15 }, // Ausentes
        { wch: 15 }, // Frequência
        { wch: 12 }  // Status
    ];

    // Aplicar formato de porcentagem na coluna E (índice 4)
    for (let i = 10; i < resumoData.length; i++) {
        const cellRef = XLSX.utils.encode_cell({ r: i, c: 4 });
        if (wsResumo[cellRef]) {
            wsResumo[cellRef].z = '0.0%';
        }
    }

    XLSX.utils.book_append_sheet(wb, wsResumo, 'Frequência');

    return wb;
}

/**
 * Gera Excel do relatório de faltas
 */
export function gerarExcelFaltas(dados) {
    const wb = XLSX.utils.book_new();

    // Folha: Resumo
    const resumoData = [
        ['RELATÓRIO DE FALTAS'],
        [''],
        ['Turma:', dados.turma],
        ['Período:', `${format(new Date(dados.periodo.inicio), 'dd/MM/yyyy')} a ${format(new Date(dados.periodo.fim), 'dd/MM/yyyy')}`],
        ['Alunos com Faltas:', dados.alunos.length],
        ['Dias Letivos:', dados.dias_letivos],
        ['Gerado em:', format(new Date(dados.gerado_em), 'dd/MM/yyyy HH:mm')],
        [''],
        ['DADOS POR ALUNO'],
        ['Matrícula', 'Nome', 'Turma', 'Total Faltas', 'Justificadas', 'Injustificadas']
    ];

    dados.alunos.forEach(aluno => {
        resumoData.push([
            aluno.matricula,
            aluno.nome,
            aluno.turma,
            aluno.total_faltas,
            aluno.faltas_justificadas,
            aluno.faltas_injustificadas
        ]);
    });

    const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);

    // Formatação
    wsResumo['!cols'] = [
        { wch: 15 }, // Matrícula
        { wch: 40 }, // Nome
        { wch: 20 }, // Turma
        { wch: 12 }, // Total
        { wch: 12 }, // Justif
        { wch: 15 }  // Injust
    ];

    XLSX.utils.book_append_sheet(wb, wsResumo, 'Faltas');

    // Folha: Justificativas
    const justifData = [
        ['DETALHAMENTO DE JUSTIFICATIVAS'],
        [''],
        ['Matrícula', 'Nome', 'Tipo', 'Período', 'Aprovada Por']
    ];

    dados.alunos.forEach(aluno => {
        if (aluno.justificativas && aluno.justificativas.length > 0) {
            aluno.justificativas.forEach(just => {
                justifData.push([
                    aluno.matricula,
                    aluno.nome,
                    just.tipo,
                    just.periodo,
                    just.aprovada_por || 'N/A'
                ]);
            });
        }
    });

    const wsJustif = XLSX.utils.aoa_to_sheet(justifData);
    wsJustif['!cols'] = [
        { wch: 15 },
        { wch: 40 },
        { wch: 25 },
        { wch: 30 },
        { wch: 30 }
    ];

    XLSX.utils.book_append_sheet(wb, wsJustif, 'Justificativas');

    return wb;
}

/**
 * Gera Excel do relatório consolidado
 */
export function gerarExcelConsolidado(dados) {
    const wb = XLSX.utils.book_new();

    // Folha: Resumo Geral
    const resumoData = [
        ['RELATÓRIO CONSOLIDADO DA ESCOLA'],
        [''],
        ['Período:', `${format(new Date(dados.periodo.inicio), 'dd/MM/yyyy')} a ${format(new Date(dados.periodo.fim), 'dd/MM/yyyy')}`],
        ['Gerado em:', format(new Date(dados.gerado_em), 'dd/MM/yyyy HH:mm')],
        [''],
        ['RESUMO GERAL'],
        ['Total de Turmas:', dados.total_turmas],
        ['Total de Alunos:', dados.resumo.total_alunos],
        ['Frequência Média Geral:', dados.resumo.frequencia_media_geral / 100],
        ['Total de Faltas:', dados.resumo.total_faltas_geral],
        ['Alunos em Risco:', dados.resumo.alunos_risco_total],
        [''],
        ['DADOS POR TURMA'],
        ['Turma', 'Série', 'Turno', 'Total Alunos', 'Freq. Média', 'Total Faltas', 'Faltas Justif.', 'Alunos em Risco']
    ];

    dados.turmas.forEach(turma => {
        resumoData.push([
            turma.turma,
            turma.serie,
            turma.turno,
            turma.total_alunos,
            turma.frequencia_media / 100,
            turma.total_faltas,
            turma.faltas_justificadas,
            turma.alunos_frequencia_critica
        ]);
    });

    const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);

    // Formatação
    wsResumo['!cols'] = [
        { wch: 20 }, // Turma
        { wch: 8 },  // Série
        { wch: 15 }, // Turno
        { wch: 12 }, // Total Alunos
        { wch: 12 }, // Freq Média
        { wch: 12 }, // Total Faltas
        { wch: 15 }, // Faltas Justif
        { wch: 15 }  // Em Risco
    ];

    // Aplicar formato de porcentagem
    const cellRefGeral = 'B9';
    if (wsResumo[cellRefGeral]) {
        wsResumo[cellRefGeral].z = '0.0%';
    }

    for (let i = 14; i < resumoData.length; i++) {
        const cellRef = XLSX.utils.encode_cell({ r: i, c: 4 });
        if (wsResumo[cellRef]) {
            wsResumo[cellRef].z = '0.0%';
        }
    }

    XLSX.utils.book_append_sheet(wb, wsResumo, 'Consolidado');

    return wb;
}

/**
 * Faz download do arquivo Excel
 */
export function baixarExcel(workbook, nomeArquivo) {
    XLSX.writeFile(workbook, nomeArquivo);
}
