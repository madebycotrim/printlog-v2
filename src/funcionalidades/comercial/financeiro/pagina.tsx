import { Plus, ReceiptText, Search } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { ResumoFinanceiroComponente } from "./componentes/ResumoFinanceiro";
import { TabelaLancamentos } from "./componentes/TabelaLancamentos";
import { FormularioLancamento } from "./componentes/FormularioLancamento";
import { FiltrosFinanceiro } from "./componentes/FiltrosFinanceiro";
import { EstadoVazio } from "@/compartilhado/componentes_ui/EstadoVazio";
import { usarFinanceiro } from "./ganchos/usarFinanceiro";
import { Carregamento } from "@/compartilhado/componentes_ui/Carregamento";

export function PaginaFinanceiro() {
  const [modalAberto, setModalAberto] = useState(false);
  const {
    lancamentos,
    lancamentosFiltrados,
    resumo,
    carregando,
    adicionarLancamento,
    filtroTipo,
    ordenacao,
    ordemInvertida,
    definirFiltroTipo,
    ordenarPor,
    inverterOrdem,
    pesquisar
  } = usarFinanceiro();

  usarDefinirCabecalho({
    titulo: "Financeiro",
    subtitulo: "Gestão de fluxo de caixa e rendimentos",
    placeholderBusca: "Buscar lançamentos (Ex: nome, valor, data, etc.)",
    aoBuscar: pesquisar,
    acao: {
      texto: "Nova Transação",
      icone: Plus,
      aoClicar: () => setModalAberto(true),
    },
  });

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-8"
      >
        {carregando && lancamentos.length > 0 ? (
          <Carregamento tipo="pulse" texto="Sincronizando Lançamentos" />
        ) : lancamentos.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum lançamento registrado"
            descricao="Registre suas entradas e saídas para ter um controle financeiro completo do seu estúdio."
            icone={ReceiptText}
            textoBotao="Novo Lançamento"
            aoClicarBotao={() => setModalAberto(true)}
          />
        ) : (
          <>
            <ResumoFinanceiroComponente resumo={resumo} />

            <FiltrosFinanceiro
              tipoAtivo={filtroTipo}
              aoMudarTipo={definirFiltroTipo}
              ordenacaoAtual={ordenacao}
              aoOrdenar={ordenarPor}
              ordemInvertida={ordemInvertida}
              aoInverterOrdem={inverterOrdem}
            />

            {lancamentosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-zinc-100 dark:bg-white/5 rounded-full scale-150 blur-2xl opacity-50" />
                  <Search size={48} strokeWidth={1} className="text-zinc-300 dark:text-zinc-700 relative z-10" />
                </div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-tight">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 italic max-w-xs">
                  Não encontramos transações para os filtros aplicados. Tente ajustar os termos ou categorias.
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${filtroTipo}-${ordenacao}-${ordemInvertida}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabelaLancamentos lancamentos={lancamentosFiltrados} />
                </motion.div>
              </AnimatePresence>
            )}
          </>
        )}
      </motion.div>

      <FormularioLancamento
        aberto={modalAberto}
        aoCancelar={() => setModalAberto(false)}
        aoSalvar={adicionarLancamento}
      />
    </div>
  );
}
