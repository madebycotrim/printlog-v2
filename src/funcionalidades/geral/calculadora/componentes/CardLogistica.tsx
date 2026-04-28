import { Warehouse, Settings } from "lucide-react";
import { PerfilMarketplace } from "../tipos";

interface CardLogisticaProps {
  perfis: PerfilMarketplace[];
  perfilAtivo: string;
  setPerfilAtivo: (v: string) => void;
  taxaEcommerce: number;
  setTaxaEcommerce: (v: number) => void;
  taxaFixa: number;
  setTaxaFixa: (v: number) => void;
  frete: number;
  setFrete: (v: number) => void;
  abrirPerfis: () => void;
}

export function CardLogistica({
  perfis, perfilAtivo, setPerfilAtivo, taxaEcommerce, setTaxaEcommerce, taxaFixa, setTaxaFixa, frete, setFrete, abrirPerfis
}: CardLogisticaProps) {
  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
        <Warehouse size={18} className="text-indigo-500" />
        <h3 className="text-xs font-black uppercase tracking-widest">Canais de Venda e Logística</h3>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {perfis.map((p) => (
          <button
            key={p.nome}
            onClick={() => {
              if (perfilAtivo === p.nome) {
                setPerfilAtivo("");
                setTaxaEcommerce(0);
                setTaxaFixa(0);
                setFrete(0);
              } else {
                setPerfilAtivo(p.nome);
                setTaxaEcommerce(p.taxa);
                setTaxaFixa(p.fixa);
                if (p.frete !== undefined) setFrete(p.frete);
              }
            }}
            className={`px-4 h-11 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider flex flex-col items-center justify-center text-center leading-tight shrink-0
              ${perfilAtivo === p.nome ? "bg-sky-500/10 border-sky-500 text-sky-500 shadow-sm" : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 hover:border-sky-500/30"}
            `}
          >
            <span>{p.nome}</span>
            <span className={`text-[8px] font-bold opacity-80 ${perfilAtivo === p.nome ? "text-sky-500/80" : "text-gray-400"}`}>({p.taxa}% + R$ {p.fixa} + R$ {p.frete || 0})</span>
          </button>
        ))}
        <button onClick={abrirPerfis} className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-zinc-400 hover:text-sky-500 hover:bg-sky-500/10 transition-all shrink-0">
          <Settings size={16} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-50 dark:border-white/5">
        <div>
          <label className="block text-xs font-black uppercase text-gray-400 mb-1.5">Comissão (%)</label>
          <input type="number" value={taxaEcommerce} onChange={(e) => setTaxaEcommerce(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
        </div>
        <div>
          <label className="block text-xs font-black uppercase text-gray-400 mb-1.5">Taxa Fixa (R$)</label>
          <input type="number" value={taxaFixa} onChange={(e) => setTaxaFixa(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
        </div>
        <div>
          <label className="block text-xs font-black uppercase text-gray-400 mb-1.5">Frete (R$)</label>
          <input type="number" value={frete} onChange={(e) => setFrete(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
        </div>
      </div>
    </div>
  );
}
