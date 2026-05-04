import { useEffect } from "react";
import { Insumo, CategoriaInsumo } from "../../tipos";
import { usarFormularioInsumo } from "../../hooks/usarFormularioInsumo";
import { SecaoInformacoesBasicas } from "../formulario/SecaoInformacoesBasicas";
import { SecaoEstoquePreco } from "../formulario/SecaoEstoquePreco";
import { SecaoRendimentoFracionado } from "../formulario/SecaoRendimentoFracionado";

interface PropriedadesAbaConfiguracao {
  insumo: Insumo;
  aoSalvar: (dados: Partial<Insumo>) => Promise<any> | void;
  aoCancelar: () => void;
  corTema?: string;
  aoMudarCategoriaInterna?: (cat: CategoriaInsumo) => void;
}

export function AbaConfiguracaoInsumo({ 
  insumo, 
  aoSalvar, 
  aoCancelar, 
  corTema = "sky-500",
  aoMudarCategoriaInterna 
}: PropriedadesAbaConfiguracao) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    errors,
    onSubmit,
    categoriaAtiva,
    unidadeMedidaAtiva,
    itemFracionavelAtivo,
    unidadeConsumoAtiva,
    custoEfetivo,
  } = usarFormularioInsumo({ aberto: true, insumoEditando: insumo, aoSalvar, aoCancelar });

  // Notifica o modal sobre a mudança de categoria
  useEffect(() => {
    if (categoriaAtiva && aoMudarCategoriaInterna) {
      aoMudarCategoriaInterna(categoriaAtiva as CategoriaInsumo);
    }
  }, [categoriaAtiva, aoMudarCategoriaInterna]);

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        
        {/* IDENTIFICAÇÃO */}
        <div className="space-y-8">
          <SecaoInformacoesBasicas 
            register={register}
            errors={errors}
            categoriaAtiva={categoriaAtiva || "Geral"}
            aoMudarCategoria={(cat) => setValue("categoria", cat, { shouldDirty: true })}
          />
        </div>

        <div className="h-px bg-zinc-100 dark:bg-white/5" />

        {/* DADOS TÉCNICOS / ESTOQUE */}
        <div className="space-y-8">
          <SecaoEstoquePreco 
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
            unidadeMedidaAtiva={unidadeMedidaAtiva}
          />
        </div>

        <div className="h-px bg-zinc-100 dark:bg-white/5" />

        {/* RENDIMENTO */}
        <div className="space-y-8">
          <SecaoRendimentoFracionado 
            register={register}
            errors={errors}
            setValue={setValue}
            itemFracionavelAtivo={itemFracionavelAtivo || false}
            unidadeConsumoAtiva={unidadeConsumoAtiva || ""}
            custoEfetivo={custoEfetivo}
          />
        </div>

        {/* Botão de Salvar dedicado para a aba de Configuração */}
        <div className="flex justify-end pt-8 border-t border-zinc-100 dark:border-white/5">
          <button
            type="submit"
            className={`h-12 px-10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl bg-${corTema} hover:brightness-110 shadow-${corTema}/20`}
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
