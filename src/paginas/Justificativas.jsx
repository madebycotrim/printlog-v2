import { useState, useEffect } from 'react';
import { justificativasService } from '../servicos/justificativas';
import { bancoLocal } from '../servicos/bancoLocal';
import { useAutenticacao } from '../contexts/ContextoAutenticacao';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import { FileText, Upload, Check, X, Clock, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Justificativas() {
    const { usuarioAtual } = useAutenticacao();
    const [justificativas, setJustificativas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState('TODAS');
    const [mostrarModalCriar, setMostrarModalCriar] = useState(false);
    const [mostrarModalRevisar, setMostrarModalRevisar] = useState(false);
    const [justificativaSelecionada, setJustificativaSelecionada] = useState(null);
    const [contadores, setContadores] = useState({ pendentes: 0, aprovadas: 0, rejeitadas: 0, total: 0 });

    // Form states
    const [alunoSelecionado, setAlunoSelecionado] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [tipo, setTipo] = useState('ATESTADO_MEDICO');
    const [descricao, setDescricao] = useState('');
    const [arquivo, setArquivo] = useState(null);
    const [alunos, setAlunos] = useState([]);

    useEffect(() => {
        carregarDados();
    }, [filtroStatus]);

    const carregarDados = async () => {
        setCarregando(true);
        try {
            // Carregar justificativas
            const filtros = filtroStatus !== 'TODAS' ? { status: filtroStatus } : {};
            const dados = await justificativasService.listar(filtros);
            setJustificativas(dados);

            // Carregar contadores
            const cont = await justificativasService.contarPorStatus();
            setContadores(cont);

            // Carregar lista de alunos
            const banco = await bancoLocal.iniciarBanco();
            const todosAlunos = await banco.getAll('alunos');
            setAlunos(todosAlunos.sort((a, b) => a.nome_completo.localeCompare(b.nome_completo)));
        } catch (erro) {
            console.error('Erro ao carregar dados:', erro);
        } finally {
            setCarregando(false);
        }
    };

    const handleCriarJustificativa = async (e) => {
        e.preventDefault();

        try {
            await justificativasService.criar(
                {
                    aluno_matricula: alunoSelecionado,
                    data_inicio: dataInicio,
                    data_fim: dataFim,
                    tipo,
                    descricao
                },
                arquivo,
                usuarioAtual?.email
            );

            // Reset form
            setAlunoSelecionado('');
            setDataInicio('');
            setDataFim('');
            setTipo('ATESTADO_MEDICO');
            setDescricao('');
            setArquivo(null);
            setMostrarModalCriar(false);

            // Recarregar dados
            carregarDados();
        } catch (erro) {
            console.error('Erro ao criar justificativa:', erro);
            alert('Erro ao criar justificativa. Tente novamente.');
        }
    };

    const handleAprovar = async () => {
        try {
            await justificativasService.atualizarStatus(
                justificativaSelecionada.id,
                'APROVADA',
                null,
                usuarioAtual?.email
            );
            setMostrarModalRevisar(false);
            setJustificativaSelecionada(null);
            carregarDados();
        } catch (erro) {
            console.error('Erro ao aprovar:', erro);
        }
    };

    const handleRejeitar = async () => {
        const motivo = prompt('Informe o motivo da rejeição:');
        if (!motivo) return;

        try {
            await justificativasService.atualizarStatus(
                justificativaSelecionada.id,
                'REJEITADA',
                motivo,
                usuarioAtual?.email
            );
            setMostrarModalRevisar(false);
            setJustificativaSelecionada(null);
            carregarDados();
        } catch (erro) {
            console.error('Erro ao rejeitar:', erro);
        }
    };

    const tiposJustificativa = [
        { valor: 'ATESTADO_MEDICO', label: '🏥 Atestado Médico' },
        { valor: 'EVENTO_FAMILIAR', label: '👨‍👩‍👧 Evento Familiar' },
        { valor: 'COMPROMISSO_JURIDICO', label: '⚖️ Compromisso Jurídico' },
        { valor: 'OUTROS', label: '📝 Outros' }
    ];

    const AcoesHeader = (
        <div className="flex gap-3">
            <button
                onClick={() => setMostrarModalCriar(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md"
            >
                <Upload size={18} />
                Nova Justificativa
            </button>
        </div>
    );

    if (carregando) {
        return (
            <LayoutAdministrativo titulo="Justificativas de Faltas">
                <div className="flex items-center justify-center h-64">
                    <div className="text-slate-500 animate-pulse">Carregando...</div>
                </div>
            </LayoutAdministrativo>
        );
    }

    return (
        <LayoutAdministrativo
            titulo="Justificativas de Faltas"
            subtitulo="Gestão de ausências e documentos comprobatórios"
            acoes={AcoesHeader}
        >
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="text-amber-100 text-sm font-medium mb-2">Pendentes</div>
                    <div className="text-4xl font-black">{contadores.pendentes}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="text-green-100 text-sm font-medium mb-2">Aprovadas</div>
                    <div className="text-4xl font-black">{contadores.aprovadas}</div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-lg text-white">
                    <div className="text-red-100 text-sm font-medium mb-2">Rejeitadas</div>
                    <div className="text-4xl font-black">{contadores.rejeitadas}</div>
                </div>
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-2xl shadow-lg text-white">
                    <div className="text-slate-300 text-sm font-medium mb-2">Total</div>
                    <div className="text-4xl font-black">{contadores.total}</div>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {['TODAS', 'PENDENTE', 'APROVADA', 'REJEITADA'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFiltroStatus(status)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${filtroStatus === status
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        {status === 'TODAS' ? 'Todas' : status.charAt(0) + status.slice(1).toLowerCase() + 's'}
                    </button>
                ))}
            </div>

            {/* Lista de Justificativas */}
            <div className="space-y-4">
                {justificativas.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-100">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg mb-2">Nenhuma justificativa encontrada</p>
                        <p className="text-slate-400 text-sm">
                            {filtroStatus === 'TODAS'
                                ? 'Crie uma nova justificativa para começar'
                                : `Não há justificativas com status "${filtroStatus}"`}
                        </p>
                    </div>
                ) : (
                    justificativas.map(just => (
                        <div
                            key={just.id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-lg font-bold text-slate-800">
                                            {just.aluno?.nome_completo || 'Aluno desconhecido'}
                                        </h3>
                                        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-mono">
                                            {just.aluno?.turma_id || 'N/A'}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${just.status === 'PENDENTE'
                                                ? 'bg-amber-100 text-amber-700'
                                                : just.status === 'APROVADA'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                            {just.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                        <div>
                                            <div className="text-slate-500 text-xs mb-1">Tipo</div>
                                            <div className="font-semibold text-slate-700">
                                                {tiposJustificativa.find(t => t.valor === just.tipo)?.label || just.tipo}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500 text-xs mb-1">Período</div>
                                            <div className="font-semibold text-slate-700">
                                                {format(new Date(just.data_inicio), 'dd/MM/yy')} - {format(new Date(just.data_fim), 'dd/MM/yy')}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500 text-xs mb-1">Criada em</div>
                                            <div className="font-semibold text-slate-700">
                                                {format(new Date(just.criada_em), 'dd/MM/yyyy HH:mm')}
                                            </div>
                                        </div>
                                        {just.documento_nome && (
                                            <div>
                                                <div className="text-slate-500 text-xs mb-1">Documento</div>
                                                <div className="font-semibold text-indigo-600 truncate">
                                                    📎 {just.documento_nome}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {just.descricao && (
                                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                            {just.descricao}
                                        </p>
                                    )}
                                </div>

                                {just.status === 'PENDENTE' && (
                                    <button
                                        onClick={() => {
                                            setJustificativaSelecionada(just);
                                            setMostrarModalRevisar(true);
                                        }}
                                        className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center gap-2"
                                    >
                                        <Eye size={18} />
                                        Revisar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal: Criar Justificativa */}
            {mostrarModalCriar && (
                <>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setMostrarModalCriar(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-black text-slate-800 mb-6">Nova Justificativa</h2>

                            <form onSubmit={handleCriarJustificativa} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Aluno</label>
                                    <select
                                        value={alunoSelecionado}
                                        onChange={(e) => setAlunoSelecionado(e.target.value)}
                                        required
                                        className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Selecione um aluno...</option>
                                        {alunos.map(aluno => (
                                            <option key={aluno.matricula} value={aluno.matricula}>
                                                {aluno.nome_completo} - {aluno.turma_id}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Data Início</label>
                                        <input
                                            type="date"
                                            value={dataInicio}
                                            onChange={(e) => setDataInicio(e.target.value)}
                                            required
                                            className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Data Fim</label>
                                        <input
                                            type="date"
                                            value={dataFim}
                                            onChange={(e) => setDataFim(e.target.value)}
                                            required
                                            className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Justificativa</label>
                                    <select
                                        value={tipo}
                                        onChange={(e) => setTipo(e.target.value)}
                                        className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {tiposJustificativa.map(t => (
                                            <option key={t.valor} value={t.valor}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Descrição (Opcional)</label>
                                    <textarea
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        rows={3}
                                        className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Detalhes adicionais..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Anexar Documento</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setArquivo(e.target.files[0])}
                                        className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">PDF ou imagens (máx. 5MB)</p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
                                    >
                                        Criar Justificativa
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMostrarModalCriar(false)}
                                        className="px-6 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Modal: Revisar Justificativa */}
            {mostrarModalRevisar && justificativaSelecionada && (
                <>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setMostrarModalRevisar(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-black text-slate-800 mb-6">Revisar Justificativa</h2>

                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-slate-500 mb-1">Aluno</div>
                                        <div className="font-bold text-slate-800">{justificativaSelecionada.aluno?.nome_completo}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 mb-1">Turma</div>
                                        <div className="font-bold text-slate-800">{justificativaSelecionada.aluno?.turma_id}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 mb-1">Tipo</div>
                                        <div className="font-bold text-slate-800">
                                            {tiposJustificativa.find(t => t.valor === justificativaSelecionada.tipo)?.label}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 mb-1">Período</div>
                                        <div className="font-bold text-slate-800">
                                            {format(new Date(justificativaSelecionada.data_inicio), 'dd/MM/yyyy')} - {format(new Date(justificativaSelecionada.data_fim), 'dd/MM/yyyy')}
                                        </div>
                                    </div>
                                </div>

                                {justificativaSelecionada.descricao && (
                                    <div>
                                        <div className="text-sm text-slate-500 mb-2">Descrição</div>
                                        <div className="bg-slate-50 p-4 rounded-xl text-slate-700">
                                            {justificativaSelecionada.descricao}
                                        </div>
                                    </div>
                                )}

                                {justificativaSelecionada.documento_base64 && (
                                    <div>
                                        <div className="text-sm text-slate-500 mb-2">Documento Anexado</div>
                                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                                            {justificativaSelecionada.documento_tipo?.startsWith('image/') ? (
                                                <img
                                                    src={justificativaSelecionada.documento_base64}
                                                    alt="Documento"
                                                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-3">
                                                    <FileText size={48} className="text-indigo-500" />
                                                    <div className="font-semibold text-slate-700">{justificativaSelecionada.documento_nome}</div>
                                                    <a
                                                        href={justificativaSelecionada.documento_base64}
                                                        download={justificativaSelecionada.documento_nome}
                                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                                                    >
                                                        <Download size={18} />
                                                        Baixar Documento
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button
                                    onClick={handleAprovar}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                                >
                                    <Check size={20} />
                                    Aprovar
                                </button>
                                <button
                                    onClick={handleRejeitar}
                                    className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition flex items-center justify-center gap-2"
                                >
                                    <X size={20} />
                                    Rejeitar
                                </button>
                                <button
                                    onClick={() => setMostrarModalRevisar(false)}
                                    className="px-6 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </LayoutAdministrativo>
    );
}
