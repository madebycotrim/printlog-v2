import { Plus, Users, Search } from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarGerenciadorClientes } from "./ganchos/usarGerenciadorClientes";
import { CardCliente } from "./componentes/CardCliente";
import { FormularioCliente } from "./componentes/FormularioCliente";
import { ResumoClientes } from "./componentes/ResumoClientes";
import { FiltrosCliente } from "./componentes/FiltrosCliente";
import { ModalRemocaoCliente } from "./componentes/ModalRemocaoCliente";
import { ModalHistoricoCliente } from "./componentes/ModalHistoricoCliente";
import { motion, AnimatePresence } from "framer-motion";

export function PaginaClientes() {
  const { estado, acoes } = usarGerenciadorClientes();

  usarDefinirCabecalho({
    titulo: "Meus Clientes",
    subtitulo: "Gestão comercial e relacionamento",
    placeholderBusca: "Buscar por nome ou e-mail...",
    acao: {
      texto: "Novo Cliente",
      icone: Plus,
      aoClicar: () => acoes.abrirEditar(),
    },
    aoBuscar: acoes.pesquisar,
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-8"
      >
        {estado.clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center mt-4 h-[60vh]">
            <div className="text-gray-300 dark:text-zinc-700 mb-6">
              <Users size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              Nenhum cliente encontrado
            </h3>
            <p className="text-gray-500 dark:text-zinc-400 max-w-sm mx-auto mb-8 text-sm">
              Adicione o seu primeiro cliente para iniciar a gestão comercial e de orçamentos.
            </p>
            <button
              onClick={() => acoes.abrirEditar()}
              style={{ backgroundColor: "var(--cor-primaria)" }}
              className="hover:brightness-110 text-white font-semibold py-2.5 px-6 rounded-full shadow-lg shadow-sky-500/10 transition-transform active:scale-95"
            >
              Cadastrar Cliente
            </button>
          </div>
        ) : (
          <>
            <ResumoClientes clientes={estado.clientes} />

            <div className="mt-8">
              <FiltrosCliente
                ordenacaoAtual={estado.ordenacao}
                aoOrdenar={acoes.ordenarPor}
                ordemInvertida={estado.ordemInvertida}
                aoInverterOrdem={acoes.inverterOrdem}
              />
            </div>

            {estado.clientesFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search size={36} strokeWidth={1.5} className="text-zinc-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-base font-black text-zinc-900 dark:text-white mb-1 uppercase tracking-tight">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                  Tente buscar com termos diferentes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {estado.clientesFiltrados.map((cliente) => (
                    <CardCliente
                      key={cliente.id}
                      cliente={cliente}
                      aoEditar={acoes.abrirEditar}
                      aoRemover={acoes.abrirRemover}
                      aoVerHistorico={acoes.abrirHistorico}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </motion.div>

      <FormularioCliente
        aberto={estado.modalAberto}
        clienteEditando={estado.clienteSendoEditado}
        aoCancelar={acoes.fecharEditar}
        aoSalvar={acoes.salvarCliente}
      />

      <ModalRemocaoCliente
        aberto={estado.modalRemoverAberto}
        cliente={estado.clienteSendoRemovido}
        aoFechar={acoes.fecharRemover}
        aoConfirmar={() => estado.clienteSendoRemovido && acoes.removerCliente(estado.clienteSendoRemovido.id)}
      />

      <ModalHistoricoCliente
        aberto={estado.modalHistoricoAberto}
        cliente={estado.clienteSendoHistorico}
        aoFechar={acoes.fecharHistorico}
      />
    </>
  );
}
