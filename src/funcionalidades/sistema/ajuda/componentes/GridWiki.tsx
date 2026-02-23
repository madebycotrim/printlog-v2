import { Book, ArrowUpRight, Sparkles } from "lucide-react";

interface InterfaceTopico {
    id: string;
    titulo: string;
    conteudo: string;
    nivel: string;
    atualizado: string;
    gcode?: string;
    categoria?: string;
    cor?: string;
    level?: string;
}

interface InterfaceCategoria {
    id: string;
    titulo: string;
    subtitulo: string;
    icone: any;
    corPaleta: string;
    cor: string;
    fundo: string;
    topicos: InterfaceTopico[];
}

interface Propriedades {
    categorias: InterfaceCategoria[];
    aoSelecionarTopico: (topico: InterfaceTopico) => void;
}

export function GridWiki({ categorias, aoSelecionarTopico }: Propriedades) {
    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {categorias.map((categoria) => (
                    <div
                        key={categoria.id}
                        className="group relative bg-white dark:bg-card-fundo rounded-[40px] border border-gray-100 dark:border-white/[0.04] p-1.5 shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden"
                    >
                        {/* Brilho de Fundo Dinâmico */}
                        <div className={`absolute top-0 right-0 w-64 h-64 ${categoria.cor.replace('text', 'bg').replace('-500', '-505')}/5 blur-[100px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />

                        <div className="flex flex-col md:flex-row h-full relative z-10">
                            {/* LADO A: IDENTIDADE DA CATEGORIA */}
                            <div className={`w-full md:w-56 p-6 flex flex-col justify-between relative overflow-hidden ${categoria.fundo} rounded-[36px] m-1`}>
                                <div className="relative z-10">
                                    <div className={`w-16 h-16 rounded-[22px] bg-white dark:bg-card-fundo shadow-xl flex items-center justify-center ${categoria.cor} mb-8 transform group-hover:scale-110 transition-transform duration-500`}>
                                        <categoria.icone size={32} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={10} className={`${categoria.cor} opacity-50`} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 block">MÓDULO {categoria.id}</span>
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-[0.9] break-words text-gray-900 dark:text-white">
                                        {categoria.titulo}
                                    </h3>
                                </div>

                                <div className="mt-8 relative z-10">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-relaxed text-gray-600 dark:text-zinc-400">
                                        {categoria.subtitulo}
                                    </p>
                                </div>
                            </div>

                            {/* LADO B: LISTAGEM TÉCNICA */}
                            <div className="flex-1 p-4 md:p-6 lg:p-8">
                                <div className="space-y-3">
                                    {categoria.topicos.map(topico => (
                                        <button
                                            key={topico.id}
                                            aria-label={`Ver detalhes de ${topico.titulo}`}
                                            onClick={() => aoSelecionarTopico({ ...topico, categoria: categoria.titulo, cor: categoria.cor })}
                                            className="w-full flex items-center justify-between p-5 rounded-[24px] bg-gray-50/50 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.04] border border-transparent hover:border-gray-100 dark:hover:border-white/5 transition-all group/item shadow-sm hover:shadow-lg transform hover:-translate-y-0.5"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-1.5 h-8 rounded-full ${categoria.cor.replace('text', 'bg')} opacity-10 group-hover/item:opacity-100 transition-all duration-500`} />
                                                <div className="text-left">
                                                    <span className="text-[13px] font-black text-gray-800 dark:text-zinc-100 block tracking-tight leading-none mb-1">
                                                        {topico.titulo}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-widest block">
                                                        {topico.level || topico.nivel} • {topico.atualizado}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all duration-300 bg-current/5 ${categoria.cor}`}>
                                                <ArrowUpRight size={18} strokeWidth={3} />
                                            </div>
                                        </button>
                                    ))}

                                    {categoria.topicos.length === 0 && (
                                        <div className="py-20 text-center opacity-20 select-none">
                                            <Book size={40} className="mx-auto mb-4" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Repositório Vazio</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
