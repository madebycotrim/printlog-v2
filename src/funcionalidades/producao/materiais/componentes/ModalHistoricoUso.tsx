import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Material } from "../tipos";
import { usarHistoricoMateriais } from "../hooks/usarHistoricoMateriais";
import { FormularioConsumo } from "./FormularioConsumo";

interface ModalHistoricoUsoProps {
  aberto: boolean;
  aoFechar: () => void;
  material: Material;
}

export function ModalHistoricoUso({ aberto, aoFechar, material }: ModalHistoricoUsoProps) {
  const { historico, registrarConsumo } = usarHistoricoMateriais(material.id);

  const corStatus = {
    SUCESSO: "text-emerald-500",
    FALHA: "text-rose-500",
    CANCELADO: "text-amber-500",
    MANUAL: "text-zinc-500",
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={`${material.tipo === 'FDM' ? 'Filamento' : material.tipo === 'SLA' ? 'Resina' : 'Insumo'}: ${material.nome}`}
      larguraMax="max-w-2xl"
    >
      <div className="flex flex-col max-h-[80vh] overflow-hidden bg-white dark:bg-[#0e0e11]">
        <div className="p-6 space-y-8 overflow-y-auto scrollbar-hide">
          
          {/* Formulário de Abatimento */}
          <section className="p-6 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-6">Novo Abatimento</h3>
            <FormularioConsumo
              pesoDisponivel={material.pesoRestanteGramas}
              tipo={material.tipo}
              aoCancelar={aoFechar}
              aoSalvar={async (dados) => {
                await registrarConsumo(dados);
              }}
            />
          </section>

          {/* Histórico Simplificado */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Histórico Recente</h3>
            
            {historico.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-zinc-300">Nenhum registro encontrado</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-white/5">
                {historico.map((uso) => (
                  <div key={uso.id} className="py-4 flex justify-between items-center gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] font-black uppercase ${corStatus[uso.status as keyof typeof corStatus] || corStatus.MANUAL}`}>
                          {uso.status}
                        </span>
                        <span className="text-[9px] font-medium text-zinc-400">
                          {new Date(uso.data).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate uppercase tracking-tight">{uso.nomePeca}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-rose-500">-{uso.quantidadeGastaGramas}g</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </Dialogo>
  );
}
