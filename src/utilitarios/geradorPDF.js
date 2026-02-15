import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Gerador de PDFs para relatórios SEEDF
 */

/**
 * Configura cabeçalho padrão SEEDF
 */
function adicionarCabecalhoSEEDF(doc, titulo, subtitulo = '') {
    // Logo e nome da secretaria
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('GOVERNO DO DISTRITO FEDERAL', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

    doc.setFontSize(9);
    doc.text('SECRETARIA DE ESTADO DE EDUCAÇÃO DO DISTRITO FEDERAL', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // Nome da escola (pode ser configurável)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SCAE - Sistema de Controle de Acesso Escolar', doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

    // Título do relatório
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 38, { align: 'center' });

    if (subtitulo) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(subtitulo, doc.internal.pageSize.getWidth() / 2, 44, { align: 'center' });
    }

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(20, 48, doc.internal.pageSize.getWidth() - 20, 48);

    return 55; // Retorna posição Y para começar conteúdo
}

/**
 * Adiciona rodapé com data de geração e paginação
 */
function adicionarRodape(doc) {
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        // Data de geração
        const dataGeracao = format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
        doc.text(`Gerado em: ${dataGeracao}`, 20, doc.internal.pageSize.getHeight() - 10);

        // Número da página
        doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.getWidth() - 20,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'right' }
        );
    }
}

/**
 * Gera PDF do relatório de frequência
 */
export function gerarPDFFrequencia(dados) {
    const doc = new jsPDF();

    const subtitulo = `Turma: ${dados.turma} | Período: ${format(new Date(dados.periodo.inicio), 'dd/MM/yyyy')} a ${format(new Date(dados.periodo.fim), 'dd/MM/yyyy')}`;
    let yPos = adicionarCabecalhoSEEDF(doc, 'Relatório de Frequência Escolar', subtitulo);

    // Informações gerais
    doc.setFontSize(10);
    doc.text(`Total de Alunos: ${dados.total_alunos}`, 20, yPos);
    doc.text(`Dias Letivos: ${dados.dias_letivos}`, 20, yPos + 6);
    yPos += 15;

    // Tabela de alunos
    const tableData = dados.alunos.map(aluno => [
        aluno.matricula,
        aluno.nome,
        aluno.dias_presentes.toString(),
        aluno.dias_ausentes.toString(),
        `${aluno.percentual_frequencia}%`,
        aluno.status_frequencia
    ]);

    doc.autoTable({
        startY: yPos,
        head: [['Matrícula', 'Nome', 'Presentes', 'Ausentes', 'Frequência', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 70 },
            2: { halign: 'center', cellWidth: 20 },
            3: { halign: 'center', cellWidth: 20 },
            4: { halign: 'center', cellWidth: 25 },
            5: { halign: 'center', cellWidth: 25 }
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        didParseCell: function (data) {
            // Colorir status
            if (data.column.index === 5 && data.cell.section === 'body') {
                if (data.cell.raw === 'REPROVADO') {
                    data.cell.styles.textColor = [231, 76, 60];
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = [39, 174, 96];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        }
    });

    adicionarRodape(doc);

    return doc;
}

/**
 * Gera PDF do relatório de faltas
 */
export function gerarPDFFaltas(dados) {
    const doc = new jsPDF();

    const subtitulo = dados.turma === 'TODAS'
        ? `Todas as Turmas | Período: ${format(new Date(dados.periodo.inicio), 'dd/MM/yyyy')} a ${format(new Date(dados.periodo.fim), 'dd/MM/yyyy')}`
        : `Turma: ${dados.turma} | Período: ${format(new Date(dados.periodo.inicio), 'dd/MM/yyyy')} a ${format(new Date(dados.periodo.fim), 'dd/MM/yyyy')}`;

    let yPos = adicionarCabecalhoSEEDF(doc, 'Relatório de Faltas', subtitulo);

    // Informações gerais
    doc.setFontSize(10);
    doc.text(`Alunos com Faltas: ${dados.alunos.length}`, 20, yPos);
    doc.text(`Dias Letivos: ${dados.dias_letivos}`, 20, yPos + 6);
    yPos += 15;

    // Tabela principal
    const tableData = dados.alunos.map(aluno => [
        aluno.matricula,
        aluno.nome,
        aluno.turma,
        aluno.total_faltas.toString(),
        aluno.faltas_justificadas.toString(),
        aluno.faltas_injustificadas.toString()
    ]);

    doc.autoTable({
        startY: yPos,
        head: [['Matrícula', 'Nome', 'Turma', 'Total', 'Justif.', 'Injust.']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [192, 57, 43],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 28 },
            1: { cellWidth: 65 },
            2: { cellWidth: 30 },
            3: { halign: 'center', cellWidth: 18 },
            4: { halign: 'center', cellWidth: 18 },
            5: { halign: 'center', cellWidth: 18 }
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        didParseCell: function (data) {
            // Destacar faltas injustificadas
            if (data.column.index === 5 && data.cell.section === 'body') {
                const valor = parseInt(data.cell.raw);
                if (valor > 0) {
                    data.cell.styles.textColor = [231, 76, 60];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        }
    });

    adicionarRodape(doc);

    return doc;
}

/**
 * Gera PDF do relatório consolidado
 */
export function gerarPDFConsolidado(dados) {
    const doc = new jsPDF('landscape'); // Landscape para mais espaço

    const subtitulo = `Período: ${format(new Date(dados.periodo.inicio), 'dd/MM/yyyy')} a ${format(new Date(dados.periodo.fim), 'dd/MM/yyyy')}`;
    let yPos = adicionarCabecalhoSEEDF(doc, 'Relatório Consolidado da Escola', subtitulo);

    // Resumo geral
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO GERAL', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Turmas: ${dados.total_turmas}`, 20, yPos);
    doc.text(`Total de Alunos: ${dados.resumo.total_alunos}`, 100, yPos);
    doc.text(`Frequência Média: ${dados.resumo.frequencia_media_geral}%`, 180, yPos);

    yPos += 6;
    doc.text(`Total de Faltas: ${dados.resumo.total_faltas_geral}`, 20, yPos);
    doc.text(`Alunos em Risco: ${dados.resumo.alunos_risco_total}`, 100, yPos);
    yPos += 12;

    // Tabela por turma
    const tableData = dados.turmas.map(turma => [
        turma.turma,
        turma.turno,
        turma.total_alunos.toString(),
        `${turma.frequencia_media}%`,
        turma.total_faltas.toString(),
        turma.faltas_justificadas.toString(),
        turma.alunos_frequencia_critica.toString()
    ]);

    doc.autoTable({
        startY: yPos,
        head: [['Turma', 'Turno', 'Alunos', 'Freq. Média', 'Faltas', 'Justif.', 'Em Risco']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [52, 73, 94],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 30 },
            2: { halign: 'center', cellWidth: 25 },
            3: { halign: 'center', cellWidth: 28 },
            4: { halign: 'center', cellWidth: 25 },
            5: { halign: 'center', cellWidth: 25 },
            6: { halign: 'center', cellWidth: 25 }
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        }
    });

    adicionarRodape(doc);

    return doc;
}

/**
 * Faz download do PDF
 */
export function baixarPDF(doc, nomeArquivo) {
    doc.save(nomeArquivo);
}
