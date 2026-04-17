import { PackageSearch, DollarSign, AlertTriangle, Activity } from "lucide-react";
import { useState } from "react";
import { GraficoConsumoMateriais } from "./GraficoConsumoMateriais";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { CardResumo } from "@/compartilhado/componentes/CardResumo";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";

interface PropriedadesResumoEstoque {
  materiais: Material[];
  totalEmbalagens: number;
  valorInvestido: number;
  alertasBaixoEstoque: number;
}

/**
 * Painel de resumo de estoque com métricas de patrimônio e alertas críticos.
 */
export function ResumoEstoque({
  materiais,
  totalEmbalagens,
  valorInvestido,
  alertasBaixoEstoque,
}: PropriedadesResumoEstoque) {
  const [modalGraficoAberto, definirModalGraficoAberto] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <CardResumo titulo="Volume de Insumos" valor={totalEmbalagens} unidade="rolos / potes" icone={PackageSearch} cor="sky" />

      <CardResumo
        titulo="Patrimônio em Estoque"
        valor={valorInvestido.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
        icone={DollarSign}
        cor="emerald"
      />

      <CardResumo
        titulo="Alertas Críticos"
        valor={alertasBaixoEstoque}
        unidade="materiais baixos"
        icone={AlertTriangle}
        cor={alertasBaixoEstoque > 0 ? "rose" : "zinc"}
      />

      <CardResumo
        titulo="Previsão de Uso"
        valor="Analisar"
        unidade="inteligência"
        icone={Activity}
        cor="indigo"
        aoClicar={() => definirModalGraficoAberto(true)}
        textoAcao="Ver Projetado"
      />

      <Dialogo
        aberto={modalGraficoAberto}
        aoFechar={() => definirModalGraficoAberto(false)}
        titulo="Projeção de Consumo de Materiais"
        larguraMax="max-w-4xl"
      >
        <div className="py-4">
          <GraficoConsumoMateriais materiais={materiais} />
        </div>
      </Dialogo>
    </div>
  );
}
