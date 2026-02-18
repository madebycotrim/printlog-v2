export function Rodape() {
    return (
        <>
            {/* CTA Section */}
            <section className="bg-[#050505] py-32 border-t border-zinc-900 relative overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-sky-500/10 blur-[120px] rounded-full z-0 pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full z-0 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-full mb-8">
                        <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
                        <span className="text-sky-400 text-xs font-bold tracking-widest uppercase">Comece Hoje — É Grátis</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-[0.95] italic uppercase">
                        PRONTO PARA <br />
                        <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">LUCRAR DE VERDADE?</span>
                    </h2>
                    <p className="text-zinc-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                        Junte-se a centenas de makers e farms que já otimizaram sua precificação e aumentaram seus lucros.
                    </p>

                    <button
                        onClick={() => window.location.href = '/cadastro'}
                        className="group relative inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black rounded-xl text-base tracking-wide transition-all duration-500 shadow-[0_0_50px_-5px_rgba(14,165,233,0.7)] hover:shadow-[0_0_70px_-3px_rgba(14,165,233,1)] uppercase transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
                    >
                        <span className="relative z-10">Criar Conta Grátis</span>
                        <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>

                    <p className="mt-6 text-zinc-600 text-sm">Sem cartão de crédito. Sem compromisso.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black py-16 border-t border-zinc-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent"></div>
                <div className="absolute bottom-0 left-1/3 w-[500px] h-[200px] bg-sky-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">

                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-3 mb-5 group cursor-pointer w-fit">
                                <img
                                    src="/logo-colorida.png"
                                    alt="PrintLog"
                                    className="h-9 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(14,165,233,0.6)] group-hover:scale-105"
                                />
                                <span className="text-white font-black text-2xl tracking-tighter group-hover:text-sky-400 transition-colors">
                                    PRINTLOG
                                    <span className="ml-2 text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded align-middle">BETA</span>
                                </span>
                            </div>
                            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                                Sistema de gestão profissional para makers 3D. Calcule com precisão seus custos de impressão e maximize seus lucros.
                            </p>
                        </div>

                        {/* Contato */}
                        <div>
                            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
                                <div className="w-4 h-px bg-gradient-to-r from-sky-400 to-blue-600"></div>
                                Contato
                            </h4>
                            <a
                                href="mailto:suporte@printlog.com.br"
                                className="group flex items-center gap-3 text-zinc-500 text-sm hover:text-sky-400 transition-all duration-200"
                            >
                                <div className="w-9 h-9 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 group-hover:border-sky-500/50 group-hover:bg-sky-500/10 transition-all duration-300 shrink-0">
                                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                suporte@printlog.com.br
                            </a>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex flex-col md:flex-row items-center gap-4 text-zinc-600 text-xs">
                            <span>© 2026 PrintLog. Todos os direitos reservados.</span>
                            <div className="hidden md:flex items-center gap-3">
                                <span className="text-zinc-800">•</span>
                                <a href="/privacidade" className="hover:text-sky-400 transition-colors">Privacidade</a>
                                <span className="text-zinc-800">•</span>
                                <a href="/termos" className="hover:text-sky-400 transition-colors">Termos</a>
                                <span className="text-zinc-800">•</span>
                                <a href="/cookies" className="hover:text-sky-400 transition-colors">Cookies</a>
                            </div>
                        </div>
                        <span className="text-zinc-600 text-xs">MADEBYCOTRIM</span>
                    </div>
                </div>
            </footer>
        </>
    );
}
