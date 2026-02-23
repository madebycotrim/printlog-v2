import { useState, useEffect } from "react";
import { Save, AlertCircle, Wrench, DollarSign, Clock, FileText, Settings, User } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Impressora, RegistroManutencao } from "@/funcionalidades/producao/impressoras/tipos";

interface ModalRegistrarManutencaoProps {
    aberto: boolean;
    aoFechar: () => void;
    aoConfirmar: (id: string, registro: Omit<RegistroManutencao, "id" | "data">) => void;
    impressora: Impressora | null;
}

export function ModalRegistrarManutencao({
    aberto,
    aoFechar,
    aoConfirmar,
    impressora,
}: ModalRegistrarManutencaoProps) {
    const [tipo, definirTipo] = useState<"Preventiva" | "Corretiva" | "Melhoria">("Preventiva");
    const [descricao, definirDescricao] = useState("");
    const [pecasTrocadas, definirPecasTrocadas] = useState("");
    const [custo, definirCusto] = useState("");
    const [responsavel, definirResponsavel] = useState("");
    const [tempoParadaHoras, definirTempoParadaHoras] = useState("");
    const [horasMaquinaNoMomento, definirHorasMaquinaNoMomento] = useState("");

    const [erro, definirErro] = useState<string | null>(null);

    useEffect(() => {
        if (aberto && impressora) {
            definirTipo("Preventiva");
            definirDescricao("");
            definirPecasTrocadas("");
            definirCusto("");
            definirResponsavel("");
            definirTempoParadaHoras("");
            definirHorasMaquinaNoMomento(impressora.horimetroTotal ? impressora.horimetroTotal.toString() : "");
            definirErro(null);
        }
    }, [aberto, impressora]);

    if (!impressora) return null;

    const lidarComEnvio = (e: React.FormEvent) => {
        e.preventDefault();

        if (!descricao.trim()) {
            definirErro("A descrição da manutenção é obrigatória.");
            return;
        }

        if (!responsavel.trim()) {
            definirErro("O responsável pela manutenção é obrigatório.");
            return;
        }

        const numCusto = Number(custo.replace(",", "."));
        if (custo && isNaN(numCusto)) {
            definirErro("O custo deve ser um valor numérico válido.");
            return;
        }

        const registro: Omit<RegistroManutencao, "id" | "data"> = {
            tipo,
            descricao,
            responsavel,
            custo: numCusto || 0,
            pecasTrocadas: pecasTrocadas || undefined,
            tempoParadaHoras: tempoParadaHoras ? Number(tempoParadaHoras) : undefined,
            horasMaquinaNoMomento: horasMaquinaNoMomento ? Number(horasMaquinaNoMomento) : undefined,
        };

        aoConfirmar(impressora.id, registro);
    };

    return (
        <Dialogo
            aberto={aberto}
            aoFechar={aoFechar}
            titulo="Registrar Manutenção"
            larguraMax="max-w-xl"
        >
            <form onSubmit={lidarComEnvio} className="flex flex-col bg-white dark:bg-[#18181b]">
                <div className="p-6 md:p-8 space-y-6 relative z-10 max-h-[75vh] overflow-y-auto">
                    {/* Cabeçalho */}
                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 dark:border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-[#0d0d0f] border border-white/5 shadow-sm flex items-center justify-center flex-shrink-0">
                            {impressora.imagemUrl ? (
                                <img src={impressora.imagemUrl} alt={impressora.nome} className="w-[85%] h-[85%] object-contain" />
                            ) : (
                                <Wrench size={20} className="text-zinc-600" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {impressora.nome}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium truncate">
                                Horímetro Atual:{" "}
                                <strong className="text-sky-500">
                                    {impressora.horimetroTotal || 0}h
                                </strong>
                            </span>
                        </div>
                    </div>

                    {erro && (
                        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                            <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">{erro}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Tipo de Manutenção */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                                Tipo de Manutenção
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {["Preventiva", "Corretiva", "Melhoria"].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => definirTipo(t as any)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${tipo === t
                                            ? t === "Preventiva" ? "bg-sky-50 dark:bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-400 ring-1 ring-sky-500" :
                                                t === "Corretiva" ? "bg-red-50 dark:bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 ring-1 ring-red-500" :
                                                    "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500"
                                            : "bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Descrição */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                                Descrição do Serviço
                            </label>
                            <div className="relative group">
                                <FileText size={18} className="absolute left-3.5 top-3.5 text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500 transition-colors" />
                                <textarea
                                    autoFocus
                                    value={descricao}
                                    onChange={(e) => definirDescricao(e.target.value)}
                                    placeholder="Descreva o que foi feito na máquina..."
                                    className="w-full pl-11 pr-4 py-3 text-sm font-medium bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-gray-200 dark:border-white/5 focus:border-sky-500 focus:ring-sky-500/20 focus:bg-white dark:focus:bg-[#0c0c0e] focus:ring-4 rounded-xl text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 resize-y min-h-[100px]"
                                />
                            </div>
                        </div>

                        {/* Peças Trocadas (Opcional) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                                Peças Trocadas/Novas (Opcional)
                            </label>
                            <div className="relative group">
                                <Settings size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500 transition-colors" />
                                <input
                                    type="text"
                                    value={pecasTrocadas}
                                    onChange={(e) => definirPecasTrocadas(e.target.value)}
                                    placeholder="Ex: Bico 0.4mm, Tubo PTFE..."
                                    className="w-full h-12 pl-11 pr-4 text-sm font-medium bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-gray-200 dark:border-white/5 focus:border-sky-500 focus:ring-sky-500/20 focus:bg-white dark:focus:bg-[#0c0c0e] focus:ring-4 rounded-xl text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        {/* Duas Colunas: Responsável e Custo */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                                    Responsável
                                </label>
                                <div className="relative group">
                                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={responsavel}
                                        onChange={(e) => definirResponsavel(e.target.value)}
                                        placeholder="Nome..."
                                        className="w-full h-12 pl-11 pr-4 text-sm font-medium bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-gray-200 dark:border-white/5 focus:border-sky-500 focus:ring-sky-500/20 focus:bg-white dark:focus:bg-[#0c0c0e] focus:ring-4 rounded-xl text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                                    Custo Estimado (R$)
                                </label>
                                <div className="relative group">
                                    <DollarSign size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500 transition-colors" />
                                    <input
                                        type="number"
                                        step="any"
                                        value={custo}
                                        onChange={(e) => definirCusto(e.target.value)}
                                        placeholder="0,00"
                                        className="w-full h-12 pl-11 pr-4 text-sm font-medium bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-gray-200 dark:border-white/5 focus:border-sky-500 focus:ring-sky-500/20 focus:bg-white dark:focus:bg-[#0c0c0e] focus:ring-4 rounded-xl text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Duas Colunas: Horas da Máquina e Tempo de Parada */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                                    Horímetro Atual (h)
                                </label>
                                <div className="relative group">
                                    <Clock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500 transition-colors" />
                                    <input
                                        type="number"
                                        value={horasMaquinaNoMomento}
                                        onChange={(e) => definirHorasMaquinaNoMomento(e.target.value)}
                                        placeholder="Leitura..."
                                        className="w-full h-12 pl-11 pr-4 text-sm font-medium bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-gray-200 dark:border-white/5 focus:border-sky-500 focus:ring-sky-500/20 focus:bg-white dark:focus:bg-[#0c0c0e] focus:ring-4 rounded-xl text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                                    />
                                </div>
                                <span className="text-[9px] text-gray-400 mt-1 block">
                                    Se maior que o atual, atualizará a máquina.
                                </span>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-2">
                                    Tempo de Parada (h)
                                </label>
                                <div className="relative group">
                                    <Clock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 group-focus-within:text-sky-500 transition-colors" />
                                    <input
                                        type="number"
                                        value={tempoParadaHoras}
                                        onChange={(e) => definirTempoParadaHoras(e.target.value)}
                                        placeholder="Quanto tempo ficou parada..."
                                        className="w-full h-12 pl-11 pr-4 text-sm font-medium bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-gray-200 dark:border-white/5 focus:border-sky-500 focus:ring-sky-500/20 focus:bg-white dark:focus:bg-[#0c0c0e] focus:ring-4 rounded-xl text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 md:p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-[#0e0e11]/50 flex items-center justify-end gap-3 rounded-br-xl">
                    <button
                        type="button"
                        onClick={aoFechar}
                        className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        style={{ backgroundColor: "var(--cor-primaria)" }}
                        className="px-6 py-2.5 hover:brightness-95 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Save size={18} strokeWidth={2.5} />
                        Registrar no Histórico
                    </button>
                </div>
            </form>
        </Dialogo>
    );
}
