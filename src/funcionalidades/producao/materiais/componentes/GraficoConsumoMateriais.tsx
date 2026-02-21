import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingDown, Activity } from "lucide-react";
import { Material } from "../tipos";

export function GraficoConsumoMateriais({
  materiais,
}: {
  materiais: Material[];
}) {
  const todosRegistros = materiais
    .flatMap((m) => m.historicoUso || [])
    .sort((a, b) => Number(a.id) - Number(b.id));

  const totalGasto = todosRegistros.reduce(
    (acc, curr) => acc + curr.quantidadeGasta,
    0,
  );

  let acumulado = 0;
  const dadosEvolucao = [
    { data: "Início", peso: 0 },
    ...todosRegistros.map((r) => {
      acumulado += r.quantidadeGasta;
      return {
        data: r.data.split(",")[0], // Extrai apenas "20 fev"
        peso: acumulado,
      };
    }),
  ];

  const dadosConsumo =
    dadosEvolucao.length > 1
      ? dadosEvolucao
      : [
        { data: "Há 30d", peso: 0 },
        { data: "Hoje", peso: 0 },
      ];

  return (
    <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="text-sky-500" size={24} />
            Velocidade de Consumo
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 mt-1">
            Acompanhamento do gasto total de materiais nos últimos 30 dias.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl p-3">
            <span className="block text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">
              Gasto 30d
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-rose-700 dark:text-rose-300">
                {(totalGasto > 0 ? totalGasto / 1000 : 2.5).toFixed(1)}kg
              </span>
              <TrendingDown size={16} className="text-rose-500" />
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-3">
            <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
              Previsão de Fim
            </span>
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
              14 Dias
            </span>
          </div>
        </div>
      </div>

      <div className="w-full h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={dadosConsumo}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="corConsumo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255,255,255,0.05)"
            />
            <XAxis
              dataKey="data"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#71717a", fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#71717a", fontWeight: 600 }}
              tickFormatter={(valor) => `${valor}g`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#fff",
                fontWeight: "bold",
              }}
              itemStyle={{ color: "#0ea5e9" }}
              formatter={(value: any) => [`${value}g consumidos`, "Gasto"]}
              labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
            />
            <Area
              type="monotone"
              dataKey="peso"
              stroke="#0ea5e9"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#corConsumo)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
