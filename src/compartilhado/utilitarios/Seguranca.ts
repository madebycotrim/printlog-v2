/**
 * 🛡️ Utilitário de Segurança e Auditoria PrintLog
 * Focado em LGPD (Privacy by Design) e higienização de dados.
 */

const CAMPOS_SENSIVEIS = [
    "senha",
    "token",
    "cpf",
    "documento",
    "email",
    "telefone",
    "celular",
    "endereco"
];

/**
 * Remove ou mascara dados sensíveis de um objeto (PII).
 * @param dados O objeto ou array de dados a ser higienizado.
 * @returns Uma cópia dos dados com campos sensíveis mascarados.
 */
export function higienizarPII(dados: any): any {
    if (!dados) return dados;

    if (Array.isArray(dados)) {
        return dados.map(item => higienizarPII(item));
    }

    if (typeof dados === "object") {
        const resultado: any = { ...dados };
        for (const chave in resultado) {
            if (CAMPOS_SENSIVEIS.includes(chave.toLowerCase())) {
                resultado[chave] = "[CONFIDENCIAL]";
            } else if (typeof resultado[chave] === "object") {
                resultado[chave] = higienizarPII(resultado[chave]);
            }
        }
        return resultado;
    }

    return dados;
}

/**
 * Sistema de Auditoria Interna.
 * Garante que logs de desenvolvimento não vazem dados sensíveis.
 */
export const auditoria = {
    log: (mensagem: string, contexto?: any) => {
        const contextoLimpo = contexto ? higienizarPII(contexto) : "";
        // No futuro, isso pode enviar para um serviço como Sentry ou LogRocket
        if (import.meta.env.DEV) {
            console.log(`[AUDITORIA] ${mensagem}`, contextoLimpo);
        }
    },
    erro: (mensagem: string, erro: any) => {
        const erroLimpo = higienizarPII(erro);
        if (import.meta.env.DEV) {
            console.error(`[AUDITORIA_ERRO] ${mensagem}`, erroLimpo);
        }
    },
    evento: (nomeEvento: string, metadados: any) => {
        const metaLimpo = higienizarPII(metadados);
        if (import.meta.env.DEV) {
            console.log(`[AUDITORIA_EVENTO] ${nomeEvento}`, metaLimpo);
        }
    }
};
