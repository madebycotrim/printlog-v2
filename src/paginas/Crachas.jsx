import { useState, useEffect } from 'react';
import { bancoLocal } from '../servicos/bancoLocal';
import QRCode from "react-qr-code";
import { Printer } from 'lucide-react';

export default function Crachas() {
    const [alunos, definirAlunos] = useState([]);
    const [matriculasSelecionadas, definirMatriculasSelecionadas] = useState([]);

    useEffect(() => {
        // Carregar todos os alunos
        const carregarDados = async () => {
            const banco = await bancoLocal.iniciarBanco();
            const todosAlunos = await banco.getAll('alunos');
            definirAlunos(todosAlunos);
        };
        carregarDados();
    }, []);

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
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Printer size={20} /> Imprimir {matriculasSelecionadas.length} Crachás
                    </button>
                </header>

                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-lg font-bold mb-4">Selecione os Alunos</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
                        {alunos.map(aluno => (
                            <div
                                key={aluno.matricula}
                                onClick={() => alternarSelecao(aluno.matricula)}
                                className={`p-4 border rounded cursor-pointer transition-colors ${matriculasSelecionadas.includes(aluno.matricula)
                                    ? 'bg-blue-100 border-blue-500'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                            >
                                <p className="font-bold text-sm truncate">{aluno.nome_completo}</p>
                                <p className="text-xs text-gray-500">{aluno.turma_id}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        <button
                            onClick={() => definirMatriculasSelecionadas(alunos.map(a => a.matricula))}
                            className="text-blue-600 hover:underline mr-4"
                        >
                            Selecionar Todos
                        </button>
                        <button
                            onClick={() => definirMatriculasSelecionadas([])}
                            className="text-gray-600 hover:underline"
                        >
                            Limpar Seleção
                        </button>
                    </div>
                </div>
            </div>

            {/* Layout de Impressão - Grade de Cartões */}
            <div className="hidden print:grid grid-cols-2 gap-4">
                {alunosParaImprimir.map(aluno => (
                    <div key={aluno.matricula} className="border-2 border-dashed border-gray-300 p-4 rounded-lg flex items-center gap-4 break-inside-avoid">
                        <div className="bg-white p-2 border rounded">
                            <QRCode
                                value={aluno.matricula}
                                size={100}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold uppercase">{aluno.nome_completo}</h3>
                            <p className="text-lg font-mono">{aluno.matricula}</p>
                            <p className="text-md text-gray-600 font-bold mt-1 bg-gray-200 inline-block px-2 rounded">
                                {aluno.turma_id || 'SEM TURMA'}
                            </p>
                            <p className="text-xs mt-2 text-gray-400">CEM 03 Taguatinga - SCAE</p>
                        </div>
                    </div>
                ))}
                {alunosParaImprimir.length === 0 && (
                    <div className="text-center p-10 text-gray-400 print:hidden">Nenhum aluno selecionado para impressão.</div>
                )}
            </div>

            {/* Helper message for print preview */}
            <style>{`
        @media print {
          @page { margin: 1cm; size: A4; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
        </div>
    );
}
