import type { Filamento } from '@/compartilhado/tipos_globais/modelos';
import { ItemFilamento } from './ItemFilamento';
import { PackageOpen } from 'lucide-react';

type PropriedadesLista = {
    filamentos: Filamento[];
    aoEditar?: (id: string) => void;
    aoExcluir?: (id: string) => void;
};

export function ListaFilamentos({ filamentos, aoEditar, aoExcluir }: PropriedadesLista) {
    if (filamentos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 border-dashed">
                <div className="h-16 w-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <PackageOpen size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Nenhum filamento encontrado</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-sm text-center">
                    Comece adicionando os materiais que você utiliza em suas impressões.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filamentos.map((filamento) => (
                <ItemFilamento
                    key={filamento.id}
                    filamento={filamento}
                    aoEditar={aoEditar}
                    aoExcluir={aoExcluir}
                />
            ))}
        </div>
    );
}
