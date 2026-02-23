import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Impressora, RegistroProducao } from "@/funcionalidades/producao/impressoras/tipos";
import { Printer, Box, CheckCircle2, XCircle, TrendingUp, Clock, Target } from "lucide-react";
import { useMemo } from "react";

interface ModalHistoricoProducaoProps {
    aberto: boolean;
    aoFechar: () => void;
    impressora: Impressora | null;
}

// --------------------------------------------------------------------------------------
// 🔄 MOCK DE DADOS AUTO GERADO (Para Simular Pedidos Concluídos / Falhados)
// --------------------------------------------------------------------------------------
function gerarMockHistorico(horimetroTotal: number): RegistroProducao[] {
    const qtdeProjetos = Math.max(1, Math.floor(horimetroTotal / 12)); // Simula que cada projeto durou em média 12h
    const mock: RegistroProducao[] = [];

    // Tentar ter no máximo uns 20 no mock para não quebrar a tela
    const qtdeVisual = Math.min(25, qtdeProjetos);

    let dataAtual = new Date();
    dataAtual.setDate(dataAtual.getDate() - 1); // Começa "ontem"

    for (let i = 0; i < qtdeVisual; i++) {
        const duracao = Math.floor(Math.random() * 20) + 1; // 1 a 20h
        const sucesso = Math.random() > 0.15; // 85% de sucesso
        const valorGerado = sucesso ? duracao * (15 + Math.random() * 10) : 0; // Se falhou, zero retorno financeiro

        mock.push({
            idProtocolo: `PRJ-${Math.floor(Math.random() * 90000) + 10000}`,
            nomeProjeto: [
                "Engrenagem Helicoidal", "Case Raspberry", "Action Figure Batman", "Suporte Headset",
                "Protótipo Arduino", "Vaso Geométrico", "Busto Homem Aranha", "Peça de Reposição Drone",
                "Caixa Organizadora", "Molde para silicone", "Miniatura D&D", "Keycap Personalizada"
            ][Math.floor(Math.random() * 12)],
            horasImpressao: duracao,
            valorGerado: parseFloat(valorGerado.toFixed(2)),
            sucesso: sucesso,
            dataConclusao: new Date(dataAtual.getTime() - i * 86400000 * (Math.random() * 3)).toISOString(),
        });
    }

    return mock.sort((a, b) => new Date(b.dataConclusao).getTime() - new Date(a.dataConclusao).getTime());
}

