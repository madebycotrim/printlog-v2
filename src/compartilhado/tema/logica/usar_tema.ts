import { useEffect, useState } from "react";
import type { CorPrimaria, ModoTema, TipoFonte } from "@/compartilhado/tipos_globais/modelos";

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
  lime: { hex: "#84cc16", rgb: "132 204 22" },
  pink: { hex: "#ec4899", rgb: "236 72 153" },
  blue: { hex: "#3b82f6", rgb: "59 130 246" },
  slate: { hex: "#64748b", rgb: "100 116 139" },
};

const MAPA_FONTES: Record<TipoFonte, string> = {
  inter: "Inter, sans-serif",
  roboto: "Roboto, sans-serif",
  montserrat: "Montserrat, sans-serif",
  outfit: "Outfit, sans-serif",
  poppins: "Poppins, sans-serif",
  "jetbrains-mono": "'JetBrains Mono', monospace",
};

export function usarTema() {
  // Inicializa o estado lendo diretamente do localStorage ou preferência do sistema
  const [modoTema, definirModoTema] = useState<ModoTema>(() => {
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

  const [corPrimaria, definirCorPrimaria] = useState<CorPrimaria>(() => {
    if (typeof window !== "undefined") {
      const corSalva = localStorage.getItem("cor_primaria") as CorPrimaria | null;
      if (corSalva && corSalva in PALETA_PRIMARIA) {
        return corSalva;
      }
    }
    return "sky";
  });

  const [fonte, definirFonte] = useState<TipoFonte>(() => {
    if (typeof window !== "undefined") {
      const fonteSalva = localStorage.getItem("fonte_usuario") as TipoFonte | null;
      if (fonteSalva && fonteSalva in MAPA_FONTES) {
        return fonteSalva;
      }
    }
    return "inter";
  });

  useEffect(() => {
    // Persiste as escolhas e aplica variaveis globais de tema/cor
    localStorage.setItem("modo_tema", modoTema);
    localStorage.setItem("cor_primaria", corPrimaria);
    localStorage.setItem("fonte_usuario", fonte);

    const root = document.documentElement;
    root.setAttribute("data-tema", modoTema.toLowerCase());
    root.style.setProperty("--cor-primaria", PALETA_PRIMARIA[corPrimaria].hex);
    root.style.setProperty("--cor-primaria-rgb", PALETA_PRIMARIA[corPrimaria].rgb);
    root.style.setProperty("--familia-fonte", MAPA_FONTES[fonte]);

    if (modoTema === "ESCURO") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [modoTema, corPrimaria, fonte]);

  function alternarTema() {
    definirModoTema((temaAtual) =>
      temaAtual === "CLARO" ? "ESCURO" : "CLARO",
    );
  }

  return {
    modoTema,
    definirModoTema,
    alternarTema,
    corPrimaria,
    definirCorPrimaria,
    fonte,
    definirFonte,
    paletaPrimaria: PALETA_PRIMARIA,
  };
}
