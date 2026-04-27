import { Cliente } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { esquemaCliente } from "../esquemas";

/**
 * Serviço de comunicação com a API de Clientes do Cloudflare D1.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiClientes = {
    buscarTodos: async (_usuarioId: string): Promise<Cliente[]> => {
        const dados = await servicoBaseApi.get<any[]>("/api/clientes");
        
        // Mapeamento de snake_case para camelCase
        return dados.map((c: any) => ({
            ...c,
            statusComercial: c.status_comercial,
            observacoesCRM: c.observacoes_crm,
            dataCriacao: new Date(c.data_criacao),
            ltvCentavos: 0, // Pode ser calculado no futuro
            totalProdutos: 0
        }));
    },

    salvar: async (dados: Partial<Cliente>, _usuarioId: string): Promise<Cliente> => {
        // Validação de segurança no cliente
        const dadosValidados = esquemaCliente.partial().parse(dados);
        const metodo = dados.id ? "PATCH" : "POST";

        return servicoBaseApi.requisicao<Cliente>("/api/clientes", {
            method: metodo,
            body: JSON.stringify(dadosValidados)
        });
    },

    remover: async (id: string, _usuarioId: string): Promise<void> => {
        await servicoBaseApi.delete(`/api/clientes?id=${id}`);
    }
};
