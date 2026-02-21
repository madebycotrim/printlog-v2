import { useState, useMemo } from "react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { FormularioMaterial } from "./componentes/FormularioMaterial";
import { ResumoEstoque } from "./componentes/ResumoEstoque";
import {
  FiltrosMaterial,
  FiltroTipoMaterial,
  OrdenacaoMaterial,
} from "./componentes/FiltrosMaterial";
import { CardMaterial } from "./componentes/CardMaterial";
import { Material, RegistroUso } from "./tipos";
import { Plus, PackageSearch } from "lucide-react";
import { ModalAbatimentoPeso } from "./componentes/ModalAbatimentoPeso";
import { ModalHistoricoConsumo } from "./componentes/ModalHistoricoConsumo";
import { ModalArquivamentoMaterial } from "./componentes/ModalArquivamentoMaterial";
import { ModalReposicaoEstoque } from "./componentes/ModalReposicaoEstoque";

export function PaginaMateriais() {
  const [materiais, definirMateriais] = useState<Material[]>([]);

  // Estados dos Modais
  const [modalAberto, definirModalAberto] = useState(false); // Modal Cadastro/Edição
  const [modalAbatimentoAberto, definirModalAbatimentoAberto] = useState(false);
  const [modalHistoricoAberto, definirModalHistoricoAberto] = useState(false);
  const [modalExclusaoAberto, definirModalExclusaoAberto] = useState(false);
  const [modalReposicaoAberto, definirModalReposicaoAberto] = useState(false);

  // Estados de Material Selecionado (Ação)
  const [materialSendoEditado, definirMaterialSendoEditado] =
    useState<Material | null>(null);
  const [materialParaAbater, definirMaterialParaAbater] =
    useState<Material | null>(null);
  const [materialParaHistorico, definirMaterialParaHistorico] =
    useState<Material | null>(null);
  const [materialParaExcluir, definirMaterialParaExcluir] =
    useState<Material | null>(null);
  const [materialParaRepor, definirMaterialParaRepor] =
    useState<Material | null>(null);

  // Estados de Filtro e Ordenação
  const [filtro, definirFiltro] = useState<FiltroTipoMaterial>("TODOS");
  const [ordenacao, definirOrdenacao] = useState<OrdenacaoMaterial>("NOME");
  const [ordemInvertida, definirOrdemInvertida] = useState(false);
  const [termoBusca, definirTermoBusca] = useState("");

  // Configuração do Cabeçalho Global
  usarDefinirCabecalho({
    titulo: "Meus Materiais",
    subtitulo: "Gerencie filamentos e resinas para cálculo preciso de custos.",
    placeholderBusca: "Buscar material (ex: PLA Preto)...",
    aoBuscar: definirTermoBusca,
    acao: {
      texto: "Novo Material",
      icone: Plus,
      aoClicar: () => {
        definirMaterialSendoEditado(null);
        definirModalAberto(true);
      },
    },
  });

  const salvarMaterial = (dadosDoFormulario: any) => {
    if (materialSendoEditado) {
      // Editando material existente
      definirMateriais((prev) =>
        prev.map((m) =>
          m.id === materialSendoEditado.id
            ? {
              ...m,
              ...dadosDoFormulario,
              id: m.id, // mantem id original
            }
            : m,
        ),
      );
    } else {
      // Novo material
      const m: Material = {
        ...dadosDoFormulario,
        pesoRestante: dadosDoFormulario.peso, // Começa cheio
        // Tratamento: se o form enviou 3 unidades, 1 está em uso (pesoRestante) e 2 no estoque (lacrados)
        estoque:
          dadosDoFormulario.estoque > 1 ? dadosDoFormulario.estoque - 1 : 0,
        historicoUso: [],
      };
      definirMateriais((prev) => [m, ...prev]);
    }

    fecharModal();
  };

  const fecharModal = () => {
    definirMaterialSendoEditado(null);
    definirModalAberto(false);
  };

  // Ações para o Card
  const lidarComEditar = (mat: Material) => {
    definirMaterialSendoEditado(mat);
    definirModalAberto(true);
  };

  const lidarComAbater = (id: string) => {
    const mat = materiais.find((m) => m.id === id);
    if (mat) {
      definirMaterialParaAbater(mat);
      definirModalAbatimentoAberto(true);
    }
  };

  const lidarComHistorico = (id: string) => {
    const mat = materiais.find((m) => m.id === id);
    if (mat) {
      definirMaterialParaHistorico(mat);
      definirModalHistoricoAberto(true);
    }
  };

  const confirmarAbatimentoPeso = (qtdAbatida: number, motivo: string) => {
    if (!materialParaAbater) return;

    definirMateriais((prev) =>
      prev.map((m) => {
        if (m.id !== materialParaAbater.id) return m;

        let qtdFaltando = qtdAbatida;
        let novoPesoRestante = m.pesoRestante;
        let novoEstoque = m.estoque;

        // Abate do rolo atual
        if (qtdFaltando <= novoPesoRestante) {
          novoPesoRestante -= qtdFaltando;
        } else {
          // Esgotou o rolo atual. Desconta o restante dos próximos rolos lacrados do estoque
          qtdFaltando -= novoPesoRestante;
          novoPesoRestante = 0;

          while (qtdFaltando > 0 && novoEstoque > 0) {
            novoEstoque--; // Abre um rolo novo
            if (qtdFaltando <= m.peso) {
              novoPesoRestante = m.peso - qtdFaltando;
              qtdFaltando = 0;
            } else {
              qtdFaltando -= m.peso;
            }
          }
        }

        const hoje = new Date();
        const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }).format(hoje).replace(" de ", " ").replace(".,", ",");

        const novoRegistro: RegistroUso = {
          id: Date.now().toString(),
          data: dataFormatada,
          nomePeca: motivo || "Abatimento Manual",
          quantidadeGasta: qtdAbatida,
          status: "MANUAL",
        };

        return {
          ...m,
          pesoRestante: Number(novoPesoRestante.toFixed(2)),
          estoque: novoEstoque,
          historicoUso: [novoRegistro, ...(m.historicoUso || [])],
        };
      }),
    );

    definirModalAbatimentoAberto(false);
    definirMaterialParaAbater(null);
  };

  const lidarComExcluir = (id: string) => {
    const mat = materiais.find((m) => m.id === id);
    if (mat) {
      definirMaterialParaExcluir(mat);
      definirModalExclusaoAberto(true);
    }
  };

  const lidarComRepor = (id: string) => {
    const mat = materiais.find((m) => m.id === id);
    if (mat) {
      definirMaterialParaRepor(mat);
      definirModalReposicaoAberto(true);
    }
  };

  const confirmarArquivamentoMaterial = () => {
    if (materialParaExcluir) {
      definirMateriais((prev) => prev.map((m) => m.id === materialParaExcluir.id ? { ...m, arquivado: true } : m));
      definirModalExclusaoAberto(false);
      definirMaterialParaExcluir(null);
    }
  };

  const confirmarReposicaoMaterial = (quantidadeComprada: number, precoTotalNovaCompra: number) => {
    if (!materialParaRepor) return;

    definirMateriais((prev) => prev.map((m) => {
      if (m.id !== materialParaRepor.id) return m;

      const estoqueEmUsoFracao = m.pesoRestante / m.peso;
      const estoqueTotalAtualFract = m.estoque + estoqueEmUsoFracao;
      const valorTotalAtual = estoqueTotalAtualFract * m.preco;

      const novoEstoqueTotalFract = estoqueTotalAtualFract + quantidadeComprada;
      const novoValorTotal = valorTotalAtual + precoTotalNovaCompra;
      const novoPrecoMedioUnitario = novoEstoqueTotalFract > 0 ? novoValorTotal / novoEstoqueTotalFract : m.preco;

      const hoje = new Date();
      const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
      }).format(hoje).replace(" de ", " ").replace(".,", ",");

      const novoRegistro: RegistroUso = {
        id: Date.now().toString(),
        data: dataFormatada,
        nomePeca: `Reposição de Estoque (+${quantidadeComprada})`,
        quantidadeGasta: 0,
        status: "MANUAL",
      };

      return {
        ...m,
        estoque: m.estoque + quantidadeComprada,
        preco: Number(novoPrecoMedioUnitario.toFixed(2)),
        historicoUso: [novoRegistro, ...(m.historicoUso || [])],
      };
    }));

    definirModalReposicaoAberto(false);
    definirMaterialParaRepor(null);
  };

  // --- KPIs de Resumo ---
  const materiaisAtivos = materiais.filter(m => !m.arquivado);
  const totalEmbalagens = materiaisAtivos.reduce(
    (acc, mat) => acc + (mat.pesoRestante > 0 ? 1 : 0) + mat.estoque,
    0,
  ); // 1 (se em uso) + lacrados

  const valorInvestido = materiaisAtivos.reduce((acc, mat) => {
    const proporcaoUso = mat.pesoRestante / mat.peso;
    const valorEmUso = mat.preco * proporcaoUso;
    const valorLacrados = mat.preco * mat.estoque;
    return acc + valorEmUso + valorLacrados;
  }, 0);

  const alertasBaixoEstoque = materiaisAtivos.filter(
    (mat) => mat.pesoRestante / mat.peso < 0.2 && mat.estoque === 0,
  ).length;

  // --- Filtragem e Ordenação ---
  const materiaisFiltradosOrdenados = useMemo(() => {
    let filtrados = materiaisAtivos; // Só itera sobre os NÃO arquivados

    // 1. Busca por Texto (barra superior)
    if (termoBusca.trim() !== "") {
      const termo = termoBusca.toLowerCase();
      filtrados = filtrados.filter(
        (m) =>
          m.nome.toLowerCase().includes(termo) ||
          m.cor.toLowerCase().includes(termo) ||
          m.fabricante.toLowerCase().includes(termo) ||
          m.tipo.toLowerCase().includes(termo),
      );
    }

    // 2. Filtro de Categoria (botões da esq.)
    if (filtro !== "TODOS") {
      filtrados = filtrados.filter((m) => m.tipo === filtro);
    }

    // 3. Ordenação (combo da dir.)
    return filtrados.sort((a, b) => {
      if (ordenacao === "NOME") {
        return a.nome.localeCompare(b.nome);
      }
      if (ordenacao === "MAIOR_PRECO") {
        return b.preco - a.preco;
      }
      if (ordenacao === "MENOR_ESTOQUE") {
        const percA = a.pesoRestante / a.peso + a.estoque; // Conta embalagens inteiras tbm
        const percB = b.pesoRestante / b.peso + b.estoque;
        return percA - percB;
      }
      return -1;
    });

    if (ordemInvertida) {
      filtrados.reverse();
    }

    return filtrados;
  }, [materiaisAtivos, filtro, ordenacao, termoBusca, ordemInvertida]);

  const agrupadosPorTipoMaterial = useMemo(() => {
    const grupos = {} as Record<string, Material[]>;
    materiaisFiltradosOrdenados.forEach((mat) => {
      const tipo = mat.tipoMaterial?.trim() || "Outros";
      if (!grupos[tipo]) {
        grupos[tipo] = [];
      }
      grupos[tipo].push(mat);
    });
    // Ordenar as sessões alfabeticamente pela chave (Nome do material)
    return Object.entries(grupos).sort((a, b) => a[0].localeCompare(b[0]));
  }, [materiaisFiltradosOrdenados]);

  return (
    <>
      <ResumoEstoque
        materiais={materiais}
        totalEmbalagens={totalEmbalagens}
        valorInvestido={valorInvestido}
        alertasBaixoEstoque={alertasBaixoEstoque}
      />

      <FiltrosMaterial
        filtroAtual={filtro}
        aoFiltrar={definirFiltro}
        ordenacaoAtual={ordenacao}
        aoOrdenar={definirOrdenacao}
        ordemInvertida={ordemInvertida}
        aoInverterOrdem={() => definirOrdemInvertida(!ordemInvertida)}
      />

      {/* Lista Vazia ou Grid de Cards */}
      {materiaisFiltradosOrdenados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center mt-4">
          <div className="text-gray-300 dark:text-zinc-700 mb-6">
            <PackageSearch size={48} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Nenhum material encontrado
          </h3>
          <p className="text-gray-500 dark:text-zinc-400 max-w-sm mx-auto mb-8 text-sm">
            Parece que você ainda não cadastrou materiais ou nenhum filtro bateu
            com sua busca.
          </p>
          {materiais.length === 0 && (
            <button
              onClick={() => {
                definirMaterialSendoEditado(null);
                definirModalAberto(true);
              }}
              className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold py-2.5 px-6 rounded-full shadow-sm transition-transform active:scale-95"
            >
              Cadastrar Material
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {agrupadosPorTipoMaterial.map(([tipo, lista]) => (
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

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {lista.map((mat) => (
                  <CardMaterial
                    key={mat.id}
                    material={mat}
                    aoEditar={lidarComEditar}
                    aoAbater={lidarComAbater}
                    aoHistorico={lidarComHistorico}
                    aoExcluir={lidarComExcluir}
                    aoRepor={lidarComRepor}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      <FormularioMaterial
        aberto={modalAberto}
        aoSalvar={salvarMaterial}
        aoCancelar={fecharModal}
        materialEditando={materialSendoEditado}
      />

      {/* Modal de Abatimento Manual de Peso/Volume */}
      <ModalAbatimentoPeso
        aberto={modalAbatimentoAberto}
        material={materialParaAbater}
        aoFechar={() => {
          definirModalAbatimentoAberto(false);
          definirMaterialParaAbater(null);
        }}
        aoConfirmar={confirmarAbatimentoPeso}
      />

      {/* Modal de Histórico de Consumo */}
      <ModalHistoricoConsumo
        aberto={modalHistoricoAberto}
        material={materialParaHistorico}
        aoFechar={() => {
          definirModalHistoricoAberto(false);
          definirMaterialParaHistorico(null);
        }}
      />

      {/* Modal de Arquivamento disfarçado de Remoção */}
      <ModalArquivamentoMaterial
        aberto={modalExclusaoAberto}
        material={materialParaExcluir}
        aoFechar={() => {
          definirModalExclusaoAberto(false);
          definirMaterialParaExcluir(null);
        }}
        aoConfirmar={confirmarArquivamentoMaterial}
      />

      {/* Modal de Reposição de Estoque */}
      <ModalReposicaoEstoque
        aberto={modalReposicaoAberto}
        material={materialParaRepor}
        aoFechar={() => {
          definirModalReposicaoAberto(false);
          definirMaterialParaRepor(null);
        }}
        aoConfirmar={confirmarReposicaoMaterial}
      />
    </>
  );
}
