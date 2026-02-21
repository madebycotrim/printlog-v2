import { Menu, Search } from "lucide-react";
import { usarCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";

type PropriedadesCabecalho = {
  aoAbrirBarraLateral: () => void;
};

export function Cabecalho({ aoAbrirBarraLateral }: PropriedadesCabecalho) {
  const { dados } = usarCabecalho();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-12 h-20 md:h-24 bg-white/80 dark:bg-[#0e0e11]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 transition-all duration-300">
      {/* Esquerda: Menu Mobile + TÃ­tulo */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={aoAbrirBarraLateral}
          className="md:hidden p-2 -ml-2 text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu size={24} strokeWidth={2} />
        </button>

        {/* Aesthetic: Minimalista. Sem barras glowing, apenas tipografia marcante. */}
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl md:text-[28px] font-black tracking-tight text-gray-900 dark:text-white truncate">
              {dados.titulo}
            </h1>
            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-sky-500 mb-2 shrink-0"></div>
          </div>
          {dados.subtitulo && (
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-500 hidden md:block truncate mt-0.5">
              {dados.subtitulo}
            </p>
          )}
        </div>
      </div>

      {/* Direita: Busca + AÃ§Ãµes */}
      <div className="flex items-center gap-4 md:gap-8 justify-end flex-wrap sm:flex-nowrap">
        {/* Input de Busca - Linha Sempre VisÃ­vel & AdaptÃ¡vel */}
        <div className="relative group w-auto md:w-64 max-w-[280px]">
          <Search
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 transition-colors pointer-events-none"
            size={18}
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder={dados.placeholderBusca || "Pesquisar..."}
            className="w-full h-10 pl-8 pr-2 bg-transparent border-b-2 border-gray-200 dark:border-white/10 focus:border-sky-500 dark:focus:border-sky-500 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 outline-none transition-all"
          />
        </div>

        {/* AÃ§Ã£o Padronizada - Minimalista e Tamanho AdaptÃ¡vel */}
        {dados.acao && (
          <button
            onClick={dados.acao.aoClicar}
            className="flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-gray-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-bold text-xs md:text-sm hover:bg-black dark:hover:bg-gray-100 active:scale-95 transition-all duration-200 shadow-sm shrink-0"
          >
            {dados.acao.icone && (
              <dados.acao.icone
                size={16}
                strokeWidth={2.5}
                className="md:w-[18px] md:h-[18px]"
              />
            )}
            <span className="hidden sm:inline">{dados.acao.texto}</span>
            <span className="sm:hidden">
              {dados.acao.texto.split(" ")[0]}
            </span>{" "}
            {/* No mobile, tenta usar apenas a primeira palavra */}
          </button>
        )}

        {/* Fallback para elementos customizados (Legado) */}
        {!dados.acao && dados.elementoAcao && (
          <div className="flex items-center">{dados.elementoAcao}</div>
        )}
      </div>
    </header>
  );
}
