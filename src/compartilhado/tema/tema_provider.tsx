import { createContext, useContext, ReactNode } from "react";
import { usar_tema } from "./logica/usar_tema";
import type { ModoTema } from "@/compartilhado/tipos_globais/modelos";

type TemaContexto = {
    modo_tema: ModoTema;
    alternar_tema: () => void;
};

const ContextoTema = createContext<TemaContexto | null>(null);

export function ProvedorTema({ children }: { children: ReactNode }) {
    const tema = usar_tema();

    return (
        <ContextoTema.Provider value={tema}>
            {children}
        </ContextoTema.Provider>
    );
}

export function usarContextoTema() {
    const contexto = useContext(ContextoTema);

    if (!contexto) {
        throw new Error("usarContextoTema deve estar dentro do ProvedorTema");
    }

    return contexto;
}
