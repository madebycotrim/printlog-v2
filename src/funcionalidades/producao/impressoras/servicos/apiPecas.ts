import { PecaDesgaste } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { pecaDesgasteSchema } from "../esquemas";

/**
 * Serviço de comunicação com a API de Peças de Desgaste do Cloudflare D1.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiPecas = {
    buscarPorImpressora: async (_usuarioId: string, idImpressora: string): Promise<PecaDesgaste[]> => {
        const dados = await servicoBaseApi.get<any[]>(`/api/pecas-desgaste?idImpressora=${idImpressora}`);
        
        return dados.map((p: any) => ({
            ...p,
            idImpressora: p.id_impressora,
            vidaUtilMinutos: p.vida_util_minutos,
            horasUsoAtualMinutos: p.horas_uso_atual_minutos,
            dataUltimaTroca: p.data_ultima_troca
        }));
    },

    salvar: async (dados: Partial<PecaDesgaste>, _usuarioId: string): Promise<void> => {
        // Validação de segurança no cliente
        const dadosValidados = pecaDesgasteSchema.partial().parse(dados);
        const metodo = dados.id ? "PATCH" : "POST";

        await servicoBaseApi.requisicao("/api/pecas-desgaste", {
            method: metodo,
            body: JSON.stringify(dadosValidados)
        });
    },

    remover: async (id: string, _usuarioId: string): Promise<void> => {
        await servicoBaseApi.delete(`/api/pecas-desgaste?id=${id}`);
    }
};
