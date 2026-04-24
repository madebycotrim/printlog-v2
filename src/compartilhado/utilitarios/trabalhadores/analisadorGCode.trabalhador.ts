import JSZip from "jszip";
import { CodigoErro } from "../excecoes";

/** Interface de resultado do fatiamento */
export interface ResultadoAnaliseGCode {
  tempoEstimadoMinutos: number;
  pesoEstimadoGramas: number;
  quantidadeLinhas: number;
  fatiadorDetectado: string;
  isMultifilamento: boolean;
}

// Escutando mensagens da thread principal
self.onmessage = async (evento: MessageEvent<File | string>) => {
  const dados = evento.data;

  try {
    let conteudoGCode = "";
    let fatiador = "Desconhecido";

    if (dados instanceof File) {
      const nomeArquivo = dados.name.toLowerCase();
      
      // Se for 3MF (ZIP)
      if (nomeArquivo.endsWith(".3mf")) {
        const zip = await JSZip.loadAsync(dados);
        
        // Estratégia 1: Busca profunda por qualquer arquivo que pareça G-Code ou Config
        const nomesArquivos = Object.keys(zip.files);
        console.log("[Analista3MF] Arquivos encontrados no ZIP:", nomesArquivos);

        for (const caminho of nomesArquivos) {
          const arq = zip.files[caminho];
          if (arq.dir || arq.name.includes(".png") || arq.name.includes(".model")) continue;
          
          const conteudo = await arq.async("text");
          if (conteudo.length < 2000) {
            console.log(`[Analista3MF] Conteúdo de ${caminho}:`, conteudo);
          } else {
            console.log(`[Analista3MF] Lendo arquivo: ${caminho} (${conteudo.length} bytes)`);
          }

          // Suporte específico para slice_info.config ou JSON do Bambu
          if (caminho.endsWith(".config") || caminho.endsWith(".json") || caminho.includes("Metadata")) {
             // Regex super permissiva para Tempo
             const matchTempo = 
                conteudo.match(/(?:prediction|total_time|duration|estimated_time|time_estimate)\s*[:=]\s*([\d.]+)/i) || 
                conteudo.match(/"(?:prediction|total_time|duration|estimated_time|time_estimate)"\s*:\s*([\d.]+)/i) ||
                conteudo.match(/(\d{1,2}):(\d{2}):(\d{2})/); // HH:MM:SS solto

             // Regex super permissiva para Peso
             const matchPeso = 
                conteudo.match(/(?:weight|filament_used|total_weight|filament_weight)\s*[:=]\s*([\d.]+)/i) || 
                conteudo.match(/"(?:weight|filament_used|total_weight|filament_weight)"\s*:\s*([\d.]+)/i);
             
             if (matchTempo || matchPeso) {
                let tempoFinalMinutos = 0;
                
                if (matchTempo) {
                   const t = matchTempo[0];
                   if (t.includes(":")) {
                      // Se capturou HH:MM:SS
                      const partes = t.match(/(\d{1,2}):(\d{2}):(\d{2})/);
                      if (partes) tempoFinalMinutos = (parseInt(partes[1]) * 60) + parseInt(partes[2]);
                   } else {
                      // Se capturou segundos
                      tempoFinalMinutos = Math.ceil(Number(matchTempo[1]) / 60);
                   }
                }

                const pesoFinalGramas = Math.ceil(Number(matchPeso?.[1] || 0));

                if (tempoFinalMinutos > 0 || pesoFinalGramas > 0) {
                   console.log(`[Analista3MF] SUCESSO em ${caminho}:`, { tempoFinalMinutos, pesoFinalGramas });
                   self.postMessage({ 
                     tipo: "SUCESSO", 
                     dados: {
                       tempoEstimadoMinutos: tempoFinalMinutos,
                       pesoEstimadoGramas: pesoFinalGramas,
                       quantidadeLinhas: 0,
                       fatiadorDetectado: `3MF Bambu (${caminho.split('/').pop()})`
                     }
                   });
                   return;
                }
             }
          }

          // Se tiver G1, processa como G-Code tradicional
          if (conteudo.includes("G1 ") || conteudo.includes("TIME:")) {
             console.log(`[Analista3MF] Processando como G-Code: ${caminho}`);
             const teste = analisarConteudo(conteudo, `3MF (${caminho.split('/').pop()})`);
             if (teste.tempoEstimadoMinutos > 0 || teste.pesoEstimadoGramas > 0) {
                self.postMessage({ tipo: "SUCESSO", dados: teste });
                return;
             }
          }
        }

        // Estratégia 2: Busca em metadados XML (Fallback)
        const modelXml = await zip.file("3D/3dmodel.model")?.async("text");
        if (modelXml) {
          const matchTempo = modelXml.match(/slicing_time="([\d.]+)"/) || modelXml.match(/estimated_time="([\d.]+)"/);
          const matchPeso = modelXml.match(/filament_weight="([\d.]+)"/) || modelXml.match(/filament_used="([\d.]+)"/);
          
          if (matchTempo || matchPeso) {
            const resultado = {
              tempoEstimadoMinutos: Math.ceil(Number(matchTempo?.[1] || 0) / 60),
              pesoEstimadoGramas: Math.ceil(Number(matchPeso?.[1] || 0)),
              quantidadeLinhas: 0,
              fatiadorDetectado: "3MF (Metadata XML)"
            };
            self.postMessage({ tipo: "SUCESSO", dados: resultado });
            return;
          }
        }

        // Estratégia 3: Fallback Estilo MakerWorld (Cálculo Geométrico de Volume)
        // Se chegamos aqui, não há dados de fatiamento. Vamos calcular o volume real da malha.
        let volumeTotalMm3 = 0;
        const arquivosModel = Object.keys(zip.files).filter(c => c.endsWith(".model"));
        
        for (const caminho of arquivosModel) {
          const conteudo = await zip.files[caminho].async("text");
          volumeTotalMm3 += calcularVolumeDeXml(conteudo);
        }

        if (volumeTotalMm3 > 0) {
          // Estimativa otimizada para impressoras rápidas (Bambu/CoreXY)
          // Densidade PLA 1.24g/cm3 * ~22% de preenchimento real (paredes + infill)
          const cm3 = volumeTotalMm3 / 1000;
          const pesoEstimado = Math.ceil(cm3 * 1.24 * 0.22); 
          
          // Tempo estimado: 5 min setup + 5 min por cm3 (perfil de alta velocidade)
          const tempoEstimado = Math.ceil(5 + (cm3 * 5));

          self.postMessage({ 
            tipo: "SUCESSO", 
            dados: {
              tempoEstimadoMinutos: tempoEstimado,
              pesoEstimadoGramas: pesoEstimado,
              quantidadeLinhas: 0,
              fatiadorDetectado: "Estimativa por Volume (Alta Velocidade)"
            }
          });
          return;
        }

        throw new Error("Não foi possível encontrar dados de fatiamento nem geometria válida neste arquivo.");
      } else {
        conteudoGCode = await dados.text();
      }
    } else {
      conteudoGCode = dados;
    }

    const resultado = analisarConteudo(conteudoGCode, fatiador);
    self.postMessage({ tipo: "SUCESSO", dados: resultado });
  } catch (erro) {
    self.postMessage({
      tipo: "ERRO",
      codigo: CodigoErro.ARQUIVO_FATIAMENTO_INVALIDO,
      mensagem: erro instanceof Error ? erro.message : "Falha ao processar o arquivo.",
    });
  }
};

