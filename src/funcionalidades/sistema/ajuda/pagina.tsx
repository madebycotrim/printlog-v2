import { HelpCircle } from 'lucide-react';
import { usarDefinirCabecalho } from '@/compartilhado/contextos/ContextoCabecalho';

export function PaginaAjuda() {
    usarDefinirCabecalho({
        titulo: 'Central de Ajuda',
        subtitulo: 'Suporte e documentação do sistema',
        placeholderBusca: 'BUSCAR TÓPICO...',
        acao: {
            texto: 'Falar com Suporte',
            icone: HelpCircle,
            aoClicar: () => { }
        }
    });

    return (
        <div className="md:px-4 md:py-8 p-4 animate-in fade-in duration-500">
            {/* Página vazia aguardando implementação */}
        </div>
    );
}
