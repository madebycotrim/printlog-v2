export type Identificador = string;

export type StatusImpressora = "LIVRE" | "IMPRIMINDO" | "MANUTENCAO";

export type StatusProjeto =
    | "A_FAZER"
    | "EM_PRODUCAO"
    | "ACABAMENTO"
    | "CONCLUIDO";

export type Filamento = {
    id: Identificador;
    material: string;
    marca: string;
    cor: string;
    peso_total: number;
    peso_restante: number;
    preco_kg: number;
};

export type Impressora = {
    id: Identificador;
    nome: string;
    modelo: string;
    status: StatusImpressora;
    horas_impressao: number;
};

export type Cliente = {
    id: Identificador;
    nome: string;
    telefone: string;
    endereco?: string;
};

export type Projeto = {
    id: Identificador;
    nome: string;
    cliente_id: Identificador;
    status: StatusProjeto;
    prazo_entrega: Date;
    custo_estimado?: number;
    valor_cobrado?: number;
};

export type LancamentoFinanceiro = {
    id: Identificador;
    tipo: "ENTRADA" | "SAIDA";
    valor: number;
    descricao: string;
    data: Date;
    projeto_id?: Identificador;
};
