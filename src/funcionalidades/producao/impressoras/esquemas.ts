import { z } from "zod";
import { StatusImpressora } from "@/compartilhado/tipos/modelos";

export const registroManutencaoSchema = z.object({
  id: z.string().optional(),
  idImpressora: z.string().min(1),
  data: z.string().optional(),
  tipo: z.enum(["Preventiva", "Corretiva", "Melhoria"]),
  descricao: z.string().min(1),
  pecasTrocadas: z.string().optional(),
  custoCentavos: z.number().int().min(0),
  responsavel: z.string().min(1),
  tempoParadaMinutos: z.number().int().min(0),
  horasMaquinaNoMomentoMinutos: z.number().int().min(0),
});

export const pecaDesgasteSchema = z.object({
  id: z.string().optional(),
  idImpressora: z.string().min(1),
  nome: z.string().min(1),
  horasUsoAtualMinutos: z.number().int().min(0),
  vidaUtilMinutos: z.number().int().min(0),
  dataUltimaTroca: z.string().optional(),
});

export const impressoraSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1),
  tecnologia: z.enum(["FDM", "SLA", "DLP", "LCD"]),
  diametroBicoAtualMm: z.number().optional(),
  tamanhoTela: z.string().optional(),
  status: z.nativeEnum(StatusImpressora),
  observacoes: z.string().optional(),
  marca: z.string().optional(),
  modeloBase: z.string().optional(),
  imagemUrl: z.string().url().or(z.string()).optional(),
  consumoKw: z.number().optional(),
  potenciaWatts: z.number().optional(),
  valorCompraCentavos: z.number().int().min(0).optional(),
  taxaHoraCentavos: z.number().int().min(0).optional(),
  horimetroTotalMinutos: z.number().int().min(0).optional(),
  intervaloRevisaoMinutos: z.number().int().min(0).optional(),
  dataAposentadoria: z.string().optional(),
});
