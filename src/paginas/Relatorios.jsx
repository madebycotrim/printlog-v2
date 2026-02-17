import { useState, useEffect } from 'react';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import { bancoLocal } from '../servicos/bancoLocal';
import { servicoSincronizacao } from '../servicos/sincronizacao';
import {
    FileText,
    Download,
    Calendar,
    Filter,
    BarChart2,
    PieChart,
    Table,
    FileSpreadsheet,
    FileCheck,
    Loader2,
    RefreshCw,
    CloudDownload
} from 'lucide-react';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Relatorios() {
    const [estatisticas, definirEstatisticas] = useState({
        totalRegistros: 0,
        registrosHoje: 0,
        turmaMaisAtiva: '-',
        horarioPico: '-'
    });
    const [carregando, definirCarregando] = useState(true);
    const [sincronizando, setSincronizando] = useState(false);
    const [filtros, setFiltros] = useState({
        dataInicio: new Date().toISOString().split('T')[0],
        dataFim: new Date().toISOString().split('T')[0],
        turma: 'Todas'
    });
    const [turmasDisponiveis, setTurmasDisponiveis] = useState([]);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            definirCarregando(true);
            const banco = await bancoLocal.iniciarBanco();
            const [registros, alunos, turmas] = await Promise.all([
                banco.getAll('registros_acesso'),
                banco.getAll('alunos'),
                banco.getAll('turmas')
            ]);

            // Se não houver dados locais, tentar sincronizar automaticamente na primeira vez
            if (registros.length === 0 && alunos.length === 0 && !sincronizando) {
                // Opcional: Auto-sync ou apenas avisar
            }

            // Carregar turmas para o filtro
            if (turmas.length > 0) {
                setTurmasDisponiveis(turmas.map(t => t.id));
            } else {
                // Extrair turmas dos alunos se a tabela de turmas estiver vazia
                const turmasAlunos = [...new Set(alunos.map(a => a.turma_id).filter(t => t))];
                setTurmasDisponiveis(turmasAlunos.sort());
            }

            // Calcular Estatísticas
            const hoje = new Date().toISOString().split('T')[0];
            const registrosHoje = registros.filter(r => r.timestamp.startsWith(hoje));

            // Turma mais ativa
            const contagemTurmas = {};
            registros.forEach(r => {
                const aluno = alunos.find(a => a.matricula === r.matricula);
                if (aluno && aluno.turma_id) {
                    contagemTurmas[aluno.turma_id] = (contagemTurmas[aluno.turma_id] || 0) + 1;
                }
            });
            const turmaMaisAtiva = Object.keys(contagemTurmas).reduce((a, b) => contagemTurmas[a] > contagemTurmas[b] ? a : b, '-');

            // Horário de Pico (simplificado por hora)
            const contagemHoras = {};
            registrosHoje.forEach(r => {
                const hora = r.timestamp.substring(11, 13);
                contagemHoras[hora] = (contagemHoras[hora] || 0) + 1;
            });
            const horaPico = Object.keys(contagemHoras).reduce((a, b) => contagemHoras[a] > contagemHoras[b] ? a : b, '-');

            definirEstatisticas({
                totalRegistros: registros.length,
                registrosHoje: registrosHoje.length,
                turmaMaisAtiva: turmaMaisAtiva !== '-' ? `${turmaMaisAtiva}` : '-',
                horarioPico: horaPico !== '-' ? `${horaPico}h - ${parseInt(horaPico) + 1}h` : '-'
            });

        } catch (e) {
            console.error("Erro ao carregar dados:", e);
            toast.error("Erro ao carregar estatísticas.");
        } finally {
            definirCarregando(false);
        }
    };

    const sincronizarDados = async () => {
        if (!navigator.onLine) {
            toast.error("Você precisa estar online para sincronizar.");
            return;
        }

        try {
            setSincronizando(true);
            const toastId = toast.loading("Sincronizando dados com o servidor...");

            const resultado = await servicoSincronizacao.sincronizarTudo();

            // Verifica se houve algum sucesso
            if (resultado.alunos && resultado.turmas && resultado.registros) {
                toast.success("Dados sincronizados com sucesso!", { id: toastId });
                await carregarDados(); // Recarrega a tela
            } else {
                toast.error("Houve uma falha na sincronização. Verifique o console.", { id: toastId });
            }

        } catch (e) {
            console.error("Erro ao sincronizar na tela de relatórios:", e);
            toast.error("Erro ao sincronizar dados.");
        } finally {
            setSincronizando(false);
        }
    };

    const obterDadosFiltrados = async () => {
        const banco = await bancoLocal.iniciarBanco();
        const [registros, alunos] = await Promise.all([
            banco.getAll('registros_acesso'),
            banco.getAll('alunos')
        ]);

        return registros.filter(r => {
            const dataRegistro = r.timestamp.split('T')[0];
            const dataValida = dataRegistro >= filtros.dataInicio && dataRegistro <= filtros.dataFim;

            if (!dataValida) return false;

            if (filtros.turma !== 'Todas') {
                const aluno = alunos.find(a => a.matricula === r.matricula);
                return aluno && aluno.turma_id === filtros.turma;
            }
            return true;
        }).map(r => {
            const aluno = alunos.find(a => a.matricula === r.matricula);
            return {
                data: format(parseISO(r.timestamp), 'dd/MM/yyyy HH:mm:ss'),
                nome: aluno ? aluno.nome_completo : 'Aluno Removido/Desconhecido',
                matricula: r.matricula,
                turma: aluno ? aluno.turma_id : '-',
                tipo: r.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA',
                sincronizado: r.sincronizado ? 'Sim' : 'Não'
            };
        });
    };

    const gerarPDF = (dados, titulo) => {
        const doc = new jsPDF();

        // Cabeçalho
        doc.setFontSize(18);
        doc.text("SEEDF - Sistema de Controle de Acesso Escolar", 14, 20);
        doc.setFontSize(14);
        doc.text(titulo, 14, 30);
        doc.setFontSize(10);
        doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 38);
        doc.text(`Período: ${format(parseISO(filtros.dataInicio), 'dd/MM/yyyy')} a ${format(parseISO(filtros.dataFim), 'dd/MM/yyyy')}`, 14, 44);
        doc.text(`Turma: ${filtros.turma}`, 14, 50);

        // Tabela
        autoTable(doc, {
            startY: 56,
            head: [['Data/Hora', 'Nome do Aluno', 'Matrícula', 'Turma', 'Tipo', 'Sync']],
            body: dados.map(d => [d.data, d.nome, d.matricula, d.turma, d.tipo, d.sincronizado]),
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] } // Indigo 600
        });

        doc.save(`Relatorio_${titulo.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    };

    const gerarExcel = (dados, titulo) => {
        const ws = XLSX.utils.json_to_sheet(dados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Dados");
        XLSX.writeFile(wb, `Relatorio_${titulo.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
    };

    const gerarRelatorio = async (tipo) => {
        const toastId = toast.loading(`Processando relatório: ${tipo}...`);
        try {
            const banco = await bancoLocal.iniciarBanco();
            const [registros, alunos, turmas] = await Promise.all([
                banco.getAll('registros_acesso'),
                banco.getAll('alunos'),
                banco.getAll('turmas')
            ]);

            let dadosRelatorio = [];
            let colunas = [];
            let tituloRelatorio = `Relatório de ${tipo}`;

            if (tipo === 'Risco de Evasão') {
                // Lógica: Alunos com < 3 presenças nos últimos 7 dias (Exemplo simplificado)
                // Ou alunos sem acesso nos últimos X dias.
                const trintaDiasAtras = subDays(new Date(), 30).toISOString();

                const presencasPorAluno = {};
                registros.forEach(r => {
                    if (r.timestamp >= trintaDiasAtras && r.tipo_movimentacao === 'ENTRADA') {
                        presencasPorAluno[r.aluno_matricula] = (presencasPorAluno[r.aluno_matricula] || 0) + 1;
                    }
                });

                // Filtrar quem tem pouca presença (ex: < 5 em 30 dias - Ajustar conforme realidade)
                dadosRelatorio = alunos.map(aluno => {
                    const presencas = presencasPorAluno[aluno.matricula] || 0;
                    return {
                        nome: aluno.nome_completo,
                        matricula: aluno.matricula,
                        turma: aluno.turma_id || '-',
                        presencas_30d: presencas,
                        status: presencas === 0 ? 'CRÍTICO (0)' : presencas < 10 ? 'ALERTA' : 'NORMAL'
                    };
                }).filter(d => d.status !== 'NORMAL' && (filtros.turma === 'Todas' || d.turma === filtros.turma));

                // Ordenar por criticidade
                dadosRelatorio.sort((a, b) => a.presencas_30d - b.presencas_30d);

                colunas = [['Nome do Aluno', 'Matrícula', 'Turma', 'Presenças (30d)', 'Status']];

                // Gerar PDF Específico
                const doc = new jsPDF();
                doc.setFontSize(16);
                doc.text("Relatório de Risco de Evasão", 14, 20);
                doc.setFontSize(10);
                doc.text(`Alunos com baixa frequência nos últimos 30 dias.`, 14, 28);

                autoTable(doc, {
                    startY: 35,
                    head: colunas,
                    body: dadosRelatorio.map(d => [d.nome, d.matricula, d.turma, d.presencas_30d, d.status]),
                    theme: 'striped',
                    headStyles: { fillColor: [220, 38, 38] }, // Red for alert
                });
                doc.save(`Risco_Evasao_${Date.now()}.pdf`);

            } else if (tipo === 'Fechamento Mensal') {
                // Filtrar registros do mês selecionado (baseado nos filtros de data da tela)
                const regsNoPeriodo = registros.filter(r => {
                    const data = r.timestamp.split('T')[0];
                    return data >= filtros.dataInicio && data <= filtros.dataFim;
                });

                const presencaGlobal = {};

                regsNoPeriodo.forEach(r => {
                    if (r.tipo_movimentacao === 'ENTRADA') {
                        presencaGlobal[r.aluno_matricula] = (presencaGlobal[r.aluno_matricula] || 0) + 1;
                    }
                });

                dadosRelatorio = alunos
                    .filter(a => filtros.turma === 'Todas' || a.turma_id === filtros.turma)
                    .map(aluno => ({
                        nome: aluno.nome_completo,
                        matricula: aluno.matricula,
                        turma: aluno.turma_id || '-',
                        total_presencas: presencaGlobal[aluno.matricula] || 0
                    }))
                    .sort((a, b) => a.nome.localeCompare(b.nome));

                colunas = [['Nome do Aluno', 'Matrícula', 'Turma', 'Total Presenças (Período)']];

                const doc = new jsPDF();
                doc.setFontSize(16);
                doc.text("Fechamento Mensal de Frequência", 14, 20);
                doc.setFontSize(10);
                doc.text(`Período: ${format(parseISO(filtros.dataInicio), 'dd/MM/yyyy')} a ${format(parseISO(filtros.dataFim), 'dd/MM/yyyy')}`, 14, 28);

                autoTable(doc, {
                    startY: 35,
                    head: colunas,
                    body: dadosRelatorio.map(d => [d.nome, d.matricula, d.turma, d.total_presencas]),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] }, // Blue
                });
                doc.save(`Fechamento_Mensal_${Date.now()}.pdf`);

            } else {
                // Fallback para Log de Auditoria e outros genéricos
                const dados = await obterDadosFiltrados();
                if (dados.length === 0) {
                    throw new Error("Nenhum dado encontrado.");
                }
                gerarPDF(dados, `Relatório de ${tipo}`);
            }

            toast.success('Relatório gerado com sucesso!', { id: toastId });
        } catch (e) {
            console.error(e);
            toast.error(e.message || "Erro ao gerar relatório.", { id: toastId });
        }
    };

    const CardRelatorio = ({ titulo, descricao, icone: Icone, cor, onClick }) => (
        <button
            onClick={onClick}
            disabled={carregando}
            className="flex flex-col items-start p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group w-full disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
        >
            {/* Gradient Background on Hover */}
            <div className={`absolute inset-0 bg-${cor}-50/0 group-hover:bg-${cor}-50/30 transition-colors duration-300`}></div>

            <div className={`p-3 rounded-2xl bg-${cor}-50 text-${cor}-600 mb-4 group-hover:scale-110 group-hover:bg-white group-hover:shadow-md transition-all relative z-10`}>
                <Icone size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2 relative z-10">{titulo}</h3>
            <p className="text-sm font-medium text-slate-500 mb-6 flex-1 leading-relaxed relative z-10">{descricao}</p>

            <div className={`mt-auto flex items-center gap-2 text-xs font-black uppercase tracking-wide text-${cor}-600 group-hover:gap-3 transition-all relative z-10`}>
                <Download size={16} />
                Baixar PDF
            </div>
        </button>
    );

    return (
        <LayoutAdministrativo
            titulo="Central de Relatórios"
            subtitulo="Exportação de dados e estatísticas oficiais"
            acoes={
                <button
                    onClick={sincronizarDados}
                    disabled={sincronizando || carregando}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={18} className={sincronizando ? "animate-spin text-indigo-600" : ""} />
                    {sincronizando ? "Sincronizando..." : "Atualizar Dados"}
                </button>
            }
        >

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-white/10 group-hover:scale-110 transition-transform duration-500">
                        <FileText size={100} />
                    </div>
                    <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Total de Registros</p>
                    <p className="text-4xl font-black relative z-10">{carregando ? '-' : estatisticas.totalRegistros}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Acessos Hoje</p>
                    <div className="flex items-center justify-between">
                        <p className="text-3xl font-black text-slate-800">{carregando ? '-' : estatisticas.registrosHoje}</p>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Calendar size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Turma + Ativa</p>
                    <div className="flex items-center justify-between">
                        <p className="text-3xl font-black text-slate-800">{carregando ? '-' : estatisticas.turmaMaisAtiva}</p>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <BarChart2 size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Horário de Pico</p>
                    <div className="flex items-center justify-between">
                        <p className="text-xl font-black text-slate-800 pt-1.5">{carregando ? '-' : estatisticas.horarioPico}</p>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                            <Clock size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action Area */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <FileCheck className="text-emerald-500" size={24} />
                        Relatórios Oficiais (SEEDF)
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CardRelatorio
                            titulo="Frequência Diária"
                            descricao="Relatório detalhado de entradas e saídas do dia atual, agrupado por turmas."
                            icone={Calendar}
                            cor="emerald"
                            onClick={() => gerarRelatorio('Frequência Diária')}
                        />
                        <CardRelatorio
                            titulo="Fechamento Mensal"
                            descricao="Consolidado de presença do mês para envio à secretaria de educação."
                            icone={FileSpreadsheet}
                            cor="blue"
                            onClick={() => gerarRelatorio('Fechamento Mensal')}
                        />
                        <CardRelatorio
                            titulo="Risco de Evasão"
                            descricao="Lista de alunos com baixo índice de frequência nos últimos 30 dias."
                            icone={PieChart}
                            cor="amber"
                            onClick={() => gerarRelatorio('Risco de Evasão')}
                        />
                        <CardRelatorio
                            titulo="Log de Auditoria"
                            descricao="Histórico completo de ações no sistema para fins de auditoria e segurança."
                            icone={Table}
                            cor="slate"
                            onClick={() => gerarRelatorio('Log de Auditoria')}
                        />
                    </div>
                </div>

                {/* Filters Sidebar */}
                <div className="bg-white h-fit rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 flex items-center gap-2">
                        <Filter size={16} /> Filtros de Exportação
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Data Inicial</label>
                            <input
                                type="date"
                                value={filtros.dataInicio}
                                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Data Final</label>
                            <input
                                type="date"
                                value={filtros.dataFim}
                                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Turma Específica</label>
                            <select
                                value={filtros.turma}
                                onChange={(e) => setFiltros({ ...filtros, turma: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                            >
                                <option value="Todas">Todas as Turmas</option>
                                {turmasDisponiveis.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
                            Os relatórios gerados respeitarão os filtros de data e turma selecionados acima.
                        </div>
                    </div>
                </div>
            </div>
        </LayoutAdministrativo>
    );
}
