import { Crown, Info } from "lucide-react";

/**
 * Banner de Exclusividade - Comunica a estratégia de Maker Fundador (apenas 51 vagas).
 */
export function BannerExclusividade() {
  const vagasRestantes = 12; // Mock para exemplo, no futuro viria de uma API/Contador
  const totalFundadores = 51;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-indigo-700 p-8 text-white shadow-2xl shadow-sky-500/20">
      {/* Decoração de Background */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        {/* Ícone de Destaque */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-inner">
          <Crown size={40} className="fill-white animate-pulse" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <h2 className="text-2xl font-black tracking-tight uppercase">
            Clube dos 51: <span className="text-sky-200">Makers Fundadores</span>
          </h2>
          <p className="max-w-xl text-sm font-medium text-sky-50/80 leading-relaxed">
            Estamos construindo algo grande. Como parte da nossa estratégia de lançamento, apenas os primeiros <span className="font-bold text-white underline underline-offset-4Decoration-sky-400">{totalFundadores} usuários</span> terão o título vitalício de <strong>Maker Fundador</strong>. Todos os demais ingressarão como Maker Pro.
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 text-[10px] font-black uppercase tracking-widest border border-white/10">
                <Info size={12} />
                <span>Legacy Badge Vitalício</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 text-[10px] font-black uppercase tracking-widest border border-white/10">
                <Crown size={12} className="text-sky-300" />
                <span>Prioridade no Roadmap</span>
             </div>
          </div>
        </div>

        {/* Contador de Vagas */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 text-indigo-900 shadow-xl min-w-[140px]">
          <span className="text-3xl font-black leading-none">{vagasRestantes}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-900/50 mt-1">Vagas Restantes</span>
          <div className="mt-4 h-1.5 w-full rounded-full bg-indigo-100 overflow-hidden">
             <div 
               className="h-full bg-indigo-600 transition-all duration-1000" 
               style={{ width: `${(vagasRestantes / totalFundadores) * 100}%` }}
             />
          </div>
        </div>
      </div>
    </div>
  );
}
