import { useState, useEffect } from 'react';
import { bancoLocal } from '../servicos/bancoLocal';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import { Plus, Trash2, Users, Layers, X } from 'lucide-react';

export default function Turmas() {
    const [turmas, definirTurmas] = useState([]);
    const [modalAberto, definirModalAberto] = useState(false);
    const [novaTurma, definirNovaTurma] = useState({ serie: '', turno: '', letra: '' });
    const [carregando, definirCarregando] = useState(true);

    useEffect(() => {
        carregarTurmas();
    }, []);

    const carregarTurmas = async () => {
        const banco = await bancoLocal.iniciarBanco();
        const todasTurmas = await banco.getAll('turmas');
        // Ordenar logicamente (1º, 2º, 3º...)
        todasTurmas.sort((a, b) => a.id.localeCompare(b.id));
        definirTurmas(todasTurmas);
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

    const removerTurma = async (id) => {
        if (!confirm(`Tem certeza que deseja remover a turma ${id}?`)) return;
        const banco = await bancoLocal.iniciarBanco();
        await banco.delete('turmas', id);
        carregarTurmas();
    };

    const AcoesHeader = (
        <button
            onClick={() => definirModalAberto(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow-md shadow-blue-600/20"
        >
            <Plus size={20} /> Nova Turma
        </button>
    );

    return (
        <LayoutAdministrativo titulo="Gerenciar Turmas" subtitulo="Organização das séries e turmas da escola" acoes={AcoesHeader}>

            {carregando ? (
                <div className="p-8 text-center text-slate-500 animate-pulse">Carregando turmas...</div>
            ) : turmas.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Layers size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">Nenhuma turma cadastrada</h3>
                    <p className="text-slate-500 max-w-md mt-2">Clique em "Nova Turma" para começar a organizar os alunos.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {turmas.map((t) => (
                        <div key={t.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Users size={24} />
                                </div>
                                <span className="text-xs font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded">2026</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">{t.id}</h3>
                            <p className="text-sm text-slate-500 font-medium">Ensino Médio</p>

                            <button
                                onClick={() => removerTurma(t.id)}
                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                title="Remover Turma"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
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
        </LayoutAdministrativo>
    );
}
