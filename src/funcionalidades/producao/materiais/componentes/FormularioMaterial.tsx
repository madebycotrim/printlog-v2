import { useState, useMemo, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Carretel,
  GarrafaResina,
} from "@/compartilhado/componentes_ui/Icones3D";
import {
  Save,
  Plus,
  Building2,
  Layers,
  Tag,
  DollarSign,
  Weight,
  BoxSelect,
  Beaker,
  AlertCircle,
} from "lucide-react";
import { Combobox } from "@/compartilhado/componentes_ui/Combobox";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Material } from "@/funcionalidades/producao/materiais/tipos";

// --- ESQUEMA DE VALIDAO (ZOD) ---
const esquemaMaterial = z.object({
  tipo: z.enum(["FDM", "SLA"]),
  fabricante: z.string().min(1, "O fabricante é obrigatório."),
  tipoMaterial: z.string().min(1, "O tipo de material é obrigatório."),
  nomePersonalizado: z.string().optional(),
  cor: z.string().optional(),
  preco: z
    .number({ message: "Valor numérico obrigatório." })
    .positive("O valor deve ser maior que zero."),
  peso: z
    .number({ message: "Quantidade num. obrigatória." })
    .positive("A quantidade deve ser maior que zero."),
  estoqueInicial: z
    .number({ message: "Estoque num. obrigatório." })
    .int("Deixe sem casas decimais.")
    .min(0, "O estoque não pode ser negativo."),
  usarGramas: z.boolean(),
});

type FormValues = z.infer<typeof esquemaMaterial>;

// --- LISTAS DE SUGESTÃO ---
const FABRICANTES = [
  { valor: "Voolt3D", rotulo: "Voolt3D" },
  { valor: "3D Fila", rotulo: "3D Fila" },
  { valor: "Creality", rotulo: "Creality" },
  { valor: "Esun", rotulo: "Esun" },
  { valor: "Sunlu", rotulo: "Sunlu" },
  { valor: "Flashforge", rotulo: "Flashforge" },
  { valor: "Prusa", rotulo: "Prusa Research" },
  { valor: "GTMax", rotulo: "GTMax" },
  { valor: "Nacional", rotulo: "Genérico Nacional" },
  { valor: "Importado", rotulo: "Genérico Importado" },
];

const MATERIAIS_FDM = [
  { valor: "PLA", rotulo: "PLA (Ácido Polilático)" },
  { valor: "PLA Silk", rotulo: "PLA Silk (Acabamento Seda)" },
  { valor: "PLA Matte", rotulo: "PLA Matte (Fosco)" },
  { valor: "PETG", rotulo: "PETG (Polietileno Tereftalato Glicol)" },
  { valor: "ABS", rotulo: "ABS (Acrilonitrila Butadieno Estireno)" },
  { valor: "ASA", rotulo: "ASA (Resistente UV)" },
  { valor: "TPU", rotulo: "TPU (Flexível)" },
  { valor: "Nylon", rotulo: "Nylon (Poliamida - PA)" },
  { valor: "PC", rotulo: "PC (Policarbonato)" },
  { valor: "HIPS", rotulo: "HIPS (Suporte Solúvel em Limoneno)" },
  { valor: "Wood", rotulo: "PLA Wood (Composto com Madeira)" },
  { valor: "Carbon Fiber", rotulo: "Fibra de Carbono (PLA/PETG/Nylon CF)" },
];

const MATERIAIS_SLA = [
  { valor: "Standard", rotulo: "Resina Padrão" },
  { valor: "ABS-Like", rotulo: "Resina ABS-Like (Alta Resistência)" },
  { valor: "Water Washable", rotulo: "Resina Lavável em Água" },
  { valor: "Tough", rotulo: "Resina Tough (Alta Tenacidade)" },
  { valor: "Flexible", rotulo: "Resina Flexível" },
  { valor: "Castable", rotulo: "Resina Calcinável (Joias/Dental)" },
  { valor: "Dental", rotulo: "Resina Dental" },
  { valor: "High Temp", rotulo: "Resina Alta Temperatura" },
];

// --- PALETA DE CORES ---
const CORES_PREDEFINIDAS = [
  "#FFFFFF", "#F5DEB3", "#C0C0C0", "#FFFF00", "#FFD700", "#FFA500", "#FF4500",
  "#8B0000", "#800080", "#4B0082", "#00FFFF", "#00BFFF", "#0000FF", "#000080",
  "#8B4513", "#5D4037", "#808000", "#808080", "#708090", "#2F4F4F", "#000000",
  "#FA8072", "#FFC0CB", "#FF00FF", "#FF0000", "#32CD32", "#008000", "#006400",
];

