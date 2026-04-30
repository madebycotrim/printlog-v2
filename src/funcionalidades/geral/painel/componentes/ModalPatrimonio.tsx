import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { Package, Box, Wallet, PieChart, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface ModalPatrimonioProps {
  aberto: boolean;
  aoFechar: () => void;
  materiais: Material[];
  insumos: Insumo[];
  valorTotal: number;
}

export function ModalPatrimonio({ aberto, aoFechar, materiais, insumos, valorTotal }: ModalPatrimonioProps) {
  const metricas = useMemo(() => {
    const totalMateriais = materiais.reduce((acc, m) => {
      const pesoTotal = m.pesoRestanteGramas + m.estoque * (m.pesoGramas || 1000);
      const custoPorGrama = m.precoCentavos / (m.pesoGramas || 1000);
      return acc + (pesoTotal * custoPorGrama);
    }, 0);

    const totalInsumos = insumos.reduce((acc, i) => acc + (i.quantidadeAtual * (i.custoMedioUnidade || 0)), 0);

    return {
      totalMateriais,
      totalInsumos,
      qtdMateriais: materiais.length,
      qtdInsumos: insumos.length
    };
  }, [materiais, insumos]);

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Detalhamento do Patrimônio em Estoque"
      larguraMax="max-w-4xl"
    >
      <div className="p-8 space-y-8">
        {/* 📋 CABEÇALHO INTERNO */}
        <div className="space-y-1">
           <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium leading-relaxed">
              Visão analítica de todos os ativos imobilizados no seu inventário, consolidando filamentos, resinas e peças técnicas.
           </p>
        </div>

        {/* 📊 RESUMO ANALÍTICO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col gap-2">
             <div className="flex items-center gap-3 text-indigo-500 mb-2">
                <PieChart size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Materiais Brutos</span>
             </div>
             <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                {centavosParaReais(metricas.totalMateriais)}
             </span>
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                {metricas.qtdMateriais} Itens Cadastrados
             </span>
          </div>

          <div className="p-6 rounded-3xl bg-sky-500/5 border border-sky-500/10 flex flex-col gap-2">
             <div className="flex items-center gap-3 text-sky-500 mb-2">
                <Box size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Insumos Técnicos</span>
             </div>
             <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                {centavosParaReais(metricas.totalInsumos)}
             </span>
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                {metricas.qtdInsumos} Peças em Prateleira
             </span>
          </div>

          <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-2 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Wallet size={40} className="text-emerald-500" />
             </div>
             <div className="flex items-center gap-3 text-emerald-500 mb-2">
                <Wallet size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Patrimônio Total</span>
             </div>
             <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                {centavosParaReais(valorTotal)}
             </span>
             <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">
                Consolidado (M + I)
             </span>
          </div>
        </div>

        {/* 📋 LISTAGEM DE ITENS */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Relação de Ativos</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/5">
                 <Info size={10} className="text-zinc-400" />
                 <span className="text-[8px] font-bold text-zinc-500 uppercase">Valores baseados no preço de aquisição</span>
              </div>
           </div>

           <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {/* SEÇÃO: MATERIAIS */}
              <div className="sticky top-0 bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md py-2 z-10">
                 <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest px-2">Filamentos & Resinas</span>
              </div>
              
              {materiais.map((m) => {
                const pesoTotal = m.pesoRestanteGramas + m.estoque * (m.pesoGramas || 1000);
                const custoPorGrama = m.precoCentavos / (m.pesoGramas || 1000);
                const valorItem = pesoTotal * custoPorGrama;

                return (
                  <motion.div 
                    layout
                    key={m.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/[0.02] border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                          <Package size={20} />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{m.nome}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                             {pesoTotal}g disponíveis ({m.estoque} rolos fechados)
                          </span>
                       </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-sm font-black text-gray-900 dark:text-white tracking-tighter">
                          {centavosParaReais(valorItem)}
                       </span>
                       <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                          {centavosParaReais(m.precoCentavos)} / un
                       </span>
                    </div>
                  </motion.div>
                );
              })}

              {/* SEÇÃO: INSUMOS */}
              <div className="sticky top-0 bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md py-2 z-10 mt-6">
                 <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest px-2">Insumos Técnicos</span>
              </div>

              {insumos.map((i) => {
                const valorItem = i.quantidadeAtual * (i.custoMedioUnidade || 0);

                return (
                  <motion.div 
                    layout
                    key={i.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/[0.02] border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                          <Box size={20} />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{i.nome}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                             {i.quantidadeAtual} {i.unidadeMedida} em estoque
                          </span>
                       </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-sm font-black text-gray-900 dark:text-white tracking-tighter">
                          {centavosParaReais(valorItem)}
                       </span>
                       <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                          {centavosParaReais(i.custoMedioUnidade || 0)} / un
                       </span>
                    </div>
                  </motion.div>
                );
              })}

              {materiais.length === 0 && insumos.length === 0 && (
                <div className="py-12 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
                   Nenhum item valorizado em estoque.
                </div>
              )}
           </div>
        </div>
      </div>
    </Dialogo>
  );
}
