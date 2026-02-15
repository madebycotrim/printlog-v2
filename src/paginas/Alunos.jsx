import { useState, useEffect } from 'react';
import { api } from '../servicos/api';
import { bancoLocal } from '../servicos/bancoLocal';
import { servicoSincronizacao } from '../servicos/sincronizacao';
import { registrarAuditoria, ACOES_AUDITORIA } from '../servicos/auditoria';
import { registrarConsentimento } from '../servicos/consentimento';
import { useAutenticacao } from '../contexts/ContextoAutenticacao';
import { Plus, Search, Trash2, FileSpreadsheet, Edit, Filter, X, MoreVertical, User, ChevronLeft, ChevronRight, GraduationCap, QrCode, CheckCircle2, LogIn, LogOut, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import QRCode from "react-qr-code";
import { obterDataCorrigida } from '../utilitarios/relogio';
import { format } from 'date-fns';

import { importadorPlanilhas } from '../servicos/importadorPlanilhas';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';

import ModalUniversal from '../componentes/ModalUniversal';
import ModalConsentimento from '../componentes/ModalConsentimento';

export default function Alunos() {
    const { usuarioAtual } = useAutenticacao();
    const [alunos, definirAlunos] = useState([]);
    const [filtro, definirFiltro] = useState('');
    const [filtroTurma, definirFiltroTurma] = useState('');
    const [carregando, definirCarregando] = useState(true);
    const [modalAberto, definirModalAberto] = useState(false);
    const [alunoSendoEditado, definirAlunoSendoEditado] = useState(null);


    const [alunoParaQrCode, definirAlunoParaQrCode] = useState(null);
    const [alunoParaPresenca, definirAlunoParaPresenca] = useState(null);

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

    // LGPD Consent
    const [modalConsentimentoAberto, definirModalConsentimentoAberto] = useState(false);
    const [dadosAlunoParaConsentimento, definirDadosAlunoParaConsentimento] = useState(null);

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

        const atualizarDados = () => {
            carregarAlunos();
            carregarTurmas();
        };
        window.addEventListener('dados_sincronizados', atualizarDados);
        return () => window.removeEventListener('dados_sincronizados', atualizarDados);
    }, []);



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
            // Capturar dados antes de deletar para auditoria
            const alunoParaDeletar = alunos.find(a => a.matricula === matricula);

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

            // 🔒 AUDITORIA: Registrar exclusão
            if (usuarioAtual?.email && alunoParaDeletar) {
                try {
                    await registrarAuditoria({
                        usuarioEmail: usuarioAtual.email,
                        acao: ACOES_AUDITORIA.DELETAR_ALUNO,
                        entidadeTipo: 'aluno',
                        entidadeId: matricula,
                        dadosAnteriores: alunoParaDeletar,
                        dadosNovos: null
                    });
                } catch (erroAudit) {
                    console.warn('Falha no log de auditoria:', erroAudit);
                }
            }

            carregarAlunos();
        } catch (erro) {
            console.error(erro);
            alert('Erro ao remover aluno');
        }
    };

    const salvarEdicao = async () => {
        if (!validarFormulario()) return;

        try {
            definirProcessando(true);

            const alunoAtualizado = {
                matricula: alunoEmEdicao.matricula,
                nome_completo: dadosFormulario.nome_completo,
                turma_id: dadosFormulario.turma_id,
                status: dadosFormulario.status
            };

            // Capturar dados anteriores para auditoria
            const dadosAnteriores = { ...alunoEmEdicao };

            await api.editarAluno(alunoAtualizado);

            // 🔒 AUDITORIA: Registrar edição
            await registrarAuditoria({
                usuarioEmail: usuarioAtual.email,
                acao: ACOES_AUDITORIA.EDITAR_ALUNO,
                entidadeTipo: 'aluno',
                entidadeId: alunoAtualizado.matricula,
                dadosAnteriores,
                dadosNovos: alunoAtualizado
            });

            await carregarAlunos();
            definirModalEdicaoAberto(false);
            definirAlunoEmEdicao(null);
        } catch (erro) {
            console.error('Erro ao editar aluno:', erro);
            alert('Erro ao editar aluno');
        } finally {
            definirProcessando(false);
        }
    };
    const deletarAluno = async (matricula) => {
        if (!confirm('Tem certeza que deseja deletar este aluno? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            // Capturar dados antes de deletar
            const alunoParaDeletar = alunos.find(a => a.matricula === matricula);

            await api.deletarAluno(matricula);

            // 🔒 AUDITORIA: Registrar exclusão
            await registrarAuditoria({
                usuarioEmail: usuarioAtual.email,
                acao: ACOES_AUDITORIA.DELETAR_ALUNO,
                entidadeTipo: 'aluno',
                entidadeId: matricula,
                dadosAnteriores: alunoParaDeletar,
                dadosNovos: null
            });

            await carregarAlunos();
        } catch (erro) {
            console.error('Erro ao deletar aluno:', erro);
            alert('Erro ao deletar aluno');
        }
    };
    const confirmarPresencaManual = async (tipo) => {
        if (!alunoParaPresenca) return;

        try {
            const registro = {
                id: crypto.randomUUID(),
                aluno_matricula: alunoParaPresenca.matricula,
                tipo_movimentacao: tipo,
                timestamp: obterDataCorrigida().toISOString(),
                metodo_validacao: 'MANUAL_ADMIN'
            };

            await bancoLocal.salvarRegistro(registro);

            // Tentar sincronizar se online
            if (navigator.onLine) {
                api.enviar('/acessos', [registro]).then(() => {
                    bancoLocal.marcarComoSincronizado([registro.id]);
                }).catch(e => console.warn('Falha no envio imediato:', e));
            }

            alert(`${tipo} registrada com sucesso para ${alunoParaPresenca.nome_completo}!`);
            definirAlunoParaPresenca(null);
        } catch (erro) {
            console.error(erro);
            alert('Erro ao registrar presença manual: ' + erro.message);
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

        // 🔒 LGPD: Se for nova criação, exigir consentimento
        if (!alunoSendoEditado) {
            // Salvar dados temporariamente e abrir modal de consentimento
            definirDadosAlunoParaConsentimento(novoAluno);
            definirModalAberto(false); // Fechar modal de formulário
            definirModalConsentimentoAberto(true); // Abrir modal de consentimento
            return; // Aguardar aceitação do consentimento
        }

        // Se for edição, salvar diretamente
        await salvarAlunoNoBanco(novoAluno);
    };

    // Função auxiliar para salvar aluno no banco
    const salvarAlunoNoBanco = async (dadosAluno, comConsentimento = false) => {
        try {
            // 1. Salvar na API (se online)
            if (navigator.onLine) {
                try {
                    await api.enviar('/alunos', dadosAluno);
                    console.log('Aluno salvo na nuvem.');
                } catch (apiErro) {
                    console.error('Erro ao salvar na nuvem (fallback local):', apiErro);
                }
            } else {
                console.log('Offline: Salvando aluno localmente.');
            }

            // 2. Atualizar Local (Sempre, para UI e redundância)
            await bancoLocal.importarAlunos([{
                ...dadosAluno,
                consentimento_valido: comConsentimento
            }]);

            // 🔒 AUDITORIA: Registrar criação (se usuário autenticado)
            if (usuarioAtual?.email) {
                try {
                    await registrarAuditoria({
                        usuarioEmail: usuarioAtual.email,
                        acao: alunoSendoEditado ? ACOES_AUDITORIA.EDITAR_ALUNO : ACOES_AUDITORIA.CRIAR_ALUNO,
                        entidadeTipo: 'aluno',
                        entidadeId: dadosAluno.matricula,
                        dadosAnteriores: alunoSendoEditado || null,
                        dadosNovos: dadosAluno
                    });
                } catch (erroAudit) {
                    console.warn('Falha no log de auditoria:', erroAudit);
                }
            }

            fecharModal();
            carregarAlunos();
        } catch (erro) {
            alert('Erro crítico ao salvar: ' + erro.message);
        }
    };

    // Handler para aceitação do consentimento
    const aoAceitarConsentimento = async () => {
        if (!dadosAlunoParaConsentimento) return;

        try {
            // Registrar consentimento
            await registrarConsentimento({
                alunoMatricula: dadosAlunoParaConsentimento.matricula,
                tipoConsentimento: 'COLETA_DADOS',
                consentido: true,
                coletadoPor: usuarioAtual?.email || 'sistema'
            });

            // Salvar aluno com consentimento
            await salvarAlunoNoBanco(dadosAlunoParaConsentimento, true);

            // Limpar estado
            definirModalConsentimentoAberto(false);
            definirDadosAlunoParaConsentimento(null);
        } catch (erro) {
            console.error('Erro ao processar consentimento:', erro);
            throw erro;
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
                className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition font-bold shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 border border-white/10"
            >
                <FileSpreadsheet size={20} />
                <span className="tracking-wide">Importar CSV</span>
            </button>
            <button
                onClick={() => definirModalAberto(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 border border-white/10"
            >
                <Plus size={20} />
                <span className="tracking-wide">Novo Aluno</span>
            </button>
        </div>
    );

    return (
        <LayoutAdministrativo titulo="Alunos" subtitulo="Cadastro e manutenção da base de estudantes" acoes={AcoesHeader}>

            {carregando ? (
                <div className="p-8 text-center text-slate-500 animate-pulse text-sm">Carregando...</div>
            ) : alunos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <GraduationCap size={24} className="text-slate-300" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700">Nenhum aluno</h3>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">Cadastre um novo aluno para começar.</p>
                </div>
            ) : (
                <>
                    {/* Toolbar (Aligned with Turmas) */}
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/60 shadow-sm mb-6 flex flex-col md:flex-row gap-4 animate-[fadeIn_0.3s_ease-out]">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou matrícula..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all placeholder:text-slate-400"
                                value={filtro}
                                onChange={(e) => definirFiltro(e.target.value)}
                            />
                        </div>

                        <div className="relative min-w-[220px] group">
                            <select
                                value={filtroTurma}
                                onChange={(e) => definirFiltroTurma(e.target.value)}
                                className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Todas as Turmas</option>
                                {turmasDisponiveis.map(t => (
                                    <option key={t.id} value={t.id}>{t.nomeExibicao}</option>
                                ))}
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} />
                        </div>

                    </div>

                    {/* Table Area */}
                    {alunosFiltrados.length === 0 ? (
                        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-16 text-center animate-[fadeIn_0.3s_ease-out]">
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                    <GraduationCap size={32} className="text-slate-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-700">Nenhum aluno encontrado</h3>
                                <p className="text-xs text-slate-400 max-w-xs mt-1">Nenhum aluno corresponde aos filtros aplicados.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col animate-[fadeIn_0.3s_ease-out]">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50/50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-5 font-black text-slate-500 text-[10px] uppercase tracking-widest text-left">Aluno</th>
                                            <th className="p-5 font-black text-slate-500 text-[10px] uppercase tracking-widest text-left">Matrícula</th>
                                            <th className="p-5 font-black text-slate-500 text-[10px] uppercase tracking-widest text-left">Turma</th>
                                            <th className="p-5 font-black text-slate-500 text-[10px] uppercase tracking-widest text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {alunosPaginados.map((aluno, index) => {
                                            const turmaNome = turmasDisponiveis.find(t => t.id === aluno.turma_id)?.nomeExibicao || aluno.turma_id;
                                            const corBadge = obterCorTurno(turmaNome);

                                            // Gerar cor consistente baseada na matrícula (Updated Design)
                                            const cores = [
                                                'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-200',
                                                'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-emerald-200',
                                                'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-200',
                                                'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-rose-200',
                                                'bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-blue-200',
                                            ];
                                            const matriculaNum = parseInt(aluno.matricula) || 0;
                                            const corAvatar = cores[matriculaNum % cores.length];

                                            return (
                                                <tr
                                                    key={aluno.matricula}
                                                    className="hover:bg-slate-50/50 transition-all duration-300 group"
                                                    style={{ animationDelay: `${index * 0.05}s` }}
                                                >
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-black/5 ${corAvatar} transition-all duration-300`}>
                                                                {obterIniciais(aluno.nome_completo)}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-700 uppercase leading-tight tracking-tight text-xs group-hover:text-indigo-600 transition-colors">
                                                                    {aluno.nome_completo}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="inline-flex items-center gap-2 text-slate-500 px-2 py-1 rounded-lg font-mono text-xs font-bold bg-slate-100/50 border border-slate-200/50">
                                                            {aluno.matricula}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide shadow-sm ${corBadge} transition-all duration-200 group-hover:shadow-md`}>
                                                            {turmaNome}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                                                            <button
                                                                onClick={() => definirAlunoParaQrCode(aluno)}
                                                                className="text-slate-400 hover:text-indigo-600 transition-all duration-200 p-2 hover:bg-indigo-50 rounded-xl hover:scale-110 active:scale-95 relative group/btn"
                                                                title="Ver QR Code"
                                                            >
                                                                <QrCode size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => definirAlunoParaPresenca(aluno)}
                                                                className="text-slate-400 hover:text-emerald-600 transition-all duration-200 p-2 hover:bg-emerald-50 rounded-xl hover:scale-110 active:scale-95 relative group/btn"
                                                                title="Lançar Presença Manual"
                                                            >
                                                                <CheckCircle2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => abrirModalEdicao(aluno)}
                                                                className="text-slate-400 hover:text-blue-600 transition-all duration-200 p-2 hover:bg-blue-50 rounded-xl hover:scale-110 active:scale-95 relative group/btn"
                                                                title="Editar"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => solicitarRemocao(aluno.matricula)}
                                                                className="text-slate-400 hover:text-rose-500 transition-all duration-200 p-2 hover:bg-rose-50 rounded-xl hover:scale-110 active:scale-95 relative group/btn"
                                                                title="Remover"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {/* Paginação */}
                    {/* Paginação Minimalista */}
                    {!carregando && alunosFiltrados.length > 0 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 selection:bg-indigo-100">
                            <span className="font-medium">
                                Mostrando <span className="font-bold text-slate-700">{indiceInicial + 1}-{Math.min(indiceInicial + itensPorPagina, alunosFiltrados.length)}</span> de <span className="font-bold text-slate-700">{alunosFiltrados.length}</span>
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => definirPaginaAtual(p => Math.max(1, p - 1))}
                                    disabled={paginaAtual === 1}
                                    className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all duration-200"
                                    title="Anterior"
                                >
                                    <ChevronLeft size={16} strokeWidth={2.5} />
                                </button>

                                <span className="px-2 font-medium text-slate-400">
                                    Página <span className="font-bold text-slate-700">{paginaAtual}</span> de <span className="font-bold text-slate-700">{totalPaginas}</span>
                                </span>

                                <button
                                    onClick={() => definirPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                                    disabled={paginaAtual === totalPaginas}
                                    className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all duration-200"
                                    title="Próxima"
                                >
                                    <ChevronRight size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal Novo Aluno (Universal) */}
            <ModalUniversal
                aberto={modalAberto}
                aoFechar={fecharModal}
                titulo={alunoSendoEditado ? 'Editar Aluno' : 'Novo Aluno'}
                subtitulo={alunoSendoEditado ? 'Atualize os dados do aluno abaixo.' : 'Preencha os dados abaixo para cadastrar um novo aluno.'}
                icone={User}
            >
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
            </ModalUniversal>

            {/* Modal Importar CSV (Universal) */}
            <ModalUniversal
                aberto={modalImportarAberto}
                aoFechar={() => {
                    definirModalImportarAberto(false);
                    definirAlunosParaImportar([]);
                    definirTextoImportacao('');
                }}
                titulo={alunosParaImportar.length > 0 ? "Confirmar Importação" : "Importar Alunos"}
                subtitulo={alunosParaImportar.length > 0 ? "Verifique os dados abaixo antes de confirmar." : "Copie e cole os dados da sua planilha para importar múltiplos alunos."}
                icone={FileSpreadsheet}
                tamanho={alunosParaImportar.length > 0 ? 'xl' : 'lg'}
                cor="emerald"
            >
                <div className="flex flex-col overflow-hidden">
                    <div className="flex flex-col gap-4 overflow-hidden p-6">
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
                                    className="w-full h-64 border border-slate-200 p-4 rounded-xl font-mono text-sm resize-none focus:border-green-500 focus:ring-4 focus:ring-green-50 focus:outline-none transition-all placeholder:text-slate-300"
                                    placeholder={`2024010\tJOAO DA SILVA\t3A\n2024011\tMARIA SOUZA\t3B\n...`}
                                    value={textoImportacao}
                                    onChange={e => definirTextoImportacao(e.target.value)}
                                ></textarea>
                            </>
                        ) : (
                            <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden max-h-[50vh]">
                                <div className="overflow-auto">
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
            </ModalUniversal>



            {/* Modal QR Code - Refatorado */}
            {
                alunoParaQrCode && (
                    <div
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) definirAlunoParaQrCode(null);
                        }}
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[scaleIn_0.2s_ease-out] border border-indigo-100">
                            {/* Header */}
                            <div className="p-6 flex items-start gap-4 bg-indigo-50">
                                <div className="p-3 rounded-xl bg-white shadow-sm shrink-0 text-indigo-600">
                                    <QrCode size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-800 leading-tight">Carteirinha Digital</h3>
                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                        Escaneie este código na portaria.
                                    </p>
                                </div>
                                <button
                                    onClick={() => definirAlunoParaQrCode(null)}
                                    className="text-slate-400 hover:text-slate-600 bg-white/50 hover:bg-white p-1 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-8 flex flex-col items-center gap-6">
                                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
                                    <QRCode
                                        value={alunoParaQrCode.matricula}
                                        size={180}
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

                            {/* Footer */}
                            <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => definirAlunoParaQrCode(null)}
                                    className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-100"
                                >
                                    Fechar Janela
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal Presença Manual (Entrada/Saída) - Design Consistente com Cadastro */}
            {
                alunoParaPresenca && (
                    <div
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) definirAlunoParaPresenca(null);
                        }}
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                            {/* Header (Igual ao Novo Aluno - Barra Azul) */}
                            <div className="p-6 flex items-start gap-4 bg-blue-50">
                                <div className="p-3 rounded-xl bg-white shadow-sm shrink-0">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-slate-800 leading-tight">
                                        Registrar Presença
                                    </h2>
                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                        Confirme os dados e selecione a operação.
                                    </p>
                                </div>
                                <button
                                    onClick={() => definirAlunoParaPresenca(null)}
                                    className="text-slate-400 hover:text-slate-600 bg-white/50 hover:bg-white p-1 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Conteúdo */}
                            <div className="px-6 py-4 space-y-5">
                                {/* Info do Aluno - Único Local de Exibição do Nome */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <User size={64} className="text-blue-500" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aluno Selecionado</div>
                                        <div className="font-black text-slate-800 text-lg uppercase leading-tight tracking-tight mb-2">
                                            {alunoParaPresenca.nome_completo}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-white px-2 py-1 rounded-md border border-slate-200 text-[10px] font-bold text-slate-500 font-mono shadow-sm">
                                                {alunoParaPresenca.matricula}
                                            </span>
                                            <span className="bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 text-[10px] font-bold text-indigo-600 shadow-sm uppercase tracking-wide">
                                                {turmasDisponiveis.find(t => t.id === alunoParaPresenca.turma_id)?.nomeExibicao || alunoParaPresenca.turma_id}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Ações */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => confirmarPresencaManual('ENTRADA')}
                                        className="flex-1 group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px] shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98] transition-all"
                                    >
                                        <div className="relative h-full bg-white rounded-[11px] p-4 flex flex-col items-center justify-center gap-2 group-hover:bg-opacity-95 transition-all">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <LogIn size={20} strokeWidth={2.5} />
                                            </div>
                                            <span className="font-bold text-slate-700 group-hover:text-emerald-700">Entrada</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => confirmarPresencaManual('SAÍDA')}
                                        className="flex-1 group relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 p-[1px] shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 active:scale-[0.98] transition-all"
                                    >
                                        <div className="relative h-full bg-white rounded-[11px] p-4 flex flex-col items-center justify-center gap-2 group-hover:bg-opacity-95 transition-all">
                                            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <LogOut size={20} strokeWidth={2.5} />
                                            </div>
                                            <span className="font-bold text-slate-700 group-hover:text-rose-700">Saída</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-xs text-slate-400 font-medium">{format(obterDataCorrigida(), "dd/MM 'às' HH:mm")}</span>
                                <button
                                    onClick={() => definirAlunoParaPresenca(null)}
                                    className="text-sm font-bold text-slate-500 hover:text-slate-700 px-3 py-1.5 hover:bg-slate-200/50 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal de Confirmação (Universal) */}
            <ModalUniversal
                aberto={!!confirmacao}
                aoFechar={() => setConfirmacao(null)}
                titulo={confirmacao?.titulo || 'Confirmação'}
                subtitulo={confirmacao?.mensagem}
                icone={AlertTriangle}
                cor={confirmacao?.tipo === 'perigo' ? 'red' : confirmacao?.tipo === 'aviso' ? 'amber' : 'indigo'}
            >
                <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3 mt-auto">
                    <button
                        onClick={() => setConfirmacao(null)}
                        className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        {confirmacao?.textoCancelar || 'Cancelar'}
                    </button>
                    <button
                        onClick={() => {
                            confirmacao?.acao();
                            setConfirmacao(null);
                        }}
                        className={`px-6 py-2 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 
                            ${confirmacao?.tipo === 'perigo' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' :
                                confirmacao?.tipo === 'aviso' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' :
                                    'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'}`}
                    >
                        {confirmacao?.textoConfirmar || 'Confirmar'}
                    </button>
                </div>
            </ModalUniversal>

            {/* 🔒 Modal de Consentimento LGPD */}
            <ModalConsentimento
                aberto={modalConsentimentoAberto}
                aoFechar={() => {
                    definirModalConsentimentoAberto(false);
                    definirDadosAlunoParaConsentimento(null);
                    // Reabrir modal de cadastro para permitir edição
                    definirModalAberto(true);
                }}
                aoAceitar={aoAceitarConsentimento}
                alunoNome={dadosAlunoParaConsentimento?.nome_completo}
            />
        </LayoutAdministrativo >
    );
}
