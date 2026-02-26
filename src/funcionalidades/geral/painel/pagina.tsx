import {
  Activity,
  Box,
  CreditCard,
  Package,
  Printer,
  Zap,
  TrendingUp,
  Clock,
  LayoutDashboard,
  Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarBeta } from "@/compartilhado/contextos/ContextoBeta";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { usarArmazemFinanceiro } from "@/funcionalidades/comercial/financeiro/estado/armazemFinanceiro";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";
import { ALERTA_ESTOQUE_FILAMENTO_GRAMAS } from "@/compartilhado/constantes/constantesNegocio";

// Componentes Separados
import { AtalhoItem } from "./componentes/AtalhoItem";
import { GraficoConsumo } from "./componentes/GraficoConsumo";
import { StatusTempoReal } from "./componentes/StatusTempoReal";
import { AgendaManutencao } from "./componentes/AgendaManutencao";
import { RelatorioInventario } from "./componentes/RelatorioInventario";
import { RelatorioDesperdicio } from "./componentes/RelatorioDesperdicio";
import { ResumoBI } from "@/funcionalidades/beta/relatorios_ia/componentes/ResumoBI";
import { RelatorioPerformanceOperacional } from "./componentes/RelatorioPerformanceOperacional";
import { FronteiraErroBeta } from "@/compartilhado/componentes/FronteiraErroBeta";
import { CardResumo } from "@/compartilhado/componentes/CardResumo";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { servicoRelatorios } from "@/compartilhado/servicos/servicoRelatorios";
import { BarChart, PieChart, FileText, History as HistoryIcon } from "lucide-react";
import { servicoExportacao } from "@/compartilhado/servicos/servicoExportacao";

