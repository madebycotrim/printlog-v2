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
    MoreHorizontal,
    AlertOctagon,
    CheckCircle2
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
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
import { format, subDays, isSameDay, startOfDay, differenceInBusinessDays, isWeekend } from 'date-fns';
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

// Componentes Auxiliares
const CardEstatistica = ({ titulo, valor, subtitulo, icone: Icone, cor, tendencia, inverterTendencia }) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-${cor}-50 text-${cor}-600 bg-opacity-50`}>
                <Icone size={24} />
            </div>
            {tendencia !== undefined && (
                <div className={`
                    flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full 
                    ${(inverterTendencia ? tendencia < 0 : tendencia > 0)
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'}
                `}>
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

const WidgetRisco = ({ alunosRisco }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <AlertOctagon size={20} className="text-rose-500" />
                    Alunos em Risco
                </h3>
                <p className="text-sm text-slate-500">Detectado por análise comportamental (IA Heurística)</p>
            </div>
            <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                {alunosRisco.length} Críticos
            </span>
        </div>
        <div className="flex-1 overflow-y-auto p-0 custom-scrollbar max-h-[350px]">
            {alunosRisco.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <CheckCircle2 size={48} className="text-emerald-500/20 mb-3" />
                    <p className="text-slate-400 font-medium">Nenhum aluno em situação de risco crítico detectado.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {alunosRisco.map((item, idx) => (
                        <div key={item.aluno.matricula} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 text-sm">{item.aluno.nome_completo}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-500">{item.turma?.nome || 'Sem Turma'}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span className="text-xs font-bold text-rose-500">{item.faltasConsecutivas} dias ausente</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-slate-400">Frequência</div>
                                <div className={`text-sm font-black ${item.frequencia < 50 ? 'text-rose-600' : 'text-amber-500'}`}>
                                    {item.frequencia.toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wide">
                Ver Relatório Completo
            </button>
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
        distribuicaoTurnos: [],
        alunosRisco: [],
        feedAtividade: [],
        taxaPontualidade: { pontuais: 0, atrasados: 0 }
    });
    const [carregando, definirCarregando] = useState(true);

    const calcularRiscoEvasao = (alunos, registros30Dias, turmas) => {
        const alunosRisco = [];
        const hoje = new Date();

        // Agrupar registros por aluno
        const registrosPorAluno = {};
        registros30Dias.forEach(r => {
            if (!registrosPorAluno[r.aluno_matricula]) registrosPorAluno[r.aluno_matricula] = [];
            registrosPorAluno[r.aluno_matricula].push(new Date(r.timestamp));
        });

        const turmasMap = new Map(turmas.map(t => [t.id, t]));

        alunos.forEach(aluno => {
            const regs = registrosPorAluno[aluno.matricula] || [];

            // Frequência Simplificada (Baseada em dias úteis passados vs dias presentes)
            // (Esta é uma heurística aproximada para o dashboard)
            const diasPresente = new Set(regs.map(d => format(d, 'yyyy-MM-dd'))).size;
            // Assumindo 20 dias letivos no mês móvel para simplificação ou calcular dias úteis reais
            // Vamos usar dias úteis nos últimos 30 dias
            let diasUteisUltimos30 = 0;
            for (let i = 0; i < 30; i++) {
                const d = subDays(hoje, i);
                if (!isWeekend(d)) diasUteisUltimos30++;
            }
            if (diasUteisUltimos30 === 0) diasUteisUltimos30 = 1; // Evitar div por zero

            const frequencia = (diasPresente / diasUteisUltimos30) * 100;

            // Faltas Consecutivas (contando de ontem para trás)
            let faltasConsecutivas = 0;
            for (let i = 0; i < 30; i++) {
                // Começa de hoje ou ontem? Vamos contar hoje se já passou de certa hora, mas melhor contar dias completos passados
                const d = subDays(hoje, i);
                if (isWeekend(d)) continue;

                const presenteNesseDia = regs.some(r => isSameDay(r, d));
                if (!presenteNesseDia) {
                    faltasConsecutivas++;
                } else {
                    // Se encontrou presença, para a contagem de consecutivas (do presente para trás)
                    // Mas queremos as *atuais* consecutivas. Se o aluno veio hoje, faltas = 0.
                    // Se o loop é do dia mais recente para o mais antigo:
                    if (i === 0 && isSameDay(d, hoje)) {
                        // Se hoje ele veio, reseta, se não veio, conta (assumindo que o dia já acabou ou é check parcial)
                        // Para ser justo, vamos ignorar 'hoje' para faltas consecutivas se ainda for cedo? 
                        // Simplificação: Considera hoje.
                    }
                    break;
                }
            }

            // Regra de Risco
            if (faltasConsecutivas >= 3 || frequencia < 60) {
                alunosRisco.push({
                    aluno,
                    turma: turmasMap.get(aluno.turma_id),
                    faltasConsecutivas,
                    frequencia,
                    score: faltasConsecutivas * 10 + (100 - frequencia) // Score arbitrário para ordenação
                });
            }
        });

        // Ordenar por gravidade
        return alunosRisco.sort((a, b) => b.score - a.score).slice(0, 10); // Top 10
    };

    const processarDados = (dados) => {
        const { alunos, turmas, registros, logs } = dados;
        const hojeStr = format(new Date(), 'yyyy-MM-dd');

        // 1. Presença Hoje
        const registrosHoje = registros.filter(r =>
            format(new Date(r.timestamp), 'yyyy-MM-dd') === hojeStr
        );
        const presentesSet = new Set(registrosHoje.map(r => r.aluno_matricula));
        const presentesHoje = presentesSet.size;

        // 2. Pontualidade e Atrasos
        let atrasos = 0;
        const mapTurmas = new Map(turmas.map(t => [t.id, t]));
        const mapAlunos = new Map(alunos.map(a => [a.matricula, a]));

        registrosHoje.forEach(r => {
            if (r.tipo_movimentacao === 'ENTRADA') {
                const aluno = mapAlunos.get(r.aluno_matricula);
                if (aluno && aluno.turma_id) {
                    const turma = mapTurmas.get(aluno.turma_id);
                    if (turma) {
                        const horaReg = new Date(r.timestamp);
                        const mins = horaReg.getHours() * 60 + horaReg.getMinutes();

                        let limite = 0;
                        if (turma.turno === 'Matutino') limite = 7 * 60 + 15;
                        else if (turma.turno === 'Vespertino') limite = 13 * 60 + 15;
                        else if (turma.turno === 'Noturno') limite = 19 * 60 + 15;

                        if (limite > 0 && mins > limite) atrasos++;
                    }
                }
            }
        });

        // 3. Histórico (Últimos 7 dias para gráfico)
        const historico = Array.from({ length: 7 }).map((_, i) => {
            const d = subDays(new Date(), 6 - i);
            const dStr = format(d, 'yyyy-MM-dd');
            // Filtrar registros desse dia
            const regsDia = registros.filter(r => format(new Date(r.timestamp), 'yyyy-MM-dd') === dStr);
            const totalDia = new Set(regsDia.map(r => r.aluno_matricula)).size;
            return { data: format(d, 'dd/MM'), total: totalDia };
        });

        // 4. Risco de Evasão
        const alunosRisco = calcularRiscoEvasao(alunos, registros, turmas);

        // 5. Atividades (Logs)
        const atividades = logs
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5)
            .map(log => ({
                id: log.id,
                icone: log.acao?.includes('LOGIN') ? Users : AlertTriangle, // Simplificado
                titulo: log.acao,
                hora: format(new Date(log.timestamp), 'HH:mm'),
                descricao: log.usuario_email
            }));

        definirEstatisticas({
            totalAlunos: alunos.length,
            presentesHoje,
            atrasosHoje: atrasos,
            turmasAtivas: turmas.length,
            historicoPresenca: historico,
            distribuicaoTurnos: [], // Manter lógica se necessário, mas focar no novo
            alunosRisco,
            feedAtividade: atividades,
            taxaPontualidade: { pontuais: presentesHoje - atrasos, atrasados: atrasos }
        });
    };

    const carregarDados = async () => {
        try {
            definirCarregando(true);
            const dados = await bancoLocal.obterDadosDashboard();
            processarDados(dados);
        } catch (erro) {
            console.error("Erro dashboard:", erro);
        } finally {
            definirCarregando(false);
        }
    };

    useEffect(() => {
        carregarDados();
        const interval = setInterval(carregarDados, 60000);
        return () => clearInterval(interval);
    }, []);

    // Config Charts
    const optionsLine = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false } },
            y: { grid: { color: '#f1f5f9' }, min: 0 } // Começa do 0 para melhor noção de escala
        },
        maintainAspectRatio: false
    };

    const dataLine = {
        labels: estatisticas.historicoPresenca.map(h => h.data),
        datasets: [{
            label: 'Alunos',
            data: estatisticas.historicoPresenca.map(h => h.total),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const dataDoughnut = {
        labels: ['Pontuais', 'Atrasados'],
        datasets: [{
            data: [estatisticas.taxaPontualidade.pontuais, estatisticas.taxaPontualidade.atrasados],
            backgroundColor: ['#10b981', '#f59e0b'],
            borderWidth: 0
        }]
    };

    return (
        <LayoutAdministrativo titulo="Painel Inteligente" subtitulo="Visão Geral & Análise Preditiva">
            <div className="space-y-6 pb-10">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <CardEstatistica
                        titulo="Total Alunos"
                        valor={estatisticas.totalAlunos}
                        subtitulo="Ativos no sistema"
                        icone={Users}
                        cor="indigo"
                    />
                    <CardEstatistica
                        titulo="Presença Hoje"
                        valor={estatisticas.presentesHoje}
                        subtitulo={`${((estatisticas.presentesHoje / (estatisticas.totalAlunos || 1)) * 100).toFixed(1)}% de comparecimento`}
                        icone={TrendingUp}
                        cor="emerald"
                        tendencia={5.2}
                    />
                    <CardEstatistica
                        titulo="Atrasos"
                        valor={estatisticas.atrasosHoje}
                        subtitulo="Chegadas tardias"
                        icone={Clock}
                        cor="amber"
                        tendencia={-2.1}
                        inverterTendencia // Menos atrasos é melhor (verde se negativo)
                    />
                    <CardEstatistica
                        titulo="Risco Evasão"
                        valor={estatisticas.alunosRisco.length}
                        subtitulo="Alunos sob alerta"
                        icone={AlertTriangle}
                        cor="rose"
                        tendencia={10} // Se aumentou o risco, é ruim (vermelho)
                        inverterTendencia
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Col: Charts */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Line Chart */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Tendência de Frequência (7 Dias)</h3>
                            <div className="h-64">
                                <Line data={dataLine} options={optionsLine} />
                            </div>
                        </div>

                        {/* Recent Activity (Table Style) */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Logs Recentes do Sistema</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                                        <tr>
                                            <th className="px-4 py-2">Ação</th>
                                            <th className="px-4 py-2">Usuário</th>
                                            <th className="px-4 py-2">Horário</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estatisticas.feedAtividade.map(log => (
                                            <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                                <td className="px-4 py-3 font-medium text-slate-700">{log.titulo}</td>
                                                <td className="px-4 py-3 text-slate-500">{log.descricao}</td>
                                                <td className="px-4 py-3 text-slate-400 font-mono text-xs">{log.hora}</td>
                                            </tr>
                                        ))}
                                        {estatisticas.feedAtividade.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="px-4 py-8 text-center text-slate-400">Sem atividades recentes</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Widgets */}
                    <div className="space-y-6">

                        {/* Risk Widget (The new AI feature) */}
                        <div className="h-[400px]">
                            <WidgetRisco alunosRisco={estatisticas.alunosRisco} />
                        </div>

                        {/* Doughnut Chart (Pontualidade) */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Pontualidade Hoje</h3>
                            <div className="h-48 flex justify-center">
                                <Doughnut data={dataDoughnut} options={{ cutout: '70%', plugins: { legend: { position: 'bottom' } } }} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </LayoutAdministrativo>
    );
}
