import { User } from "lucide-react";

export interface PropsCampo {
    label: string;
    valor: string;
    aoMudar: (v: string) => void;
    placeholder?: string;
    icone: typeof User;
}

export function CampoDashboard({ label, valor, aoMudar, placeholder, icone: Icone }: PropsCampo) {
    return (
        <div className="w-full">
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-gray-500 dark:text-zinc-500">{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icone size={16} />
                </span>
                <input
                    type="text"
                    value={valor}
                    onChange={(e) => aoMudar(e.target.value)}
                    placeholder={placeholder}
                    className="h-11 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] pl-10 pr-3 text-sm font-semibold text-gray-800 dark:text-zinc-200 outline-none focus:border-sky-500/50"
                />
            </div>
        </div>
    );
}

export interface PropsCabecalhoCard {
    titulo: string;
    descricao: string;
    icone: typeof User;
    corIcone: string;
    pendente?: boolean;
}

export function CabecalhoCard({ titulo, descricao, icone: Icone, corIcone, pendente }: PropsCabecalhoCard) {
    return (
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-white/10 shrink-0 relative">
            <span className="shrink-0 rounded-xl bg-gray-100 dark:bg-white/5 p-2.5">
                <Icone size={20} className={corIcone} />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <h2 className="truncate text-base md:text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none mb-1">{titulo}</h2>
                    {pendente && (
                        <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse mb-1 shrink-0" title="Alterações pendentes" />
                    )}
                </div>
                <p className="truncate text-xs text-gray-500 dark:text-zinc-500 leading-none">{descricao}</p>
            </div>
        </div>
    );
}
