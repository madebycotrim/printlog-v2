import { useState } from 'react';
import { useAutenticacao } from '../contexts/ContextoAutenticacao';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, WifiOff, Lock, LayoutGrid, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PaginaLogin() {
    const { entrar } = useAutenticacao();
    const navegar = useNavigate();
    const [carregando, definirCarregando] = useState(false);
    const [erroLogin, definirErroLogin] = useState('');

    const aoEntrarComGoogle = async (usarRestricao = true) => {
        definirCarregando(true);
        definirErroLogin('');
        try {
            const parametros = usarRestricao
                ? { hd: 'edu.se.df.gov.br' }
                : { login_hint: 'madebycotrim@gmail.com' };

            const resultado = await entrar(parametros);

            // Validação estrita para o login de desenvolvedor
            if (!usarRestricao && resultado.user.email !== 'madebycotrim@gmail.com') {
                throw new Error('Acesso negado: Este login é exclusivo para o desenvolvedor.');
            }

            navegar('/painel');
        } catch (erro) {
            console.error(erro);
            // Se for erro de validação (nossa exceção), usa a mensagem dela. Se for do Firebase, msg genérica
            const mensagem = erro.message.includes('Acesso negado')
                ? erro.message
                : 'Não foi possível verificar sua conta. Certifique-se de usar um email institucional (@edu.se.df.gov.br) e que o pop-up não foi bloqueado.';
            definirErroLogin(mensagem);
        } finally {
            definirCarregando(false);
        }
    };

    return (
        <div className="flex min-h-screen font-sans selection:bg-indigo-500/30">
            {/* Painel Esquerdo - Brand & info */}
            <div className="hidden lg:flex w-1/2 bg-[#050b1f] flex-col justify-between p-16 text-white relative overflow-hidden">

                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#050b1f] to-[#050b1f] z-0"></div>

                {/* Subtle Grid Texture */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                {/* Animated Orbs */}
                <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

                {/* Conteúdo Header */}
                <div className="relative z-10 animate-[fadeIn_0.8s_ease-out]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Ambiente Monitorado</span>
                    </div>

                    <h1 className="text-9xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 drop-shadow-2xl selection:bg-transparent">
                        SCAE
                        <span className="text-indigo-500">.</span>
                    </h1>

                    <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-transparent mb-6 rounded-full"></div>

                    <p className="text-xl font-light text-indigo-100/70 max-w-sm leading-relaxed tracking-wide">
                        Sistema de Controle de Acesso Escolar
                    </p>
                </div>

                {/* Lista de Features - Estilo Minimalista */}
                <div className="space-y-8 relative z-10 max-w-lg w-full mt-12 animate-[fadeIn_1s_ease-out_0.2s_both]">

                    <div className="flex items-start gap-4 group cursor-default">
                        <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:text-indigo-300 group-hover:bg-indigo-400/20 transition-colors">
                            <WifiOff size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-white font-medium text-lg tracking-tight group-hover:text-indigo-200 transition-colors">Operação Offline</h3>
                            <p className="text-sm text-indigo-200/40 leading-relaxed mt-1">O sistema continua operando localmente mesmo sem internet, sincronizando automaticamente ao reconectar.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 group cursor-default">
                        <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 group-hover:text-amber-300 group-hover:bg-amber-400/20 transition-colors">
                            <Zap size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-white font-medium text-lg tracking-tight group-hover:text-amber-200 transition-colors">Alta Performance</h3>
                            <p className="text-sm text-indigo-200/40 leading-relaxed mt-1">Otimizado para leitura instantânea de QR Codes, garantindo fluxo rápido nos horários de pico.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 group cursor-default">
                        <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:text-emerald-300 group-hover:bg-emerald-400/20 transition-colors">
                            <Lock size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-white font-medium text-lg tracking-tight group-hover:text-emerald-200 transition-colors">Dados Protegidos</h3>
                            <p className="text-sm text-indigo-200/40 leading-relaxed mt-1">Criptografia de ponta a ponta e total conformidade com a LGPD para segurança dos alunos.</p>
                        </div>
                    </div>

                </div>

                <div className="flex justify-between items-center text-[10px] text-indigo-400/40 relative z-10 font-mono tracking-widest uppercase mt-auto pt-8 border-t border-white/5">
                    <button onClick={() => aoEntrarComGoogle(false)} className="hover:text-indigo-300 transition-colors cursor-pointer text-left focus:outline-none">
                        madebycotrim
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-emerald-500/80 font-bold">ONLINE</span>
                    </div>
                </div>
            </div>

            {/* Painel Direito - Login Form */}
            <div className="w-full lg:w-1/2 bg-[#f8fafc] flex flex-col items-center justify-center p-8 relative overflow-hidden">

                {/* Background Pattern - Dot Grid */}
                <div className="absolute inset-0 z-0 opacity-[0.4]"
                    style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}>
                </div>

                {/* Soft ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-100/50 via-violet-100/30 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

                {/* Header Institucional */}
                <div className="absolute top-8 right-8 flex items-center gap-3 opacity-80 mix-blend-multiply animate-[fadeInDown_0.8s_ease-out]">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-700 tracking-[0.2em] uppercase leading-tight">
                            CEM 03 <br />
                            <span className="text-slate-400">TAGUATINGA</span>
                        </p>
                    </div>

                </div>

                {/* Cartão de Login */}
                <div className="w-full max-w-[440px] bg-white/70 backdrop-blur-2xl p-10 rounded-[32px] shadow-[0_40px_100px_-20px_rgba(50,50,93,0.15),0_15px_40px_-20px_rgba(0,0,0,0.1)] relative z-10 border border-white/60 ring-1 ring-white/50 text-center animate-[scaleIn_0.6s_ease-out]">

                    {/* Icon Header */}
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl shadow-indigo-600/20 mb-8 border border-indigo-400/20">
                        <Shield className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Portal do Educador</h2>
                    <p className="text-sm text-slate-500 mb-10 font-medium leading-relaxed max-w-[280px] mx-auto">
                        Acesso exclusivo para gestão administrativa e operações de portaria.
                    </p>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold tracking-widest uppercase mb-8 border border-indigo-100">
                        <Lock size={12} className="mb-0.5" /> Área Restrita
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => aoEntrarComGoogle(true)}
                            disabled={carregando}
                            className="w-full group relative flex items-center justify-center gap-3 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 text-slate-700 font-bold py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-[0_4px_20px_-2px_rgba(99,102,241,0.15)] active:scale-[0.98] active:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-indigo-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                        >
                            {carregando ? (
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                                    <span className="text-indigo-600">Autenticando...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="w-5 h-5 flex-shrink-0">
                                        <svg viewBox="0 0 24 24" className="w-full h-full">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.24-1.18-1.6z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm">Entrar com Email Institucional</span>
                                </>
                            )}
                        </button>
                    </div>

                    {erroLogin && (
                        <div className="mt-6 p-4 bg-rose-50/80 backdrop-blur-sm border border-rose-100 rounded-2xl flex items-start gap-3 animate-[scaleIn_0.3s_ease-out] shadow-sm">
                            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                            <div className="text-left">
                                <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wide mb-1">Falha na Autenticação</h3>
                                <p className="text-xs text-rose-600 leading-relaxed font-medium">
                                    {erroLogin}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-dashed border-slate-200">
                        <div className="flex flex-col gap-3">
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                Ao continuar, você concorda com o protocolo de identificação digital.
                                Dados tratados conforme <strong>LGPD (Lei 13.709/18)</strong>.
                            </p>
                            <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-full px-3 py-1 mx-auto">
                                <span className="text-[10px] text-slate-500 font-medium">Permitido apenas</span>
                                <code className="text-[10px] font-mono text-indigo-600 font-bold tracking-wide">
                                    @edu.se.df.gov.br
                                </code>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 flex items-center gap-2 text-[10px] text-slate-400 font-medium tracking-wider uppercase opacity-60 hover:opacity-100 transition-opacity">
                    <Shield size={12} />
                    <span>SCAE BETA</span>
                </div>

            </div>

            {/* Global Keyframes helper */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
}
