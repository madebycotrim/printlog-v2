import { History, DollarSign, Package, Box } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Insumo, RegistroMovimentacaoInsumo } from "@/funcionalidades/producao/insumos/tipos";

interface ModalHistoricoInsumoProps {
    aberto: boolean;
    aoFechar: () => void;
    insumo: Insumo | null;
}

export function ModalHistoricoInsumo({
    aberto,
    aoFechar,
    insumo,
}: ModalHistoricoInsumoProps) {
    if (!insumo) return null;

    const registros = insumo.historico || [];

    const totalSaidas = registros
        .filter((r) => r.tipo === "Saída")
        .reduce((acc, r) => acc + r.quantidade, 0);

    const valorTotalEntradas = registros
        .filter((r) => r.tipo === "Entrada" && r.valorTotal)
        .reduce((acc, r) => acc + (r.valorTotal || 0), 0);

    const formatarData = (dataISO: string) => {
        const data = new Date(dataISO);
        return data.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Dialogo
            aberto={aberto}
            aoFechar={aoFechar}
            titulo="Histórico de Movimentações"
            larguraMax="max-w-2xl"
        >
            <div className="flex flex-col h-[600px] max-h-[80vh] bg-white dark:bg-[#18181b]">
                {/* Cabeçalho — Identificação do Insumo */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-200 dark:from-[#18181b] dark:to-[#121214] border border-gray-200/60 dark:border-white/5 flex items-center justify-center shrink-0 shadow-inner text-gray-500 dark:text-zinc-600">
                            <Box size={28} strokeWidth={1.5} />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">
                                {insumo.nome}
                            </h3>
                            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 truncate">
                                {insumo.categoria} {insumo.marca ? `• ${insumo.marca}` : ""}
                            </p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <span className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest block mb-1">
                                Custo Médio
                            </span>
                            <span className="text-sm font-black text-gray-900 dark:text-white">
                                {insumo.custoMedioUnidade.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/{insumo.unidadeMedida.toLowerCase()}
                            </span>
                        </div>
                    </div>

                    {/* Mini Dashboard — 2 KPIs */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-gray-200 dark:border-white/5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Package size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest block">
                                    Consumo Total
                                </span>
                                <span className="text-lg font-black text-gray-900 dark:text-white">
                                    {totalSaidas} <span className="text-sm font-bold text-gray-400">{insumo.unidadeMedida}</span>
                                </span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-gray-200 dark:border-white/5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <DollarSign size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest block">
                                    Valor Investido
                                </span>
                                <span className="text-lg font-black text-gray-900 dark:text-white">
                                    {valorTotalEntradas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Registros (Timeline) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-1">
                    <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                        <History size={14} className="text-gray-400" />
                        Histórico de Movimentações
                    </h4>

                    {registros.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Package size={32} strokeWidth={1.5} className="text-gray-300 dark:text-zinc-700 mb-3" />
                            <span className="text-sm font-medium text-gray-400 dark:text-zinc-500">
                                Nenhuma movimentação registrada até o momento.
                            </span>
                        </div>
                    ) : (
                        registros.map((registro: RegistroMovimentacaoInsumo) => {
                            const ehEntrada = registro.tipo === "Entrada";
                            return (
                                <div
                                    key={registro.id}
                                    className="relative pl-6 pb-5 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[2px] before:bg-gray-100 dark:before:bg-white/5 last:before:hidden group"
                                >
                                    {/* Dot da Timeline */}
                                    <div
                                        className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-[#18181b] flex items-center justify-center ${ehEntrada ? "bg-emerald-500" : "bg-amber-500"}`}
                                    />

                                    {/* Card do Registro */}
                                    <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 rounded-xl p-4 transition-colors group-hover:border-gray-300 dark:group-hover:border-white/10 ml-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                            <div className="space-y-1.5 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest leading-none ${ehEntrada
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                                        }`}>
                                                        {ehEntrada ? "Entrada" : "Saída"}
                                                    </span>
                                                    {registro.motivo && (
                                                        <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400">
                                                            {registro.motivo}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 block">
                                                    {formatarData(registro.data)}
                                                </span>
                                                {registro.observacao && (
                                                    <p className="text-xs text-gray-500 dark:text-zinc-500 italic mt-1">
                                                        "{registro.observacao}"
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center sm:items-end flex-col justify-center sm:justify-start bg-white dark:bg-[#18181b] sm:bg-transparent px-3 py-2 sm:p-0 rounded-lg sm:rounded-none border sm:border-transparent border-gray-200 dark:border-white/5 shrink-0">
                                                <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
                                                    Quantidade
                                                </span>
                                                <span className={`text-sm font-black mt-0.5 ${ehEntrada ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                                    {ehEntrada ? "+" : "-"}{registro.quantidade} {insumo.unidadeMedida}
                                                </span>
                                                {registro.valorTotal && registro.valorTotal > 0 && (
                                                    <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-500 mt-0.5">
                                                        {registro.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-white/5 flex justify-center bg-gray-50/50 dark:bg-[#0e0e11]/50 rounded-b-xl">
                    <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500">
                        Os registros são criados ao dar baixa ou repor estoque.
                    </span>
                </div>
            </div>
        </Dialogo>
    );
}
