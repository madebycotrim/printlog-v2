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
    Camera,
    FileSpreadsheet,
    AlertTriangle,
    Clipboard,
    FileText
} from 'lucide-react';
import { read, utils } from 'xlsx';
import toast from 'react-hot-toast';


export default function Alunos() {
    const [alunos, definirAlunos] = useState([]);
    const [turmas, definirTurmas] = useState([]);
    const [carregando, definirCarregando] = useState(true);
    const [modalAberto, definirModalAberto] = useState(false);
    const [modalImportacao, definirModalImportacao] = useState(false);
    const [importando, definirImportando] = useState(false);
    const [resultadoImportacao, definirResultadoImportacao] = useState(null);
    const [textoColado, definirTextoColado] = useState('');






    const baixarModelo = () => {
        const headers = [['Nome Completo', 'Matricula', 'Turma']];
        const ws = utils.aoa_to_sheet(headers);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Modelo");

        try {
            import('xlsx').then(xlsx => {
                xlsx.writeFile(wb, "modelo_alunos_SCAE.xlsx");
            });
        } catch (e) {
            console.error("Erro ao baixar modelo", e);
            toast.error("Erro ao gerar modelo");
        }
    };

    const importarDados = async (jsonData) => {
        let sucessos = 0;
        let erros = 0;
        let errosDetalhes = [];
        const novosAlunos = [];

        // Obter matrículas já existentes
        const matriculasExistentes = new Set(alunos.map(a => a.matricula));

        for (const row of jsonData) {
            // Normalizar chaves para suportar visualização de array (colar) ou objeto (arquivo)
            // Se for array (colar): index 0 = Nome, 1 = Matricula, 2 = Turma
            // Se for objeto (arquivo): usar chaves

            let nome, matricula, turma;

            if (Array.isArray(row)) {
                if (row.length < 2) continue; // Linha vazia ou incompleta
                nome = row[0];
                matricula = row[1];
                turma = row[2];
            } else {
                nome = row['Nome Completo'] || row['Nome'] || row['nome'];
                matricula = row['Matricula'] || row['Matrícula'] || row['matricula'];
                turma = row['Turma'] || row['turma'];
            }

            const aluno = {
                nome_completo: nome,
                matricula: String(matricula || '').trim(),
                turma_id: turma
            };

            // Validação Básica
            if (!aluno.nome_completo || !aluno.matricula) {
                // Não contar linha vazia como erro se for totalmente vazia
                if (!aluno.nome_completo && !aluno.matricula && !aluno.turma_id) continue;
                erros++;
                continue;
            }

            // Verificar duplicidade
            if (matriculasExistentes.has(aluno.matricula)) {
                erros++;
                errosDetalhes.push(`Matrícula duplicada: ${aluno.matricula} (${aluno.nome_completo})`);
                continue;
            }

            novosAlunos.push({
                ...aluno,
                criado_em: new Date().toISOString()
            });
            matriculasExistentes.add(aluno.matricula);
            sucessos++;
        }

        if (novosAlunos.length > 0) {
            const banco = await bancoLocal.iniciarBanco();
            const tx = banco.transaction('alunos', 'readwrite');
            await Promise.all(novosAlunos.map(aluno => tx.store.put(aluno)));
            await tx.done;

            await carregarDados();
            toast.success(`${sucessos} alunos importados com sucesso!`);
        } else {
            if (sucessos === 0 && erros === 0) {
                toast.error("Nenhum dado encontrado ou colunas incorretas.");
            }
        }

        return {
            total: jsonData.length,
            sucessos,
            erros,
            detalhes: errosDetalhes
        };
    };


    const processarArquivo = async (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        definirImportando(true);
        definirResultadoImportacao(null);

        try {
            const data = await arquivo.arrayBuffer();
            const workbook = read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            // Sheet to json padrão gera objetos
            const jsonDataObjetos = utils.sheet_to_json(worksheet);

            const resultado = await importarDados(jsonDataObjetos);
            definirResultadoImportacao(resultado);

        } catch (erro) {
            console.error("Erro na importação:", erro);
            toast.error("Falha ao processar arquivo.");
        } finally {
            definirImportando(false);
            e.target.value = null;
        }
    };

    const processarColagem = async () => {
        if (!textoColado.trim()) {
            toast.error("Cole os dados primeiro.");
            return;
        }

        definirImportando(true);
        definirResultadoImportacao(null);

        try {
            // Processar TSV (Tab Separated Values) ou CSV simples
            // Excel copia com \t entre colunas e \n entre linhas
            const linhas = textoColado.trim().split('\n');
            const data = linhas.map(linha => linha.split('\t'));

            // Remover cabeçalho se houver (se a primeira linha parecer cabeçalho)
            // Lógica simples: se primeira coluna for "Nome..." ignorar
            if (data.length > 0) {
                const primeiraLinha = (data[0][0] || '').toLowerCase();
                if (primeiraLinha.includes('nome') || primeiraLinha.includes('matricula')) {
                    data.shift();
                }
            }

            const resultado = await importarDados(data);
            definirResultadoImportacao(resultado);
        } catch (erro) {
            console.error("Erro na colagem:", erro);
            toast.error("Falha ao processar texto colado.");
        } finally {
            definirImportando(false);
        }
    };

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

    const [modalExclusaoAberto, definirModalExclusaoAberto] = useState(false);
    const [alunoParaExcluir, definirAlunoParaExcluir] = useState(null);

    // ... (existing code)

    const solicitarExclusao = (aluno) => {
        definirAlunoParaExcluir(aluno);
        definirModalExclusaoAberto(true);
    };

    const confirmarExclusao = async () => {
        if (!alunoParaExcluir) return;
        try {
            await excluirAluno(alunoParaExcluir.matricula);
            definirModalExclusaoAberto(false);
            definirAlunoParaExcluir(null);
            // toast.success já é chamado dentro de excluirAluno? Não, ele chama carregarAlunos que não tem toast de sucesso de exclusão.
            // Vamos assumir que excluirAluno faz o trabalho pesado.
        } catch (error) {
            console.error(error);
        }
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

    // Avatar Generator Based on Matricula (Premium Gradients)
    const getAvatarColor = (id) => {
        const colors = [
            'from-indigo-500 to-purple-600',
            'from-emerald-400 to-teal-600',
            'from-rose-400 to-pink-600',
            'from-amber-400 to-orange-500',
            'from-sky-400 to-blue-600',
            'from-violet-500 to-fuchsia-600'
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
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 sticky top-0 z-20">
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
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {carregando ? (
                    <div className="p-12 text-center text-slate-400">Carregando alunos...</div>
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
                                                <div className="flex items-center gap-4">
                                                    <div className={`
                                                        w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarColor(aluno.matricula)} 
                                                        flex items-center justify-center text-white font-bold text-sm 
                                                        shadow-lg shadow-indigo-500/10 ring-4 ring-white
                                                    `}>
                                                        {aluno.nome_completo.split(' ').map((n, i, arr) => i === 0 || i === arr.length - 1 ? n[0] : '').join('').toUpperCase().substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">{aluno.nome_completo}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                                            {aluno.turma_id || 'Sem Turma'}
                                                        </div>
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
                                                        onClick={() => solicitarExclusao(aluno)}
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
                    titulo={alunoEmEdicao ? "Editar Cadastro do Aluno" : "Matricular Novo Aluno"}
                    subtitulo={alunoEmEdicao ? "Atualize os dados pessoais ou escolaridade do aluno." : "Preencha os dados abaixo para registrar um novo aluno no sistema."}
                    fechavel
                    aoFechar={() => definirModalAberto(false)}
                >
                    <div className="space-y-6">
                        {/* Nome Completo */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome do Aluno</label>
                            <input
                                type="text"
                                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-lg font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-normal placeholder:text-slate-400"
                                value={dadosFormulario.nome}
                                onChange={(e) => definirDadosFormulario({ ...dadosFormulario, nome: e.target.value })}
                                placeholder="Ex: João da Silva"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Matrícula */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Matrícula</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-base font-black text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono tracking-wide"
                                        value={dadosFormulario.matricula}
                                        onChange={(e) => definirDadosFormulario({ ...dadosFormulario, matricula: e.target.value })}
                                        disabled={!!alunoEmEdicao}
                                        placeholder="000000"
                                    />
                                    <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-slate-400 border-r border-slate-200">
                                        <span className="text-xs font-bold">#</span>
                                    </div>
                                </div>
                            </div>

                            {/* Turma */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Turma</label>
                                <div className="relative">
                                    <select
                                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-base font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                        value={dadosFormulario.turma}
                                        onChange={(e) => definirDadosFormulario({ ...dadosFormulario, turma: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {turmas.map(t => (
                                            <option key={t.id} value={t.id}>{t.id}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Ações */}
                        <div className="flex gap-4 pt-6 mt-2 border-t border-slate-100">
                            <button
                                onClick={() => definirModalAberto(false)}
                                className="flex-1 py-4 px-6 rounded-xl border border-transparent text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-700 transition-all uppercase tracking-wide text-xs"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={salvarAluno}
                                className="flex-[2] py-4 px-6 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 uppercase tracking-wide text-xs"
                            >
                                <CheckCircle size={18} className="text-indigo-200" />
                                {alunoEmEdicao ? 'Salvar Alterações' : 'Cadastrar Aluno'}
                            </button>
                        </div>
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

            {/* Modal Importação Funcional */}
            {modalImportacao && (
                <ModalUniversal
                    titulo="Importar Alunos"
                    subtitulo="Carregue uma planilha (.xlsx ou .csv) para cadastrar em massa."
                    fechavel
                    aoFechar={() => {
                        definirModalImportacao(false);
                        definirResultadoImportacao(null);
                    }}
                >
                    <div className="p-4">
                        {!resultadoImportacao ? (
                            <div className="space-y-6">
                                {/* Área de Upload */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-colors group relative cursor-pointer flex flex-col items-center justify-center">
                                        <input
                                            type="file"
                                            accept=".xlsx, .xls, .csv"
                                            onChange={processarArquivo}
                                            disabled={importando}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            {importando ? (
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                            ) : (
                                                <FileSpreadsheet size={28} className="text-indigo-500" />
                                            )}
                                        </div>
                                        <h3 className="font-bold text-slate-700 mb-1">Upload de Arquivo</h3>
                                        <p className="text-xs text-slate-400">.xlsx ou .csv</p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="relative flex-1">
                                            <textarea
                                                value={textoColado}
                                                onChange={(e) => definirTextoColado(e.target.value)}
                                                placeholder="Cole aqui os dados do Excel (Nome | Matrícula | Turma)..."
                                                className="w-full h-full min-h-[140px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
                                            ></textarea>
                                            <div className="absolute top-3 right-3 text-slate-300">
                                                <Clipboard size={16} />
                                            </div>
                                        </div>
                                        <button
                                            onClick={processarColagem}
                                            disabled={importando || !textoColado.trim()}
                                            className="py-3 px-4 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                                        >
                                            <FileText size={16} />
                                            Processar Texto
                                        </button>
                                    </div>
                                </div>

                                {/* Botão Modelo */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={baixarModelo}
                                        className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                                    >
                                        <Download size={16} />
                                        Baixar planilha modelo
                                    </button>
                                </div>

                                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3 items-start">
                                    <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                                    <div className="text-sm text-amber-800">
                                        <p className="font-bold mb-1">Importante:</p>
                                        <p>A planilha deve conter as colunas: <strong>Nome Completo</strong>, <strong>Matrícula</strong> e <strong>Turma</strong>.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Resultado */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 text-center">
                                        <div className="text-3xl font-black text-emerald-600 mb-1">{resultadoImportacao.sucessos}</div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Importados</div>
                                    </div>
                                    <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100 text-center">
                                        <div className="text-3xl font-black text-rose-600 mb-1">{resultadoImportacao.erros}</div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-rose-700">Erros</div>
                                    </div>
                                </div>

                                {resultadoImportacao.detalhes.length > 0 && (
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                        <div className="px-4 py-3 bg-slate-100/50 border-b border-slate-200 font-bold text-xs uppercase text-slate-500">
                                            Detalhes dos Erros
                                        </div>
                                        <div className="max-h-40 overflow-y-auto p-4 space-y-2">
                                            {resultadoImportacao.detalhes.map((erro, i) => (
                                                <div key={i} className="text-xs text-rose-600 flex items-start gap-2">
                                                    <span className="shrink-0">•</span>
                                                    <span>{erro}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => definirResultadoImportacao(null)}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
                                >
                                    Nova Importação
                                </button>
                            </div>
                        )}
                    </div>
                </ModalUniversal>
            )}
            {/* Modal de Exclusão */}
            {modalExclusaoAberto && alunoParaExcluir && (
                <ModalUniversal
                    aberto={modalExclusaoAberto}
                    aoFechar={() => definirModalExclusaoAberto(false)}
                    titulo="Excluir Aluno"
                    subtitulo="Esta ação é irreversível e removerá todos os dados deste aluno."
                    icone={Trash2}
                    cor="rose"
                    tamanho="sm"
                >
                    <div className="p-4">
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Você está prestes a excluir o aluno <strong className="text-slate-900">{alunoParaExcluir.nome_completo}</strong> (Matrícula: {alunoParaExcluir.matricula}).
                            <br /><br />
                            Deseja realmente continuar?
                        </p>

                        <div className="flex gap-3 justify-end pt-4 border-t border-slate-50">
                            <button
                                onClick={() => definirModalExclusaoAberto(false)}
                                className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-700 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarExclusao}
                                className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Trash2 size={18} />
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </ModalUniversal>
            )}

        </LayoutAdministrativo>
    );
}
