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
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Key size={24} />
                        </div>
                        Parâmetros de Emissão
                    </h2>

                    <form onSubmit={gerarToken} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Matrícula do Aluno</label>
                            <input
                                type="text"
                                value={matricula}
                                onChange={e => definirMatricula(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono text-slate-700"
                                placeholder="Ex: 2024001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                                <span>Chave Privada (PKCS#8 PEM)</span>
                                <span className="text-xs text-rose-500 font-bold flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                    <Lock size={10} /> ALTO SIGILO
                                </span>
                            </label>
                            <textarea
                                value={chavePrivada}
                                onChange={e => definirChavePrivada(e.target.value)}
                                className="w-full h-32 px-4 py-3 border border-slate-900 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                            />
                            <p className="text-xs text-slate-500 mt-2 font-medium">⚠️ Essa chave DEVE permanecer offline ou no servidor seguro.</p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Shield size={20} /> Assinar e Gerar Token
                        </button>
                    </form>

                    {erro && (
                        <div className="mt-6 p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center gap-3 text-sm font-bold border border-rose-100 animate-pulse">
                            <AlertTriangle size={18} /> {erro}
                        </div>
                    )}
                </div>

                {/* Resultado */}
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex flex-col items-center justify-center min-h-[450px]">
                    {tokenGerado ? (
                        <div className="w-full flex flex-col items-center animate-[scaleIn_0.3s_ease-out]">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Crachá Gerado com Sucesso
                            </h3>

                            <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border-4 border-indigo-500 ring-4 ring-indigo-500/20">
                                <QRCodeSVG value={tokenGerado} size={220} level="H" />
                            </div>

                            <div className="w-full bg-white p-4 rounded-xl border border-slate-200 mb-6 relative group shadow-sm hover:shadow-md transition-all">
                                <p className="font-mono text-[10px] leading-relaxed text-slate-500 break-all h-24 overflow-y-auto custom-scrollbar p-2">
                                    {tokenGerado}
                                </p>
                                <button
                                    onClick={copiarToken}
                                    className="absolute top-2 right-2 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-all active:scale-95"
                                    title="Copiar Token"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 font-bold shadow-sm">
                                <Shield size={16} /> Assinatura Válida (ECDSA P-256)
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-400">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-sm">
                                <QrCode size={40} className="text-slate-300" />
                            </div>
                            <p className="font-medium text-slate-500">Preencha os parâmetros ao lado</p>
                            <p className="text-sm mt-1 text-slate-400">O QR Code assinado aparecerá aqui.</p>
                        </div>
                    )}
                </div>
            </div>
        </LayoutAdministrativo>
    );
}
