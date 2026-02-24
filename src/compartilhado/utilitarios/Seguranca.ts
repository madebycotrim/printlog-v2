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

import { registrar } from "./registrador";

/**
 * Sistema de Auditoria Interna.
 * Garante que logs de desenvolvimento não vazem dados sensíveis.
 */
export const auditoria = {
    log: (mensagem: string, contexto: any) => {
        const contextoLimpo = contexto ? higienizarPII(contexto) : {};
        registrar.info({ rastreioId: 'auditoria-interna', ...contextoLimpo }, mensagem);
    },
    erro: (mensagem: string, erro: any) => {
        const erroLimpo = higienizarPII(erro);
        registrar.error({ rastreioId: 'auditoria-erro', ...erroLimpo }, mensagem, erro);
    },
    evento: (nomeEvento: string, metadados: any) => {
        const metaLimpo = higienizarPII(metadados);
        registrar.info({ rastreioId: 'auditoria-evento', ...metaLimpo }, `Evento: ${nomeEvento}`);
    }
};
