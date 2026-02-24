import { MoreVertical, Edit2, Archive, History, Wrench, Settings } from "lucide-react";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CardImpressoraProps {
    impressora: Impressora;
    aoEditar: (impressora: Impressora) => void;
    aoAposentar: (impressora: Impressora) => void;
    aoDetalhes?: (impressora: Impressora) => void;
    aoHistorico?: (impressora: Impressora) => void;
    aoManutencoes?: (impressora: Impressora) => void;
    aoPecas?: (impressora: Impressora) => void;
}

export function CardImpressora({ impressora, aoEditar, aoAposentar, aoDetalhes, aoHistorico, aoManutencoes, aoPecas }: CardImpressoraProps) {
    const [menuAberto, definirMenuAberto] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const fecharMenu = useCallback(() => definirMenuAberto(false), []);

    useEffect(() => {
        const fora = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) fecharMenu();
        };
        const esc = (e: KeyboardEvent) => { if (e.key === "Escape") fecharMenu(); };
        if (menuAberto) {
            document.addEventListener("mousedown", fora);
            document.addEventListener("keydown", esc);
        }
        return () => {
            document.removeEventListener("mousedown", fora);
            document.removeEventListener("keydown", esc);
        };
    }, [menuAberto, fecharMenu]);

    const isOperacional = (impressora.status as unknown as string) === "livre";
    const isManutencao = (impressora.status as unknown as string) === "manutencao";

    const barraCor = isOperacional ? "#10b981" : isManutencao ? "#f59e0b" : "#3f3f46";

    const subtitulo = [impressora.marca].filter(Boolean).join(" | ") || impressora.tecnologia;

    const horasUsadas = Math.floor((impressora.horimetroTotalMinutos || 0) / 60);

    return (
        <div
            onClick={() => aoDetalhes?.(impressora)}
            className="group relative flex flex-col h-full rounded-[20px] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] cursor-pointer bg-white dark:bg-card-fundo border border-gray-200 dark:border-white/5"
        >
            {/* Badge Superior Esquerdo (Tecnologia) */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#a1a1aa] bg-gray-50/50 dark:bg-transparent border border-gray-200 dark:border-white/5 flex items-center justify-center shadow-sm dark:shadow-none">
                    {impressora.tecnologia}
                </span>
            </div>



            {/* Menu 3 pontos escondido no hover */}
            <div className="absolute top-4 right-3 z-30" ref={menuRef}>
                <button
                    onClick={(e) => { e.stopPropagation(); definirMenuAberto(!menuAberto); }}
                    className={`p-1.5 rounded-lg transition-all ${menuAberto ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white' : 'opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-400 dark:text-white/20 hover:text-gray-900 dark:hover:text-white'}`}
                    aria-label="Opções da impressora"
                >
                    <MoreVertical size={16} />
                </button>

                <AnimatePresence>
                    {menuAberto && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-1 w-52 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-30 overflow-hidden origin-top-right"
                            role="menu"
                        >
                            <div className="p-1.5 space-y-0.5">
                                <button
                                    onClick={(e) => { e.stopPropagation(); if (aoHistorico) aoHistorico(impressora); fecharMenu(); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-gray-600 dark:text-zinc-300 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors group/item uppercase tracking-widest"
                                    role="menuitem"
                                >
                                    <History size={14} className="text-gray-400 group-hover/item:text-indigo-500 transition-colors" />
                                    Ver Histórico
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); if (aoManutencoes) aoManutencoes(impressora); fecharMenu(); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-gray-600 dark:text-zinc-300 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg transition-colors group/item uppercase tracking-widest"
                                    role="menuitem"
                                >
                                    <Wrench size={14} className="text-gray-400 group-hover/item:text-amber-500 transition-colors" />
                                    Manutenções
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); if (aoPecas) aoPecas(impressora); fecharMenu(); }}
                                    className="w-full flex items-center justify-between gap-2.5 px-3 py-2 text-[11px] font-bold text-gray-600 dark:text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors group/item uppercase tracking-widest text-left"
                                    role="menuitem"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Settings size={14} className="text-gray-400 group-hover/item:text-emerald-500 transition-colors" />
                                        Peças/Desgaste
                                    </div>
                                    {impressora.pecasDesgaste && impressora.pecasDesgaste.length > 0 && (
                                        <span className="bg-emerald-500/20 text-emerald-500 text-[10px] font-black px-1.5 py-0.5 rounded">
                                            {impressora.pecasDesgaste.length}
                                        </span>
                                    )}
                                </button>

                                <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />

                                <button
                                    onClick={(e) => { e.stopPropagation(); aoEditar(impressora); fecharMenu(); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-gray-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors group/item uppercase tracking-widest"
                                    role="menuitem"
                                >
                                    <Edit2 size={14} className="text-gray-400 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors" />
                                    Editar 
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); aoAposentar(impressora); fecharMenu(); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors group/item uppercase tracking-widest"
                                    role="menuitem"
                                >
                                    <Archive size={14} className="text-rose-400 group-hover/item:text-rose-600 transition-colors" />
                                    Aposentar
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Imagem Central */}
            <div className="flex flex-col flex-1 items-center justify-center p-6 pt-12 pb-8 relative min-h-[160px]">
                {/* Glow de Status no Fundo Atrás da Imagem */}
                <div
                    className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-[40px] dark:blur-[64px] z-0 pointer-events-none opacity-[0.25] dark:opacity-15 transition-colors duration-1000"
                    style={{ backgroundColor: barraCor }}
                />

                <div className="relative z-10 transition-transform duration-500 group-hover:scale-105 h-full flex items-center justify-center">
                    {impressora.imagemUrl ? (
                        <img
                            src={impressora.imagemUrl}
                            alt={impressora.nome}
                            className="max-h-[160px] max-w-[80%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full opacity-50 border-4 shadow-inner border-gray-200 bg-gray-100 dark:border-white/5 dark:bg-[#27272a]" />
                    )}
                </div>
            </div>

            {/* Rodapé minimalista com Horímetro */}
            <div className="px-5 py-5 flex items-end justify-between bg-transparent relative border-t border-gray-200 dark:border-white/5">
                <div className="flex flex-col min-w-0 pr-4 z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 dark:text-zinc-500 mb-0.5 truncate">
                        {subtitulo}
                    </span>
                    <h4
                        className="text-[24px] font-black text-gray-900 dark:text-white tracking-tighter truncate leading-none drop-shadow-sm"
                        title={impressora.nome}
                    >
                        {impressora.nome}
                    </h4>
                </div>

                <div className="flex flex-col items-end shrink-0 z-10">
                    <span className="text-[25px] font-black leading-none tracking-tighter" style={{ color: barraCor }}>
                        {horasUsadas}<span className="text-[14px]" style={{ color: barraCor, opacity: 0.5 }}>h</span>
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-500 dark:text-zinc-600 mt-2">
                        De Uso
                    </span>
                </div>
            </div>
        </div >
    );
}
