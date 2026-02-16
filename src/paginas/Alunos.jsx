import { useState, useEffect } from 'react';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import ModalUniversal from '../componentes/ModalUniversal';
import { bancoLocal } from '../servicos/bancoLocal';
import { api } from '../servicos/api';
import {
    Users,
    Search,
    Plus,
    Filter,
    Edit2,
    Trash2,
    QrCode,
    MoreVertical,
    Download,
    Upload,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Camera
} from 'lucide-react';
import toast from 'react-hot-toast';


export default function Alunos() {
    const [alunos, definirAlunos] = useState([]);
    const [turmas, definirTurmas] = useState([]);
    const [carregando, definirCarregando] = useState(true);
    const [modalAberto, definirModalAberto] = useState(false);
    const [modalImportacao, definirModalImportacao] = useState(false);
    const [alunoEmEdicao, definirAlunoEmEdicao] = useState(null);
    const [modalQRCode, definirModalQRCode] = useState(false);
    const [qrcodeAtual, definirQrcodeAtual] = useState(null);

    // Filtros e Busca
    const [termoBusca, definirTermoBusca] = useState('');
    const [filtroTurma, definirFiltroTurma] = useState('');
    const [paginaAtual, definirPaginaAtual] = useState(1);
    const itensPorPagina = 10;

    // Form
    const [dadosFormulario, definirDadosFormulario] = useState({
        nome: '',
        matricula: '',
        turma: ''
    });

    const carregarDados = async () => {
        try {
            definirCarregando(true);
            const banco = await bancoLocal.iniciarBanco();
            const listaAlunos = await banco.getAll('alunos');
            const listaTurmas = await banco.getAll('turmas');

            // Ordenar por nome
            listaAlunos.sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));
            listaTurmas.sort((a, b) => a.id.localeCompare(b.id));

            definirAlunos(listaAlunos);
            definirTurmas(listaTurmas);
        } catch (erro) {
            console.error('Erro ao carregar:', erro);
            toast.error('Erro ao carregar lista de alunos.');
        } finally {
            definirCarregando(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    const salvarAluno = async () => {
        if (!dadosFormulario.nome || !dadosFormulario.matricula || !dadosFormulario.turma) {
            toast.error('Preencha todos os campos obrigatórios.');
            return;
        }

        try {
            const banco = await bancoLocal.iniciarBanco();

            // Verificar duplicidade
            if (!alunoEmEdicao) {
                const existente = await banco.get('alunos', dadosFormulario.matricula);
                if (existente) {
                    toast.error('Matrícula já cadastrada!');
                    return;
                }
            }

            const alunoObj = {
                matricula: dadosFormulario.matricula,
                nome_completo: dadosFormulario.nome, // Mantendo compatibilidade com schema
                turma_id: dadosFormulario.turma,
                criado_em: alunoEmEdicao ? alunoEmEdicao.criado_em : new Date().toISOString(),
                atualizado_em: new Date().toISOString()
            };

            await banco.put('alunos', alunoObj);

            if (navigator.onLine) {
                try {
                    await api.enviar(`/alunos/${dadosFormulario.matricula}`, alunoObj);
                } catch (e) { console.warn('Sync nuvem falhou:', e); }
            }

            toast.success(alunoEmEdicao ? 'Aluno atualizado!' : 'Aluno cadastrado!');
            definirModalAberto(false);
            carregarDados();
            limparForm();
        } catch (erro) {
            console.error('Erro ao salvar:', erro);
            toast.error('Falha ao salvar aluno.');
        }
    };

    const excluirAluno = async (matricula) => {
        if (!window.confirm(`Excluir aluno ${matricula}?`)) return;

        try {
            const banco = await bancoLocal.iniciarBanco();
            await banco.delete('alunos', matricula);

            // Sync delete...

            toast.success('Aluno removido.');
            carregarDados();
        } catch (erro) {
            toast.error('Erro ao excluir.');
        }
    };

    const abrirEdicao = (aluno) => {
        definirAlunoEmEdicao(aluno);
        definirDadosFormulario({
            nome: aluno.nome_completo,
            matricula: aluno.matricula,
            turma: aluno.turma_id
        });
        definirModalAberto(true);
    };

    const abrirNovo = () => {
        limparForm();
        definirModalAberto(true);
    };

    const limparForm = () => {
        definirAlunoEmEdicao(null);
        definirDadosFormulario({ nome: '', matricula: '', turma: '' });
    };

    const verQRCode = (matricula) => {
        definirQrcodeAtual(matricula);
        definirModalQRCode(true);
    };

    // Lógica de Paginação e Filtro
    const alunosFiltrados = alunos.filter(a => {
        const matchNome = a.nome_completo.toLowerCase().includes(termoBusca.toLowerCase()) ||
            a.matricula.includes(termoBusca);
        const matchTurma = !filtroTurma || a.turma_id === filtroTurma;
        return matchNome && matchTurma;
    });

    const totalPaginas = Math.ceil(alunosFiltrados.length / itensPorPagina);
    const paginados = alunosFiltrados.slice(
        (paginaAtual - 1) * itensPorPagina,
        paginaAtual * itensPorPagina
    );

    // Avatar Generator Based on Matricula (Consistent Colors)
    const getAvatarColor = (id) => {
        const colors = [
            'from-rose-400 to-orange-500',
            'from-emerald-400 to-teal-500',
            'from-blue-400 to-indigo-500',
            'from-violet-400 to-fuchsia-500',
            'from-amber-400 to-yellow-500'
        ];
        const index = parseInt(id.slice(-1)) % colors.length || 0;
        return colors[index];
    };

    const AcoesHeader = (
        <div className="flex gap-2">
            <button
                onClick={() => definirModalImportacao(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:text-indigo-600 transition-all"
            >
                <Upload size={18} /> Importar
            </button>
            <button
                onClick={abrirNovo}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 border border-white/10"
            >
                <Plus size={20} />
                <span className="hidden sm:inline">Novo Aluno</span>
            </button>
        </div>
    );

    return (
        <LayoutAdministrativo titulo="Gestão de Alunos" subtitulo="Cadastro e controle de matrículas" acoes={AcoesHeader}>

            {/* Filters Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 animate-[fade-in_0.3s_ease-out] sticky top-0 z-20">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou matrícula..."
                        value={termoBusca}
                        onChange={(e) => definirTermoBusca(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </div>

                <div className="w-full md:w-48">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            value={filtroTurma}
                            onChange={(e) => definirFiltroTurma(e.target.value)}
                            className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer"
                        >
                            <option value="">Todas as Turmas</option>
                            {turmas.map(t => (
                                <option key={t.id} value={t.id}>{t.id}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-[fade-in_0.5s_ease-out]">
                {carregando ? (
                    <div className="p-12 text-center text-slate-400 animate-pulse">Carregando alunos...</div>
                ) : alunosFiltrados.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-sm border border-slate-100">
                            <Users size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum aluno encontrado</h3>
                        <p className="text-slate-400 text-sm">Tente mudar os filtros ou adicione um aluno.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap">
                                <thead className="bg-slate-50/80 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Aluno</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Matrícula</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Turma</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginados.map((aluno) => (
                                        <tr key={aluno.matricula} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(aluno.matricula)} flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white`}>
                                                        {aluno.nome_completo[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-700">{aluno.nome_completo}</div>
                                                        <div className="text-xs text-slate-400 font-medium hidden sm:block">Ativo</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md inline-block">
                                                    {aluno.matricula}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    {aluno.turma_id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => verQRCode(aluno.matricula)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                        title="Ver QR Code"
                                                    >
                                                        <QrCode size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => abrirEdicao(aluno)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => excluirAluno(aluno.matricula)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/30">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                Mostrando {paginados.length} de {alunosFiltrados.length}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => definirPaginaAtual(p => Math.max(1, p - 1))}
                                    disabled={paginaAtual === 1}
                                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 transition"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => definirPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                                    disabled={paginaAtual === totalPaginas}
                                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 transition"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal Novo/Editar */}
            {modalAberto && (
                <ModalUniversal
                    titulo={alunoEmEdicao ? "Editar Aluno" : "Novo Aluno"}
                    fechavel
                    aoFechar={() => definirModalAberto(false)}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome Completo</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={dadosFormulario.nome}
                                onChange={(e) => definirDadosFormulario({ ...dadosFormulario, nome: e.target.value })}
                                placeholder="Nome do aluno"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Matrícula</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                                    value={dadosFormulario.matricula}
                                    onChange={(e) => definirDadosFormulario({ ...dadosFormulario, matricula: e.target.value })}
                                    disabled={!!alunoEmEdicao}
                                    placeholder="000000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Turma</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={dadosFormulario.turma}
                                    onChange={(e) => definirDadosFormulario({ ...dadosFormulario, turma: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {turmas.map(t => (
                                        <option key={t.id} value={t.id}>{t.id}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={salvarAluno}
                            className="w-full py-3 mt-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={18} /> Salvar
                        </button>
                    </div>
                </ModalUniversal>
            )}

            {/* Modal QR Code */}
            {modalQRCode && (
                <ModalUniversal
                    titulo="Carteirinha Digital"
                    fechavel
                    aoFechar={() => definirModalQRCode(false)}
                >
                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-100 shadow-inner">
                        <div className="p-4 bg-white border-4 border-slate-900 rounded-2xl mb-4">
                            {/* Placeholder QR - Em prod usar lib qrcode.react */}
                            <div className="w-48 h-48 bg-slate-900 flex items-center justify-center text-white font-mono text-xs">
                                [QR: {qrcodeAtual}]
                            </div>
                        </div>
                        <p className="text-sm font-bold text-slate-800 mb-1">Matrícula: {qrcodeAtual}</p>
                        <p className="text-xs text-slate-400">Escaneie para registrar acesso</p>
                    </div>
                </ModalUniversal>
            )}

            {/* Modal Importação (Placeholder) */}
            {modalImportacao && (
                <ModalUniversal titulo="Importar Alunos" fechavel aoFechar={() => definirModalImportacao(false)}>
                    <div className="text-center p-6">
                        <Upload size={48} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Funcionalidade de importação CSV em desenvolvimento.</p>
                    </div>
                </ModalUniversal>
            )}
        </LayoutAdministrativo>
    );
}
