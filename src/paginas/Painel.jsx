import { useEffect, useState } from 'react';
import { bancoLocal } from '../servicos/bancoLocal';
import { servicoSincronizacao } from '../servicos/sincronizacao';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    AlertTriangle,
    Printer,
    RefreshCw,
    X,
    TrendingUp,
    Users,
    LogOut,
    Activity,
    Clock,
    UserX
} from 'lucide-react';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import { detectarAlunosEmRisco } from '../utilitarios/algoritmoEvasao';

export default function Painel() {
    const [estatisticas, definirEstatisticas] = useState({
        totalAlunos: 0,
        presentes: 0,
        saidas: 0
    });

    const [alunosPresentes, definirAlunosPresentes] = useState([]);
    const [ultimosAcessos, definirUltimosAcessos] = useState([]);
    const [dadosPorTurma, definirDadosPorTurma] = useState([]);
    const [, definirCarregando] = useState(true);
    const [modoEvacuacao, definirModoEvacuacao] = useState(false);

    // Evasão Silenciosa
    const [alunosEmRisco, definirAlunosEmRisco] = useState([]);
    const [mostrarAlertasEvasao, definirMostrarAlertasEvasao] = useState(false);

    const carregarDados = async () => {
        try {
            const banco = await bancoLocal.iniciarBanco();

            // v3.0 - Sync Down (Baixar dados novos se online)
            if (navigator.onLine) {
                try {
                    // Sincroniza alunos (novos cadastros)
                    await servicoSincronizacao.sincronizarAlunos();
                    console.log('Painel: Dados sincronizados com a nuvem.');
                } catch (e) {
                    console.warn('Painel: Falha ao sincronizar (usando cache local):', e);
                }
            }

            const totalAlunos = await banco.count('alunos');

            // Alunos Presentes (Lógica Otimizada)
            const presentes = await bancoLocal.listarAlunosPresentes();

            // Últimos Acessos (Feed)
            const todosRegistros = await banco.getAll('registros_acesso');
            const feedRecente = todosRegistros
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 10); // Top 10

            // Estatísticas de Saída Hoje
            const hoje = format(new Date(), 'yyyy-MM-dd');
            const saidasHoje = todosRegistros.filter(r =>
                r.timestamp.startsWith(hoje) && r.tipo_movimentacao === 'SAIDA'
            ).length;

            // Agrupamento por Turma (Simples)
            const contagemTurmas = {};
            presentes.forEach(aluno => {
                const turma = aluno.turma_id || 'SEM TURMA';
                contagemTurmas[turma] = (contagemTurmas[turma] || 0) + 1;
            });
            const dadosGrafico = Object.entries(contagemTurmas)
                .map(([turma, qtd]) => ({ turma, qtd }))
                .sort((a, b) => b.qtd - a.qtd) // Mais cheias primeiro
                .slice(0, 5); // Top 5 turmas

            definirEstatisticas({
                totalAlunos,
                presentes: presentes.length,
                saidas: saidasHoje
            });

            definirAlunosPresentes(presentes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            definirUltimosAcessos(feedRecente);
            definirDadosPorTurma(dadosGrafico);

            // Detecção de Evasão Silenciosa
            const todosAlunos = await banco.getAll('alunos');
            const alunosRisco = detectarAlunosEmRisco(todosRegistros, todosAlunos);
            definirAlunosEmRisco(alunosRisco);

        } catch (erro) {
            console.error(erro);
        } finally {
            definirCarregando(false);
        }
    };

    useEffect(() => {
        carregarDados();
        const intervalo = setInterval(carregarDados, 3000); // Atualização mais rápida (3s) para sensação de "Live"
        return () => clearInterval(intervalo);
    }, []);

    const imprimirListaEvacuacao = () => {
        window.print();
    };

    // --- MODO EVACUAÇÃO (Tela Cheia de Emergência) ---
    if (modoEvacuacao) {
        // Agrupar por turma para melhor organização
        const agrupadoPorTurma = {};
        alunosPresentes.forEach(aluno => {
            const turma = aluno.turma_id || 'SEM TURMA';
            if (!agrupadoPorTurma[turma]) {
                agrupadoPorTurma[turma] = [];
            }
            agrupadoPorTurma[turma].push(aluno);
        });

        // Extrair turno da turma (ex: "1ª A - Matutino" → "Matutino")
        const extrairTurno = (turmaId) => {
            if (!turmaId) return 'Não definido';
            const partes = turmaId.split(' - ');
            return partes.length > 1 ? partes[1] : 'Não definido';
        };

        // Contar por turno
        const contagemTurno = {};
        alunosPresentes.forEach(aluno => {
            const turno = extrairTurno(aluno.turma_id);
            contagemTurno[turno] = (contagemTurno[turno] || 0) + 1;
        });

        return (
            <div className="fixed inset-0 bg-red-600 z-[9999] overflow-y-auto print:bg-white print:text-black">
                <div className="max-w-6xl mx-auto p-8 print:p-4">
                    <header className="flex justify-between items-center mb-8 border-b-2 border-white/20 pb-6 print:border-black">
                        <div className="text-white print:text-black">
                            <h1 className="text-5xl font-black uppercase tracking-tighter flex items-center gap-4">
                                <AlertTriangle className="w-16 h-16 animate-pulse print:hidden" />
                                🚨 Lista de Evacuação
                            </h1>
                            <p className="text-2xl mt-2 font-bold opacity-90">
                                CEM 03 de Taguatinga • {format(new Date(), "dd/MM/yyyy HH:mm")}
                            </p>
                        </div>
                        <div className="flex gap-4 print:hidden">
                            <button
                                onClick={imprimirListaEvacuacao}
                                className="bg-white text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition shadow-lg flex items-center gap-2"
                            >
                                <Printer /> Imprimir
                            </button>
                            <button
                                onClick={() => definirModoEvacuacao(false)}
                                className="bg-red-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-900 transition shadow-lg flex items-center gap-2"
                            >
                                <X /> Fechar
                            </button>
                        </div>
                    </header>

                    {/* Contadores por Turno */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {Object.entries(contagemTurno).map(([turno, qtd]) => (
                            <div key={turno} className="bg-white rounded-2xl p-4 shadow-lg border-2 border-red-200 print:border-gray-300">
                                <p className="text-sm font-bold text-red-700 uppercase tracking-wider print:text-gray-600">{turno}</p>
                                <p className="text-3xl font-black text-red-900 print:text-black">{qtd}</p>
                            </div>
                        ))}
                        <div className="bg-red-800 text-white rounded-2xl p-4 shadow-lg print:bg-gray-800 print:text-white">
                            <p className="text-sm font-bold uppercase tracking-wider opacity-90">Total Geral</p>
                            <p className="text-3xl font-black">{alunosPresentes.length}</p>
                        </div>
                    </div>

                    {/* Lista por Turma */}
                    <div className="space-y-6">
                        {Object.entries(agrupadoPorTurma)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([turma, alunos]) => (
                                <div key={turma} className="bg-white rounded-3xl overflow-hidden shadow-2xl print:shadow-none print:rounded-lg print:break-inside-avoid">
                                    <div className="bg-red-50 p-4 border-b border-red-100 print:bg-gray-100 print:border-gray-300">
                                        <h2 className="text-xl font-bold text-red-800 print:text-black flex justify-between items-center">
                                            <span>{turma}</span>
                                            <span className="text-2xl bg-red-200 px-4 py-1 rounded-full print:bg-gray-200">{alunos.length}</span>
                                        </h2>
                                    </div>
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-red-100/50 print:bg-gray-50 border-b border-red-100">
                                            <tr>
                                                <th className="p-3 font-bold text-red-900 print:text-black">Nome Completo</th>
                                                <th className="p-3 font-bold text-red-900 print:text-black w-32">Matrícula</th>
                                                <th className="p-3 font-bold text-red-900 print:text-black w-24">Entrada</th>
                                                <th className="p-3 font-bold text-red-900 print:text-black w-20 text-center print:hidden">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-red-50 print:divide-gray-200">
                                            {alunos
                                                .sort((a, b) => a.nome_completo.localeCompare(b.nome_completo))
                                                .map((aluno, i) => (
                                                    <tr key={aluno.matricula} className={i % 2 === 0 ? 'bg-white' : 'bg-red-50/10 print:bg-gray-50'}>
                                                        <td className="p-3 font-bold uppercase">{aluno.nome_completo}</td>
                                                        <td className="p-3 font-mono text-gray-600">{aluno.matricula}</td>
                                                        <td className="p-3 font-mono font-bold">
                                                            {format(new Date(aluno.timestamp), 'HH:mm')}
                                                        </td>
                                                        <td className="p-3 text-center print:hidden">
                                                            <div className="w-3 h-3 rounded-full bg-green-500 mx-auto"></div>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        );
    }

    // Ações do Header
    const AcoesHeader = (
        <div className="flex items-center gap-4">
            <button
                onClick={() => servicoSincronizacao.sincronizarRegistros()}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 px-4 py-2 bg-white border border-indigo-100 rounded-lg hover:bg-indigo-50 transition shadow-sm"
            >
                <RefreshCw className="w-4 h-4" />
                Sincronizar
            </button>
            <button
                onClick={() => definirModoEvacuacao(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 border border-rose-500 animate-pulse"
            >
                <AlertTriangle className="w-4 h-4" />
                MODO EVACUAÇÃO
            </button>
        </div>
    );

    return (
        <LayoutAdministrativo
            titulo="Monitoramento em Tempo Real"
            subtitulo={`CEM 03 de Taguatinga • ${format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}`}
            acoes={AcoesHeader}
        >
            {/* Alertas de Evasão */}
            {alunosEmRisco.length > 0 && (
                <div className="mb-6">
                    <button
                        onClick={() => definirMostrarAlertasEvasao(!mostrarAlertasEvasao)}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-2xl shadow-lg transition-all flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <UserX className="w-6 h-6 animate-pulse" />
                            <div className="text-left">
                                <p className="font-black text-lg">⚠️ Alerta de Evasão Silenciosa</p>
                                <p className="text-sm font-medium opacity-90">
                                    {alunosEmRisco.length} {alunosEmRisco.length === 1 ? 'aluno identificado' : 'alunos identificados'} em risco
                                </p>
                            </div>
                        </div>
                        <div className="text-2xl font-black transition-transform group-hover:scale-110">
                            {mostrarAlertasEvasao ? '▼' : '▶'}
                        </div>
                    </button>

                    {mostrarAlertasEvasao && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-[fadeIn_0.3s]">
                            {alunosEmRisco.slice(0, 6).map((item) => (
                                <div
                                    key={item.aluno.matricula}
                                    className={`bg-white rounded-xl p-5 shadow-md border-l-4 ${item.prioridade === 'ALTA' ? 'border-red-500' : 'border-orange-500'
                                        } hover:shadow-lg transition-all`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-800 text-lg leading-tight">
                                                {item.aluno.nome_completo}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {item.aluno.turma_id} • {item.aluno.matricula}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-black px-2 py-1 rounded-full ${item.prioridade === 'ALTA'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {item.prioridade}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Presença 7d:</span>
                                            <span className={`font-bold ${item.metricas.presenca7dias < 75 ? 'text-red-600' : 'text-slate-800'}`}>
                                                {item.metricas.presenca7dias}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Presença 30d:</span>
                                            <span className="font-bold text-slate-800">{item.metricas.presenca30dias}%</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-3">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Motivos:</p>
                                        <ul className="space-y-1">
                                            {item.motivos.slice(0, 2).map((motivo, idx) => (
                                                <li key={idx} className="text-xs text-slate-700 flex items-start gap-1">
                                                    <span className="text-orange-500 mt-0.5">•</span>
                                                    <span>{motivo}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 1. KPIs Principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-3xl shadow-lg shadow-blue-500/30 flex items-center gap-4 group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-blue-400/20">
                    <div className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl group-hover:bg-white/30 transition-colors">
                        <Users size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total de Alunos</p>
                        <p className="text-4xl font-black text-white drop-shadow-lg">{estatisticas.totalAlunos}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-3xl shadow-lg shadow-emerald-500/30 flex items-center gap-4 relative overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-emerald-400/20">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl group-hover:bg-white/30 transition-colors relative z-10">
                        <TrendingUp size={28} strokeWidth={2.5} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Presentes Agora</p>
                        <p className="text-4xl font-black text-white drop-shadow-lg">{estatisticas.presentes}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-3xl shadow-lg shadow-amber-500/30 flex items-center gap-4 group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-amber-400/20">
                    <div className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl group-hover:bg-white/30 transition-colors">
                        <LogOut size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-amber-100 text-xs font-bold uppercase tracking-wider">Saídas Hoje</p>
                        <p className="text-4xl font-black text-white drop-shadow-lg">{estatisticas.saidas}</p>
                    </div>
                </div>
            </div>

            {/* 2. Grid Principal: Lotação x Live Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Coluna Esquerda: Lotação por Turma (2/3) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Gráfico de Turmas */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            Ocupação por Turma (Top 5)
                        </h3>
                        <div className="space-y-4">
                            {dadosPorTurma.map((item) => (
                                <div key={item.turma} className="group">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-bold text-slate-600">{item.turma}</span>
                                        <span className="font-mono text-slate-400">{item.qtd} alunos</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000 group-hover:bg-indigo-400 relative"
                                            style={{ width: `${Math.min((item.qtd / 40) * 100, 100)}%` }} // Assumindo 40 alunos por turma como ref visual
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {dadosPorTurma.length === 0 && (
                                <p className="text-sm text-slate-400 italic">Nenhuma ocupação registrada ainda.</p>
                            )}
                        </div>
                    </div>

                    {/* Lista Detalhada de Presentes */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Lista Nominal de Presentes
                            </h3>
                            <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-500">
                                {alunosPresentes.length} Registros
                            </span>
                        </div>

                        <div className="overflow-x-auto max-h-[400px]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="p-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Horário</th>
                                        <th className="p-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Nome</th>
                                        <th className="p-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Turma</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {alunosPresentes.map(aluno => (
                                        <tr key={aluno.matricula} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-4 font-mono text-green-600 font-bold">
                                                {format(new Date(aluno.timestamp), 'HH:mm')}
                                            </td>
                                            <td className="p-4 font-medium text-slate-700">{aluno.nome_completo}</td>
                                            <td className="p-4 text-slate-500">{aluno.turma_id}</td>
                                        </tr>
                                    ))}
                                    {alunosPresentes.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-8 text-center text-slate-400">
                                                Escola vazia ou dados não sincronizados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Coluna Direita: Live Feed (1/3) */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full max-h-[800px] overflow-y-auto">
                        <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2 sticky top-0 bg-white pb-4 z-10 border-b border-slate-50">
                            <Clock className="w-5 h-5 text-orange-500" />
                            Feed ao Vivo
                        </h3>

                        <div className="space-y-6 relative">
                            {/* Linha do tempo vertical */}
                            <div className="absolute left-3.5 top-2 bottom-0 w-0.5 bg-slate-100"></div>

                            {ultimosAcessos.map((registro, idx) => (
                                <div key={registro.id || idx} className="relative pl-10 animate-[fadeIn_0.5s_ease-out]">
                                    {/* Bolinha do status */}
                                    <div className={`
                                        absolute left-1.5 top-1.5 w-4 h-4 rounded-full border-2 border-white ring-1 ring-slate-100 z-10
                                        ${registro.tipo_movimentacao === 'ENTRADA' ? 'bg-green-500' : 'bg-orange-500'}
                                    `}></div>

                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                            {registro.tipo_movimentacao} • {format(new Date(registro.timestamp), 'HH:mm:ss')}
                                        </p>
                                        <p className="text-sm font-bold text-slate-700 leading-tight">
                                            {registro.aluno_nome || 'Aluno Desconhecido'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5 font-mono">
                                            {registro.aluno_matricula}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {ultimosAcessos.length === 0 && (
                                <p className="text-sm text-slate-400 pl-10 italic">Nenhuma atividade recente.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </LayoutAdministrativo>
    );
}
