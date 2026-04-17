import { MoreVertical, Edit2, Archive, Wrench, Activity, CheckCircle2, PlayCircle } from "lucide-react";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  calcularPercentualVidaUtil,
  obterStatusManutencao,
  obterCorStatusManutencao,
} from "../utilitarios/utilitariosManutencao";
import { StatusImpressora } from "@/compartilhado/tipos/modelos";

interface PropriedadesCardImpressora {
  impressora: Impressora;
  aoEditar: (impressora: Impressora) => void;
  aoAposentar: (impressora: Impressora) => void;
  aoDetalhes?: (impressora: Impressora) => void;
  aoManutencoes?: (impressora: Impressora) => void;
}

export function CardImpressora({
  impressora,
  aoEditar,
  aoAposentar,
  aoDetalhes,
  aoManutencoes,
}: PropriedadesCardImpressora) {
  const [menuAberto, definirMenuAberto] = useState(false);
  const referenciaMenu = useRef<HTMLDivElement>(null);
  const fecharMenu = useCallback(() => definirMenuAberto(false), []);

  useEffect(() => {
    const lidarComCliqueFora = (e: MouseEvent) => {
      if (referenciaMenu.current && !referenciaMenu.current.contains(e.target as Node)) fecharMenu();
    };
    const lidarComTeclaEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") fecharMenu();
    };
    if (menuAberto) {
      document.addEventListener("mousedown", lidarComCliqueFora);
      document.addEventListener("keydown", lidarComTeclaEsc);
    }
    return () => {
      document.removeEventListener("mousedown", lidarComCliqueFora);
      document.removeEventListener("keydown", lidarComTeclaEsc);
    };
  }, [menuAberto, fecharMenu]);

  const statusImpressora = impressora.status as StatusImpressora;
  const estaImprimindo = statusImpressora === StatusImpressora.IMPRIMINDO;

  // Lógica de Saúde do Sistema (Reversa da Vida Útil)
  const saudeSistema = 100 - calcularPercentualVidaUtil(
    impressora.horimetroTotalMinutos || 0,
    impressora.intervaloRevisaoMinutos || 0,
  );
  
  const statusManutencaoUI = obterStatusManutencao(
    impressora.horimetroTotalMinutos || 0,
    impressora.intervaloRevisaoMinutos || 0,
  );
  const coresManutencao = obterCorStatusManutencao(statusManutencaoUI);

  const configStatus = useMemo(() => {
    switch (statusImpressora) {
      case StatusImpressora.IMPRIMINDO:
        return {
          cor: "#10b981",
          icone: PlayCircle,
          label: "Imprimindo",
          sub: "Job em progresso...",
          bg: "bg-emerald-500",
          texto: "text-emerald-500",
        };
      case StatusImpressora.MANUTENCAO:
        return { 
          cor: "#f59e0b", 
          icone: Wrench, 
          label: "Manutenção", 
          sub: "Indisponível",
          bg: "bg-amber-500",
          texto: "text-amber-500",
        };
      case StatusImpressora.LIVRE:
      default:
        return { 
          cor: "#3b82f6", 
          icone: CheckCircle2, 
          label: "Disponível", 
          sub: "Pronta",
          bg: "bg-sky-500",
          texto: "text-sky-500",
        };
    }
  }, [statusImpressora]);

  const corDestaque = statusManutencaoUI === "critico" ? "#f43f5e" : configStatus.cor;
  const horasUsadas = Math.floor((impressora.horimetroTotalMinutos || 0) / 60);

  return (
    <motion.div
      layout
      onClick={() => aoDetalhes?.(impressora)}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative flex flex-col h-full rounded-2xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/[0.04] overflow-hidden transition-all duration-300 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] cursor-pointer"
    >
      {/* ═══════ HEADER: IDENTIDADE ═══════ */}
      <div className="p-5 flex justify-between items-start relative z-20">
        <div className="flex flex-col min-w-0 pr-4">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600 mb-1">
            {impressora.marca || "Custom"} {impressora.modeloBase}
          </span>
          <h4 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none uppercase">
            {impressora.nome}
          </h4>
        </div>
        
        <div className="flex items-center gap-3" ref={referenciaMenu}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              definirMenuAberto(!menuAberto);
            }}
            className={`p-2 rounded-xl transition-all ${menuAberto ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-400 hover:bg-gray-50 dark:hover:bg-white/5"}`}
          >
            <MoreVertical size={18} />
          </button>
          
          <AnimatePresence>
            {menuAberto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 top-12 w-52 bg-white dark:bg-[#18181b] border border-zinc-100 dark:border-white/10 rounded-xl shadow-2xl z-50 p-1.5"
              >
                <button onClick={(e) => { e.stopPropagation(); aoManutencoes?.(impressora); fecharMenu(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black hover:bg-zinc-50 dark:hover:bg-white/5 rounded-lg transition-all uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  <Wrench size={14} /> Manutenções
                </button>
                <button onClick={(e) => { e.stopPropagation(); aoEditar(impressora); fecharMenu(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black hover:bg-zinc-50 dark:hover:bg-white/5 rounded-lg transition-all uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  <Edit2 size={14} /> Editar Setup
                </button>
                <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                <button onClick={(e) => { e.stopPropagation(); aoAposentar(impressora); fecharMenu(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all uppercase tracking-widest">
                  <Archive size={14} /> Desativar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════ CORPO: VISUAL ═══════ */}
      <div className="flex-1 relative flex items-center justify-center p-6 min-h-[160px]">
        {/* Glow de Status sutil */}
        <div 
          className="absolute inset-0 blur-[60px] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{ backgroundColor: statusManutencaoUI === "critico" ? "#f43f5e" : configStatus.cor }}
        />

        <div className="relative z-10 transition-transform duration-500 group-hover:scale-105">
          {impressora.imagemUrl ? (
            <img src={impressora.imagemUrl} alt={impressora.nome} className="max-h-[140px] w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.2)]" />
          ) : (
            <div className="w-24 h-24 rounded-full border border-dashed border-zinc-200 dark:border-white/10 flex items-center justify-center bg-zinc-50/30 dark:bg-white/[0.01]">
               <Activity size={24} className="text-zinc-200 dark:text-zinc-800 opacity-50" />
            </div>
          )}
        </div>
      </div>

      {/* ═══════ FOOTER: MÉTRICAS TÉCNICAS ═══════ */}
      <div className="p-6 pt-0 space-y-6">
        <div className="flex items-end justify-between border-t border-gray-100 dark:border-white/[0.04] pt-5">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600 mb-1">
              Produção Total
            </span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter tabular-nums leading-none">
              {horasUsadas}
              <span className="text-[10px] uppercase opacity-30 ml-1">hrs</span>
            </div>
          </div>

          <div className="flex flex-col items-end text-right">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600 mb-1">
              Saúde do Ativo
            </span>
            <div className={`text-2xl font-black tracking-tighter tabular-nums leading-none ${coresManutencao.text}`}>
              {Math.max(0, Math.round(saudeSistema))}%
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden relative shadow-inner">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${Math.max(0, saudeSistema)}%` }} transition={{ duration: 1 }}
              className={`h-full rounded-full ${coresManutencao.bg} relative`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            </motion.div>
          </div>
          
          <div className="flex justify-between items-center opacity-50">
             <span className="text-[7px] font-bold text-zinc-400 dark:text-zinc-700 uppercase tracking-widest">
               Status Nominal
             </span>
             <span className="text-[7px] font-bold text-zinc-400 dark:text-zinc-700 uppercase tracking-widest">
               Revisão: {Math.max(0, (impressora.intervaloRevisaoMinutos || 0) - (impressora.horimetroTotalMinutos || 0))}m
             </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
