import { useState } from "react";
import { Shield, AlertTriangle, Trash2, Loader2, Scale } from "lucide-react";
import { CabecalhoCard } from "./Compartilhados";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contexto/ContextoAutenticacao";

export function CardPrivacidade() {
    const { excluirConta } = usarAutenticacao();

    const [cienciaTermos, definirCienciaTermos] = useState(false);
    const [confirmouEliminacao, definirConfirmouEliminacao] = useState(false);
    const [modalAberto, definirModalAberto] = useState(false);
    const [passo, definirPasso] = useState(1);
    const [eliminando, definirEliminando] = useState(false);

    const lidarComEliminacao = async () => {
        definirEliminando(true);
        try {
            await excluirConta();
        } catch (erro: any) {
            alert(erro.message || "Erro ao excluir conta. Faça login novamente e tente de novo.");
        } finally {
            definirEliminando(false);
        }
    };

    const abrirModal = () => {
        definirModalAberto(true);
        definirPasso(1);
        definirConfirmouEliminacao(false);
    };

    return (
        <>
            <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-card-fundo p-5 md:p-6 flex flex-col gap-5">
                <CabecalhoCard titulo="Privacidade (LGPD)" descricao="Lei nº 13.709/2018 — Direitos do titular de dados pessoais" icone={Shield} corIcone="text-rose-500" />

                <div className="flex flex-col lg:flex-row gap-5">
                    {/* COLUNA ESQUERDA — TEXTO + DIREITOS */}
                    <div className="flex-[1.6] flex flex-col gap-4">
                        <p className="text-sm leading-relaxed text-gray-600 dark:text-zinc-400 text-justify">
                            Conforme a <strong className="text-gray-900 dark:text-white">Lei Geral de Proteção de Dados Pessoais</strong> (Lei nº 13.709/2018), regulamentada pela ANPD, o titular tem direito de solicitar ao controlador, a qualquer tempo, o <strong className="text-gray-900 dark:text-white">acesso</strong>, a <strong className="text-gray-900 dark:text-white">retificação</strong>, a <strong className="text-gray-900 dark:text-white">portabilidade</strong> ou a <strong className="text-rose-600 dark:text-rose-400">eliminação definitiva</strong> de seus dados pessoais, ressalvadas as hipóteses legais de retenção previstas no Art. 16.
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { label: "Acesso", artigo: "Art. 18, II", descricao: "Saber se seus dados são tratados e obter cópia integral.", cor: "border-sky-200 dark:border-sky-500/20 bg-sky-50/50 dark:bg-sky-500/[0.04]", corTexto: "text-sky-700 dark:text-sky-400" },
                                { label: "Retificação", artigo: "Art. 18, III", descricao: "Corrigir dados incompletos, inexatos ou desatualizados.", cor: "border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/[0.04]", corTexto: "text-amber-700 dark:text-amber-400" },
                                { label: "Portabilidade", artigo: "Art. 18, V", descricao: "Transferir seus dados para outro fornecedor de serviço.", cor: "border-violet-200 dark:border-violet-500/20 bg-violet-50/50 dark:bg-violet-500/[0.04]", corTexto: "text-violet-700 dark:text-violet-400" },
                                { label: "Eliminação", artigo: "Art. 18, VI", descricao: "Excluir dados tratados com seu consentimento prévio.", cor: "border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/[0.04]", corTexto: "text-rose-700 dark:text-rose-400" },
                            ].map((d) => (
                                <div
                                    key={d.label}
                                    className={`group relative rounded-xl border ${d.cor} p-3 text-center transition-all hover:scale-[1.02] cursor-help`}
                                >
                                    <p className={`text-xs font-black uppercase tracking-tight ${d.corTexto}`}>{d.label}</p>
                                    <p className="text-[10px] text-gray-400 dark:text-zinc-600 mt-0.5">{d.artigo}</p>

                                    {/* TOOLTIP DESIGN PREMIUM */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 rounded-xl bg-gray-900 dark:bg-zinc-800 text-white text-[10px] font-medium leading-relaxed shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                        {d.descricao}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-zinc-800" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs leading-relaxed text-gray-400 dark:text-zinc-500">
                            Prazo de atendimento: até 15 dias úteis (Art. 19, II). Em caso de descumprimento, o titular poderá peticionar à ANPD (Art. 55-J).
                        </p>
                    </div>

                    {/* COLUNA DIREITA — AÇÃO */}
                    <div className="flex-1 flex flex-col gap-3 bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-4">
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center">
                                <Scale size={28} className="text-rose-600 dark:text-rose-500" />
                            </div>
                        </div>

                        <label className="flex items-start gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={cienciaTermos}
                                onChange={(e) => definirCienciaTermos(e.target.checked)}
                                className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 dark:border-zinc-600 text-rose-600 focus:ring-rose-500 bg-white dark:bg-zinc-800 shrink-0"
                            />
                            <span className="text-xs leading-relaxed text-gray-600 dark:text-zinc-400">
                                Declaro ciência de que a eliminação é <strong className="text-gray-800 dark:text-zinc-200">irrevogável e definitiva</strong>, nos termos do Art. 18, VI.
                            </span>
                        </label>

                        <button
                            onClick={abrirModal}
                            disabled={!cienciaTermos}
                            className={`w-full h-11 rounded-xl text-xs font-black uppercase tracking-[0.12em] flex items-center justify-center gap-2 transition-all ${cienciaTermos
                                ? "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-sm active:scale-[0.98]"
                                : "bg-gray-100 dark:bg-zinc-800/50 text-gray-400 dark:text-zinc-600 cursor-not-allowed"
                                }`}
                        >
                            <AlertTriangle size={13} />
                            Solicitar Eliminação
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            <Dialogo
                aberto={modalAberto}
                aoFechar={() => definirModalAberto(false)}
                titulo={passo === 1 ? "§ 1º — Identificação e Impacto da Eliminação" : "§ 2º — Termo de Consentimento Livre e Esclarecido"}
                larguraMax="max-w-2xl"
            >
                <div className="p-5">
                    <div className="mb-5 flex gap-2">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex-1 flex flex-col gap-1.5">
                                <div className={`h-1.5 rounded-full transition-all ${s <= passo ? "bg-gradient-to-r from-rose-500 to-rose-600" : "bg-gray-200 dark:bg-white/10"}`} />
                                <p className={`text-[9px] font-black uppercase tracking-widest ${s <= passo ? "text-rose-600 dark:text-rose-400" : "text-gray-400 dark:text-zinc-600"}`}>
                                    Passo {s}: {s === 1 ? "Identificação" : "Consentimento"}
                                </p>
                            </div>
                        ))}
                    </div>

                    {passo === 1 ? (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/60 dark:bg-rose-500/[0.05] p-4 flex items-start gap-3">
                                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-500" />
                                <div>
                                    <p className="text-sm font-bold text-rose-800 dark:text-rose-300">Ação Permanente (Art. 18, VI — LGPD)</p>
                                    <p className="text-xs leading-relaxed text-rose-700 dark:text-rose-300/80 mt-1">
                                        A confirmação desta solicitação resultará na <strong>exclusão definitiva, irreversível e permanente</strong> de todos os seus dados pessoais e operacionais das nossas bases de produção e backups de curto prazo.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-500 flex items-center gap-2">
                                    <Trash2 size={13} /> Inventário de Dados Objeto de Eliminação
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* GRUPO A: IDENTIDADE */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-tighter">Dados de Identidade e Acesso</p>
                                        {[
                                            { nome: "Perfil e Identificação", detalhe: "Nome, e-mail, foto e credenciais" },
                                            { nome: "Preferências", detalhe: "Temas, cores e configurações de UI" },
                                        ].map((item) => (
                                            <div key={item.nome} className="rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] px-3 py-2">
                                                <p className="text-xs font-bold text-gray-800 dark:text-zinc-200 leading-tight">{item.nome}</p>
                                                <p className="text-[11px] text-gray-500 dark:text-zinc-500 leading-tight mt-1">{item.detalhe}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* GRUPO B: OPERACIONAL */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-tighter">Dados Operacionais e Técnicos</p>
                                        {[
                                            { nome: "Fabricação e Negócio", detalhe: "Insumos, projetos e orçamentos" },
                                            { nome: "Parque e Clientes", detalhe: "Máquinas, históricos e contatos" },
                                        ].map((item) => (
                                            <div key={item.nome} className="rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] px-3 py-2">
                                                <p className="text-xs font-bold text-gray-800 dark:text-zinc-200 leading-tight">{item.nome}</p>
                                                <p className="text-[11px] text-gray-500 dark:text-zinc-500 leading-tight mt-1">{item.detalhe}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/[0.04] p-3 flex items-start gap-2.5">
                                <Scale size={16} className="text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300/80 text-justify">
                                    <strong className="dark:text-amber-200">Ressalva de Retenção (Art. 16):</strong> Conforme a lei, o Titular reconhece que a controladora poderá conservar dados estritamente necessários para cumprimento de obrigação legal ou regulatória (ex: notas fiscais), exercício de direitos em processos ou uso exclusivo (se anonimizados).
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <button
                                    onClick={() => definirModalAberto(false)}
                                    className="flex-1 h-11 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-black uppercase tracking-[0.14em] text-gray-700 dark:text-zinc-300 transition-all font-mono"
                                >
                                    Abortar Solicitação
                                </button>
                                <button
                                    onClick={() => definirPasso(2)}
                                    className="flex-[1.5] h-11 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-xs font-black uppercase tracking-[0.14em] text-white transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    Prosseguir para Aceite
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-5 space-y-4 text-xs leading-relaxed text-gray-700 dark:text-zinc-400 text-justify">
                                <p className="font-bold text-center text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-white/5 pb-2">
                                    Termo de Consentimento e Revogação (Art. 8º — LGPD)
                                </p>
                                <p>
                                    <strong>1. OBJETO:</strong> Pelo presente termo, o Titular manifesta sua vontade livre, informada e inequívoca de revogar o consentimento anteriormente fornecido e solicitar a <strong>eliminação definitiva</strong> de seus dados pessoais, nos termos do Art. 18, inciso VI da Lei nº 13.709/2018.
                                </p>
                                <p>
                                    <strong>2. IRREVERSIBILIDADE:</strong> Declaro plena ciência de que este procedimento é tecnicamente IRREVERSÍVEL. Uma vez confirmada, a conta será desativada e todo o patrimônio digital, incluindo projetos e históricos, será apagado permanentemente.
                                </p>
                                <p>
                                    <strong>3. RESSALVAS DE RETENÇÃO (Art. 16):</strong> Estou ciente de que a controladora poderá conservar dados estritamente necessários para: (I) cumprimento de obrigação legal; (II) exercício regular de direitos em processo judicial; ou (III) uso exclusivo, desde que anonimizados.
                                </p>
                                <p>
                                    <strong>4. EXECUÇÃO E PRAZO:</strong> O processamento da exclusão ocorrerá em até 15 (quinze) dias úteis (Art. 19, II). Caso o Titular entenda que seus direitos não foram atendidos, poderá peticionar perante a Autoridade Nacional de Proteção de Dados (ANPD).
                                </p>
                            </div>

                            <label className="flex items-start gap-3 rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/40 dark:bg-rose-500/[0.04] p-4 cursor-pointer hover:border-rose-300 dark:hover:border-rose-500/30 transition-all">
                                <input
                                    type="checkbox"
                                    checked={confirmouEliminacao}
                                    onChange={(e) => definirConfirmouEliminacao(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500 bg-white dark:bg-zinc-800 shrink-0"
                                />
                                <span className="text-xs leading-relaxed text-rose-800 dark:text-rose-300">
                                    <strong>LI E ESTOU DE ACORDO:</strong> Confirmo que compreendi as implicações legais e técnicas da eliminação de dados conforme os Arts. 18 e 16 da Lei nº 13.709/2018.
                                </span>
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => { definirPasso(1); definirConfirmouEliminacao(false); }}
                                    className="h-11 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-black uppercase tracking-[0.14em] text-gray-700 dark:text-zinc-300 transition-all"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={lidarComEliminacao}
                                    disabled={!confirmouEliminacao || eliminando}
                                    className={`h-11 rounded-xl text-xs font-black uppercase tracking-[0.12em] flex items-center justify-center gap-2 transition-all ${confirmouEliminacao && !eliminando
                                        ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:brightness-110 active:scale-[0.98] shadow-lg shadow-rose-500/20"
                                        : "bg-gray-100 dark:bg-zinc-800/50 text-gray-400 dark:text-zinc-700 cursor-not-allowed"
                                        }`}
                                >
                                    {eliminando ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Excluindo...
                                        </>
                                    ) : (
                                        "Confirmar Eliminação"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Dialogo>
        </>
    );
}
