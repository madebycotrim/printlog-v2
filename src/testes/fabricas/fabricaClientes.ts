import { Cliente, RegistroHistoricoCliente } from "@/funcionalidades/comercial/clientes/tipos";
import { StatusPedido } from "@/compartilhado/tipos_globais/modelos";

/**
 * Fabrica um objeto Cliente para testes.
 * @param override Valores para sobrescrever o padrão.
 */
export function fabricarCliente(override?: Partial<Cliente>): Cliente {
    return {
        id: crypto.randomUUID(),
        nome: "Cliente de Teste",
        email: "teste@printlog.com.br",
        telefone: "(11) 99999-9999",
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
        ltvCentavos: 1550, // R$ 15,50
        totalProdutos: 1,
        fiel: false,
        ...override,
    };
}

/**
 * Fabrica um registro de histórico para testes.
 */
export function fabricarRegistroHistorico(override?: Partial<RegistroHistoricoCliente>): RegistroHistoricoCliente {
    return {
        id: crypto.randomUUID(),
        data: new Date(),
        descricao: "Pedido de Teste",
        valorCentavos: 1000,
        status: StatusPedido.CONCLUIDO,
        ...override,
    };
}
