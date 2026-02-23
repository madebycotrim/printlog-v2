import { useState, useEffect } from "react";
import { Save, AlertCircle, Droplets, ArrowRight, Tag } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Combobox } from "@/compartilhado/componentes_ui/Combobox";
import { Material } from "@/funcionalidades/producao/materiais/tipos";

const MOTIVOS_ABATIMENTO = [
  { valor: "Falha de Impressão", rotulo: "Falha de Impressão" },
  { valor: "Restos", rotulo: "Restos (Suportes/Brim/Raft)" },
  { valor: "Calibração", rotulo: "Calibração e Testes" },
  { valor: "Perda/Dano", rotulo: "Perda de Material / Dano" },
  { valor: "Outros", rotulo: "Outros" },
];

interface ModalAbatimentoPesoProps {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: (quantidadeAbatida: number, motivo: string) => void;
  material: Material | null;
}

export function ModalAbatimentoPeso({
  aberto,
  aoFechar,
  aoConfirmar,
  material,
}: ModalAbatimentoPesoProps) {
  const [quantidade, definirQuantidade] = useState<string>("");
  const [motivo, definirMotivo] = useState<string>("");
  const [erro, definirErro] = useState<string | null>(null);

  useEffect(() => {
    if (aberto) {
      definirQuantidade("");
      definirMotivo("");
      definirErro(null);
    }
  }, [aberto]);

  if (!material) return null;

  const unidade = material.tipo === "SLA" ? "ml" : "g";
  const numQtd = Number(quantidade.replace(",", "."));

  // Simulação do resultado (Preview)
  const pesoRestanteAtual = material.pesoRestante;
  const novoPesoRestante = Math.max(0, pesoRestanteAtual - (numQtd || 0));
  const abaterDoEstoqueLacrado = numQtd > pesoRestanteAtual; // Se o cara pedir pra abater mais do que tem no rolo atual

  const lidarComEnvio = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantidade) {
      definirErro("Digite uma quantidade para abater.");
      return;
    }

    if (isNaN(numQtd) || numQtd <= 0) {
      definirErro("Digite um valor numérico válido maior que zero.");
      return;
    }

    const estoqueTotalDisponivel =
      material.pesoRestante + material.estoque * material.peso;

    if (numQtd > estoqueTotalDisponivel) {
      definirErro(
        `Você não tem tudo isso. Máximo possível: ${estoqueTotalDisponivel}${unidade}`,
      );
      return;
    }

    aoConfirmar(numQtd, motivo);
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Abater Consumo"
      larguraMax="max-w-md"
    >
      <form
        onSubmit={lidarComEnvio}
        className="flex flex-col bg-white dark:bg-[#18181b]"
      >
        <div className="p-6 md:p-8 space-y-6 relative z-10">
          {/* Cabeçalho do Material */}
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 shadow-sm dark:shadow-none dark:border-white/5 relative z-10 w-full mb-6">
            <div
              className="w-10 h-10 rounded-full border-2 shadow-inner flex-shrink-0"
              style={{
                backgroundColor: material.cor,
                borderColor: "rgba(0,0,0,0.1)",
              }}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight">
                {material.nome}
              </span>
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium truncate">
                Atual:{" "}
                <strong className="text-sky-500">
                  {material.pesoRestante}
                  {unidade}
                </strong>{" "}
                no uso (Estoque: {material.estoque}x)
              </span>
            </div>
          </div>

          {/* Input de Quantidade */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
              Quantidade gasta (Restos, falhas, não-tabelados)
            </label>
            <div className="relative group">
              <Droplets
                size={18}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${erro ? "text-red-400" : "text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500"} transition-colors`}
              />
              <input
                autoFocus
                type="number"
                step="any"
                value={quantidade}
                onChange={(e) => {
                  definirQuantidade(e.target.value);
                  if (erro) definirErro(null);
                }}
                placeholder={`Ex: 50`}
                className={`w-full h-14 pl-11 pr-12 text-lg font-black bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${erro ? "border-red-500" : "border-gray-200 dark:border-white/5 focus:border-sky-500 focus:ring-sky-500/20"} focus:bg-white dark:focus:bg-[#0c0c0e] focus:ring-4 rounded-xl text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 no-spinner`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400 dark:text-zinc-600 pointer-events-none uppercase">
                {unidade}
              </span>
            </div>
            {erro && (
              <span className="text-[11px] font-bold text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} /> {erro}
              </span>
            )}
          </div>

          <div className="space-y-2 relative z-50">
            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400">
              Motivo do abatimento (Opcional)
            </label>
            <Combobox
              opcoes={MOTIVOS_ABATIMENTO}
              valor={motivo}
              aoAlterar={definirMotivo}
              placeholder="Selecione ou digite o motivo..."
              permitirNovo={true}
              icone={Tag}
            />
          </div>

          {/* Preview do Impacto */}
          {numQtd > 0 && !erro && (
            <div className="bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-2">
                Simulação do Estoque
              </h4>

              <div className="flex items-center justify-between text-sm font-bold text-gray-700 dark:text-zinc-300">
                <span>Rolo/Garrafa em uso</span>
                <div className="flex items-center gap-2">
                  <span className="line-through opacity-50">
                    {pesoRestanteAtual}
                    {unidade}
                  </span>
                  <ArrowRight size={14} className="text-gray-400" />
                  <span
                    className={
                      abaterDoEstoqueLacrado
                        ? "text-red-500"
                        : "text-green-500 dark:text-green-400"
                    }
                  >
                    {abaterDoEstoqueLacrado
                      ? "ESGOTADO"
                      : `${novoPesoRestante}${unidade}`}
                  </span>
                </div>
              </div>

              {abaterDoEstoqueLacrado && (
                <div className="mt-2 pt-2 border-t border-sky-200/50 dark:border-sky-500/20 flex items-center justify-between text-xs font-semibold text-red-600 dark:text-red-400">
                  <span>Um rolo/garrafa do estoque será aberto!</span>
                  <span>-1 Unidade Lacrada</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-5 md:p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-[#0e0e11]/50 flex items-center justify-end gap-3 rounded-br-xl">
          <button
            type="button"
            onClick={aoFechar}
            className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!!erro || !quantidade}
            style={{ backgroundColor: "var(--cor-primaria)" }}
            className="px-6 py-2.5 hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Save size={18} strokeWidth={2.5} />
            Confirmar Baixa
          </button>
        </div>
      </form>
    </Dialogo>
  );
}
