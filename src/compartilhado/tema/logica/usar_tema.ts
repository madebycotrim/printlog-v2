import { useEffect, useState } from "react";
import type { ModoTema } from "@/compartilhado/tipos_globais/modelos";

export function usar_tema() {
  // Inicializa o estado lendo diretamente do localStorage ou preferência do sistema
  const [modo_tema, definir_modo_tema] = useState<ModoTema>(() => {
    if (typeof window !== "undefined") {
      const temaSalvo = localStorage.getItem("modo_tema");
      if (temaSalvo === "CLARO" || temaSalvo === "ESCURO") {
        return temaSalvo;
      }
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "ESCURO";
      }
    }
    return "CLARO";
  });

  useEffect(() => {
    // Persiste a escolha e aplica as classes sempre que o tema mudar
    localStorage.setItem("modo_tema", modo_tema);

    const root = document.documentElement;
    root.setAttribute("data-tema", modo_tema.toLowerCase());

    if (modo_tema === "ESCURO") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [modo_tema]);

  function alternar_tema() {
    definir_modo_tema((tema_atual) =>
      tema_atual === "CLARO" ? "ESCURO" : "CLARO",
    );
  }

  return {
    modo_tema,
    alternar_tema,
  };
}
