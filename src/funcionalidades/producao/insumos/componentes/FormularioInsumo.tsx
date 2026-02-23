import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Combobox } from "@/compartilhado/componentes_ui/Combobox";
import {
    Save, Box, AlertCircle, Link as LinkIcon, DollarSign,
    Layers, Package, Link2, Zap, Hammer, FlaskConical, Building2, Ruler
} from "lucide-react";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";

interface FormularioInsumoProps {
    aberto: boolean;
    insumoEditando: Insumo | null;
    aoCancelar: () => void;
    aoSalvar: (dados: Partial<Insumo>) => void;
}

const CATEGORIAS = [
    { id: "Geral", rotulo: "GERAL", icone: Layers },
    { id: "Embalagem", rotulo: "EMBALAGEM", icone: Package },
    { id: "Fixação", rotulo: "FIXAÇÃO", icone: Link2 },
    { id: "Eletrônica", rotulo: "ELETRÔNICA", icone: Zap },
    { id: "Acabamento", rotulo: "ACABAMENTO", icone: Hammer },
    { id: "Limpeza", rotulo: "LIMPEZA/QUÍMICA", icone: FlaskConical },
    { id: "Outros", rotulo: "OUTROS", icone: Box },
];

const UNIDADES = [
    { valor: "un", rotulo: "UN" },
    { valor: "ml", rotulo: "ML" },
    { valor: "L", rotulo: "L" },
    { valor: "g", rotulo: "G" },
    { valor: "kg", rotulo: "KG" },
    { valor: "Rolo", rotulo: "ROLO" },
    { valor: "Caixa", rotulo: "CX" },
    { valor: "Par", rotulo: "PAR" },
];

const UNIDADES_CONSUMO = [
    { valor: "m", rotulo: "Metro (m)" },
    { valor: "cm", rotulo: "Centímetro (cm)" },
    { valor: "ml", rotulo: "Mililitro (ml)" },
    { valor: "g", rotulo: "Grama (g)" },
    { valor: "folha", rotulo: "Folha" },
    { valor: "pedaço", rotulo: "Pedaço" },
    { valor: "dose", rotulo: "Dose" },
    { valor: "spray", rotulo: "Spray / Borrifada" },
    { valor: "gota", rotulo: "Gota" },
];

