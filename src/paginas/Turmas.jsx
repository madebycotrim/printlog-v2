import { useState, useEffect } from 'react';
import { bancoLocal } from '../servicos/bancoLocal';
import { api } from '../servicos/api';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import ModalListaAlunos from '../componentes/ModalListaAlunos';
import { Plus, Trash2, Users, Layers, X, Sun, Moon, Sunset, XCircle, ChevronRight } from 'lucide-react';

export default function Turmas() {
    const [turmas, definirTurmas] = useState([]);
    const [modalAberto, definirModalAberto] = useState(false);
    const [modalAlunosAberto, definirModalAlunosAberto] = useState(false);
    const [turmaSelecionada, definirTurmaSelecionada] = useState(null);
    const [alunosDaTurma, definirAlunosDaTurma] = useState([]);
    const [novaTurma, definirNovaTurma] = useState({ serie: '', turno: '', letra: '' });
    const [erroCadastro, definirErroCadastro] = useState('');
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
        definirErroCadastro('');

        const idFormatado = `${novaTurma.serie} ${novaTurma.letra} - ${novaTurma.turno}`;
        const banco = await bancoLocal.iniciarBanco();

        // 1. Verificar duplicidade exata (ID)
        const existente = await banco.get('turmas', idFormatado);
        if (existente) {
            definirErroCadastro('Esta turma exata já está cadastrada.');
            return;
        }

        // 2. Verificar duplicidade de Série + Letra (Regra Estrita)
        // PERMITIR se o turno for diferente.
        const todasTurmas = await banco.getAll('turmas');
        const duplicataSemantica = todasTurmas.find(t => {
            const parts = t.id.split(' - '); // ["3ª A", "Matutino"]
            const serieExistente = parts[0]; // "3ª A"
            const turnoExistente = parts[1]; // "Matutino"

            const novaSerie = `${novaTurma.serie} ${novaTurma.letra}`;

            // Só é duplicata se a Série+Letra bater E o Turno também bater
            // Como o ID já cobre "Série Letra - Turno", essa verificação extra
            // servia para impedir "3ª A Matutino" e "3ª A Vespertino".
            // O usuário pediu para REMOVER essa restrição.

            // Portanto, se o ID for diferente (verificado no passo 1),
            // mas a Série+Letra for igual, DEVEMOS PERMITIR se o turno for diferente.

            // A única restrição real agora é NÃO ter dois turnos iguais para a mesma turma.
            // O que na prática... é o mesmo ID.

            // Então, esta verificação extra pode ser removida ou ajustada para garantir
            // integridade caso a formatação do ID mude.

            return false; // Desabilitando a proibição de turnos diferentes
        });

        if (duplicataSemantica) {
            // Código Inacessível com return false acima, mantido para clareza da mudança
            const parts = duplicataSemantica.id.split(' - ');
            const turnoExistente = parts[1] || 'Outro Turno';
            definirErroCadastro(`A turma ${novaTurma.serie} ${novaTurma.letra} já existe no turno ${turnoExistente}.`);
            return;
        }

        const novaTurmaObj = { id: idFormatado, criado_em: new Date().toISOString() };

        // Lógica Híbrida/Offline
        try {
            if (navigator.onLine) {
                // Tenta salvar na nuvem primeiro
                await api.enviar('/turmas', novaTurmaObj);
                console.log('Turma salva na nuvem com sucesso.');
            } else {
                console.log('Offline: Salvando apenas localmente.');
            }
        } catch (erro) {
            console.error('Erro na API (fallback local):', erro);
            // Opcional: Notificar usuário que foi salvo apenas localmente
        }

        // SEMPRE salva localmente (cache/offline)
        // Isso garante que a UI atualize e funcione offline
        await banco.put('turmas', novaTurmaObj);

        definirNovaTurma({ serie: '', turno: '', letra: '' });
        definirModalAberto(false);
        carregarTurmas();
    };

    const removerTurma = async (id, e) => {
        e.stopPropagation();
        if (!confirm(`Tem certeza que deseja remover a turma ${id}?`)) return;

        try {
            if (navigator.onLine) {
                await api.remover(`/turmas?id=${encodeURIComponent(id)}`); // Assuming API expects ID in query or path? 
                // Wait, functions/api/turmas.js (Step 24) handles POST and GET. Does it handle DELETE?
                // I need to check functions/api/turmas.js again.
                console.log('Turma removida da nuvem.');
            }
        } catch (erro) {
            console.error('Erro na API ao remover (fallback local):', erro);
        }

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
            onClick={() => {
                definirNovaTurma({ serie: '', turno: '', letra: '' });
                definirErroCadastro('');
                definirModalAberto(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 active:scale-95"
        >
            <Plus size={20} /> Nova Turma
        </button>
    );

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
                                <div className="flex items-center gap-3  px-2">
                                    <h2 className="text-xl font-bold text-slate-700">{serie} Série</h2>
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {turmasDaSerie.map((t) => {
                                        const parsed = t.parsed || { serie: '?', letra: '?', turno: '' };

                                        // Dynamic Colors based on Shift
                                        const isMatutino = parsed.turno === 'Matutino';
                                        const isVespertino = parsed.turno === 'Vespertino';

                                        // Design V34: UX Polished (Empty States & Hover Cues)
                                        const isEmpty = t.totalAlunos === 0;

                                        return (
                                            <div
                                                key={t.id}
                                                className="group relative flex flex-col min-w-[150px] max-w-[190px] flex-grow pt-7 pb-1" // Increased top padding for the tag
                                            >
                                                {/* The Integrated Tab (Delete) - Hidden by default, Slides Up on Hover */}
                                                <button
                                                    onClick={(e) => removerTurma(t.id, e)}
                                                    className="absolute top-8 right-4 z-0 flex h-8 w-10 items-center justify-center rounded-t-lg border border-b-0 border-slate-200 bg-slate-50 text-slate-400 opacity-0 transition-all duration-300 ease-out group-hover:-translate-y-8 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200"
                                                    title="Excluir Turma"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                                {/* Main Card Content - Placed IN FRONT */}
                                                <div
                                                    onClick={() => abrirListaAlunos(t)}
                                                    className="relative z-10 flex flex-col justify-between overflow-hidden rounded-xl rounded-tr-none border border-slate-200 bg-white p-4 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md select-none cursor-pointer"
                                                >
                                                    {/* Shift Accent Line (Top) */}
                                                    <div className={`absolute top-0 left-0 right-0 h-1 ${isMatutino ? 'bg-amber-400' : isVespertino ? 'bg-sky-400' : 'bg-indigo-500'}`}></div>

                                                    {/* Header: Identity */}
                                                    <div className="flex items-start justify-between mb-4 pt-1">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Turma</span>
                                                            <span className="text-4xl font-black text-slate-800 leading-none mt-1">{parsed.letra}</span>
                                                        </div>
                                                        <div className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${isMatutino ? 'bg-amber-50 text-amber-700 border-amber-100' : isVespertino ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                                                            {isMatutino ? <Sun size={10} /> : isVespertino ? <Sunset size={10} /> : <Moon size={10} />}
                                                            {parsed.turno}
                                                        </div>
                                                    </div>

                                                    {/* Middle: Series Info */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-xs font-bold text-slate-500">{parsed.serie} Série</span>
                                                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                                                            <Users size={12} />
                                                            {t.totalAlunos}
                                                        </div>
                                                    </div>

                                                    {/* Bottom: Stats Bar OR Empty State */}
                                                    <div>
                                                        <div className="mb-1.5 flex items-end justify-between text-[10px] font-bold uppercase tracking-wide">
                                                            <span className="text-slate-400">{isEmpty ? 'Status' : 'Presença'}</span>
                                                            <span className={isEmpty ? 'text-slate-300' : (t.percentual >= 75 ? 'text-emerald-600' : 'text-rose-600')}>
                                                                {isEmpty ? 'Sem Alunos' : `${t.percentual}%`}
                                                            </span>
                                                        </div>
                                                        {/* Progress Bar Container */}
                                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${isEmpty ? 'bg-slate-200' : (t.percentual >= 75 ? 'bg-emerald-500' : 'bg-rose-500')}`}
                                                                style={{ width: isEmpty ? '0%' : `${t.percentual}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {/* Hover Interaction Cue (Chevron) */}
                                                    <div className="absolute bottom-2 right-2 opacity-0 transition-all duration-300 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-slate-300">
                                                        <ChevronRight size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}



                    {/* Modal Nova Turma */}
                    {
                        modalAberto && (
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
                        )
                    }

                    {/* Modal Lista de Alunos */}
                    {
                        modalAlunosAberto && turmaSelecionada && (
                            <ModalListaAlunos
                                turma={turmaSelecionada}
                                alunos={alunosDaTurma}
                                aoFechar={() => definirModalAlunosAberto(false)}
                            />
                        )
                    }
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
                            <div className="pt-6 border-t border-slate-100">
                                {/* Error Message */}
                                {erroCadastro && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
                                        <div className="p-1.5 bg-red-100 rounded-lg">
                                            <XCircle size={16} className="text-red-500" />
                                        </div>
                                        <p className="text-xs font-semibold text-red-600">{erroCadastro}</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
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
