import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import {
    Printer,
    Zap,
    DollarSign,
    Wrench,
    Clock,
    FileText,
    Edit2,
    Box,
    X,
    Activity,
} from "lucide-react";
import { useState, useEffect } from "react";

interface ModalDetalhesImpressoraProps {
    impressora: Impressora | null;
    aberto: boolean;
    aoFechar: () => void;
    aoSalvarObservacoes?: (id: string, observacoes: string) => void;
}

export function ModalDetalhesImpressora({ impressora, aberto, aoFechar, aoSalvarObservacoes }: ModalDetalhesImpressoraProps) {
    const [editandoObs, setEditandoObs] = useState(false);
    const [obsTexto, setObsTexto] = useState("");

    // Sincronizar estado local quando abrir modal
    useEffect(() => {
        if (impressora) {
            setObsTexto(impressora.observacoes || "");
            setEditandoObs(false);
        }
    }, [impressora, aberto]);
    if (!impressora) return null;

    const isOperacional = impressora.status === "Operacional";
    const isManutencao = impressora.status === "Em Manutenção";

    const statusCor = isOperacional
        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        : isManutencao
            ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
            : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";

    const barraCor = isOperacional ? "#10b981" : isManutencao ? "#f59e0b" : "#3f3f46";

    const subtitulo = [impressora.marca, impressora.modeloBase]
        .filter(Boolean).join(" • ") || impressora.tecnologia;

    const horasUsadas = impressora.horimetroTotal || 0;
    const intervalo = impressora.intervaloRevisao || 300;
    const porcentagemRevisao = Math.min(100, (horasUsadas % intervalo) / intervalo * 100);
    const horasRestantes = Math.max(0, intervalo - (horasUsadas % intervalo));

    // Lógica do ROI (Retorno sobre Investimento)
    const valorCompra = impressora.valorCompra || 0;

    // Estimativa por hora trabalhada vinda do cadastro da máquina (fallback 15BRL para antigas)
    const taxaHoraEstimada = impressora.taxaHora ?? 15;
    const valorGeradoEstimado = horasUsadas * taxaHoraEstimada;

    // A meta é o valor de compra.
    const porcentagemRoi = valorCompra > 0
        ? Math.min(100, (valorGeradoEstimado / valorCompra) * 100)
        : 0;

    const lidarSalvarObs = () => {
        if (aoSalvarObservacoes && impressora) {
            aoSalvarObservacoes(impressora.id, obsTexto);
        }
        setEditandoObs(false);
    };

    return (
        <Dialogo aberto={aberto} aoFechar={aoFechar} larguraMax="max-w-2xl" esconderCabecalho>
            <div className="flex flex-col relative overflow-hidden">

                {/* ── Fundo Decorativo no Topo ── */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-sky-500/10 dark:from-sky-400/5 to-transparent pointer-events-none" />

                <div className="p-6 space-y-5 relative z-10">
                    {/* ── Cabeçalho Principal ── */}
                    <div className="flex items-start gap-5 pb-3 border-b border-gray-100 dark:border-white/5">
                        <div
                            className="w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
                            style={{ background: "#0d0d0f", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                            {impressora.imagemUrl ? (
                                <img
                                    src={impressora.imagemUrl}
                                    alt={impressora.nome}
                                    className="w-[85%] h-[85%] object-contain drop-shadow-lg"
                                />
                            ) : (
                                <Printer size={32} className="text-zinc-700" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-start justify-between mb-1">
                                <p className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                                    {subtitulo}
                                </p>
                                <button
                                    onClick={aoFechar}
                                    className="p-1.5 -mt-2 -mr-2 rounded-lg bg-transparent hover:bg-gray-200/50 dark:hover:bg-white/10 text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                                    aria-label="Fechar modal"
                                >
                                    <X size={18} strokeWidth={2.5} />
                                </button>
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight truncate leading-none mb-3">
                                {impressora.nome}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusCor}`}>
                                    {impressora.status}
                                </span>
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 shadow-sm">
                                    {impressora.tecnologia}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ── Horímetro ── */}
                        <div className="rounded-xl p-4 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock size={14} className="text-gray-500 dark:text-zinc-500" />
                                    <span className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                                        Horímetro / Próxima Revisão
                                    </span>
                                </div>
                                <div className="flex items-end justify-between mb-2">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums leading-none">
                                        {horasUsadas.toLocaleString("pt-BR")}h
                                    </span>
                                    <span className="text-xs font-bold text-gray-400 dark:text-zinc-600 tabular-nums">
                                        {horasRestantes}h restantes
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="h-2 w-full bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden mb-1.5">
                                    <div
                                        className="h-full rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${porcentagemRevisao}%`, background: barraCor }}
                                    />
                                </div>
                                <p className="text-[10px] font-medium text-gray-400 dark:text-zinc-600 flex justify-between">
                                    <span>A cada {intervalo}h</span>
                                    <span>{Math.round(porcentagemRevisao)}% concluído</span>
                                </p>
                            </div>
                        </div>

                        {/* ── ROI (Retorno sobre Investimento) ── */}
                        <div className="rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white dark:from-white/[0.03] dark:to-white/[0.01] border border-gray-200 dark:border-white/5 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                                            <DollarSign size={14} className="text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider">
                                            ROI Estimado
                                        </span>
                                    </div>
                                    {valorCompra > 0 ? (
                                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                            {Math.round(porcentagemRoi)}% Atingido
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-bold text-gray-500 dark:text-zinc-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                                            N/A
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div>
                                        <p className="text-[9px] font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
                                            Valor Gerado
                                        </p>
                                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
                                            R$ {valorGeradoEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
                                            Custo (100%)
                                        </p>
                                        <p className="text-sm font-bold text-gray-400 dark:text-zinc-400 tabular-nums leading-none">
                                            R$ {valorCompra > 0 ? valorCompra.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "0,00"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="relative h-2 w-full bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden mt-1">
                                    <div
                                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-emerald-400 to-emerald-500"
                                        style={{ width: `${porcentagemRoi}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Especificações ── */}
                    <div className="grid grid-cols-2 gap-3">
                        <InfoCard icone={Zap} rotulo="Potência" valor={impressora.potenciaWatts ? `${impressora.potenciaWatts}W` : "—"} />
                        <InfoCard icone={Box} rotulo="Peças Impressas" valor="15" />
                        <InfoCard icone={Wrench} rotulo="Consumo Energético" valor={impressora.consumoKw ? `${impressora.consumoKw} kW/h` : "—"} />
                        <InfoCard icone={Activity} rotulo="Taxa de Sucesso" valor="95%" />
                    </div>



                    {/* ── Observações (Editável) ── */}
                    <div className="rounded-xl p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 relative group transition-colors hover:bg-white dark:hover:bg-white/[0.04]">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                                    <FileText size={14} className="text-gray-600 dark:text-zinc-400" />
                                </div>
                                <span className="text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider">
                                    Observações Gerais
                                </span>
                            </div>
                            {!editandoObs && (
                                <button
                                    onClick={() => setEditandoObs(true)}
                                    className="text-xs font-bold text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 hover:underline px-2 py-1 rounded-md hover:bg-sky-50 dark:hover:bg-sky-500/10"
                                >
                                    <Edit2 size={12} /> Editar Anotações
                                </button>
                            )}
                        </div>

                        {editandoObs ? (
                            <div className="space-y-3 mt-2">
                                <textarea
                                    value={obsTexto}
                                    onChange={(e) => setObsTexto(e.target.value)}
                                    className="w-full text-sm bg-white dark:bg-[#09090b] border border-gray-300 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 ring-1 ring-transparent focus:ring-sky-500/20 shadow-inner resize-y min-h-[80px]"
                                    placeholder="Adicione observações sobre peças trocadas, peculiaridades da máquina..."
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2 pt-1">
                                    <button
                                        onClick={() => { setEditandoObs(false); setObsTexto(impressora.observacoes || ""); }}
                                        className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={lidarSalvarObs}
                                        style={{ backgroundColor: "var(--cor-primaria)" }}
                                        className="px-4 py-1.5 text-xs font-bold text-white hover:brightness-95 rounded-lg shadow-sm transition-colors"
                                    >
                                        Salvar Alterações
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#09090b] rounded-xl p-3 border border-gray-100 dark:border-white/5 shadow-inner min-h-[60px]">
                                <div className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                    {impressora.observacoes || <span className="text-gray-400 dark:text-zinc-600 italic flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-700" /> Nenhuma observação registrada para esta máquina.</span>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Dialogo>
    );
}

function InfoCard({ icone: Icone, rotulo, valor }: { icone: React.ElementType; rotulo: string; valor: string }) {
    return (
        <div className="rounded-xl p-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
                <Icone size={12} className="text-gray-400 dark:text-zinc-600" />
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-wider">
                    {rotulo}
                </span>
            </div>
            <span className="text-sm font-black text-gray-900 dark:text-white tabular-nums">
                {valor}
            </span>
        </div>
    );
}
