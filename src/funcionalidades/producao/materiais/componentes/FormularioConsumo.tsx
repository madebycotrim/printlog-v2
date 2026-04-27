import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
import { RegistroUso } from "../tipos";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";

const esquemaConsumo = z.object({
  nomePeca: z.string().min(3, "Informe o motivo ou peça"),
  quantidadeGastaGramas: z.coerce.number().positive("Quantidade deve ser maior que zero"),
  status: z.enum(["SUCESSO", "FALHA", "CANCELADO", "MANUAL"]),
});

type ConsumoFormData = z.infer<typeof esquemaConsumo>;

interface PropriedadesFormularioConsumo {
  aoSalvar: (dados: Omit<RegistroUso, "id" | "data">) => Promise<void>;
  aoCancelar: () => void;
  pesoDisponivel: number;
  tipo?: "FDM" | "SLA";
}

const MOTIVOS_SUGERIDOS = [
  "Falha na Impressão",
  "Teste de Retração",
  "Purga de Material",
  "Ajuste de Fluxo",
  "Peça de Teste",
];

export function FormularioConsumo({ aoSalvar, aoCancelar, pesoDisponivel, tipo }: PropriedadesFormularioConsumo) {
  const termo = tipo === 'FDM' ? 'Filamento' : tipo === 'SLA' ? 'Resina' : 'Insumo';
  const unidade = tipo === 'SLA' ? 'ml' : 'g';
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
  const pesoFinal = Math.max(0, pesoDisponivel - quantidadeGasta);

  const aoSubmeter = async (dados: ConsumoFormData) => {
    try {
      setSalvando(true);
      await aoSalvar(dados);
      aoCancelar();
    } catch (erro) {
      // Erro tratado no hook
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(aoSubmeter as any)} className="space-y-8">
      {/* Resumo Simples */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5">
          <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Saldo de {termo}</span>
          <div className="text-xl font-black text-zinc-900 dark:text-white">{pesoDisponivel}{unidade}</div>
        </div>
        <div className={`p-4 rounded-2xl border ${excesso ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
          <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Após Abatimento</span>
          <div className={`text-xl font-black ${excesso ? 'text-rose-500' : 'text-emerald-500'}`}>{pesoFinal.toFixed(1)}{unidade}</div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Campo de Peso */}
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block">Quanto de {termo} foi gasto? ({unidade})</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {(() => {
              // Lógica de sugestões inteligentes baseadas no saldo
              const sugestoes = [];
              if (pesoDisponivel > 500) {
                sugestoes.push(10, 50, 100, 250);
              } else if (pesoDisponivel > 100) {
                sugestoes.push(5, 10, 25, 50);
              } else {
                sugestoes.push(1, 2, 5, 10);
              }
              
              return (
                <>
                  {sugestoes.filter(v => v < pesoDisponivel).map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setValue("quantidadeGastaGramas", valor)}
                      className="flex-1 min-w-[60px] py-2 rounded-lg bg-zinc-100 dark:bg-white/5 text-[10px] font-black hover:bg-indigo-500 hover:text-white transition-all border border-transparent"
                    >
                      +{valor}{unidade}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setValue("quantidadeGastaGramas", pesoDisponivel)}
                    className="flex-1 min-w-[60px] py-2 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 text-[10px] font-black hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20"
                  >
                    TUDO
                  </button>
                </>
              );
            })()}
          </div>
          <CampoTexto
            type="number"
            step="0.1"
            placeholder="0.0"
            erro={errors.quantidadeGastaGramas?.message}
            {...register("quantidadeGastaGramas")}
            className={`h-16 text-2xl font-black text-center rounded-2xl ${excesso ? 'border-rose-500 text-rose-500' : ''}`}
          />
        </div>

        {/* Motivo */}
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block">Motivo do Abatimento</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {MOTIVOS_SUGERIDOS.map((motivo) => (
              <button
                key={motivo}
                type="button"
                onClick={() => setValue("nomePeca", motivo)}
                className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-transparent hover:border-indigo-500/50 text-[9px] font-black uppercase transition-all"
              >
                {motivo}
              </button>
            ))}
          </div>
          <CampoTexto
            placeholder="Descreva o motivo ou peça..."
            erro={errors.nomePeca?.message}
            {...register("nomePeca")}
            className="h-12 text-sm rounded-xl"
          />
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-white/5">
        <button
          type="button"
          onClick={aoCancelar}
          className="flex-1 py-4 text-[11px] font-black uppercase text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando || excesso}
          className="flex-[2] py-4 rounded-xl bg-indigo-500 text-white text-[11px] font-black uppercase shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {salvando ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Check size={16} />
              Confirmar Abatimento
            </>
          )}
        </button>
      </div>
    </form>
  );
}
