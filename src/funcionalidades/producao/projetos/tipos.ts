import { Centavos, StatusPedido } from "@/compartilhado/tipos_globais/modelos";

export interface Pedido {
    id: string;
    idUsuario: string;
    idCliente: string;
    nomeCliente?: string;
    descricao: string;
    status: StatusPedido;
    valorCentavos: Centavos;
    dataCriacao: Date;
    dataConclusao?: Date;
    prazoEntrega?: Date;
    observacoes?: string;
    material?: string;
    pesoGramas?: number;
    tempoMinutos?: number;
}

export interface CriarPedidoInput {
    idCliente: string;
    descricao: string;
    valorCentavos: Centavos;
    prazoEntrega?: Date;
    observacoes?: string;
    material?: string;
    pesoGramas?: number;
    tempoMinutos?: number;
}

export interface AtualizarPedidoInput extends Partial<CriarPedidoInput> {
    id: string;
    status?: StatusPedido;
}
