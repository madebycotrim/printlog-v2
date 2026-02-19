import { usarAutenticacao } from "@/funcionalidades/autenticacao/contexto/ContextoAutenticacao";
import { User, Crown, Calendar } from "lucide-react";

export function CartaoIdentidade() {
    const { usuario } = usarAutenticacao();

    return (
        <div className="col-span-1 lg:col-span-2 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">

                {/* Coluna Avatar */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20">
                        <div className="w-full h-full rounded-full bg-white dark:bg-[#09090b] p-1">
                            {usuario?.fotoUrl ? (
                                <img
                                    src={usuario.fotoUrl}
                                    alt="Avatar"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-gray-400 dark:text-white/20">
                                        {usuario?.nome?.charAt(0).toUpperCase() || <User size={48} />}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wide">
                            <Crown size={12} className="fill-current" />
                            Conta Premium
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest">
                            <Calendar size={10} />
                            Membro desde 2026
                        </div>
                    </div>
                </div>

                {/* Coluna Formulário */}
                <div className="flex-1 w-full space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Identidade Visual
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-white/5">
                                Pessoal
                            </span>
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Informações utilizadas em relatórios e orçamentos.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Nome do Membro
                            </label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    defaultValue={usuario?.nome || ''}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="Seu nome completo"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Nome da Marca
                            </label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="Nome da Oficina ou Empresa"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                E-mail Principal
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    defaultValue={usuario?.email || ''}
                                    readOnly
                                    className="flex-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl py-2.5 px-4 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-70"
                                />
                                <span className="flex items-center px-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    Gerenciado
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
