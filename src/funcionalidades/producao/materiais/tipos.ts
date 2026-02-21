export interface RegistroUso {
  id: string;
  data: string; // ISO string ou formato amigável
  nomePeca: string; // Nome ou motivo do abatimento
  quantidadeGasta: number;
  tempoImpressao?: string; // Opcional, para impressões reais
  status: "SUCESSO" | "FALHA" | "CANCELADO" | "MANUAL";
}

export interface Material {
  id: string;
  tipo: "FDM" | "SLA";
  nome: string;
  tipoMaterial: string;
  fabricante: string;
  cor: string;
  preco: number;
  peso: number; // Volume ou peso original (ex: 1000g, 1000ml)
  estoque: number; // Número de embalagens cheias
  pesoRestante: number; // O quanto resta da embalagem atual em uso
  historicoUso: RegistroUso[]; // Novo campo para o histórico real
  arquivado?: boolean; // Controle de Soft Delete para preservar relatórios passados
}
