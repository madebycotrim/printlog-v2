import { Calculator } from 'lucide-react';
import { usarDefinirCabecalho } from '@/compartilhado/contextos/ContextoCabecalho';

export function PaginaCalculadora() {
    usarDefinirCabecalho({
        titulo: 'Calculadora de Custos',
        subtitulo: 'Estime o custo das suas impressões',
        placeholderBusca: 'BUSCAR CÁLCULO...',
        acao: {
            texto: 'Novo Cálculo',
            icone: Calculator,
            aoClicar: () => { }
        }
    });

    return (
        <div className="md:px-4 md:py-8 p-4 animate-in fade-in duration-500">
            {/* Página vazia aguardando implementação */}
        </div>
    );
}
