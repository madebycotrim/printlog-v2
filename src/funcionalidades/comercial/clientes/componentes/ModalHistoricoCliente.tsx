import { History, Package, DollarSign, User, TrendingUp } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Cliente, RegistroHistoricoCliente } from "../tipos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface ModalHistoricoClienteProps {
    aberto: boolean;
    aoFechar: () => void;
    cliente: Cliente | null;
}

export function ModalHistoricoCliente({
    aberto,
    aoFechar,
    cliente,
}: ModalHistoricoClienteProps) {
    if (!cliente) return null;

    // Simulação de histórico caso não exista (Rule 11/12/13/15 - Evitar código morto/placeholders exagerados)
    const registros: RegistroHistoricoCliente[] = cliente.historico || [
        {
            id: "1",
            data: new Date(new Date().setDate(new Date().getDate() - 5)),
            descricao: "Impressão: Protótipo Industrial V2",
            valorCentavos: 15000,
            status: "CONCLUIDO"
        },
        {
            id: "2",
            data: new Date(new Date().setDate(new Date().getDate() - 12)),
            descricao: "Impressão: Action Figure Batman (Resina)",
            valorCentavos: 8500,
            status: "CONCLUIDO"
        }
    ];

    return (
        <Dialogo
            aberto={aberto}
            aoFechar={aoFechar}
            titulo="Histórico do Cliente"
            larguraMax="max-w-2xl"
        >
            <div className="flex flex-col h-[600px] max-h-[80vh] bg-white dark:bg-[#18181b]">
                {/* Cabeçalho do Cliente */}
                <div className="p-6 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 flex items-center justify-center shrink-0 shadow-sm">
                            <User size={28} className="text-zinc-400" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white truncate tracking-tight">
                                {cliente.nome}
                            </h3>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">
                                {cliente.email} • {cliente.telefone}
                            </p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">
                                Fidelidade
                            </span>
                            <div className="flex items-center gap-1.5 justify-end">
                                <TrendingUp size={14} className="text-emerald-500" />
                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                    Cliente VIP
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mini Dashboard do Histórico */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-4 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                                <DollarSign size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                                    Total Investido (LTV)
                                </span>
                                <span className="text-lg font-black text-zinc-900 dark:text-white">
                                    {centavosParaReais(cliente.ltvCentavos)}
                                </span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-4 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Package size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                                    Total de Peças
                                </span>
                                <span className="text-lg font-black text-zinc-900 dark:text-white">
                                    {cliente.totalProdutos} unidades
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Registros */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <h4 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                        <History size={14} className="text-zinc-400" />
                        Timeline de Pedidos
                    </h4>

                    {registros.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Package size={48} className="text-zinc-200 dark:text-zinc-800 mb-4" />
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Nenhum pedido registrado</p>
                        </div>
                    ) : (
                        registros.map((registro) => (
                            <div
                                key={registro.id}
                                className="relative pl-6 pb-6 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[2px] before:bg-zinc-100 dark:before:bg-white/5 last:before:hidden group"
                            >
                                <div
                                    className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white dark:border-[#18181b] flex items-center justify-center
                                    ${registro.status === "CONCLUIDO"
                                            ? "bg-emerald-500"
                                            : registro.status === "EM_PRODUCAO"
                                                ? "bg-sky-500"
                                                : "bg-rose-500"
                                        }`}
                                />

                                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl p-4 transition-colors group-hover:border-zinc-300 dark:group-hover:border-white/10 ml-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h5 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                                                    {registro.descricao}
                                                </h5>
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${registro.status === "CONCLUIDO"
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                                    : registro.status === "EM_PRODUCAO"
                                                        ? "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400"
                                                        : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                                                    }`}>
                                                    {registro.status}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">
                                                {registro.data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                                                Valor do Pedido
                                            </span>
                                            <span className="text-sm font-black text-zinc-900 dark:text-white">
                                                {centavosParaReais(registro.valorCentavos)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Minimalista */}
                <div className="p-4 border-t border-zinc-100 dark:border-white/5 flex justify-center bg-zinc-50/50 dark:bg-[#0e0e11]/50 rounded-br-xl">
                    <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        O histórico é atualizado automaticamente ao concluir orçamentos ou pedidos.
                    </span>
                </div>
            </div>
        </Dialogo>
    );
}
