import { useState, useEffect } from "react";
import { PackagePlus, Save, AlertCircle } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Material } from "../tipos";

interface ModalReposicaoEstoqueProps {
    aberto: boolean;
    aoFechar: () => void;
    aoConfirmar: (quantidadeNovos: number, precoTotalNovaCompra: number) => void;
    material: Material | null;
}

export function ModalReposicaoEstoque({
    aberto,
    aoFechar,
    aoConfirmar,
    material,
}: ModalReposicaoEstoqueProps) {
    const [quantidade, definirQuantidade] = useState<string>("1");
    const [precoUnidade, definirPrecoUnidade] = useState<string>("");
    const [erro, definirErro] = useState<string | null>(null);

    useEffect(() => {
        if (aberto && material) {
            definirQuantidade("1");
            // Pre-preenche com o preço atual unitário
            definirPrecoUnidade(material.preco.toString());
            definirErro(null);
        }
    }, [aberto, material]);

    if (!material) return null;

    const numQtd = parseInt(quantidade);
    const numPreco = Number(precoUnidade.replace(",", "."));
    const precoTotalNovo = numQtd * numPreco;

    // Simulando Preço Médio
    const unidadeStr = material.tipo === "SLA" ? "ml" : "g";
    const estoqueEmUsoFracao = material.pesoRestante / material.peso;
    const estoqueTotalAtualFract = material.estoque + estoqueEmUsoFracao;
    const valorTotalAtual = estoqueTotalAtualFract * material.preco;

    const novoEstoqueTotalFract = estoqueTotalAtualFract + (numQtd || 0);
    const novoValorTotal = valorTotalAtual + (precoTotalNovo || 0);
    const novoPrecoMedioUnitario = novoValorTotal / (novoEstoqueTotalFract || 1);


    const lidarComEnvio = (e: React.FormEvent) => {
        e.preventDefault();

        if (isNaN(numQtd) || numQtd <= 0) {
            definirErro("Digite uma quantidade válida (min 1).");
            return;
        }

        if (isNaN(numPreco) || numPreco < 0) {
            definirErro("Digite um valor numérico válido para o preço.");
            return;
        }

        aoConfirmar(numQtd, precoTotalNovo);
    };

    return (
        <Dialogo
            aberto={aberto}
            aoFechar={aoFechar}
            titulo="Repor Estoque Rápidamente"
            larguraMax="max-w-md"
        >
            <form onSubmit={lidarComEnvio} className="flex flex-col bg-white dark:bg-[#18181b]">
                <div className="p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#18181b] flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0">
                            <PackagePlus size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-100">{material.nome}</h4>
                            <p className="text-xs font-semibold text-indigo-600/80 dark:text-indigo-400/80">Estoque atual: {material.estoque} lacrados</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                                Quantidade Adquirida
                            </label>
                            <input
                                autoFocus
                                type="number"
                                min="1"
                                step="1"
                                value={quantidade}
                                onChange={(e) => {
                                    definirQuantidade(e.target.value);
                                    if (erro) definirErro(null);
                                }}
                                className={`w-full h-12 px-4 text-base font-black bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${erro ? "border-red-500" : "border-gray-200 dark:border-white/5"} focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-gray-900 dark:text-white outline-none transition-all no-spinner`}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
                                Preço Unitário (R$)
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={precoUnidade}
                                onChange={(e) => {
                                    definirPrecoUnidade(e.target.value);
                                    if (erro) definirErro(null);
                                }}
                                className={`w-full h-12 px-4 text-base font-black bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${erro ? "border-red-500" : "border-gray-200 dark:border-white/5"} focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-gray-900 dark:text-white outline-none transition-all no-spinner`}
                            />
                        </div>
                    </div>

                    {erro && (
                        <span className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                            <AlertCircle size={12} /> {erro}
                        </span>
                    )}

                    {/* Simulador de Preço Médio */}
                    {numQtd > 0 && numPreco >= 0 && !erro && (
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 mt-4 space-y-3">
                            <h5 className="text-[10px] uppercase font-black tracking-widest text-gray-500 dark:text-zinc-500">Recálculo de Custos</h5>

                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="text-gray-600 dark:text-zinc-400">Preço Atual / {material.peso}{unidadeStr}</span>
                                <span className="text-gray-900 dark:text-white">R$ {material.preco.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="text-gray-600 dark:text-zinc-400">Novo Preço Médio (Custo Real)</span>
                                <span className={`${novoPrecoMedioUnitario > material.preco ? 'text-rose-500' : novoPrecoMedioUnitario < material.preco ? 'text-emerald-500' : 'text-gray-900 dark:text-white'} font-black`}>
                                    R$ {novoPrecoMedioUnitario.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                </div>

                <div className="p-5 md:p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-[#0e0e11]/50 flex items-center justify-end gap-3 rounded-br-xl">
                    <button
                        type="button"
                        onClick={aoFechar}
                        className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!!erro || !quantidade || !precoUnidade}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Save size={18} strokeWidth={2.5} />
                        Confirmar Reposição
                    </button>
                </div>
            </form>
        </Dialogo>
    );
}
