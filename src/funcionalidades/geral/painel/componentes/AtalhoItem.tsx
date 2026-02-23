import { LucideIcon } from "lucide-react";

interface AtalhoItemProps {
    titulo: string;
    icone: LucideIcon;
    cor: string;
    link: string;
}

export function AtalhoItem({ titulo, icone: Icone, cor, link }: AtalhoItemProps) {
    return (
        <button
            onClick={() => window.location.href = link}
            className="flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group w-full"
        >
            <div className={`p-3 rounded-2xl ${cor} text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                <Icone size={20} />
            </div>
            <span className="font-black text-xs uppercase tracking-tight text-zinc-900 dark:text-white leading-tight text-left">
                {titulo}
            </span>
        </button>
    );
}
