import { createContext, useContext, ReactNode } from "react";
import { usar_tema } from "./logica/usar_tema";
import type { CorPrimaria, ModoTema } from "@/compartilhado/tipos_globais/modelos";

type TemaContexto = {
  modo_tema: ModoTema;
  alternar_tema: () => void;
  cor_primaria: CorPrimaria;
  definir_cor_primaria: (cor: CorPrimaria) => void;
  paleta_primaria: Record<CorPrimaria, { hex: string; rgb: string }>;
};

const ContextoTema = createContext<TemaContexto | null>(null);

export function ProvedorTema({ children }: { children: ReactNode }) {
  const tema = usar_tema();

  return <ContextoTema.Provider value={tema}>{children}</ContextoTema.Provider>;
}

export function usarContextoTema() {
  const contexto = useContext(ContextoTema);

  if (!contexto) {
    throw new Error("usarContextoTema deve estar dentro do ProvedorTema");
  }

  return contexto;
}
