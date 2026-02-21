import { usarAutenticacao } from "@/funcionalidades/autenticacao/contexto/ContextoAutenticacao";
import { Plus } from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";

export function PaginaInicial() {
  const { usuario } = usarAutenticacao();

  usarDefinirCabecalho({
    titulo: `Olá, ${usuario?.nome?.split(" ")[0] || "Maker"}! 👋`,
    subtitulo: "Bem-vindo ao seu painel de controle",
    placeholderBusca: "BUSCAR NO PAINEL...",
    acao: {
      texto: "Novo",
      icone: Plus,
      aoClicar: () => {},
    },
  });

  return (
    <div className="md:px-4 md:py-8 p-4 animate-in fade-in duration-500">
      {/* Página vazia aguardando implementação */}
    </div>
  );
}