interface FormularioMaterialProps {
  aberto: boolean;
  aoSalvar: (dados: any) => void;
  aoCancelar: () => void;
  materialEditando?: Material | null;
}

export function FormularioMaterial({
  aberto,
  aoSalvar,
  aoCancelar,
  materialEditando,
}: FormularioMaterialProps) {
  const isEditando = Boolean(materialEditando);

  const [confirmarDescarte, definirConfirmarDescarte] = useState(false);
  const inputCorRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(esquemaMaterial),
    defaultValues: {
      tipo: "FDM",
      fabricante: "",
      tipoMaterial: "",
      nomePersonalizado: "",
      cor: "",
      preco: "" as unknown as number,
      peso: 1000,
      estoqueInicial: 1,
      usarGramas: false,
    },
  });

  // Observar valores que precisam atualizar a UI
  const tipoSelecionado = watch("tipo");
  const fabricanteSelecionado = watch("fabricante");
  const tipoMaterialSelecionado = watch("tipoMaterial");

  const corSelecionada = watch("cor");
  const usarGramasSelecionado = watch("usarGramas");

  // Reseta o estado todo quando abre/fecha ou altera material editado
  useEffect(() => {
    if (aberto) {
      if (materialEditando) {
        const nomeFinalEsperado = `${materialEditando.tipoMaterial || ""} ${materialEditando.fabricante || ""}`.trim();
        const temNomeCustomizado =
          materialEditando.nome !== nomeFinalEsperado &&
          materialEditando.nome !== materialEditando.tipoMaterial;

        reset({
          tipo: materialEditando.tipo,
          fabricante: materialEditando.fabricante || "",
          tipoMaterial: materialEditando.tipoMaterial || "",
          nomePersonalizado: temNomeCustomizado ? materialEditando.nome : "",
          cor: materialEditando.cor || "",
          preco: materialEditando.precoCentavos ? materialEditando.precoCentavos / 100 : 0,
          peso: materialEditando.pesoGramas,
          estoqueInicial: materialEditando.estoque,
          usarGramas: false,
        });
      } else {
        reset({
          tipo: "FDM",
          fabricante: "",
          tipoMaterial: "",
          nomePersonalizado: "",
          cor: "",
          preco: "" as unknown as number,
          peso: 1000,
          estoqueInicial: 1,
          usarGramas: false,
        });
      }
      definirConfirmarDescarte(false);
    }
  }, [aberto, materialEditando, reset]);

  const opcoesMaterialAtual = useMemo(
    () => (tipoSelecionado === "FDM" ? MATERIAIS_FDM : MATERIAIS_SLA),
    [tipoSelecionado],
  );

  const lidarComEnvioRHF = (dados: FormValues) => {
    const corFinal = dados.cor || "#3b82f6";
    const nomeFinal =
      dados.nomePersonalizado ||
      `${dados.tipoMaterial || "Material"} ${dados.fabricante || ""}`.trim();

    aoSalvar({
      id: materialEditando?.id || crypto.randomUUID(),
      tipo: dados.tipo,
      nome: nomeFinal,
      tipoMaterial: dados.tipoMaterial,
      fabricante: dados.fabricante,
      cor: corFinal,
      precoCentavos: Math.round(Number(dados.preco) * 100),
      pesoGramas: Number(dados.peso),
      estoque: dados.estoqueInicial,
    });
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
      titulo={isEditando ? "Editar Material" : "Novo Material"}
      larguraMax="max-w-4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-[500px]">
        {/* --- COLUNA ESQUERDA: VISUALIZAÇÃO 3D --- */}
        <div className="bg-gray-50 dark:bg-[#18181b] border-r border-gray-200 dark:border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden group text-gray-900 dark:text-white">
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              backgroundPosition: "center center",
              maskImage:
                "radial-gradient(ellipse at center, black 40%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 40%, transparent 75%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none opacity-100"
            style={{
              background:
                "radial-gradient(circle at center 50%, rgba(56, 189, 248, 0.08) 0%, transparent 60%)",
            }}
          />
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-gray-200/50 dark:from-black/40 to-transparent pointer-events-none" />

          <div className="absolute top-6 inset-x-6 flex bg-white dark:bg-[#18181b] p-1 rounded-lg border border-gray-200 dark:border-white/5 z-20 shadow-sm">
            <button
              type="button"
              onClick={() => setValue("tipo", "FDM", { shouldValidate: true, shouldDirty: true })}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${tipoSelecionado === "FDM" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-white/10" : "text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
            >
              FILAMENTO
            </button>
            <button
              type="button"
              onClick={() => setValue("tipo", "SLA", { shouldValidate: true, shouldDirty: true })}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${tipoSelecionado === "SLA" ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-white/10" : "text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
            >
              RESINA
            </button>
          </div>

          <div className="relative z-10 my-auto py-12 transition-transform ">
            {tipoSelecionado === "FDM" ? (
              <Carretel
                cor={corSelecionada || "#27272a"}
                tamanho={200}
                porcentagem={corSelecionada ? 100 : 0}
                className={`drop-shadow-2xl transition-all duration-700`}
              />
            ) : (
              <GarrafaResina
                cor={corSelecionada || "#27272a"}
                tamanho={160}
                porcentagem={corSelecionada ? 100 : 0}
                className={`drop-shadow-2xl transition-all duration-700`}
              />
            )}
          </div>

          <div className="absolute bottom-6 text-center">
            <div className="flex items-center gap-2 justify-center">
              <div
                className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10 shadow-sm"
                style={{ backgroundColor: corSelecionada || "#27272a" }}
              />
              <span className="text-sm font-bold text-gray-700 dark:text-white tracking-widest">
                {corSelecionada ? corSelecionada.toUpperCase() : "VAZIO"}
              </span>
            </div>
          </div>
        </div>

        {/* --- COLUNA DIREITA: FORMULÁRIO --- */}
        <form
          onSubmit={handleSubmit(lidarComEnvioRHF)}
          className="flex flex-col h-full bg-white dark:bg-[#18181b]"
        >
          <div className="flex-1 p-6 md:p-8 space-y-8">
            <div className="space-y-5">
              <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">
                Identificação Principal
              </h4>
              <div className="grid grid-cols-2 gap-5">
                {/* --- FABRICANTE --- */}
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Fabricante / Marca
                  </label>
                  <Combobox
                    opcoes={FABRICANTES}
                    valor={fabricanteSelecionado}
                    aoAlterar={(val) => setValue("fabricante", val, { shouldValidate: true, shouldDirty: true })}
                    placeholder="Selecione ou digite..."
                    permitirNovo={true}
                    icone={Building2}
                  />
                  {errors.fabricante && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 block">
                      {errors.fabricante.message}
                    </span>
                  )}
                </div>

                {/* --- TIPO MATERIAL --- */}
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Tipo de Material
                  </label>
                  <Combobox
                    opcoes={opcoesMaterialAtual}
                    valor={tipoMaterialSelecionado}
                    aoAlterar={(val) => setValue("tipoMaterial", val, { shouldValidate: true, shouldDirty: true })}
                    placeholder="Selecione ou digite..."
                    permitirNovo={true}
                    icone={Layers}
                  />
                  {errors.tipoMaterial && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 block">
                      {errors.tipoMaterial.message}
                    </span>
                  )}
                </div>

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
                      {...register("nomePersonalizado")}
                      placeholder={
                        tipoMaterialSelecionado && fabricanteSelecionado
                          ? `Padrão: ${tipoMaterialSelecionado} ${fabricanteSelecionado} ${corSelecionada}`
                          : "Deixe em branco para auto-gerar o nome"
                      }
                      className="w-full h-11 pl-10 pr-4 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-gray-200 dark:border-white/5 focus:bg-white dark:focus:bg-[#0c0c0e] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-medium"
                    />
                  </div>
                </div>

                {/* --- SELETOR DE COR --- */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                    Cor Predominante
                  </label>
                  <div className="bg-gray-50 dark:bg-[#0e0e11] border border-gray-200 dark:border-white/5 rounded-xl p-4 shadow-sm">
                    <div className="flex flex-wrap gap-2.5">
                      {CORES_PREDEFINIDAS.map((corPreset) => (
                        <button
                          key={corPreset}
                          type="button"
                          onClick={() => setValue("cor", corPreset, { shouldDirty: true })}
                          className={`
                            w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95 shadow-sm
                            ${corSelecionada === corPreset ? "border-gray-900 dark:border-white scale-110 shadow-md ring-2 ring-gray-900/10 dark:ring-white/10" : "border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30"}
                          `}
                          style={{ backgroundColor: corPreset }}
                          title={corPreset}
                        />
                      ))}

                      {/* Botão Gradiente para Cor Personalizada */}
                      <div className="relative">
                        <input
                          ref={inputCorRef}
                          type="color"
                          value={corSelecionada || "#000000"}
                          onChange={(e) => setValue("cor", e.target.value, { shouldDirty: true })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button
                          type="button"
                          className={`
                            w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 shadow-sm
                            bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-900 text-gray-600 dark:text-zinc-400
                            ${!CORES_PREDEFINIDAS.includes(corSelecionada || "") && corSelecionada ? "border-gray-900 dark:border-white shadow-md scale-110 ring-2 ring-gray-900/10 dark:ring-white/10" : "border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30"}
                          `}
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">
                Precificação & Estoque
              </h4>
              <div className="grid grid-cols-3 gap-5 relative">
                {/* PREÇO */}
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                    Valor Total
                  </label>
                  <div className="relative group">
                    <DollarSign
                      size={16}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.preco ? "text-red-400" : "text-gray-400 dark:text-zinc-500 group-focus-within:text-gray-900 dark:group-focus-within:text-white"} transition-colors`}
                    />
                    <input
                      type="number"
                      step="0.01"
                      {...register("preco", { valueAsNumber: true })}
                      placeholder="Ex: 89,90"
                      className={`w-full h-11 pl-10 pr-3 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${errors.preco ? "border-red-500" : "border-gray-200 dark:border-white/5 focus:border-gray-900 focus:ring-gray-900 dark:focus:border-white dark:focus:ring-white"} focus:bg-white dark:focus:bg-[#0c0c0e] focus:ring-1 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-bold no-spinner`}
                    />
                  </div>
                  {errors.preco && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 block">
                      {errors.preco.message}
                    </span>
                  )}
                </div>

                {/* PESO / VOLUME TOTAL */}
                <div className="col-span-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-zinc-400">
                      Quantidade útil
                    </label>
                    {tipoSelecionado === "SLA" && (
                      <button
                        type="button"
                        onClick={() => setValue("usarGramas", !usarGramasSelecionado)}
                        className="text-[10px] font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white uppercase transition-colors"
                      >
                        {usarGramasSelecionado ? "Usar ML" : "Usar Gr"}
                      </button>
                    )}
                  </div>
                  <div className="relative group flex items-center">
                    <div
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.peso ? "text-red-400" : "text-gray-400 dark:text-zinc-500 group-focus-within:text-gray-900 dark:group-focus-within:text-white"} transition-colors z-10`}
                    >
                      {tipoSelecionado === "SLA" && !usarGramasSelecionado ? (
                        <Beaker size={16} />
                      ) : (
                        <Weight size={16} />
                      )}
                    </div>
                    <input
                      type="number"
                      {...register("peso", { valueAsNumber: true })}
                      placeholder={
                        tipoSelecionado === "SLA" && !usarGramasSelecionado ? "1000" : "1000"
                      }
                      className={`w-full h-11 pl-10 pr-12 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${errors.peso ? "border-red-500" : "border-gray-200 dark:border-white/5 focus:border-gray-900 focus:ring-gray-900 dark:focus:border-white dark:focus:ring-white"} focus:bg-white dark:focus:bg-[#0c0c0e] focus:ring-1 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-bold no-spinner`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none">
                      {tipoSelecionado === "SLA" && !usarGramasSelecionado ? "ML" : "G"}
                    </span>
                  </div>
                  {errors.peso && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 block">
                      {errors.peso.message}
                    </span>
                  )}
                </div>

                {/* ESTOQUE INICIAL */}
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                    Unidades (Qtd)
                  </label>
                  <div className="relative group">
                    <BoxSelect
                      size={16}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.estoqueInicial ? "text-red-400" : "text-gray-400 dark:text-zinc-500 group-focus-within:text-gray-900 dark:group-focus-within:text-white"} transition-colors`}
                    />
                    <input
                      type="number"
                      {...register("estoqueInicial", { valueAsNumber: true })}
                      placeholder="Ex: 1"
                      className={`w-full h-11 pl-10 pr-3 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${errors.estoqueInicial ? "border-red-500" : "border-gray-200 dark:border-white/5 focus:border-gray-900 focus:ring-gray-900 dark:focus:border-white dark:focus:ring-white"} focus:bg-white dark:focus:bg-[#0c0c0e] focus:ring-1 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-bold no-spinner`}
                    />
                  </div>
                  {errors.estoqueInicial && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 block">
                      {errors.estoqueInicial.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-[#0e0e11]/50 flex flex-col items-end gap-3 rounded-br-xl min-h-[88px] justify-center">
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
                  {isEditando ? "Salvar Alterações" : "Cadastrar Material"}
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
      </div>
    </Dialogo>
  );
}
