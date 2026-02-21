import { Database, FileText, FileSpreadsheet, Trash2 } from "lucide-react";

export function CartaoDados() {
  const estatisticas = [
    { label: "CLIENTES", valor: 0 },
    { label: "FILAMENTOS", valor: 0 },
    { label: "INSUMOS", valor: 0 },
    { label: "IMPRESSORAS", valor: 0 },
    { label: "PROJETOS", valor: 0 },
  ];

  return (
    <div className="col-span-1 lg:col-span-1 bg-white dark:bg-[#0e0e11] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Meus Dados
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">
            GestÃ£o de Registros
          </p>
        </div>
        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
          <Database size={20} />
        </div>
      </div>

      <div className="flex justify-between items-center mb-8 px-2">
        {estatisticas.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <span className="text-xl font-black text-gray-900 dark:text-white">
              {stat.valor}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors uppercase tracking-wide">
            <FileSpreadsheet size={14} />
            CSV
          </button>
          <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors uppercase tracking-wide">
            <FileText size={14} />
            PDF
          </button>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dashed border-gray-300 dark:border-white/10 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors uppercase tracking-wide">
          <Trash2 size={14} />
          Abrir Lixeira do Sistema
        </button>
      </div>
    </div>
  );
}
