import { useState, useEffect } from "react";
import { History, Wrench, Clock, DollarSign, PenTool } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Impressora, RegistroManutencao } from "@/funcionalidades/producao/impressoras/tipos";

interface ModalHistoricoManutencaoProps {
    aberto: boolean;
    aoFechar: () => void;
    impressora: Impressora | null;
}

export function ModalHistoricoManutencao({
    aberto,
    aoFechar,
    impressora,
}: ModalHistoricoManutencaoProps) {
    const [registros, definirRegistros] = useState<RegistroManutencao[]>([]);

    useEffect(() => {
        if (aberto && impressora) {
            definirRegistros(impressora.historicoManutencao || []);
        } else {
            definirRegistros([]);
        }
    }, [aberto, impressora]);

    if (!impressora) return null;

    const horasUsadas = impressora.horimetroTotal || 0;
    const intervalo = impressora.intervaloRevisao || 300;
    const porcentagemRevisao = Math.min(100, (horasUsadas % intervalo) / intervalo * 100);
    const horasRestantes = Math.max(0, intervalo - (horasUsadas % intervalo));

    const totalGastoManutencao = registros.reduce(
        (acc, curr) => acc + (curr.custo || 0),
        0
    );

    const corPorTipo = (tipo: string) => {
        switch (tipo) {
            case "Preventiva": return "bg-sky-500 text-sky-50";
            case "Corretiva": return "bg-red-500 text-red-50";
            case "Melhoria": return "bg-emerald-500 text-emerald-50";
            default: return "bg-gray-400 text-white";
        }
    };

    return (
        <Dialogo
            aberto={aberto}
            aoFechar={aoFechar}
            titulo="Histórico de Manutenções"
            larguraMax="max-w-2xl"
        >
            <div className="flex flex-col h-[600px] max-h-[80vh] bg-white dark:bg-[#18181b]">
                {/* Cabeçalho da Impressora */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-900/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#0d0d0f] border border-white/5 shadow-sm overflow-hidden flex-shrink-0">
                            {impressora.imagemUrl ? (
                                <img src={impressora.imagemUrl} alt={impressora.nome} className="w-[85%] h-[85%] object-contain" />
                            ) : (
                                <Wrench size={24} className="text-zinc-600" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">
                                {impressora.nome}
                            </h3>
                            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 truncate">
                                {impressora.marca || impressora.tecnologia} • {impressora.modeloBase}
                            </p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest block mb-1">
                                Próxima Revisão
                            </span>
                            <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                                Em {horasRestantes}h
                            </span>
                        </div>
                    </div>

                    {/* Mini Dashboard do Histórico */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-gray-200 dark:border-white/5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                    <Clock size={16} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest block">
                                        Horímetro Total
                                    </span>
                                    <span className="text-base font-black text-gray-900 dark:text-white leading-none">
                                        {horasUsadas}h
                                    </span>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mt-3">
                                <div
                                    className="h-full rounded-full bg-orange-500"
                                    style={{ width: `${porcentagemRevisao}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-gray-200 dark:border-white/5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                <DollarSign size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest block text-ellipsis whitespace-nowrap overflow-hidden">
                                    Custo de Manutenção
                                </span>
                                <span className="text-lg font-black text-gray-900 dark:text-white">
                                    R$ {totalGastoManutencao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Registros */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                        <History size={14} className="text-gray-400" />
                        Histórico de Intervenções
                    </h4>

                    {registros.length === 0 ? (
                        <div className="text-center py-10 flex flex-col items-center gap-3 text-gray-400 dark:text-zinc-600">
                            <PenTool size={32} className="opacity-50" />
                            <p className="text-sm font-medium">Nenhuma manutenção registrada até o momento.</p>
                        </div>
                    ) : (
                        registros.map((registro) => {
                            return (
                                <div
                                    key={registro.id}
                                    className="relative pl-6 pb-6 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[2px] before:bg-gray-100 dark:before:bg-white/5 last:before:hidden group"
                                >
                                    <div
                                        className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white dark:border-[#0c0c0e] flex items-center justify-center ${corPorTipo(registro.tipo)}`}
                                    />

                                    <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 rounded-xl p-4 transition-colors group-hover:border-gray-300 dark:group-hover:border-white/10 ml-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h5 className="text-sm font-black text-gray-900 dark:text-white break-words">
                                                        {registro.descricao}
                                                    </h5>
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${registro.tipo === "Corretiva" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" :
                                                        registro.tipo === "Preventiva" ? "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400" :
                                                            "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                                        }`}>
                                                        {registro.tipo}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 block pb-2 border-b border-gray-200 dark:border-white/10 w-fit">
                                                    {new Date(registro.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                                <div className="flex flex-col gap-1.5 pt-2">
                                                    <div className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
                                                        <span className="text-gray-400 dark:text-zinc-600 font-medium">Marcador:</span> {registro.horasMaquinaNoMomento ? `${registro.horasMaquinaNoMomento}h` : "N/A"}
                                                    </div>
                                                    {registro.pecasTrocadas && (
                                                        <div className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
                                                            <span className="text-gray-400 dark:text-zinc-600 font-medium">Peças:</span> {registro.pecasTrocadas}
                                                        </div>
                                                    )}
                                                    {registro.responsavel && (
                                                        <div className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
                                                            <span className="text-gray-400 dark:text-zinc-600 font-medium">Responsável:</span> {registro.responsavel}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center sm:items-end flex-col justify-center sm:justify-start bg-white dark:bg-[#18181b] sm:bg-transparent px-3 py-2 sm:p-0 rounded-lg sm:rounded-none border sm:border-transparent border-gray-200 dark:border-white/5 shrink-0">
                                                <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
                                                    Custo da Intervenção
                                                </span>
                                                <span className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                                                    R$ {registro.custo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }).reverse() // Mostra o mais recente no topo se for list array. Push adiciona no fim.
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-white/5 flex justify-center bg-gray-50/50 dark:bg-[#0e0e11]/50 rounded-br-xl">
                    <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500">
                        O histórico contabiliza vida útil e estimativas de Custo e ROI.
                    </span>
                </div>
            </div>
        </Dialogo>
    );
}
