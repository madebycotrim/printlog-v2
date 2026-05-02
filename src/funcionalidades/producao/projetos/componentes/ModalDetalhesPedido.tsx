import { Pedido } from "../tipos";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { 
  Package, User, Clock, DollarSign, Calendar, 
  Settings, Box, MessageSquare, CheckCircle2, 
  TrendingUp, Info
} from "lucide-react";
import { centavosParaReais, formatarDataCompleta } from "@/compartilhado/utilitarios/formatadores";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { useMemo } from "react";
import { usarArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";

interface PropriedadesModalDetalhes {
  aberto: boolean;
  aoFechar: () => void;
  pedido: Pedido | null;
}

export function ModalDetalhesPedido({ aberto, aoFechar, pedido }: PropriedadesModalDetalhes) {
  const { impressoras } = usarArmazemImpressoras();

  const configStatus = useMemo(() => {
    if (!pedido) return { cor: "zinc", label: "Pendente", bg: "bg-zinc-500/10", text: "text-zinc-500", glow: "shadow-zinc-500/20" };
    switch (pedido.status) {
      case StatusPedido.A_FAZER:
        return { cor: "amber", label: "A Fazer", bg: "bg-amber-500/10", text: "text-amber-500", glow: "shadow-amber-500/20" };
      case StatusPedido.EM_PRODUCAO:
        return { cor: "emerald", label: "Produzindo", bg: "bg-emerald-500/10", text: "text-emerald-500", glow: "shadow-emerald-500/20" };
      case StatusPedido.ACABAMENTO:
        return { cor: "indigo", label: "Acabamento", bg: "bg-indigo-500/10", text: "text-indigo-500", glow: "shadow-indigo-500/20" };
      case StatusPedido.CONCLUIDO:
        return { cor: "sky", label: "Concluído", bg: "bg-sky-500/10", text: "text-sky-500", glow: "shadow-sky-500/20" };
      default:
        return { cor: "zinc", label: "Pendente", bg: "bg-zinc-500/10", text: "text-zinc-500", glow: "shadow-zinc-500/20" };
    }
  }, [pedido?.status]);

  if (!pedido) return null;

  const impressora = impressoras.find(i => i.id === pedido.idImpressora);

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Projeto em Detalhes"
      larguraMax="max-w-3xl"
    >
      <div className="flex flex-col gap-8 p-1">
        {/* Hero Section - Status e Nome */}
        <div className="relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-black border border-white/5 shadow-2xl">
          {/* Fundo Decorativo */}
          <div className={`absolute -right-20 -top-20 w-64 h-64 ${configStatus.bg.replace('/10', '/5')} blur-[100px] rounded-full`} />
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Ícone 3D de Status */}
              <div className={`relative w-20 h-20 flex items-center justify-center rounded-3xl ${configStatus.bg} ${configStatus.text} border border-white/10 shadow-2xl overflow-hidden group`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
                <Package size={36} strokeWidth={1.5} className="relative z-10 drop-shadow-2xl" />
              </div>
              
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full ${configStatus.bg} ${configStatus.text} text-[9px] font-black uppercase tracking-[0.2em] border border-white/5`}>
                    {configStatus.label}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ID: #{pedido.id.slice(0, 8)}</span>
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight max-w-md">
                  {pedido.descricao}
                </h2>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end bg-white/[0.03] backdrop-blur-md p-6 rounded-3xl border border-white/10 min-w-[180px]">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Valor Estimado</span>
              <span className="text-3xl font-black text-emerald-400 tabular-nums drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                {centavosParaReais(pedido.valorCentavos)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          {/* Card: Cliente */}
          <div className="flex flex-col gap-4 p-5 rounded-3xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-800/50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <User size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Responsável</span>
                <span className="text-sm font-black text-zinc-100 uppercase truncate">{pedido.nomeCliente || "Cliente Avulso"}</span>
              </div>
            </div>
          </div>

          {/* Card: Data Criação */}
          <div className="flex flex-col gap-4 p-5 rounded-3xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-800/50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                <Calendar size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Ingressou em</span>
                <span className="text-sm font-black text-zinc-100">{formatarDataCompleta(pedido.dataCriacao)}</span>
              </div>
            </div>
          </div>

          {/* Card: Prazo */}
          <div className={`flex flex-col gap-4 p-5 rounded-3xl border transition-all group ${pedido.prazoEntrega ? 'bg-zinc-900/50 border-white/5 hover:bg-zinc-800/50' : 'bg-zinc-900/20 border-dashed border-white/10 opacity-60'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${pedido.prazoEntrega ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-500/10 text-zinc-500'}`}>
                <Clock size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Prazo de Entrega</span>
                <span className={`text-sm font-black ${pedido.prazoEntrega ? 'text-zinc-100' : 'text-zinc-600 italic'}`}>
                  {pedido.prazoEntrega ? formatarDataCompleta(pedido.prazoEntrega) : "Não agendado"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Técnicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Settings size={14} className="text-zinc-600" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Parâmetros de Produção</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Insumo Base</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  <span className="text-xs font-black text-zinc-200 uppercase truncate">{pedido.material || "Filamento"}</span>
                </div>
              </div>
              <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Massa Estimada</span>
                <span className="text-xs font-black text-zinc-200 tabular-nums">{pedido.pesoGramas || 0}g</span>
              </div>
              <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Tempo de Máquina</span>
                <span className="text-xs font-black text-zinc-200 tabular-nums">{pedido.tempoMinutos || 0} min</span>
              </div>
              <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Equipamento Alocado</span>
                <span className="text-xs font-black text-amber-500 uppercase truncate">{impressora?.nome || "Em espera..."}</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Box size={14} className="text-zinc-600" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Insumos & Adicionais</h3>
            </div>
            
            <div className="min-h-[140px] p-2 rounded-[2rem] bg-white/[0.02] border border-white/5">
              {pedido.insumosSecundarios && pedido.insumosSecundarios.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {pedido.insumosSecundarios.map((insumo, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                          <CheckCircle2 size={14} />
                        </div>
                        <span className="text-[11px] font-black text-zinc-300 uppercase tracking-tight">{insumo.nome}</span>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest">x{insumo.quantidade}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 opacity-40">
                  <Info size={24} className="text-zinc-600 mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Sem insumos extras</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Observações */}
        {pedido.observacoes && (
          <div className="px-4">
            <div className="p-6 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 border-dashed">
              <div className="flex items-center gap-3 mb-4 opacity-50">
                <MessageSquare size={14} className="text-zinc-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Notas de Produção</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium italic pl-7 border-l-2 border-indigo-500/20">
                "{pedido.observacoes}"
              </p>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="pt-6 pb-4 border-t border-white/5 flex justify-center">
          <button
            onClick={aoFechar}
            className="group relative px-12 py-4 bg-zinc-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all border border-white/5 shadow-2xl active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">Concluir Visualização</span>
          </button>
        </div>
      </div>
    </Dialogo>
  );
}
