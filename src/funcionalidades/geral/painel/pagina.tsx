import {
  Activity,
  Box,
  CreditCard,
  Layers,
  Package,
  Printer,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contexto/ContextoAutenticacao";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";

// Componentes Separados
import { AtalhoItem } from "./componentes/AtalhoItem";
import { KPICard } from "./componentes/KPICard";
import { GraficoConsumo } from "./componentes/GraficoConsumo";
import { StatusTempoReal } from "./componentes/StatusTempoReal";

export function PaginaInicial() {
  const { usuario } = usarAutenticacao();

  // 🏪 ACESSO AO ESTADO
  const materiais = usarArmazemMateriais(s => s.materiais);
  const impressoras = usarArmazemImpressoras(s => s.impressoras);
  const insumos = usarArmazemInsumos(s => s.insumos);

  // 🧮 CÁLCULOS DE KPI
  const totaisPecas = insumos.reduce((acc, i) => acc + i.quantidadeAtual, 0);
  const maquinasAtivas = impressoras.filter(i => i.status !== "Aposentada").length;
  const alertaMateriais = materiais.filter(m => (m.pesoRestante / m.peso) < 0.2).length;

  usarDefinirCabecalho({
    titulo: `Olá, ${usuario?.ehAnonimo ? "Convidado" : usuario?.nome?.split(" ")[0] || "Maker"}! 👋`,
    subtitulo: "Bem-vindo ao seu centro de comando PrintLog",
    placeholderBusca: "Pesquisar no sistema...",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-10"
    >
      {/* 🚀 ATALHOS RÁPIDOS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AtalhoItem
          titulo="Nova Impressão"
          icone={Zap}
          cor="bg-amber-500"
          link="/projetos"
        />
        <AtalhoItem
          titulo="Repor Estoque"
          icone={Package}
          cor="bg-blue-500"
          link="/materiais"
        />
        <AtalhoItem
          titulo="Manutenção"
          icone={Activity}
          cor="bg-rose-500"
          link="/impressoras"
        />
        <AtalhoItem
          titulo="Relatórios"
          icone={Layers}
          cor="bg-indigo-500"
          link="/financeiro"
        />
      </section>

      {/* 📊 GRID DE KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          titulo="Máquinas Ativas"
          valor={maquinasAtivas}
          subteste="De 12 slots ocupados"
          icone={Printer}
          cor="text-emerald-500"
        />
        <KPICard
          titulo="Materiais em Alerta"
          valor={alertaMateriais}
          subteste="Abaixo de 20% de peso"
          icone={Box}
          cor="text-rose-500"
        />
        <KPICard
          titulo="Total em Estoque"
          valor={totaisPecas}
          subteste="Insumos e peças de apoio"
          icone={Package}
          cor="text-blue-500"
        />
        <KPICard
          titulo="Gasto Estimado"
          valor="R$ 1.240"
          subteste="Nos últimos 30 dias"
          icone={CreditCard}
          cor="text-indigo-500"
        />
      </section>

      {/* 📈 ÁREA DE GRÁFICO E RECENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GraficoConsumo />
        <StatusTempoReal />
      </div>
    </motion.div>
  );
}
