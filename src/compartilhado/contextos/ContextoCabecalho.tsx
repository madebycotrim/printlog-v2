import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

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
  titulo: "PrintLog V2",
  subtitulo: "Gestão de Impressão 3D",
};

const ContextoCabecalho = createContext<ContextoCabecalhoTipo | undefined>(
  undefined,
);

export function ProvedorCabecalho({ children }: { children: ReactNode }) {
  const [dados, setDados] = useState<DadosCabecalho>(DADOS_PADRAO);

  const definirDados = (novosDados: DadosCabecalho) => {
    // Pequena otimização para evitar updates desnecessários se for estritamente igual
    setDados((prev) => {
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
    throw new Error(
      "usarCabecalho deve ser usado dentro de um ProvedorCabecalho",
    );
  }
  return contexto;
}

// Hook para ser usado nas páginas
export function usarDefinirCabecalho(dadosInput: DadosCabecalho) {
  const { definirDados } = usarCabecalho();

  // 1. Manter as funções instáveis em refs para não trigar useEffect
  const acaoCallbackRef = useRef(dadosInput.acao?.aoClicar);
  const aoBuscarCallbackRef = useRef(dadosInput.aoBuscar);

  useEffect(() => {
    acaoCallbackRef.current = dadosInput.acao?.aoClicar;
    aoBuscarCallbackRef.current = dadosInput.aoBuscar;
  });

  // 2. Criar funções estáveis
  const aoClicarEstavel = useCallback(() => {
    if (acaoCallbackRef.current) {
      acaoCallbackRef.current();
    }
  }, []);

  const aoBuscarEstavel = useCallback((termo: string) => {
    if (aoBuscarCallbackRef.current) {
      aoBuscarCallbackRef.current(termo);
    }
  }, []);

  useEffect(() => {
    // Construímos o objeto de dados usando as funções estáveis
    const dadosParaEnviar: DadosCabecalho = {
      ...dadosInput,
      acao: dadosInput.acao
        ? {
            ...dadosInput.acao,
            aoClicar: aoClicarEstavel,
          }
        : undefined,
      aoBuscar: dadosInput.aoBuscar ? aoBuscarEstavel : undefined,
    };

    definirDados(dadosParaEnviar);

    // Cleanup opcional
    return () => {
      // limparDados(); // Não limpamos para evitar blink
    };
  }, [
    dadosInput.titulo,
    dadosInput.subtitulo,
    dadosInput.placeholderBusca,
    // Propriedades específicas da ação para disparar atualização visual
    dadosInput.acao?.texto,
    dadosInput.acao?.icone,
    !!dadosInput.acao,
    !!dadosInput.aoBuscar,
  ]);
}
