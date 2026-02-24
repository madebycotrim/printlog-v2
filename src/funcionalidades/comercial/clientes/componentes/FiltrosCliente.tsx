import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { OrdenacaoCliente } from "../tipos";

interface FiltrosClienteProps {
    ordenacaoAtual: OrdenacaoCliente;
    aoOrdenar: (ordenacao: OrdenacaoCliente) => void;
    ordemInvertida: boolean;
    aoInverterOrdem: () => void;
}

export function FiltrosCliente({
    ordenacaoAtual,
    aoOrdenar,
    ordemInvertida,
    aoInverterOrdem,
}: FiltrosClienteProps) {
    const [selectAberto, definirSelectAberto] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const opcoesOrdenacao: { valor: OrdenacaoCliente; rotulo: string }[] = [
        { valor: "RECENTE", rotulo: "Data de Cadastro" },
        { valor: "NOME", rotulo: "Ordem Alfabética" },
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
        <div className="flex flex-col md:flex-row gap-4 items-center justify-end mb-8">

            {/* Ordenação (Igual a Materiais) */}
            <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                    onClick={aoInverterOrdem}
                    title={ordemInvertida ? "Ordem Descendente" : "Ordem Ascendente"}
                    className={`w-11 h-11 flex items-center justify-center transition-all focus:outline-none border-b-2 ${ordemInvertida
                        ? "border-[var(--cor-primaria)] text-[var(--cor-primaria)] bg-[var(--cor-primaria)]/5"
                        : "border-gray-200 dark:border-white/10 text-gray-400 dark:text-zinc-500 hover:border-gray-300 dark:hover:border-white/20 bg-transparent"
                        }`}
                >
                    <ArrowUpDown size={16} className={`transition-transform duration-300 ${ordemInvertida ? "rotate-180" : ""}`} />
                </button>

                <div className="relative" ref={selectRef}>
                    <button
                        onClick={() => definirSelectAberto(!selectAberto)}
                        className={`h-11 px-4 text-sm font-medium bg-transparent border-b-2 flex items-center justify-between gap-3 min-w-[220px] transition-all outline-none ${selectAberto
                            ? "border-[var(--cor-primaria)] text-gray-900 dark:text-white"
                            : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-white/20"
                            }`}
                    >
                        {opcaoSelecionada.rotulo}
                        <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform duration-200 ${selectAberto ? "rotate-180 text-[var(--cor-primaria)]" : ""}`}
                        />
                    </button>

                    {selectAberto && (
                        <div className="absolute top-full right-0 w-full mt-1 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 py-1">
                            {opcoesOrdenacao.map((opcao) => (
                                <button
                                    key={opcao.valor}
                                    onClick={() => {
                                        aoOrdenar(opcao.valor);
                                        definirSelectAberto(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${ordenacaoAtual === opcao.valor
                                        ? "text-white font-medium"
                                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5"
                                        }`}
                                    style={ordenacaoAtual === opcao.valor ? { backgroundColor: "var(--cor-primaria)" } : {}}
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
