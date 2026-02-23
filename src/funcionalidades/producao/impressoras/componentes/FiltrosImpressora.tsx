import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { TecnologiaImpressora } from "@/funcionalidades/producao/impressoras/tipos";

export type OrdenacaoImpressora = "NOME" | "MAIOR_HORIMETRO" | "MENOR_HORIMETRO" | "MAIOR_VALOR" | "RECENTES";

interface FiltrosImpressoraProps {
    filtroAtual: TecnologiaImpressora | "Todas";
    aoFiltrar: (filtro: TecnologiaImpressora | "Todas") => void;
    ordenacaoAtual: OrdenacaoImpressora;
    aoOrdenar: (ordenacao: OrdenacaoImpressora) => void;
    ordemInvertida: boolean;
    aoInverterOrdem: () => void;
}

export function FiltrosImpressora({
    filtroAtual,
    aoFiltrar,
    ordenacaoAtual,
    aoOrdenar,
    ordemInvertida,
    aoInverterOrdem,
}: FiltrosImpressoraProps) {
    const [selectAberto, definirSelectAberto] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const opcoesOrdenacao: { valor: OrdenacaoImpressora; rotulo: string }[] = [
        { valor: "NOME", rotulo: "Ordem Alfabética" },
        { valor: "MAIOR_HORIMETRO", rotulo: "Maior Horímetro Total" },
        { valor: "MENOR_HORIMETRO", rotulo: "Menor Horímetro Total" },
        { valor: "MAIOR_VALOR", rotulo: "Maior Valor de Compra" },
        { valor: "RECENTES", rotulo: "Adicionadas Recentemente" },
    ];

    const opcaoSelecionada =
        opcoesOrdenacao.find((o) => o.valor === ordenacaoAtual) ||
        opcoesOrdenacao[0];

    useEffect(() => {
        function lidarComCliqueFora(event: MouseEvent) {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target as Node)
            ) {
                definirSelectAberto(false);
            }
        }
        document.addEventListener("mousedown", lidarComCliqueFora);
        return () => document.removeEventListener("mousedown", lidarComCliqueFora);
    }, []);

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 w-full">
            {/* Tabs de Filtro */}
            <div className="bg-transparent p-1 rounded-xl border border-gray-200 dark:border-white/10 inline-flex shadow-sm w-fit gap-1">
                <button
                    onClick={() => aoFiltrar("Todas")}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${filtroAtual === "Todas" ? "bg-gray-100 dark:bg-[#27272a] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
                >
                    Todas
                </button>
                <button
                    onClick={() => aoFiltrar("FDM")}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${filtroAtual === "FDM" ? "bg-gray-100 dark:bg-[#27272a] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
                >
                    Filamentos (FDM)
                </button>
                <button
                    onClick={() => aoFiltrar("SLA")}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${filtroAtual === "SLA" ? "bg-gray-100 dark:bg-[#27272a] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
                >
                    Resinas (SLA)
                </button>
            </div>

            <div className="flex-1 hidden xl:flex justify-center">
                {/* Espaço reservado onde ficava a temperatura no layout original, agora vazio para manter o alinhamento central caso necessário, ou pode ser removido e os itens realinhados */}
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-2">
                <button
                    onClick={aoInverterOrdem}
                    data-ativo={ordemInvertida}
                    title={ordemInvertida ? "Ordem Descendente" : "Ordem Ascendente"}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${ordemInvertida
                        ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-transparent border border-gray-200 dark:border-white/10 text-gray-400 dark:text-zinc-500 hover:border-gray-300 dark:hover:border-white/20"
                        }`}
                >
                    <ArrowUpDown size={16} className={`transition-transform duration-300 ${ordemInvertida ? "rotate-180" : ""}`} />
                </button>

                <div className="relative" ref={selectRef}>
                    <button
                        onClick={() => definirSelectAberto(!selectAberto)}
                        className={`h-10 px-4 text-sm font-medium bg-transparent border rounded-xl flex items-center justify-between gap-3 min-w-[240px] shadow-sm transition-all outline-none ${selectAberto
                            ? "border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500 dark:ring-emerald-500 text-gray-900 dark:text-white"
                            : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-white/20"
                            }`}
                    >
                        {opcaoSelecionada.rotulo}
                        <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform duration-200 ${selectAberto ? "rotate-180 text-emerald-500" : ""}`}
                        />
                    </button>

                    {selectAberto && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 py-1">
                            {opcoesOrdenacao.map((opcao) => (
                                <button
                                    key={opcao.valor}
                                    onClick={() => {
                                        aoOrdenar(opcao.valor);
                                        definirSelectAberto(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${ordenacaoAtual === opcao.valor
                                        ? "bg-emerald-600 text-white font-medium"
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
