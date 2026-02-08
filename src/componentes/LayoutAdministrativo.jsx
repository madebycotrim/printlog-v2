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
    Shield
} from 'lucide-react';

export default function LayoutAdministrativo({ children, titulo, subtitulo, acoes }) {
    const { usuarioAtual, sair } = usarAutenticacao();
    const navegar = useNavigate();
    const localizacao = useLocation();
    const [menuAberto, definirMenuAberto] = useState(false);

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
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Overlay Mobile */}
            {menuAberto && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => definirMenuAberto(false)}
                />
            )}

            {/* Sidebar - Theme: Midnight Blue (Login match) */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#050b1f] text-white transform transition-transform duration-300 ease-in-out flex flex-col
                ${menuAberto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header da Sidebar */}
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                            <Shield className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-black text-2xl tracking-tighter leading-none">SCAE<span className="text-blue-500">.</span></h1>
                            <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Admin</p>
                        </div>
                    </div>

                    {/* Menu de Navegação */}
                    <nav className="space-y-2">
                        {itensMenu.map((item) => {
                            const ativo = localizacao.pathname === item.rota;
                            return (
                                <button
                                    key={item.rota}
                                    onClick={() => navegar(item.rota)}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                        ${ativo
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                            : 'text-blue-100/60 hover:bg-white/5 hover:text-white'
                                        }
                                    `}
                                >
                                    <item.icone
                                        size={20}
                                        className={ativo ? 'text-white' : 'text-blue-400/50 group-hover:text-blue-400'}
                                    />
                                    <span className="font-medium text-sm tracking-wide">{item.texto}</span>
                                    {ativo && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer da Sidebar (User) */}
                <div className="mt-auto p-6 border-t border-white/5 bg-[#030714]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
                            <div className="w-full h-full rounded-full bg-[#050b1f] flex items-center justify-center overflow-hidden">
                                {usuarioAtual?.photoURL ? (
                                    <img src={usuarioAtual.photoURL} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-xs">{usuarioAtual?.email?.[0]?.toUpperCase()}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-white">{usuarioAtual?.displayName || 'Usuário'}</p>
                            <p className="text-[10px] text-blue-400 truncate">{usuarioAtual?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={aoSair}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-xs font-bold uppercase tracking-wider"
                    >
                        <LogOut size={14} /> Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
                {/* Topbar Mobile */}
                <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="text-blue-600 w-6 h-6" />
                        <span className="font-black text-slate-800">SCAE</span>
                    </div>
                    <button onClick={() => definirMenuAberto(true)} className="p-2 text-slate-600">
                        <Menu />
                    </button>
                </header>

                {/* Área de Scroll */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-8 lg:p-12">
                        {/* Header da Página */}
                        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-[fadeInDown_0.5s_ease-out]">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{titulo}</h2>
                                {subtitulo && <p className="text-slate-500 mt-1">{subtitulo}</p>}
                            </div>
                            {acoes && (
                                <div className="flex items-center gap-3">
                                    {acoes}
                                </div>
                            )}
                        </header>

                        {/* Injeção de Conteúdo */}
                        <div className="animate-[fadeIn_0.5s_ease-out_0.2s_both]">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