export function PaginaInicial() {
  const { usuario } = usarAutenticacao();
  const { pedidos } = usarPedidos();
  const { betaRelatorios } = usarBeta();
  const navegar = useNavigate();

  // 🏪 ACESSO AO ESTADO
  const materiais = usarArmazemMateriais((s) => s.materiais);
  const impressoras = usarArmazemImpressoras((s) => s.impressoras);
  const insumos = usarArmazemInsumos((s) => s.insumos);
  const lancamentos = usarArmazemFinanceiro((s) => s.lancamentos);

  // 🧮 CÁLCULOS DE KPI
  const totaisPecas = insumos.reduce((acc, i) => acc + i.quantidadeAtual, 0);
  const maquinasAtivas = impressoras.filter((i) => !i.dataAposentadoria).length;
  // Regra v9.0: Threshold fixo de 200g importado de constantesNegocio.ts
  const alertaMateriais = materiais.filter((m) => m.pesoRestanteGramas < ALERTA_ESTOQUE_FILAMENTO_GRAMAS).length;
  const pedidosAtivos = pedidos.filter(
    (p) => p.status !== StatusPedido.CONCLUIDO && p.status !== StatusPedido.ARQUIVADO,
  ).length;

  const metricas = useMemo(() => servicoRelatorios.gerarMetricasProducao(pedidos), [pedidos]);

  usarDefinirCabecalho({
    titulo: `Olá, ${usuario?.ehAnonimo ? "Maker" : usuario?.nome?.split(" ")[0] || "Maker"}! 👋`,
    subtitulo: "Seu centro de comando PrintLog está pronto para operar.",
    placeholderBusca: "PESQUISAR EM TODA A PLATAFORMA...",
  });

  const conteinerAnimacao = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="space-y-12">
      {/* 🚀 ATALHOS RÁPIDOS E AÇÕES PRIORITÁRIAS */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-amber-500 fill-amber-500" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">
            Acesso Prioritário
          </h2>
        </div>

        <motion.div
          variants={conteinerAnimacao}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AtalhoItem
            titulo="Inciar Produção"
            subtitulo="Novos fatiamentos"
            icone={Zap}
            cor="bg-amber-500"
            link="/projetos"
          />
          <AtalhoItem
            titulo="Repor Filamentos"
            subtitulo="Entrada de estoque"
            icone={Package}
            cor="bg-emerald-500"
            link="/materiais"
          />
          <AtalhoItem
            titulo="Check-up Técnico"
            subtitulo="Gestão de máquinas"
            icone={Activity}
            cor="bg-sky-500"
            link="/impressoras"
          />
          <AtalhoItem
            titulo="Gestão Financeira"
            subtitulo="Relatórios de DRE"
            icone={CreditCard}
            cor="bg-indigo-500"
            link="/financeiro"
          />
        </motion.div>
      </section>

      {/* 📊 INDICADORES DE DESEMPENHO (KPIs) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp size={18} className="text-indigo-500" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">
            Performance & Métricas
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardResumo titulo="Produção Ativa" valor={pedidosAtivos} unidade="pedidos" icone={Clock} cor="sky" />
          <CardResumo
            titulo="Capacidade Operacional"
            valor={maquinasAtivas}
            unidade="máquinas"
            icone={Printer}
            cor="emerald"
          />
          <CardResumo
            titulo="Insumos em Alerta"
            valor={alertaMateriais}
            unidade="crítico"
            icone={Box}
            cor="rose"
            aoClicar={() => navegar("/materiais")}
            textoAcao="Verificar"
          />
          <CardResumo titulo="Total de Insumos" valor={totaisPecas} unidade="unidades" icone={Package} cor="indigo" />
        </div>
      </section>

      {/* 🧠 INTELIGÊNCIA COMERCIAL & RENTABILIDADE (DRE & BI) */}
      {betaRelatorios && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Activity size={18} className="text-indigo-500" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">
              Inteligência Comercial & BI
            </h2>
          </div>

          <FronteiraErroBeta nomeFuncionalidade="Inteligência Comercial & BI">
            <ResumoBI pedidos={pedidos} materiais={materiais} lancamentos={lancamentos} />
          </FronteiraErroBeta>
        </section>
      )}

      {/* 📈 VISTA OPERACIONAL (GRÁFICOS E STATUS) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={18} className="text-gray-400" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">
            Vista Operacional
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <GraficoConsumo />
          </div>
          <div>
            <StatusTempoReal />
          </div>
        </div>
      </section>

      {/* 🛠️ MANUTENÇÃO E OPERAÇÕES CRÍTICAS */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Wrench size={18} className="text-rose-500" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">
            Saúde & Manutenção do Parque
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <AgendaManutencao impressoras={impressoras} />
          </div>

          <RelatorioPerformanceOperacional impressoras={impressoras} pedidos={pedidos} />

          <div className="lg:col-span-1">
            <RelatorioInventario materiais={materiais} insumos={insumos} />
          </div>
        </div>
      </section>

      {/* 🧾 RELATÓRIOS AUTOMÁTICOS (FASE 2) */}
      <section className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-sky-500" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">
              Relatórios Automáticos
            </h2>
          </div>
          <span className="text-[10px] font-black bg-sky-500/10 text-sky-500 px-3 py-1 rounded-full uppercase tracking-widest">
            Fase 2: Inteligência Operacional
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <RelatorioDesperdicio materiais={materiais} insumos={insumos} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              onClick={() => navegar("/producao/historico")}
              className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm space-y-6 flex flex-col justify-center cursor-pointer hover:border-sky-500/30 transition-all group"
            >
              <div className="flex items-center justify-between text-gray-400">
                <div className="flex items-center gap-3">
                  <BarChart size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Eficiência de Entrega</span>
                </div>
                <HistoryIcon size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-sky-500" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-black">{metricas.eficienciaPercentual}%</span>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">
                    Score Saudável
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metricas.eficienciaPercentual}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm space-y-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-gray-400">
                <PieChart size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Volume de Insumos</span>
              </div>
              <div className="space-y-1">
                <span className="text-4xl font-black">{metricas.mediaGramasPorPedido}g</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Média prevista por projeto
                </p>
              </div>
            </div>

            <div className="md:col-span-2 p-8 rounded-[2rem] bg-zinc-900 border border-white/5 shadow-xl flex items-center justify-between group overflow-hidden relative">
              <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
                <FileText size={160} strokeWidth={4} />
              </div>
              <div className="space-y-4 relative z-10 max-w-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sky-500" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-sky-400">
                    Exportação LGPD (Art. 18)
                  </h4>
                </div>
                <p className="text-[12px] font-medium text-gray-400 leading-relaxed">
                  Relatório consolidado de dados pessoais e portabilidade para o titular da conta.
                </p>
              </div>
              <button
                onClick={() =>
                  servicoExportacao.gerarRelatorioPortabilidade(
                    usuario || { nome: "Maker Anônimo", email: "anonimo@printlog.com.br", id: "anon" },
                    pedidos,
                  )
                }
                className="relative z-10 px-8 py-4 bg-white hover:bg-sky-400 text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all active:scale-95 shadow-lg"
              >
                Gerar Portabilidade
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