/**
 * Analisa o conteúdo textual do G-Code.
 */
function analisarConteudo(conteudo: string, fatiadorBase: string): ResultadoAnaliseGCode {
  const linhas = conteudo.split("\n");
  let tempoSegundos = 0;
  let pesoGramas = 0;
  let fatiador = fatiadorBase;
  let extrusores = new Set<string>();

  // Regex para múltiplos fatiadores
  const regexCuraTime = /;TIME:(\d+)/;
  const regexFilamentG = /; filament used \[g\] = ([\d.]+)/;

  for (const linha of linhas) {
    // Detecção de Fatiador se ainda for desconhecido
    if (fatiador === "Desconhecido" || fatiador.includes("3MF")) {
      if (linha.includes("Cura_Grand_Unified")) fatiador = "Ultimaker Cura";
      if (linha.includes("PrusaSlicer")) fatiador = "PrusaSlicer";
      if (linha.includes("OrcaSlicer")) fatiador = "OrcaSlicer";
      if (linha.includes("Bambu Studio")) fatiador = "Bambu Studio";
    }

    // EXTRAÇÃO DE TEMPO
    // Cura
    const mCura = linha.match(regexCuraTime);
    if (mCura) tempoSegundos = parseInt(mCura[1], 10);

    // Bambu / Orca / Prusa (Tempo Total)
    if (linha.includes("; total estimated time") || linha.includes("; estimated printing time")) {
       const partes = linha.split("=");
       const t = (partes.length > 1 ? partes[1] : linha.split(":")[1] || "").trim();
       
       if (t) {
         let s = 0;
         // Formato HH:MM:SS
         const hhmmss = t.match(/(\d{1,2}):(\d{2}):(\d{2})/);
         if (hhmmss) {
           s = (parseInt(hhmmss[1]) * 3600) + (parseInt(hhmmss[2]) * 60) + parseInt(hhmmss[3]);
         } else {
           // Formato 1h 20m 30s
           const hM = t.match(/(\d+)h/);
           const mM = t.match(/(\d+)m/);
           const sM = t.match(/(\d+)s/);
           if (hM) s += parseInt(hM[1]) * 3600;
           if (mM) s += parseInt(mM[1]) * 60;
           if (sM) s += parseInt(sM[1]);
         }
         if (s > 0) tempoSegundos = s;
       }
    }

    // Detecção de extrusores (T0, T1, etc)
    const mExtrusor = linha.match(/^T(\d+)/);
    if (mExtrusor) extrusores.add(mExtrusor[1]);

    // EXTRAÇÃO DE PESO
    const mPeso = linha.match(regexFilamentG) || linha.match(/; filament used \[g\] = ([\d.]+)/);
    if (mPeso) pesoGramas = parseFloat(mPeso[1]);

    // Fallback Cura (gramas no final do arquivo as vezes)
    if (linha.includes(";Filament used:")) {
       const p = linha.split(":")[1];
       if (p.includes("g")) pesoGramas = parseFloat(p);
    }
  }

  return {
    tempoEstimadoMinutos: Math.ceil(tempoSegundos / 60) || 0,
    pesoEstimadoGramas: Math.ceil(pesoGramas) || 0,
    quantidadeLinhas: linhas.length,
    fatiadorDetectado: fatiador,
    isMultifilamento: extrusores.size > 1
  };
}

