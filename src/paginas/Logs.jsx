import { useState, useEffect } from 'react';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import { bancoLocal } from '../servicos/bancoLocal';
import { ACOES_AUDITORIA } from '../servicos/auditoria';
import { usePermissoes } from '../contexts/ContextoPermissoes';
import { FileText, Download, Search, Filter, Calendar, User, Activity, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Logs() {
    const { podeAcessar } = usePermissoes();
    const [logs, setLogs] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [filtros, setFiltros] = useState({
        dataInicio: '',
        dataFim: '',
        usuario: '',
        acao: '',
        busca: ''
    });

    // Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 20;

    const carregarLogs = async () => {
        try {
            setCarregando(true);
            const banco = await bancoLocal.iniciarBanco();
            const todosLogs = await banco.getAll('logs_auditoria');

            // Ordenar por timestamp (mais recente primeiro)
            todosLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            setLogs(todosLogs);
        } catch (erro) {
            console.error('Erro ao carregar logs:', erro);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarLogs();

        // Atualizar quando novos logs forem sincronizados
        const atualizarDados = () => carregarLogs();
        window.addEventListener('dados_sincronizados', atualizarDados);
        return () => window.removeEventListener('dados_sincronizados', atualizarDados);
    }, []);

    // Aplicar filtros
    const logsFiltrados = logs.filter(log => {
        // Filtro de data início
        if (filtros.dataInicio && new Date(log.timestamp) < new Date(filtros.dataInicio)) {
            return false;
        }

        // Filtro de data fim
        if (filtros.dataFim) {
            const dataFimComHora = new Date(filtros.dataFim);
            dataFimComHora.setHours(23, 59, 59, 999);
            if (new Date(log.timestamp) > dataFimComHora) {
                return false;
            }
        }

        // Filtro de usuário
        if (filtros.usuario && !log.usuario_email.toLowerCase().includes(filtros.usuario.toLowerCase())) {
            return false;
        }

        // Filtro de ação
        if (filtros.acao && log.acao !== filtros.acao) {
            return false;
        }

        // Busca geral
        if (filtros.busca) {
            const termo = filtros.busca.toLowerCase();
            const entidadeId = log.entidade_id || '';
            const dados = JSON.stringify([log.dados_anteriores, log.dados_novos]).toLowerCase();

            if (!entidadeId.toLowerCase().includes(termo) && !dados.includes(termo)) {
                return false;
            }
        }

        return true;
    });

    // Paginação
    const totalPaginas = Math.ceil(logsFiltrados.length / itensPorPagina);
    const indiceInicial = (paginaAtual - 1) * itensPorPagina;
    const logsPaginados = logsFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

    // Resetar página quando filtros mudarem
    useEffect(() => {
        setPaginaAtual(1);
    }, [filtros]);

    // Exportar logs para CSV
    const exportarCSV = () => {
        const headers = ['Timestamp', 'Usuário', 'Ação', 'Entidade Tipo', 'Entidade ID', 'IP', 'User Agent'];
        const linhas = logsFiltrados.map(log => [
            format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
            log.usuario_email,
            log.acao,
            log.entidade_tipo || '',
            log.entidade_id || '',
            log.ip_address || '',
            log.user_agent || ''
        ]);

        const csv = [headers, ...linhas].map(linha => linha.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `logs_auditoria_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Obter cor da ação
    const getCorAcao = (acao) => {
        if (acao.includes('CRIAR')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (acao.includes('EDITAR')) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (acao.includes('DELETAR')) return 'bg-rose-100 text-rose-700 border-rose-200';
        if (acao.includes('LOGIN')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
        if (acao.includes('LOGOUT')) return 'bg-slate-100 text-slate-700 border-slate-200';
        return 'bg-amber-100 text-amber-700 border-amber-200';
    };

    // Verificar permissão
    if (!podeAcessar('logs', 'visualizar')) {
        return (
            <LayoutAdministrativo titulo="Logs de Auditoria" subtitulo="Acompanhamento de ações administrativas">
                <div className="flex flex-col items-center justify-center p-16 text-center">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={32} className="text-rose-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Acesso Negado</h3>
                    <p className="text-sm text-slate-500 max-w-md">
                        Você não tem permissão para visualizar os logs de auditoria. Apenas administradores e coordenadores podem acessar esta página.
                    </p>
                </div>
            </LayoutAdministrativo>
        );
    }

    const AcoesHeader = (
        <button
            onClick={exportarCSV}
            disabled={logsFiltrados.length === 0}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition font-bold shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
        >
            <Download size={20} />
            <span className="tracking-wide">Exportar CSV</span>
        </button>
    );

    return (
        <LayoutAdministrativo titulo="Logs de Auditoria" subtitulo="Acompanhamento de ações administrativas" acoes={AcoesHeader}>
            {carregando ? (
                <div className="p-8 text-center text-slate-500 animate-pulse text-sm">Carregando logs...</div>
            ) : (
                <div className="space-y-6">
                    {/* Filtros */}
                    <div className="bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter size={18} className="text-slate-500" />
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Filtros</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Data Início */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Data Início
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="date"
                                        value={filtros.dataInicio}
                                        onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Data Fim */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Data Fim
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="date"
                                        value={filtros.dataFim}
                                        onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Usuário */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Usuário
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Filtrar por email..."
                                        value={filtros.usuario}
                                        onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Ação */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Ação
                                </label>
                                <div className="relative">
                                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <select
                                        value={filtros.acao}
                                        onChange={(e) => setFiltros({ ...filtros, acao: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Todas as ações</option>
                                        {Object.values(ACOES_AUDITORIA).map(acao => (
                                            <option key={acao} value={acao}>{acao.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Busca Geral */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Busca Geral
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Buscar em IDs, dados..."
                                        value={filtros.busca}
                                        onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Resumo de Filtros */}
                        {(filtros.dataInicio || filtros.dataFim || filtros.usuario || filtros.acao || filtros.busca) && (
                            <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                                <p className="text-xs text-slate-500">
                                    <span className="font-bold text-slate-700">{logsFiltrados.length}</span> logs encontrados
                                </p>
                                <button
                                    onClick={() => setFiltros({ dataInicio: '', dataFim: '', usuario: '', acao: '', busca: '' })}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    Limpar filtros
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Lista de Logs */}
                    {logsFiltrados.length === 0 ? (
                        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-16 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-sm">
                                <FileText size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-700">Nenhum log encontrado</h3>
                            <p className="text-xs text-slate-400 max-w-xs mt-1 mx-auto">
                                {logs.length === 0
                                    ? 'Ainda não há logs de auditoria registrados.'
                                    : 'Nenhum log corresponde aos filtros aplicados.'}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50/50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-left">
                                                Data/Hora
                                            </th>
                                            <th className="p-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-left">
                                                Usuário
                                            </th>
                                            <th className="p-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-left">
                                                Ação
                                            </th>
                                            <th className="p-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-left">
                                                Entidade
                                            </th>
                                            <th className="p-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-left">
                                                IP
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {logsPaginados.map((log, index) => (
                                            <tr
                                                key={log.id}
                                                className="hover:bg-slate-50/50 transition-colors"
                                                style={{ animationDelay: `${index * 0.03}s` }}
                                            >
                                                <td className="p-4">
                                                    <div className="text-xs font-bold text-slate-700">
                                                        {format(new Date(log.timestamp), 'dd/MM/yyyy', { locale: ptBR })}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-mono">
                                                        {format(new Date(log.timestamp), 'HH:mm:ss', { locale: ptBR })}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-xs font-bold text-slate-700">
                                                        {log.usuario_email}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border ${getCorAcao(log.acao)}`}>
                                                        {log.acao.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-xs font-bold text-slate-700 capitalize">
                                                        {log.entidade_tipo || '—'}
                                                    </div>
                                                    {log.entidade_id && (
                                                        <div className="text-xs text-slate-400 font-mono">
                                                            {log.entidade_id}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-xs text-slate-400 font-mono">
                                                        {log.ip_address || '—'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginação */}
                            {totalPaginas > 1 && (
                                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="text-slate-500">
                                        Mostrando <span className="font-bold text-slate-700">{indiceInicial + 1}-{Math.min(indiceInicial + itensPorPagina, logsFiltrados.length)}</span> de <span className="font-bold text-slate-700">{logsFiltrados.length}</span>
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                                            disabled={paginaAtual === 1}
                                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold"
                                        >
                                            Anterior
                                        </button>
                                        <span className="px-3 py-1.5 text-slate-600">
                                            Página <span className="font-bold text-slate-700">{paginaAtual}</span> de <span className="font-bold text-slate-700">{totalPaginas}</span>
                                        </span>
                                        <button
                                            onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                                            disabled={paginaAtual === totalPaginas}
                                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold"
                                        >
                                            Próxima
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </LayoutAdministrativo>
    );
}
