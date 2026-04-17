import { Material } from "../tipos";

/**
 * Serviço de integração com o Cloudflare D1 via Pages Functions.
 * Responsável por persistir todos os dados de Materiais e Histórico.
 * Realiza o de-para entre o banco (snake_case) e a aplicação (camelCase).
 */
export const apiMateriais = {
  /**
   * Busca todos os materiais do usuário e mapeia para camelCase
   */
  async listar(usuarioId: string): Promise<Material[]> {
    const resposta = await fetch("/api/materiais", {
      headers: { "x-usuario-id": usuarioId }
    });
    if (!resposta.ok) throw new Error("Falha ao carregar materiais do servidor.");
    const dadosInternos = await resposta.json();

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
   * Salva um novo material ou atualiza um existente
   */
  async salvar(material: Material, usuarioId: string): Promise<void> {
    // Mapeamento inverso para o banco
    const payload = {
      ...material,
      tipoMaterial: material.tipoMaterial,
      precoCentavos: material.precoCentavos,
      pesoGramas: material.pesoGramas,
      estoque: material.estoque,
      pesoRestanteGramas: material.pesoRestanteGramas
    };

    const resposta = await fetch("/api/materiais", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-usuario-id": usuarioId 
      },
      body: JSON.stringify(payload)
    });
    if (!resposta.ok) throw new Error("Erro ao salvar material no banco de dados.");
  },

  /**
   * Atualiza peso ou estoque de um material
   */
  async atualizar(material: Partial<Material> & { id: string }, usuarioId: string, registroUso?: any): Promise<void> {
    const payload: any = { ...material };
    
    // Se houver registro de uso, mapeia para snake_case esperado pelo backend
    if (registroUso) {
      payload.registroUso = {
        data: registroUso.data,
        nomePeca: registroUso.nomePeca,
        quantidadeGastaGramas: registroUso.quantidadeGastaGramas,
        status: registroUso.status
      };
    }

    const resposta = await fetch("/api/materiais", {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "x-usuario-id": usuarioId 
      },
      body: JSON.stringify(payload)
    });
    if (!resposta.ok) throw new Error("Erro ao atualizar dados no banco de dados.");
  },

  /**
   * Remove um material (arquivamento)
   */
  async remover(id: string, usuarioId: string): Promise<void> {
    const resposta = await fetch(`/api/materiais?id=${id}`, {
      method: "DELETE",
      headers: { "x-usuario-id": usuarioId }
    });
    if (!resposta.ok) throw new Error("Erro ao remover material do banco.");
  }
};
