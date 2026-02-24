import { Centavos, StatusPedido } from "@/compartilhado/tipos_globais/modelos";

/**
 * Registro individual de histórico para o cliente.
 */
export interface RegistroHistoricoCliente {
    id: string;
    data: Date;
    descricao: string;
    valorCentavos: Centavos;
    status: StatusPedido; // Usando enum canônico conforme Regra 4
}

/**
 * Interface canônica de Cliente conforme Regra 9 (LGPD) e Rule 2 (Nomenclatura).
 * 
 * @lgpd Base legal: Execução de contrato (Art. 7º, V) - Gerenciamento de pedidos e histórico.
 * @lgpd Finalidade: Identificação do cliente para prestação de serviços de impressão 3D.
 * @lgpd Retenção: 5 anos (obrigação fiscal/contábil).
 */
export interface Cliente {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    dataCriacao: Date;
    dataAtualizacao: Date;
    ltvCentavos: Centavos;
    totalProdutos: number;
    fiel: boolean;
    historico?: RegistroHistoricoCliente[];
}

/** Opções de ordenação para a listagem */
export type OrdenacaoCliente = "NOME" | "RECENTE";
