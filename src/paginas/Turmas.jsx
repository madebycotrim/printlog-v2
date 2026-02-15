import { useState, useEffect } from 'react';
import { bancoLocal } from '../servicos/bancoLocal';
import { api } from '../servicos/api';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import { registrarAuditoria, ACOES_AUDITORIA } from '../servicos/auditoria';
import { useAutenticacao } from '../contexts/ContextoAutenticacao';
import ModalUniversal from '../componentes/ModalUniversal';
import { Plus, Trash2, Users, Layers, X, Sun, Moon, Sunset, XCircle, ChevronRight, Search, User, AlertTriangle } from 'lucide-react';

export default function Turmas() {
    const { usuarioAtual } = useAutenticacao();
    const [turmas, definirTurmas] = useState([]);
    const [modalAberto, definirModalAberto] = useState(false);
    const [modalAlunosAberto, definirModalAlunosAberto] = useState(false);
    const [turmaSelecionada, definirTurmaSelecionada] = useState(null);
    const [alunosDaTurma, definirAlunosDaTurma] = useState([]);
    const [novaTurma, definirNovaTurma] = useState({ serie: '', turno: 'Indefinido', letra: '' });
    const [erroCadastro, definirErroCadastro] = useState('');
    const [carregando, definirCarregando] = useState(true);
    const [filtroTurno, definirFiltroTurno] = useState('Todos');
    const [termoBusca, definirTermoBusca] = useState('');

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

            // Tenta usar os campos salvos, se não existirem (legado), tenta parsear o ID
            let serie = turma.serie;
            let letra = turma.letra;
            let turno = turma.turno;

            if (!serie || !letra || !turno) {
                try {
                    if (turma.id) {
                        const partes = turma.id.split(' - ');
                        const informacoes = partes[0] ? partes[0].split(' ') : [];
                        serie = informacoes[0] || '?';
                        letra = informacoes[1] || '?';
                        turno = partes[1] || 'Indefinido';
                    }
                } catch (e) {
                    console.error("Erro ao analisar turma legado:", turma.id, e);
                    serie = '?'; letra = '?'; turno = 'Indefinido';
                }
            }

            // Normalizar série para usar 'º' em vez de 'ª'
            if (serie) {
                serie = serie.replace('ª', 'º');
            }

            return {
                ...turma,
                totalAlunos,
                presentes: presentesTurma,
                percentual,
                listaAlunos: alunosTurma,
                interpretado: { serie, letra, turno }
            };
        });

        // Ordenar logicamente (1º, 2º, 3º...) -> Depois Letra
        turmasComDados.sort((a, b) => {
            const sA = a.interpretado.serie.localeCompare(b.interpretado.serie);
            if (sA !== 0) return sA;
            return a.interpretado.letra.localeCompare(b.interpretado.letra);
        });

        definirTurmas(turmasComDados);
        definirCarregando(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        carregarTurmas();
    }, []);

    const adicionarTurma = async () => {
        if (!novaTurma.serie || !novaTurma.letra || !novaTurma.turno) return;
        definirErroCadastro('');

        const banco = await bancoLocal.iniciarBanco();
        const todasTurmas = await banco.getAll('turmas');

        // 1. Verificar duplicidade SEMÂNTICA (Série + Letra + Turno + Ano)
        const duplicata = todasTurmas.find(t => {
            // Verifica campos novos
            if (t.serie && t.letra && t.turno) {
                const serieNormalizadaT = t.serie.replace('ª', 'º');
                const serieNormalizadaNova = novaTurma.serie.replace('ª', 'º');

                return serieNormalizadaT === serieNormalizadaNova &&
                    t.letra === novaTurma.letra &&
                    t.turno === novaTurma.turno;
            }

            // Verifica legado (parseando ID)
            const partes = t.id.split(' - ');
            const serieExistente = partes[0]?.split(' ')[0]?.replace('ª', 'º'); // Normaliza legado
            const letraExistente = partes[0]?.split(' ')[1];
            const turnoExistente = partes[1];
            const serieNovaNormalizada = novaTurma.serie.replace('ª', 'º');

            return serieExistente === serieNovaNormalizada &&
                letraExistente === novaTurma.letra &&
                turnoExistente === novaTurma.turno;
        });

        if (duplicata) {
            definirErroCadastro(`A turma ${novaTurma.serie} ${novaTurma.letra} (${novaTurma.turno}) já está cadastrada.`);
            return;
        }

        const novoId = crypto.randomUUID();
        const novaTurmaObj = {
            id: novoId,
            serie: novaTurma.serie,
            letra: novaTurma.letra,
            turno: novaTurma.turno,
            ano_letivo: new Date().getFullYear(),
            criado_em: new Date().toISOString()
        };

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

        // 🔒 AUDITORIA: Registrar criação
        if (usuarioAtual?.email) {
            try {
                await registrarAuditoria({
                    usuarioEmail: usuarioAtual.email,
                    acao: ACOES_AUDITORIA.CRIAR_TURMA,
                    entidadeTipo: 'turma',
                    entidadeId: novaTurmaObj.id,
                    dadosAnteriores: null,
                    dadosNovos: novaTurmaObj
                });
            } catch (erroAudit) {
                console.warn('Falha no log de auditoria:', erroAudit);
            }
        }

        definirNovaTurma({ serie: '', turno: 'Indefinido', letra: '' });
        definirModalAberto(false);
        carregarTurmas();
    };

    const [confirmacao, setConfirmacao] = useState(null); // { titulo, mensagem, acao }

    const solicitarRemocao = (turma, e) => {
        e.stopPropagation();
        const nomeTurma = turma.interpretado
            ? `${turma.interpretado.serie} ${turma.interpretado.letra} - ${turma.interpretado.turno}`
            : turma.id;

        setConfirmacao({
            titulo: "Excluir Turma",
            mensagem: `Tem certeza que deseja remover a turma ${nomeTurma}? Esta ação não pode ser desfeita e removerá todos os vínculos.`,
            acao: () => removerTurma(turma.id),
            tipo: "perigo",
            textoConfirmar: "Sim, remover"
        });
    };

    const removerTurma = async (id) => {
        try {
            // Capturar dados antes de deletar para auditoria
            const turmaParaDeletar = turmas.find(t => t.id === id);

            if (navigator.onLine) {
                await api.remover(`/turmas?id=${encodeURIComponent(id)}`);
                console.log('Turma removida da nuvem.');
            }
        } catch (erro) {
            console.error('Erro na API ao remover (fallback local):', erro);
        }

        const banco = await bancoLocal.iniciarBanco();
        await banco.delete('turmas', id);

        // 🔒 AUDITORIA: Registrar exclusão
        if (usuarioAtual?.email && turmaParaDeletar) {
            try {
                await registrarAuditoria({
                    usuarioEmail: usuarioAtual.email,
                    acao: ACOES_AUDITORIA.DELETAR_TURMA,
                    entidadeTipo: 'turma',
                    entidadeId: id,
                    dadosAnteriores: turmaParaDeletar,
                    dadosNovos: null
                });
            } catch (erroAudit) {
                console.warn('Falha no log de auditoria:', erroAudit);
            }
        }

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
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow-md shadow-blue-600/20"
        >
            <Plus size={20} /> Nova Turma
        </button>
    );

    return (
        <LayoutAdministrativo titulo="Turmas" subtitulo="Organização das séries e turmas da escola" acoes={AcoesHeader}>

            {carregando ? (
                <div className="p-8 text-center text-slate-500 animate-pulse text-sm">Carregando...</div>
            ) : turmas.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Layers size={24} className="text-slate-300" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700">Nenhuma turma</h3>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">Crie uma nova turma para começar.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Filtros e Busca (Minimalista) */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-2 animate-[fadeIn_0.3s_ease-out]">
                        {/* Abas de Turno */}
                        <div className="flex items-center gap-2 p-1 bg-slate-100/50 rounded-full">
                            {['Todos', 'Matutino', 'Vespertino', 'Noturno'].map(turno => (
                                <button
                                    key={turno}
                                    onClick={() => definirFiltroTurno(turno)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${filtroTurno === turno
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {turno}
                                </button>
                            ))}
                        </div>

                        {/* Barra de Busca Minimalista */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 group-focus-within:text-slate-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar turma..."
                                value={termoBusca}
                                onChange={(e) => definirTermoBusca(e.target.value)}
                                className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-400 focus:shadow-sm transition-all placeholder:text-slate-300 w-48 focus:w-64"
                            />
                        </div>
                    </div>

                    {['1º', '2º', '3º'].map(serie => {
                        const turmasDaSerie = turmas.filter(t => {
                            // Filtro de Série (Base)
                            if (t.interpretado?.serie !== serie) return false;

                            // Filtro de Turno
                            if (filtroTurno !== 'Todos' && t.interpretado?.turno !== filtroTurno) return false;

                            // Filtro de Busca
                            if (termoBusca) {
                                const termo = termoBusca.toLowerCase();
                                const nomeTurma = `${t.interpretado?.serie} ${t.interpretado?.letra} - ${t.interpretado?.turno}`.toLowerCase();
                                return nomeTurma.includes(termo);
                            }

                            return true;
                        });

                        if (turmasDaSerie.length === 0) return null;

                        return (
                            <div key={serie} className="animate-[fadeIn_0.5s_ease-out]">
                                <div className="flex items-center gap-3  px-2">
                                    <h2 className="text-xl font-bold text-slate-700">{serie.replace('º', 'ª')} Série</h2>
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {turmasDaSerie.map(t => {
                                        const { interpretado } = t;

                                        // Definir cores baseadas no turno
                                        const getCores = (turno) => {
                                            const t = turno?.toLowerCase() || '';
                                            if (t === 'matutino') return {
                                                borda: 'border-amber-200',
                                                hover: '',
                                                accent: 'bg-amber-400',
                                                badge: 'bg-amber-50 text-amber-700 border-amber-100',
                                                icon: <Sun size={10} />
                                            };
                                            if (t === 'vespertino') return {
                                                borda: 'border-blue-200',
                                                hover: '',
                                                accent: 'bg-blue-400',
                                                badge: 'bg-blue-50 text-blue-700 border-blue-100',
                                                icon: <Sunset size={10} />
                                            };
                                            if (t === 'noturno') return {
                                                borda: 'border-purple-200',
                                                hover: '',
                                                accent: 'bg-purple-400',
                                                badge: 'bg-purple-50 text-purple-700 border-purple-100',
                                                icon: <Moon size={10} />
                                            };
                                            // Default / Integral
                                            return {
                                                borda: 'border-slate-200',
                                                hover: '',
                                                accent: 'bg-slate-400',
                                                badge: 'bg-slate-100 text-slate-700 border-slate-200',
                                                icon: <Layers size={10} />
                                            };
                                        };

                                        const cores = getCores(interpretado.turno);
                                        const estahVazia = t.totalAlunos === 0;

                                        return (
                                            <div
                                                key={t.id}
                                                className="group relative flex flex-col min-w-[150px] max-w-[190px] flex-grow pt-7 pb-1"
                                            >
                                                {/* Botão Excluir (Slides Up) */}
                                                <button
                                                    onClick={(e) => solicitarRemocao(t, e)}
                                                    className="absolute top-8 right-4 z-0 flex h-8 w-10 items-center justify-center rounded-t-lg border border-b-0 border-slate-200 bg-slate-50 text-slate-400 opacity-0 transition-all duration-300 ease-out group-hover:-translate-y-8 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200"
                                                    title="Excluir Turma"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                                {/* Main Card Content */}
                                                <div
                                                    onClick={() => abrirListaAlunos(t)}
                                                    className={`relative z-10 flex flex-col justify-between overflow-hidden rounded-b-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md select-none cursor-pointer ${cores.borda} ${cores.hover}`}
                                                >
                                                    {/* Shift Accent Line (Top) */}
                                                    <div className={`absolute top-0 left-0 right-0 h-1 ${cores.accent}`}></div>

                                                    {/* Header: Identity */}
                                                    <div className="flex items-start justify-between mb-4 pt-1">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Turma</span>
                                                            <span className="text-4xl font-black text-slate-800 leading-none mt-1">{interpretado.letra}</span>
                                                        </div>
                                                        <div className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${cores.badge}`}>
                                                            {cores.icon}
                                                            {interpretado.turno}
                                                        </div>
                                                    </div>

                                                    {/* Middle: Series Info */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-xs font-bold text-slate-500">{interpretado.serie.replace('º', 'ª')} Série</span>
                                                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                                                            <Users size={12} />
                                                            {t.totalAlunos}
                                                        </div>
                                                    </div>

                                                    {/* Bottom: Stats Bar */}
                                                    <div>
                                                        <div className="mb-1.5 flex items-end justify-between text-[10px] font-bold uppercase tracking-wide">
                                                            <span className="text-slate-400">{estahVazia ? 'Status' : 'Presença'}</span>
                                                            <span className={estahVazia ? 'text-slate-300' : (t.percentual >= 75 ? 'text-emerald-600' : 'text-rose-600')}>
                                                                {estahVazia ? 'Sem Alunos' : `${t.percentual}%`}
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${estahVazia ? 'bg-slate-200' : (t.percentual >= 75 ? 'bg-emerald-500' : 'bg-rose-500')}`}
                                                                style={{ width: estahVazia ? '0%' : `${t.percentual}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {/* Hover Interaction Cue */}
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




                </div>
            )}

            {/* Modal Nova Turma */}
            {modalAberto && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) definirModalAberto(false);
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
                        {/* Header Moderno */}
                        <div className="p-6 flex items-start gap-4 bg-blue-50">
                            <div className="p-3 rounded-xl bg-white shadow-sm shrink-0">
                                <Layers className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-slate-800 leading-tight">Nova Turma</h2>
                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                    Preencha os dados abaixo para cadastrar uma nova turma no sistema.
                                </p>
                            </div>
                            <button
                                onClick={() => definirModalAberto(false)}
                                className="text-slate-400 hover:text-slate-600 bg-white/50 hover:bg-white p-1 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Conteúdo Scrollável */}
                        <div className="p-6 space-y-6 overflow-y-auto">
                            {/* 1. Série */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1. Série (Ano)</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['1º', '2º', '3º'].map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => definirNovaTurma(prev => ({ ...prev, serie: s }))}
                                            className={`p-3 rounded-xl border-2 font-black text-lg transition-all ${novaTurma.serie === s
                                                ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                                                : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            {s.replace('º', 'ª')}
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

                            {/* Erro */}
                            {erroCadastro && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
                                    <div className="p-1.5 bg-red-100 rounded-lg">
                                        <XCircle size={16} className="text-red-500" />
                                    </div>
                                    <p className="text-xs font-semibold text-red-600">{erroCadastro}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Ações */}
                        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400 font-bold uppercase">Resultado</span>
                                <span className="text-2xl font-black text-slate-800">
                                    {novaTurma.serie && novaTurma.letra
                                        ? `${novaTurma.serie} ${novaTurma.letra} - ${novaTurma.turno || '?'}`
                                        : '...'}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => definirModalAberto(false)}
                                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={adicionarTurma}
                                    disabled={!novaTurma.serie || !novaTurma.letra || !novaTurma.turno}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Plus size={20} /> Criar Turma
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Lista de Alunos */}
            {modalAlunosAberto && (
                <ModalUniversal
                    titulo={`Alunos da Turma: ${turmaSelecionada?.interpretado?.serie || ''} ${turmaSelecionada?.interpretado?.letra || ''}`}
                    subtitulo={`${alunosDaTurma.length} aluno(s) matriculado(s)`}
                    fechavel
                    alturaDinamica
                    aoFechar={() => definirModalAlunosAberto(false)}
                >
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {alunosDaTurma.length === 0 ? (
                            <p className="text-center text-slate-400 py-8">Nenhum aluno matriculado nesta turma</p>
                        ) : (
                            alunosDaTurma.map((aluno, index) => (
                                <div key={index} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                                    <p className="font-bold text-slate-700">{aluno.nome_completo || aluno.nome}</p>
                                    <p className="text-xs text-slate-500">Matrícula: {aluno.matricula}</p>
                                </div>
                            ))
                        )}
                    </div>
                </ModalUniversal>
            )}

            {/* Modal de Confirmação de Exclusão */}
            {confirmacao && (
                <ModalUniversal
                    titulo={confirmacao.titulo}
                    fechavel
                    aoFechar={() => setConfirmacao(null)}
                >
                    <div className="space-y-6">
                        <p className="text-slate-600">{confirmacao.mensagem}</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmacao(null)}
                                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    confirmacao.acao();
                                    setConfirmacao(null);
                                }}
                                className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition font-bold"
                            >
                                {confirmacao.textoConfirmar || 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </ModalUniversal>
            )}
        </LayoutAdministrativo>
    );
}
