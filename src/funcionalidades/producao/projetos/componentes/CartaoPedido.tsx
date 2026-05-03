import { DollarSign, User, MoreVertical, Trash2, Edit3, Clock, Package } from "lucide-react";
import { toast } from "react-hot-toast";
import { Pedido } from "../tipos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import { usarPedidos } from "../hooks/usarPedidos";
import { verificarSeEstaAtrasado } from "@/compartilhado/utilitarios/gestaoAtrasos";
import { formatarDataCurta } from "@/compartilhado/utilitarios/formatadores";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { usarArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { ModalDetalhesPedido } from "./ModalDetalhesPedido";
import { ModalFalhaProjeto } from "./ModalFalhaProjeto";
import { ModalExcluirPedido } from "./ModalExcluirPedido";
import { Settings } from "lucide-react";

interface PropriedadesCartaoPedido {
  pedido: Pedido;
  abrirFormularioEdicao?: (id: string) => void;
}


// 🎉 Mini-componente de Confetes Discretos
function EfeitoConfeteDiscreto() {
  const particulas = Array.from({ length: 15 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-[100]">
      {particulas.map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: "50%", y: "50%", scale: 0, opacity: 1 }}
          animate={{ 
            x: `${Math.random() * 200 - 50}%`, 
            y: `${Math.random() * -150 - 20}%`, 
            scale: [0, 1, 0.5, 0],
            opacity: [1, 1, 0],
            rotate: Math.random() * 360 
          }}
          transition={{ 
            duration: 1.2, 
            ease: "easeOut",
            delay: Math.random() * 0.1
          }}
          className="absolute w-1 h-1 rounded-sm"
          style={{ 
            backgroundColor: ['#0ea5e9', '#38bdf8', '#ffffff', '#7dd3fc'][Math.floor(Math.random() * 4)] 
          }}
        />
      ))}
    </div>
  );
}

