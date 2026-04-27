import { z } from "zod";
import { BaseLegalLGPD, StatusComercial } from "./tipos";

export const clienteSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1),
  email: z.string().email(),
  telefone: z.string().min(1),
  ltvCentavos: z.number().int().min(0).optional(),
  totalProdutos: z.number().int().min(0).optional(),
  fiel: z.boolean().optional(),
  statusComercial: z.nativeEnum(StatusComercial),
  observacoesCRM: z.string().optional(),
  idConsentimento: z.string().min(1),
  baseLegal: z.nativeEnum(BaseLegalLGPD),
  finalidadeColeta: z.string().min(1),
  prazoRetencaoMeses: z.number().int().min(1),
  anonimizado: z.boolean().optional(),
});
