import { User, Mail, Lock } from "lucide-react";
import { CabecalhoCard, CampoDashboard } from "./Compartilhados";

interface PropsCardPerfil {
    usuario: any;
    nome: string;
    definirNome: (n: string) => void;
    enviandoEmail: boolean;
    sucessoEmail: boolean;
    lidarComTrocaSenha: () => void;
    pendente?: boolean;
}

export function CardPerfil({ usuario, nome, definirNome, enviandoEmail, sucessoEmail, lidarComTrocaSenha, pendente }: PropsCardPerfil) {
    return (
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-card-fundo p-5 md:p-6 flex flex-col gap-5">
            <CabecalhoCard titulo="Perfil Maker" descricao="Sua conta de acesso e segurança" icone={User} corIcone="text-sky-500" pendente={pendente} />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="flex flex-col items-center justify-center shrink-0 w-32 rounded-2xl p-4 bg-gray-50/70 dark:bg-white/[0.02]">
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                        {usuario?.fotoUrl ? (
                            <img src={usuario.fotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-black text-gray-400 dark:text-zinc-700">{usuario?.nome?.charAt(0) || "C"}</span>
                        )}
                    </div>

                </div>

                <div className="flex-1 w-full space-y-4">
                    <CampoDashboard label="Nome Completo" valor={nome} aoMudar={definirNome} icone={User} placeholder="Seu nome" />
                    <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-gray-500 dark:text-zinc-500">
                            E-mail Vinculado
                        </label>
                        <div className="h-11 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] px-4 flex items-center gap-3">
                            <Mail size={16} className="text-gray-400" />
                            <span className="truncate text-sm font-semibold text-gray-700 dark:text-zinc-300 flex-1">{usuario?.email}</span>
                            {usuario?.provedorGoogle && (
                                <svg className="shrink-0 w-4 h-4" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z" />
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>
            </div>



            {!enviandoEmail && !sucessoEmail && (
                <button
                    onClick={lidarComTrocaSenha}
                    className="mt-auto h-11 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.12em] transition-all shadow-sm active:scale-[0.98]"
                >
                    <Lock size={14} className="text-sky-500" />
                    Gerar Link de Redefinição
                </button>
            )}

            {enviandoEmail && (
                <div className="mt-auto h-11 w-full rounded-xl border border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 dark:text-sky-400">Processando Solicitação...</span>
                </div>
            )}

            {sucessoEmail && (
                <div className="mt-auto p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/[0.04] flex flex-col items-center text-center gap-2 animate-in zoom-in-95 duration-300">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                        <Mail size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">E-mail de Segurança Enviado</p>
                        <p className="text-[10px] text-emerald-700/70 dark:text-emerald-500/60 mt-0.5">Verifique sua caixa de entrada e spam para redefinir sua credencial.</p>
                    </div>
                </div>
            )}

            <p className="mt-2 text-[11px] leading-relaxed text-gray-400 dark:text-zinc-500 text-center px-4">
                <strong>Finalidade:</strong> Seus dados de perfil são tratados exclusivamente para identificação e segurança na plataforma, conforme Art. 7º, V da LGPD.
            </p>
        </div>
    );
}
