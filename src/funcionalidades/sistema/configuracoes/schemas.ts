import { z } from "zod";

export const configuracoesSchema = z.object({
  custoEnergia: z.string().min(1),
  horaMaquina: z.string().min(1),
  horaOperador: z.string().min(1),
  margemLucro: z.string().min(1),
});
