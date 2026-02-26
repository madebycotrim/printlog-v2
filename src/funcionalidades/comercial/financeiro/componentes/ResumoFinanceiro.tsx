import { TrendingUp, TrendingDown, Wallet, BoxSelect } from "lucide-react";
import { ResumoFinanceiro } from "../tipos";
import { CardResumo, CardResumoVazio } from "@/compartilhado/componentes_ui/CardResumo";

interface ResumoFinanceiroProps {
    resumo: ResumoFinanceiro;
}

export function ResumoFinanceiroComponente({ resumo }: ResumoFinanceiroProps) {
    const formatarMoeda = (centavos: number) => {
        return (Math.abs(centavos) / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <CardResumo
                titulo="Saldo Atual"
                valor={formatarMoeda(resumo.saldoTotalCentavos)}
                unidade="consolidado"
                icone={Wallet}
                cor={resumo.saldoTotalCentavos >= 0 ? "emerald" : "rose"}
            />

            <CardResumo
                titulo="Entradas (Mês)"
                valor={formatarMoeda(resumo.entradasMesCentavos)}
                unidade="recebido"
                icone={TrendingUp}
                cor="emerald"
            />

            <CardResumo
                titulo="Saídas (Mês)"
                valor={formatarMoeda(resumo.saidasMesCentavos)}
                unidade="gasto"
                icone={TrendingDown}
                cor="rose"
            />

            <CardResumoVazio icone={BoxSelect} />
        </div>
    );
}
