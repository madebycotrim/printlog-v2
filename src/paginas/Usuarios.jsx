import { useState, useEffect } from 'react';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import ModalUniversal from '../componentes/ModalUniversal';
import { usePermissoes } from '../contexts/ContextoPermissoes';
import { useAutenticacao } from '../contexts/ContextoAutenticacao';
import { bancoLocal } from '../servicos/bancoLocal';
import { api } from '../servicos/api';
import { registrarAuditoria, ACOES_AUDITORIA } from '../servicos/auditoria';
import { UserPlus, Shield, AlertTriangle, CheckCircle, XCircle, Edit2, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PAPEIS = {
    ADMIN: { label: 'Administrador', cor: 'rose' },
    COORDENACAO: { label: 'Coordenação', cor: 'indigo' },
    SECRETARIA: { label: 'Secretaria', cor: 'blue' },
    PORTARIA: { label: 'Portaria', cor: 'emerald' },
    VISUALIZACAO: { label: 'Visualização', cor: 'slate' }
};

export default function Usuarios() {
    const { podeAcessar } = usePermissoes();
    const { usuarioAtual } = useAutenticacao();
    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        nome_completo: '',
        papel: 'VISUALIZACAO'
    });
    const [erro, setErro] = useState('');

    const carregarUsuarios = async () => {
        try {
            setCarregando(true);
            const banco = await bancoLocal.iniciarBanco();
            const todosUsuarios = await banco.getAll('usuarios');

            // Ordenar por data de criação (mais recente primeiro)
            todosUsuarios.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));

            setUsuarios(todosUsuarios);
        } catch (erro) {
            console.error('Erro ao carregar usuários:', erro);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const abrirModalNovo = () => {
        setUsuarioEditando(null);
        setFormData({ email: '', nome_completo: '', papel: 'VISUALIZACAO' });
        setErro('');
        setModalAberto(true);
    };

    const abrirModalEdicao = (usuario) => {
        setUsuarioEditando(usuario);
        setFormData({
            email: usuario.email,
            nome_completo: usuario.nome_completo,
            papel: usuario.papel
        });
        setErro('');
        setModalAberto(true);
    };

    const salvarUsuario = async () => {
        try {
            setErro('');

            // Validações
            if (!formData.email || !formData.nome_completo || !formData.papel) {
                setErro('Preencha todos os campos obrigatórios');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                setErro('Email inválido');
                return;
            }

            const banco = await bancoLocal.iniciarBanco();

            if (usuarioEditando) {
                // EDITAR usuário existente
                const usuarioAnterior = { ...usuarioEditando };
                const usuarioAtualizado = {
                    ...usuarioEditando,
                    nome_completo: formData.nome_completo,
                    papel: formData.papel,
                    atualizado_em: new Date().toISOString()
                };

                // Salvar localmente
                await banco.put('usuarios', usuarioAtualizado);

                // Tentar salvar na nuvem
                if (navigator.onLine) {
                    try {
                        await api.enviar(`/usuarios/${formData.email}`, usuarioAtualizado);
                    } catch (e) {
                        console.warn('Erro ao atualizar na nuvem:', e);
                    }
                }

                // Registrar auditoria
                if (usuarioAtual?.email) {
                    await registrarAuditoria({
                        usuarioEmail: usuarioAtual.email,
                        acao: ACOES_AUDITORIA.EDITAR_PERMISSOES,
                        entidadeTipo: 'usuario',
                        entidadeId: formData.email,
                        dadosAnteriores: usuarioAnterior,
                        dadosNovos: usuarioAtualizado
                    });
                }
            } else {
                // CRIAR novo usuário
                // Verificar duplicidade
                const usuarioExistente = await banco.get('usuarios', formData.email);
                if (usuarioExistente) {
                    setErro('Já existe um usuário com este email');
                    return;
                }

                const novoUsuario = {
                    email: formData.email,
                    nome_completo: formData.nome_completo,
                    papel: formData.papel,
                    ativo: true,
                    criado_por: usuarioAtual?.email || 'system',
                    criado_em: new Date().toISOString(),
                    atualizado_em: new Date().toISOString()
                };

                // Salvar localmente
                await banco.put('usuarios', novoUsuario);

                // Tentar salvar na nuvem
                if (navigator.onLine) {
                    try {
                        await api.enviar('/usuarios', novoUsuario);
                    } catch (e) {
                        console.warn('Erro ao criar na nuvem:', e);
                    }
                }

                // Registrar auditoria
                if (usuarioAtual?.email) {
                    await registrarAuditoria({
                        usuarioEmail: usuarioAtual.email,
                        acao: ACOES_AUDITORIA.CRIAR_USUARIO,
                        entidadeTipo: 'usuario',
                        entidadeId: formData.email,
                        dadosAnteriores: null,
                        dadosNovos: novoUsuario
                    });
                }
            }

            setModalAberto(false);
            carregarUsuarios();
        } catch (erro) {
            console.error('Erro ao salvar usuário:', erro);
            setErro('Erro ao salvar usuário. Tente novamente.');
        }
    };

    const alternarStatusUsuario = async (usuario) => {
        if (usuario.email === usuarioAtual?.email) {
            alert('Você não pode desativar sua própria conta');
            return;
        }

        const acao = usuario.ativo ? 'desativar' : 'reativar';
        if (!window.confirm(`Tem certeza que deseja ${acao} o usuário ${usuario.nome_completo}?`)) {
            return;
        }

        try {
            const banco = await bancoLocal.iniciarBanco();
            const usuarioAnterior = { ...usuario };
            const usuarioAtualizado = {
                ...usuario,
                ativo: !usuario.ativo,
                atualizado_em: new Date().toISOString()
            };

            await banco.put('usuarios', usuarioAtualizado);

            // Atualizar na nuvem
            if (navigator.onLine) {
                try {
                    await api.enviar(`/usuarios/${usuario.email}`, usuarioAtualizado);
                } catch (e) {
                    console.warn('Erro ao atualizar na nuvem:', e);
                }
            }

            // Registrar auditoria
            if (usuarioAtual?.email) {
                await registrarAuditoria({
                    usuarioEmail: usuarioAtual.email,
                    acao: usuario.ativo ? ACOES_AUDITORIA.DESATIVAR_USUARIO : 'REATIVAR_USUARIO',
                    entidadeTipo: 'usuario',
                    entidadeId: usuario.email,
                    dadosAnteriores: usuarioAnterior,
                    dadosNovos: usuarioAtualizado
                });
            }

            carregarUsuarios();
        } catch (erro) {
            console.error('Erro ao alterar status:', erro);
            alert('Erro ao alterar status do usuário');
        }
    };

    const getCorPapel = (papel) => {
        return PAPEIS[papel]?.cor || 'slate';
    };

    // Verificar permissão
    if (!podeAcessar('usuarios', 'gerenciar')) {
        return (
            <LayoutAdministrativo titulo="Gestão de Usuários" subtitulo="Controle de acesso e permissões">
                <div className="flex flex-col items-center justify-center p-16 text-center">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} className="text-rose-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Acesso Negado</h3>
                    <p className="text-sm text-slate-500 max-w-md">
                        Apenas administradores podem gerenciar usuários e permissões.
                    </p>
                </div>
            </LayoutAdministrativo>
        );
    }

    const AcoesHeader = (
        <button
            onClick={abrirModalNovo}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 border border-white/10"
        >
            <UserPlus size={20} />
            <span className="tracking-wide">Novo Usuário</span>
        </button>
    );

    return (
        <LayoutAdministrativo titulo="Gestão de Usuários do Sistema" subtitulo="Controle de acesso para staff administrativo" acoes={AcoesHeader}>
            {/* Nota Explicativa */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-1">ℹ️ Sobre Usuários do Sistema</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                        <strong>Usuários</strong> são membros do staff (professores, coordenação, secretaria, portaria) que <strong>fazem login no sistema</strong> com email institucional.
                        <br />
                        <strong>Alunos</strong> são cadastrados apenas para controle de acesso e <strong>NÃO fazem login</strong> - veja a página "Alunos" para gerenciá-los.
                    </p>
                </div>
            </div>

            {carregando ? (
                <div className="p-8 text-center text-slate-500 animate-pulse text-sm">Carregando usuários...</div>
            ) : (
                <div className="space-y-6">
                    {/* Lista de Usuários */}
                    {usuarios.length === 0 ? (
                        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-16 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-sm">
                                <User size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-700">Nenhum usuário cadastrado</h3>
                            <p className="text-xs text-slate-400 max-w-xs mt-1 mx-auto">
                                Clique em "Novo Usuário" para começar a gerenciar permissões.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {usuarios.map((usuario) => {
                                const corPapel = getCorPapel(usuario.papel);
                                return (
                                    <div
                                        key={usuario.email}
                                        className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-all"
                                    >
                                        {/* Avatar e Status */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-xl bg-${corPapel}-100 flex items-center justify-center shadow-sm`}>
                                                    <Shield size={24} className={`text-${corPapel}-600`} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-700 line-clamp-1">
                                                        {usuario.nome_completo}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 line-clamp-1">
                                                        {usuario.email}
                                                    </p>
                                                </div>
                                            </div>
                                            {usuario.ativo ? (
                                                <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                                            ) : (
                                                <XCircle size={20} className="text-rose-500 flex-shrink-0" />
                                            )}
                                        </div>

                                        {/* Papel */}
                                        <div className="mb-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border bg-${corPapel}-100 text-${corPapel}-700 border-${corPapel}-200`}>
                                                {PAPEIS[usuario.papel]?.label || usuario.papel}
                                            </span>
                                        </div>

                                        {/* Informações */}
                                        <div className="text-xs text-slate-500 space-y-1 mb-4 pb-4 border-b border-slate-100">
                                            <p>
                                                Criado em {format(new Date(usuario.criado_em), 'dd/MM/yyyy', { locale: ptBR })}
                                            </p>
                                            {usuario.criado_por && (
                                                <p className="line-clamp-1">
                                                    Por: {usuario.criado_por}
                                                </p>
                                            )}
                                        </div>

                                        {/* Ações */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => abrirModalEdicao(usuario)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-xs font-bold"
                                            >
                                                <Edit2 size={14} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => alternarStatusUsuario(usuario)}
                                                disabled={usuario.email === usuarioAtual?.email}
                                                className={`flex-1 px-3 py-2 rounded-lg transition text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed ${usuario.ativo
                                                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                    }`}
                                            >
                                                {usuario.ativo ? 'Desativar' : 'Reativar'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Criar/Editar */}
            {modalAberto && (
                <ModalUniversal
                    titulo={usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
                    subtitulo={usuarioEditando ? `Modificando permissões de ${usuarioEditando.email}` : 'Cadastre um novo usuário no sistema'}
                    fechavel
                    aoFechar={() => setModalAberto(false)}
                >
                    <div className="space-y-5">
                        {erro && (
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2">
                                <AlertTriangle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-rose-700">{erro}</p>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Email Institucional *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={!!usuarioEditando}
                                placeholder="usuario@escola.edu.br"
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                            />
                            <p className="text-xs text-slate-400 mt-1.5">
                                Email usado para login no sistema
                            </p>
                        </div>

                        {/* Nome Completo */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                value={formData.nome_completo}
                                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                                placeholder="João da Silva"
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                            />
                        </div>

                        {/* Papel */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Papel *
                            </label>
                            <select
                                value={formData.papel}
                                onChange={(e) => setFormData({ ...formData, papel: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all appearance-none cursor-pointer"
                            >
                                {Object.entries(PAPEIS).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-400 mt-2">
                                Define as permissões que o usuário terá no sistema
                            </p>
                        </div>

                        {/* Botões */}
                        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                            <button
                                onClick={() => setModalAberto(false)}
                                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={salvarUsuario}
                                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-bold flex items-center gap-2"
                            >
                                <Shield size={16} />
                                {usuarioEditando ? 'Salvar Alterações' : 'Criar Usuário'}
                            </button>
                        </div>
                    </div>
                </ModalUniversal>
            )}
        </LayoutAdministrativo>
    );
}
