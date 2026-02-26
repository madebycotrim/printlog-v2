import { TipoLancamentoFinanceiro } from "@/compartilhado/tipos_globais/modelos";
import { LancamentoFinanceiro } from "@/funcionalidades/comercial/financeiro/tipos";

/**
 * Fábrica para criar lançamentos financeiros sintéticos para testes.
 * Valores monetários sempre em centavos.
 */
export function fabricarLancamentoFinanceiro(override: Partial<LancamentoFinanceiro> = {}): LancamentoFinanceiro {
    return {
        id: crypto.randomUUID(),
        tipo: TipoLancamentoFinanceiro.ENTRADA,
        valorCentavos: 5000, // R$ 50,00
        descricao: "Lançamento de Teste",
        dataCriacao: new Date(),
        idUsuario: "usuario-vendedor-teste",
        categoria: "Geral",
        ...override,
    };
}
