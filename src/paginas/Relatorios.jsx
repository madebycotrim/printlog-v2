import { useEffect, useState } from 'react';
import { bancoLocal } from '../servicos/bancoLocal';
import { format } from 'date-fns';
import { FileText, Download, Clock, Users, FileSpreadsheet, FilePlus } from 'lucide-react';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import { relatoriosSEEDF } from '../servicos/relatoriosSEEDF';
import { gerarPDFFrequencia, gerarPDFFaltas, gerarPDFConsolidado, baixarPDF } from '../utilitarios/geradorPDF';
import { gerarExcelFrequencia, gerarExcelFaltas, gerarExcelConsolidado, baixarExcel } from '../utilitarios/geradorExcel';

export default function Relatorios() {
    const [dados, definirDados] = useState(null);
    const [carregando, definirCarregando] = useState(true);
    const [dataInicio, definirDataInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [dataFim, definirDataFim] = useState(format(new Date(), 'yyyy-MM-dd'));

    // SEEDF Reports
    const [tipoRelatorioSEEDF, setTipoRelatorioSEEDF] = useState('frequencia');
    const [turmaSEEDF, setTurmaSEEDF] = useState('');
    const [turmasDisponiveis, setTurmasDisponiveis] = useState([]);
    const [gerandoSEEDF, setGerandoSEEDF] = useState(false);

    useEffect(() => {
        const gerarRelatorios = async () => {
            definirCarregando(true);
            const banco = await bancoLocal.iniciarBanco();
            const alunos = await banco.getAll('alunos');
            const registros = await banco.getAll('registros_acesso');

            // Carregar turmas disponíveis
            const turmas = await banco.getAll('turmas');
            setTurmasDisponiveis(turmas.sort((a, b) => a.id.localeCompare(b.id)));

            // Filtrar por período
            const registrosPeriodo = registros.filter(r => {
                const dataRegistro = r.timestamp.split('T')[0];
                return dataRegistro >= dataInicio && dataRegistro <= dataFim;
            });

            // 1. Presença por Turma
            const presencaPorTurma = {}; // { '3A': { total: 10, presentes: 2 } }

            // Inicializar contagens
            alunos.forEach(aluno => {
                if (!presencaPorTurma[aluno.turma_id]) {
                    presencaPorTurma[aluno.turma_id] = { turma: aluno.turma_id, total: 0, presentes: 0, listaAusentes: [] };
                }
                presencaPorTurma[aluno.turma_id].total++;
            });

            // Calcular presença (Lógica simplificada: Tem ENTRADA no período)
            const matriculasPresentes = new Set(registrosPeriodo.filter(r => r.tipo_movimentacao === 'ENTRADA').map(r => r.aluno_matricula));

            alunos.forEach(aluno => {
                if (matriculasPresentes.has(aluno.matricula)) {
                    if (presencaPorTurma[aluno.turma_id]) {
                        presencaPorTurma[aluno.turma_id].presentes++;
                    }
                } else {
                    if (presencaPorTurma[aluno.turma_id]) {
                        presencaPorTurma[aluno.turma_id].listaAusentes.push(aluno);
                    }
                }
            });

            // 2. Atrasos (Entrada após 07:15)
            const alunosAtrasados = [];
            registrosPeriodo.forEach(r => {
                if (r.tipo_movimentacao === 'ENTRADA') {
                    const hora = new Date(r.timestamp);
                    if (hora.getHours() > 7 || (hora.getHours() === 7 && hora.getMinutes() > 15)) {
                        const aluno = alunos.find(a => a.matricula === r.aluno_matricula);
                        if (aluno) {
                            alunosAtrasados.push({ ...aluno, hora: r.timestamp });
                        }
                    }
                }
            });

            // 3. Mapa de Fluxo (Entradas/Saídas por hora)
            const fluxoPorHora = Array(24).fill(0).map((_, hora) => ({
                hora,
                entradas: 0,
                saidas: 0
            }));

            registrosPeriodo.forEach(r => {
                const hora = new Date(r.timestamp).getHours();
                if (r.tipo_movimentacao === 'ENTRADA') {
                    fluxoPorHora[hora].entradas++;
                } else {
                    fluxoPorHora[hora].saidas++;
                }
            });

            definirDados({
                porTurma: Object.values(presencaPorTurma).sort((a, b) => a.turma.localeCompare(b.turma)),
                alunosAtrasados: alunosAtrasados.sort((a, b) => new Date(b.hora) - new Date(a.hora)),
                totalPresentes: matriculasPresentes.size,
                totalAlunos: alunos.length,
                fluxoPorHora
            });
            definirCarregando(false);
        };

        gerarRelatorios();
    }, [dataInicio, dataFim]);

    const gerarRelatorioSEEDF = async (tipo, formato) => {
        setGerandoSEEDF(true);
        try {
            let dados;

            if (tipo === 'frequencia') {
                dados = await relatoriosSEEDF.gerarRelatorioFrequencia(turmaSEEDF, dataInicio, dataFim);
                if (formato === 'pdf') {
                    const doc = gerarPDFFrequencia(dados);
                    baixarPDF(doc, `frequencia_${turmaSEEDF}_${dataInicio}.pdf`);
                } else {
                    const wb = gerarExcelFrequencia(dados);
                    baixarExcel(wb, `frequencia_${turmaSEEDF}_${dataInicio}.xlsx`);
                }
            } else if (tipo === 'faltas') {
                dados = await relatoriosSEEDF.gerarRelatorioFaltas(turmaSEEDF || 'TODAS', dataInicio, dataFim);
                if (formato === 'pdf') {
                    const doc = gerarPDFFaltas(dados);
                    baixarPDF(doc, `faltas_${turmaSEEDF || 'todas'}_${dataInicio}.pdf`);
                } else {
                    const wb = gerarExcelFaltas(dados);
                    baixarExcel(wb, `faltas_${turmaSEEDF || 'todas'}_${dataInicio}.xlsx`);
                }
            } else if (tipo === 'consolidado') {
                dados = await relatoriosSEEDF.gerarRelatorioConsolidado(dataInicio, dataFim);
                if (formato === 'pdf') {
                    const doc = gerarPDFConsolidado(dados);
                    baixarPDF(doc, `consolidado_${dataInicio}.pdf`);
                } else {
                    const wb = gerarExcelConsolidado(dados);
                    baixarExcel(wb, `consolidado_${dataInicio}.xlsx`);
                }
            }
        } catch (erro) {
            console.error('Erro ao gerar relatório SEEDF:', erro);
            alert('Erro ao gerar relatório. Tente novamente.');
        } finally {
            setGerandoSEEDF(false);
        }
    };

    const exportarCSV = () => {
        if (!dados) return;

        // 1. Cabeçalho
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Turma;Total Alunos;Presentes;Ausentes;%\n";

        // 2. Dados por Turma
        dados.porTurma.forEach(t => {
            const porcentagem = t.total > 0 ? Math.round((t.presentes / t.total) * 100) : 0;
            csvContent += `${t.turma};${t.total};${t.presentes};${t.total - t.presentes};${porcentagem}%\n`;
        });

        // 3. Espaço
        csvContent += "\n\nRelatorio de Atrasos\n";
        csvContent += "Nome;Turma;Hora Entrada\n";

        // 4. Dados Atrasos
        dados.alunosAtrasados.forEach(a => {
            csvContent += `${a.nome_completo};${a.turma_id};${format(new Date(a.hora), 'HH:mm:ss')}\n`;
        });

        // 5. Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_scae_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const AcoesHeader = (
        <div className="flex gap-2 flex-wrap items-center">
            {/* Filtros de Data */}
            <div className="flex gap-2 items-center bg-white rounded-lg px-3 py-2 border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-600">De:</span>
                <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => definirDataInicio(e.target.value)}
                    className="text-sm border-none focus:ring-0 focus:outline-none text-slate-700 font-mono"
                />
            </div>
            <div className="flex gap-2 items-center bg-white rounded-lg px-3 py-2 border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-600">Até:</span>
                <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => definirDataFim(e.target.value)}
                    className="text-sm border-none focus:ring-0 focus:outline-none text-slate-700 font-mono"
                />
            </div>

            <button
                onClick={exportarCSV}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-medium shadow-md"
            >
                <FileText size={18} /> Baixar CSV
            </button>
            <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition font-medium shadow-md md:hidden"
            >
                <Download size={18} /> Imprimir
            </button>
        </div>
    );

    if (carregando) return <div className="p-8 text-center text-slate-500 animate-pulse">Gerando relatórios e análises...</div>;

    const periodoTexto = dataInicio === dataFim
        ? format(new Date(dataInicio), "dd/MM/yyyy")
        : `${format(new Date(dataInicio), "dd/MM/yyyy")} - ${format(new Date(dataFim), "dd/MM/yyyy")}`;

    return (
        <LayoutAdministrativo
            titulo="Relatórios Operacionais"
            subtitulo={`Análise de presença e ocorrências • ${periodoTexto}`}
            acoes={AcoesHeader}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block print:w-full">
                {/* 1. Card de Presença por Turma */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 break-inside-avoid h-full">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 border-b border-slate-50 pb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText size={20} />
                        </div>
                        Resumo de Presença
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 rounded-lg">
                                <tr>
                                    <th className="p-3 font-semibold text-slate-500 rounded-l-lg">Turma</th>
                                    <th className="p-3 font-semibold text-slate-500 text-center">Total</th>
                                    <th className="p-3 font-semibold text-slate-500 text-center">Presentes</th>
                                    <th className="p-3 font-semibold text-slate-500 text-center rounded-r-lg">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {dados.porTurma.map(t => (
                                    <tr key={t.turma} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-3 font-bold text-slate-700">{t.turma}</td>
                                        <td className="p-3 text-center text-slate-500">{t.total}</td>
                                        <td className="p-3 text-center text-green-600 font-bold bg-green-50/30 rounded-lg">{t.presentes}</td>
                                        <td className="p-3 text-center font-mono text-slate-600">
                                            {t.total > 0 ? Math.round((t.presentes / t.total) * 100) : 0}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Card de Atrasos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 break-inside-avoid h-full">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 border-b border-slate-50 pb-4">
                        <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                            <Clock size={20} />
                        </div>
                        Atrasos (Entrada &gt; 07:15)
                    </h2>
                    {dados.alunosAtrasados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <span className="text-2xl mb-2">🎉</span>
                            Sem atrasos registrados hoje.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {dados.alunosAtrasados.map((a, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-orange-50/50 p-3 rounded-xl border border-orange-100 hover:bg-orange-50 transition-colors">
                                    <div>
                                        <span className="font-bold text-slate-800 block">{a.nome_completo}</span>
                                        <span className="text-xs text-orange-600 font-bold bg-orange-100 px-2 py-0.5 rounded-md mt-1 inline-block">{a.turma_id}</span>
                                    </div>
                                    <span className="font-mono text-orange-600 font-bold bg-white px-2 py-1 rounded border border-orange-100 shadow-sm">
                                        {format(new Date(a.hora), 'HH:mm')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Lista de Ausentes (Full Width) */}
            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 break-before-page">
                <h2 className="text-xl font-bold mb-6 text-red-600 flex items-center gap-2 border-b border-red-50 pb-4">
                    <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                        <Users size={20} />
                    </div>
                    Alunos Ausentes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dados.porTurma.map(t => (
                        t.listaAusentes.length > 0 && (
                            <div key={t.turma} className="border border-red-100 p-4 rounded-xl bg-red-50/30 hover:bg-red-50/50 transition-colors">
                                <h3 className="font-bold text-red-800 border-b border-red-100 pb-2 mb-3 flex justify-between">
                                    Turma {t.turma}
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{t.listaAusentes.length}</span>
                                </h3>
                                <ul className="text-sm space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {t.listaAusentes.map(a => (
                                        <li key={a.matricula} className="text-slate-600 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-red-300 rounded-full"></span>
                                            {a.nome_completo}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {/* 4. Mapa de Calor de Fluxo */}
            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold mb-6 text-indigo-600 flex items-center gap-2 border-b border-indigo-50 pb-4">
                    <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                        <Clock size={20} />
                    </div>
                    📊 Mapa de Fluxo por Horário
                </h2>
                <p className="text-sm text-slate-500 mb-6">Análise de entradas e saídas por hora do dia</p>

                <div className="grid grid-cols-12 md:grid-cols-24 gap-2">
                    {dados.fluxoPorHora.map((item) => {
                        const total = item.entradas + item.saidas;
                        const maxTotal = Math.max(...dados.fluxoPorHora.map(f => f.entradas + f.saidas), 1);
                        const intensity = (total / maxTotal) * 100;

                        // Cor baseada na intensidade
                        const getColor = () => {
                            if (intensity === 0) return 'bg-slate-50 border-slate-100';
                            if (intensity < 25) return 'bg-blue-100 border-blue-200';
                            if (intensity < 50) return 'bg-indigo-200 border-indigo-300';
                            if (intensity < 75) return 'bg-purple-300 border-purple-400';
                            return 'bg-violet-500 border-violet-600 text-white';
                        };

                        return (
                            <div key={item.hora} className="group relative">
                                <div
                                    className={`aspect-square rounded-lg border-2 ${getColor()} transition-all hover:scale-110 hover:shadow-lg cursor-pointer flex flex-col items-center justify-center text-center`}
                                    title={`${item.hora}h: ${item.entradas} entradas, ${item.saidas} saídas`}
                                >
                                    <span className="text-xs font-bold">{item.hora}h</span>
                                    {total > 0 && <span className="text-xs font-mono">{total}</span>}
                                </div>

                                {/* Tooltip expandido */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs rounded-lg p-2 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                                    <p className="font-bold">{item.hora}:00</p>
                                    <p className="text-green-300">↓ {item.entradas} entradas</p>
                                    <p className="text-orange-300">↑ {item.saidas} saídas</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legenda */}
                <div className="mt-6 flex items-center justify-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-50 border-2 border-slate-100 rounded"></div>
                        <span className="text-slate-600">Sem atividade</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-100 border-2 border-blue-200 rounded"></div>
                        <span className="text-slate-600">Baixo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-300 border-2 border-purple-400 rounded"></div>
                        <span className="text-slate-600">Médio</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-violet-500 border-2 border-violet-600 rounded"></div>
                        <span className="text-slate-600">Alto</span>
                    </div>
                </div>
            </div>

            {/* SEEDF Official Reports Section */}
            <div className="mt-12 pt-12 border-t-4 border-indigo-200">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-indigo-600 rounded-xl">
                            <FileSpreadsheet className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-indigo-900">Relatórios Oficiais SEEDF</h2>
                            <p className="text-slate-600">Documentos formatados conforme padrão da Secretaria de Educação</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Tipo de Relatório */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Relatório</label>
                            <select
                                value={tipoRelatorioSEEDF}
                                onChange={(e) => setTipoRelatorioSEEDF(e.target.value)}
                                className="w-full border-2 border-slate-300 rounded-xl p-3 font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="frequencia">📊 Frequência por Turma</option>
                                <option value="faltas">📋 Relatório de Faltas</option>
                                <option value="consolidado">📈 Consolidado Geral</option>
                            </select>
                        </div>

                        {/* Turma */}
                        {tipoRelatorioSEEDF !== 'consolidado' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Turma {tipoRelatorioSEEDF === 'frequencia' && '*'}
                                </label>
                                <select
                                    value={turmaSEEDF}
                                    onChange={(e) => setTurmaSEEDF(e.target.value)}
                                    required={tipoRelatorioSEEDF === 'frequencia'}
                                    className="w-full border-2 border-slate-300 rounded-xl p-3 font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">
                                        {tipoRelatorioSEEDF === 'frequencia' ? 'Selecione uma turma...' : 'Todas as Turmas'}
                                    </option>
                                    {turmasDisponiveis.map(turma => (
                                        <option key={turma.id} value={turma.id}>{turma.id}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Placeholder para manter layout */}
                        {tipoRelatorioSEEDF === 'consolidado' && <div></div>}

                        {/* Exportar */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Exportar Como</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => gerarRelatorioSEEDF(tipoRelatorioSEEDF, 'pdf')}
                                    disabled={gerandoSEEDF || (tipoRelatorioSEEDF === 'frequencia' && !turmaSEEDF)}
                                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {gerandoSEEDF ? (
                                        <span className="animate-pulse">Gerando...</span>
                                    ) : (
                                        <>
                                            <FileText size={18} />
                                            PDF
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => gerarRelatorioSEEDF(tipoRelatorioSEEDF, 'excel')}
                                    disabled={gerandoSEEDF || (tipoRelatorioSEEDF === 'frequencia' && !turmaSEEDF)}
                                    className="flex-1 bg-green-700 text-white px-4 py-3 rounded-xl font-bold hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {gerandoSEEDF ? (
                                        <span className="animate-pulse">Gerando...</span>
                                    ) : (
                                        <>
                                            <FileSpreadsheet size={18} />
                                            Excel
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Informações */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm">
                        <p className="text-indigo-900 font-semibold mb-2">ℹ️ Informações sobre o Relatório Selecionado:</p>
                        {tipoRelatorioSEEDF === 'frequencia' && (
                            <p className="text-indigo-700">
                                <strong>Frequência por Turma:</strong> Gera relatório detalhado com percentual de presença de cada aluno da turma selecionada no período especificado.
                            </p>
                        )}
                        {tipoRelatorioSEEDF === 'faltas' && (
                            <p className="text-indigo-700">
                                <strong>Relatório de Faltas:</strong> Lista alunos com faltas, discriminando justificadas e injustificadas, com link para documentação comprobatória.
                            </p>
                        )}
                        {tipoRelatorioSEEDF === 'consolidado' && (
                            <p className="text-indigo-700">
                                <strong>Consolidado Geral:</strong> Visão completa da escola com estatísticas por turma, médias de frequência e indicadores de risco.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </LayoutAdministrativo>
    );
}
