import { useEffect, useState } from 'react';
import { bancoLocal } from '../servicos/bancoLocal';
import { servicoSincronizacao } from '../servicos/sincronizacao';
import { api } from '../servicos/api';
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
    Clock
} from 'lucide-react';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';

export default function Painel() {
    const [estatisticas, definirEstatisticas] = useState({
        totalAlunos: 0,
        presentes: 0,
        saidas: 0
    });

    const [alunosPresentes, definirAlunosPresentes] = useState([]);
    const [ultimosAcessos, definirUltimosAcessos] = useState([]);
    const [dadosPorTurma, definirDadosPorTurma] = useState([]);
    const [carregando, definirCarregando] = useState(true);
    const [modoEvacuacao, definirModoEvacuacao] = useState(false);

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
        return (
            <div className="fixed inset-0 bg-red-600 z-[9999] overflow-y-auto print:bg-white print:text-black">
                <div className="max-w-5xl mx-auto p-8 print:p-0">
                    <header className="flex justify-between items-center mb-8 border-b-2 border-white/20 pb-6 print:border-black">
                        <div className="text-white print:text-black">
                            <h1 className="text-5xl font-black uppercase tracking-tighter flex items-center gap-4">
                                <AlertTriangle className="w-16 h-16 animate-pulse print:hidden" />
                                Lista de Evacuação
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

                    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none">
                        <div className="bg-red-50 p-6 border-b border-red-100 print:bg-gray-100 print:border-gray-300">
                            <h2 className="text-2xl font-bold text-red-800 print:text-black flex justify-between">
                                <span>Alunos Presentes no Prédio</span>
                                <span className="text-3xl">{alunosPresentes.length}</span>
                            </h2>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-red-100/50 print:bg-gray-50 border-b border-red-100">
                                <tr>
                                    <th className="p-4 font-bold text-red-900 w-24">Turma</th>
                                    <th className="p-4 font-bold text-red-900">Nome Completo</th>
                                    <th className="p-4 font-bold text-red-900 w-32">Matrícula</th>
                                    <th className="p-4 font-bold text-red-900 w-32">Entrada</th>
                                    <th className="p-4 font-bold text-red-900 w-20 text-center print:hidden">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-red-50 print:divide-gray-200">
                                {alunosPresentes.map((aluno, i) => (
                                    <tr key={aluno.matricula} className={i % 2 === 0 ? 'bg-white' : 'bg-red-50/10 print:bg-gray-50'}>
                                        <td className="p-4 font-bold text-lg">{aluno.turma_id}</td>
                                        <td className="p-4 font-bold text-lg uppercase">{aluno.nome_completo}</td>
                                        <td className="p-4 font-mono text-gray-600">{aluno.matricula}</td>
                                        <td className="p-4 font-mono font-bold">
                                            {format(new Date(aluno.timestamp), 'HH:mm')}
                                        </td>
                                        <td className="p-4 text-center print:hidden">
                                            <div className="w-4 h-4 rounded-full bg-green-500 mx-auto"></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 rounded-lg hover:bg-blue-50 transition shadow-sm"
            >
                <RefreshCw className="w-4 h-4" />
                Sincronizar
            </button>
            <button
                onClick={() => definirModoEvacuacao(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 border border-red-500 animate-pulse"
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
            {/* 1. KPIs Principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total de Alunos</p>
                        <p className="text-3xl font-black text-slate-800">{estatisticas.totalAlunos}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1 bg-green-500"></div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-green-600/70 text-xs font-bold uppercase tracking-wider">Presentes Agora</p>
                        <p className="text-3xl font-black text-green-600">{estatisticas.presentes}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                        <LogOut size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Saídas Hoje</p>
                        <p className="text-3xl font-black text-orange-500">{estatisticas.saidas}</p>
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
                            <Activity className="w-5 h-5 text-blue-500" />
                            Ocupação por Turma (Top 5)
                        </h3>
                        <div className="space-y-4">
                            {dadosPorTurma.map((item, idx) => (
                                <div key={item.turma} className="group">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-bold text-slate-600">{item.turma}</span>
                                        <span className="font-mono text-slate-400">{item.qtd} alunos</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-1000 group-hover:bg-blue-400 relative"
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
