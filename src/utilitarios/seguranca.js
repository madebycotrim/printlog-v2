import { jwtVerify } from 'jose';

// Chave Secreta Compartilhada (Em produção, usar variável de ambiente)
// IMPORTANTE: Para validação offline segura com chave simétrica (HMAC),
// a chave precisa estar no cliente. O ideal seria chave Assimétrica (Pública/Privada),
// mas seguindo o requisito de HMAC (Simétrico):
const SEGRED0_HMAC = new TextEncoder().encode(
    'SCAE_SEGURANCA_MAXIMA_2024_TAGUATINGA_DF_KEY'
);

export const validarQRSeguro = async (token) => {
    try {
        // Tenta verificar se é um JWT válido assinado com nossa chave
        const { payload } = await jwtVerify(token, SEGRED0_HMAC);

        // Verifica expiração extra se necessário (jwtVerify já checa 'exp')

        return {
            valido: true,
            matricula: payload.sub, // 'sub' guarda a matrícula
            dados: payload
        };
    } catch (erro) {
        console.error("Erro na validação do token:", erro);
        return {
            valido: false,
            erro: erro.code || 'TOKEN_INVALIDO'
        };
    }
};

// Função para gerar token (apenas para testes/simulação local)
import { SignJWT } from 'jose';

export const gerarTokenTeste = async (matricula) => {
    const token = await new SignJWT({ sub: matricula })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer('SCAE-LOCAL')
        .setAudience('SCAE-LEITOR')
        .setExpirationTime('1y') // Crachás valem por 1 ano
        .sign(SEGRED0_HMAC);

    return token;
};
