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

import { motion, AnimatePresence } from "framer-motion";

export function PaginaMateriais() {
  const { estado, acoes } = usarGerenciadorMateriais();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {estado.materiais.length === 0 ? (
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
              onClick={() => acoes.abrirEditar(null as unknown as Material)}
              className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold py-2.5 px-6 rounded-full shadow-sm transition-transform active:scale-95"
            >
              Cadastrar Material
            </button>
          </div>
        ) : (
          <>
            <ResumoEstoque
              materiais={estado.materiais}
              totalEmbalagens={estado.kpis.totalEmbalagens}
              valorInvestido={estado.kpis.valorInvestido}
              alertasBaixoEstoque={estado.kpis.alertasBaixoEstoque}
            />

            <div className="mt-8">
              <FiltrosMaterial
                filtroAtual={estado.filtro}
                aoFiltrar={acoes.definirFiltro}
                ordenacaoAtual={estado.ordenacao}
                aoOrdenar={acoes.definirOrdenacao}
                ordemInvertida={estado.ordemInvertida}
                aoInverterOrdem={acoes.inverterOrdem}
              />
            </div>

            {estado.materiaisFiltradosOrdenados.length === 0 ? (
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
                <AnimatePresence mode="popLayout">
                  {estado.agrupadosPorTipoMaterial.map(([tipo, lista]) => (
                    <motion.div
                      layout
                      key={tipo}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
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
                            aoEditar={acoes.abrirEditar}
                            aoAbater={acoes.abrirAbater}
                            aoHistorico={acoes.abrirHistorico}
                            aoExcluir={acoes.abrirExcluir}
                            aoRepor={acoes.abrirRepor}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Modal de Cadastro/Edição */}
      <FormularioMaterial
        aberto={estado.modalAberto}
        aoSalvar={acoes.salvarMaterial}
        aoCancelar={acoes.fecharEditar}
        materialEditando={estado.materialSendoEditado}
      />

      {/* Modal de Abatimento Manual de Peso/Volume */}
      <ModalAbatimentoPeso
        aberto={estado.modalAbatimentoAberto}
        material={estado.materialParaAbater}
        aoFechar={acoes.fecharAbater}
        aoConfirmar={acoes.confirmarAbatimentoPeso}
      />

      {/* Modal de Histórico de Consumo */}
      <ModalHistoricoConsumo
        aberto={estado.modalHistoricoAberto}
        material={estado.materialParaHistorico}
        aoFechar={acoes.fecharHistorico}
      />

      {/* Modal de Arquivamento disfarçado de Remoção */}
      <ModalArquivamentoMaterial
        aberto={estado.modalExclusaoAberto}
        material={estado.materialParaExcluir}
        aoFechar={acoes.fecharExcluir}
        aoConfirmar={acoes.confirmarArquivamento}
      />

      {/* Modal de Reposição de Estoque */}
      <ModalReposicaoEstoque
        aberto={estado.modalReposicaoAberto}
        material={estado.materialParaRepor}
        aoFechar={acoes.fecharRepor}
        aoConfirmar={acoes.confirmarReposicaoMaterial}
      />
    </>
  );
}
