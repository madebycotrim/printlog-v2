import { Plus } from 'lucide-react';
import { usarDefinirCabecalho } from '@/compartilhado/contextos/ContextoCabecalho';

export function PaginaFinanceiro() {
    usarDefinirCabecalho({
        titulo: 'Financeiro',
        subtitulo: 'Acompanhe seus rendimentos e despesas',
        placeholderBusca: 'BUSCAR TRANSAÇÃO...',
        acao: {
            texto: 'Nova Transação',
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
