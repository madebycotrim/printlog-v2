import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";

export interface SugestaoPrecoIA {
  piso: { valor: number; justificativa: string };
  recomendado: { valor: number; justificativa: string };
  premium: { valor: number; justificativa: string };
  dica: string;
}

export interface EntradaIA {
  nomePeca: string;
  pesoGramas: number;
  tempoMinutos: number;
  custoMaterial: number;
  custoEnergia: number;
  custoTrabalho: number;
  custoDepreciacao: number;
  lucroDesejadoPercentual: number;
}

export const servicoIA = {
  /**
   * Solicita uma sugestão de precificação baseada em IA.
   * Consome o endpoint Cloudflare Workers AI.
   */
  obterSugestaoPreco: async (dados: EntradaIA): Promise<SugestaoPrecoIA> => {
    try {
      return await servicoBaseApi.post<SugestaoPrecoIA>("/api/ia-sugerir-preco", dados);
    } catch (erro) {
      console.error("Erro ao obter sugestão da IA:", erro);
      throw erro;
    }
  },
};
