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
            <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 ml-1">
                {label}
            </label>
            <div className="relative group">
                <div className="absolute inset-0 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-200/50 dark:border-white/[0.05] group-focus-within:border-[var(--cor-primaria)] group-focus-within:bg-white dark:group-focus-within:bg-white/[0.04] transition-all duration-300 shadow-sm group-focus-within:shadow-md" />
                <div className="relative h-12 w-full flex items-center px-4 gap-3">
                    <Icone size={18} className="text-gray-400 dark:text-zinc-600 group-focus-within:text-[var(--cor-primaria)] transition-colors duration-300 shrink-0" />
                    <input
                        type="text"
                        value={valor}
                        onChange={(e) => aoMudar(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent text-sm font-bold text-gray-800 dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-zinc-800"
                    />
                </div>
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

export interface PropriedadesSecaoConfiguracao {
    titulo: string;
    descricao?: string;
    children: React.ReactNode;
    semBorda?: boolean;
}

export const SecaoConfiguracao = ({ titulo, descricao, children, semBorda = false }: PropriedadesSecaoConfiguracao) => (
    <div className={`py-6 space-y-4 ${!semBorda ? 'border-b border-borda-sutil' : ''}`}>
        <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{titulo}</h3>
            {descricao && <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">{descricao}</p>}
        </div>
        {children}
    </div>
);

export function CabecalhoCard({ titulo, descricao, icone: Icone, corIcone, pendente }: PropsCabecalhoCard) {
    return (
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-white/10 shrink-0 relative">
            <span className="shrink-0 rounded-xl bg-gray-100 dark:bg-white/5 p-2.5 transform group-hover:rotate-6 transition-transform">
                <Icone size={20} className={corIcone} />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <h2 className="truncate text-base font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none mb-1">{titulo}</h2>
                    {pendente && (
                        <span
                            className="w-2 h-2 rounded-full animate-pulse mb-1 shrink-0"
                            style={{ backgroundColor: "var(--cor-primaria)" }}
                            title="Alterações pendentes"
                        />
                    )}
                </div>
                <p className="truncate text-xs text-gray-500 dark:text-zinc-500 leading-none">{descricao}</p>
            </div>
        </div>
    );
}
