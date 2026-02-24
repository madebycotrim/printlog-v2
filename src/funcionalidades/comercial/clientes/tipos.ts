
import { Centavos } from "@/compartilhado/tipos_globais/modelos";

/**
 * Registro individual de histórico para o cliente.
 */
export interface RegistroHistoricoCliente {
    id: string;
    data: Date;
    descricao: string;
    valorCentavos: Centavos;
    status: "CONCLUIDO" | "EM_PRODUCAO" | "CANCELADO";
}

/**
 * Interface canônica de Cliente conforme Regra 9 (LGPD) e Rule 2 (Nomenclatura).
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
