import { useState, useEffect } from 'react';
import { useAutenticacao } from '../contexts/ContextoAutenticacao';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import { bancoLocal } from '../servicos/bancoLocal';
import {
    Users,
    Clock,
    AlertTriangle,
    BarChart3,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    MoreHorizontal
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    BarElement,
    ArcElement
} from 'chart.js';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    BarElement,
    ArcElement
);

const CardEstatistica = ({ titulo, valor, subtitulo, icone: Icone, cor, tendencia }) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-${cor}-50 text-${cor}-600 group-hover:scale-110 transition-transform duration-300`}>
                <Icone size={24} />
            </div>
            {tendencia && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${tendencia > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {tendencia > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(tendencia)}%
                </div>
            )}
        </div>
        <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{titulo}</h3>
            <p className="text-3xl font-black text-slate-800 tracking-tight mb-1">{valor}</p>
            <p className="text-xs text-slate-400 font-medium">{subtitulo}</p>
        </div>
    </div>
);

export default function Painel() {
    const { usuarioAtual } = useAutenticacao();
    const [estatisticas, definirEstatisticas] = useState({
        totalAlunos: 0,
        presentesHoje: 0,
        atrasosHoje: 0,
        turmasAtivas: 0,
        historicoPresenca: [],
        distribuicaoTurnos: []
    });
    const [carregando, definirCarregando] = useState(true);

    const carregarDados = async () => {
        try {
            definirCarregando(true);
            const banco = await bancoLocal.iniciarBanco();

            const alunos = await banco.getAll('alunos');
            const turmas = await banco.getAll('turmas');
            const registros = await banco.getAll('registros_acesso');

            // Processamento Básico (Simulação de Backend)
            const hoje = format(new Date(), 'yyyy-MM-dd');
            const registrosHoje = registros.filter(r =>
                format(new Date(r.timestamp), 'yyyy-MM-dd') === hoje
            );

            const presentes = new Set(registrosHoje
                .filter(r => r.tipo_movimentacao === 'ENTRADA')
                .map(r => r.aluno_matricula)
            ).size;

            // Histórico (últimos 7 dias)
            const ultimos7Dias = Array.from({ length: 7 }).map((_, i) => {
                const data = subDays(new Date(), 6 - i);
                const dataStr = format(data, 'yyyy-MM-dd');
                const regsDia = registros.filter(r =>
                    format(new Date(r.timestamp), 'yyyy-MM-dd') === dataStr &&
                    r.tipo_movimentacao === 'ENTRADA'
                );
                return {
                    data: format(data, 'dd/MM'),
                    total: new Set(regsDia.map(r => r.aluno_matricula)).size
                };
            });

            // Distribuição por Turno
            const turnos = turmas.reduce((acc, turma) => {
                acc[turma.turno] = (acc[turma.turno] || 0) + 1;
                return acc;
            }, {});

            definirEstatisticas({
                totalAlunos: alunos.length,
                presentesHoje: presentes,
                atrasosHoje: 0, // Implementar lógica de atraso depois
                turmasAtivas: turmas.length,
                historicoPresenca: ultimos7Dias,
                distribuicaoTurnos: [
                    turnos['Matutino'] || 0,
                    turnos['Vespertino'] || 0,
                    turnos['Noturno'] || 0
                ]
            });

        } catch (erro) {
            console.error('Erro ao carregar dashboard:', erro);
        } finally {
            definirCarregando(false);
        }
    };

    useEffect(() => {
        carregarDados();
        const interval = setInterval(carregarDados, 30000); // Atualiza a cada 30s
        return () => clearInterval(interval);
    }, []);

    // Configuração dos Gráficos
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { size: 13 },
                bodyFont: { size: 13 },
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: { border: { display: false }, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } }
        },
        interaction: { mode: 'index', intersect: false },
    };

    const dataLine = {
        labels: estatisticas.historicoPresenca.map(d => d.data),
        datasets: [{
            label: 'Alunos Presentes',
            data: estatisticas.historicoPresenca.map(d => d.total),
            borderColor: '#4f46e5',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
                gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
                return gradient;
            },
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#ffffff',
            pointBorderWidth: 2,
        }]
    };

    const dataDoughnut = {
        labels: ['Matutino', 'Vespertino', 'Noturno'],
        datasets: [{
            data: estatisticas.distribuicaoTurnos,
            backgroundColor: ['#eab308', '#3b82f6', '#8b5cf6'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const AcoesHeader = (
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-sm">
            <Clock size={16} className="text-indigo-500" />
            <span className="font-bold capitalize">{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
        </div>
    );

    return (
        <LayoutAdministrativo titulo="Visão Geral" subtitulo="Monitoramento e Estatísticas" acoes={AcoesHeader}>
            <div className="space-y-8 animate-fade-in pb-10">
                {/* Boas-vindas Simplificado */}
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        Olá, {usuarioAtual?.email?.split('@')[0] || 'Gestor'}! 👋
                    </h2>
                    <p className="text-slate-500 font-medium">Aqui está o resumo da sua escola hoje.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <CardEstatistica
                        titulo="Total de Alunos"
                        valor={carregando ? "..." : estatisticas.totalAlunos}
                        subtitulo="Matriculados no sistema"
                        icone={Users}
                        cor="indigo"
                        tendencia={2.5}
                    />
                    <CardEstatistica
                        titulo="Presença Hoje"
                        valor={carregando ? "..." : estatisticas.presentesHoje}
                        subtitulo="Registros de entrada"
                        icone={TrendingUp}
                        cor="emerald"
                        tendencia={12.4}
                    />
                    <CardEstatistica
                        titulo="Atrasos"
                        valor={carregando ? "..." : estatisticas.atrasosHoje}
                        subtitulo="Chegadas após tolerância"
                        icone={AlertTriangle}
                        cor="amber"
                    />
                    <CardEstatistica
                        titulo="Turmas"
                        valor={carregando ? "..." : estatisticas.turmasAtivas}
                        subtitulo="Turmas ativas no ano"
                        icone={BarChart3}
                        cor="purple"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart */}
                    {/* Main Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Fluxo de Presença</h3>
                                <p className="text-sm text-slate-500">Comparativo dos últimos 7 dias</p>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                        <div className="h-[300px] w-full">
                            {carregando ? (
                                <div className="h-full flex items-center justify-center animate-pulse text-slate-400">Carregando gráfico...</div>
                            ) : (
                                <Line data={dataLine} options={chartOptions} />
                            )}
                        </div>
                    </div>

                    {/* Secondary Chart */}
                    {/* Secondary Chart */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Distribuição por Turno</h3>
                        <p className="text-sm text-slate-500 mb-6">Turmas cadastradas por período</p>

                        <div className="flex-1 flex items-center justify-center relative">
                            {carregando ? (
                                <div className="animate-pulse text-slate-400">Carregando...</div>
                            ) : (
                                <div className="w-48 h-48 relative">
                                    <Doughnut
                                        data={dataDoughnut}
                                        options={{ cutout: '75%', plugins: { legend: { display: false } } }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                        <span className="text-2xl font-black text-slate-800">{estatisticas.turmasAtivas}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Turmas</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                    <span className="font-medium text-slate-600">Matutino</span>
                                </div>
                                <span className="font-bold text-slate-800">{estatisticas.distribuicaoTurnos[0] || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    <span className="font-medium text-slate-600">Vespertino</span>
                                </div>
                                <span className="font-bold text-slate-800">{estatisticas.distribuicaoTurnos[1] || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-violet-500"></span>
                                    <span className="font-medium text-slate-600">Noturno</span>
                                </div>
                                <span className="font-bold text-slate-800">{estatisticas.distribuicaoTurnos[2] || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Activity Feed placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Activity Feed Placeholder */}
                    {/* Activity Feed Placeholder */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity size={20} className="text-indigo-500" />
                            Atividade Recente (Simulação)
                        </h3>
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            {/* Item 1 */}
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                    <Users size={16} className="text-indigo-600" />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                        <div className="font-bold text-slate-800">Sincronização Automática</div>
                                        <time className="font-mono text-xs text-slate-400">10:45</time>
                                    </div>
                                    <div className="text-slate-500 text-sm">O sistema atualizou os dados de 15 turmas com sucesso.</div>
                                </div>
                            </div>
                            {/* Item 2 */}
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                    <AlertTriangle size={16} className="text-amber-500" />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                        <div className="font-bold text-slate-800">Tentativa de Acesso</div>
                                        <time className="font-mono text-xs text-slate-400">09:30</time>
                                    </div>
                                    <div className="text-slate-500 text-sm">Aluno sem carteirinha tentou acessar a portaria principal.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutAdministrativo>
    );
}
