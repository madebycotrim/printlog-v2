import { Zap, Plus, Trash2, Minus } from "lucide-react";
import { ItemPosProcesso } from "../tipos";
import { useState, memo } from "react";
import { ContadorAnimado } from "@/componentes/ui";

interface CardProducaoProps {
  tempo: number;
  setTempo: (v: number) => void;
  modoEntrada: 'unitario' | 'lote';
  potencia: number;
  setPotencia: (v: number) => void;
  precoKwh: number;
  setPrecoKwh: (v: number) => void;
  custoEnergia: number;
  cobrarEnergia: boolean;
  setCobrarEnergia: (v: boolean) => void;
  posProcesso: ItemPosProcesso[];
  setPosProcesso: (v: ItemPosProcesso[]) => void;
  impressoras?: any[];
  idImpressoraSelecionada?: string;
  aoSelecionarImpressora?: (id: string) => void;
  quantidade: number;
  setQuantidade: (v: number) => void;
}

export const CardProducao = memo(function CardProducao({
  tempo, setTempo, potencia, setPotencia, precoKwh, setPrecoKwh, custoEnergia, cobrarEnergia, setCobrarEnergia, posProcesso, setPosProcesso,
  impressoras = [], idImpressoraSelecionada, quantidade, setQuantidade
}: CardProducaoProps) {
  const impressoraAtiva = impressoras.find(i => i.id === idImpressoraSelecionada);

  return (
    <div className="p-6 rounded-3xl bg-[#121214] border border-white/5 relative flex flex-col gap-3 shadow-2xl backdrop-blur-3xl group transition-all duration-500">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/30">
            <Zap size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-white">Produção e Impressão</span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Metricas de tempo e hardware</span>
          </div>
        </div>

        {/* Display da Impressora (Estático) */}
        {impressoraAtiva && (
          <div className="flex items-center justify-between px-4 h-11 rounded-xl border bg-zinc-100/50 dark:bg-white/5 border-zinc-200/50 dark:border-white/10 shadow-sm min-w-[160px]">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                  {impressoraAtiva.nome}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <span className="text-[10px] font-black text-zinc-400 tracking-tighter leading-none">{impressoraAtiva.potenciaWatts}W</span>
            </div>
          </div>
        )}
      </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-0">
        {/* Coluna Esquerda: Tempo e Energia */}
        <div className="flex-1 space-y-4 md:pr-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block h-4 text-xs font-black uppercase text-gray-400 mb-2">Quantas peças?</label>
              <div className="relative flex items-center h-11 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-amber-500/40 transition-all shadow-inner overflow-hidden">
                <button 
                  type="button"
                  onClick={() => setQuantidade(Math.max(1, (quantidade || 1) - 1))}
                  className="w-10 h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <Minus size={12} />
                </button>
                <input 
                  type="number" 
                  placeholder="1" 
                  min="1" 
                  value={quantidade ?? ""} 
                  onChange={(e) => setQuantidade(Number(e.target.value))} 
                  className="w-full h-full bg-transparent outline-none font-black text-sm text-center text-zinc-900 dark:text-white" 
                />
                <button 
                  type="button"
                  onClick={() => setQuantidade((quantidade || 1) + 1)}
                  className="w-10 h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            <div>
              <label className="block h-4 text-xs font-black uppercase text-gray-400 mb-2">Tempo de Produção</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative flex items-center h-11 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-amber-500/40 transition-all shadow-inner">
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={Math.floor(tempo / 60) === 0 ? "" : Math.floor(tempo / 60)} 
                    onChange={(e) => setTempo(Number(e.target.value) * 60 + (tempo % 60))} 
                    className="w-full h-11 pl-4 pr-10 bg-transparent outline-none font-black text-sm text-center text-zinc-900 dark:text-white" 
                  />
                  <span className="absolute right-3 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">h</span>
                </div>

                <div className="relative flex items-center h-11 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-amber-500/40 transition-all shadow-inner">
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={tempo % 60 === 0 ? "" : tempo % 60} 
                    onChange={(e) => setTempo(Math.floor(tempo / 60) * 60 + Number(e.target.value))} 
                    className="w-full h-11 pl-4 pr-12 bg-transparent outline-none font-black text-sm text-left text-zinc-900 dark:text-white" 
                  />
                  <span className="absolute right-3 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col group">
              <div className="flex items-center justify-between h-4 mb-2">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-black uppercase text-gray-400">Energia (R$)</label>
                </div>
                <div
                  onClick={() => setCobrarEnergia(!cobrarEnergia)}
                  title={cobrarEnergia ? "Clique para desativar cobrança de energia" : "Clique para ativar cobrança de energia"}
                  className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase flex items-center gap-0.5 w-fit cursor-pointer transition-colors hover:scale-105 active:scale-95 ${!cobrarEnergia
                      ? "bg-gray-500/10 border-gray-500/20 text-gray-500 opacity-60"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    }`}
                >
                  <input
                    type="number"
                    value={potencia === 0 ? "" : potencia}
                    onChange={(e) => setPotencia(Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent outline-none text-right placeholder:current-color leading-none"
                    style={{ width: `${Math.max(1, (potencia || 0).toString().length)}ch` }}
                    placeholder="0"
                  />
                  <span className="leading-none">W</span>
                </div>
              </div>
              <div
                onClick={() => setCobrarEnergia(!cobrarEnergia)}
                title={cobrarEnergia ? "Clique para desativar cobrança de energia" : "Clique para ativar cobrança de energia"}
                className={`w-full h-11 px-4 rounded-xl flex items-center border cursor-pointer transition-all shadow-inner ${!cobrarEnergia ? 'bg-zinc-100/20 dark:bg-zinc-800/20 border-zinc-200/20 dark:border-white/5 opacity-40 grayscale' :
                    impressoraAtiva ? 'bg-zinc-100/50 dark:bg-zinc-800/40 border-amber-500/20 group-hover:border-amber-500/40' : 'bg-zinc-100/50 dark:bg-zinc-800/40 border-zinc-200/50 dark:border-white/5 group-hover:border-amber-500/30'
                  }`}
              >
                <span className="text-gray-400 font-black text-xs mr-2 select-none">R$</span>
                <span className={`font-black text-sm w-full text-center ${!cobrarEnergia ? 'line-through text-gray-400' : impressoraAtiva ? 'text-amber-500' : 'text-zinc-900 dark:text-white'}`}>
                  <ContadorAnimado valor={cobrarEnergia ? custoEnergia : 0} prefixo="" />
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block h-4 text-xs font-black uppercase text-gray-400 mb-2">kWh (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="0" 
                value={precoKwh === 0 ? "" : precoKwh} 
                onChange={(e) => setPrecoKwh(Number(e.target.value))} 
                className="w-full h-11 px-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 focus-within:border-amber-500/40 outline-none font-black text-sm text-zinc-900 dark:text-white transition-all shadow-inner text-center" 
              />
            </div>
          </div>
        </div>

        {/* Linha Divisória Vertical */}
        <div className="hidden md:block w-[1px] bg-amber-500/20 dark:bg-amber-500/10 self-stretch mx-3" />

        {/* Coluna Direita: Pós-Processamento */}
        <div className="flex-1 flex flex-col h-full md:pl-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                Pós-Processamento
              </label>
              <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Lixamento, Pintura, Cola e Acabamentos</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPosProcesso([...posProcesso, { id: crypto.randomUUID(), nome: "Novo Item", valor: 0 }]);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all"
            >
              <Plus size={10} strokeWidth={3} />
              Adicionar Item
            </button>
          </div>

          <div className="h-[200px] overflow-y-auto space-y-2 mb-3 pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800/50">
            {posProcesso.length === 0 ? (
              <div className="w-full border border-dashed border-gray-100 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center h-full min-h-[120px] p-4 text-center bg-transparent">
                <Plus size={20} className="text-gray-400 dark:text-zinc-600 mb-2" />
                <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Nenhum acabamento extra aplicado</span>
              </div>
            ) : (
              <div className="space-y-3">
                {posProcesso.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl group animate-in slide-in-from-right-2 duration-300">
                    <div className="flex-1 min-w-[120px]">
                      <input
                        type="text"
                        value={item.nome}
                        placeholder="Nome do item..."
                        onChange={(e) => {
                          const novaLista = [...posProcesso];
                          novaLista[index].nome = e.target.value;
                          setPosProcesso(novaLista);
                        }}
                        className="w-full bg-transparent border-0 border-b border-zinc-200 dark:border-white/10 text-[11px] font-black uppercase tracking-tight text-zinc-900 dark:text-white outline-none focus:border-amber-500 py-1 transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-20">
                      <input
                        type="number"
                        placeholder="0,00"
                        value={item.valor === 0 ? "" : item.valor}
                        onChange={(e) => {
                          const novaLista = [...posProcesso];
                          novaLista[index].valor = Number(e.target.value);
                          setPosProcesso(novaLista);
                        }}
                        className="w-full bg-transparent border-0 border-b border-zinc-200 dark:border-white/10 text-[11px] font-black text-center text-zinc-900 dark:text-white outline-none focus:border-amber-500 py-1 transition-colors"
                      />
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">R$</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPosProcesso(posProcesso.filter(i => i.id !== item.id))}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                <div className="pt-2 px-3 flex justify-end">
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Total em Pós-Processamento</p>
                    <p className="text-xs font-black text-zinc-900 dark:text-white">
                      {posProcesso.reduce((acc, i) => acc + (i.valor || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
