import { Plus } from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";

export function PaginaInsumos() {
  usarDefinirCabecalho({
    titulo: "Meus Insumos",
    subtitulo: "Gerencie peças e outros materiais",
    placeholderBusca: "BUSCAR INSUMO...",
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
