import { motion, AnimatePresence } from "framer-motion";
import { Plus, PackageSearch } from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";
import { EstadoVazio } from "@/compartilhado/componentes/EstadoVazio";
import { usarGerenciadorMateriais } from "./hooks/usarGerenciadorMateriais";
import { Material } from "./tipos";
import { FormularioMaterial } from "./componentes/FormularioMaterial";
import { ResumoEstoque } from "./componentes/ResumoEstoque";
import { FiltrosMaterial } from "./componentes/FiltrosMaterial";
import { ListaMateriais } from "./componentes/ListaMateriais";
import { ModalHistoricoUso } from "./componentes/ModalHistoricoUso";
import { ModalArquivamentoMaterial } from "./componentes/ModalArquivamentoMaterial";
import { ModalReposicaoEstoque } from "./componentes/ModalReposicaoEstoque";

export function PaginaMateriais() {
  const { estado, acoes } = usarGerenciadorMateriais();

  usarDefinirCabecalho({
    titulo: "Estoque de Insumos",
    subtitulo: "Gestão inteligente de filamentos, resinas e patrimônio técnico",
    placeholderBusca: "Buscar fabricante, cor ou tipo de material...",
    aoBuscar: acoes.definirTermoBusca,
    acao: {
      texto: "Novo Material",
      icone: Plus,
      aoClicar: () => acoes.abrirEditar(null as unknown as Material),
    },
  });

  return (
    <div className="space-y-10 min-h-[60vh] flex flex-col">
      <AnimatePresence mode="wait">
        {estado.carregando && estado.materiais.length === 0 ? (
          <motion.div
            key="carregando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-40"
          >
            <Carregamento tipo="ponto" mensagem="Sincronizando materiais e filamentos..." />
          </motion.div>
        ) : estado.materiais.length === 0 ? (
          <motion.div
            key="vazio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <EstadoVazio
              titulo="Nenhum material encontrado"
              descricao="Adicione o seu primeiro material para gerenciar o seu estoque de matéria prima."
              icone={PackageSearch}
              textoBotao="Cadastrar Material"
              aoClicarBotao={() => acoes.abrirEditar(null as unknown as Material)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="conteudo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <ResumoEstoque
              materiais={estado.materiais}
              totalEmbalagens={estado.metricas.totalEmbalagens}
              valorInvestido={estado.metricas.valorInvestido}
              alertasBaixoEstoque={estado.metricas.alertasBaixoEstoque}
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

            <ListaMateriais 
              materiais={estado.materiaisFiltradosOrdenados}
              agrupadosPorTipo={estado.agrupadosPorTipoMaterial}
              aoEditar={acoes.abrirEditar}
              aoHistorico={(m, aba) => acoes.abrirHistorico(m.id, aba)}
              aoExcluir={(m) => acoes.abrirExcluir(m.id)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Cadastro/Edição */}
      <FormularioMaterial
        aberto={estado.modalAberto}
        aoSalvar={acoes.salvarMaterial}
        aoCancelar={acoes.fecharEditar}
        materialEditando={estado.materialSendoEditado}
      />

      {/* Modal Unificado de Uso e Histórico (Fase 4) */}
      {estado.modalHistoricoAberto && estado.materialParaHistorico && (
        <ModalHistoricoUso
          aberto={estado.modalHistoricoAberto}
          material={estado.materialParaHistorico}
          aoFechar={acoes.fecharHistorico}
        />
      )}

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
    </div>
  );
}
