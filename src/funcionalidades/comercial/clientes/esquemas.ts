import { z } from "zod";

/**
 * Esquema de validação para cadastro/edição de clientes.
 * Segue restrições de negócio e obrigações LGPD.
 */
export const esquemaCliente = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    telefone: z.string().min(10, "Telefone inválido"),

});

export type TipoDadosCliente = z.infer<typeof esquemaCliente>;
