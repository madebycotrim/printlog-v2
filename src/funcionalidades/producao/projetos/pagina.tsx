import { Plus } from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";

export function PaginaProjetos() {
  usarDefinirCabecalho({
    titulo: "Meus Projetos",
    subtitulo: "Gerencie seus orçamentos e pedidos",
    placeholderBusca: "BUSCAR PROJETO...",
    acao: {
      texto: "Novo Projeto",
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
