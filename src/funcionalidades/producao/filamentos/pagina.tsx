import { Plus } from 'lucide-react';
import { usarDefinirCabecalho } from '@/compartilhado/contextos/ContextoCabecalho';

export function PaginaFilamentos() {
    usarDefinirCabecalho({
        titulo: 'Meus Filamentos',
        subtitulo: 'Gerencie seu estoque de materiais',
        placeholderBusca: 'BUSCAR MATERIAL...',
        acao: {
            texto: 'Novo Material',
            icone: Plus,
            aoClicar: () => { }
        }
    });

    return (
        <div className="md:px-4 md:py-8 p-4 animate-in fade-in duration-500">
            {/* Página vazia aguardando implementação */}
        </div>
    );
}
