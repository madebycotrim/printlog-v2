import React from 'react';
import { X, User, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function ModalListaAlunos({ turma, alunos, aoFechar }) {
    const [busca, definirBusca] = useState('');

    const alunosFiltrados = useMemo(() => {
        if (!alunos) return [];
        return alunos.filter(aluno =>
            aluno.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
            aluno.matricula.toLowerCase().includes(busca.toLowerCase())
        ).sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));
    }, [alunos, busca]);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity" onClick={(e) => {
            if (e.target === e.currentTarget) aoFechar();
        }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[85vh]">

                {/* Cabeçalho */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">{turma.id}</span>
                            Lista de Alunos
                        </h2>
                        <p className="text-sm text-slate-500">
                            Total de {alunos.length} aluno{alunos.length !== 1 && 's'} matriculados
                        </p>
                    </div>
                    <button
                        onClick={aoFechar}
                        className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Busca */}
                <div className="p-4 border-b border-slate-100 bg-white">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar aluno por nome ou matrícula..."
                            value={busca}
                            onChange={(e) => definirBusca(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto p-2">
                    {alunosFiltrados.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            {busca ? 'Nenhum aluno encontrado na busca.' : 'Nenhum aluno cadastrado nesta turma.'}
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {alunosFiltrados.map(aluno => (
                                <div key={aluno.matricula} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100 group">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                        <User size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-700 truncate">{aluno.nome_completo}</h4>
                                        <p className="text-xs text-slate-400 font-mono">{aluno.matricula}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rodapé */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-right">
                    <button
                        onClick={aoFechar}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
