import { Menu, Search } from 'lucide-react';
import { usarCabecalho } from '@/compartilhado/contextos/ContextoCabecalho';

type PropriedadesCabecalho = {
    aoAbrirBarraLateral: () => void;
};

export function Cabecalho({ aoAbrirBarraLateral }: PropriedadesCabecalho) {
    const { dados } = usarCabecalho();

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between px-12 h-24 transition-all duration-300">
            {/* Esquerda: Menu Mobile + Título Dinâmico */}
            <div className="flex items-center gap-12 flex-1">
                <button
                    onClick={aoAbrirBarraLateral}
                    className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                    <Menu size={20} />
                </button>

                {/* Design solicitado: Barra Blue + Título + Subtítulo */}
                <div className="flex items-center gap-6">
                    <div className="hidden md:block w-1 h-8 bg-gradient-to-b from-sky-500 to-blue-600 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.3)]"></div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                            {dados.titulo}
                        </h1>
                        <p className="hidden md:block text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wider">
                            {dados.subtitulo}
                        </p>
                    </div>
                </div>
            </div>


            {/* Direita: Busca (se houver) + Ações */}
            <div className="flex items-center gap-10">

                {/* Input de Busca Dinâmico */}
                {dados.placeholderBusca && (
                    <div className="relative group w-full max-w-xs hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={dados.placeholderBusca}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-zinc-900/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm font-medium placeholder:text-gray-400 shadow-sm"
                        />
                    </div>
                )}

                {/* Ação Padronizada (Prioridade) */}
                {dados.acao && (
                    <div className="hidden md:block">
                        <button
                            onClick={dados.acao.aoClicar}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg font-bold transition-all shadow-sm text-xs uppercase tracking-wider whitespace-nowrap"
                        >
                            {dados.acao.icone && <dados.acao.icone size={16} />}
                            {dados.acao.texto}
                        </button>
                    </div>
                )}

                {/* Fallback para elementos customizados (Legado ou Específico) */}
                {!dados.acao && dados.elementoAcao && (
                    <div className="hidden md:block">
                        {dados.elementoAcao}
                    </div>
                )}
            </div>
        </header>

    );
}
