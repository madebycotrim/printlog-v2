import { Save } from 'lucide-react';
import { usarDefinirCabecalho } from '@/compartilhado/contextos/ContextoCabecalho';

export function PaginaConfiguracoes() {
    usarDefinirCabecalho({
        titulo: 'Configurações',
        subtitulo: 'Gerencie sua conta e preferências',
        placeholderBusca: 'BUSCAR CONFIGURAÇÃO...',
        acao: {
            texto: 'Salvar',
            icone: Save,
            aoClicar: () => { }
        }
    });

    return (
        <div className="md:px-4 md:py-8 p-4 animate-in fade-in duration-500">
            {/* Página vazia aguardando implementação */}
        </div>
    );
}