export function FormularioInsumo({
    aberto,
    insumoEditando,
    aoCancelar,
    aoSalvar,
}: FormularioInsumoProps) {
    const isEditando = Boolean(insumoEditando);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isDirty },
    } = useForm<Partial<Insumo>>({
        defaultValues: {
            nome: "",
            marca: "",
            categoria: "Geral",
            unidadeMedida: "un",
            quantidadeAtual: 0,
            custoMedioUnidade: 0,
            quantidadeMinima: 5,
            linkCompra: "",
            itemFracionavel: false,
            rendimentoTotal: undefined,
            unidadeConsumo: ""
        },
    });

    const [confirmarDescarte, definirConfirmarDescarte] = useState(false);

    const categoriaSelecionada = watch("categoria");
    const itemFracionavel = watch("itemFracionavel");
    const custoMedio = watch("custoMedioUnidade") || 0;
    const rendimento = watch("rendimentoTotal") || 0;
    const unidadeCons = watch("unidadeConsumo") || "";

    const custoEfetivo = itemFracionavel && rendimento > 0
        ? (custoMedio / rendimento).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : "R$ 0,00";

    useEffect(() => {
        if (aberto) {
            if (insumoEditando) {
                reset(insumoEditando);
            } else {
                reset({
                    nome: "",
                    marca: "",
                    categoria: "Geral",
                    unidadeMedida: "un",
                    quantidadeAtual: 0,
                    custoMedioUnidade: undefined, // empty for visual
                    quantidadeMinima: 5,
                    linkCompra: "",
                    itemFracionavel: false,
                    rendimentoTotal: undefined,
                    unidadeConsumo: ""
                });
            }
        }
    }, [aberto, insumoEditando, reset]);

    const lidarComTentativaFechamento = () => {
        if (isDirty && !confirmarDescarte) {
            definirConfirmarDescarte(true);
        } else {
            fecharModalRealmente();
        }
    };

    const fecharModalRealmente = () => {
        definirConfirmarDescarte(false);
        aoCancelar();
    };

    const onSubmit = (data: Partial<Insumo>) => {
        const payload = {
            ...data,
            quantidadeAtual: Number(data.quantidadeAtual) || 0,
            quantidadeMinima: Number(data.quantidadeMinima) || 0,
            custoMedioUnidade: Number(data.custoMedioUnidade) || 0,
            rendimentoTotal: data.itemFracionavel ? Number(data.rendimentoTotal) || 0 : undefined,
        };
        aoSalvar(payload);
    };

    if (!aberto) return null;

    return (
        <Dialogo
            aberto={aberto}
            aoFechar={lidarComTentativaFechamento}
            titulo={isEditando ? "Editar Insumo" : "Novo Insumo"}
            larguraMax="max-w-3xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full bg-white dark:bg-[#18181b]">
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 min-h-[500px]">

                    {/* SEÇÃO: IDENTIFICAÇÃO */}
                    <div className="space-y-5">
                        <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2 text-gray-900 dark:text-white">
                            IDENTIFICAÇÃO PRINCIPAL
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* NOME DO MATERIAL */}
                            <div className="col-span-1">
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5 pl-0">
                                    Nome do Material / Insumo
                                </label>
                                <div className="relative group">
                                    <Box size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.nome ? 'text-red-400' : 'text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500'} transition-colors pointer-events-none`} />
                                    <input
                                        type="text"
                                        placeholder="Ex: Parafuso M3 x 10mm"
                                        {...register("nome", { required: "Obrigatório" })}
                                        className={`w-full h-11 pl-10 pr-4 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${errors.nome ? 'border-red-500' : 'border-gray-200 dark:border-white/5'} focus:bg-white dark:focus:bg-[#0c0c0e] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-medium`}
                                    />
                                </div>
                                {errors.nome && <span className="text-[10px] text-red-500 mt-1 block">{errors.nome.message}</span>}
                            </div>

                            {/* MARCA / FABRICANTE */}
                            <div className="col-span-1">
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5">
                                    Fabricante / Marca
                                </label>
                                <div className="relative group">
                                    <Building2 size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.marca ? 'text-red-400' : 'text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500'} transition-colors pointer-events-none`} />
                                    <input
                                        type="text"
                                        placeholder="Ex: 3M, Vonder..."
                                        {...register("marca")}
                                        className="w-full h-11 pl-10 pr-4 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-gray-200 dark:border-white/5 focus:bg-white dark:focus:bg-[#0c0c0e] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-medium"
                                    />
                                </div>
                            </div>

                            {/* CATEGORIA */}
                            <div className="col-span-1 md:col-span-2 mt-2 space-y-1.5">
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5">
                                    Categoria Logística
                                </label>
                                <div className="flex items-center gap-2.5 flex-wrap pb-2">
                                    {CATEGORIAS.map((cat) => {
                                        const isSelected = categoriaSelecionada === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setValue("categoria", cat.id as any, { shouldDirty: true })}
                                                className={`h-11 px-5 rounded-lg flex items-center justify-center gap-2.5 text-xs font-bold transition-all whitespace-nowrap border
                                                    ${isSelected
                                                        ? 'bg-gray-900 dark:bg-zinc-800 text-white border-transparent dark:border-white/10 shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                                                        : 'bg-transparent text-gray-500 dark:text-zinc-500 border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-zinc-800/50 hover:text-gray-700 dark:hover:text-zinc-300'
                                                    }`}
                                            >
                                                <cat.icone size={14} strokeWidth={2.5} />
                                                {cat.rotulo}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO: ESTOQUE E CUSTOS */}
                    <div className="space-y-5">
                        <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2 text-gray-900 dark:text-white">
                            PRECIFICAÇÃO & ESTOQUE
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* CUSTO UNITÁRIO */}
                            <div className="col-span-1">
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5 pl-0">
                                    Valor Unitário
                                </label>
                                <div className="relative group">
                                    <DollarSign size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.custoMedioUnidade ? 'text-red-400' : 'text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500'} transition-colors pointer-events-none`} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        readOnly={isEditando}
                                        {...register("custoMedioUnidade", { required: "Obrigatório" })}
                                        className={`w-full h-11 pl-10 pr-12 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${errors.custoMedioUnidade ? 'border-red-500' : 'border-gray-200 dark:border-white/5'} ${isEditando ? 'opacity-70 cursor-not-allowed' : ''} focus:bg-white dark:focus:bg-[#0c0c0e] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all font-black no-spinner`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none tracking-widest uppercase">
                                        BRL
                                    </span>
                                </div>
                                {errors.custoMedioUnidade && <span className="text-[10px] text-red-500 mt-1 block">{errors.custoMedioUnidade.message}</span>}
                            </div>

                            {/* ESTOQUE ATUAL */}
                            <div className="col-span-1">
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5 pl-0">
                                    Estoque / Qtde Util
                                </label>
                                <div className="relative group">
                                    <Package size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.quantidadeAtual ? 'text-red-400' : 'text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500'} transition-colors pointer-events-none`} />
                                    <input
                                        type="number"
                                        step={itemFracionavel ? "0.01" : "1"}
                                        placeholder="Ex: 1000"
                                        readOnly={isEditando}
                                        {...register("quantidadeAtual", { required: "Obrigatório" })}
                                        className={`w-full h-11 pl-10 pr-12 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${errors.quantidadeAtual ? 'border-red-500' : 'border-gray-200 dark:border-white/5'} ${isEditando ? 'opacity-70 cursor-not-allowed' : ''} focus:bg-white dark:focus:bg-[#0c0c0e] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all font-black no-spinner`}
                                    />
                                </div>
                                {errors.quantidadeAtual && <span className="text-[10px] text-red-500 mt-1 block">{errors.quantidadeAtual.message}</span>}
                            </div>

                            {/* UNIDADES (Select) */}
                            <div className="col-span-1">
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5 pl-0">
                                    Unidade (Und)
                                </label>
                                <div className="relative w-full">
                                    <select
                                        {...register("unidadeMedida")}
                                        className="w-full h-11 pl-4 pr-10 appearance-none bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-gray-200 dark:border-white/5 focus:bg-white dark:focus:bg-[#0c0c0e] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-sm text-gray-900 dark:text-white font-bold outline-none transition-all uppercase tracking-wider"
                                    >
                                        {UNIDADES.map(u => <option key={u.valor} value={u.valor}>{u.rotulo}</option>)}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-zinc-500">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                            {/* ESTOQUE MÍNIMO */}
                            <div className="col-span-1">
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5 pl-0">
                                    Estoque Mínimo (Alerta)
                                </label>
                                <div className="relative group">
                                    <AlertCircle size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.quantidadeMinima ? 'text-red-400' : 'text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500'} transition-colors pointer-events-none`} />
                                    <input
                                        type="number"
                                        placeholder="Ex: 5"
                                        {...register("quantidadeMinima", { required: "Obrigatório" })}
                                        className={`w-full h-11 pl-10 pr-4 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${errors.quantidadeMinima ? 'border-red-500' : 'border-gray-200 dark:border-white/5'} focus:bg-white dark:focus:bg-[#0c0c0e] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all font-black no-spinner`}
                                    />
                                </div>
                            </div>

                            {/* LINK DE COMPRA */}
                            <div className="col-span-1">
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5 pl-0">
                                    Link p/ Reposição (Compra)
                                </label>
                                <div className="relative group">
                                    <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                                    <input
                                        type="url"
                                        placeholder="https://suprimentos..."
                                        {...register("linkCompra")}
                                        className="w-full h-11 pl-10 pr-4 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-gray-200 dark:border-white/5 focus:bg-white dark:focus:bg-[#0c0c0e] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ITEM FRACIONÁVEL (TOGGLE SIMPLES) */}
                        <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            <label className="flex items-center gap-3 cursor-pointer select-none w-max">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        {...register("itemFracionavel")}
                                        className="peer sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center
                                        ${itemFracionavel
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : 'bg-white dark:bg-zinc-900 border-gray-300 dark:border-white/10 peer-focus:border-indigo-500'}`}
                                    >
                                        <svg className={`w-3.5 h-3.5 transition-transform ${itemFracionavel ? 'scale-100' : 'scale-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                </div>
                                <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${itemFracionavel ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-zinc-400'}`}>
                                    ITEM FRACIONÁVEL (EX: ROLO, LITRO)
                                </span>
                            </label>

                            {/* CONTEÚDO EXPANDIDO */}
                            {itemFracionavel && (
                                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-top-2 fade-in duration-200 bg-gray-50/50 dark:bg-[#141416]/50 p-5 rounded-xl border border-gray-100 dark:border-white/5">
                                    {/* RENDIMENTO TOTAL */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5 pl-0">
                                            Rendimento Total
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                step="any"
                                                {...register("rendimentoTotal", { required: itemFracionavel ? "Obrigatório" : false })}
                                                className={`w-full h-11 bg-white hover:bg-gray-50 dark:bg-zinc-900/80 dark:hover:bg-zinc-800/80 border ${errors.rendimentoTotal ? 'border-red-500/50' : 'border-gray-200 dark:border-white/5'} focus:bg-white dark:focus:bg-[#0c0c0e] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm text-gray-900 dark:text-white pl-4 pr-10 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-medium no-spinner`}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none tracking-widest uppercase">
                                                {unidadeCons || "UND"}
                                            </span>
                                        </div>
                                        {errors.rendimentoTotal && <span className="text-[10px] text-red-500 mt-1 block">{errors.rendimentoTotal.message}</span>}
                                    </div>

                                    {/* UN. DE CONSUMO */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5 pl-0">
                                            Unidade de Consumo
                                        </label>
                                        <Combobox
                                            opcoes={UNIDADES_CONSUMO.map((u) => ({ valor: u.valor, rotulo: u.rotulo }))}
                                            valor={unidadeCons}
                                            aoAlterar={(val) => setValue("unidadeConsumo", val, { shouldValidate: true, shouldDirty: true })}
                                            placeholder="Selecione ou digite..."
                                            permitirNovo={true}
                                            icone={Ruler}
                                        />
                                        {errors.unidadeConsumo && <span className="text-[10px] text-red-500 mt-1 block">{errors.unidadeConsumo.message}</span>}
                                    </div>

                                    {/* CUSTO EFETIVO FOOTER */}
                                    <div className="col-span-1 md:col-span-2 mt-2 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center text-xs font-bold">
                                        <span className="text-gray-500 dark:text-zinc-500 uppercase tracking-widest">CUSTO EFETIVO DA UNIDADE:</span>
                                        <span className="text-gray-900 dark:text-white text-sm">
                                            {custoEfetivo} <span className="text-gray-500 dark:text-zinc-500 text-xs ml-1 font-medium">/ {unidadeCons || "und"}</span>
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* ═══════ FOOTER ═══════ */}
                <div className="p-5 md:p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-[#0e0e11]/50 flex flex-col items-end gap-3 rounded-b-xl md:rounded-br-xl min-h-[88px] justify-center">
                    {!confirmarDescarte ? (
                        <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                            <button
                                type="button"
                                onClick={lidarComTentativaFechamento}
                                className="px-4 py-2 flex-1 md:flex-none text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                style={{ backgroundColor: "var(--cor-primaria)" }}
                                className="px-6 py-2.5 flex-1 md:flex-none justify-center hover:brightness-95 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95"
                            >
                                <Save size={18} strokeWidth={2.5} />
                                {isEditando ? "Salvar Alterações" : "Cadastrar Insumo"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-end gap-3 w-full animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                                <button
                                    type="button"
                                    onClick={fecharModalRealmente}
                                    className="px-4 py-2.5 flex-1 md:flex-none text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => definirConfirmarDescarte(false)}
                                    className="px-6 py-2.5 flex-1 md:flex-none justify-center bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95"
                                >
                                    Continuar Editando
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400/80 md:w-auto w-full justify-end">
                                <AlertCircle size={14} strokeWidth={2.5} />
                                <span className="text-[10px] uppercase font-bold tracking-widest">
                                    Tem certeza que deseja descartar alterações?
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </Dialogo>
    );
}
