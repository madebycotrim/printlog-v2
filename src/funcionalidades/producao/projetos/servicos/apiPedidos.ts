import { Pedido } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { criarPedidoSchema, atualizarPedidoSchema, CriarPedidoInput, AtualizarPedidoInput } from "../schemas";

/**
 * Serviço de comunicação com a API de Pedidos do Cloudflare.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiPedidos = {
    /**
     * Busca todos os pedidos do usuário no D1.
     * O backend deve extrair o ID do usuário do Token de Autenticação.
     */
    buscarTodos: async (_usuarioId: string): Promise<Pedido[]> => {
        // Nota: O usuarioId não é mais enviado via header customizado inseguro.
        // O servicoBaseApi injeta o Bearer Token que contém o ID validado.
        return servicoBaseApi.get<Pedido[]>("/api/pedidos");
    },

    /**
     * Salva um novo pedido no D1 com validação de esquema.
     */
    criar: async (dados: CriarPedidoInput, _usuarioId: string): Promise<string> => {
        // Validação de segurança no cliente
        const dadosValidados = criarPedidoSchema.parse(dados);
        
        const resultado = await servicoBaseApi.post<{ id: string }>("/api/pedidos", dadosValidados);
        return resultado.id;
    },

    /**
     * Atualiza um pedido existente com validação de esquema.
     */
    atualizar: async (dados: AtualizarPedidoInput, _usuarioId: string): Promise<void> => {
        // Validação de segurança no cliente
        const dadosValidados = atualizarPedidoSchema.parse(dados);
        
        await servicoBaseApi.requisicao("/api/pedidos", {
            method: "PATCH",
            body: JSON.stringify(dadosValidados)
        });
    },

    /**
     * Exclui um pedido do banco de forma segura.
     */
    excluir: async (id: string, _usuarioId: string): Promise<void> => {
        await servicoBaseApi.delete(`/api/pedidos?id=${id}`);
    }
};
