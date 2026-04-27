import { Zap, Plus, Trash2 } from "lucide-react";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { ItemPosProcesso } from "../tipos";
import { useState } from "react";

interface CardProducaoProps {
  tempo: number;
  setTempo: (v: number) => void;
  potencia: number;
  setPotencia: (v: number) => void;
  precoKwh: number;
  setPrecoKwh: (v: number) => void;
  custoEnergia: number;
  posProcesso: ItemPosProcesso[];
  setPosProcesso: (v: ItemPosProcesso[]) => void;
}

export function CardProducao({
  tempo, setTempo, potencia, setPotencia, precoKwh, setPrecoKwh, custoEnergia, posProcesso, setPosProcesso
}: CardProducaoProps) {
  const [novoItemNome, setNovoItemNome] = useState("");
  const [novoItemValor, setNovoItemValor] = useState(0);

  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
        <Zap size={18} className="text-amber-500" />
        <h3 className="text-xs font-black uppercase tracking-widest">Produção</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {/* Coluna Esquerda: Tempo e Energia */}
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block h-4 text-[10px] font-black uppercase text-gray-400 mb-2">Horas</label>
              <input type="number" placeholder="0" value={Math.floor(tempo / 60) || ""} onChange={(e) => setTempo(Number(e.target.value) * 60 + (tempo % 60))} className="w-full h-14 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
            <div className="flex-1">
              <label className="block h-4 text-[10px] font-black uppercase text-gray-400 mb-2">Minutos</label>
              <input type="number" placeholder="0" value={tempo % 60 || ""} onChange={(e) => setTempo(Math.floor(tempo / 60) * 60 + Number(e.target.value))} className="w-full h-14 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col group">
              <div className="flex items-center justify-between h-4 mb-2">
                <label className="block text-[10px] font-black uppercase text-gray-400">Energia (R$)</label>
                <div className="px-1.5 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-[8px] font-black text-orange-500 uppercase flex items-center">
                  <input type="number" value={potencia || ""} onChange={(e) => setPotencia(Number(e.target.value))} className="bg-transparent outline-none text-right placeholder:text-orange-500/50 w-8" placeholder="0" />
                  <span>W</span>
                </div>
              </div>
              <div className="w-full h-14 px-4 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center border border-transparent group-hover:border-orange-500/30 transition-all">
                <span className="text-gray-400 font-black text-xs mr-2">R$</span>
                <span className="font-black text-sm text-gray-900 dark:text-white">{custoEnergia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block h-4 text-[10px] font-black uppercase text-gray-400 mb-2">kWh (R$)</label>
              <input type="number" step="0.01" value={precoKwh || ""} onChange={(e) => setPrecoKwh(Number(e.target.value))} className="w-full h-14 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
          </div>
        </div>

        {/* Coluna Direita: Pós-Processamento */}
        <div className="flex flex-col justify-between">
          <div className="flex flex-col mb-8">
            <label className="block h-4 text-[10px] font-black uppercase text-gray-400 mb-2">Pós-Processamento</label>
            <div className="h-14 space-y-2 overflow-y-auto scrollbar-hide">
              {posProcesso.length === 0 ? (
                <div className="w-full h-full border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-center">
                  <p className="text-[9px] font-bold text-gray-300 dark:text-zinc-700 uppercase tracking-widest italic">Vazio</p>
                </div>
              ) : (
                posProcesso.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent">
                    <span className="text-[10px] font-bold uppercase truncate max-w-[120px] text-gray-900 dark:text-white">{item.nome}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-900 dark:text-white">R$ {item.valor}</span>
                      <button onClick={() => setPosProcesso(posProcesso.filter(i => i.id !== item.id))} className="text-rose-500 hover:scale-110 transition-transform">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block h-4 text-[10px] font-black uppercase text-transparent mb-2">.</label>
            <div className="flex gap-2">
              <input type="text" placeholder="Item..." value={novoItemNome} onChange={(e) => setNovoItemNome(e.target.value)} className="flex-1 h-14 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-bold text-xs uppercase" />
              <input type="number" placeholder="R$" value={novoItemValor || ""} onChange={(e) => setNovoItemValor(Number(e.target.value))} className="w-20 h-14 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-xs" />
              <button onClick={() => { if (novoItemNome && novoItemValor > 0) { setPosProcesso([...posProcesso, { id: crypto.randomUUID(), nome: novoItemNome, valor: novoItemValor }]); setNovoItemNome(""); setNovoItemValor(0); } }} className="w-14 h-14 rounded-xl bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
