import { Material } from "@/funcionalidades/producao/materiais/tipos";

export interface MaterialSelecionado {
  id: string;
  nome: string;
  cor: string;
  tipo: "FDM" | "SLA";
  quantidade: number;
  precoKgCentavos: number;
}

export interface ItemPosProcesso {
  id: string;
  nome: string;
  valor: number;
}

export interface InsumoSelecionado {
  id: string;
  nome: string;
  custoCentavos: number;
}

export interface PerfilMarketplace {
  nome: string;
  taxa: number;
  fixa: number;
  ins: number;
  imp: number;
}

export interface VersaoCalculo {
  id: string;
  data: string;
  nome: string;
  calculo: any;
  configuracoes: any;
}

export interface CalculoResultado {
  custoMaterial: number;
  custoEnergia: number;
  custoMaoDeObra: number;
  custoDepreciacao: number;
  custoPosProcesso: number;
  custoInsumos: number;
  taxaMarketplace: number;
  impostoVenda: number;
  precoSugerido: number;
  lucroLiquido: number;
  custoTotalOperacional: number;
  margemReal: number;
}
