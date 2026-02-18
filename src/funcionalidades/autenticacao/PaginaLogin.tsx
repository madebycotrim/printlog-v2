import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function PaginaLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulação de Login
        console.log('Login:', { email, senha });
        navigate('/app');
    };

    return (
        <div className="min-h-screen bg-[#050505] font-sans text-white flex items-center justify-center p-4 selection:bg-[#0ea5e9] selection:text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#050505] to-[#050505]"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 mb-6 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/logo-colorida.png" alt="Logo PrintLog" className="h-8 w-auto" />
                        <span className="text-white font-black text-xl tracking-tighter italic">PRINTLOG</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h1>
                    <p className="text-zinc-500 text-sm">Acesse sua conta para gerenciar seus projetos.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Senha</label>
                            <a href="#" className="text-xs text-blue-500 hover:text-blue-400 transition-colors">Esqueceu?</a>
                        </div>
                        <input
                            type="password"
                            required
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold py-3.5 rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_-5px_rgba(14,165,233,0.5)] transform hover:-translate-y-0.5"
                    >
                        ENTRAR
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
                    <p className="text-zinc-500 text-sm">
                        Não tem uma conta? <a href="/cadastro" className="text-white font-bold hover:underline">Crie agora</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
