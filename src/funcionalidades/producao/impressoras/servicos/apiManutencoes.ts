import { RegistroManutencao } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { registroManutencaoSchema } from "../esquemas";

/**
 * Serviço de comunicação com a API de Manutenções do Cloudflare D1.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiManutencoes = {
    buscarPorImpressora: async (_usuarioId: string, idImpressora: string): Promise<RegistroManutencao[]> => {
        const dados = await servicoBaseApi.get<any[]>(`/api/manutencoes?idImpressora=${idImpressora}`);
        
        return dados.map((m: any) => ({
            ...m,
            custoCentavos: m.custo_centavos,
            idImpressora: m.id_impressora,
            tempoParadaMinutos: m.tempo_parada_minutos,
            pecasTrocadas: m.pecas_trocadas,
            responsavel: m.responsavel,
            horasMaquinaNoMomentoMinutos: m.horas_maquina_atualmente
        }));
    },

    salvar: async (dados: Partial<RegistroManutencao>, _usuarioId: string): Promise<void> => {
        // Validação de segurança no cliente
        const dadosValidados = registroManutencaoSchema.partial().parse(dados);

        await servicoBaseApi.post("/api/manutencoes", dadosValidados);
    },

    remover: async (id: string, _usuarioId: string): Promise<void> => {
        await servicoBaseApi.delete(`/api/manutencoes?id=${id}`);
    }
};
