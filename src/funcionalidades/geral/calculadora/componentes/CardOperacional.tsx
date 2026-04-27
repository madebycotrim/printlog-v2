import { DollarSign, Activity, Calculator } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CardOperacionalProps {
  maoDeObra: number;
  setMaoDeObra: (v: number) => void;
  margem: number;
  setMargem: (v: number) => void;
  depreciacao: number;
  setDepreciacao: (v: number) => void;
  tempo: number;
}

export function CardOperacional({
  maoDeObra, setMaoDeObra, margem, setMargem, depreciacao, setDepreciacao, tempo
}: CardOperacionalProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
          <DollarSign size={18} className="text-emerald-500" />
          <h3 className="text-xs font-black uppercase tracking-widest">Mão de Obra</h3>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Valor da Hora (R$/h)</label>
            <input type="number" value={maoDeObra} onChange={(e) => setMaoDeObra(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
          </div>
          <div>
            <div className="flex justify-between mb-3">
              <label className="text-[10px] font-black uppercase text-gray-400">Margem de Lucro</label>
              <span className="text-xs font-black text-sky-500">{margem}%</span>
            </div>
            <input type="range" min="0" max="500" step="10" value={margem} onChange={(e) => setMargem(Number(e.target.value))} className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-sky-500" />
          </div>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
          <Activity size={18} className="text-rose-500" />
          <h3 className="text-xs font-black uppercase tracking-widest">Desgaste de Máquina</h3>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Depreciação (R$/h)</label>
            <input type="number" value={depreciacao} onChange={(e) => setDepreciacao(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
          </div>
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-rose-500">Custo Total Desgaste:</span>
            <span className="text-xs font-black text-rose-500">R$ {((tempo / 60) * depreciacao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
