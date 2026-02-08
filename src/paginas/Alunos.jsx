import { useState, useEffect } from 'react';
import { api } from '../servicos/api';
import { bancoLocal } from '../servicos/bancoLocal';
import { servicoSincronizacao } from '../servicos/sincronizacao';
import { Plus, Search, RefreshCw, Trash2, FileSpreadsheet } from 'lucide-react';
import { importadorPlanilhas } from '../servicos/importadorPlanilhas';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';

export default function Alunos() {
    const [alunos, definirAlunos] = useState([]);
    const [filtro, definirFiltro] = useState('');
    const [carregando, definirCarregando] = useState(true);
    const [modalAberto, definirModalAberto] = useState(false);

    // Form Novo Aluno
    const [novoAluno, definirNovoAluno] = useState({ matricula: '', nome_completo: '', turma_id: '' });

    const carregarAlunos = async () => {
        definirCarregando(true);
        try {
            const banco = await bancoLocal.iniciarBanco();
            const todos = await banco.getAll('alunos');
            definirAlunos(todos);
        } catch (erro) {
            console.error(erro);
        } finally {
            definirCarregando(false);
        }
    };

    useEffect(() => {
        carregarAlunos();
    }, []);

    const aoSincronizar = async () => {
        definirCarregando(true);
        await servicoSincronizacao.sincronizarAlunos();
        await carregarAlunos();
    };

    const aoSalvarAluno = async (evento) => {
        evento.preventDefault();
        try {
            // 1. Salvar na API (se online)
            await api.enviar('/alunos', novoAluno);

            // 2. Atualizar Local
            await bancoLocal.salvarAlunos([novoAluno]);

            definirModalAberto(false);
            definirNovoAluno({ matricula: '', nome_completo: '', turma_id: '' });
            carregarAlunos();
            alert('Aluno salvo com sucesso!');
        } catch (erro) {
            alert('Erro: ' + erro.message);
        }
    };

    // Estado para Importação
    const [modalImportarAberto, definirModalImportarAberto] = useState(false);
    const [textoImportacao, definirTextoImportacao] = useState('');
    const [alunosParaImportar, definirAlunosParaImportar] = useState([]);

    const processarImportacao = () => {
        const dados = importadorPlanilhas.processarCSV(textoImportacao);
        definirAlunosParaImportar(dados);
    };

    const confirmarImportacao = async () => {
        if (alunosParaImportar.length === 0) return;

        try {
            definirCarregando(true);
            // Salvar em lote no banco local (Adicionar/Atualizar sem apagar anteriores)
            await bancoLocal.importarAlunos(alunosParaImportar);

            // Tentar enviar para API em background (sem bloquear UI)
            // TODO: Implementar envio em lote para API também se necessário
            // Por enquanto confiamos na sincronização posterior ou envio individual
            // Mas para garantir, podemos enviar para a API se estiver online:
            if (navigator.onLine) {
                servicoSincronizacao.sincronizarAlunos().catch(console.error);
            }

            alert(`${alunosParaImportar.length} alunos importados com sucesso!`);
            definirModalImportarAberto(false);
            definirTextoImportacao('');
            definirAlunosParaImportar([]);
            carregarAlunos();
        } catch (erro) {
            alert('Erro ao importar: ' + erro.message);
        } finally {
            definirCarregando(false);
        }
    };

    const alunosFiltrados = alunos.filter(a =>
        a.nome_completo.toLowerCase().includes(filtro.toLowerCase()) ||
        a.matricula.includes(filtro)
    );

    // Ações do Header (Botões)
    const AcoesHeader = (
        <div className="flex gap-2">
            <button
                onClick={() => definirModalImportarAberto(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium shadow-sm"
            >
                <FileSpreadsheet size={20} /> Importar CSV
            </button>
            <button
                onClick={() => definirModalAberto(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow-md shadow-blue-600/20"
            >
                <Plus size={20} /> Novo Aluno
            </button>
        </div>
    );

    return (
        <LayoutAdministrativo titulo="Gerenciar Alunos" subtitulo="Cadastro e manutenção da base de estudantes" acoes={AcoesHeader}>
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou matrícula..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                        value={filtro}
                        onChange={(e) => definirFiltro(e.target.value)}
                    />
                </div>
                <button
                    onClick={aoSincronizar}
                    className="flex items-center justify-center gap-2 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                    <RefreshCw size={20} className={carregando ? 'animate-spin' : ''} /> Sincronizar
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Matrícula</th>
                            <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Nome Completo</th>
                            <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Turma</th>
                            <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {carregando ? (
                            <tr><td colSpan="4" className="p-8 text-center text-slate-400">Carregando base de dados...</td></tr>
                        ) : alunosFiltrados.length === 0 ? (
                            <tr><td colSpan="4" className="p-12 text-center text-slate-400 italic">Nenhum aluno encontrado com este filtro.</td></tr>
                        ) : (
                            alunosFiltrados.map(aluno => (
                                <tr key={aluno.matricula} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-4 font-mono text-slate-600 font-bold">{aluno.matricula}</td>
                                    <td className="p-4 font-medium text-slate-800 uppercase">{aluno.nome_completo}</td>
                                    <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold">{aluno.turma_id}</span></td>
                                    <td className="p-4 text-right">
                                        <button className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Novo Aluno */}
            {modalAberto && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Novo Aluno</h2>
                        <form onSubmit={aoSalvarAluno}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2 text-slate-700">Matrícula</label>
                                <input
                                    required
                                    className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-mono"
                                    value={novoAluno.matricula}
                                    onChange={e => definirNovoAluno({ ...novoAluno, matricula: e.target.value })}
                                    placeholder="Ex: 2024001"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2 text-slate-700">Nome Completo</label>
                                <input
                                    required
                                    className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all uppercase"
                                    value={novoAluno.nome_completo}
                                    onChange={e => definirNovoAluno({ ...novoAluno, nome_completo: e.target.value })}
                                    placeholder="NOME DO ALUNO"
                                />
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-bold mb-2 text-slate-700">Turma</label>
                                <input
                                    required
                                    className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                                    placeholder="Ex: 3A"
                                    value={novoAluno.turma_id}
                                    onChange={e => definirNovoAluno({ ...novoAluno, turma_id: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => definirModalAberto(false)}
                                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                                >
                                    Salvar Aluno
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Importar CSV */}
            {modalImportarAberto && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                <FileSpreadsheet size={24} />
                            </div>
                            Importar Alunos (CSV/Excel)
                        </h2>

                        <div className="flex-1 flex flex-col gap-4 overflow-hidden mb-6">
                            {!alunosParaImportar.length ? (
                                <>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                                        <p className="font-bold text-slate-800 mb-1">Como importa?</p>
                                        Copie os dados da sua planilha (Excel, Sheets, SIGE) e cole abaixo.<br />
                                        A ordem ideal das colunas é: <strong className="text-slate-800">Matrícula, Nome, Turma</strong>.
                                    </div>
                                    <textarea
                                        className="flex-1 w-full border border-slate-200 p-4 rounded-xl font-mono text-sm resize-none focus:border-green-500 focus:ring-4 focus:ring-green-50 focus:outline-none transition-all"
                                        placeholder={`Exemplo:\n2024001, João Silva, 3A\n2024002, Maria Souza, 2B\n...`}
                                        value={textoImportacao}
                                        onChange={e => definirTextoImportacao(e.target.value)}
                                    ></textarea>
                                </>
                            ) : (
                                <div className="flex-1 overflow-auto border border-slate-200 rounded-xl">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 sticky top-0">
                                            <tr>
                                                <th className="p-3 border-b border-slate-200 font-bold text-slate-600">Matrícula</th>
                                                <th className="p-3 border-b border-slate-200 font-bold text-slate-600">Nome</th>
                                                <th className="p-3 border-b border-slate-200 font-bold text-slate-600">Turma</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {alunosParaImportar.map((a, i) => (
                                                <tr key={i}>
                                                    <td className="p-3 font-mono text-slate-600">{a.matricula}</td>
                                                    <td className="p-3 font-medium text-slate-800 uppercase">{a.nome_completo}</td>
                                                    <td className="p-3 text-slate-500">{a.turma_id}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-100 pt-6">
                            <div className="text-sm font-medium text-slate-500">
                                {alunosParaImportar.length > 0 && (
                                    <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md">
                                        {alunosParaImportar.length} alunos identificados
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        definirModalImportarAberto(false);
                                        definirAlunosParaImportar([]);
                                        definirTextoImportacao('');
                                    }}
                                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                {alunosParaImportar.length === 0 ? (
                                    <button
                                        onClick={processarImportacao}
                                        disabled={!textoImportacao.trim()}
                                        className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-green-600/20 transition-all"
                                    >
                                        Processar Dados
                                    </button>
                                ) : (
                                    <button
                                        onClick={confirmarImportacao}
                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                                    >
                                        Confirmar Importação
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </LayoutAdministrativo>
    );
}
