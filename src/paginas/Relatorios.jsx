import { useEffect, useState } from 'react';
import { bancoLocal } from '../servicos/bancoLocal';
import { format } from 'date-fns';
import { FileText, Download, Clock, Users } from 'lucide-react';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';

export default function Relatorios() {
    const [dados, definirDados] = useState(null);
    const [carregando, definirCarregando] = useState(true);

    useEffect(() => {
        const gerarRelatorios = async () => {
            definirCarregando(true);
            const banco = await bancoLocal.iniciarBanco();
            const alunos = await banco.getAll('alunos');
            const registros = await banco.getAll('registros_acesso');

            const hoje = format(new Date(), 'yyyy-MM-dd');
            const registrosHoje = registros.filter(r => r.timestamp.startsWith(hoje));

            // 1. Presença por Turma
            const presencaPorTurma = {}; // { '3A': { total: 10, presentes: 2 } }

            // Inicializar contagens
            alunos.forEach(aluno => {
                if (!presencaPorTurma[aluno.turma_id]) {
                    presencaPorTurma[aluno.turma_id] = { turma: aluno.turma_id, total: 0, presentes: 0, listaAusentes: [] };
                }
                presencaPorTurma[aluno.turma_id].total++;
            });

            // Calcular presença (Lógica simplificada: Tem ENTRADA hoje)
            const matriculasPresentes = new Set(registrosHoje.filter(r => r.tipo_movimentacao === 'ENTRADA').map(r => r.aluno_matricula));

            alunos.forEach(aluno => {
                if (matriculasPresentes.has(aluno.matricula)) {
                    if (presencaPorTurma[aluno.turma_id]) {
                        presencaPorTurma[aluno.turma_id].presentes++;
                    }
                } else {
                    if (presencaPorTurma[aluno.turma_id]) {
                        presencaPorTurma[aluno.turma_id].listaAusentes.push(aluno);
                    }
                }
            });

            // 2. Atrasos (Entrada após 07:15)
            const alunosAtrasados = [];
            registrosHoje.forEach(r => {
                if (r.tipo_movimentacao === 'ENTRADA') {
                    const hora = new Date(r.timestamp);
                    if (hora.getHours() > 7 || (hora.getHours() === 7 && hora.getMinutes() > 15)) {
                        const aluno = alunos.find(a => a.matricula === r.aluno_matricula);
                        if (aluno) {
                            alunosAtrasados.push({ ...aluno, hora: r.timestamp });
                        }
                    }
                }
            });

            definirDados({
                porTurma: Object.values(presencaPorTurma).sort((a, b) => a.turma.localeCompare(b.turma)),
                alunosAtrasados: alunosAtrasados.sort((a, b) => new Date(b.hora) - new Date(a.hora)),
                totalPresentes: matriculasPresentes.size,
                totalAlunos: alunos.length
            });
            definirCarregando(false);
        };

        gerarRelatorios();
    }, []);

    const AcoesHeader = (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition font-medium shadow-md md:hidden"
        >
            <Download size={18} /> Imprimir
        </button>
    );

    if (carregando) return <div className="p-8 text-center text-slate-500 animate-pulse">Gerando relatórios e análises...</div>;

    return (
        <LayoutAdministrativo
            titulo="Relatórios Operacionais"
            subtitulo={`Análise diária de presença e ocorrências • ${format(new Date(), "dd/MM/yyyy")}`}
            acoes={AcoesHeader}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block print:w-full">
                {/* 1. Card de Presença por Turma */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 break-inside-avoid h-full">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 border-b border-slate-50 pb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText size={20} />
                        </div>
                        Resumo de Presença
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 rounded-lg">
                                <tr>
                                    <th className="p-3 font-semibold text-slate-500 rounded-l-lg">Turma</th>
                                    <th className="p-3 font-semibold text-slate-500 text-center">Total</th>
                                    <th className="p-3 font-semibold text-slate-500 text-center">Presentes</th>
                                    <th className="p-3 font-semibold text-slate-500 text-center rounded-r-lg">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {dados.porTurma.map(t => (
                                    <tr key={t.turma} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-3 font-bold text-slate-700">{t.turma}</td>
                                        <td className="p-3 text-center text-slate-500">{t.total}</td>
                                        <td className="p-3 text-center text-green-600 font-bold bg-green-50/30 rounded-lg">{t.presentes}</td>
                                        <td className="p-3 text-center font-mono text-slate-600">
                                            {t.total > 0 ? Math.round((t.presentes / t.total) * 100) : 0}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Card de Atrasos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 break-inside-avoid h-full">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 border-b border-slate-50 pb-4">
                        <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                            <Clock size={20} />
                        </div>
                        Atrasos (Entrada &gt; 07:15)
                    </h2>
                    {dados.alunosAtrasados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <span className="text-2xl mb-2">🎉</span>
                            Sem atrasos registrados hoje.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {dados.alunosAtrasados.map((a, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-orange-50/50 p-3 rounded-xl border border-orange-100 hover:bg-orange-50 transition-colors">
                                    <div>
                                        <span className="font-bold text-slate-800 block">{a.nome_completo}</span>
                                        <span className="text-xs text-orange-600 font-bold bg-orange-100 px-2 py-0.5 rounded-md mt-1 inline-block">{a.turma_id}</span>
                                    </div>
                                    <span className="font-mono text-orange-600 font-bold bg-white px-2 py-1 rounded border border-orange-100 shadow-sm">
                                        {format(new Date(a.hora), 'HH:mm')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Lista de Ausentes (Full Width) */}
            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 break-before-page">
                <h2 className="text-xl font-bold mb-6 text-red-600 flex items-center gap-2 border-b border-red-50 pb-4">
                    <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                        <Users size={20} />
                    </div>
                    Alunos Ausentes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dados.porTurma.map(t => (
                        t.listaAusentes.length > 0 && (
                            <div key={t.turma} className="border border-red-100 p-4 rounded-xl bg-red-50/30 hover:bg-red-50/50 transition-colors">
                                <h3 className="font-bold text-red-800 border-b border-red-100 pb-2 mb-3 flex justify-between">
                                    Turma {t.turma}
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{t.listaAusentes.length}</span>
                                </h3>
                                <ul className="text-sm space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {t.listaAusentes.map(a => (
                                        <li key={a.matricula} className="text-slate-600 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-red-300 rounded-full"></span>
                                            {a.nome_completo}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </LayoutAdministrativo>
    );
}
