export type TecnologiaImpressora = "FDM" | "SLA" | "DLP" | "LCD";

export type StatusImpressora = "Operacional" | "Em Manutenção" | "Aposentada";

export interface VolumeImpressao {
    largura: number;
    profundidade: number;
    altura: number;
}

/** Perfil de impressora proveniente do catálogo público `impressoras.json` (Mapeado) */
export interface PerfilImpressoraCatalogo {
    marca: string;
    modelo: string;
    nome: string;
    consumoKw: number;
    tipo: string;
    imagem: string;
}

export interface RegistroManutencao {
    id: string;
    data: string;
    tipo: "Preventiva" | "Corretiva" | "Melhoria";
    descricao: string;
    pecasTrocadas?: string;
    custo: number;
    responsavel: string;
    tempoParadaHoras?: number;
    horasMaquinaNoMomento?: number;
}

export interface PecaDesgaste {
    id: string;
    nome: string;
    horasTrocado: number;
    vidaUtilEstimada: number;
    dataInclusao: string;
}

export interface RegistroProducao {
    idProtocolo: string;
    nomeProjeto: string;
    horasImpressao: number;
    valorGerado: number;
    dataConclusao: string;
    sucesso: boolean;
}

export interface Impressora {
    id: string;
    nome: string;
    tecnologia: TecnologiaImpressora;
    volumeImpressao: VolumeImpressao;
    /** Aplicável apenas para tecnologia FDM */
    diametroBicoAtual?: number;
    /** Aplicável apenas para tecnologias de Resina (SLA/DLP/LCD) */
    tamanhoTela?: string;
    status: StatusImpressora;
    observacoes?: string;
    /** Marca da fabricante, vinda do catálogo */
    marca?: string;
    /** Modelo base selecionado no catálogo */
    modeloBase?: string;
    /** URL da imagem oficial da impressora */
    imagemUrl?: string;
    /** Consumo em kW/h, vindo do catálogo */
    consumoKw?: number;
    /** Potência em Watts */
    potenciaWatts?: number;
    /** Valor de compra em BRL */
    valorCompra?: number;
    /** Taxa hora da máquina em BRL/h */
    taxaHora?: number;
    /** Horímetro total em horas de uso acumulado */
    horimetroTotal?: number;
    /** Intervalo em horas entre revisões preventivas */
    intervaloRevisao?: number;
    /** Rastreamento de consumíveis críticos */
    pecasDesgaste?: PecaDesgaste[];
    /** Simulação de histórico de produção vinculada */
    historicoProducao?: RegistroProducao[];
    /** Histórico de Manutenção da Impressora */
    historicoManutencao?: RegistroManutencao[];
    /** Data da Aposentadoria (Soft Delete) */
    dataAposentadoria?: string;
    dataCriacao: Date;
    dataAtualizacao: Date;
}
