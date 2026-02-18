import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function PaginaCadastro() {
    const navegar = useNavigate();
    const [nome, definirNome] = useState('');
    const [email, definirEmail] = useState('');
    const [senha, definirSenha] = useState('');

    const realizarCadastro = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulação de Cadastro
        console.log('Cadastro:', { nome, email, senha });
        navegar('/app');
    };

    return (
        <div className="min-h-screen bg-[#050505] font-sans text-white flex items-center justify-center p-4 selection:bg-[#0ea5e9] selection:text-white relative overflow-hidden">
            {/* Efeitos de Fundo */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#050505] to-[#050505]"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 mb-6 cursor-pointer" onClick={() => navegar('/')}>
                        <img src="/logo-colorida.png" alt="Logo PrintLog" className="h-8 w-auto" />
                        <span className="text-white font-black text-xl tracking-tighter italic">PRINTLOG</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Crie sua conta</h1>
                    <p className="text-zinc-500 text-sm">Comece a profissionalizar sua impressão 3D hoje.</p>
                </div>

                <form onSubmit={realizarCadastro} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome Completo</label>
                        <input
                            type="text"
                            required
                            value={nome}
                            onChange={(e) => definirNome(e.target.value)}
                            className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                            placeholder="Seu nome"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => definirEmail(e.target.value)}
                            className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Senha</label>
                        <input
                            type="password"
                            required
                            value={senha}
                            onChange={(e) => definirSenha(e.target.value)}
                            className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                            placeholder="Mínimo 8 caracteres"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5 uppercase tracking-wide"
                    >
                        Criar Conta Grátis
                    </button>

                    <p className="text-center text-xs text-zinc-500 mt-4">
                        Ao se cadastrar, você concorda com nossos <br /> Termos de Uso e Política de Privacidade.
                    </p>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
                    <p className="text-zinc-500 text-sm">
                        Já tem uma conta? <a href="/login" className="text-white font-bold hover:underline">Entrar</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
