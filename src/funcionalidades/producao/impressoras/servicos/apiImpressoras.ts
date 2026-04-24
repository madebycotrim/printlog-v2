import { Impressora } from "../tipos";

/**
 * Serviço de comunicação com a API de Impressoras do Cloudflare D1.
 */
export const apiImpressoras = {
    buscarTodas: async (usuarioId: string): Promise<Impressora[]> => {
        const resposta = await fetch("/api/impressoras", {
            headers: { "x-usuario-id": usuarioId }
        });
        if (!resposta.ok) throw new Error("Erro ao carregar impressoras do banco.");
        const dados = await resposta.json();
        
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

    salvar: async (dados: Partial<Impressora>, usuarioId: string): Promise<Impressora> => {
        const metodo = dados.id ? "PATCH" : "POST";
        
        // Converte camelCase para snake_case para o D1
        const payload = {
            ...dados,
            modelo_base: dados.modeloBase,
            imagem_url: dados.imagemUrl,
            taxa_hora_centavos: dados.taxaHoraCentavos,
            horimetro_total_minutos: dados.horimetroTotalMinutos,
            intervalo_revisao_minutos: dados.intervaloRevisaoMinutos,
            valor_compra_centavos: dados.valorCompraCentavos,
            potencia_watts: dados.potenciaWatts,
            data_aposentadoria: dados.dataAposentadoria
        };

        const resposta = await fetch("/api/impressoras", {
            method: metodo,
            headers: { 
                "Content-Type": "application/json",
                "x-usuario-id": usuarioId 
            },
            body: JSON.stringify(payload)
        });

        if (!resposta.ok) throw new Error("Erro ao salvar impressora no banco.");
        return resposta.json();
    },

    remover: async (id: string, usuarioId: string): Promise<void> => {
        const resposta = await fetch(`/api/impressoras?id=${id}`, {
            method: "DELETE",
            headers: { "x-usuario-id": usuarioId }
        });
        if (!resposta.ok) throw new Error("Erro ao remover impressora do banco.");
    }
};
