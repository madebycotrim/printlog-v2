import { describe, it, expect } from 'vitest';
import { validarQRSeguro } from './seguranca';
import { SignJWT, importPKCS8 } from 'jose';

// MESMA CHAVE PRIVADA DE DEMONSTRAÇÃO USADA NO GERADOR (Para testes passarem)
const PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgODH85qz4g7PbvvvM
0psPYKB2p3TaxsXz6sF2ppFjEuChRANCAATQvVEajZTjL98R/2k89LN6XTnhGNR7
60GmiYCwz9v74qzpEkf0JWEmqv6azDKej4uuhBX7Avo3gWVQEap+WHvX
-----END PRIVATE KEY-----`;

describe('Segurança SCAE (ECDSA P-256)', () => {
    it('deve validar um token assinado corretamente', async () => {
        const matricula = '20241001';

        // 1. Gerar Token (Simulando Backend/Gerador)
        const alg = 'ES256';
        const privateKey = await importPKCS8(PRIVATE_KEY_PEM, alg);

        const token = await new SignJWT({ sub: matricula })
            .setProtectedHeader({ alg })
            .setIssuedAt()
            .setIssuer('SCAE-CEM03-OFFICIAL')
            .setAudience('SCAE-LEITOR')
            .setExpirationTime('1y')
            .sign(privateKey);

        // 2. Validar (Simulando Frontend)
        const resultado = await validarQRSeguro(token);

        expect(resultado.valido).toBe(true);
        expect(resultado.matricula).toBe(matricula);
    });

    it('deve rejeitar um token expirado', async () => {
        const alg = 'ES256';
        const privateKey = await importPKCS8(PRIVATE_KEY_PEM, alg);

        const token = await new SignJWT({ sub: '123' })
            .setProtectedHeader({ alg })
            .setIssuer('SCAE-CEM03-OFFICIAL')
            .setAudience('SCAE-LEITOR')
            .setExpirationTime('-1h') // Expirado
            .sign(privateKey);

        const resultado = await validarQRSeguro(token);
        expect(resultado.valido).toBe(false);
        expect(resultado.erro).toBe('QR Code Expirado');
    });

    it('deve rejeitar um token com emissor (issuer) errado', async () => {
        const alg = 'ES256';
        const privateKey = await importPKCS8(PRIVATE_KEY_PEM, alg);

        const token = await new SignJWT({ sub: '123' })
            .setProtectedHeader({ alg })
            .setIssuer('HACKER-SCHOOL') // Emissor Errado
            .setAudience('SCAE-LEITOR')
            .setExpirationTime('1y')
            .sign(privateKey);

        const resultado = await validarQRSeguro(token);
        expect(resultado.valido).toBe(false);
    });
});
