import { z } from "zod";

export const registroMovimentacaoInsumoSchema = z.object({
  id: z.string().optional(),
  data: z.string().optional(),
  tipo: z.enum(["Entrada", "Saída"]),
  quantidade: z.number().min(0),
  valorTotal: z.number().min(0).optional(),
  motivo: z.enum(["Consumo", "Descarte", "Avaria", "Outro"]).optional(),
  observacao: z.string().optional(),
  responsavel: z.string().optional(),
});

export const insumoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1),
  descricao: z.string().optional(),
  categoria: z.enum(["Geral", "Embalagem", "Fixação", "Eletrônica", "Acabamento", "Limpeza", "Outros"]),
  unidadeMedida: z.enum(["un", "ml", "L", "g", "kg", "Rolo", "Caixa", "Par"]),
  quantidadeAtual: z.number().min(0),
  quantidadeMinima: z.number().min(0),
  custoMedioUnidade: z.number().min(0),
  linkCompra: z.string().url().or(z.string()).optional(),
  marca: z.string().optional(),
  itemFracionavel: z.boolean().optional(),
  rendimentoTotal: z.number().optional(),
  unidadeConsumo: z.string().optional(),
});
