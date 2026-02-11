import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../contexts/ContextoAutenticacao';
import {
    LayoutDashboard,
    Users,
    FileText,
    LogOut,
    Menu,
    Shield,
    IdCard,
    QrCode,
    Layers
} from 'lucide-react';

export default function LayoutAdministrativo({ children, titulo, subtitulo, acoes }) {
    const { usuarioAtual, sair } = useAutenticacao();
    const navegar = useNavigate();
    const localizacao = useLocation();
    const [menuAberto, definirMenuAberto] = useState(false);

    const itensMenu = [
        { icone: LayoutDashboard, texto: 'Painel', rota: '/painel' },
        { icone: Users, texto: 'Alunos', rota: '/alunos' },
        { icone: Layers, texto: 'Turmas', rota: '/turmas' },
        { icone: FileText, texto: 'Relatórios', rota: '/relatorios' },
    ];

    const aoSair = async () => {
        try {
            await sair();
            navegar('/login');
        } catch (erro) {
            console.error('Erro ao sair', erro);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Overlay Mobile */}
            {menuAberto && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => definirMenuAberto(false)}
                />
            )}

            {/* Sidebar - Theme: Midnight Blue & Premium Glass */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#050b1f] text-slate-300 flex flex-col border-r border-white/5 transition-transform duration-300 ease-in-out
                ${menuAberto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header: Brand Identity */}
                <div className="p-8 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-inner border border-white/10">
                                <Shield className="text-white w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <h1 className="font-black text-2xl text-white tracking-tighter leading-none">SCAE<span className="text-blue-500">.</span></h1>
                            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">CEM 03 Taguatinga</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Menu Principal</p>
                    {itensMenu.map((item) => {
                        const ativo = localizacao.pathname === item.rota;
                        return (
                            <button
                                key={item.rota}
                                onClick={() => {
                                    navegar(item.rota);
                                    definirMenuAberto(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                                    ${ativo
                                        ? 'bg-gradient-to-r from-blue-500/10 to-transparent text-blue-400'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                {/* Active Indicator (Left Border) */}
                                {ativo && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div>
                                )}

                                <item.icone
                                    size={20}
                                    className={`transition-colors ${ativo ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}
                                />
                                <span className="font-medium text-sm tracking-wide">{item.texto}</span>
                            </button>
                        );
                    })}

                    <div className="my-6 border-t border-white/5 mx-2"></div>

                    <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Operacional</p>
                    <button
                        onClick={() => navegar('/portaria')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-400 group relative"
                    >
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <QrCode size={20} className="transition-colors group-hover:text-emerald-400" />
                        <span className="font-medium text-sm tracking-wide">Portaria (Leitor)</span>
                    </button>
                </nav>

                {/* Footer: User Profile Card */}
                <div className="p-4 mt-auto">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-3 flex items-center gap-3 group hover:bg-white/10 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-[#050b1f] flex items-center justify-center overflow-hidden border border-white/10">
                            <img
                                src={usuarioAtual?.photoURL || `https://ui-avatars.com/api/?name=${usuarioAtual?.email}&background=0D8ABC&color=fff`}
                                alt="User"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-white group-hover:text-blue-200 transition-colors">{usuarioAtual?.displayName || 'Admin'}</p>
                            <p className="text-[10px] text-slate-500 truncate group-hover:text-slate-400 transition-colors">{usuarioAtual?.email}</p>
                        </div>
                        <button
                            onClick={aoSair}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                            title="Sair"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside >

            {/* Conteúdo Principal */}
            < main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fafc] w-full" >
                {/* Topbar Mobile (Apenas Mobile) - Ajustado z-index */}
                < header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm z-30 flex-shrink-0" >
                    <div className="flex items-center gap-2">
                        <Shield className="text-blue-600 w-6 h-6" />
                        <span className="font-black text-slate-800 tracking-tight">SCAE</span>
                    </div>
                    <button onClick={() => definirMenuAberto(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                        <Menu />
                    </button>
                </header >

                {/* Área de Scroll - Altura total menos mobile header se visível */}
                < div className="flex-1 overflow-y-auto scroll-smooth" >
                    <div className="max-w-[1600px] mx-auto p-6 lg:p-10 pb-20">
                        {/* Header da Página */}
                        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-[fadeInDown_0.4s_ease-out]">
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
                        </header>

                        {/* Injeção de Conteúdo */}
                        <div className="animate-[fadeIn_0.5s_ease-out_0.3s_both]">
                            {children}
                        </div>
                    </div>
                </div >
            </main >
        </div >
    );
}
