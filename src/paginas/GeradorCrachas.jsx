import { useState } from 'react';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import { Shield, Key, QrCode, Lock, Copy, AlertTriangle } from 'lucide-react';
import { SignJWT, importPKCS8 } from 'jose';
import { QRCodeSVG } from 'qrcode.react';

// EMPREGANDO A CHAVE PRIVADA AQUI APENAS PARA DEMONSTRAÇÃO/USO DO ADMIN
// EM PRODUÇÃO REAL, ISSO FICARIA NO BACKEND!
const CONST_PRIVATE_KEY_DEMO = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgODH85qz4g7PbvvvM
0psPYKB2p3TaxsXz6sF2ppFjEuChRANCAATQvVEajZTjL98R/2k89LN6XTnhGNR7
60GmiYCwz9v74qzpEkf0JWEmqv6azDKej4uuhBX7Avo3gWVQEap+WHvX
-----END PRIVATE KEY-----`;

export default function GeradorCrachas() {
    const [matricula, definirMatricula] = useState('');
    const [chavePrivada, definirChavePrivada] = useState(CONST_PRIVATE_KEY_DEMO);
    const [tokenGerado, definirTokenGerado] = useState('');
    const [erro, definirErro] = useState('');

    const gerarToken = async (e) => {
        e.preventDefault();
        definirErro('');
        definirTokenGerado('');

        try {
            if (!matricula) throw new Error('Matrícula obrigatória');

            // 1. Importar Chave Privada
            const alg = 'ES256';
            const privateKey = await importPKCS8(chavePrivada, alg);

            // 2. Gerar JWT Assinado
            const jwt = await new SignJWT({ sub: matricula })
                .setProtectedHeader({ alg })
                .setIssuedAt()
                .setIssuer('SCAE-CEM03-OFFICIAL')
                .setAudience('SCAE-LEITOR')
                .setExpirationTime('1y')
                .sign(privateKey);

            definirTokenGerado(jwt);
        } catch (err) {
            definirErro(err.message);
        }
    };

    const copiarToken = () => {
        navigator.clipboard.writeText(tokenGerado);
        alert('Token copiado!');
    };

    return (
        <LayoutAdministrativo
            titulo="Gerador de Crachás Seguros"
            subtitulo="Emissão de QR Codes com Assinatura Digital (ECDSA P-256)"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulário */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                        <Key className="text-indigo-600" /> Parâmetros de Emissão
                    </h2>

                    <form onSubmit={gerarToken} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Matrícula do Aluno</label>
                            <input
                                type="text"
                                value={matricula}
                                onChange={e => definirMatricula(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Ex: 2024001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                                <span>Chave Privada (PKCS#8 PEM)</span>
                                <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                                    <Lock size={12} /> ALTO SIGILO
                                </span>
                            </label>
                            <textarea
                                value={chavePrivada}
                                onChange={e => definirChavePrivada(e.target.value)}
                                className="w-full h-32 px-4 py-2 border rounded-lg bg-slate-900 text-green-400 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">Essa chave DEVE permanecer offline ou no servidor seguro.</p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                        >
                            <Shield size={18} /> Assinar e Gerar Token
                        </button>
                    </form>

                    {erro && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                            <AlertTriangle size={16} /> {erro}
                        </div>
                    )}
                </div>

                {/* Resultado */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
                    {tokenGerado ? (
                        <div className="w-full flex flex-col items-center animate-fade-in">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Crachá Gerado</h3>

                            <div className="bg-white p-4 rounded-xl shadow-lg mb-6 border-4 border-indigo-500">
                                <QRCodeSVG value={tokenGerado} size={200} level="H" />
                            </div>

                            <div className="w-full bg-white p-3 rounded-lg border border-slate-200 mb-4 relative group">
                                <p className="font-mono text-xs text-slate-500 break-all h-24 overflow-y-auto custom-scrollbar">
                                    {tokenGerado}
                                </p>
                                <button
                                    onClick={copiarToken}
                                    className="absolute top-2 right-2 p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition"
                                    title="Copiar Token"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                <Shield size={14} /> Assinatura Válida (ECDSA P-256)
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-400">
                            <QrCode size={48} className="mx-auto mb-2 opacity-50" />
                            <p>Preencha os dados ao lado para gerar um crachá seguro.</p>
                        </div>
                    )}
                </div>
            </div>
        </LayoutAdministrativo>
    );
}
