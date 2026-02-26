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
    "endereco",
    "cartao"
];

/**
 * 🔐 Mascara dados pessoais para exibição segura ou logs (LGPD Art. 13)
 * Regra v9.0: CPF: ***.456.789-** | E-mail: jo***@***.com
 */
export function mascararDadoPessoal(valor: string, tipo: 'cpf' | 'email' | 'cartao' | 'token'): string {
    if (!valor) return "";

    switch (tipo) {
        case 'cpf':
            // 123.456.789-01 -> ***.456.789-**
            return valor.replace(/^(\d{3})\.(\d{3})\.(\d{3})-(\d{2})$/, "***.$2.$3-**");
        case 'email':
            // joao@exemplo.com -> jo***@***.com
            const [local, dominio] = valor.split('@');
            if (!dominio) return valor;
            return `${local.slice(0, 2)}***@***.${dominio.split('.').pop()}`;
        case 'token':
            // tok_12345678 -> tok_****5678
            return valor.slice(0, 4) + "****" + valor.slice(-4);
        case 'cartao':
            return "**** **** **** " + valor.slice(-4);
        default:
            return "[REDACTED]";
    }
}


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
            const chaveMinuscula = chave.toLowerCase();
            if (CAMPOS_SENSIVEIS.includes(chaveMinuscula)) {
                const valor = String(resultado[chave]);
                if (chaveMinuscula.includes('email')) resultado[chave] = mascararDadoPessoal(valor, 'email');
                else if (chaveMinuscula.includes('cpf')) resultado[chave] = mascararDadoPessoal(valor, 'cpf');
                else if (chaveMinuscula.includes('token')) resultado[chave] = mascararDadoPessoal(valor, 'token');
                else resultado[chave] = "[CONFIDENCIAL]";
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