/**
 * Calcula o volume de uma malha 3D a partir do XML do 3MF
 * Utiliza o algoritmo de soma de volumes de tetraedros (Divergência)
 */
function calcularVolumeDeXml(xml: string): number {
  const vertices: { x: number; y: number; z: number }[] = [];
  let volumeTotal = 0;

  // 1. Extrair Vértices (Regex rápida para Worker)
  const regexVertex = /<vertex\s+x="([-.\d]+)"\s+y="([-.\d]+)"\s+z="([-.\d]+)"/g;
  let matchV;
  while ((matchV = regexVertex.exec(xml)) !== null) {
    vertices.push({
      x: parseFloat(matchV[1]),
      y: parseFloat(matchV[2]),
      z: parseFloat(matchV[3])
    });
  }

  if (vertices.length === 0) return 0;

  // 2. Extrair Triângulos e somar volumes de tetraedros
  const regexTriangle = /<triangle\s+v1="(\d+)"\s+v2="(\d+)"\s+v3="(\d+)"/g;
  let matchT;
  while ((matchT = regexTriangle.exec(xml)) !== null) {
    const i1 = parseInt(matchT[1]);
    const i2 = parseInt(matchT[2]);
    const i3 = parseInt(matchT[3]);

    const v1 = vertices[i1];
    const v2 = vertices[i2];
    const v3 = vertices[i3];

    if (v1 && v2 && v3) {
      // Volume do tetraedro formado pelo triângulo e a origem (0,0,0)
      // v = (v1 . (v2 x v3)) / 6
      const v = (
        -v3.x * v2.y * v1.z +
        v2.x * v3.y * v1.z +
        v3.x * v1.y * v2.z -
        v1.x * v3.y * v2.z -
        v2.x * v1.y * v3.z +
        v1.x * v2.y * v3.z
      ) / 6.0;
      
      volumeTotal += v;
    }
  }

  return Math.abs(volumeTotal);
}
