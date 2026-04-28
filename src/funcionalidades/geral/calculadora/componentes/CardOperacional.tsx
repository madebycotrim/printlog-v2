import { DollarSign, Activity } from "lucide-react";

interface CardOperacionalProps {
  maoDeObra: number;
  setMaoDeObra: (v: number) => void;
  margem: number;
  setMargem: (v: number) => void;
  depreciacao: number;
  cobrarDesgaste: boolean;
  setCobrarDesgaste: (v: boolean) => void;
  cobrarMaoDeObra: boolean;
  setCobrarMaoDeObra: (v: boolean) => void;
  anosVidaUtil?: 5 | 3 | 2;
  setAnosVidaUtil?: (v: 5 | 3 | 2) => void;
  tempo: number;
}

export function CardOperacional({
  maoDeObra, setMaoDeObra, margem, setMargem, depreciacao, cobrarDesgaste, setCobrarDesgaste, cobrarMaoDeObra, setCobrarMaoDeObra, 
  anosVidaUtil = 5, setAnosVidaUtil, tempo
}: CardOperacionalProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col gap-6">
        <div className={`p-8 rounded-3xl border shadow-sm space-y-6 transition-all duration-300 ${cobrarMaoDeObra ? "bg-white dark:bg-zinc-900 border-gray-100 dark:border-white/5" : "bg-gray-50/50 dark:bg-zinc-900/50 border-gray-100 dark:border-white/5 opacity-70 grayscale"}`}>
          <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-white/5">
            <div className="flex items-center gap-3">
              <DollarSign size={18} className="text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Mão de Obra</h3>
            </div>
            <button
              type="button"
              onClick={() => setCobrarMaoDeObra(!cobrarMaoDeObra)}
              className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                cobrarMaoDeObra ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-zinc-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                cobrarMaoDeObra ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <div className={`transition-opacity ${!cobrarMaoDeObra ? "opacity-50 pointer-events-none" : ""}`}>
            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Valor da Hora (R$/h)</label>
            <input 
              type="number" 
              value={cobrarMaoDeObra ? (maoDeObra === 0 ? '' : maoDeObra) : 0} 
              onChange={(e) => {
                const val = e.target.value;
                setMaoDeObra(val === '' ? 0 : Number(val));
              }} 
              className={`w-full h-12 px-4 rounded-xl outline-none font-black text-sm ${!cobrarMaoDeObra ? 'bg-gray-50/50 dark:bg-white/5 line-through text-gray-400' : 'bg-gray-50 dark:bg-white/5'}`}
            />
          </div>
        </div>

        <div className="py-4 px-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase text-gray-400">Margem de Lucro</label>
            <span className="text-xs font-black text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">{margem}%</span>
          </div>
          <input type="range" min="0" max="500" step="10" value={margem} onChange={(e) => setMargem(Number(e.target.value))} className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-sky-500" />
        </div>
      </div>

      <div className={`p-8 rounded-3xl border shadow-sm space-y-6 transition-all duration-300 ${cobrarDesgaste ? "bg-white dark:bg-zinc-900 border-gray-100 dark:border-white/5" : "bg-gray-50/50 dark:bg-zinc-900/50 border-gray-100 dark:border-white/5 opacity-70 grayscale"}`}>
        <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-white/5">
          <div className="flex items-center gap-3">
            <Activity size={18} className="text-rose-500" />
            <h3 className="text-xs font-black uppercase tracking-widest">Desgaste de Máquina</h3>
          </div>
          
          <button
            type="button"
            onClick={() => setCobrarDesgaste(!cobrarDesgaste)}
            className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
              cobrarDesgaste ? 'bg-rose-500' : 'bg-gray-200 dark:bg-zinc-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
              cobrarDesgaste ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>
        
        <div className={`space-y-6 transition-opacity ${!cobrarDesgaste ? "opacity-50 pointer-events-none" : ""}`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black uppercase text-gray-400">Taxa de Desgaste</label>
              <button
                type="button"
                onClick={() => {
                  if (!setAnosVidaUtil) return;
                  if (anosVidaUtil === 5) setAnosVidaUtil(3);
                  else if (anosVidaUtil === 3) setAnosVidaUtil(2);
                  else setAnosVidaUtil(5);
                }}
                className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all hover:scale-105 active:scale-95 ${
                  anosVidaUtil === 5 ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
                  anosVidaUtil === 3 ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                  'text-rose-500 bg-rose-500/10 border-rose-500/20'
                }`}
              >
                {anosVidaUtil === 5 && "Uso Padrão (5 anos)"}
                {anosVidaUtil === 3 && "Uso Severo (3 anos)"}
                {anosVidaUtil === 2 && "Uso Extremo (2 anos)"}
              </button>
            </div>
            <div className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-between border border-gray-100 dark:border-white/5 select-none relative group">
              <span className="text-gray-400 font-black text-xs">R$/h</span>
              <span className="font-black text-sm text-gray-900 dark:text-white">
                {(cobrarDesgaste ? depreciacao || 0 : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {/* Detalhe estético premium: linha de saúde pulsante se ativo */}
              {cobrarDesgaste && (
                <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-rose-500/30 to-transparent animate-pulse" />
              )}
            </div>
            {cobrarDesgaste && (
              <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 mt-2 text-right uppercase tracking-wider">
                💡 Fórmula: (Valor / {anosVidaUtil} Anos) / 12 Meses / 240h
              </p>
            )}
          </div>
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex justify-between items-center relative overflow-hidden">
            <span className="text-[11px] font-black uppercase text-rose-500">Custo Total Desgaste:</span>
            <span className={`text-sm font-black ${cobrarDesgaste ? 'text-rose-500' : 'text-zinc-500 line-through'}`}>
              R$ {((cobrarDesgaste ? (tempo / 60) * depreciacao : 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
