import { Box, Package, RefreshCcw, Search, Plus, Check } from "lucide-react";
import { InsumoSelecionado } from "../tipos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface CardInsumosProps {
  insumos: any[];
  selecionados: InsumoSelecionado[];
  busca: string;
  setBusca: (v: string) => void;
  alternar: (i: any) => void;
  insumosFixos: number;
  setInsumosFixos: (v: number) => void;
  abrirGerenciar: () => void;
  abrirNovo: () => void;
}

export function CardInsumos({
  insumos, selecionados, busca, setBusca, alternar, insumosFixos, setInsumosFixos, abrirGerenciar, abrirNovo
}: CardInsumosProps) {
  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-50 dark:border-white/5">
        <div className="flex items-center gap-3">
          <Box size={18} className="text-indigo-500" />
          <h3 className="text-xs font-black uppercase tracking-widest">Insumos e Embalagens</h3>
        </div>
        <div className="relative group">
          <input type="text" placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full md:w-64 h-9 pl-9 pr-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-indigo-500/30 outline-none text-[10px] font-bold uppercase tracking-widest transition-all" />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2"><Package className="w-3 h-3 text-indigo-500" /><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Seu Estoque</span></div>
          <button onClick={abrirGerenciar} className="text-[9px] font-black uppercase text-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-1 group">Gerenciar Insumos <RefreshCcw className="w-2 h-2 group-hover:rotate-180 transition-transform duration-500" /></button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 min-h-[110px] items-stretch">
          {insumos.map((i) => {
            const sel = selecionados.some(s => s.id === i.id);
            return (
              <button key={i.id} onClick={() => alternar(i)} className={`flex-shrink-0 w-32 p-4 rounded-2xl border-2 transition-all text-left relative group flex flex-col justify-between ${sel ? "bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/5" : "bg-gray-50 dark:bg-white/[0.02] border-transparent hover:border-indigo-500/30"}`}>
                <div className={`p-2 rounded-lg mb-3 inline-block ${sel ? "bg-indigo-500 text-white" : "bg-white dark:bg-white/5 text-zinc-400 group-hover:text-indigo-500"}`}><Box size={16} /></div>
                <div><p className={`text-[10px] font-black uppercase truncate mb-1 ${sel ? "text-indigo-500" : "text-zinc-500"}`}>{i.nome}</p><p className="text-[11px] font-black">{centavosParaReais(i.custoMedioUnidade)}</p></div>
                {sel && <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg"><Check size={10} className="text-white" /></div>}
              </button>
            );
          })}
          <button onClick={abrirNovo} className="flex-shrink-0 w-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center gap-2 group"><div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all"><Plus className="w-4 h-4" /></div><span className="text-[9px] font-black uppercase opacity-50 group-hover:opacity-100">Novo</span></button>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-50 dark:border-white/5">
        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Outros Custos Fixos (R$)</label>
        <input type="number" value={insumosFixos} onChange={(e) => setInsumosFixos(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
      </div>
    </div>
  );
}
