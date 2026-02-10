import { useState, useEffect } from 'react';
import { bancoLocal } from '../servicos/bancoLocal';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import ModalListaAlunos from '../componentes/ModalListaAlunos';
import { Plus, Trash2, Users, Layers, X, List, TrendingUp, Sun, Moon, Sunset, ArrowRight } from 'lucide-react';

export default function Turmas() {
    const [turmas, definirTurmas] = useState([]);
    const [modalAberto, definirModalAberto] = useState(false);
    const [modalAlunosAberto, definirModalAlunosAberto] = useState(false);
    const [turmaSelecionada, definirTurmaSelecionada] = useState(null);
    const [alunosDaTurma, definirAlunosDaTurma] = useState([]);
    const [novaTurma, definirNovaTurma] = useState({ serie: '', turno: '', letra: '' });
    const [carregando, definirCarregando] = useState(true);

    useEffect(() => {
        carregarTurmas();
    }, []);

    const carregarTurmas = async () => {
        const banco = await bancoLocal.iniciarBanco();
        const todasTurmas = await banco.getAll('turmas');
        const todosAlunos = await banco.getAll('alunos');
        const alunosPresentes = await bancoLocal.listarAlunosPresentes();

        // Processar dados para cada turma
        const turmasComDados = todasTurmas.map(turma => {
            const alunosTurma = todosAlunos.filter(a => a.turma_id === turma.id);
            const totalAlunos = alunosTurma.length;

            // Contar quantos alunos dessa turma estão presentes
            const presentesTurma = alunosPresentes.filter(p => p.turma_id === turma.id).length;

            const percentual = totalAlunos > 0 ? Math.round((presentesTurma / totalAlunos) * 100) : 0;

            // Parse ID: "3ª A - Matutino" -> { serie: "3ª", letra: "A", turno: "Matutino" }
            let serie = '?', letra = '?', turno = 'Indefinido';
            try {
                if (turma.id) {
                    const parts = turma.id.split(' - ');
                    const info = parts[0] ? parts[0].split(' ') : [];
                    serie = info[0] || '?';
                    letra = info[1] || '?';
                    turno = parts[1] || 'Indefinido';
                }
            } catch (e) {
                console.error("Erro ao analisar turma:", turma.id, e);
            }

            return {
                ...turma,
                totalAlunos,
                presentes: presentesTurma,
                percentual,
                listaAlunos: alunosTurma,
                parsed: { serie, letra, turno }
            };
        });

        // Ordenar logicamente (1º, 2º, 3º...)
        turmasComDados.sort((a, b) => a.id.localeCompare(b.id));
        definirTurmas(turmasComDados);
        definirCarregando(false);
    };

    const adicionarTurma = async () => {
        if (!novaTurma.serie || !novaTurma.letra || !novaTurma.turno) return;

        const idFormatado = `${novaTurma.serie} ${novaTurma.letra} - ${novaTurma.turno}`;
        const banco = await bancoLocal.iniciarBanco();

        // Verificar duplicidade
        const existente = await banco.get('turmas', idFormatado);
        if (existente) {
            alert('Esta turma já existe!');
            return;
        }

        await banco.put('turmas', { id: idFormatado, criado_em: new Date().toISOString() });
        definirNovaTurma({ serie: '', turno: '', letra: '' });
        definirModalAberto(false);
        carregarTurmas();
    };

    const removerTurma = async (id, e) => {
        e.stopPropagation();
        if (!confirm(`Tem certeza que deseja remover a turma ${id}?`)) return;
        const banco = await bancoLocal.iniciarBanco();
        await banco.delete('turmas', id);
        carregarTurmas();
    };

    const abrirListaAlunos = (turma) => {
        definirTurmaSelecionada(turma);
        definirAlunosDaTurma(turma.listaAlunos || []);
        definirModalAlunosAberto(true);
    };

    const AcoesHeader = (
        <button
            onClick={() => definirModalAberto(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 active:scale-95"
        >
            <Plus size={20} /> Nova Turma
        </button>
    );

    const getTurnoIcon = (turno) => {
        if (!turno) return <Sun size={14} className="text-slate-400" />;
        if (turno === 'Matutino') return <Sun size={14} className="text-orange-500" />;
        if (turno === 'Vespertino') return <Sunset size={14} className="text-orange-600" />;
        return <Moon size={14} className="text-indigo-500" />;
    };

    const getProgressColor = (percent) => {
        if (percent >= 75) return 'bg-emerald-500';
        if (percent >= 50) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <LayoutAdministrativo titulo="Gerenciar Turmas" subtitulo="Organização das séries e turmas da escola" acoes={AcoesHeader}>

            {carregando ? (
                <div className="p-8 text-center text-slate-500 animate-pulse text-sm">Carregando...</div>
            ) : turmas.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl border border-slate-100 shadow-sm text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Layers size={24} className="text-slate-300" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700">Nenhuma turma</h3>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">Crie uma nova turma para começar.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {['1ª', '2ª', '3ª'].map(serie => {
                        const turmasDaSerie = turmas.filter(t => t.parsed?.serie === serie);
                        if (turmasDaSerie.length === 0) return null;

                        return (
                            <div key={serie} className="animate-[fadeIn_0.5s_ease-out]">
                                <div className="flex items-center gap-3 mb-6 px-2">
                                    <h2 className="text-xl font-bold text-slate-700">{serie} Série</h2>
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {turmasDaSerie.map((t) => {
                                        const parsed = t.parsed || { serie: '?', letra: '?', turno: '' };

                                        // Dynamic Colors based on Shift
                                        const isMatutino = parsed.turno === 'Matutino';
                                        const isVespertino = parsed.turno === 'Vespertino';

                                        // Status Colors
                                        const attendanceText = t.percentual >= 75 ? 'text-emerald-600' : t.percentual >= 60 ? 'text-amber-600' : 'text-red-600';

                                        // Design V10: Color Block Header (School & Minimalist)
                                        return (
                                            <div
                                                key={t.id}
                                                className="bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden border border-slate-100 flex flex-col"
                                            >
                                                {/* Header: Solid Color Identifier */}
                                                <div className={`h-12 px-5 flex items-center justify-between ${isMatutino ? 'bg-amber-400' : isVespertino ? 'bg-sky-500' : 'bg-indigo-600'}`}>
                                                    <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest drop-shadow-sm">
                                                        {getTurnoIcon(parsed.turno)}
                                                        {parsed.turno.toUpperCase()}
                                                    </div>
                                                    <button
                                                        onClick={(e) => removerTurma(t.id, e)}
                                                        className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                                                        title="Excluir Turma"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                {/* Body: Clean Stats & Big Letter */}
                                                <div className="p-5 flex-1 flex flex-col relative">

                                                    {/* Central Letter */}
                                                    <div className="flex-1 flex flex-col items-center justify-center py-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Turma</span>
                                                        <span className="text-6xl font-black text-slate-800 tracking-tighter leading-none">
                                                            {parsed.letra}
                                                        </span>
                                                    </div>

                                                    {/* Footer Stats Row */}
                                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                                        <div className="flex gap-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Alunos</span>
                                                                <span className="text-sm font-bold text-slate-600">{t.totalAlunos}</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Frequência</span>
                                                                <span className={`text-sm font-bold ${attendanceText}`}>{t.percentual}%</span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => abrirListaAlunos(t)}
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isMatutino ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : isVespertino ? 'text-sky-600 bg-sky-50 hover:bg-sky-100' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                                                            title="Visualizar Alunos"
                                                        >
                                                            <ArrowRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Nova Turma */}
            {modalAberto && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
                    onClick={(e) => {
                        // Close only if clicking the backdrop itself
                        if (e.target === e.currentTarget) definirModalAberto(false);
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Nova Turma</h2>
                                <p className="text-sm text-slate-500">Monte a identificação da turma selecionando as opções.</p>
                            </div>
                            <button
                                onClick={() => definirModalAberto(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* 1. Série */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1. Série (Ano)</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['1ª', '2ª', '3ª'].map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => definirNovaTurma(prev => ({ ...prev, serie: s }))}
                                            className={`p-3 rounded-xl border-2 font-black text-lg transition-all ${novaTurma.serie === s
                                                ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                                                : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Turno */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">2. Turno</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'Matutino', label: 'Manhã', icon: '☀️' },
                                        { id: 'Vespertino', label: 'Tarde', icon: '🌤️' },
                                        { id: 'Noturno', label: 'Noite', icon: '🌙' }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => definirNovaTurma(prev => ({ ...prev, turno: t.id }))}
                                            className={`p-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 ${novaTurma.turno === t.id
                                                ? 'border-orange-400 bg-orange-50 text-orange-600 shadow-sm'
                                                : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className="text-xl">{t.icon}</span>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Turma (Letra) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">3. Turma</label>
                                <div className="flex flex-wrap gap-2">
                                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(l => (
                                        <button
                                            key={l}
                                            type="button"
                                            onClick={() => definirNovaTurma(prev => ({ ...prev, letra: l }))}
                                            className={`w-10 h-10 rounded-lg border-2 font-bold transition-all ${novaTurma.letra === l
                                                ? 'border-slate-800 bg-slate-800 text-white shadow-lg'
                                                : 'border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                                }`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Visualização e Ação */}
                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 font-bold uppercase">Resultado</span>
                                    <span className="text-2xl font-black text-slate-800">
                                        {novaTurma.serie && novaTurma.letra
                                            ? `${novaTurma.serie} ${novaTurma.letra} - ${novaTurma.turno || '?'}`
                                            : 'Selecionar...'}
                                    </span>
                                </div>
                                <button
                                    onClick={adicionarTurma}
                                    disabled={!novaTurma.serie || !novaTurma.letra || !novaTurma.turno}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Plus size={20} /> Criar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Lista de Alunos */}
            {modalAlunosAberto && turmaSelecionada && (
                <ModalListaAlunos
                    turma={turmaSelecionada}
                    alunos={alunosDaTurma}
                    aoFechar={() => definirModalAlunosAberto(false)}
                />
            )}
        </LayoutAdministrativo>
    );
}
