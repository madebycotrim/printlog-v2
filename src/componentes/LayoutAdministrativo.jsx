import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../contexts/ContextoAutenticacao';
import { usePermissoes } from '../contexts/ContextoPermissoes';
import {
    LayoutDashboard,
    Users,
    FileText,
    LogOut,
    Menu,
    Shield,
    Layers,
    Crown,
    RefreshCw,
    Search,
    Bell,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Lock
} from 'lucide-react';
import { servicoSincronizacao } from '../servicos/sincronizacao';
import toast from 'react-hot-toast';

function BotaoSincronizar({ minimizado }) {
    const [sincronizando, definirSincronizando] = useState(false);
    const [status, definirStatus] = useState(null); // 'sucesso' | 'erro' | null

    const handleSync = async () => {
        if (sincronizando) return;
        definirSincronizando(true);
        definirStatus(null);
        const toastId = toast.loading('Sincronizando dados...');

        try {
            await servicoSincronizacao.sincronizarTudo();
            definirStatus('sucesso');
            toast.success('Sincronização concluída!', { id: toastId });
            setTimeout(() => definirStatus(null), 3000);
        } catch (erro) {
            console.error('Erro ao sincronizar:', erro);
            definirStatus('erro');
            toast.error('Erro ao sincronizar dados', { id: toastId });
            setTimeout(() => definirStatus(null), 3000);
        } finally {
            definirSincronizando(false);
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={sincronizando}
            className={`
                group relative flex items-center justify-center transition-all duration-300 rounded-xl border
                ${minimizado
                    ? 'w-10 h-10 p-0 mx-auto'
                    : 'w-full gap-2.5 px-4 py-3'
                }
                ${status === 'sucesso'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : status === 'erro'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-slate-800/30 hover:bg-indigo-500/10 border-slate-800 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-300'
                }
            `}
            title={minimizado ? "Sincronizar Dados" : ""}
        >
            <RefreshCw
                size={18}
                className={`transition-all ${sincronizando ? 'animate-spin text-indigo-400' : 'group-hover:rotate-180'}`}
            />
            {!minimizado && (
                <span className="text-sm font-semibold truncate">
                    {sincronizando ? 'Sincronizando...' :
                        status === 'sucesso' ? 'Sincronizado!' :
                            status === 'erro' ? 'Erro no Sync' :
                                'Sincronizar Dados'}
                </span>
            )}
        </button>
    );
}

export default function LayoutAdministrativo({ children, titulo, subtitulo, acoes }) {
    const { usuarioAtual, sair } = useAutenticacao();
    const { ehAdmin } = usePermissoes();
    const navegar = useNavigate();
    const localizacao = useLocation();

    // Estado do Sidebar
    const [sidebarAberto, definirSidebarAberto] = useState(true); // Mobile
    const [sidebarMinimizado, definirSidebarMinimizado] = useState(() => {
        return localStorage.getItem('sidebarMinimizado') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sidebarMinimizado', sidebarMinimizado);
    }, [sidebarMinimizado]);

    // Fechar sidebar mobile ao navegar
    useEffect(() => {
        if (window.innerWidth < 1024) {
            definirSidebarAberto(false);
        }
    }, [localizacao, navegar]);

    // Itens principais do menu
    const itensMenuPrincipal = [
        { icone: LayoutDashboard, texto: 'Painel', rota: '/painel' },
        { icone: Users, texto: 'Alunos', rota: '/alunos' },
        { icone: Layers, texto: 'Turmas', rota: '/turmas' },
        { icone: FileText, texto: 'Relatórios', rota: '/relatorios' },


    ];

    // Itens exclusivos para ADMIN
    const itensMenuAdmin = [

        { icone: FileText, texto: 'Logs de Auditoria', rota: '/logs' },
        { icone: Shield, texto: 'Usuários do Sistema', rota: '/usuarios' },
    ];

    const aoSair = async () => {
        try {
            await sair();
            navegar('/login');
            toast.success('Você saiu do sistema');
        } catch (erro) {
            console.error('Erro ao sair', erro);
            toast.error('Erro ao realizar logout');
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-900">
            {/* Overlay Mobile */}
            {sidebarAberto && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => definirSidebarAberto(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    bg-[#0f172a] border-r border-slate-800
                    flex flex-col transition-all duration-300 ease-in-out shadow-2xl
                    ${sidebarAberto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${sidebarMinimizado ? 'lg:w-[88px]' : 'lg:w-72'}
                    w-72
                `}
            >
                {/* Logo Section */}
                <div className={`
                    h-20 flex items-center border-b border-slate-800/50 relative
                    ${sidebarMinimizado ? 'justify-center px-0' : 'justify-between px-6'}
                `}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative group shrink-0">
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                            <div className="relative w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center shadow-inner border border-indigo-500/20 backdrop-blur-sm">
                                <ShieldCheck className="text-indigo-400 w-6 h-6" />
                            </div>
                        </div>

                        {!sidebarMinimizado && (
                            <div className="flex flex-col animate-fade-in">
                                <h1 className="font-bold text-xl text-white tracking-tight leading-none flex items-center">
                                    SCAE<span className="text-indigo-400">.</span>
                                </h1>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">CEM 03 TAGUATINGA</p>
                            </div>
                        )}
                    </div>

                    {/* Toggle Button (Desktop only) */}
                    <button
                        onClick={() => definirSidebarMinimizado(!sidebarMinimizado)}
                        className={`
                            absolute -right-3 top-1/2 -translate-y-1/2 
                            w-6 h-6 bg-slate-800 border border-slate-700 rounded-full 
                            flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500
                            transition-all shadow-lg z-50 hidden lg:flex
                        `}
                    >
                        {sidebarMinimizado ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className={`
                    flex-1 overflow-y-auto overflow-x-hidden py-6 
                    scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent
                    ${sidebarMinimizado ? 'px-3' : 'px-4'}
                `}>
                    {/* Principal */}
                    <div className="mb-8">
                        {!sidebarMinimizado && (
                            <p className="px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 animate-fade-in">
                                Principal
                            </p>
                        )}
                        <div className="space-y-1.5">
                            {itensMenuPrincipal.map((item) => {
                                const Icone = item.icone;
                                const ativo = localizacao.pathname.startsWith(item.rota);

                                return (
                                    <button
                                        key={item.rota}
                                        onClick={() => navegar(item.rota)}
                                        className={`
                                            w-full flex items-center relative group transition-all duration-200
                                            ${sidebarMinimizado ? 'justify-center p-2.5 rounded-lg' : 'gap-3 px-3 py-2.5 rounded-r-lg rounded-l-sm mx-0 w-full'}
                                            ${ativo
                                                ? 'bg-gradient-to-r from-indigo-500/20 to-transparent text-white border-l-2 border-indigo-500'
                                                : 'text-slate-400 hover:text-indigo-300 hover:bg-white/5 border-l-2 border-transparent'
                                            }
                                        `}
                                        title={sidebarMinimizado ? item.texto : ""}
                                    >
                                        <Icone
                                            size={20}
                                            className={`transition-transform duration-300 ${ativo ? '' : 'group-hover:scale-110'}`}
                                            strokeWidth={ativo ? 2.5 : 2}
                                        />

                                        {!sidebarMinimizado && (
                                            <span className={`text-sm tracking-tight ${ativo ? 'font-bold' : 'font-medium'}`}>
                                                {item.texto}
                                            </span>
                                        )}

                                        {/* Active Indicator Bar */}

                                        {ativo && sidebarMinimizado && (
                                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-400 rounded-r-full"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Admin Section */}
                    {ehAdmin && (
                        <div>
                            {!sidebarMinimizado && (
                                <div className="flex items-center gap-3 px-4 mb-4 mt-6 animate-fade-in">
                                    <div className="h-px flex-1 bg-slate-800"></div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Admin</span>
                                    <div className="h-px flex-1 bg-slate-800"></div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                {itensMenuAdmin.map((item) => {
                                    const Icone = item.icone;
                                    const ativo = localizacao.pathname === item.rota;

                                    return (
                                        <button
                                            key={item.rota}
                                            onClick={() => navegar(item.rota)}
                                            className={`
                                                w-full flex items-center relative group transition-all duration-200
                                                ${sidebarMinimizado ? 'justify-center p-2.5 rounded-lg' : 'gap-3 px-3 py-2.5 rounded-r-lg rounded-l-sm mx-0 w-full'}
                                                ${ativo
                                                    ? 'bg-gradient-to-r from-violet-500/20 to-transparent text-white border-l-2 border-violet-500'
                                                    : 'text-slate-400 hover:text-violet-300 hover:bg-white/5 border-l-2 border-transparent'
                                                }
                                            `}
                                            title={sidebarMinimizado ? item.texto : ""}
                                        >
                                            <Icone
                                                size={20}
                                                className={`transition-transform duration-300 ${ativo ? '' : 'group-hover:scale-110'}`}
                                                strokeWidth={ativo ? 2.5 : 2}
                                            />
                                            {!sidebarMinimizado && (
                                                <span className={`text-sm tracking-tight ${ativo ? 'font-bold' : 'font-medium'}`}>
                                                    {item.texto}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </nav>

                {/* Footer User Profile */}
                <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
                    <div className={`flex items-center ${sidebarMinimizado ? 'justify-center flex-col gap-4' : 'gap-3.5 mb-4 px-2'}`}>
                        <div className="relative group cursor-pointer">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-inner ring-1 ring-white/10 group-hover:ring-indigo-500/50 transition-all">
                                {usuarioAtual?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                        </div>

                        {!sidebarMinimizado && (
                            <div className="flex-1 min-w-0 animate-fade-in">
                                <p className="text-sm font-bold text-white truncate">
                                    {usuarioAtual?.email?.split('@')[0] || 'Usuário'}
                                </p>
                                <p className="text-xs text-slate-500 truncate" title={usuarioAtual?.email}>
                                    {usuarioAtual?.email}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className={`mt-2 ${sidebarMinimizado ? 'flex flex-col gap-3 items-center' : 'space-y-2'}`}>
                        <BotaoSincronizar minimizado={sidebarMinimizado} />

                        <button
                            onClick={aoSair}
                            className={`
                                group flex items-center justify-center transition-all duration-200 border
                                bg-slate-800/30 hover:bg-rose-500/10 border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400
                                ${sidebarMinimizado ? 'w-10 h-10 rounded-xl p-0' : 'w-full gap-2.5 px-4 py-3 rounded-xl'}
                            `}
                            title={sidebarMinimizado ? "Sair" : ""}
                        >
                            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                            {!sidebarMinimizado && <span className="text-sm font-semibold">Sair</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => definirSidebarAberto(!sidebarAberto)}
                            className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="animate-slide-up">
                            <h1 className="text-xl font-black text-slate-800 tracking-tight">{titulo}</h1>
                            {subtitulo && <p className="text-xs text-slate-500 font-medium hidden sm:block">{subtitulo}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Bar - Hidden on small screens */}
                        <div className="hidden md:flex items-center relative group">
                            <Search className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-200 border rounded-full text-sm w-48 focus:w-64 transition-all outline-none"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-200 mx-1"></div>

                        {/* Actions Container */}
                        {acoes && <div className="flex items-center gap-3 animate-fade-in">{acoes}</div>}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
