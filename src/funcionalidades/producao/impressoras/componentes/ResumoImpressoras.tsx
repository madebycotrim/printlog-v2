import {
    Printer,
    Timer,
    Wrench,
    DollarSign,
} from "lucide-react";

interface ResumoImpressorasProps {
    totalMaquinas: number;
    horasImpressao: number;
    emManutencao: number;
    valorInvestido: number;
}

export function ResumoImpressoras({
    totalMaquinas,
    horasImpressao,
    emManutencao,
    valorInvestido,
}: ResumoImpressorasProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {/* Card 1: Total de Máquinas */}
            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center border border-sky-100 dark:border-sky-500/20 text-sky-600 dark:text-sky-400">
                    <Printer size={24} strokeWidth={2} />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1">
                        Total de Máquinas
                    </h4>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {totalMaquinas}{" "}
                        <span className="text-base font-semibold text-gray-400 dark:text-zinc-600">
                            unid.
                        </span>
                    </span>
                </div>
                <Printer
                    className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/5"
                    size={100}
                    strokeWidth={1}
                />
            </div>

            {/* Card 2: Horas de Impressão */}
            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Timer size={24} strokeWidth={2} />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1">
                        Horas de Impressão
                    </h4>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {horasImpressao.toLocaleString("pt-BR")}{" "}
                        <span className="text-base font-semibold text-gray-400 dark:text-zinc-600">
                            h
                        </span>
                    </span>
                </div>
                <Timer
                    className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/5"
                    size={100}
                    strokeWidth={1}
                />
            </div>

            {/* Card 3: Valor Investido */}
            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    <DollarSign size={24} strokeWidth={2} />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1">
                        Valor Investido
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

            {/* Card 4: Em Manutenção */}
            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden">
                <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${emManutencao > 0
                        ? "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 dark:text-zinc-500"
                        }`}
                >
                    <Wrench size={24} strokeWidth={2} />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1">
                        Em Manutenção
                    </h4>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {emManutencao}{" "}
                        <span className="text-base font-semibold text-gray-400 dark:text-zinc-600">
                            paradas
                        </span>
                    </span>
                </div>
                <Wrench
                    className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/5"
                    size={100}
                    strokeWidth={1}
                />
            </div>
        </div>
    );
}