export function ModalHistoricoProducao({
    aberto,
    aoFechar,
    impressora,
}: ModalHistoricoProducaoProps) {

    // Gerar ou carregar mock baseado na impressora atual
    const registros = useMemo(() => {
        if (!impressora) return [];
        // Se já vier do banco (no futuro), usa ele. Se não, gera mock
        if (impressora.historicoProducao && impressora.historicoProducao.length > 0) {
            return impressora.historicoProducao;
        }
        return gerarMockHistorico(impressora.horimetroTotal || 150); // Mínimo de 150h mock se zerada
    }, [impressora]);

    if (!impressora) return null;

    // Estatísticas In-Memory
    const totalPecas = registros.length;
    const pecasComSucesso = registros.filter(r => r.sucesso).length;
    const taxaSucesso = totalPecas > 0 ? (pecasComSucesso / totalPecas) * 100 : 0;
    const totalFaturadoDado = registros.reduce((acc, curr) => acc + curr.valorGerado, 0);

    return (
        <Dialogo
            aberto={aberto}
            aoFechar={aoFechar}
            titulo="Histórico de Produção"
            larguraMax="max-w-4xl"
        >
            <div className="flex flex-col bg-white dark:bg-[#18181b] min-h-[500px] max-h-[85vh] overflow-hidden">
                {/* Cabeçalho da Impressora */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-900/20">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#0d0d0f] border border-white/5 shadow-sm overflow-hidden flex-shrink-0">
                            {impressora.imagemUrl ? (
                                <img src={impressora.imagemUrl} alt={impressora.nome} className="w-[85%] h-[85%] object-contain scale-110" />
                            ) : (
                                <Printer size={28} className="text-zinc-600" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white truncate tracking-tight">
                                {impressora.nome}
                            </h3>
                            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                                Desempenho em Pedidos e Projetos Avulsos
                            </p>
                        </div>
                        {/* Selo OEE Simulacro */}
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest block mb-1">
                                OEE Estimado
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 text-sm font-bold border border-sky-100 dark:border-sky-500/20">
                                <TrendingUp size={14} /> 85%
                            </span>
                        </div>
                    </div>

                    {/* Dashboard Estatísticas da Máquina */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <EstatCard icone={Box} titulo="Projetos" valor={totalPecas.toString()} cor="text-zinc-900 dark:text-white" />
                        <EstatCard icone={Target} titulo="Taxa de Sucesso" valor={`${Math.round(taxaSucesso)}%`} cor={taxaSucesso >= 80 ? "text-emerald-500" : taxaSucesso >= 50 ? "text-amber-500" : "text-red-500"} />
                        <EstatCard icone={Clock} titulo="Horas Trabalhadas" valor={`${impressora.horimetroTotal || 150}h`} cor="text-sky-500" />
                        <EstatCard icone={TrendingUp} titulo="Faturamento Histórico" valor={`R$ ${totalFaturadoDado.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`} cor="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20" />
                    </div>
                </div>

                {/* Lista de Registros */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-[#0c0c0e]/30">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.15em] flex items-center gap-2">
                            <Box size={14} className="text-gray-400" />
                            Últimas Produções Realizadas
                        </h4>
                        <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/5 px-2.5 py-1 rounded-md shadow-sm">
                            Listando os {registros.length} mais recentes
                        </span>
                    </div>

                    <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-zinc-900/50">
                                        <th className="px-5 py-3 text-[10px] font-black text-gray-500 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                        <th className="px-5 py-3 text-[10px] font-black text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Projeto</th>
                                        <th className="px-5 py-3 text-[10px] font-black text-gray-500 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap">Tempo</th>
                                        <th className="px-5 py-3 text-[10px] font-black text-gray-500 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap text-right">Faturado</th>
                                        <th className="px-5 py-3 text-[10px] font-black text-gray-500 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap text-right">Data</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {registros.map((reg) => (
                                        <tr key={reg.idProtocolo} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {reg.sucesso ? (
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md w-fit border border-emerald-100 dark:border-emerald-500/20">
                                                        <CheckCircle2 size={14} /> Concluído
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-md w-fit border border-red-100 dark:border-red-500/20">
                                                        <XCircle size={14} /> Falha
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 max-w-[200px]">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                        {reg.nomeProjeto}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                                                        {reg.idProtocolo}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-zinc-300">
                                                    <Clock size={14} className="text-gray-400 dark:text-zinc-500" />
                                                    {reg.horasImpressao}h
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                                {reg.sucesso ? (
                                                    <span className="text-sm font-black text-gray-900 dark:text-white">
                                                        R$ {reg.valorGerado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm font-bold text-gray-400 dark:text-zinc-600 line-through">
                                                        R$ {reg.valorGerado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-medium text-gray-500 dark:text-zinc-400">
                                                {new Date(reg.dataConclusao).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer (Aviso de Mock Provisório) */}
                <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#121214] text-center flex justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                        *Os dados históricos reais serão migrados após a finalização do Módulo de Pedidos.
                    </span>
                </div>
            </div>
        </Dialogo>
    );
}

function EstatCard({ icone: Icone, titulo, valor, cor, bg = "bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5" }: any) {
    return (
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${bg}`}>
            <div className="flex items-center gap-2 mb-2">
                <Icone size={14} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest truncate">
                    {titulo}
                </span>
            </div>
            <span className={`text-[22px] font-black leading-none ${cor}`}>
                {valor}
            </span>
        </div>
    );
}
