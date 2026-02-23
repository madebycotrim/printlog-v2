/**
 * Formata um valor numérico para o padrão de moeda BRL (R$ 0,00)
 * @param valor - String de dígitos
 * @returns String formatada em R$
 */
export function formatarMoedaBr(valor: string): string {
    const apenasDigitos = valor.replace(/\D/g, "");
    const valorNumerico = Number(apenasDigitos) / 100;

    return valorNumerico.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

/**
 * Formata um valor numérico para porcentagem (00,00%)
 * @param valor - String de dígitos
 * @returns String formatada com %
 */
export function formatarPorcentagem(valor: string): string {
    const apenasDigitos = valor.replace(/\D/g, "");
    if (!apenasDigitos) return "0,00%";

    const valorNumerico = Number(apenasDigitos) / 100;
    return valorNumerico.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) + "%";
}

/**
 * Remove formatação e retorna apenas os dígitos como string
 */
export function extrairApenasDigitos(valor: string): string {
    return valor.replace(/\D/g, "");
}
