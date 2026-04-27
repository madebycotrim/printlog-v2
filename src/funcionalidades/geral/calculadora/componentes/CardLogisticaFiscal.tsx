import { Warehouse, TrendingUp, Settings } from "lucide-react";
import { PerfilMarketplace } from "../tipos";

interface CardLogisticaFiscalProps {
  perfis: PerfilMarketplace[];
  perfilAtivo: string;
  setPerfilAtivo: (v: string) => void;
  taxaEcommerce: number;
  setTaxaEcommerce: (v: number) => void;
  taxaFixa: number;
  setTaxaFixa: (v: number) => void;
  frete: number;
  setFrete: (v: number) => void;
  tipoOperacao: string;
  setTipoOperacao: (v: any) => void;
  impostos: number;
  setImpostos: (v: number) => void;
  icms: number;
  setIcms: (v: number) => void;
  iss: number;
  setIss: (v: number) => void;
  abrirPerfis: () => void;
}

export function CardLogisticaFiscal({
  perfis, perfilAtivo, setPerfilAtivo, taxaEcommerce, setTaxaEcommerce, taxaFixa, setTaxaFixa, frete, setFrete,
  tipoOperacao, setTipoOperacao, impostos, setImpostos, icms, setIcms, iss, setIss, abrirPerfis
}: CardLogisticaFiscalProps) {
  return (
    <div className="space-y-6">
      {/* Logística */}
      <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
          <Warehouse size={18} className="text-indigo-500" />
          <h3 className="text-xs font-black uppercase tracking-widest">Logística e Canais</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {perfis.map((p) => (
            <button
              key={p.nome}
              onClick={() => { setPerfilAtivo(p.nome); setTaxaEcommerce(p.taxa); setTaxaFixa(p.fixa); if (p.imp !== undefined) setImpostos(p.imp); }}
              className={`px-4 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest flex flex-col items-start leading-tight
                ${perfilAtivo === p.nome ? "bg-sky-500/10 border-sky-500 text-sky-500 shadow-sm" : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 hover:border-sky-500/30"}
              `}
            >
              <span>{p.nome}</span>
              <span className={`text-[7px] opacity-60 ${perfilAtivo === p.nome ? "text-sky-500" : "text-gray-400"}`}>({p.taxa}% + R$ {p.fixa})</span>
            </button>
          ))}
          <button onClick={abrirPerfis} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 hover:text-amber-500 transition-all"><Settings size={14} /></button>
        </div>
        <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-50 dark:border-white/5">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Comissão (%)</label>
            <input type="number" value={taxaEcommerce} onChange={(e) => setTaxaEcommerce(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Taxa Fixa (R$)</label>
            <input type="number" value={taxaFixa} onChange={(e) => setTaxaFixa(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Frete (R$)</label>
            <input type="number" value={frete} onChange={(e) => setFrete(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
          </div>
        </div>
      </div>

      {/* Fiscal */}
      <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
          <TrendingUp size={18} className="text-rose-500" />
          <h3 className="text-xs font-black uppercase tracking-widest">Estrutura Fiscal</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['produto', 'servico', 'industrializacao', 'mei'].map((id) => (
            <button
              key={id}
              onClick={() => {
                setTipoOperacao(id as any);
                if (id === 'mei') { setIcms(0); setIss(0); setImpostos(0); }
                else if (id === 'servico') { setIcms(0); setIss(5); }
                else { setIss(0); setIcms(18); }
              }}
              className={`px-4 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest
                ${tipoOperacao === id ? "bg-rose-500/10 border-rose-500 text-rose-500" : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 hover:border-rose-500/30"}
              `}
            >
              {id.toUpperCase()}
            </button>
          ))}
        </div>
        {tipoOperacao !== 'mei' && (
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-50 dark:border-white/5">
            <div><label className="text-[10px] font-black text-gray-400 uppercase">Base (%)</label><input type="number" value={impostos} onChange={(e) => setImpostos(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" /></div>
            {tipoOperacao !== 'servico' && <div><label className="text-[10px] font-black text-gray-400 uppercase">ICMS (%)</label><input type="number" value={icms} onChange={(e) => setIcms(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" /></div>}
            {tipoOperacao === 'servico' && <div><label className="text-[10px] font-black text-gray-400 uppercase">ISS (%)</label><input type="number" value={iss} onChange={(e) => setIss(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" /></div>}
          </div>
        )}
      </div>
    </div>
  );
}
