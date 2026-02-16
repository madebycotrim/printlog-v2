import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../contexts/ContextoAutenticacao';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import { bancoLocal } from '../servicos/bancoLocal';
import {
    Database,
    Table,
    RefreshCw,
    Search,
    Trash2,
    AlertTriangle,
    HardDrive
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BancoDados() {
    const [lojas, definirLojas] = useState([]);
    const [lojaSelecionada, definirLojaSelecionada] = useState('');
    const [dados, definirDados] = useState([]);
    const [carregando, definirCarregando] = useState(false);
    const [termoBusca, definirTermoBusca] = useState('');
    const { usuarioAtual } = useAutenticacao();
    const navegar = useNavigate();

    useEffect(() => {
        if (usuarioAtual && usuarioAtual.email !== 'madebycotrim@gmail.com') {
            toast.error('Acesso negado.');
            navegar('/painel');
        }
    }, [usuarioAtual, navegar]);

    useEffect(() => {
        carregarLojas();
    }, []);

    useEffect(() => {
        if (lojaSelecionada) {
            carregarDadosLoja(lojaSelecionada);
        } else {
            definirDados([]);
        }
    }, [lojaSelecionada]);

    const carregarLojas = async () => {
        try {
            const db = await bancoLocal.iniciarBanco();
            const nomesLojas = Array.from(db.objectStoreNames);
            definirLojas(nomesLojas);
            if (nomesLojas.length > 0 && !lojaSelecionada) {
                definirLojaSelecionada(nomesLojas[0]);
            }
        } catch (erro) {
            console.error('Erro ao carregar lojas:', erro);
            toast.error('Erro ao acessar banco de dados.');
        }
    };

    const carregarDadosLoja = async (nomeLoja) => {
        definirCarregando(true);
        try {
            const db = await bancoLocal.iniciarBanco();
            const registros = await db.getAll(nomeLoja);
            definirDados(registros);
        } catch (erro) {
            console.error(`Erro ao carregar dados da loja ${nomeLoja}:`, erro);
            toast.error(`Erro ao carregar ${nomeLoja}.`);
        } finally {
            definirCarregando(false);
        }
    };

    const limparLoja = async () => {
        if (!lojaSelecionada) return;
        if (!window.confirm(`Tem certeza que deseja limpar TODOS os dados de "${lojaSelecionada}"? Esta ação não pode ser desfeita.`)) return;

        try {
            const db = await bancoLocal.iniciarBanco();
            const tx = db.transaction(lojaSelecionada, 'readwrite');
            await tx.store.clear();
            await tx.done;
            toast.success(`Loja "${lojaSelecionada}" limpa com sucesso.`);
            carregarDadosLoja(lojaSelecionada);
        } catch (erro) {
            console.error('Erro ao limpar loja:', erro);
            toast.error('Erro ao limpar dados.');
        }
    };

    // Filtragem simples
    const dadosFiltrados = dados.filter(item => {
        if (!termoBusca) return true;
        const termo = termoBusca.toLowerCase();
        return Object.values(item).some(val =>
            String(val).toLowerCase().includes(termo)
        );
    });

    // Obter colunas dinamicamente
    const colunas = dados.length > 0 ? Object.keys(dados[0]) : [];

    return (
        <LayoutAdministrativo
            titulo="Banco de Dados Local"
            subtitulo="Visualização e gerenciamento do IndexedDB"
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">

                {/* Sidebar Lojas */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-black text-slate-700 flex items-center gap-2">
                            <Database size={18} className="text-indigo-600" />
                            Tabelas (Stores)
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {lojas.map(loja => (
                            <button
                                key={loja}
                                onClick={() => definirLojaSelecionada(loja)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${lojaSelecionada === loja
                                    ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Table size={16} className={lojaSelecionada === loja ? 'text-indigo-500' : 'text-slate-400'} />
                                {loja}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conteúdo Principal */}
                <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/30">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                {lojaSelecionada}
                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                                    {dados.length} registros
                                </span>
                            </h2>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative group flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar registros..."
                                    value={termoBusca}
                                    onChange={(e) => definirTermoBusca(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none w-full sm:w-64"
                                />
                            </div>

                            <button
                                onClick={() => carregarDadosLoja(lojaSelecionada)}
                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Atualizar"
                            >
                                <RefreshCw size={18} className={carregando ? 'animate-spin' : ''} />
                            </button>

                            <button
                                onClick={limparLoja}
                                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Esvaziar Tabela (Remover todos os registros)"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="px-4 py-2 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-700 flex items-center gap-2">
                            <AlertTriangle size={14} />
                            Zona de Perigo
                        </span>
                        <button
                            onClick={async () => {
                                if (window.confirm('ATENÇÃO: Isso apagará TODO o banco de dados local (todas as tabelas). Você perderá dados não sincronizados. Continuar?')) {
                                    try {
                                        const { deleteDB } = await import('idb');
                                        await deleteDB('SCAE_DB');
                                        toast.success('Banco de dados excluído.');
                                        window.location.reload();
                                    } catch (e) {
                                        console.error(e);
                                        toast.error('Erro ao excluir banco.');
                                    }
                                }
                            }}
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                        >
                            Excluir Banco de Dados Inteiro
                        </button>
                    </div>

                    {/* Tabela de Dados */}
                    <div className="flex-1 overflow-auto bg-slate-50/50 relative">
                        {carregando ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                                <div className="flex flex-col items-center gap-3">
                                    <RefreshCw className="animate-spin text-indigo-500" size={32} />
                                    <span className="text-sm font-bold text-slate-500">Carregando dados...</span>
                                </div>
                            </div>
                        ) : null}

                        {dadosFiltrados.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                {dados.length === 0 ? (
                                    <>
                                        <HardDrive size={48} className="mb-4 opacity-20" />
                                        <p className="font-medium">A tabela está vazia.</p>
                                    </>
                                ) : (
                                    <>
                                        <Search size={48} className="mb-4 opacity-20" />
                                        <p className="font-medium">Nenhum registro encontrado para a busca.</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-100 sticky top-0 z-10 font-bold text-slate-600 text-xs uppercase tracking-wider shadow-sm">
                                    <tr>
                                        {colunas.map(col => (
                                            <th key={col} className="px-4 py-3 border-b border-slate-200 whitespace-nowrap">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {dadosFiltrados.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-indigo-50/30 transition-colors bg-white">
                                            {colunas.map(col => (
                                                <td key={`${idx}-${col}`} className="px-4 py-2 border-r border-slate-100 last:border-0 text-sm text-slate-600 whitespace-nowrap max-w-xs truncate font-mono">
                                                    {typeof item[col] === 'object' ? JSON.stringify(item[col]) : String(item[col])}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Footer Status */}
                    <div className="bg-white border-t border-slate-200 py-2 px-4 text-xs font-mono text-slate-400 flex justify-between">
                        <span>IndexedDB: SCAE_DB</span>
                        <span>Total Carregado: {dadosFiltrados.length}</span>
                    </div>
                </div>
            </div>
        </LayoutAdministrativo>
    );
}
