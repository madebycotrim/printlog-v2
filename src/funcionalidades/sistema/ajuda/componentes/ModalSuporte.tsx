import { useState } from "react";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Headphones, ExternalLink, X, Loader2 } from "lucide-react";

interface Propriedades {
    aberto: boolean;
    aoFechar: () => void;
}

export function ModalSuporte({ aberto, aoFechar }: Propriedades) {
    const [carregado, definirCarregado] = useState(false);

    return (
        <Dialogo
            aberto={aberto}
            aoFechar={aoFechar}
            esconderCabecalho={true}
            larguraMax="max-w-5xl"
        >
            <div className="bg-white dark:bg-card-fundo flex flex-col h-[75vh] overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10 shadow-2xl">

                {/* CABEÇALHO PADRÃO PRINTLOG */}
                <div className="px-8 py-5 flex items-center justify-between gap-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">

                    {/* INFO PRINCIPAL */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
                            <Headphones size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-0.5">Suporte Direto</p>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white select-all">contato@printlog.com.br</h4>
                        </div>
                    </div>

                    {/* AÇÕES DE CONTROLE PADRONIZADAS */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.open('https://forms.gle/uUYofbGWXusVZSyG6', '_blank')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-zinc-400 hover:text-sky-500 transition-all text-[11px] font-bold"
                        >
                            <span>Abrir em Nova Aba</span>
                            <ExternalLink size={14} />
                        </button>

                        <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1" />

                        <button
                            onClick={aoFechar}
                            className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all dark:text-zinc-500"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* ÁREA DO FORMULÁRIO */}
                <div className="flex-1 relative bg-white dark:bg-black/10">
                    {!carregado && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-card-fundo z-10 gap-4">
                            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500">
                                Carregando Central...
                            </p>
                        </div>
                    )}

                    <iframe
                        src="https://forms.gle/uUYofbGWXusVZSyG6"
                        className={`w-full h-full border-0 transition-opacity duration-500 ${carregado ? 'opacity-100' : 'opacity-0'}`}
                        title="Formulário de Suporte Técnico"
                        onLoad={() => definirCarregado(true)}
                    >
                        Carregando formulário...
                    </iframe>
                </div>
            </div>
        </Dialogo>
    );
}
