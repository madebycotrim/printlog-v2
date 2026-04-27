import { Insumo, RegistroMovimentacaoInsumo } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { insumoSchema, registroMovimentacaoInsumoSchema } from "../schemas";

/**
 * Serviço de integração com o Cloudflare D1 via Pages Functions.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiInsumos = {
  /**
   * Busca todos os insumos do usuário
   */
  async listar(_usuarioId: string): Promise<Insumo[]> {
    return servicoBaseApi.get<Insumo[]>("/api/insumos");
  },

  /**
   * Salva um novo insumo com validação de segurança
   */
  async salvar(insumo: Insumo, _usuarioId: string): Promise<void> {
    const dadosValidados = insumoSchema.parse(insumo);
    await servicoBaseApi.post("/api/insumos", dadosValidados);
  },

  /**
   * Atualiza estoque/custo e registra movimentação com validação de segurança
   */
  async atualizar(insumo: Partial<Insumo> & { id: string }, _usuarioId: string, movimentacao?: RegistroMovimentacaoInsumo): Promise<void> {
    const insumoValidado = insumoSchema.partial().parse(insumo);
    const movValidada = movimentacao ? registroMovimentacaoInsumoSchema.parse(movimentacao) : undefined;

    await servicoBaseApi.requisicao("/api/insumos", {
      method: "PATCH",
      body: JSON.stringify({ ...insumoValidado, movimentacao: movValidada })
    });
  },

  /**
   * Remove um insumo do banco de dados de forma segura
   */
  async remover(id: string, _usuarioId: string): Promise<void> {
    await servicoBaseApi.delete(`/api/insumos?id=${id}`);
  }
};
