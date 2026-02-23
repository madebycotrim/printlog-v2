import { Box, Plus, Search } from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarGerenciadorInsumos } from "./ganchos/usarGerenciadorInsumos";
import { ResumoInsumos } from "./componentes/ResumoInsumos";
import { ItemInsumo } from "./componentes/CardInsumo";
import { FormularioInsumo } from "./componentes/FormularioInsumo";
import { ModalBaixaInsumo } from "./componentes/ModalBaixaInsumo";
import { ModalReposicaoInsumo } from "./componentes/ModalReposicaoInsumo";
import { ModalArquivamentoInsumo } from "./componentes/ModalArquivamentoInsumo";
import { ModalHistoricoInsumo } from "./componentes/ModalHistoricoInsumo";
import { FiltrosInsumo } from "./componentes/FiltrosInsumo";

export function PaginaInsumos() {
  const { state, actions } = usarGerenciadorInsumos();

  usarDefinirCabecalho({
    titulo: "Meus Insumos",
    subtitulo: "Gerencie peças e outros materiais logísticos",
    placeholderBusca: "Buscar insumo (Ex: Álcool Isopropílico)...",
    acao: {
      texto: "Novo Insumo",
      icone: Plus,
      aoClicar: () => actions.abrirEditar(),
    },
    aoBuscar: actions.definirFiltroPesquisa,
  });

  return (
    <>
      {state.insumos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center mt-4 h-[60vh]">
          <div className="text-gray-300 dark:text-zinc-700 mb-6">
            <Box size={48} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Nenhum insumo encontrado
          </h3>
          <p className="text-gray-500 dark:text-zinc-400 max-w-sm mx-auto mb-8 text-sm">
            Adicione o seu primeiro insumo para gerenciar o seu estoque de apoio logístico.
          </p>
          <button
            onClick={() => actions.abrirEditar()}
            className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold py-2.5 px-6 rounded-full shadow-sm transition-transform active:scale-95"
          >
            Cadastrar Insumo
          </button>
        </div>
      ) : (
        <div className=" ">
          <ResumoInsumos
            insumos={state.insumos}
            totalItensUnicos={state.kpis.totalItens}
            valorInvestido={state.kpis.valorInvestido}
            alertasBaixoEstoque={state.kpis.alertasBaixoEstoque}
          />

          <div className="mt-8">
            <FiltrosInsumo
              filtroAtual={state.filtroCategoria}
              aoFiltrar={actions.definirFiltroCategoria}
              ordenacaoAtual={state.ordenacao}
              aoOrdenar={actions.definirOrdenacao}
              ordemInvertida={state.ordemInvertida}
              aoInverterOrdem={actions.inverterOrdem}
            />
          </div>

          {state.agrupadosPorCategoria.length === 0 && state.insumos.length > 0 ? (
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
              {state.agrupadosPorCategoria.map(([categoria, lista]) => (
                <div key={categoria} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {categoria}
                      </h3>
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#27272a] border border-gray-200 dark:border-zinc-700/50 text-[10px] font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-widest flex items-center h-6 leading-none shadow-sm">
                        {lista.length} INSUMO{lista.length !== 1 ? "S" : ""}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/5" />
                  </div>

                  <div className="flex flex-col bg-white dark:bg-[#18181b] rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden">
                    {lista.map((ins, index) => (
                      <ItemInsumo
                        key={ins.id}
                        insumo={ins}
                        ultimo={index === lista.length - 1}
                        aoEditar={actions.abrirEditar}
                        aoBaixar={actions.abrirBaixa}
                        aoExcluir={actions.abrirArquivamento}
                        aoRepor={actions.abrirReposicao}
                        aoVerHistorico={actions.abrirHistorico}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAIS DE APOIO */}
      <FormularioInsumo
        aberto={state.modalCricaoAberto}
        insumoEditando={state.insumoEditando}
        aoCancelar={actions.fecharEditar}
        aoSalvar={actions.salvarInsumo}
      />

      <ModalBaixaInsumo
        aberto={state.modalBaixaAberto}
        insumo={state.insumoBaixa}
        aoFechar={actions.fecharBaixa}
        aoConfirmar={actions.confirmarBaixaInsumo}
      />

      <ModalReposicaoInsumo
        aberto={state.modalReposicaoAberto}
        insumo={state.insumoReposicao}
        aoFechar={actions.fecharReposicao}
        aoConfirmar={actions.confirmarReposicaoInsumo}
      />

      <ModalArquivamentoInsumo
        aberto={state.modalArquivamentoAberto}
        insumo={state.insumoArquivamento}
        aoFechar={actions.fecharArquivamento}
        aoConfirmar={actions.confirmarArquivamento}
      />

      <ModalHistoricoInsumo
        aberto={state.modalHistoricoAberto}
        aoFechar={actions.fecharHistorico}
        insumo={state.insumoHistorico}
      />
    </>
  );
}
