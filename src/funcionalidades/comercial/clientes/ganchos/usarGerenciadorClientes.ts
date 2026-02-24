import { usarArmazemClientes } from "../estado/armazemClientes";
import { Cliente } from "../tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { ErroValidacao, CodigoErro } from "@/compartilhado/utilitarios/excecoes";
import { useMemo } from "react";

/**
 * Hook de domínio para gerenciamento de clientes.
 * Encapsula lógica de CRUD e filtragem simples.
 */
export function usarGerenciadorClientes() {
    const estado = usarArmazemClientes();

    // 🔍 Lógica de Filtragem e Ordenação
    const clientesFiltrados = useMemo(() => {
        let resultado = [...estado.clientes];

        // Busca
        if (estado.filtroBusca) {
            const termo = estado.filtroBusca.toLowerCase();
            resultado = resultado.filter(
                (c) =>
                    c.nome.toLowerCase().includes(termo) ||
                    c.email.toLowerCase().includes(termo)
            );
        }

        // Ordenação
        resultado.sort((a, b) => {
            let comp = 0;
            if (estado.ordenacao === "NOME") comp = a.nome.localeCompare(b.nome);
            if (estado.ordenacao === "RECENTE") comp = b.dataCriacao.getTime() - a.dataCriacao.getTime();
            return estado.ordemInvertida ? -comp : comp;
        });

        return resultado;
    }, [estado.clientes, estado.filtroBusca, estado.ordenacao, estado.ordemInvertida]);

    // 🛠 Ações de CRUD (Simuladas - Persistência Real via D1 no futuro)
    const salvarCliente = async (dados: Partial<Cliente>) => {
        const rastreioId = crypto.randomUUID();

        try {
            if (!dados.nome) {
                throw new ErroValidacao("Dados obrigatórios ausentes", CodigoErro.LANCAMENTO_VALOR_INVALIDO);
            }

            registrar.info({ rastreioId, cliente: dados.nome }, "Salvando cliente");

            if (estado.clienteSendoEditado) {
                // Mock Update
                const atualizados = estado.clientes.map((c: Cliente) =>
                    c.id === estado.clienteSendoEditado?.id ? { ...c, ...dados, dataAtualizacao: new Date() } : c
                );
                estado.definirClientes(atualizados);
            } else {
                // Mock Create
                const novo: Cliente = {
                    id: crypto.randomUUID(),
                    nome: dados.nome!,
                    email: dados.email!,
                    telefone: dados.telefone!,
                    dataCriacao: new Date(),
                    dataAtualizacao: new Date(),
                    ltvCentavos: 0,
                    totalProdutos: 0,
                    fiel: false,
                };
                estado.definirClientes([...estado.clientes, novo]);
            }
            estado.fecharEditar();
        } catch (erro) {
            registrar.error({ rastreioId }, "Erro ao salvar cliente", erro);
            throw erro;
        }
    };

    const removerCliente = async (id: string) => {
        const rastreioId = crypto.randomUUID();
        try {
            registrar.info({ rastreioId, idCliente: id }, "Removendo cliente");
            const atualizados = estado.clientes.filter((c) => c.id !== id);
            estado.definirClientes(atualizados);
            estado.fecharRemover();
        } catch (erro) {
            registrar.error({ rastreioId }, "Erro ao remover cliente", erro);
            throw erro;
        }
    };

    return {
        estado: {
            ...estado,
            clientesFiltrados,
        },
        acoes: {
            pesquisar: estado.pesquisar,
            ordenarPor: estado.ordenarPor,
            inverterOrdem: estado.inverterOrdem,
            abrirEditar: estado.abrirEditar,
            fecharEditar: estado.fecharEditar,
            abrirRemover: estado.abrirRemover,
            fecharRemover: estado.fecharRemover,
            abrirHistorico: estado.abrirHistorico,
            fecharHistorico: estado.fecharHistorico,
            salvarCliente,
            removerCliente,
        }
    };
}
