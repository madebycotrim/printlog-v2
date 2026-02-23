import { useState, useEffect } from "react";
import { History, Package, Clock, Box, DollarSign } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Material, RegistroUso } from "@/funcionalidades/producao/materiais/tipos";

interface ModalHistoricoConsumoProps {
  aberto: boolean;
  aoFechar: () => void;
  material: Material | null;
}

export function ModalHistoricoConsumo({
  aberto,
  aoFechar,
  material,
}: ModalHistoricoConsumoProps) {
  const [registros, definirRegistros] = useState<RegistroUso[]>([]);

  useEffect(() => {
    if (aberto && material) {
      definirRegistros(material.historicoUso || []);
    } else {
      definirRegistros([]);
    }
  }, [aberto, material]);

  if (!material) return null;

  const unidade = material.tipo === "SLA" ? "ml" : "g";
  const custoPorUnidade = material.preco / material.peso;
  const totalGastoHistorico = registros.reduce(
    (acc, curr) => acc + curr.quantidadeGasta,
    0,
  );
  const custoTotalHistorico = totalGastoHistorico * custoPorUnidade;

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Histórico de Impressões"
      larguraMax="max-w-2xl"
    >
      <div className="flex flex-col h-[600px] max-h-[80vh] bg-white dark:bg-[#18181b]">
        {/* Cabeçalho do Material */}
        <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-900/20">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl border-2 shadow-sm flex-shrink-0"
              style={{
                backgroundColor: material.cor,
                borderColor: "rgba(0,0,0,0.1)",
              }}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">
                {material.nome}
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 truncate">
                {material.fabricante} • {material.tipoMaterial}
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest block mb-1">
                Custo Calculado
              </span>
              <span className="text-sm font-black text-gray-900 dark:text-white">
                R$ {custoPorUnidade.toFixed(3).replace(".", ",")}/{unidade}
              </span>
            </div>
          </div>

          {/* Mini Dashboard do Histórico */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-gray-200 dark:border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Package size={18} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest block">
                  Consumo Registrado
                </span>
                <span className="text-lg font-black text-gray-900 dark:text-white">
                  {totalGastoHistorico}
                  {unidade}
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-gray-200 dark:border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <DollarSign size={18} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest block">
                  Custo Atribuído
                </span>
                <span className="text-lg font-black text-gray-900 dark:text-white">
                  R$ {custoTotalHistorico.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Registros */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
            <History size={14} className="text-gray-400" />
            Últimos Registros
          </h4>

          {registros.map((registro) => {
            const custoDaPeca = registro.quantidadeGasta * custoPorUnidade;
            return (
              <div
                key={registro.id}
                className="relative pl-6 pb-6 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[2px] before:bg-gray-100 dark:before:bg-white/5 last:before:hidden group"
              >
                <div
                  className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white dark:border-[#0c0c0e] flex items-center justify-center
                                    ${registro.status === "SUCESSO"
                      ? "bg-emerald-500"
                      : registro.status === "FALHA"
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                />

                <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 rounded-xl p-4 transition-colors group-hover:border-gray-300 dark:group-hover:border-white/10 ml-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {registro.nomePeca}
                        </h5>
                        {registro.status === "FALHA" && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                            Falhou
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 block pb-1 border-b border-gray-200 dark:border-white/10 w-fit">
                        {registro.data}
                      </span>
                      <div className="flex items-center gap-4 pt-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-zinc-400">
                          <Box size={14} className="text-gray-400" />
                          {registro.quantidadeGasta}
                          {unidade}
                        </div>
                        {registro.tempoImpressao && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-zinc-400">
                            <Clock size={14} className="text-gray-400" />
                            {registro.tempoImpressao}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center sm:items-end flex-col justify-center sm:justify-start bg-white dark:bg-[#18181b] sm:bg-transparent px-3 py-2 sm:p-0 rounded-lg sm:rounded-none border sm:border-transparent border-gray-200 dark:border-white/5 shrink-0">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
                        Custo Material
                      </span>
                      <span className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                        R$ {custoDaPeca.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Minimalista */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5 flex justify-center bg-gray-50/50 dark:bg-[#0e0e11]/50 rounded-br-xl">
          <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500">
            Os registros são criados automaticamente ao finalizar uma
            impressão.
          </span>
        </div>
      </div>
    </Dialogo>
  );
}
