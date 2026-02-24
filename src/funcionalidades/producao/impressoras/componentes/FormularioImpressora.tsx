import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Save,
    Zap,
    DollarSign,
    Clock,
    Wrench,
    AlertCircle,
    Tag,
    Building2,
    Layers,
} from "lucide-react";
import { Combobox } from "@/compartilhado/componentes_ui/Combobox";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Impressora, PerfilImpressoraCatalogo } from "@/funcionalidades/producao/impressoras/tipos";
import { StatusImpressora } from "@/compartilhado/tipos_globais/modelos";

const esquemaImpressora = z.object({
    nome: z.string().min(2, "O apelido deve ter pelo menos 2 caracteres"),
    tecnologia: z.enum(["FDM", "SLA"] as const),
    marca: z.string().min(1, "O fabricante é obrigatório."),
    modeloBase: z.string().min(1, "O modelo é obrigatório."),
    imagemUrl: z.string().optional(),
    potenciaWatts: z.coerce.number().optional(),
    valorCompraCentavos: z.coerce.number().optional(),
    horimetroTotalMinutos: z.coerce.number().optional(),
    intervaloRevisaoMinutos: z.coerce.number().optional(),
    consumoKw: z.coerce.number().optional(),
    taxaHoraCentavos: z.coerce.number().optional(),
});

type ImpressoraFormData = z.infer<typeof esquemaImpressora>;

interface FormularioImpressoraProps {
    aberto: boolean;
    impressoraEditando: Impressora | null;
    aoSalvar: (impressora: Impressora) => void;
    aoCancelar: () => void;
}

