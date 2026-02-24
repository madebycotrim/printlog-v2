import { Link, useLocation } from "react-router-dom";
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
    Calculator,
    Layers,
    HelpCircle,
} from "lucide-react";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contexto/ContextoAutenticacao";

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

export function BarraLateral({
    abertaMobile = false,
    aoFechar,
}: PropriedadesBarraLateral) {
    const localizacao = useLocation();
    const { usuario, sair } = usarAutenticacao();

    const lidarComSair = async () => {
        try {
            await sair();
            // Força um recarregamento total na Home para evitar que a RotaProtegida 
            // intercepte a navegação enquanto o estado do Firebase ainda está sendo limpo.
            window.location.href = "/";
        } catch (erro) {
            console.error("Erro ao realizar logout:", erro);
        }
    };

    const grupos: GrupoNavegacao[] = [
        {
            titulo: "Geral",
            itens: [
                {
                    nome: "Dashboard",
                    icone: LayoutDashboard,
                    caminho: "/dashboard",
                    exato: true,
                },
                { nome: "Calculadora", icone: Calculator, caminho: "/calculadora" },
            ],
        },
        {
            titulo: "Produção",
            itens: [
                { nome: "Projetos", icone: FolderKanban, caminho: "/projetos" },
                { nome: "Impressoras", icone: Printer, caminho: "/impressoras" },
                { nome: "Materiais", icone: Package, caminho: "/materiais" },
                { nome: "Insumos", icone: Layers, caminho: "/insumos" },
            ],
        },
        {
            titulo: "Comercial",
            itens: [
                { nome: "Clientes", icone: Users, caminho: "/clientes" },
                { nome: "Financeiro", icone: Wallet, caminho: "/financeiro" },
            ],
        },
        {
            titulo: "Sistema",
            itens: [
                { nome: "Configurações", icone: Settings, caminho: "/configuracoes" },
                { nome: "Central Maker", icone: HelpCircle, caminho: "/central-maker" },
            ],
        },
    ];

    function itemAtivo(caminho: string, exato?: boolean) {
        return exato
            ? localizacao.pathname === caminho
            : localizacao.pathname.startsWith(caminho);
    }

    const classesContainer = `
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-white dark:bg-[#020202]
        border-r border-gray-200 dark:border-white/[0.06]
        transition-transform duration-300 ease-in-out md:translate-x-0
        ${abertaMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
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
                {/* Grade Discreta Maior (Estilo Blueprint Dinâmico + Máscara de Desvanecimento) */}
                <div
                    className="absolute inset-0 pointer-events-none z-[1] bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)]"
                    style={{
                        backgroundSize: "32px 32px",
                        maskImage: "linear-gradient(to bottom, black 5%, transparent 95%)",
                        WebkitMaskImage: "linear-gradient(to bottom, black 5%, transparent 95%)"
                    }}
                />

                <div className="relative z-10 flex flex-col h-full">
                    {/* Cabeçalho */}
                    <div className="h-24 flex items-center justify-center gap-3">
                        <img
                            src="/logo-colorida.png"
                            alt="PrintLog"
                            className="relative w-8 h-8 object-contain"
                        />

                        <div className="flex flex-col justify-center gap-0.5">
                            {/* Texto PRINTLOG com Gradiente Metálico (Dark) / Sólido (Light) */}
                            <span className="text-xl font-black tracking-wider text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-gray-500 drop-shadow-sm">
                                PRINTLOG
                            </span>
                        </div>

                        {aoFechar && (
                            <button
                                onClick={aoFechar}
                                className="md:hidden ml-auto text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Navegação */}
                    <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-hide">
                        {grupos.map((grupo) => (
                            <div key={grupo.titulo}>
                                <div className="flex items-center gap-3 px-3 mb-3 mt-5 first:mt-0">
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                        {grupo.titulo}
                                    </span>
                                    {/* Linha Divisória de Categoria mais detalhada e visível */}
                                    <div className="flex-1 flex items-center h-[1px] bg-gradient-to-r from-gray-200 via-gray-200/50 to-transparent dark:from-white/[0.15] dark:via-white/[0.08] dark:to-transparent">
                                        <div className="w-[3px] h-[3px] rounded-full bg-gray-300 dark:bg-zinc-500 -ml-[1px]" />
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    {grupo.itens.map((item) => {
                                        const ativo = itemAtivo(item.caminho, item.exato);
                                        return (
                                            <Link
                                                key={item.caminho}
                                                to={item.caminho}
                                                onClick={() => aoFechar?.()}
                                                style={
                                                    ativo
                                                        ? {
                                                            backgroundColor: "rgb(var(--cor-primaria-rgb) / 0.12)",
                                                            color: "var(--cor-primaria)",
                                                        }
                                                        : undefined
                                                }
                                                className={`
                                                    group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden
                                                    ${ativo
                                                        ? ""
                                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-gray-200"
                                                    }
                                                `}
                                            >
                                                {/* Indicador Lateral Ativo (Barra sky igual botões principais) */}
                                                {ativo && (
                                                    <div
                                                        className="absolute left-0 top-0 bottom-0 w-[3px]"
                                                        style={{ backgroundColor: "var(--cor-primaria)" }}
                                                    />
                                                )}

                                                {/* O padding extra no icone qdo ativo afasta ele da barra */}
                                                <div
                                                    className={`flex items-center justify-center transition-all ${ativo ? "pl-2" : ""}`}
                                                >
                                                    <item.icone
                                                        size={18}
                                                        strokeWidth={ativo ? 2.5 : 2}
                                                        style={ativo ? { color: "var(--cor-primaria)" } : undefined}
                                                        className={`transition-colors ${ativo ? "" : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"}`}
                                                    />
                                                </div>
                                                <span
                                                    className={ativo ? "font-bold tracking-tight" : ""}
                                                >
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
                        <div className="flex items-center gap-3 px-3 py-2 mt-1">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0 overflow-hidden">
                                {usuario?.fotoUrl ? (
                                    <img
                                        src={usuario.fotoUrl}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    usuario?.nome?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                                    {usuario?.ehAnonimo ? "Convidado" : usuario?.nome?.split(" ")[0] || "Usuário"}
                                </p>
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                                    {usuario?.ehAnonimo ? "Conta temporária" : usuario?.email}
                                </p>
                            </div>
                            <button
                                onClick={lidarComSair}
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
