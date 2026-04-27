import { Shield, Sparkles, Calendar, RotateCcw } from "lucide-react";
import { CabecalhoCard } from "./Compartilhados";

interface PropsCardPlanoPremium {
    plano: string;
    cicloPagamento?: string;
    vencimentoPlano?: string | null;
}

export function CardPlanoPremium({
    plano,
    cicloPagamento,
    vencimentoPlano,
}: PropsCardPlanoPremium) {
    const obterDiasRestantes = () => {
        if (cicloPagamento === "VITALICIO" || plano === "FUNDADOR") return "Vitalício";
        if (!vencimentoPlano) return "---";

        const hoje = new Date();
        const venc = new Date(vencimentoPlano);
        const diffTempo = venc.getTime() - hoje.getTime();
        const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

        if (diffDias < 0) return `Expirado há ${Math.abs(diffDias)} dias`;
        if (diffDias === 0) return "Expira hoje!";
        return `${diffDias} dias restantes`;
    };

    const obterDataVencimentoFormatada = () => {
        if (cicloPagamento === "VITALICIO" || plano === "FUNDADOR") return "Nunca";
        if (!vencimentoPlano) return "---";

        const venc = new Date(vencimentoPlano);
        return venc.toLocaleDateString('pt-BR');
    };

    return (
        <div className="rounded-2xl border border-gray-100 dark:border-white/[0.04] bg-white dark:bg-[#121214] p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden group hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-indigo-500/[0.01] dark:from-indigo-500/[0.05] dark:to-indigo-500/[0.02] pointer-events-none" />
            <CabecalhoCard titulo="Maker PRO" descricao="Detalhes da sua assinatura premium" icone={Shield} corIcone="text-indigo-500" />
            
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100/50 dark:border-white/[0.02]">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">
                        <Sparkles size={12} className="text-indigo-500" />
                        Plano Atual
                    </div>
                    <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {plano}
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100/50 dark:border-white/[0.02]">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">
                        <RotateCcw size={12} className="text-indigo-500" />
                        Faturamento
                    </div>
                    <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {cicloPagamento || "MENSAL"}
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100/50 dark:border-white/[0.02]">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">
                        <Calendar size={12} className="text-indigo-500" />
                        Próxima Renovação
                    </div>
                    <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {obterDataVencimentoFormatada()}
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100/50 dark:border-white/[0.02]">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">
                        <Shield size={12} className="text-indigo-500" />
                        Status
                    </div>
                    <div className={`text-lg font-black uppercase tracking-tight ${obterDiasRestantes().includes("Expirado") ? "text-red-500" : "text-emerald-500"}`}>
                        {obterDiasRestantes()}
                    </div>
                </div>
            </div>

            <div className="mt-auto bg-indigo-50/80 dark:bg-indigo-500/[0.05] p-4 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 flex gap-3 items-start">
                <Sparkles size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-indigo-800 dark:text-indigo-300/90 text-justify">
                    Acesso ilimitado às ferramentas operacionais do PrintLog. Em caso de dúvidas sobre seu faturamento, entre em contato diretamente com o suporte pelo e-mail do fundador.
                </p>
            </div>
        </div>
    );
}
