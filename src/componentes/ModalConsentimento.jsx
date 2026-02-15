import { Shield, FileText, Check, AlertCircle } from 'lucide-react';
import ModalUniversal from './ModalUniversal';
import { obterTermoAtual } from '../utilitarios/termoConsentimento';
import { useState } from 'react';

/**
 * Modal de Consentimento LGPD
 * Exibe termo completo e requer aceitação explícita
 */
export default function ModalConsentimento({ aberto, aoFechar, aoAceitar, alunoNome }) {
    const [aceitou, definirAceitou] = useState(false);
    const [processando, definirProcessando] = useState(false);

    const termo = obterTermoAtual();

    const handleAceitar = async () => {
        if (!aceitou) {
            alert('Você precisa marcar a caixa de confirmação para prosseguir.');
            return;
        }

        definirProcessando(true);
        try {
            await aoAceitar();
            definirAceitou(false); // Reset para próxima vez
        } catch (erro) {
            console.error('Erro ao processar consentimento:', erro);
            alert('Erro ao registrar consentimento. Tente novamente.');
        } finally {
            definirProcessando(false);
        }
    };

    const handleFechar = () => {
        definirAceitou(false);
        aoFechar();
    };

    return (
        <ModalUniversal
            aberto={aberto}
            aoFechar={handleFechar}
            titulo="Termo de Consentimento LGPD"
            subtitulo={`Leia atentamente o termo antes de cadastrar ${alunoNome || 'o aluno'}`}
            icone={Shield}
            tamanho="xl"
            cor="indigo"
        >
            <div className="flex flex-col h-full overflow-hidden">
                {/* Aviso Importante */}
                <div className="p-6 pb-4">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3">
                        <AlertCircle className="text-indigo-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="text-sm text-indigo-900">
                            <p className="font-bold mb-1">Consentimento Obrigatório (LGPD)</p>
                            <p className="text-indigo-700">
                                De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018),
                                é necessário seu consentimento livre e informado para o tratamento dos dados pessoais.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Versão do Termo */}
                <div className="px-6 pb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FileText size={14} />
                        <span className="font-medium">
                            Versão {termo.versao} | Vigência: {new Date(termo.dataPublicacao).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                </div>

                {/* Conteúdo do Termo (Scrollable) */}
                <div className="flex-1 overflow-y-auto px-6 pb-4">
                    <div className="prose prose-sm max-w-none">
                        <div
                            className="text-slate-700 leading-relaxed whitespace-pre-wrap"
                            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                        >
                            {termo.conteudo.split('\n').map((linha, index) => {
                                // Títulos principais (começam com #)
                                if (linha.startsWith('# ')) {
                                    return (
                                        <h1 key={index} className="text-lg font-black text-slate-900 mt-6 mb-3 uppercase tracking-tight">
                                            {linha.replace('# ', '')}
                                        </h1>
                                    );
                                }
                                // Subtítulos (começam com ##)
                                if (linha.startsWith('## ')) {
                                    return (
                                        <h2 key={index} className="text-base font-bold text-indigo-900 mt-5 mb-2">
                                            {linha.replace('## ', '')}
                                        </h2>
                                    );
                                }
                                // Negrito
                                if (linha.startsWith('**')) {
                                    const texto = linha.replace(/\*\*/g, '');
                                    return (
                                        <p key={index} className="font-bold text-slate-800 mt-3 mb-1">
                                            {texto}
                                        </p>
                                    );
                                }
                                // Itens de lista
                                if (linha.startsWith('- **')) {
                                    const match = linha.match(/- \*\*(.*?)\*\*:(.*)/);
                                    if (match) {
                                        return (
                                            <div key={index} className="flex gap-2 mt-2">
                                                <span className="text-indigo-600 font-bold">•</span>
                                                <p className="text-sm">
                                                    <span className="font-bold text-slate-800">{match[1]}:</span>
                                                    <span className="text-slate-700">{match[2]}</span>
                                                </p>
                                            </div>
                                        );
                                    }
                                }
                                if (linha.startsWith('- ')) {
                                    return (
                                        <div key={index} className="flex gap-2 mt-2">
                                            <span className="text-indigo-600">•</span>
                                            <p className="text-sm text-slate-700">{linha.replace('- ', '')}</p>
                                        </div>
                                    );
                                }
                                // Linhas vazias
                                if (linha.trim() === '') {
                                    return <div key={index} className="h-2"></div>;
                                }
                                // Separador
                                if (linha.startsWith('---')) {
                                    return <hr key={index} className="my-6 border-slate-200" />;
                                }
                                // Itálico (disclaimers)
                                if (linha.startsWith('*') && !linha.startsWith('**')) {
                                    return (
                                        <p key={index} className="text-xs italic text-slate-500 mt-3">
                                            {linha.replace(/\*/g, '')}
                                        </p>
                                    );
                                }
                                // Texto normal
                                return (
                                    <p key={index} className="text-sm text-slate-700 mt-2">
                                        {linha}
                                    </p>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Checkbox de Aceitação */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={aceitou}
                                onChange={(e) => definirAceitou(e.target.checked)}
                                className="w-5 h-5 rounded border-2 border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-200 cursor-pointer transition-all"
                            />
                        </div>
                        <div className="flex-1 text-sm">
                            <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                Eu li e aceito os termos acima
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Declaro que compreendi todas as informações sobre o tratamento dos meus dados pessoais
                                e consinto livre e inequivocamente com as práticas descritas.
                            </p>
                        </div>
                    </label>
                </div>

                {/* Footer Ações */}
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                        <p className="flex items-center gap-1">
                            <Shield size={12} />
                            <span>Protegido pela LGPD (Lei 13.709/2018)</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleFechar}
                            disabled={processando}
                            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Recusar
                        </button>
                        <button
                            type="button"
                            onClick={handleAceitar}
                            disabled={!aceitou || processando}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {processando ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Check size={18} />
                                    Aceitar e Continuar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </ModalUniversal>
    );
}
