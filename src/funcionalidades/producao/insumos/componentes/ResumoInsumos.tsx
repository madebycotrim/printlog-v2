import {
    Box,
    AlertTriangle,
    DollarSign,
    BoxSelect
} from "lucide-react";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";

interface ResumoInsumosProps {
    insumos: Insumo[];
    totalItensUnicos: number;
    valorInvestido: number;
    alertasBaixoEstoque: number;
}

export function ResumoInsumos({
    totalItensUnicos,
    valorInvestido,
    alertasBaixoEstoque,
}: ResumoInsumosProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

            {/* Card 1: Total em Estoque */}
            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center border border-sky-100 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 relative z-10">
                    <Box size={24} strokeWidth={2} />
                </div>
                <div className="relative z-10">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1">
                        Insumos Cadastrados
                    </h4>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {totalItensUnicos}{" "}
                        <span className="text-base font-semibold text-gray-400 dark:text-zinc-600">
                            tipos
                        </span>
                    </span>
                </div>
                <Box
                    className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/5"
                    size={100}
                    strokeWidth={1}
                />
            </div>

            {/* Card 2: Valor Investido */}
            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 relative z-10">
                    <DollarSign size={24} strokeWidth={2} />
                </div>
                <div className="relative z-10">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1">
                        Valor Distribuído
                    </h4>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {valorInvestido.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        })}
                    </span>
                </div>
                <DollarSign
                    className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/5"
                    size={100}
                    strokeWidth={1}
                />
            </div>

            {/* Card 3: Alertas de Estoque */}
            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden">
                <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border relative z-10 ${alertasBaixoEstoque > 0 ? "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 dark:text-zinc-500"}`}
                >
                    <AlertTriangle size={24} strokeWidth={2} />
                </div>
                <div className="relative z-10">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1">
                        Alertas de Estoque
                    </h4>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {alertasBaixoEstoque}{" "}
                        <span className="text-base font-semibold text-gray-400 dark:text-zinc-600">
                            itens baixos
                        </span>
                    </span>
                </div>
                <AlertTriangle
                    className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/5"
                    size={100}
                    strokeWidth={1}
                />
            </div>

            {/* Card 4: Placeholder/Acesso Futuro (Mesmo tamanho dos outros) */}
            <div
                className="bg-white dark:bg-[#18181b] border border-gray-200 border-dashed dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center justify-center gap-5 relative overflow-hidden group cursor-not-allowed transition-colors"
                role="button"
                tabIndex={0}
                title="Em breve novos indicadores"
            >
                <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-zinc-600 opacity-50 relative z-10">
                    <BoxSelect size={24} strokeWidth={1.5} />
                    <span className="text-[10px] font-bold tracking-widest uppercase">Mais Indicadores em Breve</span>
                </div>
            </div>

        </div>
    );
}
