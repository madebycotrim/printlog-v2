import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Box } from "lucide-react";

/**
 * Interface para as propriedades do CardCustosFixos.
 */
interface PropriedadesCardCustosFixos {
  mostrar: boolean;
  setMostrar: (v: boolean) => void;
  insumosFixos: number;
  setInsumosFixos: (v: number) => void;
  cobrarInsumosFixos: boolean;
  setCobrarInsumosFixos: (v: boolean) => void;
}

/**
 * Card para registro de custos fixos adicionais (brindes, marketing, etc).
 */
export function CardCustosFixos({
  mostrar,
  setMostrar,
  insumosFixos,
  setInsumosFixos,
  setCobrarInsumosFixos
}: PropriedadesCardCustosFixos) {
  return (
    <div className="flex flex-col my-6">
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(99,102,241,0.15)] transition-all z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner">
            <Wallet size={16} className={`${insumosFixos > 0 ? "animate-pulse" : ""}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Deseja adicionar custos fixos extras?</span>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Brindes, mimos, marketing ou custos de gestão e embalagem</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const novoEstado = !mostrar;
            setMostrar(novoEstado);
            setCobrarInsumosFixos(novoEstado);
          }}
          className={`px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all border ${mostrar
            ? "bg-indigo-500 text-white border-indigo-600 shadow-sm shadow-indigo-500/30 hover:bg-indigo-600"
            : "bg-white dark:bg-white/5 text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/40 border-zinc-200 dark:border-white/10"
            }`}
        >
          {mostrar ? "Ocultar" : "Adicionar"}
        </button>
      </div>

      <AnimatePresence>
        {mostrar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-6 pt-8 rounded-b-xl bg-[linear-gradient(to_bottom,transparent_12px,#fafafa_12px)] dark:bg-[linear-gradient(to_bottom,transparent_12px,#18181b_12px)] shadow-sm space-y-4 -mt-3 z-0 relative overflow-hidden"
          >
            {/* Quininhas para preencher o gap dos cantos arredondados */}
            <div className="absolute top-0 left-0 w-[12px] h-[12px] bg-[radial-gradient(circle_at_100%_0%,transparent_12px,#fafafa_12px)] dark:bg-[radial-gradient(circle_at_100%_0%,transparent_12px,#18181b_12px)] z-[-1]" />
            <div className="absolute top-0 right-0 w-[12px] h-[12px] bg-[radial-gradient(circle_at_0%_0%,transparent_12px,#fafafa_12px)] dark:bg-[radial-gradient(circle_at_0%_0%,transparent_12px,#18181b_12px)] z-[-1]" />

            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <Box size={16} className="text-indigo-400" />
                <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Gestão de Custos Adicionais</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider ml-1">Valor do Custo Fixo (R$)</label>
                <div className="relative flex items-center bg-white dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/10 focus-within:border-indigo-500/40 shadow-inner">
                  <span className="absolute left-4 text-[10px] font-black text-zinc-500">R$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0,00"
                    value={insumosFixos || ""}
                    onChange={(e) => setInsumosFixos(Number(e.target.value))}
                    className="w-full h-11 bg-transparent pl-10 pr-4 font-black text-xs text-zinc-900 dark:text-white outline-none"
                  />
                </div>
                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1 ml-1">
                  Este valor será somado diretamente ao custo final do projeto.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
