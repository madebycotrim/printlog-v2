import { Plus } from 'lucide-react';
import { usarDefinirCabecalho } from '@/compartilhado/contextos/ContextoCabecalho';

export function PaginaClientes() {
    usarDefinirCabecalho({
        titulo: 'Meus Clientes',
        subtitulo: 'Gerencie sua base de clientes',
        placeholderBusca: 'BUSCAR CLIENTE...',
        acao: {
            texto: 'Novo Cliente',
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
