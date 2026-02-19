import { Database, HardDrive, Trash2 } from "lucide-react";

export function CartaoArmazenamento() {
    return (
        <div className="bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Armazenamento</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">
                        Banco de Dados & Cache
                    </p>
                </div>
                <div className="flex gap-1">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                        <Database size={16} />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-gray-400">
                            <HardDrive size={12} />
                            ESPAÇO UTILIZADO
                        </span>
                        <span className="text-gray-900 dark:text-white">0.0%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[1%] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    </div>
                    <p className="text-[10px] text-gray-400 text-right">
                        127 KB de 512 MB
                    </p>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors uppercase tracking-wide">
                    <Trash2 size={14} />
                    Limpar Cache
                </button>
            </div>
        </div>
    );
}
