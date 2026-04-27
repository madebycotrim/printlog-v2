import { Zap } from "lucide-react";
import { SecaoFormulario, GradeCampos } from "@/compartilhado/componentes/FormularioLayout";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoMonetario } from "@/compartilhado/componentes/CampoMonetario";

interface PropriedadesEspecificacoes {
  register: any;
  errors: any;
}

export function EspecificacoesTecnicas({ register, errors }: PropriedadesEspecificacoes) {
  return (
    <SecaoFormulario titulo="Especificações Técnicas">
      <GradeCampos colunas={3}>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
            Potência (W)
          </label>
          <CampoTexto
            icone={Zap}
            type="number"
            placeholder="0"
            erro={errors.potenciaWatts?.message}
            {...register("potenciaWatts")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
            Aquisição
          </label>
          <CampoMonetario
            placeholder="0,00"
            erro={errors.valorCompraCentavos?.message}
            {...register("valorCompraCentavos")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
            Taxa Hora (BRL/h)
          </label>
          <CampoMonetario
            placeholder="15,00"
            erro={errors.taxaHoraCentavos?.message}
            {...register("taxaHoraCentavos")}
          />
        </div>
      </GradeCampos>
    </SecaoFormulario>
  );
}
