import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usarAutenticacao } from '../contexts/ContextoAutenticacao';
import {
    LayoutDashboard,
    Users,
    FileText,
    LogOut,
    Menu,
    X,
    Shield,
    Bell
} from 'lucide-react';

export default function LayoutAdministrativo({ children, titulo, subtitulo, acoes }) {
    const { usuarioAtual, sair } = usarAutenticacao();
    const navegar = useNavigate();
    const localizacao = useLocation();
    const [menuMobileAberto, definirMenuMobileAberto] = useState(false);

    const itensMenu = [
        { icone: LayoutDashboard, texto: 'Painel', rota: '/painel' },
        { icone: Users, texto: 'Alunos', rota: '/alunos' },
        { icone: FileText, texto: 'Relatórios', rota: '/relatorios' },
        // Adicionar mais rotas conforme necessário
    ];

    const aoSair = async () => {
        try {
            await sair();
            navegar('/');
        } catch (erro) {
            console.error('Erro ao sair', erro);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">

            {/* TOP NAVIGATION HEADER (Midnight Blue) */}
            <header className="bg-[#050b1f] text-white shadow-lg z-50 flex-shrink-0">
                <div className="max-w-[1920px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">

                    {/* Logo & Brand */}
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
                                <Shield className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="font-black text-xl tracking-tighter leading-none">SCAE<span className="text-blue-500">.</span></h1>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {itensMenu.map((item) => {
                                const ativo = localizacao.pathname === item.rota;
                                return (
                                    <button
                                        key={item.rota}
                                        onClick={() => navegar(item.rota)}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-bold tracking-wide
                                            ${ativo
                                                ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <item.icone size={18} className={ativo ? 'text-blue-400' : ''} />
                                        {item.texto}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right Side: User & Actions */}
                    <div className="flex items-center gap-6">
                        {/* Notifications (Mock) */}
                        <button className="text-slate-400 hover:text-white transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="h-6 w-px bg-white/10 hidden lg:block"></div>

                        {/* User Profile */}
                        <div className="hidden lg:flex items-center gap-3">
                            <div className="text-right hidden xl:block">
                                <p className="text-sm font-bold text-white leading-none">{usuarioAtual?.displayName || 'Usuário'}</p>
                                <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wider mt-0.5">Administrador</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
                                <img
                                    src={usuarioAtual?.photoURL || `https://ui-avatars.com/api/?name=${usuarioAtual?.email}&background=0D8ABC&color=fff`}
                                    alt="User"
                                    className="w-full h-full rounded-full object-cover border-2 border-[#050b1f]"
                                />
                            </div>
                            <button
                                onClick={aoSair}
                                className="p-2 text-slate-400 hover:text-red-400 transition-colors bg-white/5 hover:bg-white/10 rounded-lg ml-2"
                                title="Sair do Sistema"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2 text-white"
                            onClick={() => definirMenuMobileAberto(!menuMobileAberto)}
                        >
                            {menuMobileAberto ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Dropdown */}
            {menuMobileAberto && (
                <div className="lg:hidden bg-[#0a1125] border-t border-white/5 absolute top-16 left-0 w-full z-40 shadow-2xl animate-[slideDown_0.2s_ease-out]">
                    <div className="p-4 space-y-2">
                        {itensMenu.map((item) => {
                            const ativo = localizacao.pathname === item.rota;
                            return (
                                <button
                                    key={item.rota}
                                    onClick={() => {
                                        navegar(item.rota);
                                        definirMenuMobileAberto(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all
                                        ${ativo ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                                    `}
                                >
                                    <item.icone size={20} />
                                    {item.texto}
                                </button>
                            );
                        })}
                        <div className="h-px bg-white/10 my-2"></div>
                        <button
                            onClick={aoSair}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut size={20} />
                            Sair do Sistema
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-[#f8fafc] scroll-smooth">
                <div className="max-w-[1920px] mx-auto p-6 lg:p-10">

                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-[fadeInDown_0.4s_ease-out]">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight lg:text-4xl">{titulo}</h2>
                            {subtitulo && (
                                <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                                    {subtitulo}
                                </p>
                            )}
                        </div>
                        {acoes && (
                            <div className="flex items-center gap-3 animate-[fadeIn_0.5s_ease-out_0.2s_both]">
                                {acoes}
                            </div>
                        )}
                    </div>

                    {/* Content Injection */}
                    <div className="animate-[fadeIn_0.5s_ease-out_0.3s_both]">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
