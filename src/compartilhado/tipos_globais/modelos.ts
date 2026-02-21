export type Identificador = string;

export type ModoTema = "CLARO" | "ESCURO";

export type StatusImpressora =
  | "LIVRE"
  | "IMPRIMINDO"
  | "MANUTENCAO"
  | "OFFLINE";

export type Impressora = {
  id: Identificador;
  nome: string;
  status: StatusImpressora;
  horas_impressao: number;
  temperatura_atual?: number;
};

export type Filamento = {
  id: Identificador;
  marca: string;
  material: string; // PLA, ABS, PETG
  cor: string;
  cor_hex: string; // Ex: #FF0000
  peso_total_g: number; // 1000g
  peso_restante_g: number; // 850g
  preco_kg: number;
  data_cadastro?: string;
};