export function FormularioImpressora({
    aberto,
    impressoraEditando,
    aoSalvar,
    aoCancelar,
}: FormularioImpressoraProps) {
    const isEditando = Boolean(impressoraEditando);
    const [confirmarDescarte, definirConfirmarDescarte] = useState(false);
    const [catalogo, definirCatalogo] = useState<PerfilImpressoraCatalogo[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isDirty },
    } = useForm<ImpressoraFormData>({
        resolver: zodResolver(esquemaImpressora) as any,
        defaultValues: {
            nome: "",
            tecnologia: "FDM",
            marca: "",
            modeloBase: "",
            imagemUrl: "",
            potenciaWatts: "" as unknown as number,
            valorCompraCentavos: "" as unknown as number,
            taxaHoraCentavos: 15,
            horimetroTotalMinutos: 0,
            intervaloRevisaoMinutos: 300,
        },
    });

    const tecnologiaSelecionada = watch("tecnologia");
    const marcaSelecionada = watch("marca");
    const modeloSelecionado = watch("modeloBase");

    useEffect(() => {
        fetch("/impressoras.json")
            .then((res) => res.json())
            .then((dados: any[]) => {
                const dadosMapeados: PerfilImpressoraCatalogo[] = dados.map((item) => ({
                    marca: item.brand,
                    modelo: item.model,
                    nome: item.name,
                    consumoKw: item.consumoKw,
                    tipo: item.type,
                    imagem: item.img,
                }));
                definirCatalogo(dadosMapeados);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (aberto) {
            if (impressoraEditando) {
                reset({
                    nome: impressoraEditando.nome,
                    tecnologia:
                        impressoraEditando.tecnologia === "DLP" || impressoraEditando.tecnologia === "LCD"
                            ? "SLA"
                            : impressoraEditando.tecnologia,
                    marca: impressoraEditando.marca || "",
                    modeloBase: impressoraEditando.modeloBase || "",
                    imagemUrl: impressoraEditando.imagemUrl || "",
                    potenciaWatts: impressoraEditando.potenciaWatts,
                    valorCompraCentavos: (impressoraEditando.valorCompraCentavos || 0) / 100,
                    taxaHoraCentavos: (impressoraEditando.taxaHoraCentavos || 1500) / 100,
                    horimetroTotalMinutos: Math.floor((impressoraEditando.horimetroTotalMinutos || 0) / 60),
                    intervaloRevisaoMinutos: Math.floor((impressoraEditando.intervaloRevisaoMinutos || 18000) / 60),
                    consumoKw: impressoraEditando.consumoKw,
                });
            } else {
                reset({
                    nome: "",
                    tecnologia: "FDM",
                    marca: "",
                    modeloBase: "",
                    imagemUrl: "",
                    potenciaWatts: "" as unknown as number,
                    valorCompraCentavos: "" as unknown as number,
                    taxaHoraCentavos: 15,
                    horimetroTotalMinutos: 0,
                    intervaloRevisaoMinutos: 300,
                });
            }
            definirConfirmarDescarte(false);
        }
    }, [aberto, impressoraEditando, reset]);

    // --- Fabricantes e modelos filtrados por tecnologia ---
    const tiposFDM = [
        "FDM", "FDM Profissional", "FDM Compacta", "FDM Nacional",
        "FDM (Kit)", "FDM Premium", "CoreXY", "CoreXY Profissional", "Bedslinger",
    ];
    const tiposSLA = ["Resina", "SLA", "DLP", "LCD"];

    const catalogoFiltrado = useMemo(() => {
        const tiposPermitidos = tecnologiaSelecionada === "FDM" ? tiposFDM : tiposSLA;
        return catalogo.filter((p) => tiposPermitidos.includes(p.tipo));
    }, [catalogo, tecnologiaSelecionada]);

    const opcoesFabricante = useMemo(() => {
        const marcas = [...new Set(catalogoFiltrado.map((p) => p.marca))].sort();
        return marcas.map((m) => ({ valor: m, rotulo: m }));
    }, [catalogoFiltrado]);

    const opcoesModelo = useMemo(() => {
        const termoMarca = (marcaSelecionada || "").toLowerCase().trim();
        const filtrados = termoMarca
            ? catalogoFiltrado.filter((p) => p.marca.toLowerCase() === termoMarca)
            : catalogoFiltrado;
        return filtrados.map((p) => ({ valor: p.modelo, rotulo: `${p.nome}` }));
    }, [catalogoFiltrado, marcaSelecionada]);

    /** Ao selecionar modelo, autopreenche imagem + consumo + apelido */
    const aoAlterarModelo = (modeloNome: string) => {
        setValue("modeloBase", modeloNome, { shouldValidate: true, shouldDirty: true });
        const perfil = catalogo.find((p) => p.modelo === modeloNome);
        if (perfil) {
            setValue("imagemUrl", perfil.imagem, { shouldDirty: true });
            setValue("consumoKw", perfil.consumoKw, { shouldDirty: true });
            if (!marcaSelecionada) {
                setValue("marca", perfil.marca, { shouldValidate: true, shouldDirty: true });
            }
            const nomeAtual = watch("nome");
            if (!nomeAtual || nomeAtual.trim() === "") {
                setValue("nome", perfil.modelo, { shouldDirty: true });
            }
        }
    };

    const lidarComEnvio = (dados: ImpressoraFormData) => {
        const objFinal: Impressora = {
            ...(impressoraEditando || {}),
            nome: dados.nome,
            tecnologia: dados.tecnologia,
            status: impressoraEditando?.status || StatusImpressora.LIVRE,
            marca: dados.marca,
            modeloBase: dados.modeloBase,
            imagemUrl: dados.imagemUrl,
            consumoKw: dados.consumoKw,
            potenciaWatts: dados.potenciaWatts,
            valorCompraCentavos: Math.round((dados.valorCompraCentavos || 0) * 100),
            taxaHoraCentavos: Math.round((dados.taxaHoraCentavos || 0) * 100),
            horimetroTotalMinutos: (dados.horimetroTotalMinutos || 0) * 60,
            intervaloRevisaoMinutos: (dados.intervaloRevisaoMinutos || 300) * 60,
            id: impressoraEditando?.id || "",
            dataCriacao: impressoraEditando?.dataCriacao || new Date(),
            dataAtualizacao: new Date(),
        };
        aoSalvar(objFinal);
    };

    const lidarComTentativaFechamento = () => {
        if (isDirty && !confirmarDescarte) {
            definirConfirmarDescarte(true);
        } else {
            fecharModalRealmente();
        }
    };

    const fecharModalRealmente = () => {
        aoCancelar();
    };

    return (
        <Dialogo
            aberto={aberto}
            aoFechar={lidarComTentativaFechamento}
            titulo={isEditando ? "Editar Impressora" : "Nova Impressora"}
            larguraMax="max-w-2xl"
        >
            <form
                onSubmit={handleSubmit(lidarComEnvio)}
                className="flex flex-col h-full bg-white dark:bg-[#18181b]"
            >
                <div className="flex-1 p-6 md:p-8 space-y-8">

                    {/* ═══════ SEÇÃO 1: IDENTIFICAÇÃO DE HARDWARE ═══════ */}
                    <div className="space-y-5">
                        <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">
                            Identificação de Hardware
                        </h4>

                        {/* Toggle FDM / SLA (idêntico ao toggle do FormularioMaterial) */}
                        <div className="flex bg-zinc-200/50 dark:bg-[#0e0e11] p-1 rounded-lg border border-zinc-200 dark:border-white/5">
                            <button
                                type="button"
                                onClick={() => {
                                    setValue("tecnologia", "FDM", { shouldValidate: true, shouldDirty: true });
                                    setValue("marca", "", { shouldDirty: true });
                                    setValue("modeloBase", "", { shouldDirty: true });
                                    setValue("imagemUrl", "", { shouldDirty: true });
                                }}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${tecnologiaSelecionada === "FDM"
                                    ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-white/10"
                                    : "text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                                    }`}
                            >
                                FILAMENTO
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setValue("tecnologia", "SLA", { shouldValidate: true, shouldDirty: true });
                                    setValue("marca", "", { shouldDirty: true });
                                    setValue("modeloBase", "", { shouldDirty: true });
                                    setValue("imagemUrl", "", { shouldDirty: true });
                                }}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${tecnologiaSelecionada === "SLA"
                                    ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-white/10"
                                    : "text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                                    }`}
                            >
                                RESINA
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            {/* FABRICANTE (Combobox idêntico ao de Material) */}
                            <div className="col-span-1">
                                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                    Fabricante / Marca
                                </label>
                                <Combobox
                                    opcoes={opcoesFabricante}
                                    valor={marcaSelecionada || ""}
                                    aoAlterar={(val) => {
                                        setValue("marca", val, { shouldValidate: true, shouldDirty: true });
                                        setValue("modeloBase", "", { shouldDirty: true });
                                        setValue("imagemUrl", "", { shouldDirty: true });
                                    }}
                                    placeholder="Selecione ou digite..."
                                    permitirNovo={true}
                                    icone={Building2}
                                />
                                {errors.marca && (
                                    <span className="text-[10px] font-bold text-red-500 mt-1 block">
                                        {errors.marca.message}
                                    </span>
                                )}
                            </div>

                            {/* MODELO (Combobox idêntico ao de Material) */}
                            <div className="col-span-1">
                                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                    Modelo
                                </label>
                                <Combobox
                                    opcoes={opcoesModelo}
                                    valor={modeloSelecionado || ""}
                                    aoAlterar={aoAlterarModelo}
                                    placeholder="Selecione ou digite..."
                                    permitirNovo={true}
                                    icone={Layers}
                                />
                                {errors.modeloBase && (
                                    <span className="text-[10px] font-bold text-red-500 mt-1 block">
                                        {errors.modeloBase.message}
                                    </span>
                                )}
                            </div>

                            {/* APELIDO */}
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                                    Apelido (Como aparecerá no sistema)
                                </label>
                                <div className="relative group">
                                    <Tag
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500 transition-colors"
                                    />
                                    <input
                                        type="text"
                                        {...register("nome")}
                                        placeholder={
                                            modeloSelecionado && marcaSelecionada
                                                ? `Padrão: ${modeloSelecionado} - Garagem`
                                                : "Deixe em branco para auto-gerar o nome"
                                        }
                                        className="w-full h-11 pl-10 pr-4 bg-transparent border-b-2 border-gray-200 dark:border-white/10 focus:border-[var(--cor-primaria)] text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-medium"
                                    />
                                </div>
                                {errors.nome && (
                                    <span className="text-[10px] font-bold text-red-500 mt-1 block">
                                        {errors.nome.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ═══════ SEÇÃO 2: ESPECIFICAÇÕES TÉCNICAS ═══════ */}
                    <div className="space-y-5">
                        <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">
                            Especificações Técnicas
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* POTÊNCIA */}
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                                    Potência (Watts)
                                </label>
                                <div className="relative group">
                                    <Zap
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors"
                                    />
                                    <input
                                        type="number"
                                        step="1"
                                        {...register("potenciaWatts")}
                                        placeholder="0"
                                        className="w-full h-11 pl-10 pr-12 bg-transparent border-b-2 border-gray-200 dark:border-white/10 focus:border-[var(--cor-primaria)] text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-bold no-spinner"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none">
                                        W
                                    </span>
                                </div>
                            </div>

                            {/* VALOR DE COMPRA */}
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                                    Valor de Compra
                                </label>
                                <div className="relative group">
                                    <DollarSign
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors"
                                    />
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register("valorCompraCentavos")}
                                        placeholder="0,00"
                                        className="w-full h-11 pl-10 pr-12 bg-transparent border-b-2 border-gray-200 dark:border-white/10 focus:border-[var(--cor-primaria)] text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-bold no-spinner"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none">
                                        BRL
                                    </span>
                                </div>
                            </div>

                            {/* TAXA HORA DA MÁQUINA */}
                            <div className="col-span-1">
                                <label className="flex items-center gap-1.5 block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2 truncate">
                                    Taxa Base da Hora <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400 text-[9px] uppercase tracking-wider font-extrabold" title="Cálculo de ROI">ROI</span>
                                </label>
                                <div className="relative group">
                                    <DollarSign
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500 transition-colors"
                                    />
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register("taxaHoraCentavos")}
                                        placeholder="15,00"
                                        title="Valor cobrado ou gerado estatisticamente por cada hora ligada."
                                        className="w-full h-11 pl-10 pr-16 bg-transparent border-b-2 border-gray-200 dark:border-white/10 focus:border-[var(--cor-primaria)] text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-bold no-spinner"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none">
                                        BRL/h
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ═══════ SEÇÃO 3: MANUTENÇÃO PREVENTIVA ═══════ */}
                    <div className="space-y-5">
                        <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">
                            Manutenção Preventiva
                        </h4>
                        <div className="grid grid-cols-2 gap-5">
                            {/* HORÍMETRO TOTAL */}
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                                    Horímetro Total
                                </label>
                                <div className="relative group">
                                    <Clock
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors"
                                    />
                                    <input
                                        type="number"
                                        step="1"
                                        {...register("horimetroTotalMinutos")}
                                        placeholder="0"
                                        className="w-full h-11 pl-10 pr-12 bg-transparent border-b-2 border-gray-200 dark:border-white/10 focus:border-[var(--cor-primaria)] text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-bold no-spinner"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none">
                                        H
                                    </span>
                                </div>
                            </div>

                            {/* INTERVALO DE REVISÃO */}
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                                    Intervalo de Revisão
                                </label>
                                <div className="relative group">
                                    <Wrench
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors"
                                    />
                                    <input
                                        type="number"
                                        step="1"
                                        {...register("intervaloRevisaoMinutos")}
                                        placeholder="300"
                                        className="w-full h-11 pl-10 pr-12 bg-transparent border-b-2 border-gray-200 dark:border-white/10 focus:border-[var(--cor-primaria)] text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-bold no-spinner"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none">
                                        H
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════ FOOTER (idêntico ao FormularioMaterial) ═══════ */}
                <div className="p-5 md:p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-[#0e0e11]/50 flex flex-col items-end gap-3 rounded-b-xl min-h-[88px] justify-center">
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
                                className="px-6 py-2.5 flex-1 md:flex-none justify-center hover:brightness-95 text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all active:scale-95"
                            >
                                <Save size={18} strokeWidth={2.5} />
                                {isEditando ? "Salvar Alterações" : "Cadastrar Impressora"}
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
