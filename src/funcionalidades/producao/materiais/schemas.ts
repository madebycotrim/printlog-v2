import { z } from "zod";

export const registroUsoSchema = z.object({
  id: z.string().optional(),
  data: z.string().optional(),
  nomePeca: z.string().min(1),
  quantidadeGastaGramas: z.number().min(0),
  tempoImpressaoMinutos: z.number().int().min(0).optional(),
  status: z.enum(["SUCESSO", "FALHA", "CANCELADO", "MANUAL"]),
});

export const materialSchema = z.object({
  id: z.string().optional(),
  tipo: z.enum(["FDM", "SLA"]),
  nome: z.string().min(1),
  tipoMaterial: z.string().min(1),
  fabricante: z.string().min(1),
  cor: z.string().min(1),
  precoCentavos: z.number().int().min(0),
  pesoGramas: z.number().min(1),
  estoque: z.number().int().min(0),
  pesoRestanteGramas: z.number().min(0),
  arquivado: z.boolean().optional(),
});
