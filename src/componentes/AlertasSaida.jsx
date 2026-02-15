import { useState, useEffect } from 'react';
import { listarPendentes, autorizarSaida } from '../utilitarios/detectarSaidaAntecipada';
import { useAutenticacao } from '../contexts/ContextoAutenticacao';
import { AlertTriangle, Check, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

export default function AlertasSaida() {
    const { usuarioAtual } = useAutenticacao();
    const [alertas, setAlertas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [alertaSelecionado, setAlertaSelecionado] = useState(null);
    const [dadosAutorizacao, setDadosAutorizacao] = useState({
        motivo: '',
        responsavel_retirada: '',
        contato_responsavel: '',
        observacoes: ''
    });

    useEffect(() => {
        carregarAlertas();
        // Recarregar a cada 2 minutos
        const interval = setInterval(carregarAlertas, 120000);
        return () => clearInterval(interval);
    }, []);

    const carregarAlertas = async () => {
        try {
            const dados = await listarPendentes();
            setAlertas(dados);
        } catch (erro) {
            console.error('Erro ao carregar alertas:', erro);
        } finally {
            setCarregando(false);
        }
    };

    const handleAutorizar = async () => {
        if (!alertaSelecionado) return;

        try {
            await autorizarSaida(
                alertaSelecionado.id,
                dadosAutorizacao,
                usuarioAtual?.email
            );

            // Reset
            setMostrarModal(false);
            setAlertaSelecionado(null);
            setDadosAutorizacao({
                motivo: '',
                responsavel_retirada: '',
                contato_responsavel: '',
                observacoes: ''
            });

            // Recarregar
            carregarAlertas();
        } catch (erro) {
            console.error('Erro ao autorizar:', erro);
            alert('Erro ao autorizar saída. Tente novamente.');
        }
    };

    if (carregando) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="animate-pulse">Carregando alertas...</div>
            </div>
        );
    }

    if (alertas.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-600 font-semibold">Nenhuma saída antecipada pendente</p>
                <p className="text-slate-500 text-sm mt-1">Todas as saídas estão dentro do horário normal</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-100 p-3 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Saídas Antecipadas</h3>
                    <p className="text-sm text-slate-500">{alertas.length} aguardando autorização</p>
                </div>
            </div>

            <div className="space-y-3">
                {alertas.map(alerta => (
                    <div
                        key={alerta.id}
                        className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 hover:bg-amber-100 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <User className="w-5 h-5 text-amber-600" />
                                    <h4 className="font-bold text-slate-800">
                                        {alerta.aluno?.nome_completo || 'Aluno desconhecido'}
                                    </h4>
                                    <span className="text-xs bg-white px-2 py-1 rounded font-mono text-slate-600">
                                        {alerta.aluno?.turma_id}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm text-slate-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-600" />
                                        <span>
                                            Saída: <strong>{alerta.hora_saida}</strong> (esperado: {alerta.hora_esperada})
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-amber-700 font-bold">
                                            {Math.floor(alerta.minutos_antecipacao / 60)}h {alerta.minutos_antecipacao % 60}min adiantado
                                        </span>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-500">
                                    {format(new Date(alerta.data_saida + ' ' + alerta.hora_saida), "dd/MM/yyyy 'às' HH:mm")}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setAlertaSelecionado(alerta);
                                    setMostrarModal(true);
                                }}
                                className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
                            >
                                Autorizar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Autorização */}
            {mostrarModal && alertaSelecionado && (
                <>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setMostrarModal(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
                            <h2 className="text-2xl font-black text-slate-800 mb-6">Autorizar Saída Antecipada</h2>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <div className="font-bold text-slate-800 mb-2">{alertaSelecionado.aluno?.nome_completo}</div>
                                <div className="text-sm text-slate-600">
                                    Saída às {alertaSelecionado.hora_saida} • {alertaSelecionado.minutos_antecipacao} min adiantado
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Motivo da Saída Antecipada *
                                    </label>
                                    <input
                                        type="text"
                                        value={dadosAutorizacao.motivo}
                                        onChange={(e) => setDadosAutorizacao({ ...dadosAutorizacao, motivo: e.target.value })}
                                        placeholder="Ex: Consulta médica, emergência familiar..."
                                        className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Responsável pela Retirada
                                    </label>
                                    <input
                                        type="text"
                                        value={dadosAutorizacao.responsavel_retirada}
                                        onChange={(e) => setDadosAutorizacao({ ...dadosAutorizacao, responsavel_retirada: e.target.value })}
                                        placeholder="Nome do responsável"
                                        className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Contato do Responsável
                                    </label>
                                    <input
                                        type="tel"
                                        value={dadosAutorizacao.contato_responsavel}
                                        onChange={(e) => setDadosAutorizacao({ ...dadosAutorizacao, contato_responsavel: e.target.value })}
                                        placeholder="Telefone"
                                        className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Observações
                                    </label>
                                    <textarea
                                        value={dadosAutorizacao.observacoes}
                                        onChange={(e) => setDadosAutorizacao({ ...dadosAutorizacao, observacoes: e.target.value })}
                                        rows={3}
                                        placeholder="Informações adicionais..."
                                        className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                                <button
                                    onClick={handleAutorizar}
                                    disabled={!dadosAutorizacao.motivo}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Check size={20} />
                                    Autorizar Saída
                                </button>
                                <button
                                    onClick={() => setMostrarModal(false)}
                                    className="px-6 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
