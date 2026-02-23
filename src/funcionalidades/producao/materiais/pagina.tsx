import { FormularioMaterial } from "./componentes/FormularioMaterial";
import { ResumoEstoque } from "./componentes/ResumoEstoque";
import { FiltrosMaterial } from "./componentes/FiltrosMaterial";
import { CardMaterial } from "./componentes/CardMaterial";
import { PackageSearch, Search } from "lucide-react";
import { ModalAbatimentoPeso } from "./componentes/ModalAbatimentoPeso";
import { ModalHistoricoConsumo } from "./componentes/ModalHistoricoConsumo";
import { ModalArquivamentoMaterial } from "./componentes/ModalArquivamentoMaterial";
import { ModalReposicaoEstoque } from "./componentes/ModalReposicaoEstoque";
import { usarGerenciadorMateriais } from "./ganchos/usarGerenciadorMateriais";
import { Material } from "./tipos";

export function PaginaMateriais() {
  const { state, actions } = usarGerenciadorMateriais();

  return (
    <>
      {state.materiais.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center mt-4 h-[60vh]">
          <div className="text-gray-300 dark:text-zinc-700 mb-6">
            <PackageSearch size={48} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Nenhum material encontrado
          </h3>
          <p className="text-gray-500 dark:text-zinc-400 max-w-sm mx-auto mb-8 text-sm">
            Adicione o seu primeiro material para gerenciar o seu estoque de matéria prima.
          </p>
          <button
            onClick={() => actions.abrirEditar(null as unknown as Material)}
            className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold py-2.5 px-6 rounded-full shadow-sm transition-transform active:scale-95"
          >
            Cadastrar Material
          </button>
        </div>
      ) : (
        <>
          <ResumoEstoque
            materiais={state.materiais}
            totalEmbalagens={state.kpis.totalEmbalagens}
            valorInvestido={state.kpis.valorInvestido}
            alertasBaixoEstoque={state.kpis.alertasBaixoEstoque}
          />

          <div className="mt-8">
            <FiltrosMaterial
              filtroAtual={state.filtro}
              aoFiltrar={actions.definirFiltro}
              ordenacaoAtual={state.ordenacao}
              aoOrdenar={actions.definirOrdenacao}
              ordemInvertida={state.ordemInvertida}
              aoInverterOrdem={actions.inverterOrdem}
            />
          </div>

          {state.materiaisFiltradosOrdenados.length === 0 ? (
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
              {state.agrupadosPorTipoMaterial.map(([tipo, lista]) => (
                <div key={tipo} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {tipo}
                      </h3>
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#27272a] border border-gray-200 dark:border-zinc-700/50 text-[10px] font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-widest flex items-center h-6 leading-none shadow-sm">
                        {lista.length} ITEM{lista.length !== 1 ? "S" : ""}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/5" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {lista.map((mat) => (
                      <CardMaterial
                        key={mat.id}
                        material={mat}
                        aoEditar={actions.abrirEditar}
                        aoAbater={actions.abrirAbater}
                        aoHistorico={actions.abrirHistorico}
                        aoExcluir={actions.abrirExcluir}
                        aoRepor={actions.abrirRepor}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de Cadastro/Edição */}
      <FormularioMaterial
        aberto={state.modalAberto}
        aoSalvar={actions.salvarMaterial}
        aoCancelar={actions.fecharEditar}
        materialEditando={state.materialSendoEditado}
      />

      {/* Modal de Abatimento Manual de Peso/Volume */}
      <ModalAbatimentoPeso
        aberto={state.modalAbatimentoAberto}
        material={state.materialParaAbater}
        aoFechar={actions.fecharAbater}
        aoConfirmar={actions.confirmarAbatimentoPeso}
      />

      {/* Modal de Histórico de Consumo */}
      <ModalHistoricoConsumo
        aberto={state.modalHistoricoAberto}
        material={state.materialParaHistorico}
        aoFechar={actions.fecharHistorico}
      />

      {/* Modal de Arquivamento disfarçado de Remoção */}
      <ModalArquivamentoMaterial
        aberto={state.modalExclusaoAberto}
        material={state.materialParaExcluir}
        aoFechar={actions.fecharExcluir}
        aoConfirmar={actions.confirmarArquivamento}
      />

      {/* Modal de Reposição de Estoque */}
      <ModalReposicaoEstoque
        aberto={state.modalReposicaoAberto}
        material={state.materialParaRepor}
        aoFechar={actions.fecharRepor}
        aoConfirmar={actions.confirmarReposicaoMaterial}
      />
    </>
  );
}
