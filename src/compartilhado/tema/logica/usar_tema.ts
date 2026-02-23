import { useEffect, useState } from "react";
import type { CorPrimaria, ModoTema } from "@/compartilhado/tipos_globais/modelos";

const PALETA_PRIMARIA: Record<CorPrimaria, { hex: string; rgb: string }> = {
  sky: { hex: "#0ea5e9", rgb: "14 165 233" },
  emerald: { hex: "#10b981", rgb: "16 185 129" },
  violet: { hex: "#8b5cf6", rgb: "139 92 246" },
  amber: { hex: "#f59e0b", rgb: "245 158 11" },
  rose: { hex: "#f43f5e", rgb: "244 63 94" },
  cyan: { hex: "#06b6d4", rgb: "6 182 212" },
  indigo: { hex: "#6366f1", rgb: "99 102 241" },
  teal: { hex: "#14b8a6", rgb: "20 184 166" },
  orange: { hex: "#f97316", rgb: "249 115 22" },
  fuchsia: { hex: "#d946ef", rgb: "217 70 239" },
};

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
  const [cor_primaria, definir_cor_primaria] = useState<CorPrimaria>(() => {
    if (typeof window !== "undefined") {
      const corSalva = localStorage.getItem("cor_primaria") as CorPrimaria | null;
      if (corSalva && corSalva in PALETA_PRIMARIA) {
        return corSalva;
      }
    }
    return "sky";
  });

  useEffect(() => {
    // Persiste as escolhas e aplica variaveis globais de tema/cor
    localStorage.setItem("modo_tema", modo_tema);
    localStorage.setItem("cor_primaria", cor_primaria);

    const root = document.documentElement;
    root.setAttribute("data-tema", modo_tema.toLowerCase());
    root.style.setProperty("--cor-primaria", PALETA_PRIMARIA[cor_primaria].hex);
    root.style.setProperty("--cor-primaria-rgb", PALETA_PRIMARIA[cor_primaria].rgb);

    if (modo_tema === "ESCURO") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [modo_tema, cor_primaria]);

  function alternar_tema() {
    definir_modo_tema((tema_atual) =>
      tema_atual === "CLARO" ? "ESCURO" : "CLARO",
    );
  }

  return {
    modo_tema,
    alternar_tema,
    cor_primaria,
    definir_cor_primaria,
    paleta_primaria: PALETA_PRIMARIA,
  };
}
