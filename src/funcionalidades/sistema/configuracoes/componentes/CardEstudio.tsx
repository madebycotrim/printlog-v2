import { Beaker, Building2 } from "lucide-react";
import { CabecalhoCard } from "./Compartilhados";
import { usarEstudio } from "@/compartilhado/contextos/ContextoEstudio";

interface PropsCardEstudio {
    participarPrototipos: boolean;
    definirParticiparPrototipos: (v: boolean) => void;
    pendente?: boolean;
}

export function CardEstudio({
    participarPrototipos,
    definirParticiparPrototipos,
    pendente,
}: PropsCardEstudio) {
    const { estudioAtivo, estudios, definirEstudioAtivo } = usarEstudio();

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-indigo-500/[0.01] dark:from-indigo-500/[0.05] dark:to-indigo-500/[0.02] pointer-events-none" />
            <CabecalhoCard titulo="Estúdios e Recursos" descricao="Gerencie seu estúdio ativo e acesso ao programa Beta" icone={Building2} corIcone="text-indigo-500" pendente={pendente} />

            <div className="space-y-4">
                <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 ml-1">
                        Estúdio Ativo
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {estudios.map((estudio) => (
                            <button
                                key={estudio.id}
                                onClick={() => definirEstudioAtivo(estudio.id)}
                                className={`
                                    flex items-center gap-3 p-3 rounded-xl border text-sm transition-all text-left
                                    ${estudio.id === estudioAtivo?.id
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-500/50"
                                        : "border-gray-200 dark:border-white/10 bg-transparent text-gray-600 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-500/30"}
                                `}
                            >
                                <div className={`w-3 h-3 rounded-full shrink-0 ${estudio.id === estudioAtivo?.id ? "bg-indigo-500" : "bg-gray-300 dark:bg-zinc-700"}`} />
                                <span className="font-bold truncate">{estudio.nome}</span>
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-2 ml-1 leading-relaxed">
                        Ao mudar de estúdio, a aplicação será recarregada para garantir o isolamento total dos dados operacionais e financeiros (Multi-Tenant).
                    </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                    <label className="flex items-start gap-4 cursor-pointer group">
                        <div className="relative flex items-start mt-1 shrink-0">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={participarPrototipos}
                                onChange={(e) => definirParticiparPrototipos(e.target.checked)}
                            />
                            <div className="w-5 h-5 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all flex items-center justify-center">
                                <Beaker size={12} className={`text-white transition-transform ${participarPrototipos ? 'scale-100' : 'scale-0'}`} strokeWidth={3} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                Participar de Protótipos (Programa Beta)
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1 leading-relaxed">
                                Receba acesso antecipado a novas funcionalidades em fase de testes, como relatórios experimentais com IA e novas integrações (Fase 3). Pode apresentar instabilidades ocasionais.
                            </p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
}
