import { useState, useEffect } from 'react';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import ModalUniversal from '../componentes/ModalUniversal';
import { bancoLocal } from '../servicos/bancoLocal';
import {
    Users,
    Search,
    Plus,
    Shield,
    UserCheck,
    UserX,
    Edit2,
    Trash2,
    Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Usuarios() {
    const [usuarios, definirUsuarios] = useState([]);
    const [carregando, definirCarregando] = useState(true);
    const [modalAberto, definirModalAberto] = useState(false);
    const [usuarioEmEdicao, definirUsuarioEmEdicao] = useState(null);
    const [busca, definirBusca] = useState('');

    const [dadosFormulario, definirDadosFormulario] = useState({
        email: '',
        role: 'VISUALIZACAO',
        ativo: true
    });

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const carregarUsuarios = async () => {
        try {
            definirCarregando(true);
            const users = await bancoLocal.listarUsuarios();
            definirUsuarios(users);
        } catch (e) {
            console.error(e);
            toast.error("Erro ao carregar usuários");
        } finally {
            definirCarregando(false);
        }
    };

    const salvarUsuario = async () => {
        if (!dadosFormulario.email) {
            toast.error("Email é obrigatório");
            return;
        }

        try {
            const novoUsuario = {
                email: dadosFormulario.email,
                role: dadosFormulario.role, // Mantendo 'role' para compatibilidade com o form, mas converteremos para 'papel'
                papel: dadosFormulario.role.toUpperCase(), // Backend espera 'ADMIN', 'COORDENACAO', etc.
                ativo: dadosFormulario.ativo,
                nome_completo: usuarioEmEdicao?.nome_completo || dadosFormulario.email.split('@')[0],
                criado_em: usuarioEmEdicao?.criado_em || new Date().toISOString()
            };

            await bancoLocal.salvarUsuario(novoUsuario);

            toast.success("Usuário salvo com sucesso!");
            definirModalAberto(false);
            carregarUsuarios();
        } catch (erro) {
            console.error(erro);
            toast.error("Erro ao salvar usuário");
        }
    };

    const toggleStatus = async (user) => {
        try {
            const usuarioAtualizado = { ...user, ativo: !user.ativo };
            await bancoLocal.salvarUsuario(usuarioAtualizado);

            // Atualiza lista localmente para feedback instantâneo
            definirUsuarios(usuarios.map(u => u.email === user.email ? usuarioAtualizado : u));
            toast.success(`Usuário ${usuarioAtualizado.ativo ? 'ativado' : 'desativado'}!`);
        } catch (erro) {
            console.error(erro);
            toast.error("Erro ao atualizar status");
        }
    };

    const abrirEdicao = (user) => {
        definirUsuarioEmEdicao(user);
        // Mapear 'papel' do banco (ADMIN) para 'role' do form (admin) se necessário, ou usar direto
        definirDadosFormulario({
            email: user.email,
            role: user.papel || user.role || 'VISUALIZACAO',
            ativo: user.ativo
        });
        definirModalAberto(true);
    };

    const novoUsuario = () => {
        definirUsuarioEmEdicao(null);
        definirDadosFormulario({ email: '', role: 'VISUALIZACAO', ativo: true });
        definirModalAberto(true);
    };

    const filteredUsers = usuarios.filter(u => u.email.toLowerCase().includes(busca.toLowerCase()));

    const PapeisDisponiveis = [
        { id: 'ADMIN', nome: 'Administrador', desc: 'Acesso total ao sistema' },
        { id: 'COORDENACAO', nome: 'Coordenação', desc: 'Gestão pedagógica' },
        { id: 'SECRETARIA', nome: 'Secretaria', desc: 'Gestão de alunos e turmas' },
        { id: 'PORTARIA', nome: 'Portaria', desc: 'Apenas registro de acesso' },
        { id: 'VISUALIZACAO', nome: 'Visitante', desc: 'Apenas visualização' }
    ];

    return (
        <LayoutAdministrativo
            titulo="Gerenciamento de Usuários"
            subtitulo="Controle de acesso e permissões"
            acoes={
                <button
                    onClick={novoUsuario}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-600/20"
                >
                    <Plus size={20} /> <span className="hidden sm:inline">Convidar Usuário</span>
                </button>
            }
        >
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 sticky top-0 z-20">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar usuário por email..."
                        value={busca}
                        onChange={(e) => definirBusca(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <div
                        key={user.email}
                        className={`relative bg-white rounded-2xl border ${user.ativo ? 'border-slate-100' : 'border-slate-100 bg-slate-50/50'} p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${user.papel === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                {user.papel === 'ADMIN' ? <Shield size={24} /> : <Users size={24} />}
                            </div>
                            <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${user.ativo ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                {user.ativo ? 'Ativo' : 'Inativo'}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-1 truncate" title={user.email}>{user.email}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">
                            {PapeisDisponiveis.find(p => p.id === user.papel || p.id === user.role)?.nome || user.papel || user.role || 'Visitante'}
                        </p>

                        <div className="flex gap-2 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => abrirEdicao(user)}
                                className="flex-1 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit2 size={14} /> Editar
                            </button>
                            <button
                                onClick={() => toggleStatus(user.id)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 border ${user.ativo
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-100'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100'
                                    }`}
                            >
                                {user.ativo ? <UserX size={14} /> : <UserCheck size={14} />}
                                {user.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {modalAberto && (
                <ModalUniversal
                    titulo={usuarioEmEdicao ? "Editar Usuário" : "Novo Usuário"}
                    fechavel
                    aoFechar={() => definirModalAberto(false)}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                            <input
                                type="email"
                                value={dadosFormulario.email}
                                onChange={(e) => definirDadosFormulario({ ...dadosFormulario, email: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Função / Cargo</label>
                            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
                                {PapeisDisponiveis.map((papel) => (
                                    <button
                                        key={papel.id}
                                        onClick={() => definirDadosFormulario({ ...dadosFormulario, role: papel.id })}
                                        className={`
                                            flex items-center p-3 rounded-xl border text-left transition-all
                                            ${dadosFormulario.role === papel.id
                                                ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500/20'
                                                : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'}
                                        `}
                                    >
                                        <div className={`
                                            w-4 h-4 rounded-full border mr-3 flex items-center justify-center
                                            ${dadosFormulario.role === papel.id ? 'border-indigo-500' : 'border-slate-300'}
                                        `}>
                                            {dadosFormulario.role === papel.id && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${dadosFormulario.role === papel.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                {papel.nome}
                                            </p>
                                            <p className="text-xs text-slate-400 font-medium">
                                                {papel.desc}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={salvarUsuario}
                            className="w-full py-3 mt-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </ModalUniversal>
            )}

        </LayoutAdministrativo>
    );
}
