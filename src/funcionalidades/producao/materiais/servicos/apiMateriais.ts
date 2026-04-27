import { Material } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { materialSchema, registroUsoSchema } from "../schemas";

/**
 * Serviço de integração com o Cloudflare D1 via Pages Functions.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiMateriais = {
  /**
   * Busca todos os materiais do usuário e mapeia para camelCase
   */
  async listar(_usuarioId: string): Promise<Material[]> {
    const dadosInternos = await servicoBaseApi.get<any[]>("/api/materiais");

    return dadosInternos.map((m: any) => ({
      id: m.id,
      tipo: m.tipo,
      nome: m.nome,
      tipoMaterial: m.tipo_material,
      fabricante: m.fabricante,
      cor: m.cor,
      precoCentavos: m.preco_centavos,
      pesoGramas: m.peso_gramas,
      estoque: m.estoque_unidades,
      pesoRestanteGramas: m.peso_restante_gramas,
      arquivado: m.arquivado === 1,
      historicoUso: (m.historicoUso || []).map((h: any) => ({
        id: h.id,
        data: h.data,
        nomePeca: h.nome_peca,
        quantidadeGastaGramas: h.quantidade_gasta_gramas,
        tempoImpressaoMinutos: h.tempo_impressao_minutos,
        status: h.status
      }))
    }));
  },

  /**
   * Salva um novo material ou atualiza um existente com validação de segurança
   */
  async salvar(material: Material, _usuarioId: string): Promise<void> {
    // Validação de segurança no cliente
    const dadosValidados = materialSchema.parse(material);

    // Mapeamento inverso para o banco
    const payload = {
      ...dadosValidados,
      tipo_material: material.tipoMaterial,
      preco_centavos: material.precoCentavos,
      peso_gramas: material.pesoGramas,
      estoque_unidades: material.estoque,
      peso_restante_gramas: material.pesoRestanteGramas
    };

    await servicoBaseApi.post("/api/materiais", payload);
  },

  /**
   * Atualiza peso ou estoque de um material com validação de segurança
   */
  async atualizar(material: Partial<Material> & { id: string }, _usuarioId: string, registroUso?: any): Promise<void> {
    const materialValidado = materialSchema.partial().parse(material);
    const payload: any = { ...materialValidado };
    
    // Se houver registro de uso, valida e mapeia
    if (registroUso) {
      const registroValidado = registroUsoSchema.parse(registroUso);
      payload.registroUso = {
        data: registroValidado.data,
        nomePeca: registroValidado.nomePeca,
        quantidadeGastaGramas: registroValidado.quantidadeGastaGramas,
        status: registroValidado.status
      };
    }

    await servicoBaseApi.requisicao("/api/materiais", {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  /**
   * Remove um material (arquivamento) de forma segura
   */
  async remover(id: string, _usuarioId: string): Promise<void> {
    await servicoBaseApi.delete(`/api/materiais?id=${id}`);
  }
};
