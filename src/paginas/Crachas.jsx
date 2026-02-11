import { useState, useEffect } from 'react';
import { bancoLocal } from '../servicos/bancoLocal';
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

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
            {/* Interface Apenas Tela */}
            <div className="print:hidden mb-8">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Emissão de Crachás</h1>
                    <button
                        onClick={() => window.print()}
                        disabled={matriculasSelecionadas.length === 0}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Printer size={20} /> Imprimir {matriculasSelecionadas.length} Crachás
                    </button>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                    <h2 className="text-lg font-bold mb-4 text-slate-800">Selecione os Alunos</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {alunos.map(aluno => (
                            <div
                                key={aluno.matricula}
                                onClick={() => alternarSelecao(aluno.matricula)}
                                className={`p-4 border rounded-xl cursor-pointer transition-all ${matriculasSelecionadas.includes(aluno.matricula)
                                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                    }`}
                            >
                                <p className="font-bold text-sm truncate text-slate-800">{aluno.nome_completo}</p>
                                <p className="text-xs text-slate-500 mt-1 font-mono">{aluno.matricula}</p>
                                <p className="text-xs text-slate-400 mt-1 truncate">{obterNomeTurma(aluno.turma_id)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-sm text-slate-500 border-t border-slate-100 pt-4 flex gap-4">
                        <button
                            onClick={() => definirMatriculasSelecionadas(alunos.map(a => a.matricula))}
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            Selecionar Todos
                        </button>
                        <button
                            onClick={() => definirMatriculasSelecionadas([])}
                            className="text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Limpar Seleção
                        </button>
                    </div>
                </div>
            </div>

            {/* Layout de Impressão - Grade de Cartões */}
            {/* Ajustado para Caber em A4 - Aprox 4 por página dependendo do tamanho */}
            <div className="hidden print:grid grid-cols-2 gap-8 p-4">
                {alunosParaImprimir.map(aluno => (
                    <div key={aluno.matricula} className="break-inside-avoid relative">
                        {/* Design da Carteirinha (Baseado no Modal) */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-sm mx-auto flex flex-col">
                            {/* Header da Carteirinha */}
                            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 text-sm">Carteirinha Digital</h3>
                                {/* Logo ou detalhe adicional pode ir aqui */}
                            </div>

                            {/* Conteúdo Principal */}
                            <div className="p-6 flex flex-col items-center gap-4">
                                {/* QR Code Container */}
                                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                    <QRCode
                                        value={JSON.stringify({
                                            id: aluno.matricula,
                                            type: 'student'
                                        })}
                                        size={180}
                                        level="H"
                                    />
                                </div>

                                {/* Informações do Aluno */}
                                <div className="text-center w-full">
                                    <h2 className="text-lg font-bold text-slate-800 uppercase leading-tight px-2 break-words">
                                        {aluno.nome_completo}
                                    </h2>
                                    <p className="text-slate-500 font-mono mt-1 text-base font-medium">
                                        {aluno.matricula}
                                    </p>

                                    <div className="mt-3 inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-bold border border-slate-200">
                                        {obterNomeTurma(aluno.turma_id)}
                                    </div>
                                </div>
                            </div>

                            {/* Footer da Carteirinha */}
                            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
                                Escaneie este código na portaria para registrar acesso.
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
        </div>
    );
}
