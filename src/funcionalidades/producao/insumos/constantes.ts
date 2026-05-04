import { Box, Layers, Package, Link2, Zap, Hammer, FlaskConical } from "lucide-react";

export const CATEGORIAS = [
  { id: "Geral", rotulo: "GERAL", icone: Layers, corTema: "zinc-500" },
  { id: "Embalagem", rotulo: "EMBALAGEM", icone: Package, corTema: "amber-500" },
  { id: "Fixação", rotulo: "FIXAÇÃO", icone: Link2, corTema: "orange-500" },
  { id: "Eletrônica", rotulo: "ELETRÔNICA", icone: Zap, corTema: "violet-500" },
  { id: "Acabamento", rotulo: "ACABAMENTO", icone: Hammer, corTema: "emerald-500" },
  { id: "Limpeza", rotulo: "LIMPEZA/QUÍMICA", icone: FlaskConical, corTema: "sky-500" },
  { id: "Outros", rotulo: "OUTROS", icone: Box, corTema: "zinc-500" },
];

export const UNIDADES = [
  { valor: "un", rotulo: "UN" },
  { valor: "ml", rotulo: "ML" },
  { valor: "L", rotulo: "L" },
  { valor: "g", rotulo: "G" },
  { valor: "kg", rotulo: "KG" },
  { valor: "Rolo", rotulo: "ROLO" },
  { valor: "Caixa", rotulo: "CX" },
  { valor: "Par", rotulo: "PAR" },
];

export const UNIDADES_CONSUMO = [
  { valor: "m", rotulo: "Metro (m)" },
  { valor: "cm", rotulo: "Centímetro (cm)" },
  { valor: "ml", rotulo: "Mililitro (ml)" },
  { valor: "g", rotulo: "Grama (g)" },
  { valor: "folha", rotulo: "Folha" },
  { valor: "pedaço", rotulo: "Pedaço" },
  { valor: "dose", rotulo: "Dose" },
  { valor: "spray", rotulo: "Spray / Borrifada" },
  { valor: "gota", rotulo: "Gota" },
];
