import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Scale, FileText, AlertCircle, Info, Zap } from "lucide-react";
import { RegistroUso } from "../tipos";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { Combobox } from "@/compartilhado/componentes/Combobox";
import { motion, AnimatePresence } from "framer-motion";

const esquemaConsumo = z
  .object({
    nomePeca: z.string().min(3, "Informe o motivo ou peça"),
    quantidadeGastaGramas: z.coerce.number().positive("Quantidade deve ser maior que zero"),
    status: z.enum(["SUCESSO", "FALHA", "CANCELADO", "MANUAL"]),
  })
  .required();

type ConsumoFormData = {
  nomePeca: string;
  quantidadeGastaGramas: number;
  status: "SUCESSO" | "FALHA" | "CANCELADO" | "MANUAL";
};

interface PropriedadesFormularioConsumo {
  aoSalvar: (dados: Omit<RegistroUso, "id" | "data">) => Promise<void>;
  aoCancelar: () => void;
  pesoDisponivel: number;
}

const OPCOES_STATUS = [
  { valor: "MANUAL", rotulo: "Ajuste Manual" },
  { valor: "FALHA", rotulo: "Falha de Impressão" },
  { valor: "CANCELADO", rotulo: "Cancelamento" },
];

const VALORES_RAPIDOS = [10, 50, 100, 250];
const MOTIVOS_SUGERIDOS = [
  "Falha na Impressão",
  "Teste de Retração",
  "Purga de Material",
  "Ajuste de Fluxo",
  "Peça de Teste",
];

export function FormularioConsumo({ aoSalvar, aoCancelar, pesoDisponivel }: PropriedadesFormularioConsumo) {
  const [salvando, setSalvando] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConsumoFormData>({
    resolver: zodResolver(esquemaConsumo) as any,
    defaultValues: {
      status: "MANUAL",
      quantidadeGastaGramas: 0,
    },
  });

  const quantidadeGasta = watch("quantidadeGastaGramas") || 0;
  const excesso = quantidadeGasta > pesoDisponivel;
  const statusAtual = watch("status");
  const pesoFinal = Math.max(0, pesoDisponivel - (Number(quantidadeGasta) || 0));

  const aoSubmeter = async (dados: any) => {
    try {
      setSalvando(true);
      await aoSalvar(dados as ConsumoFormData);
      aoCancelar();
    } catch (erro) {
      // Erro tratado no hook
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(aoSubmeter)} className="space-y-8">
      {/* ═══════ PREVISÃO VISUAL ═══════ */}
      <div className="relative p-5 rounded-2xl bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/5 overflow-hidden">
        <div className="flex justify-between items-end mb-4 relative z-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Peso Atual</span>
            <div className="text-xl font-black text-zinc-600 dark:text-zinc-500 tabular-nums">{pesoDisponivel}g</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block mb-1">Após Desconto</span>
            <div className={`text-3xl font-black tabular-nums transition-colors ${excesso ? 'text-rose-500' : 'text-emerald-500'}`}>
              {pesoFinal.toFixed(1)}g
            </div>
          </div>
        </div>

        {/* Barra de Progresso Visual */}
        <div className="h-2 w-full bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute inset-0 bg-emerald-500"
            initial={false}
            animate={{ width: `${(pesoFinal / pesoDisponivel) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Motivo com Sugestões */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <FileText size={12} /> Motivo do Abatimento
            </label>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {MOTIVOS_SUGERIDOS.map((motivo) => (
              <button
                key={motivo}
                type="button"
                onClick={() => setValue("nomePeca", motivo)}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all uppercase tracking-tight"
              >
                {motivo}
              </button>
            ))}
          </div>
          <CampoTexto
            placeholder="Descreva o motivo ou nome da peça..."
            erro={errors.nomePeca?.message}
            {...register("nomePeca")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quantidade com Valores Rápidos */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-3">
              <Scale size={12} /> Quantidade (g)
            </label>
            <div className="flex gap-2 mb-3">
              {VALORES_RAPIDOS.map((valor) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setValue("quantidadeGastaGramas", valor)}
                  className="flex-1 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] font-black text-sky-500 hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                >
                  {valor}g
                </button>
              ))}
            </div>
            <CampoTexto
              type="number"
              step="0.1"
              placeholder="0.0"
              erro={errors.quantidadeGastaGramas?.message}
              {...register("quantidadeGastaGramas")}
              className={excesso ? "border-rose-500 text-rose-500 focus:ring-rose-500" : ""}
            />
          </div>

          <Combobox
            titulo="Origem / Status"
            opcoes={OPCOES_STATUS}
            valor={statusAtual}
            aoAlterar={(val) => setValue("status", val as any)}
            icone={Info}
            placeholder="Origem..."
          />
        </div>

        <AnimatePresence>
          {excesso && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl"
            >
              <AlertCircle size={18} className="text-rose-500 shrink-0" />
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-snug">
                Atenção: Você está tentando abater mais peso ({quantidadeGasta}g) do que o material possui ({pesoDisponivel}g). O estoque ficará zerado.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          type="button"
          onClick={aoCancelar}
          className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:scale-100"
        >
          <Zap size={18} fill="currentColor" />
          {salvando ? "Processando..." : "Abater Agora"}
        </button>
      </div>
    </form>
  );
}
