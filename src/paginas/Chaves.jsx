import { useState, useEffect } from 'react';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import ModalUniversal from '../componentes/ModalUniversal';
import { usePermissoes } from '../contexts/ContextoPermissoes';
import { useAutenticacao } from '../contexts/ContextoAutenticacao';
import {
    gerarNovaChave,
    salvarChave,
    listarTodasChaves,
    obterChaveAtiva,
    rotacionarChave,
    desativarChave
} from '../servicos/gerenciadorChaves';
import { Key, Plus, Shield, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Chaves() {
    const { podeAcessar } = usePermissoes();
    const { usuarioAtual } = useAutenticacao();
    const [chaves, setChaves] = useState([]);
    const [chaveAtiva, setChaveAtiva] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [modalRotacao, setModalRotacao] = useState(false);
    const [processando, setProcessando] = useState(false);

    const carregarChaves = async () => {
        try {
            setCarregando(true);
            const todasChaves = await listarTodasChaves();
            const ativa = await obterChaveAtiva();

            setChaves(todasChaves);
            setChaveAtiva(ativa);
        } catch (erro) {
            console.error('Erro ao carregar chaves:', erro);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarChaves();
    }, []);

    const executarRotacao = async () => {
        if (!usuarioAtual?.email) {
            alert('Usuário não autenticado');
            return;
        }

        try {
            setProcessando(true);
            await rotacionarChave(usuarioAtual.email);
            await carregarChaves();
            setModalRotacao(false);
            alert('Rotação de chave concluída com sucesso!');
        } catch (erro) {
            console.error('Erro ao rotacionar chave:', erro);
            alert('Erro ao rotacionar chave. Verifique o console.');
        } finally {
            setProcessando(false);
        }
    };

    const desativarChaveManual = async (versao) => {
        if (!window.confirm(`Tem certeza que deseja desativar a chave v${versao}?`)) {
            return;
        }

        try {
            await desativarChave(versao);
            await carregarChaves();
            alert(`Chave v${versao} desativada com sucesso!`);
        } catch (erro) {
            console.error('Erro ao desativar chave:', erro);
            alert('Erro ao desativar chave.');
        }
    };

    // Verificar permissão
    if (!podeAcessar('chaves', 'gerenciar')) {
        return (
            <LayoutAdministrativo titulo="Gerenciamento de Chaves" subtitulo="Rotação e segurança de assinaturas">
                <div className="flex flex-col items-center justify-center p-16 text-center">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} className="text-rose-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Acesso Negado</h3>
                    <p className="text-sm text-slate-500 max-w-md">
                        Apenas administradores podem gerenciar chaves de assinatura.
                    </p>
                </div>
            </LayoutAdministrativo>
        );
    }

    const AcoesHeader = (
        <button
            onClick={() => setModalRotacao(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 border border-white/10"
        >
            <RefreshCw size={20} />
            <span className="tracking-wide">Rotacionar Chave</span>
        </button>
    );

    return (
        <LayoutAdministrativo titulo="Gerenciamento de Chaves" subtitulo="Rotação e segurança de assinaturas" acoes={AcoesHeader}>
            {carregando ? (
                <div className="p-8 text-center text-slate-500 animate-pulse text-sm">Carregando chaves...</div>
            ) : (
                <div className="space-y-6">
                    {/* Chave Ativa */}
                    {chaveAtiva ? (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <Shield size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-black text-emerald-700">Chave Ativa</h3>
                                            <span className="px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 rounded-lg text-[10px] font-black uppercase tracking-wide text-emerald-700">
                                                v{chaveAtiva.versao}
                                            </span>
                                        </div>
                                        <p className="text-xs text-emerald-600">
                                            Criada em {format(new Date(chaveAtiva.criada_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                        </p>
                                        {chaveAtiva.expira_em && (
                                            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                                                <Clock size={12} />
                                                Expira em {format(new Date(chaveAtiva.expira_em), 'dd/MM/yyyy', { locale: ptBR })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={24} className="text-emerald-500" />
                                </div>
                            </div>

                            {/* Chave Pública (truncada) */}
                            <div className="mt-4 pt-4 border-t border-emerald-200/60">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-2">Chave Pública</p>
                                <code className="text-xs text-emerald-700 bg-white/50 p-2 rounded-lg block overflow-x-auto font-mono">
                                    {chaveAtiva.chave_publica.substring(0, 100)}...
                                </code>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                            <AlertTriangle size={32} className="text-amber-500 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-amber-700 mb-1">Nenhuma chave ativa</h3>
                            <p className="text-xs text-amber-600">
                                Clique em "Rotacionar Chave" para gerar a primeira chave do sistema.
                            </p>
                        </div>
                    )}

                    {/* Histórico de Chaves */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60">
                        <div className="p-5 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Key size={18} className="text-slate-500" />
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Histórico de Chaves</h3>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {chaves.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 mx-auto">
                                        <Key size={24} className="text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500">Nenhuma chave registrada</p>
                                </div>
                            ) : (
                                chaves.map((chave) => {
                                    const ativa = chave.ativa && (!chave.expira_em || new Date(chave.expira_em) > new Date());
                                    const expirada = chave.expira_em && new Date(chave.expira_em) < new Date();

                                    return (
                                        <div key={chave.versao} className="p-5 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ativa ? 'bg-emerald-100' : 'bg-slate-100'
                                                        }`}>
                                                        <Key size={20} className={ativa ? 'text-emerald-600' : 'text-slate-400'} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="text-sm font-bold text-slate-700">Versão {chave.versao}</h4>
                                                            {ativa && (
                                                                <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 rounded-md text-[10px] font-black uppercase text-emerald-700">
                                                                    Ativa
                                                                </span>
                                                            )}
                                                            {expirada && (
                                                                <span className="px-2 py-0.5 bg-rose-100 border border-rose-300 rounded-md text-[10px] font-black uppercase text-rose-700">
                                                                    Expirada
                                                                </span>
                                                            )}
                                                            {!chave.ativa && !expirada && (
                                                                <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded-md text-[10px] font-black uppercase text-slate-700">
                                                                    Inativa
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500">
                                                            Criada em {format(new Date(chave.criada_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                                            {chave.criada_por && ` por ${chave.criada_por}`}
                                                        </p>
                                                        {chave.expira_em && (
                                                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                                <Clock size={11} />
                                                                {expirada ? 'Expirou' : 'Expira'} em {format(new Date(chave.expira_em), 'dd/MM/yyyy', { locale: ptBR })}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {ativa && chave.versao !== chaveAtiva?.versao && (
                                                    <button
                                                        onClick={() => desativarChaveManual(chave.versao)}
                                                        className="text-xs font-bold text-rose-600 hover:text-rose-700 transition px-3 py-1.5 rounded-lg hover:bg-rose-50"
                                                    >
                                                        Desativar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Rotação */}
            {modalRotacao && (
                <ModalUniversal
                    titulo="Rotacionar Chave de Assinatura"
                    fechavel={!processando}
                    aoFechar={() => setModalRotacao(false)}
                >
                    <div className="space-y-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-800 mb-1">Atenção</h4>
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        Uma nova chave de assinatura será gerada. A chave anterior permanecerá ativa por 7 dias para permitir período de transição.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-slate-600 space-y-2">
                            <p><strong className="text-slate-700">O que acontecerá:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                                <li>Nova chave ECDSA P-256 será gerada</li>
                                <li>Nova versão será incrementada automaticamente</li>
                                <li>Chave anterior continuará válida por 7 dias</li>
                                <li>QR Codes antigos continuarão funcionando</li>
                            </ul>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                            <button
                                onClick={() => setModalRotacao(false)}
                                disabled={processando}
                                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={executarRotacao}
                                disabled={processando}
                                className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-bold disabled:opacity-50 flex items-center gap-2"
                            >
                                {processando ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin" />
                                        Gerando...
                                    </>
                                ) : (
                                    <>
                                        <Shield size={16} />
                                        Confirmar Rotação
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </ModalUniversal>
            )}
        </LayoutAdministrativo>
    );
}
