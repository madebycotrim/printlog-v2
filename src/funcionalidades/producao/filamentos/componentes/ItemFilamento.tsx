import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import type { Filamento } from '@/compartilhado/tipos_globais/modelos';

type PropriedadesItem = {
    filamento: Filamento;
    aoEditar?: (id: string) => void;
    aoExcluir?: (id: string) => void;
};

export function ItemFilamento({ filamento, aoEditar, aoExcluir }: PropriedadesItem) {
    // Cálculo de porcentagem de uso
    const porcentagem = Math.round((filamento.peso_restante_g / filamento.peso_total_g) * 100);

    // Definição de cores baseada no nível do estoque
    let corBarra = 'bg-green-500';
    let corTexto = 'text-green-700';
    let corFundo = 'bg-green-50';

    if (porcentagem < 20) {
        corBarra = 'bg-red-500';
        corTexto = 'text-red-700';
        corFundo = 'bg-red-50';
    } else if (porcentagem < 50) {
        corBarra = 'bg-yellow-500';
        corTexto = 'text-yellow-700';
        corFundo = 'bg-yellow-50';
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm ring-1 ring-gray-100 dark:ring-slate-700"
                        style={{ backgroundColor: filamento.cor_hex }}
                        title={filamento.cor}
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{filamento.material} - {filamento.marca}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{filamento.cor}</p>
                    </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => aoEditar && aoEditar(filamento.id)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => aoExcluir && aoExcluir(filamento.id)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Excluir"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Estoque</span>
                    <span className={`font-medium ${corTexto}`}>{filamento.peso_restante_g}g ({porcentagem}%)</span>
                </div>

                <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${corBarra} transition-all duration-500`}
                        style={{ width: `${porcentagem}%` }}
                    />
                </div>

                {porcentagem < 20 && (
                    <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${corFundo} ${corTexto}`}>
                        <AlertCircle size={14} />
                        Estoque Crítico! Reposição necessária.
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Preço/Kg</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(filamento.preco_kg)}
                </span>
            </div>
        </div>
    );
}
