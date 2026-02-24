/** Valores monetários SEMPRE em centavos (inteiro). */
export type Centavos = number;

export enum StatusPedido {
  A_FAZER = "a_fazer",
  EM_PRODUCAO = "em_producao",
  ACABAMENTO = "acabamento",
  CONCLUIDO = "concluido",
  ATRASADO = "atrasado", // Derivado
}

export enum StatusImpressora {
  LIVRE = "livre",
  IMPRIMINDO = "imprimindo",
  MANUTENCAO = "manutencao",
}

export enum TipoLancamentoFinanceiro {
  ENTRADA = "entrada",
  SAIDA = "saida",
}

export enum TemaInterface {
  CLARO = "CLARO",
  ESCURO = "ESCURO",
}

export type ModoTema = TemaInterface;

export type CorPrimaria =
  | "sky"
  | "emerald"
  | "violet"
  | "amber"
  | "rose"
  | "cyan"
  | "indigo"
  | "teal"
  | "orange"
  | "fuchsia"
  | "lime"
  | "pink"
  | "blue"
  | "slate";

export type TipoFonte =
  | "inter"
  | "roboto"
  | "montserrat"
  | "outfit"
  | "poppins"
  | "jetbrains-mono";

/** Enum de Bases Legais LGPD conforme Regra 9.0 */
export enum BaseLegalLGPD {
  CONSENTIMENTO = "consentimento", // Art. 7º, I
  OBRIGACAO_LEGAL = "obrigacao_legal", // Art. 7º, II
  EXECUCAO_CONTRATO = "execucao_contrato", // Art. 7º, V
  INTERESSE_LEGITIMO = "interesse_legitimo", // Art. 7º, IX
}
