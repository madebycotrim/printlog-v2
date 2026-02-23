import { useState, useEffect } from "react";
import { AlertCircle, Plus, Settings, X, RotateCcw } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Impressora, PecaDesgaste } from "@/funcionalidades/producao/impressoras/tipos";

interface ModalPecasDesgasteProps {
    aberto: boolean;
    aoFechar: () => void;
    impressora: Impressora | null;
    aoSalvar: (idImpressora: string, pecas: PecaDesgaste[]) => void;
}

export function ModalPecasDesgaste({
    aberto,
    aoFechar,
    impressora,
    aoSalvar,
}: ModalPecasDesgasteProps) {
    const [pecas, definirPecas] = useState<PecaDesgaste[]>([]);
    const [novaPecaNome, definirNovaPecaNome] = useState("");
    const [novaPecaVida, definirNovaPecaVida] = useState("");
    const [exibindoForm, definirExibindoForm] = useState(false);

    useEffect(() => {
        if (aberto && impressora) {
            definirPecas(impressora.pecasDesgaste || []);
            definirExibindoForm(false);
            definirNovaPecaNome("");
            definirNovaPecaVida("");
        }
    }, [aberto, impressora]);

    if (!impressora) return null;

    const horimetroAtual = impressora.horimetroTotal || 0;

    const lidarComAdicionarPeca = (e: React.FormEvent) => {
        e.preventDefault();
        if (!novaPecaNome.trim() || !novaPecaVida.trim()) return;

        const novaPeca: PecaDesgaste = {
            id: crypto.randomUUID(),
            nome: novaPecaNome,
            vidaUtilEstimada: Number(novaPecaVida),
            horasTrocado: horimetroAtual, // Acabou de colocar a peça, registra as horas atuais
            dataInclusao: new Date().toISOString(),
        };

        const novasPecas = [...pecas, novaPeca];
        definirPecas(novasPecas);
        aoSalvar(impressora.id, novasPecas); // Salva persistente no BD / Store

        definirNovaPecaNome("");
        definirNovaPecaVida("");
        definirExibindoForm(false);
    };

    const lidarComResetarPeca = (idPeca: string) => {
        const novasPecas = pecas.map((p) => {
            if (p.id === idPeca) {
                return {
                    ...p,
                    horasTrocado: horimetroAtual,
                    dataInclusao: new Date().toISOString(), // Opcional, atualizar data real de troca
                };
            }
            return p;
        });

        definirPecas(novasPecas);
        aoSalvar(impressora.id, novasPecas);
    };

    const lidarComRemoverPeca = (idPeca: string) => {
        const novasPecas = pecas.filter((p) => p.id !== idPeca);
        definirPecas(novasPecas);
        aoSalvar(impressora.id, novasPecas);
    };

    return (
        <Dialogo
            aberto={aberto}
            aoFechar={aoFechar}
            titulo="Peças de Desgaste"
            larguraMax="max-w-xl"
        >
            <div className="flex flex-col bg-white dark:bg-[#18181b] min-h-[400px] max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-900/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#0d0d0f] border border-white/5 shadow-sm overflow-hidden flex-shrink-0">
                            {impressora.imagemUrl ? (
                                <img src={impressora.imagemUrl} alt={impressora.nome} className="w-[85%] h-[85%] object-contain" />
                            ) : (
                                <Settings size={24} className="text-zinc-600" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">
                                {impressora.nome}
                            </h3>
                            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                                Horímetro Atual:{" "}
                                <strong className="text-sky-500">
                                    {horimetroAtual}h
                                </strong>
                            </p>
                        </div>
                        <button
                            onClick={() => definirExibindoForm(!exibindoForm)}
                            className="bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                            {exibindoForm ? <X size={14} /> : <Plus size={14} />}
                            {exibindoForm ? "Cancelar" : "Nova Peça"}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {exibindoForm && (
                        <form onSubmit={lidarComAdicionarPeca} className="bg-sky-50 dark:bg-sky-500/5 p-4 rounded-xl border border-sky-100 dark:border-sky-500/20 space-y-4 mb-6">
                            <div className="grid grid-cols-[1fr_120px] gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5">
                                        Nome da Peça (Bico, FEP...)
                                    </label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={novaPecaNome}
                                        onChange={(e) => definirNovaPecaNome(e.target.value)}
                                        placeholder="Ex: Bico 0.4 Hardened"
                                        className="w-full h-10 px-3 text-sm bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5">
                                        Vida Útil (h)
                                    </label>
                                    <input
                                        type="number"
                                        value={novaPecaVida}
                                        onChange={(e) => definirNovaPecaVida(e.target.value)}
                                        placeholder="Ex: 500"
                                        className="w-full h-10 px-3 text-sm bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    style={{ backgroundColor: "var(--cor-primaria)" }}
                                    className="px-4 py-2 hover:brightness-95 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                                >
                                    Adicionar ao Rastreio
                                </button>
                            </div>
                        </form>
                    )}

                    {pecas.length === 0 ? (
                        <div className="text-center py-10 flex flex-col items-center gap-3 text-gray-400 dark:text-zinc-600">
                            <Settings size={32} className="opacity-50" />
                            <p className="text-sm font-medium max-w-[260px]">
                                Nenhuma peça sendo monitorada. Adicione Bicos, FEPs ou Correias para rastrear o desgaste.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pecas.map((peca) => {
                                const horasTrabalhadasNaPeca = Math.max(0, horimetroAtual - peca.horasTrocado);
                                const porcentagemDesgaste = Math.min(100, (horasTrabalhadasNaPeca / peca.vidaUtilEstimada) * 100);
                                const estourouVida = porcentagemDesgaste >= 100;

                                const corBarra = estourouVida
                                    ? "bg-red-500"
                                    : porcentagemDesgaste > 80
                                        ? "bg-orange-500"
                                        : "bg-emerald-500";

                                return (
                                    <div key={peca.id} className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 rounded-xl p-4 flex flex-col gap-3 group relative overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <h5 className="text-sm font-black text-gray-900 dark:text-white">
                                                    {peca.nome}
                                                </h5>
                                                {estourouVida && (
                                                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 px-1.5 py-0.5 rounded">
                                                        <AlertCircle size={10} /> Troca Recomendada
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => lidarComResetarPeca(peca.id)}
                                                    title="Registrar Troca da Peça"
                                                    className="p-1.5 text-gray-400 hover:text-sky-600 dark:text-zinc-500 dark:hover:text-sky-400 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-md transition-colors"
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                                <button
                                                    onClick={() => lidarComRemoverPeca(peca.id)}
                                                    title="Parar de Monitorar"
                                                    className="p-1.5 text-gray-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-md transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-end justify-between mb-1.5">
                                                <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">
                                                    {horasTrabalhadasNaPeca}h / {peca.vidaUtilEstimada}h
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500">
                                                    {Math.round(porcentagemDesgaste)}% Desgastado
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${corBarra}`}
                                                    style={{ width: `${porcentagemDesgaste}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Dialogo>
    );
}
