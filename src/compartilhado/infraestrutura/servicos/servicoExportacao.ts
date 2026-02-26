/**
 * @file servicoExportacao.ts
 * @description Utilitário para exportação de dados do sistema (CSV, Texto, JSON).
 * Conformidade com LGPD (Portabilidade) e utilidade operacional.
 */

import { registrar } from "@/compartilhado/utilitarios/registrador";

export const servicoExportacao = {
    /**
     * Exporta dados para formato CSV e dispara o download.
     */
    exportarCSV: (dados: any[], colunas: { chave: string; rotulo: string }[], nomeArquivo: string) => {
        const rastreioId = crypto.randomUUID();
        try {
            const cabecalho = colunas.map(c => c.rotulo).join(";");
            const linhas = dados.map(item =>
                colunas.map(c => {
                    const valor = item[c.chave];
                    return typeof valor === 'string' ? `"${valor}"` : valor;
                }).join(";")
            );

            const conteudo = [cabecalho, ...linhas].join("\n");
            const blob = new Blob(["\ufeff" + conteudo], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `${nomeArquivo}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            registrar.info({ rastreioId, servico: "Exportação" }, `Exportação CSV concluída: ${nomeArquivo}`);
        } catch (erro) {
            registrar.error({ rastreioId, servico: "Exportação" }, "Erro ao gerar CSV", erro);
        }
    },

    /**
     * Copia um texto formatado para a área de transferência (ex: para WhatsApp).
     */
    copiarParaAreaTransferencia: async (texto: string): Promise<boolean> => {
        try {
            await navigator.clipboard.writeText(texto);
            return true;
        } catch (erro) {
            return false;
        }
    }
};
