import { Database, User, PackageSearch, Activity, DollarSign, Download } from "lucide-react";
import { CabecalhoCard } from "./Compartilhados";

export function CardMetricas() {
    return (
        <div className="h-full rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-card-fundo p-4 md:p-5 flex flex-col gap-4">
            <CabecalhoCard titulo="Métricas e Sistema" descricao="Resumo do estúdio e exportação" icone={Database} corIcone="text-cyan-500" />
            <div className="grid grid-cols-5 gap-1.5">
                {[
                    { val: "12", lab: "Clientes", icone: User, cor: "text-sky-500", fundo: "bg-sky-500/10" },
                    { val: "24", lab: "Filamentos", icone: Database, cor: "text-violet-500", fundo: "bg-violet-500/10" },
                    { val: "8", lab: "Insumos", icone: PackageSearch, cor: "text-amber-500", fundo: "bg-amber-500/10" },
                    { val: "5", lab: "Máquinas", icone: Activity, cor: "text-emerald-500", fundo: "bg-emerald-500/10" },
                    { val: "42", lab: "Projetos", icone: DollarSign, cor: "text-rose-500", fundo: "bg-rose-500/10" },
                ].map((item) => (
                    <div key={item.lab} className="rounded-xl border border-gray-200 dark:border-white/10 py-2 bg-gray-50/70 dark:bg-white/[0.02] flex flex-col items-center justify-center text-center">
                        <span className={`rounded-lg p-1.5 ${item.fundo} ${item.cor} mb-1.5`}>
                            <item.icone size={13} />
                        </span>
                        <p className="text-base font-black text-gray-900 dark:text-white leading-none">{item.val}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] font-black text-gray-500 dark:text-zinc-500 truncate w-full px-1">{item.lab}</p>
                    </div>
                ))}
            </div>

            <div className="mt-auto bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 p-3 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 shrink-0">
                        <Download size={15} />
                    </span>
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-900 dark:text-white leading-tight">Cópia e Portabilidade</p>
                        <p className="text-[11px] text-gray-500 dark:text-zinc-500 leading-tight">Exerça seu direito (Art. 18, V)</p>
                    </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                    {["PLANILHA (CSV)", "PDF", "JSON"].map((tipo) => (
                        <button key={tipo} className="h-8 px-3 rounded-lg bg-white dark:bg-card-fundo border border-gray-200 dark:border-white/10 text-[10px] font-black uppercase text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm">
                            {tipo}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
