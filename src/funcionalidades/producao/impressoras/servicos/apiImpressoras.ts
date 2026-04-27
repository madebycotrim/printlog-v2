import { Impressora } from "../tipos";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";
import { impressoraSchema } from "../esquemas";

/**
 * Serviço de comunicação com a API de Impressoras do Cloudflare D1.
 * Refatorado para usar o servicoBaseApi com autenticação segura via Token e validação Zod.
 */
export const apiImpressoras = {
    buscarTodas: async (_usuarioId: string): Promise<Impressora[]> => {
        const dados = await servicoBaseApi.get<any[]>("/api/impressoras");
        
        return dados.map((i: any) => ({
            ...i,
            marca: i.marca,
            modeloBase: i.modelo_base,
            imagemUrl: i.imagem_url,
            taxaHoraCentavos: i.taxa_hora_centavos,
            horimetroTotalMinutos: i.horimetro_total_minutos,
            intervaloRevisaoMinutos: i.intervalo_revisao_minutos,
            valorCompraCentavos: i.valor_compra_centavos,
            potenciaWatts: i.potencia_watts,
            dataAposentadoria: i.data_aposentadoria,
            dataCriacao: i.data_criacao ? new Date(i.data_criacao) : new Date(),
            dataAtualizacao: new Date()
        }));
    },

    salvar: async (dados: Partial<Impressora>, _usuarioId: string): Promise<Impressora> => {
        const metodo = dados.id ? "PATCH" : "POST";
        
        // Validação de segurança no cliente
        const dadosValidados = impressoraSchema.partial().parse(dados);

        // Converte camelCase para snake_case para o D1
        const payload = {
            ...dadosValidados,
            modelo_base: dados.modeloBase,
            imagem_url: dados.imagemUrl,
            taxa_hora_centavos: dados.taxaHoraCentavos,
            horimetro_total_minutos: dados.horimetroTotalMinutos,
            intervalo_revisao_minutos: dados.intervaloRevisaoMinutos,
            valor_compra_centavos: dados.valorCompraCentavos,
            potencia_watts: dados.potenciaWatts,
            data_aposentadoria: dados.dataAposentadoria
        };

        return servicoBaseApi.requisicao<Impressora>("/api/impressoras", {
            method: metodo,
            body: JSON.stringify(payload)
        });
    },

    remover: async (id: string, _usuarioId: string): Promise<void> => {
        await servicoBaseApi.delete(`/api/impressoras?id=${id}`);
    }
};
