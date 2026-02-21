import { useState, useMemo, useRef, useEffect } from "react";
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
import { Material } from "../tipos";

// --- ESQUEMA DE VALIDAO (ZOD) ---
const esquemaMaterial = z.object({
  fabricante: z.string().min(1, "O fabricante é obrigatório."),
  nome: z.string().min(1, "O tipo de material é obrigatório."),
  preco: z
    .number({ message: "Valor numérico obrigatório." })
    .positive("O valor deve ser maior que zero."),
  peso: z
    .number({ message: "Quantidade numérica obrigatória." })
    .positive("A quantidade deve ser maior que zero."),
  estoqueInicial: z
    .number({ message: "Estoque numérico obrigatório." })
    .int("Deixe sem casas decimais.")
    .min(0, "O estoque não pode ser negativo."),
});
type ErrosValidacao = z.inferFlattenedErrors<
  typeof esquemaMaterial
>["fieldErrors"];

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

// --- PALETA DE CORES (Inspirada na imagem fornecida) ---
const CORES_PREDEFINIDAS = [
  "#FFFFFF",
  "#F5DEB3",
  "#C0C0C0",
  "#FFFF00",
  "#FFD700",
  "#FFA500",
  "#FF4500",
  "#8B0000",
  "#800080",
  "#4B0082",
  "#00FFFF",
  "#00BFFF",
  "#0000FF",
  "#000080",
  "#8B4513",
  "#5D4037",
  "#808000",
  "#808080",
  "#708090",
  "#2F4F4F",
  "#000000",
  "#FA8072",
  "#FFC0CB",
  "#FF00FF",
  "#FF0000",
  "#32CD32",
  "#008000",
  "#006400",
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

  const [tipo, definirTipo] = useState<"FDM" | "SLA">("FDM");
  const [nome, definirNome] = useState("");
  const [fabricante, definirFabricante] = useState("");
  const [nomePersonalizado, definirNomePersonalizado] = useState("");
  const [cor, definirCor] = useState("");
  const [preco, definirPreco] = useState("");
  const [peso, definirPeso] = useState("1000");
  const [usarGramas, definirUsarGramas] = useState(false);
  const [estoqueInicial, definirEstoqueInicial] = useState("");
  const [confirmarDescarte, definirConfirmarDescarte] = useState(false);
  const [erros, definirErros] = useState<ErrosValidacao>({});

  // Ref para o input de cor "secreto"
  const inputCorRef = useRef<HTMLInputElement>(null);

  // Reseta o estado todo quando abre/fecha ou altera material editado
  useEffect(() => {
    if (aberto) {
      if (materialEditando) {
        // Modo Edição: Popula os campos com os dados do material
        definirTipo(materialEditando.tipo);
        definirNome(materialEditando.tipoMaterial || "");
        definirFabricante(materialEditando.fabricante || "");
        // Se o nome e as variaveis baterem com nosso gerador automático, não precisa exibir o nome personalizado (a não ser que difira)
        const nomeFinalEsperado =
          `${materialEditando.tipoMaterial || ""} ${materialEditando.fabricante || ""}`.trim();
        definirNomePersonalizado(
          materialEditando.nome !== nomeFinalEsperado &&
            materialEditando.nome !== materialEditando.tipoMaterial
            ? materialEditando.nome
            : "",
        );
        definirCor(materialEditando.cor || "");
        definirPreco(materialEditando.preco.toString());
        definirPeso(materialEditando.peso.toString());
        definirEstoqueInicial(materialEditando.estoque.toString());
        definirUsarGramas(false);
      } else {
        // Modo Novo Material: Reseta tudo
        definirTipo("FDM");
        definirNome("");
        definirFabricante("");
        definirNomePersonalizado("");
        definirCor("");
        definirPreco("");
        definirPeso("1000");
        definirUsarGramas(false);
        definirEstoqueInicial("");
      }
      definirConfirmarDescarte(false);
      definirErros({});
    }
  }, [aberto, materialEditando]);

  // Checa se há alterações
  const temAlteracoes = () => {
    return (
      tipo !== "FDM" ||
      nome !== "" ||
      fabricante !== "" ||
      nomePersonalizado !== "" ||
      cor !== "" ||
      preco !== "" ||
      peso !== "1000" ||
      usarGramas !== false ||
      estoqueInicial !== ""
    );
  };

  const opcoesMaterial = useMemo(
    () => (tipo === "FDM" ? MATERIAIS_FDM : MATERIAIS_SLA),
    [tipo],
  );


  const lidarComEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    definirErros({});

    // Validação Zod
    const resultadoValidacao = esquemaMaterial.safeParse({
      fabricante,
      nome,
      preco: Number(preco),
      peso: Number(peso),
      estoqueInicial: Number(estoqueInicial),
    });

    if (!resultadoValidacao.success) {
      definirErros(resultadoValidacao.error.flatten().fieldErrors);
      return; // Interrompe o envio se houver erro
    }

    const corFinal = cor || "#3b82f6";
    const nomeFinal =
      nomePersonalizado ||
      `${nome || "Material"} ${fabricante || ""} ${corFinal === "#3b82f6" ? "" : ""}`.trim();

    aoSalvar({
      id: Date.now().toString(),
      tipo,
      nome: nomeFinal,
      tipoMaterial: nome,
      fabricante,
      cor: corFinal,
      preco: Number(preco),
      peso: Number(peso),
      estoque: Number(estoqueInicial),
    });
  };

  const lidarComTentativaFechamento = () => {
    if (temAlteracoes() && !confirmarDescarte) {
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
        <div className="bg-zinc-50 dark:bg-[#18181b] border-r border-zinc-200 dark:border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden group text-black dark:text-white">
          {/* Fundo premium com malha de GRADE QUADRICULADA (Mesh) estilo Fatiador 3D */}
          <div
            className="absolute inset-0 opacity-20 dark:opacity-[0.1] pointer-events-none"
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

          {/* Foco de luz de estúdio (Pódio) para dar volume ao objeto */}
          <div
            className="absolute inset-0 pointer-events-none opacity-100"
            style={{
              background:
                "radial-gradient(circle at center 50%, rgba(56, 189, 248, 0.08) 0%, transparent 60%)",
            }}
          />

          {/* Sombra base no rodapé da visualização (chão) */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-gray-200/50 dark:from-black/40 to-transparent pointer-events-none" />

          <div className="absolute top-6 inset-x-6 flex bg-zinc-200/50 dark:bg-[#18181b] p-1 rounded-lg border border-zinc-200 dark:border-white/5 z-20">
            <button
              type="button"
              onClick={() => definirTipo("FDM")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${tipo === "FDM" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-white/10" : "text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
            >
              FILAMENTO
            </button>
            <button
              type="button"
              onClick={() => definirTipo("SLA")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${tipo === "SLA" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-white/10" : "text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
            >
              RESINA
            </button>
          </div>

          <div className="relative z-10 my-auto py-12 transition-transform ">
            {tipo === "FDM" ? (
              <Carretel
                cor={cor || "#27272a"}
                tamanho={200}
                porcentagem={cor ? 100 : 0}
                className={`drop-shadow-2xl transition-all duration-700`}
              />
            ) : (
              <GarrafaResina
                cor={cor || "#27272a"}
                tamanho={160}
                porcentagem={cor ? 100 : 0}
                className={`drop-shadow-2xl transition-all duration-700`}
              />
            )}
          </div>

          <div className="absolute bottom-6 text-center">
            <div className="flex items-center gap-2 justify-center">
              <div
                className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10 shadow-sm"
                style={{ backgroundColor: cor || "#27272a" }}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {cor ? cor.toUpperCase() : "VAZIO"}
              </span>
            </div>
          </div>
        </div>

        {/* --- COLUNA DIREITA: FORMULÁRIO --- */}
        <form
          onSubmit={lidarComEnvio}
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
                    valor={fabricante}
                    aoAlterar={definirFabricante}
                    placeholder="Selecione ou digite..."
                    permitirNovo={true}
                    icone={Building2}
                  />
                  {erros.fabricante && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 block">
                      {erros.fabricante[0]}
                    </span>
                  )}
                </div>

                {/* --- TIPO MATERIAL --- */}
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Tipo de Material
                  </label>
                  <Combobox
                    opcoes={opcoesMaterial}
                    valor={nome}
                    aoAlterar={definirNome}
                    placeholder="Selecione ou digite..."
                    permitirNovo={true}
                    icone={Layers}
                  />
                  {erros.nome && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 block">
                      {erros.nome[0]}
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
                      value={nomePersonalizado}
                      onChange={(e) => definirNomePersonalizado(e.target.value)}
                      placeholder={
                        nome && fabricante
                          ? `Padrão: ${nome} ${fabricante} ${cor}`
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
                          onClick={() => definirCor(corPreset)}
                          className={`
                                                        w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95 shadow-sm
                                                        ${cor === corPreset ? "border-gray-900 dark:border-white scale-110 shadow-md ring-2 ring-gray-900/10 dark:ring-white/10" : "border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30"}
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
                          value={cor || "#000000"}
                          onChange={(e) => definirCor(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button
                          type="button"
                          className={`
                                                        w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 shadow-sm
                                                        bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-900 text-gray-600 dark:text-zinc-400
                                                        ${!CORES_PREDEFINIDAS.includes(cor) && cor ? "border-gray-900 dark:border-white shadow-md scale-110 ring-2 ring-gray-900/10 dark:ring-white/10" : "border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30"}
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
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${erros.preco ? "text-red-400" : "text-gray-400 dark:text-zinc-500 group-focus-within:text-gray-900 dark:group-focus-within:text-white"} transition-colors`}
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={preco}
                      onChange={(e) => definirPreco(e.target.value)}
                      placeholder="Ex: 89,90"
                      className={`w-full h-11 pl-10 pr-3 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${erros.preco ? "border-red-500" : "border-gray-200 dark:border-white/5 focus:border-gray-900 focus:ring-gray-900 dark:focus:border-white dark:focus:ring-white"} focus:bg-white dark:focus:bg-[#0c0c0e] focus:ring-1 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-bold no-spinner`}
                    />
                  </div>
                  {erros.preco && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 block">
                      {erros.preco[0]}
                    </span>
                  )}
                </div>

                {/* PESO / VOLUME TOTAL */}
                <div className="col-span-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-zinc-400">
                      Quantidade útil
                    </label>
                    {tipo === "SLA" && (
                      <button
                        type="button"
                        onClick={() => definirUsarGramas(!usarGramas)}
                        className="text-[10px] font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white uppercase transition-colors"
                      >
                        {usarGramas ? "Usar ML" : "Usar Gr"}
                      </button>
                    )}
                  </div>
                  <div className="relative group flex items-center">
                    <div
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${erros.peso ? "text-red-400" : "text-gray-400 dark:text-zinc-500 group-focus-within:text-gray-900 dark:group-focus-within:text-white"} transition-colors z-10`}
                    >
                      {tipo === "SLA" && !usarGramas ? (
                        <Beaker size={16} />
                      ) : (
                        <Weight size={16} />
                      )}
                    </div>
                    <input
                      type="number"
                      value={peso}
                      onChange={(e) => definirPeso(e.target.value)}
                      placeholder={
                        tipo === "SLA" && !usarGramas ? "1000" : "1000"
                      }
                      className={`w-full h-11 pl-10 pr-12 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${erros.peso ? "border-red-500" : "border-gray-200 dark:border-white/5 focus:border-gray-900 focus:ring-gray-900 dark:focus:border-white dark:focus:ring-white"} focus:bg-white dark:focus:bg-[#0c0c0e] focus:ring-1 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-bold no-spinner`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none">
                      {tipo === "SLA" && !usarGramas ? "ML" : "G"}
                    </span>
                  </div>
                  {erros.peso && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 block">
                      {erros.peso[0]}
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
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${erros.estoqueInicial ? "text-red-400" : "text-gray-400 dark:text-zinc-500 group-focus-within:text-gray-900 dark:group-focus-within:text-white"} transition-colors`}
                    />
                    <input
                      type="number"
                      value={estoqueInicial}
                      onChange={(e) => definirEstoqueInicial(e.target.value)}
                      placeholder="Ex: 1"
                      className={`w-full h-11 pl-10 pr-3 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${erros.estoqueInicial ? "border-red-500" : "border-gray-200 dark:border-white/5 focus:border-gray-900 focus:ring-gray-900 dark:focus:border-white dark:focus:ring-white"} focus:bg-white dark:focus:bg-[#0c0c0e] focus:ring-1 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-bold no-spinner`}
                    />
                  </div>
                  {erros.estoqueInicial && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 block">
                      {erros.estoqueInicial[0]}
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
                  className="px-6 py-2.5 flex-1 md:flex-none justify-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95"
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
