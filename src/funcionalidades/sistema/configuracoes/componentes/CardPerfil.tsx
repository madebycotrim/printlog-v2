import { User, Mail, Lock, LogOut, Save, Check } from "lucide-react";
import { CabecalhoCard, CampoDashboard } from "./Compartilhados";
import { Usuario } from "@/compartilhado/tipos/modelos";
import { Avatar } from "@/compartilhado/componentes/Avatar";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Propriedades para o componente CardPerfil.
 */
interface PropsCardPerfil {
    /** Objeto do usuário autenticado */
    usuario: Usuario | null;
    /** Nome atual para edição no campo */
    nome: string;
    /** Função para atualizar o nome no estado pai */
    definirNome: (n: string) => void;
    /** Indica se o email de redefinição foi enviado com sucesso */
    sucessoEmail: boolean;
    /** Função para disparar o processo de troca de senha */
    lidarComTrocaSenha: () => void;
    /** Função para salvar alterações no perfil */
    lidarComSalvar: () => void;
    /** Função para encerrar a sessão */
    lidarComSair: () => void;
    /** Indica se há uma operação pendente (carregando) */
    pendente?: boolean;
}

/**
 * Componente para exibição e edição do perfil do usuário com estética Premium.
 */
export function CardPerfil({ 
    usuario, nome, definirNome, sucessoEmail, 
    lidarComTrocaSenha, lidarComSalvar, lidarComSair, pendente 
}: PropsCardPerfil) {
    const alterado = nome !== (usuario?.nome || "");

    return (
        <div className="rounded-3xl border border-gray-100 dark:border-white/[0.04] bg-white dark:bg-[#121214] p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] transition-all duration-700">
            {/* Background Decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/[0.02] to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between">
                <CabecalhoCard titulo="Perfil Maker" descricao="Sua identidade na plataforma" icone={User} corIcone="text-[var(--cor-primaria)]" pendente={pendente} />
                <button 
                    onClick={lidarComSair}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all duration-300 border border-transparent hover:border-rose-500/10"
                >
                    <LogOut size={14} />
                    Sair
                </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {/* Avatar Section */}
                <div className="relative shrink-0 group/avatar">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--cor-primaria)] to-sky-400 rounded-3xl blur-xl opacity-20 group-hover/avatar:opacity-40 transition-opacity duration-500" />
                    <div className="relative flex flex-col items-center justify-center shrink-0 w-36 h-36 rounded-3xl p-5 bg-gray-50/70 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] backdrop-blur-sm shadow-inner">
                        <Avatar 
                            nome={nome} 
                            fotoUrl={nome !== usuario?.nome ? null : usuario?.fotoUrl} 
                            tamanho="w-24 h-24" 
                            className="text-4xl shadow-2xl border-4 border-white dark:border-zinc-800"
                        />
                    </div>
                </div>

                <div className="flex-1 space-y-6 w-full">
                    <CampoDashboard label="Assinatura Maker" valor={nome} aoMudar={definirNome} placeholder="Como você quer ser chamado?" icone={User} />

                    <div className="w-full">
                        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 ml-1">E-mail de Segurança</label>
                        <div className="h-12 w-full bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/[0.03] rounded-xl px-4 flex items-center gap-3">
                            <Mail size={18} className="text-gray-400 dark:text-zinc-600" />
                            <span className="truncate text-sm font-bold text-gray-600 dark:text-zinc-400 flex-1">
                                {usuario?.email}
                            </span>
                            {usuario?.provedorGoogle && (
                                <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700/50">
                                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                        <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z" />
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
                <AnimatePresence mode="wait">
                    {alterado && (
                        <motion.button
                            key="save"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            onClick={lidarComSalvar}
                            className="h-12 w-full rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-zinc-900/10 dark:shadow-white/5"
                        >
                            <Save size={16} />
                            Salvar Alterações
                        </motion.button>
                    )}
                </AnimatePresence>

                {!sucessoEmail ? (
                    <button
                        onClick={lidarComTrocaSenha}
                        className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-500 to-[var(--cor-primaria)] text-white font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-sky-500/20 group/btn"
                    >
                        <Lock size={16} className="group-hover:rotate-12 transition-transform" />
                        Redefinir Senha
                        <div className="ml-auto opacity-40 group-hover:opacity-100 pr-2 transition-opacity">
                            <Check size={14} />
                        </div>
                    </button>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] flex flex-col items-center text-center gap-1"
                    >
                        <div className="flex items-center gap-2 text-emerald-500">
                            <Check size={14} className="font-black" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Acesso de Segurança Enviado</p>
                        </div>
                        <p className="text-[9px] text-emerald-500/60 uppercase font-bold">Verifique sua caixa de entrada.</p>
                    </motion.div>
                )}
            </div>

            <p className="mt-2 text-[9px] text-zinc-400/40 dark:text-zinc-500/20 text-center px-10 leading-tight italic uppercase tracking-widest">
                Proteção LGPD: Seus dados são processados para fins de contrato e segurança (Art. 7º, V).
            </p>
        </div>
    );
}
