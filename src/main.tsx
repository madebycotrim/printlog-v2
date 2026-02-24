import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RoteadorPrincipal } from "@/compartilhado/infraestrutura/roteamento/roteador";
import { ProvedorTema } from "@/compartilhado/tema/tema_provider";

import "@/index.css";
import "@/compartilhado/tema/tema.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProvedorTema>
      <RoteadorPrincipal />
    </ProvedorTema>
  </StrictMode>,
);
