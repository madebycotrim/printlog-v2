/**
 * Gerenciador de Chaves de Assinatura
 * 
 * Sistema de rotação de chaves para QR Codes com suporte a versioning.
 * Utiliza ECDSA P-256 para assinaturas criptográficas.
 */

import { bancoLocal } from './bancoLocal';
import { api } from './api';
import { generateKeyPair, exportJWK, exportSPKI, importJWK } from 'jose';

/**
 * Gera um novo par de chaves ECDSA P-256
 * @returns {Promise<{versao: number, chavePublica: string, chavePrivada: object}>}
 */
export async function gerarNovaChave() {
    try {
        // 1. Gerar par de chaves ECDSA P-256
        const { publicKey, privateKey } = await generateKeyPair('ES256', {
            extractable: true
        });

        // 2. Exportar chave pública como SPKI (PEM format)
        const chavePublicaPEM = await exportSPKI(publicKey);

        // 3. Exportar chave privada como JWK (JSON Web Key)
        const chavePrivadaJWK = await exportJWK(privateKey);

        // 4. Obter próxima versão
        const banco = await bancoLocal.iniciarBanco();
        const chavesExistentes = await banco.getAll('chaves_assinatura');
        const proximaVersao = chavesExistentes.length > 0
            ? Math.max(...chavesExistentes.map(c => c.versao)) + 1
            : 1;

        // 5. Definir data de expiração (30 dias a partir de hoje)
        const expiraEm = new Date();
        expiraEm.setDate(expiraEm.getDate() + 30);

        const novaChave = {
            versao: proximaVersao,
            chave_publica: chavePublicaPEM,
            chave_privada: JSON.stringify(chavePrivadaJWK), // Salvar como string
            ativa: true,
            criada_em: new Date().toISOString(),
            expira_em: expiraEm.toISOString(),
            criada_por: 'system' // Será atualizado com email do admin
        };

        return novaChave;
    } catch (erro) {
        console.error('Erro ao gerar novo par de chaves:', erro);
        throw new Error('Falha ao gerar chaves de assinatura');
    }
}

/**
 * Salva uma nova chave no banco (local e nuvem)
 * @param {object} chave - Objeto da chave a ser salva
 * @param {string} criadaPor - Email do usuário que criou a chave
 */
export async function salvarChave(chave, criadaPor = 'system') {
    try {
        chave.criada_por = criadaPor;

        // 1. Salvar na nuvem (se online)
        if (navigator.onLine) {
            try {
                await api.enviar('/chaves', chave);
                console.log('Chave salva na nuvem com sucesso');
            } catch (erro) {
                console.warn('Erro ao salvar na nuvem, salvando apenas localmente:', erro);
            }
        }

        // 2. Sempre salvar localmente
        const banco = await bancoLocal.iniciarBanco();
        await banco.put('chaves_assinatura', chave);

        console.log(`Chave v${chave.versao} salva com sucesso`);
        return chave;
    } catch (erro) {
        console.error('Erro ao salvar chave:', erro);
        throw erro;
    }
}

/**
 * Obtém a chave ativa atual
 * @returns {Promise<object|null>} Chave ativa ou null se não houver
 */
export async function obterChaveAtiva() {
    try {
        const banco = await bancoLocal.iniciarBanco();
        const todasChaves = await banco.getAll('chaves_assinatura');

        // Filtrar apenas chaves ativas e não expiradas
        const chavesValidas = todasChaves.filter(chave => {
            if (!chave.ativa) return false;
            if (chave.expira_em && new Date(chave.expira_em) < new Date()) return false;
            return true;
        });

        // Retornar a mais recente
        if (chavesValidas.length === 0) return null;

        const chaveAtiva = chavesValidas.reduce((mais_recente, atual) =>
            atual.versao > mais_recente.versao ? atual : mais_recente
        );

        return chaveAtiva;
    } catch (erro) {
        console.error('Erro ao obter chave ativa:', erro);
        return null;
    }
}

/**
 * Obtém uma chave específica por versão
 * @param {number} versao - Versão da chave
 * @returns {Promise<object|null>}
 */
export async function obterChavePorVersao(versao) {
    try {
        const banco = await bancoLocal.iniciarBanco();
        const chave = await banco.get('chaves_assinatura', versao);
        return chave || null;
    } catch (erro) {
        console.error(`Erro ao obter chave v${versao}:`, erro);
        return null;
    }
}

/**
 * Rotaciona as chaves: gera uma nova e desativa a anterior após período de transição
 * @param {string} usuarioEmail - Email do admin que está rotacionando
 * @returns {Promise<object>} Nova chave criada
 */
export async function rotacionarChave(usuarioEmail) {
    try {
        // 1. Gerar nova chave
        const novaChave = await gerarNovaChave();

        // 2. Salvar nova chave
        await salvarChave(novaChave, usuarioEmail);

        // 3. Desativar chaves antigas após período de transição (7 dias)
        // Por enquanto, apenas marcamos que a rotação foi feita
        // A desativação automática será feita por um job scheduler

        console.log(`Rotação de chave concluída. Nova versão: v${novaChave.versao}`);

        return novaChave;
    } catch (erro) {
        console.error('Erro ao rotacionar chave:', erro);
        throw erro;
    }
}

/**
 * Desativa uma chave específica
 * @param {number} versao - Versão da chave a ser desativada
 */
export async function desativarChave(versao) {
    try {
        const banco = await bancoLocal.iniciarBanco();
        const chave = await banco.get('chaves_assinatura', versao);

        if (!chave) {
            throw new Error(`Chave v${versao} não encontrada`);
        }

        chave.ativa = false;
        await banco.put('chaves_assinatura', chave);

        // Atualizar na nuvem (se online)
        if (navigator.onLine) {
            try {
                await api.enviar(`/chaves/${versao}`, { ativa: false });
            } catch (erro) {
                console.warn('Erro ao desativar na nuvem:', erro);
            }
        }

        console.log(`Chave v${versao} desativada`);
    } catch (erro) {
        console.error(`Erro ao desativar chave v${versao}:`, erro);
        throw erro;
    }
}

/**
 * Lista todas as chaves (histórico)
 * @returns {Promise<Array>}
 */
export async function listarTodasChaves() {
    try {
        const banco = await bancoLocal.iniciarBanco();
        const chaves = await banco.getAll('chaves_assinatura');

        // Ordenar por versão (mais recente primeiro)
        return chaves.sort((a, b) => b.versao - a.versao);
    } catch (erro) {
        console.error('Erro ao listar chaves:', erro);
        return [];
    }
}

/**
 * Converte chave JWK (string) de volta para objeto CryptoKey
 * @param {string} chavePrivadaJWKString - String JSON da chave privada
 * @returns {Promise<CryptoKey>}
 */
export async function importarChavePrivada(chavePrivadaJWKString) {
    try {
        const jwk = JSON.parse(chavePrivadaJWKString);
        const privateKey = await importJWK(jwk, 'ES256');
        return privateKey;
    } catch (erro) {
        console.error('Erro ao importar chave privada:', erro);
        throw erro;
    }
}
