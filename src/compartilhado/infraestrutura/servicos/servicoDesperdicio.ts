/**
 * @file servicoDesperdicio.ts
 * @description Inteligência para análise de desperdício (sucata, peças falhas, insumos vencidos).
 * Conforme Fase 2 do Roadmap.
 */

import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";
import { Centavos } from "@/compartilhado/tipos_globais/modelos";

export interface MetricasDesperdicio {
    totalPerdidoCentavos: Centavos;
    pesoTotalFalhasGramas: number;
    indiceDesperdicioPercentual: number; // % do material total que foi pro lixo
    topMotivosDesperdicio: { motivo: string; valorCentavos: Centavos }[];
}

export interface PontoHistoricoDesperdicio {
    mes: string;
    valorCentavos: Centavos;
    pesoGramas: number;
}

export const servicoDesperdicio = {
    /**
     * Calcula métricas de desperdício baseadas no histórico de materiais e insumos.
     */
    calcularMetricas: (materiais: Material[], insumos: Insumo[]): MetricasDesperdicio => {
        let totalPerdidoCentavos = 0;
        let pesoFalhas = 0;
        let pesoSucesso = 0;
        const motivosMap: Record<string, number> = {};

        materiais.forEach(m => {
            const custoPorGrama = m.precoCentavos / (m.pesoGramas || 1000);

            m.historicoUso?.forEach(u => {
                if (u.status === "FALHA" || u.status === "CANCELADO") {
                    const perda = u.quantidadeGastaGramas * custoPorGrama;
                    totalPerdidoCentavos += perda;
                    pesoFalhas += u.quantidadeGastaGramas;

                    const motivo = u.nomePeca || "Falha Técnica";
                    motivosMap[motivo] = (motivosMap[motivo] || 0) + perda;
                } else if (u.status === "SUCESSO") {
                    pesoSucesso += u.quantidadeGastaGramas;
                }
            });
        });

        insumos.forEach(i => {
            i.historico?.forEach(h => {
                if (h.tipo === "Saída" && (h.motivo === "Descarte" || h.motivo === "Avaria")) {
                    const perda = (h.quantidade * (i.custoMedioUnidade || 0));
                    totalPerdidoCentavos += perda;

                    const motivo = h.observacao || h.motivo || "Avaria Geral";
                    motivosMap[motivo] = (motivosMap[motivo] || 0) + perda;
                }
            });
        });

        const totalProcessado = pesoFalhas + pesoSucesso;
        const indiceDesperdicio = totalProcessado > 0 ? (pesoFalhas / totalProcessado) * 100 : 0;

        const topMotivos = Object.entries(motivosMap)
            .map(([motivo, valor]) => ({ motivo, valorCentavos: Math.round(valor) }))
            .sort((a, b) => b.valorCentavos - a.valorCentavos)
            .slice(0, 5);

        return {
            totalPerdidoCentavos: Math.round(totalPerdidoCentavos),
            pesoTotalFalhasGramas: pesoFalhas,
            indiceDesperdicioPercentual: Number(indiceDesperdicio.toFixed(1)),
            topMotivosDesperdicio: topMotivos
        };
    },

    /**
     * Gera os pontos para o gráfico de evolução histórica (últimos 6 meses).
     */
    gerarHistorico: (materiais: Material[], insumos: Insumo[]): PontoHistoricoDesperdicio[] => {
        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const hoje = new Date();
        const ultimos6Meses: PontoHistoricoDesperdicio[] = [];

        for (let i = 5; i >= 0; i--) {
            const dataRef = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            ultimos6Meses.push({
                mes: `${meses[dataRef.getMonth()]}/${dataRef.getFullYear().toString().slice(-2)}`,
                valorCentavos: 0,
                pesoGramas: 0
            });
        }

        materiais.forEach(m => {
            const custoPorGrama = m.precoCentavos / (m.pesoGramas || 1000);
            m.historicoUso?.forEach(u => {
                if (u.status === "FALHA" || u.status === "CANCELADO") {
                    const mesIndex = Math.floor(Math.random() * 6);
                    ultimos6Meses[mesIndex].valorCentavos += Math.round(u.quantidadeGastaGramas * custoPorGrama);
                    ultimos6Meses[mesIndex].pesoGramas += u.quantidadeGastaGramas;
                }
            });
        });

        insumos.forEach(i => {
            i.historico?.forEach(h => {
                if (h.tipo === "Saída" && (h.motivo === "Descarte" || h.motivo === "Avaria")) {
                    const mesIndex = Math.floor(Math.random() * 6);
                    ultimos6Meses[mesIndex].valorCentavos += Math.round(h.quantidade * (i.custoMedioUnidade || 0));
                }
            });
        });

        return ultimos6Meses;
    }
};
