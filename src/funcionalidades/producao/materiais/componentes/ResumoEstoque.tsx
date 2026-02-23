import {
  PackageSearch,
  DollarSign,
  AlertTriangle,
  Activity,
  X,
} from "lucide-react";
import { useState } from "react";
import { GraficoConsumoMateriais } from "./GraficoConsumoMateriais";
import { Material } from "@/funcionalidades/producao/materiais/tipos";

interface ResumoEstoqueProps {
  materiais: Material[];
  totalEmbalagens: number;
  valorInvestido: number;
  alertasBaixoEstoque: number;
}

export function ResumoEstoque({
  materiais,
  totalEmbalagens,
  valorInvestido,
  alertasBaixoEstoque,
}: ResumoEstoqueProps) {
  const [modalGraficoAberto, definirModalGraficoAberto] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden">
        <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center border border-sky-100 dark:border-sky-500/20 text-sky-600 dark:text-sky-400">
          <PackageSearch size={24} strokeWidth={2} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1">
            Total em Estoque
          </h4>
          <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {totalEmbalagens}{" "}
            <span className="text-base font-semibold text-gray-400 dark:text-zinc-600">
              itens
            </span>
          </span>
        </div>
        {/* Detalhe de fundo */}
        <PackageSearch
          className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/5"
          size={100}
          strokeWidth={1}
        />
      </div>

      <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <DollarSign size={24} strokeWidth={2} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1">
            Valor Investido
          </h4>
          <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {valorInvestido.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>
        <DollarSign
          className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/5"
          size={100}
          strokeWidth={1}
        />
      </div>

      <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center border ${alertasBaixoEstoque > 0 ? "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 dark:text-zinc-500"}`}
        >
          <AlertTriangle size={24} strokeWidth={2} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1">
            Alertas de Estoque
          </h4>
          <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {alertasBaixoEstoque}{" "}
            <span className="text-base font-semibold text-gray-400 dark:text-zinc-600">
              itens baixos
            </span>
          </span>
        </div>
        <AlertTriangle
          className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/5"
          size={100}
          strokeWidth={1}
        />
      </div>

      {/* Novo Card: Velocidade de Consumo (Mesmo tamanho dos outros) */}
      <div
        onClick={() => definirModalGraficoAberto(true)}
        className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden group cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors"
        role="button"
        tabIndex={0}
      >
        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-all duration-300 relative z-10">
          <Activity size={24} strokeWidth={2} />
        </div>
        <div className="relative z-10">
          <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1">
            Padrão de Consumo
          </h4>
          <span className="text-base font-black text-indigo-600 dark:text-indigo-400 tracking-tight flex items-center gap-1.5 transition-colors group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
            Ver Gráfico
            <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              →
            </span>
          </span>
        </div>
        <Activity
          className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/5"
          size={100}
          strokeWidth={1}
        />
      </div>

      {/* Modal de Gráfico de Consumo */}
      {modalGraficoAberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => definirModalGraficoAberto(false)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-50 dark:bg-[#18181b] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 p-6 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => definirModalGraficoAberto(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-white dark:hover:text-white dark:hover:bg-white/10 transition-colors z-10 border border-transparent hover:border-gray-200 dark:hover:border-white/10 shadow-sm"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            <div className="pr-12">
              <GraficoConsumoMateriais materiais={materiais} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
