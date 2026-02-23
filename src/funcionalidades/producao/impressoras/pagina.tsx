import { Plus, Printer, Search } from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarGerenciadorImpressoras } from "./ganchos/usarGerenciadorImpressoras";
import { FormularioImpressora } from "./componentes/FormularioImpressora";
import { CardImpressora } from "./componentes/CardImpressora";
import { ResumoImpressoras } from "./componentes/ResumoImpressoras";
import { FiltrosImpressora } from "./componentes/FiltrosImpressora";
import { ModalDetalhesImpressora } from "./componentes/ModalDetalhesImpressora";
import { ModalAposentarImpressora } from "./componentes/ModalAposentarImpressora";
import { ModalHistoricoManutencao } from "./componentes/ModalHistoricoManutencao";
import { ModalRegistrarManutencao } from "./componentes/ModalRegistrarManutencao";
import { ModalPecasDesgaste } from "./componentes/ModalPecasDesgaste";
import { ModalHistoricoProducao } from "./componentes/ModalHistoricoProducao";

export function PaginaImpressoras() {
  const { state, actions } = usarGerenciadorImpressoras();

  usarDefinirCabecalho({
    titulo: "Minhas Impressoras",
    subtitulo: "Gerencie seu parque de máquinas",
    placeholderBusca: "Buscar impressora (Ex: Kobra S1)...",
    acao: {
      texto: "Nova Máquina",
      icone: Plus,
      aoClicar: () => actions.abrirEditar(),
    },
    aoBuscar: actions.pesquisar,
  });

  return (
    <>
      {state.impressoras.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center mt-4 h-[60vh]">
          <div className="text-gray-300 dark:text-zinc-700 mb-6">
            <Printer size={48} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Nenhuma impressora encontrada
          </h3>
          <p className="text-gray-500 dark:text-zinc-400 max-w-sm mx-auto mb-8 text-sm">
            Adicione sua primeira impressora 3D para expandir sua capacidade de produção.
          </p>
          <button
            onClick={() => actions.abrirEditar()}
            className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold py-2.5 px-6 rounded-full shadow-sm transition-transform active:scale-95"
          >
            Cadastrar Máquina
          </button>
        </div>
      ) : (
        <>
          <ResumoImpressoras
            totalMaquinas={state.totais.total}
            horasImpressao={state.totais.horasImpressao}
            emManutencao={state.totais.manutencao}
            valorInvestido={state.totais.valorInvestido}
          />

          <div className="mt-8">
            <FiltrosImpressora
              filtroAtual={state.filtroTecnologia}
              aoFiltrar={actions.filtrarPorTecnologia}
              ordenacaoAtual={state.ordenacao}
              aoOrdenar={actions.ordenarPor}
              ordemInvertida={state.ordemInvertida}
              aoInverterOrdem={actions.inverterOrdem}
            />
          </div>

          {state.impressorasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search size={36} strokeWidth={1.5} className="text-gray-300 dark:text-zinc-700 mb-4" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                Nenhum resultado encontrado
              </h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Tente buscar com termos diferentes.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {state.agrupadasPorTecnologia.map(([tecnologia, lista]) => (
                <div key={tecnologia} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {tecnologia}
                      </h3>
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#27272a] border border-gray-200 dark:border-zinc-700/50 text-[10px] font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-widest flex items-center h-6 leading-none shadow-sm">
                        {lista.length} ITEM{lista.length !== 1 ? "S" : ""}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/5" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {lista.map((impressora) => (
                      <CardImpressora
                        key={impressora.id}
                        impressora={impressora}
                        aoEditar={actions.abrirEditar}
                        aoAposentar={actions.abrirAposentar}
                        aoDetalhes={actions.abrirDetalhes}
                        aoHistorico={actions.abrirHistorico}
                        aoManutencoes={actions.abrirManutencao}
                        aoPecas={actions.abrirPecas}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <FormularioImpressora
        aberto={state.modalAberto}
        impressoraEditando={state.impressoraSendoEditada}
        aoCancelar={actions.fecharEditar}
        aoSalvar={actions.salvarImpressora}
      />

      <ModalDetalhesImpressora
        aberto={state.modalDetalhesAberto}
        impressora={state.impressoraEmDetalhes}
        aoFechar={actions.fecharDetalhes}
        aoSalvarObservacoes={actions.salvarObservacoes}
      />

      <ModalAposentarImpressora
        aberto={state.modalAposentarAberto}
        impressora={state.impressoraParaAposentar}
        aoFechar={actions.fecharAposentar}
        aoConfirmar={actions.confirmarAposentadoria}
      />

      <ModalHistoricoManutencao
        aberto={state.modalHistoricoAberto}
        impressora={state.impressoraHistorico}
        aoFechar={actions.fecharHistorico}
      />

      <ModalRegistrarManutencao
        aberto={state.modalManutencaoAberto}
        impressora={state.impressoraManutencao}
        aoFechar={actions.fecharManutencao}
        aoConfirmar={actions.registrarManutencao}
      />

      <ModalPecasDesgaste
        aberto={state.modalPecasAberto}
        impressora={state.impressoraPecas}
        aoFechar={actions.fecharPecas}
        aoSalvar={actions.salvarPecasDesgaste}
      />

      <ModalHistoricoProducao
        aberto={state.modalProducaoAberto}
        impressora={state.impressoraProducao}
        aoFechar={actions.fecharProducao}
      />
    </>
  );
}
