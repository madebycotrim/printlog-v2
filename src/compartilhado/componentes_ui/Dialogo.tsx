import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface PropriedadesDialogo {
  aberto: boolean;
  aoFechar: () => void;
  titulo?: string;
  children: ReactNode;
  larguraMax?: string;
  esconderCabecalho?: boolean;
}

export function Dialogo({
  aberto,
  aoFechar,
  titulo,
  children,
  larguraMax = "max-w-2xl",
  esconderCabecalho = false,
}: PropriedadesDialogo) {
  // Fecha com ESC
  useEffect(() => {
    const lidarComTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    if (aberto) window.addEventListener("keydown", lidarComTecla);
    return () => window.removeEventListener("keydown", lidarComTecla);
  }, [aberto, aoFechar]);

  return (
    <AnimatePresence>
      {aberto && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={aoFechar}
          />

          {/* Container Centralizado */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className={`w-full ${larguraMax} bg-white dark:bg-[#0e0e11] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabeçalho */}
              {!esconderCabecalho && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-[#18181b]">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                    {titulo}
                  </h3>
                  <button
                    onClick={aoFechar}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                    aria-label="Fechar"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              {/* ConteÃºdo com Scroll */}
              <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700/50 hover:scrollbar-thumb-zinc-600">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
