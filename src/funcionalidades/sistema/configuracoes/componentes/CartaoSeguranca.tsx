import { Shield, Lock, Key, Smartphone } from "lucide-react";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contexto/ContextoAutenticacao";

export function CartaoSeguranca() {
    const { usuario } = usarAutenticacao();
    const isGoogle = usuario?.uid && !usuario.email; // Simplificação, na real checaríamos o providerData

    return (
        <div className="col-span-1 lg:col-span-1 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/5 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Segurança</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">
                        Credenciais & Acesso
                    </p>
                </div>
                <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                    <Shield size={20} />
                </div>
            </div>

            <div className="space-y-4">
                {/* Item Senha */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-black/20 rounded-lg text-red-500">
                            <Lock size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                                Senha Mestra
                            </p>
                            <p className="text-[10px] text-gray-400">
                                Não configurada
                            </p>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-2 py-1 bg-red-500/10 rounded-md">
                        Vulnerável
                    </span>
                </div>

                {/* Item Conta Vinculada */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-black/20 rounded-lg text-blue-500">
                            <Smartphone size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                                Conta Vinculada
                            </p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[120px]">
                                {usuario?.email}
                            </p>
                        </div>
                    </div>
                    <span className={`text-[10px] font-bold ${isGoogle ? 'text-blue-500 bg-blue-500/10' : 'text-gray-500 bg-gray-500/10'} uppercase tracking-widest px-2 py-1 rounded-md`}>
                        {isGoogle ? 'Google' : 'Email'}
                    </span>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors uppercase tracking-wide">
                        <Key size={14} />
                        Gerenciar Acesso
                    </button>
                </div>
            </div>
        </div>
    );
}
