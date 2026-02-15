import { useState, useEffect } from 'react';
import { bancoLocal } from '../servicos/bancoLocal';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import QRCode from "react-qr-code";
import { Printer } from 'lucide-react';

export default function Crachas() {
    const [alunos, definirAlunos] = useState([]);
    const [turmas, definirTurmas] = useState([]);
    const [matriculasSelecionadas, definirMatriculasSelecionadas] = useState([]);

    useEffect(() => {
        const carregarDados = async () => {
            const banco = await bancoLocal.iniciarBanco();
            const todosAlunos = await banco.getAll('alunos');
            const todasTurmas = await banco.getAll('turmas');

            definirAlunos(todosAlunos);
            definirTurmas(todasTurmas);
        };
        carregarDados();
    }, []);

    const obterNomeTurma = (idTurma) => {
        const turma = turmas.find(t => t.id === idTurma);
        if (turma && turma.serie && turma.letra && turma.turno) {
            return `${turma.serie} ${turma.letra} - ${turma.turno}`;
        }

        // Tenta parsear legado se necessário
        try {
            const partes = idTurma.split(' - ');
            const info = partes[0] ? partes[0].split(' ') : [];
            if (info.length >= 2) {
                return `${info[0]} ${info[1]} - ${partes[1] || '?'}`;
            }
        } catch {
            // Ignora erro
        }

        return idTurma || 'SEM TURMA';
    };

    const alternarSelecao = (matricula) => {
        if (matriculasSelecionadas.includes(matricula)) {
            definirMatriculasSelecionadas(matriculasSelecionadas.filter(id => id !== matricula));
        } else {
            definirMatriculasSelecionadas([...matriculasSelecionadas, matricula]);
        }
    };

    const alunosParaImprimir = alunos.filter(a => matriculasSelecionadas.includes(a.matricula));

    const AcoesHeader = (
        <button
            onClick={() => window.print()}
            disabled={matriculasSelecionadas.length === 0}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Printer size={20} /> Imprimir {matriculasSelecionadas.length} Crachás
        </button>
    );

    return (
        <LayoutAdministrativo titulo="Emissão de Crachás" subtitulo="Selecione e imprima carteirinhas de estudantes" acoes={AcoesHeader}>
            {/* Interface de Seleção */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8">
                <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                    Selecione os Alunos
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {alunos.map(aluno => (
                        <div
                            key={aluno.matricula}
                            onClick={() => alternarSelecao(aluno.matricula)}
                            className={`p-4 border rounded-2xl cursor-pointer transition-all duration-200 group relative overflow-hidden ${matriculasSelecionadas.includes(aluno.matricula)
                                ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500 shadow-md transform scale-[1.02]'
                                : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md hover:-translate-y-1'
                                }`}
                        >
                            <div className={`absolute top-0 right-0 p-1.5 rounded-bl-xl transition-colors ${matriculasSelecionadas.includes(aluno.matricula) ? 'bg-indigo-500' : 'bg-transparent'}`}>
                                {matriculasSelecionadas.includes(aluno.matricula) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>

                            <p className={`font-bold text-sm truncate transition-colors ${matriculasSelecionadas.includes(aluno.matricula) ? 'text-indigo-900' : 'text-slate-700 group-hover:text-indigo-700'}`}>
                                {aluno.nome_completo}
                            </p>
                            <p className="text-[10px] font-mono mt-2 text-slate-400 uppercase tracking-wider">{aluno.matricula}</p>
                            <p className="text-xs text-slate-500 mt-1 truncate font-medium bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                                {obterNomeTurma(aluno.turma_id)}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 text-sm text-slate-500 border-t border-slate-100 pt-6 flex gap-4">
                    <button
                        onClick={() => definirMatriculasSelecionadas(alunos.map(a => a.matricula))}
                        className="text-indigo-600 hover:text-indigo-800 font-bold hover:bg-indigo-50 px-3 py-1 rounded transition-colors"
                    >
                        Selecionar Todos
                    </button>
                    <button
                        onClick={() => definirMatriculasSelecionadas([])}
                        className="text-slate-500 hover:text-slate-700 font-medium hover:bg-slate-50 px-3 py-1 rounded transition-colors"
                    >
                        Limpar Seleção
                    </button>
                </div>
            </div>

            {/* Layout de Impressão - Grade de Cartões */}
            {/* Ajustado para Caber em A4 - Aprox 4 por página dependendo do tamanho */}
            <div className="hidden print:grid grid-cols-2 gap-8 p-4">
                {alunosParaImprimir.map(aluno => (
                    <div key={aluno.matricula} className="break-inside-avoid relative">
                        {/* Design da Carteirinha (Baseado no Modal) */}
                        <div className="bg-white rounded-[2rem] border-2 border-slate-900 overflow-hidden w-full max-w-[350px] mx-auto flex flex-col h-[500px] relative">
                            {/* Background Pattern */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-slate-900 z-0">
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-tl-full"></div>
                            </div>

                            {/* Header da Carteirinha */}
                            <div className="p-6 relative z-10 flex flex-col items-center">
                                <h3 className="font-black text-white text-xl tracking-widest uppercase mb-1">Passaporte</h3>
                                <div className="text-[10px] text-white/60 tracking-[0.2em] uppercase">Estudante</div>
                            </div>

                            {/* Conteúdo Principal */}
                            <div className="flex-1 flex flex-col items-center justify-start pt-4 px-6 gap-4 relative z-10">
                                {/* Foto/Avatar Placeholder */}
                                <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-lg flex items-center justify-center text-3xl font-black text-slate-400 mb-2">
                                    {aluno.nome_completo.charAt(0)}
                                </div>

                                {/* Informações do Aluno */}
                                <div className="text-center w-full">
                                    <h2 className="text-2xl font-black text-slate-900 uppercase leading-none px-2 break-words mb-2">
                                        {aluno.nome_completo}
                                    </h2>
                                    <p className="text-slate-500 font-mono text-sm tracking-widest">
                                        {aluno.matricula}
                                    </p>

                                    <div className="mt-4 inline-block px-6 py-2 bg-slate-900 text-white rounded-full text-lg font-bold shadow-md">
                                        {obterNomeTurma(aluno.turma_id)}
                                    </div>
                                </div>

                                {/* QR Code Container */}
                                <div className="mt-auto mb-8 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                                    <QRCode
                                        value={JSON.stringify({
                                            id: aluno.matricula,
                                            type: 'student'
                                        })}
                                        size={120}
                                        level="H"
                                    />
                                </div>
                            </div>

                            {/* Footer da Carteirinha */}
                            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                                Sistema de Controle de Acesso Escolar
                            </div>
                        </div>
                    </div>
                ))}

                {alunosParaImprimir.length === 0 && (
                    <div className="text-center p-10 text-gray-400 print:hidden col-span-2">
                        Nenhum aluno selecionado para impressão.
                    </div>
                )}
            </div>

            {/* Helper message for print preview */}
            <style>{`
                @media print {
                  @page { margin: 0.5cm; size: A4; }
                  body { -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </LayoutAdministrativo>
    );
}
