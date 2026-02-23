import { ChevronDown, Headphones, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";

interface FAQ {
    pergunta: string;
    resposta: string;
}

interface Propriedades {
    faqs: FAQ[];
    aoAbrirSuporte?: () => void;
}

export function SecaoFAQ({ faqs, aoAbrirSuporte }: Propriedades) {
    const [indiceAtivo, definirIndiceAtivo] = useState<number | null>(null);

    const alternarFaq = (i: number) => {
        definirIndiceAtivo(indiceAtivo === i ? null : i);
    };

    return (
        <div className="pt-20 border-t border-gray-100 dark:border-white/[0.04]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                {/* COLUNA TÉCNICA (SIDEBAR) - DESIGN REFINADO */}
                <div className="lg:col-span-4 space-y-10 lg:sticky lg:top-8">
                    <div className="space-y-6">
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-900 dark:text-white leading-[0.85]">
                            Dúvidas<br />
                            <span className="text-sky-500">Recorrentes.</span>
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-zinc-500 font-medium leading-relaxed max-w-xs">
                            Base de conhecimento dinâmica para otimização de frotas 3D e processos de manufatura.
                        </p>
                    </div>

                    {/* CANAL DE SUPORTE CARD - AGORA MAIS ELEGANTE */}
                    <div className="relative group p-8 rounded-[40px] bg-white dark:bg-card-fundo border border-gray-100 dark:border-white/[0.04] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-sky-500/10 transition-colors" />

                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
                                <Headphones size={22} strokeWidth={2.5} />
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white">Não encontrou sua resposta?</h4>
                                <p className="text-[12px] font-medium text-gray-500 dark:text-zinc-400 leading-relaxed">
                                    Inicie um ticket de suporte prioritário para análise técnica individualizada.
                                </p>
                            </div>

                            <button
                                onClick={aoAbrirSuporte}
                                className="w-full h-12 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl dark:shadow-white/5"
                            >
                                Abrir Chamado
                                <ArrowRight size={14} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLUNA DE FAQ - ACORDEÃO PREMIUM */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    {faqs.map((faq, i) => {
                        const estaAtivo = indiceAtivo === i;
                        return (
                            <div
                                key={i}
                                onClick={() => alternarFaq(i)}
                                className={`group p-8 rounded-[32px] transition-all duration-500 cursor-pointer border ${estaAtivo
                                    ? 'bg-white dark:bg-card-fundo border-sky-500/30 shadow-2xl shadow-sky-500/5 ring-1 ring-sky-500/10'
                                    : 'bg-white/50 dark:bg-card-fundo/40 border-gray-100 dark:border-white/[0.04] hover:border-sky-500/20 hover:bg-white dark:hover:bg-card-fundo'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black transition-all duration-500 ${estaAtivo
                                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                                            : 'bg-gray-100 dark:bg-white/5 text-gray-400 group-hover:bg-sky-500/10 group-hover:text-sky-500'
                                            }`}>
                                            {i + 1 < 10 ? `0${i + 1}` : i + 1}
                                        </div>
                                        <h3 className={`text-lg font-black tracking-tight transition-colors duration-300 ${estaAtivo ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-zinc-400'
                                            }`}>
                                            {faq.pergunta}
                                        </h3>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center transition-all duration-500 ${estaAtivo ? 'rotate-180 border-sky-500/50 bg-sky-500/5 text-sky-500' : 'text-gray-300'}`}>
                                        <ChevronDown size={20} strokeWidth={2.5} />
                                    </div>
                                </div>

                                <div className={`grid transition-all duration-500 ease-in-out ${estaAtivo ? 'grid-rows-[1fr] pt-8 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        <div className="p-8 rounded-[24px] bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                                            <p className="text-[15px] leading-relaxed text-gray-600 dark:text-zinc-400 font-medium">
                                                {faq.resposta}
                                            </p>
                                            <div className="mt-6 flex items-center gap-3 py-3 px-4 rounded-xl bg-sky-500/[0.03] w-fit">
                                                <Sparkles size={14} className="text-sky-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">Informação Validada pela Engenharia</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

