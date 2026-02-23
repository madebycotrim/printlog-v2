import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CategoriaInsumo } from "@/funcionalidades/producao/insumos/tipos";
import { OrdenacaoInsumo } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";

interface FiltrosInsumoProps {
    filtroAtual: CategoriaInsumo | "Todas";
    aoFiltrar: (filtro: CategoriaInsumo | "Todas") => void;
    ordenacaoAtual: OrdenacaoInsumo;
    aoOrdenar: (ordenacao: OrdenacaoInsumo) => void;
    ordemInvertida: boolean;
    aoInverterOrdem: () => void;
}

const TABS_CATEGORIA: { valor: CategoriaInsumo | "Todas"; rotulo: string }[] = [
    { valor: "Todas", rotulo: "Todos" },
    { valor: "Limpeza", rotulo: "Limpeza" },
    { valor: "Embalagem", rotulo: "Embalagem" },
    { valor: "Fixação", rotulo: "Fixação" },
    { valor: "Eletrônica", rotulo: "Eletrônica" },
    { valor: "Acabamento", rotulo: "Acabamento" },
    { valor: "Geral", rotulo: "Geral" },
    { valor: "Outros", rotulo: "Outros" },
];

const OPCOES_ORDENACAO: { valor: OrdenacaoInsumo; rotulo: string }[] = [
    { valor: "nome", rotulo: "Ordem Alfabética" },
    { valor: "quantidade", rotulo: "Menor Estoque" },
    { valor: "custo", rotulo: "Maior Custo Unitário" },
    { valor: "atualizacao", rotulo: "Última Atualização" },
];

export function FiltrosInsumo({
    filtroAtual,
    aoFiltrar,
    ordenacaoAtual,
    aoOrdenar,
    ordemInvertida,
    aoInverterOrdem,
}: FiltrosInsumoProps) {
    const [selectAberto, definirSelectAberto] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const opcaoSelecionada =
        OPCOES_ORDENACAO.find((o) => o.valor === ordenacaoAtual) || OPCOES_ORDENACAO[0];

    useEffect(() => {
        function lidarComCliqueFora(event: MouseEvent) {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                definirSelectAberto(false);
            }
        }
        document.addEventListener("mousedown", lidarComCliqueFora);
        return () => document.removeEventListener("mousedown", lidarComCliqueFora);
    }, []);

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 w-full">
            {/* Tabs de Categoria */}
            <div className="bg-transparent p-1 rounded-xl border border-gray-200 dark:border-white/10 inline-flex shadow-sm w-fit gap-1 overflow-x-auto">
                {TABS_CATEGORIA.map((tab) => (
                    <button
                        key={tab.valor}
                        onClick={() => aoFiltrar(tab.valor)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${filtroAtual === tab.valor
                                ? "bg-gray-100 dark:bg-[#27272a] text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                            }`}
                    >
                        {tab.rotulo}
                    </button>
                ))}
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-2">
                <button
                    onClick={aoInverterOrdem}
                    data-ativo={ordemInvertida}
                    title={ordemInvertida ? "Ordem Descendente" : "Ordem Ascendente"}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 ${ordemInvertida
                            ? "bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-400"
                            : "bg-transparent border border-gray-200 dark:border-white/10 text-gray-400 dark:text-zinc-500 hover:border-gray-300 dark:hover:border-white/20"
                        }`}
                >
                    <ArrowUpDown size={16} className={`transition-transform duration-300 ${ordemInvertida ? "rotate-180" : ""}`} />
                </button>

                <div className="relative" ref={selectRef}>
                    <button
                        onClick={() => definirSelectAberto(!selectAberto)}
                        className={`h-10 px-4 text-sm font-medium bg-transparent border rounded-xl flex items-center justify-between gap-3 min-w-[220px] shadow-sm transition-all outline-none ${selectAberto
                                ? "border-sky-500 dark:border-sky-500 ring-1 ring-sky-500 dark:ring-sky-500 text-gray-900 dark:text-white"
                                : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-white/20"
                            }`}
                    >
                        {opcaoSelecionada.rotulo}
                        <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform duration-200 ${selectAberto ? "rotate-180 text-sky-500" : ""}`}
                        />
                    </button>

                    {selectAberto && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 py-1">
                            {OPCOES_ORDENACAO.map((opcao) => (
                                <button
                                    key={opcao.valor}
                                    onClick={() => {
                                        aoOrdenar(opcao.valor);
                                        definirSelectAberto(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${ordenacaoAtual === opcao.valor
                                            ? "bg-blue-600 text-white font-medium"
                                            : "text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                        }`}
                                >
                                    {opcao.rotulo}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
