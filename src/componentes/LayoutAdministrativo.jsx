import { useState } from 'react';
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
    IdCard,
    QrCode,
    Layers,
    Key,
    Crown,
    TrendingUp
} from 'lucide-react';

export default function LayoutAdministrativo({ children, titulo, subtitulo, acoes }) {
    const { usuarioAtual, sair } = useAutenticacao();
    const { ehAdmin } = usePermissoes();
    const navegar = useNavigate();
    const localizacao = useLocation();
    const [menuAberto, definirMenuAberto] = useState(false);

    // Itens principais do menu (todos os usuários)
    const itensMenuPrincipal = [
        { icone: LayoutDashboard, texto: 'Painel', rota: '/painel' },
        { icone: Users, texto: 'Alunos', rota: '/alunos' },
        { icone: Layers, texto: 'Turmas', rota: '/turmas' },
        { icone: IdCard, texto: 'Crachás', rota: '/crachas' },
    ];

    // Itens exclusivos para ADMIN
    const itensMenuAdmin = [
        { icone: TrendingUp, texto: 'Dashboard Executivo', rota: '/painel-executivo' },
        { icone: Shield, texto: 'LGPD', rota: '/lgpd' },
        { icone: FileText, texto: 'Auditoria', rota: '/logs' },
        { icone: Key, texto: 'Chaves', rota: '/chaves' },
        { icone: Shield, texto: 'Usuários', rota: '/usuarios' },
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

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
                    flex flex-col shadow-2xl border-r border-slate-800/50
                    transform transition-transform duration-300 ease-in-out
                    ${menuAberto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Header/Logo */}
                <div className="p-6 border-b border-slate-800/50 bg-slate-950/30">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
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

                {/* Navigation Items - Principal */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {/* Seção Principal */}
                    <div className="mb-6">
                        <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                            Principal
                        </p>
                        {itensMenuPrincipal.map((item) => {
                            const Icone = item.icone;
                            const ativo = localizacao.pathname === item.rota;

                            return (
                                <button
                                    key={item.rota}
                                    onClick={() => {
                                        navegar(item.rota);
                                        definirMenuAberto(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${ativo
                                        ? 'bg-white text-slate-800 shadow-lg shadow-blue-600/10 font-bold'
                                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                                        }`}
                                >
                                    {ativo && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"></div>
                                    )}
                                    <Icone size={20} className={ativo ? 'text-blue-600' : ''} />
                                    <span className="text-sm tracking-wide">{item.texto}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Seção Administração - Apenas para ADMIN */}
                    {ehAdmin && (
                        <div className="pt-6 border-t border-slate-700/50">
                            <p className="px-3 text-[10px] font-black uppercase tracking-widest text-amber-400/80 mb-3 flex items-center gap-2">
                                <Crown size={12} className="text-amber-400" />
                                Administração
                            </p>
                            {itensMenuAdmin.map((item) => {
                                const Icone = item.icone;
                                const ativo = localizacao.pathname === item.rota;

                                return (
                                    <button
                                        key={item.rota}
                                        onClick={() => {
                                            navegar(item.rota);
                                            definirMenuAberto(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${ativo
                                            ? 'bg-amber-500/20 text-amber-100 shadow-lg shadow-amber-600/10 font-bold border border-amber-500/30'
                                            : 'text-slate-300 hover:bg-amber-500/10 hover:text-amber-100 hover:border hover:border-amber-500/20'
                                            }`}
                                    >
                                        {ativo && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r-full"></div>
                                        )}
                                        <Icone size={20} className={ativo ? 'text-amber-400' : 'text-amber-400/60'} />
                                        <span className="text-sm tracking-wide">{item.texto}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-slate-800/50 bg-slate-950/30">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {usuarioAtual?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{usuarioAtual?.email?.split('@')[0] || 'Usuário'}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                                {ehAdmin && <span className="text-amber-400 font-bold flex items-center gap-1"><Crown size={10} /> Admin</span>}
                                {!ehAdmin && 'Usuário'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={aoSair}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all duration-200 border border-red-500/20 hover:border-red-500/30 group"
                    >
                        <LogOut size={16} />
                        <span className="text-sm font-bold">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => definirMenuAberto(!menuAberto)}
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Menu size={24} className="text-slate-600" />
                        </button>

                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight">{titulo}</h1>
                            {subtitulo && <p className="text-xs text-slate-500 font-medium">{subtitulo}</p>}
                        </div>
                    </div>

                    {/* Actions */}
                    {acoes && <div className="flex items-center gap-3">{acoes}</div>}
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
