import { createContext, ReactNode, useContext, useEffect, useState, useRef, useCallback } from 'react';

type AcaoCabecalho = {
    texto: string;
    aoClicar: () => void;
    icone?: React.ElementType;
};

type DadosCabecalho = {
    titulo: string;
    subtitulo: string;
    placeholderBusca?: string;
    acao?: AcaoCabecalho;
    elementoAcao?: ReactNode; // Mantido para compatibilidade ou casos customizados
    aoBuscar?: (termo: string) => void;
};

type ContextoCabecalhoTipo = {
    dados: DadosCabecalho;
    definirDados: (dados: DadosCabecalho) => void;
    limparDados: () => void;
};

const DADOS_PADRAO: DadosCabecalho = {
    titulo: 'PrintLog V2',
    subtitulo: 'Gestão de Impressão 3D',
};

const ContextoCabecalho = createContext<ContextoCabecalhoTipo | undefined>(undefined);

export function ProvedorCabecalho({ children }: { children: ReactNode }) {
    const [dados, setDados] = useState<DadosCabecalho>(DADOS_PADRAO);

    const definirDados = (novosDados: DadosCabecalho) => {
        // Pequena otimização para evitar updates desnecessários se for estritamente igual
        setDados(prev => {
            if (prev === novosDados) return prev;
            // Poderíamos fazer deep equal aqui, mas a correção principal está no hook
            return novosDados;
        });
    };

    const limparDados = () => {
        setDados(DADOS_PADRAO);
    };

    return (
        <ContextoCabecalho.Provider value={{ dados, definirDados, limparDados }}>
            {children}
        </ContextoCabecalho.Provider>
    );
}

export function usarCabecalho() {
    const contexto = useContext(ContextoCabecalho);
    if (!contexto) {
        throw new Error('usarCabecalho deve ser usado dentro de um ProvedorCabecalho');
    }
    return contexto;
}

// Hook para ser usado nas páginas
export function usarDefinirCabecalho(dadosInput: DadosCabecalho) {
    const { definirDados } = usarCabecalho();

    // 1. Manter a função 'aoClicar' (que é instável) em uma ref
    // Assim podemos chamá-la sem precisar que ela seja uma dependência do useEffect
    const acaoCallbackRef = useRef(dadosInput.acao?.aoClicar);

    useEffect(() => {
        acaoCallbackRef.current = dadosInput.acao?.aoClicar;
    });

    // 2. Criar uma função estável que delega para a ref
    const aoClicarEstavel = useCallback(() => {
        if (acaoCallbackRef.current) {
            acaoCallbackRef.current();
        }
    }, []);

    useEffect(() => {
        // Construímos o objeto de dados usando a função estável
        // Se 'dadosInput.acao' não existir, passamos undefined
        const dadosParaEnviar: DadosCabecalho = {
            ...dadosInput,
            acao: dadosInput.acao ? {
                ...dadosInput.acao,
                aoClicar: aoClicarEstavel
            } : undefined
        };

        definirDados(dadosParaEnviar);

        // Cleanup opcional
        return () => {
            // limparDados(); // Não limpamos para evitar blink
        };
        // LISTA DE DEPENDÊNCIAS CRÍTICA:
        // Não incluímos 'dadosInput' nem 'dadosInput.acao' inteiros.
        // Incluímos apenas os valores primitivos que alteram o visual.
        // O 'aoClicar' é ignorado aqui, pois usamos a versão estável.
    }, [
        dadosInput.titulo,
        dadosInput.subtitulo,
        dadosInput.placeholderBusca,
        // Verificamos propriedades específicas da ação para disparar atualização visual
        dadosInput.acao?.texto,
        dadosInput.acao?.icone,
        // Se a "existência" da ação mudar, também atualizamos
        !!dadosInput.acao
    ]);
}

