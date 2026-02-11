import { jwtVerify, importSPKI } from 'jose';

// CHAVE PÚBLICA (Pode ser exposta no Frontend)
// Usada apenas para VERIFICAR se o crachá é autêntico.
// A Chave Privada (usada para CRIAR) NÃO ESTÁ AQUI.
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE0L1RGo2U4y/fEf9pPPSzel054RjU
e+tBpomAsM/b++Ks6RJH9CVhJqr+mswyno+LroQV+wL6N4FlUBGqflh71w==
-----END PUBLIC KEY-----`;

export const validarQRSeguro = async (token) => {
    try {
        // 1. Importar Chave Pública
        const alg = 'ES256'; // ECDSA P-256
        const publicKey = await importSPKI(PUBLIC_KEY_PEM, alg);

        // 2. Verificar Assinatura
        const { payload } = await jwtVerify(token, publicKey, {
            algorithms: ['ES256'],
            issuer: 'SCAE-CEM03-OFFICIAL',
            audience: 'SCAE-LEITOR'
        });

        return {
            valido: true,
            matricula: payload.sub,
            dados: payload
        };
    } catch (erro) {
        console.error("Erro na validação do token:", erro.code, erro.message);

        let mensagemErro = 'Token Inválido';
        if (erro.code === 'ERR_JWT_EXPIRED' || erro.code === 'JWTExpired') mensagemErro = 'QR Code Expirado';
        if (erro.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') mensagemErro = 'Assinatura Falsa';

        return {
            valido: false,
            erro: mensagemErro,
            detalhes: erro.code
        };
    }
};

