import { useState, useEffect } from 'react';
import { api } from '../servicos/api';
import { bancoLocal } from '../servicos/bancoLocal';
import { servicoSincronizacao } from '../servicos/sincronizacao';
import { Plus, Search, RefreshCw, Trash2, FileSpreadsheet, Edit, Filter, X, MoreVertical, User, ChevronLeft, ChevronRight, GraduationCap, QrCode } from 'lucide-react';
import QRCode from "react-qr-code";

import { importadorPlanilhas } from '../servicos/importadorPlanilhas';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import ModalConfirmacao from '../componentes/ModalConfirmacao';

export default function Alunos() {
    const [alunos, definirAlunos] = useState([]);
    const [filtro, definirFiltro] = useState('');
    const [filtroTurma, definirFiltroTurma] = useState('');
    const [carregando, definirCarregando] = useState(true);
    const [modalAberto, definirModalAberto] = useState(false);
    const [alunoSendoEditado, definirAlunoSendoEditado] = useState(null);


    const [alunoParaQrCode, definirAlunoParaQrCode] = useState(null);

    // Paginação
    const [paginaAtual, definirPaginaAtual] = useState(1);
    const itensPorPagina = 10;

    // Helpers UI
    const obterIniciais = (nome) => {
        if (!nome) return '??';
        const partes = nome.trim().split(' ');
        if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    };

    const obterCorTurno = (nomeTurma) => {
        if (!nomeTurma) return 'bg-slate-100 text-slate-600';
        const texto = nomeTurma.toLowerCase();
        if (texto.includes('matutino')) return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        if (texto.includes('vespertino')) return 'bg-blue-100 text-blue-800 border border-blue-200';
        if (texto.includes('noturno')) return 'bg-purple-100 text-purple-800 border border-purple-200';
        if (texto.includes('integral')) return 'bg-green-100 text-green-800 border border-green-200';
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    };

    // Form Novo Aluno
    const [novoAluno, definirNovoAluno] = useState({ matricula: '', nome_completo: '', turma_id: '' });
    const [erroMatricula, definirErroMatricula] = useState('');

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

    // Carregar Turmas para o Select
    const [turmasDisponiveis, definirTurmasDisponiveis] = useState([]);

    const carregarTurmas = async () => {
        const banco = await bancoLocal.iniciarBanco();
        const turmas = await banco.getAll('turmas');

        const turmasFormatadas = turmas.map(t => {
            let nomeExibicao = t.id;
            if (t.serie && t.letra && t.turno) {
                nomeExibicao = `${t.serie} ${t.letra} - ${t.turno}`;
            } else {
                // Tenta parsear legado se necessário (opcional, mas bom pra compatibilidade)
                try {
                    const partes = t.id.split(' - ');
                    const info = partes[0] ? partes[0].split(' ') : [];
                    if (info.length >= 2) {
                        nomeExibicao = `${info[0]} ${info[1]} - ${partes[1] || '?'}`;
                    }
                } catch {
                    // Mantém o ID original
                }
            }
            return { ...t, nomeExibicao };
        });

        turmasFormatadas.sort((a, b) => a.nomeExibicao.localeCompare(b.nomeExibicao));
        definirTurmasDisponiveis(turmasFormatadas);
    };

    useEffect(() => {
        carregarAlunos();
        carregarTurmas();
    }, []);

    const aoSincronizar = async () => {
        definirCarregando(true);
        await servicoSincronizacao.sincronizarAlunos();
        await carregarAlunos();
    };

    const [confirmacao, setConfirmacao] = useState(null);

    const solicitarRemocao = (matricula) => {
        setConfirmacao({
            titulo: "Remover Aluno",
            mensagem: `Tem certeza que deseja remover o aluno ${matricula}? Esta ação não pode ser desfeita.`,
            acao: () => removerAluno(matricula),
            tipo: "perigo",
            textoConfirmar: "Sim, remover"
        });
    };

    const removerAluno = async (matricula) => {
        try {
            if (navigator.onLine) {
                try {
                    await api.remover(`/alunos?matricula=${matricula}`);
                    console.log('Aluno removido da nuvem.');
                } catch (e) {
                    console.error('Erro ao remover da nuvem:', e);
                }
            }

            const banco = await bancoLocal.iniciarBanco();
            await banco.delete('alunos', matricula);
            carregarAlunos();
        } catch (erro) {
            console.error(erro);
            alert('Erro ao remover aluno');
        }
    };

    const aoSalvarAluno = async (evento) => {
        evento.preventDefault();

        // Verificar duplicidade de matrícula (apenas na criação)
        if (!alunoSendoEditado) {
            const matriculaExiste = alunos.some(a => String(a.matricula).trim() === String(novoAluno.matricula).trim());
            if (matriculaExiste) {
                definirErroMatricula('Esta matrícula já está cadastrada para outro aluno.');
                return;
            }
        }

        definirErroMatricula('');

        try {
            // 1. Salvar na API (se online)
            if (navigator.onLine) {
                try {
                    await api.enviar('/alunos', novoAluno);
                    console.log('Aluno salvo na nuvem.');
                } catch (apiErro) {
                    console.error('Erro ao salvar na nuvem (fallback local):', apiErro);
                }
            } else {
                console.log('Offline: Salvando aluno localmente.');
            }

            // 2. Atualizar Local (Sempre, para UI e redundância)
            // Usa importarAlunos para fazer upsert sem apagar os outros
            await bancoLocal.importarAlunos([novoAluno]);

            fecharModal();
            carregarAlunos();
        } catch (erro) {
            alert('Erro crítico ao salvar: ' + erro.message);
        }
    };

    const abrirModalEdicao = (aluno) => {
        definirAlunoSendoEditado(aluno);
        definirNovoAluno(aluno);
        definirModalAberto(true);
    };

    const fecharModal = () => {
        definirModalAberto(false);
        definirNovoAluno({ matricula: '', nome_completo: '', turma_id: '' });
        definirAlunoSendoEditado(null);
        definirErroMatricula('');
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

    const alunosFiltrados = alunos.filter(a => {
        const matchTexto =
            a.nome_completo.toLowerCase().includes(filtro.toLowerCase()) ||
            a.matricula.includes(filtro);
        const matchTurma = !filtroTurma || a.turma_id === filtroTurma;
        return matchTexto && matchTurma;
    });

    // Lógica de Paginação
    const totalPaginas = Math.ceil(alunosFiltrados.length / itensPorPagina);
    const indiceInicial = (paginaAtual - 1) * itensPorPagina;
    const alunosPaginados = alunosFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

    // Resetar página quando filtrar
    useEffect(() => {
        definirPaginaAtual(1);
    }, [filtro, filtroTurma]);

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
        <LayoutAdministrativo titulo="Alunos" subtitulo="Cadastro e manutenção da base de estudantes" acoes={AcoesHeader}>
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

                <div className="relative min-w-[200px]">
                    <select
                        value={filtroTurma}
                        onChange={(e) => definirFiltroTurma(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all appearance-none cursor-pointer bg-white text-slate-600 font-medium"
                    >
                        <option value="">Todas as Turmas</option>
                        {turmasDisponiveis.map(t => (
                            <option key={t.id} value={t.id}>{t.nomeExibicao}</option>
                        ))}
                    </select>
                    <Filter className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={18} />
                </div>
                <button
                    onClick={aoSincronizar}
                    className="flex items-center justify-center gap-2 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                    <RefreshCw size={20} className={carregando ? 'animate-spin' : ''} /> Sincronizar
                </button>
            </div>


            {/* Cards Resumo (KPIs) - Opcional, pode ser adicionado futuramente */}

            {/* Table Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Aluno</th>
                                <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Matrícula</th>
                                <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Turma</th>
                                <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {carregando ? (
                                <tr><td colSpan="4" className="p-12 text-center text-slate-500 font-medium animate-pulse">Carregando base de dados...</td></tr>
                            ) : alunosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-16 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <GraduationCap size={40} className="text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum aluno encontrado</h3>
                                            <p className="text-slate-500 text-sm mb-6">Não encontramos nenhum aluno com os filtros atuais. Que tal cadastrar um novo?</p>
                                            <button
                                                onClick={() => definirModalAberto(true)}
                                                className="text-blue-600 font-bold text-sm hover:underline"
                                            >
                                                Cadastrar Novo Aluno
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                alunosPaginados.map(aluno => {
                                    const turmaNome = turmasDisponiveis.find(t => t.id === aluno.turma_id)?.nomeExibicao || aluno.turma_id;
                                    const corBadge = obterCorTurno(turmaNome);

                                    return (
                                        <tr key={aluno.matricula} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${['bg-red-100 text-red-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-purple-100 text-purple-700'][Math.floor(Math.random() * 5)]
                                                        }`}>
                                                        {obterIniciais(aluno.nome_completo)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-700 uppercase leading-tight">{aluno.nome_completo}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <code className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold border border-slate-200">
                                                    {aluno.matricula}
                                                </code>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${corBadge}`}>
                                                    {turmaNome}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => definirAlunoParaQrCode(aluno)}
                                                        className="text-slate-400 hover:text-purple-600 transition-colors p-2 hover:bg-purple-50 rounded-lg"
                                                        title="Ver QR Code"
                                                    >
                                                        <QrCode size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => abrirModalEdicao(aluno)}
                                                        className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                                                        title="Editar"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => solicitarRemocao(aluno.matricula)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                                        title="Remover"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                {!carregando && alunosFiltrados.length > 0 && (
                    <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white">
                        <div className="text-sm text-slate-500">
                            Mostrando <span className="font-bold text-slate-700">{indiceInicial + 1}</span> a <span className="font-bold text-slate-700">{Math.min(indiceInicial + itensPorPagina, alunosFiltrados.length)}</span> de <span className="font-bold text-slate-700">{alunosFiltrados.length}</span> alunos
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => definirPaginaAtual(p => Math.max(1, p - 1))}
                                disabled={paginaAtual === 1}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-medium text-slate-600 px-2">
                                Página {paginaAtual} de {totalPaginas}
                            </span>
                            <button
                                onClick={() => definirPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                                disabled={paginaAtual === totalPaginas}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Novo Aluno */}
            {
                modalAberto && (
                    <div
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) fecharModal();
                        }}
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
                            {/* Header Moderno */}
                            <div className="p-6 flex items-start gap-4 bg-blue-50">
                                <div className="p-3 rounded-xl bg-white shadow-sm shrink-0">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-slate-800 leading-tight">
                                        {alunoSendoEditado ? 'Editar Aluno' : 'Novo Aluno'}
                                    </h2>
                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                        {alunoSendoEditado
                                            ? 'Atualize os dados do aluno abaixo.'
                                            : 'Preencha os dados abaixo para cadastrar um novo aluno.'}
                                    </p>
                                </div>
                                <button
                                    onClick={fecharModal}
                                    className="text-slate-400 hover:text-slate-600 bg-white/50 hover:bg-white p-1 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Conteúdo Scrollável */}
                            <form onSubmit={aoSalvarAluno} className="flex flex-col flex-1 overflow-hidden">
                                <div className="p-6 space-y-6 overflow-y-auto">
                                    <div className="space-y-4">
                                        {/* Matrícula */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Matrícula</label>
                                            <input
                                                required
                                                disabled={!!alunoSendoEditado}
                                                className={`w-full border p-3 rounded-xl focus:outline-none focus:ring-4 transition-all font-mono font-bold text-slate-700 
                                                    ${erroMatricula ? 'border-red-300 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-50'}
                                                    ${alunoSendoEditado ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
                                                value={novoAluno.matricula}
                                                onChange={e => {
                                                    definirNovoAluno({ ...novoAluno, matricula: e.target.value });
                                                    if (erroMatricula) definirErroMatricula('');
                                                }}
                                                placeholder="Ex: 2024001"
                                            />
                                            {erroMatricula && (
                                                <p className="text-red-500 text-sm mt-1 font-medium animate-pulse">
                                                    {erroMatricula}
                                                </p>
                                            )}
                                        </div>

                                        {/* Nome Completo */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome Completo</label>
                                            <input
                                                required
                                                className="w-full border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all uppercase font-medium text-slate-700"
                                                value={novoAluno.nome_completo}
                                                onChange={e => definirNovoAluno({ ...novoAluno, nome_completo: e.target.value })}
                                                placeholder="NOME DO ALUNO"
                                            />
                                        </div>

                                        {/* Turma */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Turma</label>
                                            {turmasDisponiveis.length > 0 ? (
                                                <div className="relative">
                                                    <select
                                                        required
                                                        className="w-full border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-white appearance-none font-medium text-slate-700"
                                                        value={novoAluno.turma_id}
                                                        onChange={e => definirNovoAluno({ ...novoAluno, turma_id: e.target.value })}
                                                    >
                                                        <option value="">Selecione a turma...</option>
                                                        {turmasDisponiveis.map(t => (
                                                            <option key={t.id} value={t.id}>{t.nomeExibicao}</option>
                                                        ))}
                                                    </select>
                                                    {/* Seta customizada ou ícone poderia ir aqui */}
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 text-sm font-medium flex items-center gap-2">
                                                    <span>⚠️</span> Nenhuma turma encontrada. Cadastre em "Turmas" primeiro.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Ações */}
                                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3 mt-auto">
                                    <button
                                        type="button"
                                        onClick={fecharModal}
                                        className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 hover:-translate-y-0.5"
                                    >
                                        {alunoSendoEditado ? 'Salvar Alterações' : 'Cadastrar Aluno'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Modal Importar CSV */}
            {/* Modal Importar CSV */}
            {
                modalImportarAberto && (
                    <div
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                definirModalImportarAberto(false);
                                definirAlunosParaImportar([]);
                                definirTextoImportacao('');
                            }
                        }}
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                            {/* Header Moderno */}
                            <div className="p-6 flex items-start gap-4 bg-green-50">
                                <div className="p-3 rounded-xl bg-white shadow-sm shrink-0">
                                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-slate-800 leading-tight">
                                        Importar Alunos
                                    </h2>
                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                        Copie e cole os dados da sua planilha para importar múltiplos alunos de uma vez.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        definirModalImportarAberto(false);
                                        definirAlunosParaImportar([]);
                                        definirTextoImportacao('');
                                    }}
                                    className="text-slate-400 hover:text-slate-600 bg-white/50 hover:bg-white p-1 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Conteúdo Principal */}
                            <div className="flex-1 flex flex-col gap-4 overflow-hidden p-6">
                                {!alunosParaImportar.length ? (
                                    <>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600 leading-relaxed">
                                            <p className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                                                ℹ️ Formato esperado
                                            </p>
                                            Copie as colunas do Excel/Sheets na ordem: <strong className="text-slate-800">Matrícula, Nome, Turma</strong>.<br />
                                            Ex: <code className="bg-slate-200 px-1 rounded text-slate-700">2024001, João Silva, 3A</code>
                                        </div>
                                        <textarea
                                            className="flex-1 w-full border border-slate-200 p-4 rounded-xl font-mono text-sm resize-none focus:border-green-500 focus:ring-4 focus:ring-green-50 focus:outline-none transition-all placeholder:text-slate-300"
                                            placeholder={`2024010	JOAO DA SILVA	3A\n2024011	MARIA SOUZA	3B\n...`}
                                            value={textoImportacao}
                                            onChange={e => definirTextoImportacao(e.target.value)}
                                        ></textarea>
                                    </>
                                ) : (
                                    <div className="flex-1 overflow-hidden flex flex-col border border-slate-200 rounded-xl">
                                        <div className="overflow-auto flex-1">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                                    <tr>
                                                        <th className="p-3 border-b border-slate-200 font-bold text-slate-600">Matrícula</th>
                                                        <th className="p-3 border-b border-slate-200 font-bold text-slate-600">Nome</th>
                                                        <th className="p-3 border-b border-slate-200 font-bold text-slate-600">Turma</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 bg-white">
                                                    {alunosParaImportar.map((a, i) => (
                                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                            <td className="p-3 font-mono text-slate-600 font-medium">{a.matricula}</td>
                                                            <td className="p-3 font-bold text-slate-700 uppercase">{a.nome_completo}</td>
                                                            <td className="p-3">
                                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">
                                                                    {a.turma_id}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Ações */}
                            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                                <div className="text-sm font-medium text-slate-500">
                                    {alunosParaImportar.length > 0 && (
                                        <span className="text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-green-100">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            {alunosParaImportar.length} alunos encontrados
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
                                        className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    {alunosParaImportar.length === 0 ? (
                                        <button
                                            onClick={processarImportacao}
                                            disabled={!textoImportacao.trim()}
                                            className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-green-600/20 transition-all active:scale-95"
                                        >
                                            Processar Dados
                                        </button>
                                    ) : (
                                        <button
                                            onClick={confirmarImportacao}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:scale-95"
                                        >
                                            Confirmar Importação
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }



            {/* Modal QR Code */}
            {
                alunoParaQrCode && (
                    <div
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) definirAlunoParaQrCode(null);
                        }}
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800">Carteirinha Digital</h3>
                                <button
                                    onClick={() => definirAlunoParaQrCode(null)}
                                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-8 flex flex-col items-center gap-6">
                                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
                                    <QRCode
                                        value={JSON.stringify({
                                            id: alunoParaQrCode.matricula,
                                            type: 'student'
                                        })}
                                        size={200}
                                        level="H"
                                    />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-xl font-bold text-slate-800 uppercase">{alunoParaQrCode.nome_completo}</h2>
                                    <p className="text-slate-500 font-mono mt-1 text-lg">{alunoParaQrCode.matricula}</p>
                                    <span className="inline-block mt-3 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-bold border border-slate-200">
                                        {turmasDisponiveis.find(t => t.id === alunoParaQrCode.turma_id)?.nomeExibicao || alunoParaQrCode.turma_id}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
                                Escaneie este código na portaria para registrar acesso.
                            </div>
                        </div>
                    </div>
                )
            }

            {confirmacao && (
                <ModalConfirmacao
                    isOpen={!!confirmacao}
                    aoFechar={() => setConfirmacao(null)}
                    aoConfirmar={() => {
                        confirmacao.acao();
                        setConfirmacao(null);
                    }}
                    titulo={confirmacao?.titulo}
                    mensagem={confirmacao?.mensagem}
                    textoConfirmar={confirmacao?.textoConfirmar}
                    tipo={confirmacao?.tipo || 'perigo'}
                />
            )}
        </LayoutAdministrativo >
    );
}
