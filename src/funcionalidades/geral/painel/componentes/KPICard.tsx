import { LucideIcon } from "lucide-react";

interface KPICardProps {
    titulo: string;
    valor: string | number;
    subteste: string;
    icone: LucideIcon;
    cor: string;
}

export function KPICard({ titulo, valor, subteste, icone: Icone, cor }: KPICardProps) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 ${cor}`}>
                    <Icone size={24} />
                </div>
            </div>
            <h4 className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">{titulo}</h4>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-zinc-900 dark:text-white">{valor}</span>
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-tight mt-2">{subteste}</p>
        </div>
    );
}
