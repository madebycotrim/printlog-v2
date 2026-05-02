import { LayoutDashboard } from "lucide-react";
import { GraficoConsumo } from "./GraficoConsumo";
import { StatusTempoReal } from "./StatusTempoReal";

/**
 * Seção de vista operacional com gráficos e status em tempo real.
 */
export function SecaoOperacional() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard size={18} className="text-gray-400" />
        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">
          Vista Operacional
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 min-h-[400px]">
          <GraficoConsumo />
        </div>
        <div>
          <StatusTempoReal />
        </div>
      </div>
    </section>
  );
}
