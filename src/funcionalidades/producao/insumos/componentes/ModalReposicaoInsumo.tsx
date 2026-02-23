import { useForm } from "react-hook-form";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Input } from "@/compartilhado/componentes_ui/Formulario";
import { ArrowUpCircle, TrendingUp, Info } from "lucide-react";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";

interface ModalReposicaoInsumoProps {
    aberto: boolean;
    insumo: Insumo | null;
    aoFechar: () => void;
    aoConfirmar: (id: string, quantidade: number, valorTotalCompra: number, observacao?: string) => void;
}

export function ModalReposicaoInsumo({
    aberto,
    insumo,
    aoFechar,
    aoConfirmar
}: ModalReposicaoInsumoProps) {
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: {
            quantidade: 1,
            custoCompraTotal: "",
            observacao: ""
        }
    });

    const watchQtd = watch("quantidade") || 1;
    const watchCustoStr = watch("custoCompraTotal") || "0";
    // Tenta converter p tratar UI
    const custoConvertido = typeof watchCustoStr === "string" ? parseFloat(watchCustoStr.replace(",", ".")) : watchCustoStr;
    const custoUnitarioSimulado = !isNaN(custoConvertido) && custoConvertido > 0 && watchQtd > 0
        ? (custoConvertido / watchQtd)
        : 0;

    if (!aberto || !insumo) return null;

    const onSubmit = (data: any) => {
        const qtdNumerica = Number(data.quantidade);
        const custoRealStr = String(data.custoCompraTotal).replace(",", ".");
        const custoNumerico = Number(custoRealStr);

        if (qtdNumerica > 0 && custoNumerico >= 0) {
            aoConfirmar(insumo.id, qtdNumerica, custoNumerico, data.observacao);
            reset();
        }
    };

    return (
        <Dialogo
            aberto={aberto}
            aoFechar={aoFechar}
            titulo="Reposição de Estoque"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-4 flex gap-4 text-sm items-start">
                    <TrendingUp className="text-emerald-500 flex-shrink-0" size={24} />
                    <div className="flex-1">
                        <strong className="text-emerald-800 dark:text-emerald-400 block mb-1">
                            {insumo.nome}
                        </strong>
                        <span className="text-emerald-700/80 dark:text-emerald-400/80 block">
                            Estoque atual: <strong>{insumo.quantidadeAtual} {insumo.unidadeMedida}</strong>
                        </span>
                        <span className="text-emerald-700/80 dark:text-emerald-400/80 block mt-1 text-xs">
                            Ao registrar esta entrada, o Custo Médio do Insumo será recalculado automaticamente pela média ponderada.
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        type="number"
                        label={`Nova Quantidade (${insumo.unidadeMedida})`}
                        min={1}
                        placeholder="Qtd da Nota Fiscal"
                        {...register("quantidade", { required: "Obrigatório" })}
                        error={errors.quantidade?.message}
                    />

                    <Input
                        type="text"
                        label="Valor Total da Compra (R$)"
                        placeholder="Ex: 150.90"
                        {...register("custoCompraTotal", { required: "Obrigatório" })}
                        error={errors.custoCompraTotal?.message}
                    />
                </div>

                {custoUnitarioSimulado > 0 && (
                    <div className="flex items-center gap-2 text-xs text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-500/10 p-2.5 rounded-lg border border-sky-100 dark:border-sky-500/20">
                        <Info size={14} />
                        Nesta aquisição, cada unidade sairá por {custoUnitarioSimulado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.
                    </div>
                )}

                <Input
                    label="Observação (Fornecedor, NFe...)"
                    placeholder="Ex: Comprado via MercadoLivre..."
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
                        style={{ backgroundColor: "var(--cor-primaria)" }}
                        className="px-6 py-2.5 hover:brightness-95 text-white text-sm font-bold rounded-lg shadow-sm transition-transform active:scale-95 flex items-center gap-2"
                    >
                        <ArrowUpCircle size={18} strokeWidth={2.5} />
                        Confirmar Entrada
                    </button>
                </div>
            </form>
        </Dialogo>
    );
}
