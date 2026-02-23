import { useMemo } from "react";
import { toast } from "react-hot-toast";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { Insumo, RegistroMovimentacaoInsumo, MotivoBaixaInsumo, CategoriaInsumo } from "@/funcionalidades/producao/insumos/tipos";

export function usarGerenciadorInsumos() {
    const store = usarArmazemInsumos();

    // -----------------------------------------------------------------------------------
    // 🧠 DERIVAÇÕES DE ESTADO (Listas e Filtragens)
    // -----------------------------------------------------------------------------------

    const insumosFiltradosOrdenados = useMemo(() => {
        let filtrados = store.insumos;

        // 1. Filtro Texto 
        if (store.filtroPesquisa) {
            const termo = store.filtroPesquisa.toLowerCase();
            filtrados = filtrados.filter((i) =>
                i.nome.toLowerCase().includes(termo) ||
                i.categoria.toLowerCase().includes(termo) ||
                i.marca?.toLowerCase().includes(termo)
            );
        }

        // 2. Filtro Categoria
        if (store.filtroCategoria !== "Todas") {
            filtrados = filtrados.filter((i) => i.categoria === store.filtroCategoria);
        }

        // 3. Ordenação
        filtrados.sort((a, b) => {
            let comparacao = 0;
            switch (store.ordenacao) {
                case "nome":
                    comparacao = a.nome.localeCompare(b.nome);
                    break;
                case "quantidade":
                    comparacao = a.quantidadeAtual - b.quantidadeAtual;
                    break;
                case "custo":
                    comparacao = a.custoMedioUnidade - b.custoMedioUnidade;
                    break;
                case "atualizacao":
                    comparacao = new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime();
                    break;
            }
            return store.ordemInvertida ? -comparacao : comparacao;
        });

        return filtrados;
    }, [store.insumos, store.filtroPesquisa, store.filtroCategoria, store.ordenacao, store.ordemInvertida]);

    const agrupadosPorCategoria = useMemo(() => {
        const grupos = new Map<CategoriaInsumo, Insumo[]>();
        insumosFiltradosOrdenados.forEach((i) => {
            if (!grupos.has(i.categoria)) grupos.set(i.categoria, []);
            grupos.get(i.categoria)!.push(i);
        });

        // Retornar array ordenado alfabeticamente pela chave (categoria)
        return Array.from(grupos.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [insumosFiltradosOrdenados]);

    const kpis = useMemo(() => {
        let valorInvestido = 0;
        let alertasBaixoEstoque = 0;

        store.insumos.forEach((i) => {
            valorInvestido += (i.quantidadeAtual * i.custoMedioUnidade);
            if (i.quantidadeAtual <= i.quantidadeMinima) {
                alertasBaixoEstoque++;
            }
        });

        return {
            totalItens: store.insumos.length,
            valorInvestido,
            alertasBaixoEstoque
        };
    }, [store.insumos]);

    // -----------------------------------------------------------------------------------
    // 🧠 REGRAS DE NEGÓCIO E AÇÕES
    // -----------------------------------------------------------------------------------

    const salvarInsumo = async (dados: Partial<Insumo>) => {
        try {
            const eEdicao = Boolean(dados.id);
            const id = dados.id || crypto.randomUUID();
            const agora = new Date();

            const insumoCompleto: Insumo = {
                id,
                nome: dados.nome || "",
                descricao: dados.descricao || "",
                categoria: dados.categoria || "Outros",
                unidadeMedida: dados.unidadeMedida || "un",
                quantidadeAtual: dados.quantidadeAtual || 0,
                quantidadeMinima: dados.quantidadeMinima || 0,
                custoMedioUnidade: dados.custoMedioUnidade || 0,
                linkCompra: dados.linkCompra || "",
                marca: dados.marca || "",
                historico: dados.historico || (eEdicao ? [] : [{
                    id: crypto.randomUUID(),
                    data: agora.toISOString(),
                    tipo: "Entrada",
                    quantidade: dados.quantidadeAtual || 0,
                    valorTotal: (dados.quantidadeAtual || 0) * (dados.custoMedioUnidade || 0),
                    observacao: "Saldo Inicial de Cadastro"
                }]),
                dataCriacao: dados.dataCriacao || agora,
                dataAtualizacao: agora,
            };

            store.adicionarOuAtualizarInsumo(insumoCompleto);
            toast.success(eEdicao ? "Insumo atualizado." : "Novo insumo rastreado na base.");
            store.fecharEditar();
        } catch (erro) {
            console.error(erro);
            toast.error("Erro ao salvar o insumo.");
        }
    };

    const confirmarBaixaInsumo = async (idInsumo: string, quantidadeBaixada: number, motivo: MotivoBaixaInsumo, observacao?: string) => {
        try {
            const insumo = store.insumos.find((i) => i.id === idInsumo);
            if (!insumo) throw new Error("Insumo indisponível no estado.");

            if (quantidadeBaixada > insumo.quantidadeAtual) {
                toast.error("Você não pode abater mais do que possui em estoque!");
                return;
            }

            const novaMovimentacao: RegistroMovimentacaoInsumo = {
                id: crypto.randomUUID(),
                data: new Date().toISOString(),
                tipo: "Saída",
                quantidade: quantidadeBaixada,
                motivo,
                observacao
            };

            const insumoAtualizado: Insumo = {
                ...insumo,
                quantidadeAtual: insumo.quantidadeAtual - quantidadeBaixada,
                historico: [novaMovimentacao, ...insumo.historico],
                dataAtualizacao: new Date()
            };

            store.adicionarOuAtualizarInsumo(insumoAtualizado);
            toast.success(`${quantidadeBaixada}${insumo.unidadeMedida} subtraídos com sucesso.`);
            store.fecharBaixa();

            // Sugestão de Alerta Global:
            if (insumoAtualizado.quantidadeAtual <= insumoAtualizado.quantidadeMinima) {
                toast.error(`⚠️ ATENÇÃO: ${insumo.nome} atingiu nível crítico de estoque!`, { duration: 5000 });
            }

        } catch (e) {
            console.error(e);
            toast.error("Erro ao abater o estoque deste insumo.");
        }
    };

    const confirmarReposicaoInsumo = async (idInsumo: string, quantidadeAdicionada: number, novoCustoTotal: number, observacao?: string) => {
        try {
            const insumo = store.insumos.find((i) => i.id === idInsumo);
            if (!insumo) return;

            const qtdAntiga = insumo.quantidadeAtual;

            // Cálculo do novo custo médio ponderado
            const valorTotalAntigo = qtdAntiga * insumo.custoMedioUnidade;
            const novaQuantidadeAgregada = qtdAntiga + quantidadeAdicionada;
            const novoValorSoma = valorTotalAntigo + novoCustoTotal;
            const novoCustoMedio = novaQuantidadeAgregada > 0 ? (novoValorSoma / novaQuantidadeAgregada) : 0;

            const novaMovimentacao: RegistroMovimentacaoInsumo = {
                id: crypto.randomUUID(),
                data: new Date().toISOString(),
                tipo: "Entrada",
                quantidade: quantidadeAdicionada,
                valorTotal: novoCustoTotal,
                observacao
            };

            const insumoAtualizado: Insumo = {
                ...insumo,
                quantidadeAtual: novaQuantidadeAgregada,
                custoMedioUnidade: novoCustoMedio,
                historico: [novaMovimentacao, ...insumo.historico],
                dataAtualizacao: new Date()
            };

            store.adicionarOuAtualizarInsumo(insumoAtualizado);
            toast.success(`Estoque do insumo reabastecido!`);
            store.fecharReposicao();

        } catch (e) {
            console.error(e);
            toast.error("Falha ao registrar a entrada.");
        }
    };

    const confirmarArquivamento = async (idInsumo: string) => {
        try {
            // Em vez de marcar como arquivado (Soft Delete simples), a Store Insumos permite Remover o tracker real do localStorage.
            store.removerInsumo(idInsumo);
            toast.success("O card Insumo foi permanentemente removido.");
            store.fecharArquivamento();
        } catch (e) {
            toast.error("Erro ao deletar histórico.");
        }
    };

    return {
        state: {
            insumos: store.insumos,
            insumosFiltradosOrdenados,
            agrupadosPorCategoria,
            kpis,

            // UI Search/Order State
            filtroPesquisa: store.filtroPesquisa,
            filtroCategoria: store.filtroCategoria,
            ordenacao: store.ordenacao,
            ordemInvertida: store.ordemInvertida,

            // UI Modal States
            modalCricaoAberto: store.modalCricaoAberto,
            insumoEditando: store.insumoEditando,
            modalReposicaoAberto: store.modalReposicaoAberto,
            insumoReposicao: store.insumoReposicao,
            modalBaixaAberto: store.modalBaixaAberto,
            insumoBaixa: store.insumoBaixa,
            modalArquivamentoAberto: store.modalArquivamentoAberto,
            insumoArquivamento: store.insumoArquivamento,
            modalHistoricoAberto: store.modalHistoricoAberto,
            insumoHistorico: store.insumoHistorico,
        },
        actions: {
            definirFiltroPesquisa: store.definirFiltroPesquisa,
            definirFiltroCategoria: store.definirFiltroCategoria,
            definirOrdenacao: store.definirOrdenacao,
            inverterOrdem: store.inverterOrdem,

            salvarInsumo,
            confirmarBaixaInsumo,
            confirmarReposicaoInsumo,
            confirmarArquivamento,

            // Aberturas e Fecahmentos de Popup
            abrirEditar: store.abrirEditar,
            fecharEditar: store.fecharEditar,
            abrirBaixa: store.abrirBaixa,
            fecharBaixa: store.fecharBaixa,
            abrirReposicao: store.abrirReposicao,
            fecharReposicao: store.fecharReposicao,
            abrirArquivamento: store.abrirArquivamento,
            fecharArquivamento: store.fecharArquivamento,
            abrirHistorico: store.abrirHistorico,
            fecharHistorico: store.fecharHistorico
        }
    };
}
