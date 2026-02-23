import { useForm, Controller } from "react-hook-form";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Input, Select } from "@/compartilhado/componentes_ui/Formulario";
import { MotivoBaixaInsumo, Insumo } from "@/funcionalidades/producao/insumos/tipos";
import { ArrowDownCircle } from "lucide-react";

interface ModalBaixaInsumoProps {
    aberto: boolean;
    insumo: Insumo | null;
    aoFechar: () => void;
    aoConfirmar: (idInsumo: string, quantidade: number, motivo: MotivoBaixaInsumo, observacao?: string) => void;
}

export function ModalBaixaInsumo({
    aberto,
    insumo,
    aoFechar,
    aoConfirmar
}: ModalBaixaInsumoProps) {
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
        defaultValues: {
            quantidade: 1,
            motivo: "Consumo" as MotivoBaixaInsumo,
            observacao: ""
        }
    });

    if (!aberto || !insumo) return null;

    const onSubmit = (data: any) => {
        const qtdNumerica = Number(data.quantidade);
        if (qtdNumerica > 0) {
            aoConfirmar(insumo.id, qtdNumerica, data.motivo, data.observacao);
            reset();
        }
    };

    return (
        <Dialogo
            aberto={aberto}
            aoFechar={aoFechar}
            titulo="Dar Baixa em Estoque"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl p-4 flex gap-4 text-sm items-start">
                    <ArrowDownCircle className="text-rose-500 flex-shrink-0" size={24} />
                    <div className="flex-1">
                        <strong className="text-rose-800 dark:text-rose-400 block mb-1">
                            {insumo.nome}
                        </strong>
                        <span className="text-rose-700/80 dark:text-rose-400/80 block">
                            Estoque atual: <strong>{insumo.quantidadeAtual} {insumo.unidadeMedida}</strong>
                        </span>
                        <span className="text-rose-700/80 dark:text-rose-400/80 block mt-1 text-xs">
                            A quantidade preenchida abaixo será deduzida deste insumo.
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        type="number"
                        label={`Quantidade a baixar (${insumo.unidadeMedida})`}
                        max={insumo.quantidadeAtual}
                        min={1}
                        {...register("quantidade", { required: "Obrigatório" })}
                        error={errors.quantidade?.message}
                    />

                    <Controller
                        name="motivo"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Motivo da Saída"
                                opcoes={[
                                    { valor: "Consumo", formatado: "Consumo/Uso Base" },
                                    { valor: "Descarte", formatado: "Descarte Validade" },
                                    { valor: "Avaria", formatado: "Quebra/Avaria" },
                                    { valor: "Outro", formatado: "Outro" },
                                ]}
                                valorSelecionado={field.value}
                                aoMudar={field.onChange}
                            />
                        )}
                    />
                </div>

                <Input
                    label="Observação (Opcional)"
                    placeholder="Ex: Troca do filme FEP furado após impressão..."
                    {...register("observacao")}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                    <button
                        type="button"
                        onClick={aoFechar}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg shadow-sm transition-transform active:scale-95 flex items-center gap-2"
                    >
                        <ArrowDownCircle size={18} strokeWidth={2.5} />
                        Confirmar Baixa
                    </button>
                </div>
            </form>
        </Dialogo>
    );
}
