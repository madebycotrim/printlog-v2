import { useState, useMemo, useEffect, useCallback } from "react";
import { usarArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";
import { extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";
import { toast } from "react-hot-toast";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { 
  MaterialSelecionado, 
  ItemPosProcesso, 
  InsumoSelecionado, 
  PerfilMarketplace, 
  VersaoCalculo,
  CalculoResultado 
} from "../tipos";

export function usarCalculadora() {
  const config = usarArmazemConfiguracoes();
  const { materiais } = usarArmazemMateriais();
  const { pedidos } = usarPedidos();

  // --- ESTADOS BASE ---
  const [materiaisSelecionados, setMateriaisSelecionados] = useState<MaterialSelecionado[]>([]);
  const [tempo, setTempo] = useState<number>(0);
  const [potencia, setPotencia] = useState<number>(0);
  const [precoKwh, setPrecoKwh] = useState<number>(() => extrairValorNumerico(config.custoEnergia));
  const [maoDeObra, setMaoDeObra] = useState<number>(() => extrairValorNumerico(config.horaOperador));
  const [depreciacaoHora, setDepreciacaoHora] = useState<number>(() => extrairValorNumerico(config.horaMaquina));
  const [margem, setMargem] = useState<number>(() => extrairValorNumerico(config.margemLucro));
  
  const [frete, setFrete] = useState<number>(0);
  const [insumosFixos, setInsumosFixos] = useState<number>(0);
  const [insumosSelecionados, setInsumosSelecionados] = useState<InsumoSelecionado[]>([]);
  const [itensPosProcesso, setItensPosProcesso] = useState<ItemPosProcesso[]>([]);
  
  const [perfilAtivo, setPerfilAtivo] = useState("Direto");
  const [impostos, setImpostos] = useState(0);
  const [icms, setIcms] = useState(0);
  const [iss, setIss] = useState(0);

  const [impressoraSelecionadaId, setImpressoraSelecionadaId] = useState<string>(() => {
    return localStorage.getItem("printlog_ultima_impressora") || "";
  });

  const [perfisMarketplace, setPerfisMarketplace] = useState<PerfilMarketplace[]>(() => {
    const salvo = localStorage.getItem("printlog_perfis_marketplace");
    if (salvo) return JSON.parse(salvo);
    return [
      { nome: "Direto", taxa: 0, fixa: 0, ins: 0, imp: 6 },
      { nome: "M. Livre", taxa: 18, fixa: 6, ins: 2, imp: 6 },
      { nome: "Shopee", taxa: 20, fixa: 3, ins: 1.5, imp: 6 },
      { nome: "Site", taxa: 5, fixa: 0, ins: 5, imp: 6 },
    ];
  });

  // --- FEATURE 2: HISTÓRICO/VERSIONAMENTO ---
  const [historico, setHistorico] = useState<VersaoCalculo[]>(() => {
    const salvo = localStorage.getItem("printlog_historico_calculadora");
    return salvo ? JSON.parse(salvo) : [];
  });

  // --- SINCRONIZAÇÃO CONFIGS ---
  useEffect(() => {
    if (!config.carregando) {
      setPrecoKwh(extrairValorNumerico(config.custoEnergia));
      setMaoDeObra(extrairValorNumerico(config.horaOperador));
      setDepreciacaoHora(extrairValorNumerico(config.horaMaquina));
      setMargem(extrairValorNumerico(config.margemLucro));
    }
  }, [config.custoEnergia, config.horaOperador, config.horaMaquina, config.margemLucro, config.carregando]);

  // --- LÓGICA DE CÁLCULO (Sólida) ---
  const calculo = useMemo((): CalculoResultado => {
    const custoMaterialTotalCentavos = materiaisSelecionados.reduce((acc, m) => acc + (m.quantidade / 1000) * m.precoKgCentavos, 0);
    const custoInsumosDinamicosCentavos = insumosSelecionados.reduce((acc, i) => acc + i.custoCentavos, 0);
    
    const horasDecimais = tempo / 60;
    const custoEnergiaCentavos = Math.round((potencia / 1000) * horasDecimais * precoKwh * 100);
    const custoMaoDeObraCentavos = Math.round(horasDecimais * maoDeObra * 100);
    const custoDepreciacaoCentavos = Math.round(horasDecimais * depreciacaoHora * 100);
    const custoPosProcessoCentavos = itensPosProcesso.reduce((t, i) => t + (i.valor * 100), 0);
    const custoInsumosFixosCentavos = Math.round(insumosFixos * 100);
    const custoFreteCentavos = Math.round(frete * 100);

    const custoProducaoTotalCentavos = 
      custoMaterialTotalCentavos + 
      custoEnergiaCentavos + 
      custoMaoDeObraCentavos + 
      custoDepreciacaoCentavos + 
      custoPosProcessoCentavos + 
      custoInsumosDinamicosCentavos + 
      custoInsumosFixosCentavos;

    const margemPercentual = margem / 100;
    const perfil = perfisMarketplace.find(p => p.nome === perfilAtivo);
    const taxaMktPercentual = (perfil?.taxa || 0) / 100;
    const taxaFixaVendaCentavos = Math.round((perfil?.fixa || 0) * 100);
    const impostoPercentual = (impostos + icms + iss) / 100;

    const lucroDesejadoCentavos = Math.round(custoProducaoTotalCentavos * margemPercentual);
    const precoBaseVendaCentavos = custoProducaoTotalCentavos + lucroDesejadoCentavos + custoFreteCentavos + taxaFixaVendaCentavos;
    const denominadorTaxas = 1 - taxaMktPercentual - impostoPercentual;

    const precoSugeridoCentavos = denominadorTaxas > 0.05 
      ? Math.round(precoBaseVendaCentavos / denominadorTaxas)
      : Math.round(precoBaseVendaCentavos * 1.5);

    const taxaMktTotalCentavos = Math.round(precoSugeridoCentavos * taxaMktPercentual + taxaFixaVendaCentavos);
    const impostoTotalCentavos = Math.round(precoSugeridoCentavos * impostoPercentual);
    
    const custoTotalVariavelCentavos = custoProducaoTotalCentavos - custoMaoDeObraCentavos;
    const lucroLiquidoCentavos = precoSugeridoCentavos - taxaMktTotalCentavos - impostoTotalCentavos - custoFreteCentavos - custoTotalVariavelCentavos - custoMaoDeObraCentavos;

    const margemRealSobreVenda = precoSugeridoCentavos > 0 ? (lucroLiquidoCentavos / precoSugeridoCentavos) * 100 : 0;

    return {
      custoMaterial: Math.round(custoMaterialTotalCentavos),
      custoEnergia: custoEnergiaCentavos,
      custoMaoDeObra: custoMaoDeObraCentavos,
      custoDepreciacao: custoDepreciacaoCentavos,
      custoPosProcesso: custoPosProcessoCentavos,
      custoInsumos: custoInsumosDinamicosCentavos + custoInsumosFixosCentavos,
      taxaMarketplace: taxaMktTotalCentavos,
      impostoVenda: impostoTotalCentavos,
      precoSugerido: precoSugeridoCentavos,
      lucroLiquido: lucroLiquidoCentavos,
      custoTotalOperacional: custoProducaoTotalCentavos,
      margemReal: margemRealSobreVenda
    };
  }, [materiaisSelecionados, insumosSelecionados, tempo, potencia, precoKwh, margem, maoDeObra, depreciacaoHora, itensPosProcesso, insumosFixos, frete, perfilAtivo, perfisMarketplace, impostos, icms, iss]);

  // --- FEATURE 3: ALERTA DE ESTOQUE ---
  const alertasEstoque = useMemo(() => {
    return materiaisSelecionados.map(sel => {
      const real = materiais.find(m => m.id === sel.id);
      if (!real) return null;
      const totalDisponivel = (real.estoque * real.pesoGramas) + real.pesoRestanteGramas;
      if (sel.quantidade > totalDisponivel) {
        return {
          materialId: sel.id,
          nome: sel.nome,
          falta: sel.quantidade - totalDisponivel,
          disponivel: totalDisponivel
        };
      }
      return null;
    }).filter(a => a !== null);
  }, [materiaisSelecionados, materiais]);

  // --- FEATURE 4: ESTIMATIVA DE PRAZO ---
  const estimativaPrazo = useMemo(() => {
    // Projetos em andamento ou aguardando
    const minutosOcupados = pedidos
      .filter(p => p.status === StatusPedido.EM_PRODUCAO || p.status === StatusPedido.A_FAZER)
      .reduce((acc, p) => acc + (p.tempoMinutos || 0), 0);
    
    const minutosTotais = minutosOcupados + tempo;
    const diasParaAdicionar = Math.ceil(minutosTotais / (8 * 60)); // 8h de trabalho por dia
    
    const dataEstimada = new Date();
    dataEstimada.setDate(dataEstimada.getDate() + diasParaAdicionar);
    
    return {
      minutosOcupados,
      diasUteis: diasParaAdicionar,
      data: dataEstimada
    };
  }, [pedidos, tempo]);

  // --- FEATURE 2: LÓGICA DE HISTÓRICO ---
  const salvarSnapshot = (nome: string) => {
    const novaVersao: VersaoCalculo = {
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
      nome: nome || `Versão ${historico.length + 1}`,
      calculo,
      configuracoes: {
        materiaisSelecionados,
        tempo,
        perfilAtivo,
        margem
      }
    };
    const novoHistorico = [novaVersao, ...historico];
    setHistorico(novoHistorico);
    localStorage.setItem("printlog_historico_calculadora", JSON.stringify(novoHistorico));
    toast.success("Snapshot salvo no histórico!");
  };

  const carregarSnapshot = (versao: VersaoCalculo) => {
    setMateriaisSelecionados(versao.configuracoes.materiaisSelecionados);
    setTempo(versao.configuracoes.tempo);
    setPerfilAtivo(versao.configuracoes.perfilAtivo);
    setMargem(versao.configuracoes.margem);
    toast.success(`Carregado: ${versao.nome}`);
  };

  const removerSnapshot = (id: string) => {
    const novo = historico.filter(v => v.id !== id);
    setHistorico(novo);
    localStorage.setItem("printlog_historico_calculadora", JSON.stringify(novo));
  };

  // --- FEATURE 5: DADOS PARA GRÁFICOS ---
  const dadosGraficoPizza = useMemo(() => [
    { name: 'Materiais', value: calculo.custoMaterial, fill: '#38bdf8' },
    { name: 'Energia', value: calculo.custoEnergia, fill: '#fbbf24' },
    { name: 'Trabalho', value: calculo.custoMaoDeObra, fill: '#10b981' },
    { name: 'Custos Fixos', value: calculo.custoInsumos + calculo.custoPosProcesso + calculo.custoDepreciacao, fill: '#f43f5e' },
    { name: 'Impostos/Taxas', value: calculo.taxaMarketplace + calculo.impostoVenda, fill: '#94a3b8' },
    { name: 'Lucro Líquido', value: Math.max(0, calculo.lucroLiquido), fill: '#34d399' }
  ].filter(d => d.value > 0), [calculo]);

  // --- FEATURE 1: EXPORTAÇÃO PDF ---
  const gerarPdf = useCallback(() => {
    const dataRef = new Date();
    const validade = new Date();
    validade.setDate(dataRef.getDate() + 7);

    const layout = `
      <html>
        <head>
          <title>Orçamento PrintLog - ${dataRef.toLocaleDateString('pt-BR')}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1f2937; }
            .header { border-bottom: 4px solid #0ea5e9; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: 900; color: #0ea5e9; letter-spacing: -1px; }
            .grid { display: grid; grid-cols: 2; gap: 40px; margin-top: 40px; }
            .valor { font-size: 48px; font-weight: 900; color: #10b981; margin: 20px 0; }
            .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #6b7280; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #f3f4f6; font-size: 11px; text-transform: uppercase; color: #9ca3af; }
            td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #f3f4f6; font-size: 10px; color: #9ca3af; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">PRINTLOG.PRO</div>
            <div style="text-align: right">
              <div class="label">Emitido em</div>
              <div style="font-weight: bold">${dataRef.toLocaleDateString('pt-BR')}</div>
            </div>
          </div>
          
          <div style="margin-top: 40px">
            <div class="label">Valor Final do Orçamento</div>
            <div class="valor">R$ ${(calculo.precoSugerido / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>

          <div class="label">Resumo de Materiais</div>
          <table>
            <thead>
              <tr><th>Material</th><th>Tipo</th><th>Quantidade</th></tr>
            </thead>
            <tbody>
              ${materiaisSelecionados.map(m => `<tr><td>${m.nome}</td><td>${m.tipo}</td><td>${m.quantidade}${m.tipo === 'FDM' ? 'g' : 'ml'}</td></tr>`).join('')}
            </tbody>
          </table>

          <div style="margin-top: 30px">
            <div class="label">Prazo Estimado</div>
            <div style="font-weight: bold; font-size: 16px">${estimativaPrazo.data.toLocaleDateString('pt-BR')}</div>
          </div>

          <div class="footer">
            Orçamento válido até ${validade.toLocaleDateString('pt-BR')} • Gerado via PrintLog v2 Professional
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    win?.document.write(layout);
    win?.document.close();
  }, [calculo, materiaisSelecionados, estimativaPrazo]);

  return {
    // Estados
    materiaisSelecionados, setMateriaisSelecionados,
    tempo, setTempo,
    potencia, setPotencia,
    precoKwh, setPrecoKwh,
    maoDeObra, setMaoDeObra,
    depreciacaoHora, setDepreciacaoHora,
    margem, setMargem,
    frete, setFrete,
    insumosFixos, setInsumosFixos,
    insumosSelecionados, setInsumosSelecionados,
    itensPosProcesso, setItensPosProcesso,
    perfilAtivo, setPerfilAtivo,
    perfisMarketplace, setPerfisMarketplace,
    impostos, setImpostos,
    icms, setIcms,
    iss, setIss,
    impressoraSelecionadaId, setImpressoraSelecionadaId,
    historico,
    
    // Resultados
    calculo,
    alertasEstoque,
    estimativaPrazo,
    dadosGraficoPizza,
    
    // Ações
    salvarSnapshot,
    carregarSnapshot,
    removerSnapshot,
    gerarPdf
  };
}
