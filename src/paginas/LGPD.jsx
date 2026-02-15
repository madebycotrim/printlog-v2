import { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle, Users, Database, Clock, FileSpreadsheet, Eye, Download, Trash2 } from 'lucide-react';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import { useAutenticacao } from '../contexts/ContextoAutenticacao';
import { obterEstatisticasConsentimento, obterHistoricoConsentimentos } from '../servicos/consentimento';
import { obterEstatisticasRetencao } from '../servicos/retencao';
import { obterEstatisticasAnonimizacao, anonimizarDadosAluno, verificarElegiveisAnonimizacao } from '../servicos/anonimizacao';
import { bancoLocal } from '../servicos/bancoLocal';

export default function LGPD() {
    const { usuarioAtual } = useAutenticacao();
    const [carregando, definirCarregando] = useState(true);

    // Estatísticas
    const [statsConsentimento, definirStatsConsentimento] = useState(null);
    const [statsRetencao, definirStatsRetencao] = useState(null);
    const [statsAnonimizacao, definirStatsAnonimizacao] = useState(null);
    const [alunosElegiveis, definirAlunosElegiveis] = useState([]);

    const carregarEstatisticas = async () => {
        definirCarregando(true);
        try {
            const [consent, retencao, anonimizacao, elegiveis] = await Promise.all([
                obterEstatisticasConsentimento(),
                obterEstatisticasRetencao(),
                obterEstatisticasAnonimizacao(),
                verificarElegiveisAnonimizacao(365) // 1 ano de inatividade
            ]);

            definirStatsConsentimento(consent);
            definirStatsRetencao(retencao);
            definirStatsAnonimizacao(anonimizacao);
            definirAlunosElegiveis(elegiveis);
        } catch (erro) {
            console.error('Erro ao carregar estatísticas:', erro);
        } finally {
            definirCarregando(false);
        }
    };

    useEffect(() => {
        carregarEstatisticas();
    }, []);

    const CardEstatistica = ({ icone: Icone, titulo, valor, descricao, cor = 'indigo', badge = null }) => (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${cor}-50`}>
                    <Icone className={`text-${cor}-600`} size={24} />
                </div>
                {badge && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.classe}`}>
                        {badge.texto}
                    </span>
                )}
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">{titulo}</h3>
            <p className="text-3xl font-black text-slate-900 mb-2">{valor}</p>
            <p className="text-xs text-slate-500">{descricao}</p>
        </div>
    );

    return (
        <LayoutAdministrativo
            titulo="LGPD Compliance"
            subtitulo="Gestão de conformidade com a Lei Geral de Proteção de Dados"
        >
            {carregando ? (
                <div className="p-8 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Carregando dados de conformidade...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Header de Conformidade */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield size={32} />
                            <h2 className="text-2xl font-black">Painel de Conformidade LGPD</h2>
                        </div>
                        <p className="text-indigo-100 leading-relaxed max-w-2xl">
                            Sistema em conformidade com a Lei nº 13.709/2018.
                            Monitore consentimentos, políticas de retenção e processos de anonimização.
                        </p>
                    </div>

                    {/* Estatísticas de Consentimento */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <CheckCircle size={20} className="text-emerald-600" />
                            Gestão de Consentimentos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <CardEstatistica
                                icone={Users}
                                titulo="Taxa de Conformidade"
                                valor={`${statsConsentimento?.taxaConformidade || 0}%`}
                                descricao={`${statsConsentimento?.alunosComConsentimento || 0} de ${statsConsentimento?.totalAlunos || 0} alunos`}
                                cor="emerald"
                                badge={{
                                    texto: statsConsentimento?.taxaConformidade >= 90 ? 'ÓTIMO' : statsConsentimento?.taxaConformidade >= 70 ? 'BOM' : 'ATENÇÃO',
                                    classe: statsConsentimento?.taxaConformidade >= 90
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : statsConsentimento?.taxaConformidade >= 70
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-amber-100 text-amber-800'
                                }}
                            />
                            <CardEstatistica
                                icone={CheckCircle}
                                titulo="Consentimentos Válidos"
                                valor={statsConsentimento?.consentimentosValidos || 0}
                                descricao="Consentimentos ativos e dentro da validade"
                                cor="indigo"
                            />
                            <CardEstatistica
                                icone={Clock}
                                titulo="Consentimentos Expirados"
                                valor={statsConsentimento?.consentimentosExpirados || 0}
                                descricao="Requerem renovação"
                                cor="amber"
                            />
                            <CardEstatistica
                                icone={AlertCircle}
                                titulo="Consentimentos Retirados"
                                valor={statsConsentimento?.consentimentosRetirados || 0}
                                descricao="Usuários que revogaram consentimento"
                                cor="red"
                            />
                        </div>
                    </div>

                    {/* Estatísticas de Retenção */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Database size={20} className="text-blue-600" />
                            Políticas de Retenção
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <CardEstatistica
                                icone={Users}
                                titulo="Alunos Expirados"
                                valor={statsRetencao?.alunosExpirados || 0}
                                descricao={`${statsRetencao?.percentualAlunosExpirados || 0}% do total`}
                                cor="purple"
                            />
                            <CardEstatistica
                                icone={Database}
                                titulo="Registros de Acesso Expirados"
                                valor={statsRetencao?.acessosExpirados || 0}
                                descricao={`${statsRetencao?.totalAcessos || 0} registros totais`}
                                cor="cyan"
                            />
                            <CardEstatistica
                                icone={Shield}
                                titulo="Políticas Ativas"
                                valor={statsRetencao?.politicasAtivas || 0}
                                descricao="Políticas de retenção configuradas"
                                cor="slate"
                            />
                        </div>
                    </div>

                    {/* Estatísticas de Anonimização */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Eye size={20} className="text-violet-600" />
                            Anonimização de Dados
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <CardEstatistica
                                icone={Users}
                                titulo="Alunos Anonimizados"
                                valor={statsAnonimizacao?.alunosAnonimizados || 0}
                                descricao={`${statsAnonimizacao?.percentualAnonimizado || 0}% do total`}
                                cor="violet"
                            />
                            <CardEstatistica
                                icone={Clock}
                                titulo="Últimos 30 Dias"
                                valor={statsAnonimizacao?.anonimizacoesUltimos30Dias || 0}
                                descricao="Anonimizações recentes"
                                cor="indigo"
                            />
                            <CardEstatistica
                                icone={AlertCircle}
                                titulo="Elegíveis para Anonimização"
                                valor={alunosElegiveis.length}
                                descricao="Alunos inativos há mais de 1 ano"
                                cor="amber"
                            />
                        </div>
                    </div>

                    {/* Alunos Elegíveis para Anonimização */}
                    {alunosElegiveis.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="text-amber-600" size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 mb-1">
                                        Ação Requerida: {alunosElegiveis.length} Aluno{alunosElegiveis.length > 1 ? 's' : ''} Elegível{alunosElegiveis.length > 1 ? 'is' : ''} para Anonimização
                                    </h4>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Os seguintes alunos estão inativos há mais de 1 ano e podem ser anonimizados conforme política de retenção.
                                    </p>
                                    <div className="max-h-64 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-amber-100 sticky top-0">
                                                <tr>
                                                    <th className="p-2 text-left font-bold text-amber-900">Matrícula</th>
                                                    <th className="p-2 text-left font-bold text-amber-900">Nome</th>
                                                    <th className="p-2 text-left font-bold text-amber-900">Status</th>
                                                    <th className="p-2 text-left font-bold text-amber-900">Inativado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {alunosElegiveis.slice(0, 10).map((aluno) => (
                                                    <tr key={aluno.matricula} className="border-b border-amber-200 last:border-0">
                                                        <td className="p-2 font-mono text-xs">{aluno.matricula}</td>
                                                        <td className="p-2 font-medium">{aluno.nome_completo}</td>
                                                        <td className="p-2">
                                                            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-bold">
                                                                {aluno.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-2 text-slate-600">
                                                            {aluno.data_inativacao
                                                                ? new Date(aluno.data_inativacao).toLocaleDateString('pt-BR')
                                                                : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Links Rápidos */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                        <h4 className="font-bold text-slate-800 mb-4">Ações Rápidas</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
                                <FileSpreadsheet size={20} className="text-slate-400 group-hover:text-indigo-600" />
                                <div className="text-left">
                                    <p className="font-bold text-sm text-slate-700 group-hover:text-indigo-600">Exportar Relatório</p>
                                    <p className="text-xs text-slate-500">Compliance completo</p>
                                </div>
                            </button>
                            <button className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all group">
                                <Eye size={20} className="text-slate-400 group-hover:text-emerald-600" />
                                <div className="text-left">
                                    <p className="font-bold text-sm text-slate-700 group-hover:text-emerald-600">Ver Logs de Auditoria</p>
                                    <p className="text-xs text-slate-500">Histórico completo</p>
                                </div>
                            </button>
                            <button className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all group">
                                <Shield size={20} className="text-slate-400 group-hover:text-purple-600" />
                                <div className="text-left">
                                    <p className="font-bold text-sm text-slate-700 group-hover:text-purple-600">Configurar Políticas</p>
                                    <p className="text-xs text-slate-500">Retenção e privacidade</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </LayoutAdministrativo>
    );
}