export function CartaoPedido({ pedido, abrirFormularioEdicao }: PropriedadesCartaoPedido) {
  const { excluirPedido, moverPedido, idsBloqueados } = usarPedidos();
  const bloqueado = idsBloqueados.includes(pedido.id);
  const { impressoras } = usarArmazemImpressoras();
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalFalhaAberto, setModalFalhaAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [exibirConfete, setExibirConfete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const estaAtrasado = useMemo(() => verificarSeEstaAtrasado(pedido), [pedido]);

  useEffect(() => {
    const clicarFora = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    };
    document.addEventListener("mousedown", clicarFora);
    return () => document.removeEventListener("mousedown", clicarFora);
  }, []);

  // Configuração Visual do Status
  const configStatus = useMemo(() => {
    switch (pedido.status) {
      case StatusPedido.A_FAZER:
        return { cor: "zinc", label: "A Fazer" };
      case StatusPedido.EM_PRODUCAO:
        return { cor: "emerald", label: "Produzindo" };
      case StatusPedido.ACABAMENTO:
        return { cor: "amber", label: "Acabamento" };
      case StatusPedido.CONCLUIDO:
        return { cor: "sky", label: "Concluído" };
      default:
        return { cor: "zinc", label: "Pendente" };
    }
  }, [pedido.status]);

  return (
    <div
      draggable={!menuAberto && !bloqueado}
      onDragStart={(e) => {
        if (menuAberto || bloqueado) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("text/plain", pedido.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={(e) => {
        if (bloqueado) return;
        e.preventDefault();
        e.stopPropagation();
        if (!menuAberto) setModalDetalhesAberto(true);
      }}
      className={`${menuAberto || bloqueado ? "cursor-default" : "cursor-grab active:cursor-grabbing"} group/card ${menuAberto ? "relative z-[100]" : "relative z-10"} active:scale-[0.98] transition-all duration-300 ${bloqueado ? "opacity-50 grayscale-[0.5]" : ""}`}
    >
      <div
        className={`
          relative p-3 rounded-xl border transition-all duration-300
          bg-[#121214] border-white/5 group-hover/card:border-white/10
          ${estaAtrasado ? "border-rose-500/30 ring-1 ring-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]" : "hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"}
          ${menuAberto ? "z-[100]" : "z-10"}
        `}
      >
        <AnimatePresence>
          {exibirConfete && <EfeitoConfeteDiscreto />}
          {bloqueado && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[120] flex items-center justify-center bg-[#121214]/40 rounded-xl backdrop-blur-[1px]"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">Gravando...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow de Status Lateral */}
        <div className={`absolute left-0 top-3 bottom-3 w-[1px] rounded-r-full bg-${configStatus.cor}-500/60 shadow-[0_0_8px_rgba(var(--${configStatus.cor}-rgb),0.4)]`} />

        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between mb-2 relative pl-2">
          <div className="flex-1 min-w-0 mr-2">
            <div className="flex items-center gap-1 mb-1 opacity-40 group-hover/card:opacity-70 transition-opacity">
              <User size={8} className="text-zinc-500" />
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 truncate">
                {pedido.nomeCliente || "Cliente avulso"}
              </span>
            </div>
            <h4 className="text-[11px] font-bold text-white/90 group-hover/card:text-white leading-tight tracking-tight line-clamp-1 uppercase">
              {pedido.descricao}
            </h4>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuAberto(!menuAberto);
              }}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${menuAberto ? "bg-white/10 text-white" : "text-zinc-700 hover:text-white group-hover/card:opacity-100"}`}
            >
              <MoreVertical size={14} />
            </button>

            <AnimatePresence>
              {menuAberto && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1 w-44 bg-[#1a1a1e] border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-1 z-[110]"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      abrirFormularioEdicao?.(pedido.id);
                      setMenuAberto(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Edit3 size={12} className="text-indigo-400" /> Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setModalFalhaAberto(true);
                      setMenuAberto(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Settings size={12} className="text-amber-500/70" /> Registrar Falha
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setModalExcluirAberto(true);
                      setMenuAberto(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-rose-500/70 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={12} /> Excluir
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Métricas e Status */}
        <div className="space-y-3 relative pl-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <DollarSign size={10} className="text-indigo-400" />
              <span className="text-[11px] font-black text-zinc-100/90 group-hover/card:text-white">
                {centavosParaReais(pedido.valorCentavos)}
              </span>
            </div>

            {pedido.prazoEntrega && (
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-tighter transition-colors ${
                  estaAtrasado
                    ? "bg-rose-500 text-white border-rose-400 animate-pulse"
                    : "bg-white/[0.02] border-white/5 text-zinc-500 group-hover/card:border-white/10"
                }`}
              >
                <Clock size={8} />
                {formatarDataCurta(pedido.prazoEntrega)}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.03]">
            {pedido.status === StatusPedido.A_FAZER ? (
              <div className="flex flex-col gap-2 w-full pt-1">
                <span className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-0.5 ml-1 opacity-70 group-hover/card:opacity-100 transition-opacity">
                  Orçamento Pendente
                </span>
                <div className="flex items-center gap-2 w-full">
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      moverPedido(pedido.id, StatusPedido.EM_PRODUCAO);
                    }}
                    className="flex-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/0 hover:shadow-emerald-500/20"
                  >
                    Aprovar
                  </button>
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setModalExcluirAberto(true);
                    }}
                    className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border border-rose-500/20"
                  >
                    X
                  </button>
                </div>
              </div>
            ) : pedido.status === StatusPedido.EM_PRODUCAO ? (
              <div className="flex items-center gap-2 w-full">
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    moverPedido(pedido.id, StatusPedido.ACABAMENTO);
                  }}
                  className="flex-1 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-indigo-500/20"
                >
                  Pronto p/ Acabamento
                </button>
              </div>
            ) : pedido.status === StatusPedido.ACABAMENTO ? (
              <div className="flex items-center gap-2 w-full relative">
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setExibirConfete(true);
                    moverPedido(pedido.id, StatusPedido.CONCLUIDO);
                    setTimeout(() => setExibirConfete(false), 1500);
                  }}
                  className="flex-1 bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-sky-500/20"
                >
                  Marcar como Concluído
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 opacity-40 group-hover/card:opacity-60 transition-opacity">
                  <Package size={10} className="text-zinc-600" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 truncate max-w-[70px]">
                    {pedido.material || "Filamento"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {pedido.idImpressora && (
                    <div className="flex items-center gap-1 mr-1">
                      <Settings size={8} className="text-amber-500/50" />
                      <span className="text-[8px] font-black uppercase text-amber-500/70">
                        {impressoras.find(i => i.id === pedido.idImpressora)?.nome || "Máquina"}
                      </span>
                    </div>
                  )}
                  {pedido.pesoGramas && pedido.pesoGramas > 0 && (
                    <span className="text-[8px] font-bold text-zinc-600 uppercase">{pedido.pesoGramas}g</span>
                  )}
                  {pedido.tempoMinutos && pedido.tempoMinutos > 0 && (
                    <span className="text-[8px] font-bold text-zinc-600 uppercase">{pedido.tempoMinutos}m</span>
                  )}
                  <div className={`w-1 h-1 rounded-full bg-${configStatus.cor}-500 shadow-[0_0_8px_rgba(var(--${configStatus.cor}-rgb),0.6)]`} />
                  <span className={`text-[8px] font-black uppercase tracking-tighter text-${configStatus.cor}-500/80`}>
                    {configStatus.label}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ModalDetalhesPedido 
        aberto={modalDetalhesAberto} 
        aoFechar={() => setModalDetalhesAberto(false)} 
        pedido={pedido} 
      />

      <ModalFalhaProjeto
        aberto={modalFalhaAberto}
        aoFechar={() => setModalFalhaAberto(false)}
        pedido={pedido}
        aoConfirmar={() => {
          // Aqui no futuro chamaremos o serviço real
          toast.success("Falha registrada. O sistema descontou o material perdido.");
        }}
      />

      <ModalExcluirPedido
        aberto={modalExcluirAberto}
        aoFechar={() => setModalExcluirAberto(false)}
        pedido={pedido}
        aoConfirmar={(id) => excluirPedido(id)}
      />
    </div>
  );
}
