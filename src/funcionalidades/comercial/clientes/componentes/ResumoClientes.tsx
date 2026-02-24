import { Cliente } from "../tipos";
import { UserPlus, Package, Users, BoxSelect } from "lucide-react";

interface ResumoClientesProps {
    clientes: Cliente[];
}

export function ResumoClientes({ clientes }: ResumoClientesProps) {
    const total = clientes.length;

    // Novos Clientes este mês
    const novosEsteMes = clientes.filter((c) => {
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        return new Date(c.dataCriacao) >= inicioMes;
    }).length;

    // Volume de Produção Total
    const totalPecas = clientes.reduce((acc, c) => acc + (c.totalProdutos || 0), 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {/* Clientes Total */}
            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    <Users size={24} strokeWidth={2} />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1">
                        Clientes Total
                    </h4>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {total}{" "}
                        <span className="text-base font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider">
                            na base
                        </span>
                    </span>
                </div>
                <Users
                    className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/5"
                    size={100}
                    strokeWidth={1}
                />
            </div>

            {/* Expansão da Base */}
            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center border border-sky-100 dark:border-sky-500/20 text-sky-600 dark:text-sky-400">
                    <UserPlus size={24} strokeWidth={2} />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1">
                        {novosEsteMes === 1 ? "Novo Cliente" : "Novos Clientes"}
                    </h4>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {novosEsteMes}{" "}
                        <span className="text-base font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider">
                            este mês
                        </span>
                    </span>
                </div>
                <UserPlus
                    className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/5"
                    size={100}
                    strokeWidth={1}
                />
            </div>

            {/* Volume de Peças */}
            <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center border border-violet-100 dark:border-violet-500/20 text-violet-600 dark:text-violet-400">
                    <Package size={24} strokeWidth={2} />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1">
                        {Math.abs(totalPecas) === 1 ? "Peça Entregue" : "Peças Entregues"}
                    </h4>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {totalPecas}{" "}
                        <span className="text-base font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wider">
                            total
                        </span>
                    </span>
                </div>
                <Package
                    className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/5"
                    size={100}
                    strokeWidth={1}
                />
            </div>

            {/* Placeholder / Mais Indicadores em Breve */}
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
