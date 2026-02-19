import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Printer,
    Package,
    FolderKanban,
    Users,
    Wallet,
    LogOut,
    Settings,
    X,
    Moon,
    Sun,
    Calculator,
    Layers,
    HelpCircle,
} from 'lucide-react';
import { usarAutenticacao } from '@/funcionalidades/autenticacao/contexto/ContextoAutenticacao';
import { usarContextoTema } from '@/compartilhado/tema/tema_provider';

type PropriedadesBarraLateral = {
    abertaMobile?: boolean;
    aoFechar?: () => void;
};

type ItemNavegacao = {
    nome: string;
    icone: React.ElementType;
    caminho: string;
    exato?: boolean;
};

type GrupoNavegacao = {
    titulo: string;
    itens: ItemNavegacao[];
};

export function BarraLateral({ abertaMobile = false, aoFechar }: PropriedadesBarraLateral) {
    const localizacao = useLocation();
    const { usuario, sair } = usarAutenticacao();
    const { modo_tema, alternar_tema } = usarContextoTema();

    const grupos: GrupoNavegacao[] = [
        {
            titulo: 'Geral',
            itens: [
                { nome: 'Dashboard', icone: LayoutDashboard, caminho: '/dashboard', exato: true },
                { nome: 'Calculadora', icone: Calculator, caminho: '/calculadora' },
            ]
        },
        {
            titulo: 'Produção',
            itens: [
                { nome: 'Projetos', icone: FolderKanban, caminho: '/projetos' },
                { nome: 'Impressoras', icone: Printer, caminho: '/impressoras' },
                { nome: 'Materiais', icone: Package, caminho: '/materiais' },
                { nome: 'Insumos', icone: Layers, caminho: '/insumos' },
            ]
        },
        {
            titulo: 'Comercial',
            itens: [
                { nome: 'Clientes', icone: Users, caminho: '/clientes' },
                { nome: 'Financeiro', icone: Wallet, caminho: '/financeiro' },
            ]
        },
        {
            titulo: 'Sistema',
            itens: [
                { nome: 'Configurações', icone: Settings, caminho: '/configuracoes' },
                { nome: 'Ajuda', icone: HelpCircle, caminho: '/central-maker' },
            ]
        }
    ];

    function itemAtivo(caminho: string, exato?: boolean) {
        return exato ? localizacao.pathname === caminho : localizacao.pathname.startsWith(caminho);
    }

    const classesContainer = `
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-white dark:bg-[#020202]
        border-r border-gray-200 dark:border-white/[0.06]
        transition-transform duration-300 ease-in-out md:translate-x-0
        ${abertaMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        md:static md:shadow-none
    `;

    return (
        <>
            {abertaMobile && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={aoFechar}
                />
            )}

            <aside className={classesContainer}>
                {/* Grade de fundo */}
                <div className="absolute inset-0 pointer-events-none z-0 bg-grid-sidebar opacity-[0.2] dark:opacity-[0.2]" />

                <div className="relative z-10 flex flex-col h-full">

                    {/* Cabeçalho */}
                    <div className="h-24 flex items-center justify-center gap-2">
                        <img src="/logo-colorida.png" alt="PrintLog" className="relative w-8 h-8 object-contain" />


                        <div className="flex flex-col justify-center gap-0.5">
                            <div className="flex items-center gap-2">
                                {/* Texto PRINTLOG com Gradiente Metálico (Dark) / Sólido (Light) */}
                                <span className="text-xl font-black tracking-wider text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-gray-500 drop-shadow-sm">
                                    PRINTLOG
                                </span>

                            </div>
                        </div>

                        {aoFechar && (
                            <button onClick={aoFechar} className="md:hidden ml-auto text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Navegação */}
                    <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-hide">
                        {grupos.map((grupo) => (
                            <div key={grupo.titulo}>
                                <div className="flex items-center gap-3 px-3 mb-2 mt-4 first:mt-0">
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                                        {grupo.titulo}
                                    </span>
                                    <div className="h-px w-full bg-gray-200 dark:bg-white/[0.1]" />
                                </div>
                                <div className="space-y-0.5">
                                    {grupo.itens.map((item) => {
                                        const ativo = itemAtivo(item.caminho, item.exato);
                                        return (
                                            <Link
                                                key={item.caminho}
                                                to={item.caminho}
                                                onClick={() => aoFechar?.()}
                                                className={`
                                                    group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative
                                                    ${ativo
                                                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200'
                                                    }
                                                `}
                                            >
                                                {/* Indicador Lateral Ativo */}
                                                {ativo && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 dark:bg-blue-500 rounded-r-full" />
                                                )}

                                                <item.icone
                                                    size={18}
                                                    strokeWidth={ativo ? 2.5 : 2}
                                                    className={`transition-colors ${ativo ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'}`}
                                                />
                                                <span className={ativo ? 'font-semibold' : ''}>
                                                    {item.nome}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Rodapé */}
                    <div className="border-t border-gray-100 dark:border-white/[0.06] p-3 space-y-1">
                        <button
                            onClick={alternar_tema}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        >
                            {modo_tema === 'CLARO' ? <Moon size={17} className="text-gray-400" /> : <Sun size={17} className="text-gray-400" />}
                            {modo_tema === 'CLARO' ? 'Modo Escuro' : 'Modo Claro'}
                        </button>

                        <div className="flex items-center gap-3 px-3 py-2 mt-1">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0 overflow-hidden">
                                {usuario?.fotoUrl
                                    ? <img src={usuario.fotoUrl} alt="Avatar" className="h-full w-full object-cover" />
                                    : usuario?.nome?.charAt(0).toUpperCase()
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                                    {usuario?.nome?.split(' ')[0]}
                                </p>
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                                    {usuario?.email}
                                </p>
                            </div>
                            <button
                                onClick={sair}
                                title="Sair"
                                className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
