import { useState, useEffect } from 'react';
import { TrendingUp, Users, AlertTriangle, Shield, Clock, RefreshCw, Download, ChevronRight } from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import { useAutenticacao } from '../contexts/ContextoAutenticacao';
import { obterDashboardExecutivo } from '../servicos/estatisticasExecutivas';
import { format } from 'date-fns';

// Registrar componentes do Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function PainelExecutivo() {
    const { usuarioAtual } = useAutenticacao();
    const [carregando, definirCarregando] = useState(true);
    const [dados, definirDados] = useState(null);
    const [ultimaAtualizacao, definirUltimaAtualizacao] = useState(null);

    const carregarDados = async () => {
        definirCarregando(true);
        try {
            const dashboard = await obterDashboardExecutivo();
            definirDados(dashboard);
            definirUltimaAtualizacao(new Date(dashboard.atualizadoEm));
        } catch (erro) {
            console.error('Erro ao carregar dashboard:', erro);
        } finally {
            definirCarregando(false);
        }
    };

    useEffect(() => {
        carregarDados();

        // Auto-refresh a cada 5 minutos
        const interval = setInterval(carregarDados, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const CardKPI = ({ icone: Icone, titulo, valor, subtitulo, cor = 'indigo', badge = null }) => (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${cor}-50`}>
                    <Icone className={`text-${cor}-600`} size={24} />
                </div>
                {badge && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.classe}`}>
                        {badge.texto}
                    </span>
                )}
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">{titulo}</h3>
            <p className="text-4xl font-black text-slate-900 mb-2">{valor}</p>
            {subtitulo && <p className="text-sm text-slate-500">{subtitulo}</p>}
        </div>
    );

    if (carregando || !dados) {
        return (
            <LayoutAdministrativo titulo="Dashboard Executivo" subtitulo="Painel de gestão para a direção">
                <div className="p-8 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Carregando dados executivos...</p>
                </div>
            </LayoutAdministrativo>
        );
    }

    // Preparar dados para gráficos
    const dadosTendencia = {
        labels: dados.tendenciaPresenca.map(d => format(new Date(d.data), 'dd/MM')),
        datasets: [{
            label: 'Percentual de Presença',
            data: dados.tendenciaPresenca.map(d => d.percentual),
            fill: true,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 5
        }]
    };

    const dadosTurno = {
        labels: dados.presencaPorTurno.map(t => t.turno),
        datasets: [{
            data: dados.presencaPorTurno.map(t => t.percentual),
            backgroundColor: [
                'rgba(234, 179, 8, 0.8)',   // Matutino - yellow
                'rgba(59, 130, 246, 0.8)',  // Vespertino - blue
                'rgba(168, 85, 247, 0.8)',  // Noturno - purple
                'rgba(16, 185, 129, 0.8)',  // Integral - green
                'rgba(148, 163, 184, 0.8)'  // Outros - slate
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    const dadosTopTurmas = {
        labels: dados.topTurmas.slice(0, 10).map(t => t.nomeExibicao),
        datasets: [{
            label: 'Presença (%)',
            data: dados.topTurmas.slice(0, 10).map(t => t.percentual),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgb(99, 102, 241)',
            borderWidth: 1
        }]
    };

    const opcoesGrafico = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    };

    const opcoesDoughnut = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right'
            }
        }
    };

    return (
        <LayoutAdministrativo
            titulo="Dashboard Executivo"
            subtitulo="Painel de gestão para a direção"
            acoes={
                <div className="flex items-center gap-3">
                    {ultimaAtualizacao && (
                        <span className="text-xs text-slate-500">
                            <Clock size={14} className="inline mr-1" />
                            {format(ultimaAtualizacao, 'HH:mm')}
                        </span>
                    )}
                    <button
                        onClick={carregarDados}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
                        title="Atualizar dados"
                    >
                        <RefreshCw size={20} className="text-slate-600 group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                    <button
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        title="Exportar relatório"
                    >
                        <Download size={18} />
                        Exportar
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Alertas */}
                {dados.alertas.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="text-amber-600" size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 mb-2">Ações Requeridas</h3>
                                {dados.alertas.map((alerta, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg mb-2 last:mb-0">
                                        <div>
                                            <p className="font-medium text-slate-700">{alerta.mensagem}</p>
                                            <p className="text-xs text-slate-500">Tipo: {alerta.tipo}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${alerta.severidade === 'ALTA' ? 'bg-red-100 text-red-800' :
                                            alerta.severidade === 'MEDIA' ? 'bg-amber-100 text-amber-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                            {alerta.severidade}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* KPIs Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <CardKPI
                        icone={Users}
                        titulo="Alunos Ativos"
                        valor={dados.estatisticasGerais.alunosAtivos}
                        subtitulo={`${dados.estatisticasGerais.totalTurmas} turmas`}
                        cor="indigo"
                    />
                    <CardKPI
                        icone={TrendingUp}
                        titulo="Presença Hoje"
                        valor={`${dados.presencaHoje.percentualPresenca}%`}
                        subtitulo={`${dados.presencaHoje.totalPresentes} de ${dados.presencaHoje.totalAtivos} alunos`}
                        cor="emerald"
                        badge={{
                            texto: dados.presencaHoje.percentualPresenca >= 80 ? 'ÓTIMO' : dados.presencaHoje.percentualPresenca >= 60 ? 'BOM' : 'ATENÇÃO',
                            classe: dados.presencaHoje.percentualPresenca >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : dados.presencaHoje.percentualPresenca >= 60
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                        }}
                    />
                    <CardKPI
                        icone={AlertTriangle}
                        titulo="Risco de Evasão"
                        valor={`${dados.riscoEvasao.taxaRisco}%`}
                        subtitulo={`${dados.riscoEvasao.totalEmRisco} alunos em risco`}
                        cor="amber"
                    />
                    <CardKPI
                        icone={Shield}
                        titulo="Registros de Acesso"
                        valor={dados.estatisticasGerais.totalRegistros.toLocaleString()}
                        subtitulo="Total no sistema"
                        cor="slate"
                    />
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tendência de Presença */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-indigo-600" />
                            Tendência de Presença (30 dias)
                        </h3>
                        <div className="h-64">
                            <Line data={dadosTendencia} options={opcoesGrafico} />
                        </div>
                    </div>

                    {/* Presença por Turno */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-blue-600" />
                            Presença por Turno (Hoje)
                        </h3>
                        <div className="h-64">
                            <Doughnut data={dadosTurno} options={opcoesDoughnut} />
                        </div>
                    </div>
                </div>

                {/* Top 10 Turmas */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-emerald-600" />
                        Top 10 Turmas por Presença (Hoje)
                    </h3>
                    <div className="h-96">
                        <Bar data={dadosTopTurmas} options={{ ...opcoesGrafico, indexAxis: 'y' }} />
                    </div>
                </div>

                {/* Alunos em Risco */}
                {dados.riscoEvasao.alunosEmRisco.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <AlertTriangle size={20} className="text-amber-600" />
                                Alunos em Risco de Evasão
                            </h3>
                            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                Ver todos
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="p-3 text-left font-bold text-slate-700">Matrícula</th>
                                        <th className="p-3 text-left font-bold text-slate-700">Nome</th>
                                        <th className="p-3 text-left font-bold text-slate-700">Turma</th>
                                        <th className="p-3 text-center font-bold text-slate-700">Risco</th>
                                        <th className="p-3 text-center font-bold text-slate-700">Presença 7d</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dados.riscoEvasao.alunosEmRisco.slice(0, 10).map((aluno) => (
                                        <tr key={aluno.matricula} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="p-3 font-mono text-xs">{aluno.matricula}</td>
                                            <td className="p-3 font-medium">{aluno.nome_completo}</td>
                                            <td className="p-3 text-slate-600">{aluno.turma_id}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${aluno.riscoEvasao.nivel === 'CRÍTICO' ? 'bg-red-100 text-red-800' :
                                                    aluno.riscoEvasao.nivel === 'ALTO' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {aluno.riscoEvasao.nivel}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center text-slate-600">
                                                {aluno.riscoEvasao.metricas.presenca7dias}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </LayoutAdministrativo>
    );
}
