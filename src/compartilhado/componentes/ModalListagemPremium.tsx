import { LucideIcon, Search, X } from "lucide-react";
import { ReactNode } from "react";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { EstadoVazio } from "@/compartilhado/componentes/EstadoVazio";

interface PropriedadesModalListagemPremium {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  iconeTitulo?: LucideIcon;
  corDestaque?: "indigo" | "rose" | "emerald" | "sky" | "amber" | "violet" | "zinc";

  // Busca
  termoBusca: string;
  aoMudarBusca: (valor: string) => void;
  placeholderBusca?: string;

  // Conteúdo
  children: ReactNode;
  temResultados: boolean;
  totalResultados: number;
  mensagemVazio?: string;
  iconeVazio?: LucideIcon;

  // Rodapé
  infoRodape?: string;
  loading?: boolean;
}

/**
 * 🏛️ ModalListagemPremium - Padrão de Interface v9.0
 * Unifica a experiência de visualização de arquivos, históricos e grandes listagens.
 */
export function ModalListagemPremium({
  aberto,
  aoFechar,
  titulo,
  iconeTitulo: IconeTitulo,
  corDestaque = "sky",
  termoBusca,
  aoMudarBusca,
  placeholderBusca = "PESQUISAR...",
  children,
  temResultados,
  totalResultados,
  mensagemVazio = "Nenhum resultado encontrado.",
  iconeVazio,
  infoRodape,
  loading = false,
}: PropriedadesModalListagemPremium) {
  const mapasCores = {
    indigo: "rose-500", // Fallback para rose em destaque se necessário
    rose: "rose-500",
    emerald: "emerald-500",
    sky: "sky-500",
    amber: "amber-500",
    violet: "violet-500",
    zinc: "zinc-500",
  };

  const corHex = mapasCores[corDestaque] || "sky-500";

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} titulo={titulo} larguraMax="max-w-7xl">
      <div className="flex flex-col h-[85vh] bg-white dark:bg-[#18181b]">
        {/* 🔍 Barra de Busca Superior */}
        <div
          className={`px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-${corDestaque}-50/30 dark:bg-${corDestaque}-500/[0.02] backdrop-blur-sm sticky top-0 z-20`}
        >
          <div className="relative group">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-${corHex} transition-colors`}
              size={18}
            />
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => aoMudarBusca(e.target.value)}
              placeholder={placeholderBusca}
              className={`w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-white/5 border border-transparent focus:border-${corHex}/30 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none transition-all`}
            />
            {termoBusca && (
              <button
                onClick={() => aoMudarBusca("")}
                className={`absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-${corHex} transition-colors`}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* 📦 Área de Conteúdo */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/5">
          {!temResultados && !loading ? (
            <EstadoVazio titulo="Sem resultados" descricao={mensagemVazio} icone={iconeVazio || Search} />
          ) : (
            children
          )}
        </div>

        {/* 📑 Rodapé Informativo */}
        <div
          className={`px-8 py-4 border-t border-gray-100 dark:border-white/5 bg-${corDestaque}-50/20 dark:bg-${corDestaque}-500/[0.01] flex items-center justify-between`}
        >
          <div className="flex items-center gap-2">
            {IconeTitulo && <IconeTitulo size={14} className={`text-${corHex}`} />}
            <span className={`text-[10px] font-black text-${corHex} uppercase tracking-widest`}>
              {totalResultados} {totalResultados === 1 ? "item encontrado" : "itens encontrados"}
            </span>
          </div>
          {infoRodape && <p className="text-[10px] font-medium text-zinc-400 italic">{infoRodape}</p>}
        </div>
      </div>
    </Dialogo>
  );
}
