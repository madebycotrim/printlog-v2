import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { AlertTriangle, Archive, Wrench } from "lucide-react";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";

interface ModalAposentarImpressoraProps {
    aberto: boolean;
    aoFechar: () => void;
    aoConfirmar: () => void;
    impressora: Impressora | null;
}

export function ModalAposentarImpressora({
    aberto,
    aoFechar,
    aoConfirmar,
    impressora,
}: ModalAposentarImpressoraProps) {
    if (!impressora) return null;
    return (
        <Dialogo
            aberto={aberto}
            aoFechar={aoFechar}
            titulo="Aposentar Impressora"
            larguraMax="max-w-md"
        >
            <div className="flex flex-col bg-white dark:bg-[#18181b]">
                <div className="p-6 md:p-8 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-sm border border-orange-100 dark:border-orange-500/20">
                            <AlertTriangle size={32} strokeWidth={2} />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                Aposentar Equipamento?
                            </h3>
                            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                                A impressora sairá da sua lista principal, mas as{" "}
                                <strong className="text-gray-700 dark:text-zinc-300">
                                    referências passadas
                                </strong>{" "}
                                serão preservados.
                            </p>
                        </div>
                    </div>

                    {/* Card Resumo da Impressora a ser apagada */}
                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 dark:border-white/5 w-full">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#18181b] dark:to-[#121214] border border-gray-200/50 dark:border-white/5 flex items-center justify-center shrink-0 relative overflow-hidden">
                            {impressora.imagemUrl ? (
                                <img
                                    src={impressora.imagemUrl}
                                    alt={impressora.nome}
                                    className="w-[85%] h-[85%] object-contain scale-110 drop-shadow-sm"
                                />
                            ) : (
                                <Wrench size={24} className="text-zinc-500 dark:text-zinc-600" />
                            )}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1 text-left">
                            <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {impressora.nome}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium truncate">
                                {impressora.marca || impressora.tecnologia} • {impressora.modeloBase}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-5 md:p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-[#0e0e11]/50 flex items-center justify-end gap-3 rounded-br-xl">
                    <button
                        type="button"
                        onClick={aoFechar}
                        className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={aoConfirmar}
                        className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Archive size={18} strokeWidth={2.5} />
                        Sim, Aposentar Máquina
                    </button>
                </div>
            </div>
        </Dialogo>
    );
}
