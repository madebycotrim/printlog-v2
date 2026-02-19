import { AlertTriangle, Trash2 } from "lucide-react";

export function CartaoZonaPerigo() {
    return (
        <div className="col-span-1 lg:col-span-1 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/5 rounded-2xl p-6 border-l-4 border-l-red-600 relative overflow-hidden">
            {/* Red Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Zona de Perigo</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">
                        Ações Irreversíveis
                    </p>
                </div>
                <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                    <AlertTriangle size={20} />
                </div>
            </div>

            <div className="space-y-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    A exclusão da conta removerá permanentemente todos os seus dados, configurações e históricos de impressão. <strong className="text-red-500">Esta ação não pode ser desfeita.</strong>
                </p>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                    <div className="p-2 bg-white dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                        <Trash2 size={16} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                            Excluir Conta Permanentemente
                        </p>
                        <p className="text-[10px] text-red-500/80">
                            Esta ação não pode ser desfeita
                        </p>
                    </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all text-xs font-bold uppercase tracking-wide transform active:scale-[0.98]">
                    <Trash2 size={14} />
                    Excluir Minha Conta
                </button>
            </div>
        </div>
    );
}
