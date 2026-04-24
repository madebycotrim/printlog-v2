// v1.0.1 - Limpeza G-Code
import {
  Zap,
  Timer,
  DollarSign,
  TrendingUp,
  RefreshCcw,
  Cpu,
  Layers,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  Box,
  Search,
  Warehouse,
  Settings,
  ShieldCheck,
  Package,
  Activity,
  Download,
  X,
  FolderKanban,
  Truck,
  Calculator,
  PieChart,
  BarChart2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { toast } from "react-hot-toast";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { useShallow } from "zustand/react/shallow";
import { usarGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/usarGerenciadorImpressoras";
import { usarGerenciadorMateriais } from "@/funcionalidades/producao/materiais/hooks/usarGerenciadorMateriais";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes/Icones3D";
import { FormularioMaterial } from "@/funcionalidades/producao/materiais/componentes/FormularioMaterial";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { usarArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { centavosParaReais, extrairValorNumerico, formatarPorcentagem, formatarMoedaFinancas } from "@/compartilhado/utilitarios/formatadores";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { FormularioInsumo } from "@/funcionalidades/producao/insumos/componentes/FormularioInsumo";
import { usarGerenciadorInsumos } from "@/funcionalidades/producao/insumos/hooks/usarGerenciadorInsumos";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";

interface MaterialSelecionado {
  id: string;
  nome: string;
  cor: string;
  tipo: "FDM" | "SLA";
  quantidade: number;
  precoKgCentavos: number;
}

export function PaginaCalculadora() {
  const { usuario } = usarAutenticacao();
  const config = usarArmazemConfiguracoes();
  const navigate = useNavigate();
  const { criarPedido } = usarPedidos();
  const { estado: { impressoras = [] } = {} } = usarGerenciadorImpressoras();

  // Helper para converter strings do banco ("R$ 0,95") para números (0.95)
  const limparParaNumero = (v: string) => extrairValorNumerico(v);

  // Estados do Formulário
  const [materiaisSelecionados, setMateriaisSelecionados] = useState<MaterialSelecionado[]>([]);
  const [tempo, setTempo] = useState<number>(0);
  const [potencia, setPotencia] = useState<number>(0);
  const [precoKwh, setPrecoKwh] = useState<number>(() => extrairValorNumerico(config.custoEnergia));
  const [maoDeObra, setMaoDeObra] = useState<number>(() => extrairValorNumerico(config.horaOperador));
  const [depreciacaoHora, setDepreciacaoHora] = useState<number>(() => extrairValorNumerico(config.horaMaquina));
  const [margem, setMargem] = useState<number>(() => extrairValorNumerico(config.margemLucro));


  // 🔄 SINCRONIZAÇÃO GLOBAL -> LOCAL
  // Garante que, ao carregar as configurações do D1, a calculadora receba os valores
  useEffect(() => {
    if (!config.carregando) {
      setPrecoKwh(extrairValorNumerico(config.custoEnergia));
      setMaoDeObra(extrairValorNumerico(config.horaOperador));
      setDepreciacaoHora(extrairValorNumerico(config.horaMaquina));
      setMargem(extrairValorNumerico(config.margemLucro));
    }
  }, [config.custoEnergia, config.horaOperador, config.horaMaquina, config.margemLucro, config.carregando]);


  
  // Estados Comerciais
  const [taxaEcommerce, setTaxaEcommerce] = useState<number>(0);
  const [taxaFixa, setTaxaFixa] = useState<number>(0);
  const [frete, setFrete] = useState<number>(0);
  const [insumos, setInsumos] = useState<number>(0);
  const [tipoOperacao, setTipoOperacao] = useState<'produto' | 'servico' | 'industrializacao' | 'mei'>('produto');
  const [icms, setIcms] = useState(0);
  const [iss, setIss] = useState(0);
  const [ipi, setIpi] = useState(0);
  const [impostos, setImpostos] = useState<number>(0);
  const [perfilAtivo, setPerfilAtivo] = useState("Direto");
  
  const [impressoraSelecionadaId, setImpressoraSelecionadaId] = useState<string>(() => {
    return localStorage.getItem("printlog_ultima_impressora") || "";
  });

  const impressoraSelecionada = useMemo(() => 
    impressoras.find(i => i.id === impressoraSelecionadaId),
    [impressoras, impressoraSelecionadaId]
  );
  
  const [abertoSeletor, setAbertoSeletor] = useState(false);
  const [modalArmazemAberto, setModalArmazemAberto] = useState(false);
  const [modalInsumosAberto, setModalInsumosAberto] = useState(false);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [modalPerfisAberto, setModalPerfisAberto] = useState(false);
  const [insumosSelecionados, setInsumosSelecionados] = useState<any[]>([]);
  const [buscaModalArmazem, setBuscaModalArmazem] = useState("");
  const [buscaModalInsumos, setBuscaModalInsumos] = useState("");
  const [buscaMaterial, setBuscaMaterial] = useState("");
  const [buscaInsumo, setBuscaInsumo] = useState("");
  
  // ESTADOS DE PRODUÇÃO ADICIONAIS
  const [itensPosProcesso, setItensPosProcesso] = useState<{ id: string, nome: string, valor: number }[]>([]);
  const [novoItemPosNome, setNovoItemPosNome] = useState("");
  const [novoItemPosValor, setNovoItemPosValor] = useState(0);
  
  // ESTADOS DE UI ADICIONAIS
  const [modalComparativoAberto, setModalComparativoAberto] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);


  // PREVENIR COMPORTAMENTO PADRÃO DO NAVEGADOR (ABRIR ARQUIVO EM NOVA GUIA)
  useEffect(() => {
    const prevenir = (e: DragEvent) => e.preventDefault();
    window.addEventListener("dragover", prevenir);
    window.addEventListener("drop", prevenir);
    return () => {
      window.removeEventListener("dragover", prevenir);
      window.removeEventListener("drop", prevenir);
    };
  }, []);

  // 🏪 PERFIS DE MARKETPLACE DINÂMICOS
  const [perfisMarketplace, setPerfisMarketplace] = useState(() => {
    const salvo = localStorage.getItem("printlog_perfis_marketplace");
    if (salvo) return JSON.parse(salvo);
    return [
      { nome: "Direto", taxa: 0, fixa: 0, ins: 0, imp: 6 },
      { nome: "M. Livre", taxa: 18, fixa: 6, ins: 2, imp: 6 },
      { nome: "Shopee", taxa: 20, fixa: 3, ins: 1.5, imp: 6 },
      { nome: "Site", taxa: 5, fixa: 0, ins: 5, imp: 6 },
    ];
  });

  const { materiais } = usarArmazemMateriais(useShallow(s => ({ materiais: s.materiais })));
  const { insumos: insumosEstoque, abrirEditar: abrirCriarInsumo, modalCricaoAberto: modalInsumoAberto, fecharEditar: fecharInsumoAberto, insumoEditando, adicionarOuAtualizarInsumo } = usarArmazemInsumos(useShallow(s => ({ 
    insumos: s.insumos, 
    abrirEditar: s.abrirEditar,
    modalCricaoAberto: s.modalCricaoAberto,
    fecharEditar: s.fecharEditar,
    insumoEditando: s.insumoEditando,
    adicionarOuAtualizarInsumo: s.adicionarOuAtualizarInsumo
  })));
  usarGerenciadorInsumos();
  const { estado: estadoMateriais, acoes: acoesMateriais } = usarGerenciadorMateriais(); 

  const [custoEnergiaCalculado, setCustoEnergiaCalculado] = useState(0);

  // Estados para Análise de Negócios / Business
  const [abaResultado, setAbaResultado] = useState<'orcamento' | 'metricas'>('orcamento');

  // Estados de cálculo de depreciação fiscal
  const [modalDepreciacao, setModalDepreciacao] = useState(false);
  const [valorEquipamento, setValorEquipamento] = useState(0);
  const [horasUsoPorAno, setHorasUsoPorAno] = useState(2880); // 8h/dia * 30 dias * 12 meses


  // Sincroniza potência da impressora selecionada (ARTEMIS, etc)
  useEffect(() => {
    if (impressoraSelecionadaId && impressoras.length > 0) {
      const imp = impressoras.find(i => i.id === impressoraSelecionadaId);
      if (imp) {
        // Tenta usar a potência em watts diretamente. Se não tiver, converte o consumo em Kw para Watts (para retrocompatibilidade com o catálogo antigo)
        setPotencia(imp.potenciaWatts || (imp.consumoKw ? imp.consumoKw * 1000 : 0));
        
        // Auto-calcular depreciação se houver valor de compra na impressora salva
        if (imp.valorCompraCentavos && imp.valorCompraCentavos > 0) {
          const valorReais = imp.valorCompraCentavos / 100;
          setValorEquipamento(valorReais);
          setDepreciacaoHora(Number((valorReais / (5 * horasUsoPorAno)).toFixed(3)));
        }
      }
    }
  }, [impressoraSelecionadaId, impressoras, horasUsoPorAno]);

  // Calcula o custo de energia em tempo real
  useEffect(() => {
    const tempoTotalHoras = (tempo || 0) / 60;
    const kwhUsado = (potencia / 1000) * tempoTotalHoras;
    const custo = kwhUsado * precoKwh;
    setCustoEnergiaCalculado(custo);
  }, [tempo, potencia, precoKwh]);

  const alternarMaterial = (id: string) => {
    const jaSelecionado = materiaisSelecionados.find(m => m.id === id);
    if (jaSelecionado) {
      setMateriaisSelecionados(prev => prev.filter(m => m.id !== id));
    } else {
      const matOriginal = materiais.find(m => m.id === id);
      if (matOriginal) {
        setMateriaisSelecionados(prev => [...prev, {
          id: matOriginal.id,
          nome: matOriginal.nome,
          cor: matOriginal.cor,
          tipo: matOriginal.tipo,
          quantidade: 0,
          precoKgCentavos: Math.round((matOriginal.precoCentavos / matOriginal.pesoGramas) * 1000)
        }]);
      } else if (id === "personalizado") {
        setMateriaisSelecionados(prev => [...prev, {
          id: "personalizado-" + crypto.randomUUID(),
          nome: "Personalizado",
          cor: "#94a3b8",
          tipo: "FDM",
          quantidade: 0,
          precoKgCentavos: 12000
        }]);
      }
    }
  };

  const atualizarQuantidade = (id: string, qtd: number) => {
    setMateriaisSelecionados(prev => prev.map(m => m.id === id ? { ...m, quantidade: qtd } : m));
  };

  const atualizarPrecoPersonalizado = (id: string, precoKg: number) => {
    setMateriaisSelecionados(prev => prev.map(m => m.id === id ? { ...m, precoKgCentavos: Math.round(precoKg * 100) } : m));
  };

  const removerMaterial = (id: string) => {
    setMateriaisSelecionados(prev => prev.filter(m => m.id !== id));
  };

  const alternarInsumo = (insumo: any) => {
    const existe = insumosSelecionados.find(i => i.id === insumo.id);
    if (existe) {
      setInsumosSelecionados(prev => prev.filter(i => i.id !== insumo.id));
    } else {
      setInsumosSelecionados(prev => [...prev, {
        id: insumo.id,
        nome: insumo.nome,
        custoCentavos: insumo.custoMedioUnidade
      }]);
    }
  };

  const elementoAcaoCalculadora = useMemo(() => (
    <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
      <div className="relative">
        <button 
          onClick={() => setAbertoSeletor(!abertoSeletor)}
          className={`flex items-center gap-3 px-4 h-11 rounded-xl transition-all duration-300 group
            ${abertoSeletor ? "bg-white dark:bg-white/10 shadow-md" : "hover:bg-white/40 dark:hover:bg-white/5"}
          `}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
              {impressoraSelecionada?.nome || "Selecionar..."}
            </span>
            {impressoraSelecionada && (
              <span className="text-[7px] font-bold text-zinc-400 uppercase opacity-60">
                {impressoraSelecionada.marca} {impressoraSelecionada.modeloBase}
              </span>
            )}
          </div>
          <ChevronDown size={14} className={`text-zinc-400 group-hover:text-sky-500 transition-transform ${abertoSeletor ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {abertoSeletor && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/10 shadow-2xl z-[100] min-w-[200px]"
            >
              <div className="space-y-1">
                {impressoras.map((imp) => (
                  <button 
                    key={imp.id}
                    onClick={() => {
                      setImpressoraSelecionadaId(imp.id);
                      localStorage.setItem("printlog_ultima_impressora", imp.id);
                      setAbertoSeletor(false);
                      if (imp.potenciaWatts) setPotencia(imp.potenciaWatts);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group
                      ${impressoraSelecionadaId === imp.id ? "bg-sky-500/10 text-sky-500" : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-zinc-400"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${imp.status === 'manutencao' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <div className="flex flex-col items-start leading-tight text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest">{imp.nome}</span>
                        <span className="text-[7px] font-bold uppercase opacity-50">{imp.marca} {imp.modeloBase}</span>
                      </div>
                    </div>
                    {impressoraSelecionadaId === imp.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={() => setModalConfigAberto(true)} className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white dark:hover:bg-white/10 text-zinc-400 hover:text-amber-500 transition-all active:scale-95">
        <Settings size={18} />
      </button>
    </div>
  ), [abertoSeletor, impressoraSelecionadaId, impressoras, impressoraSelecionada]);

  usarDefinirCabecalho({ titulo: "Precificação Inteligente", subtitulo: "Engenharia de custos e rentabilidade", ocultarBusca: true, elementoAcao: elementoAcaoCalculadora });


  const calculo = useMemo(() => {
    const custoMaterialTotalCentavos = materiaisSelecionados.reduce((acc, m) => acc + (m.quantidade / 1000) * m.precoKgCentavos, 0);
    const custoInsumosDinamicosCentavos = insumosSelecionados.reduce((acc, i) => acc + i.custoCentavos, 0);
    
    // Novos custos
    const horasDecimais = tempo / 60;
    const custoEnergiaCentavos = Math.round((potencia / 1000) * horasDecimais * precoKwh * 100);
    const custoMaoDeObraCentavos = Math.round(horasDecimais * maoDeObra * 100);
    const custoDepreciacaoCentavos = Math.round(horasDecimais * depreciacaoHora * 100);
    const custoPosProcessoCentavos = itensPosProcesso.reduce((t, i) => t + (i.valor * 100), 0);
    const custoInsumosFixosCentavos = Math.round(insumos * 100);
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
    const taxaMktPercentual = (perfisMarketplace.find((p: any) => p.nome === perfilAtivo)?.taxa || 0) / 100;
    const taxaFixaVendaCentavos = Math.round((perfisMarketplace.find((p: any) => p.nome === perfilAtivo)?.fixa || 0) * 100);
    const impostoPercentual = (impostos + icms + iss + ipi) / 100;

    // Markup sobre o custo (O padrão mais esperado na comunidade Maker: Custo + X%)
    const lucroDesejadoCentavos = Math.round(custoProducaoTotalCentavos * margemPercentual);
    
    // Preço antes de incluir perdas com impostos ou taxas do marketplace que comem o preço final
    const precoBaseVendaCentavos = custoProducaoTotalCentavos + lucroDesejadoCentavos + custoFreteCentavos + taxaFixaVendaCentavos;

    const custoTotalVariavelCentavos = 
      custoMaterialTotalCentavos + 
      custoEnergiaCentavos + 
      custoDepreciacaoCentavos + 
      custoPosProcessoCentavos + 
      custoInsumosDinamicosCentavos + 
      custoInsumosFixosCentavos;

    // As taxas de MKT e Imposto incidem sobre o preço de venda, então precisam ser divisoras
    const denominadorTaxas = 1 - taxaMktPercentual - impostoPercentual;

    const precoSugeridoCentavos = denominadorTaxas > 0.05 
      ? Math.round(precoBaseVendaCentavos / denominadorTaxas)
      : Math.round(precoBaseVendaCentavos * 1.5); // Fallback caso as taxas formem 100%

    const taxaMktTotalCentavos = Math.round(precoSugeridoCentavos * taxaMktPercentual + taxaFixaVendaCentavos);
    const impostoTotalCentavos = Math.round(precoSugeridoCentavos * impostoPercentual);
    
    // Lucro Líquido Real depois de pagar tudo
    const lucroLiquidoCentavos = precoSugeridoCentavos - taxaMktTotalCentavos - impostoTotalCentavos - custoFreteCentavos - custoTotalVariavelCentavos - custoMaoDeObraCentavos;

    const margemRealSobreVenda = precoSugeridoCentavos > 0 
      ? (lucroLiquidoCentavos / precoSugeridoCentavos) * 100 
      : 0;


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
      // Margem real padrão BR (Margem de Contribuição): Lucro / Preço de Venda
      margemReal: margemRealSobreVenda
    };
  }, [materiaisSelecionados, insumosSelecionados, tempo, potencia, precoKwh, margem, maoDeObra, depreciacaoHora, itensPosProcesso, insumos, frete, perfilAtivo, perfisMarketplace, impostos, icms, iss, ipi]);

  const materiaisFiltrados = useMemo(() => materiais.filter(m => m.nome.toLowerCase().includes(buscaMaterial.toLowerCase())), [materiais, buscaMaterial]);
  
  const salvarComoProjeto = async () => {
    try {
      const descricaoPadrao = materiaisSelecionados.length > 0 
        ? `Impressão: ${materiaisSelecionados.map(m => m.nome).join(", ")}`
        : "Novo Projeto (via Calculadora)";

      const novoPedido = await criarPedido({
        idCliente: "ORCAMENTO_DIRETO",
        descricao: descricaoPadrao,
        valorCentavos: calculo.precoSugerido,
        material: materiaisSelecionados.map(m => m.nome).join(", "),
        pesoGramas: materiaisSelecionados.reduce((acc, m) => acc + m.quantidade, 0),
        tempoMinutos: tempo,
        idImpressora: impressoraSelecionadaId || undefined,
        observacoes: `Gerado via calculadora em ${new Date().toLocaleDateString('pt-BR')}.`
      });

      if (novoPedido) {
        toast.success("Orçamento salvo como projeto!");
        navigate("/producao/projetos");
      }
    } catch (erro) {
      console.error("Erro ao salvar projeto:", erro);
    }
  };
  
  const insumosFiltrados = useMemo(() => {
    return insumosEstoque.filter(i => 
      (i.categoria === "Embalagem" || i.categoria === "Geral") &&
      i.nome.toLowerCase().includes(buscaInsumo.toLowerCase())
    );
  }, [insumosEstoque, buscaInsumo]);
  
  const materiaisModalFiltrados = useMemo(() => materiais.filter(m => m.nome.toLowerCase().includes(buscaModalArmazem.toLowerCase())), [materiais, buscaModalArmazem]);
  
  const insumosModalFiltrados = useMemo(() => insumosEstoque.filter(i => 
    i.nome.toLowerCase().includes(buscaModalInsumos.toLowerCase())
  ), [insumosEstoque, buscaModalInsumos]);

  return (
    <div className="absolute inset-0 grid grid-cols-1 xl:grid-cols-12 gap-8 overflow-hidden overscroll-none px-6 md:px-12">
      <div className="xl:col-span-8 space-y-6 h-full overflow-y-auto pt-6 xl:pt-8 pb-20 scrollbar-hide">
        
        {/* 1. MATERIAIS */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-50 dark:border-white/5">
            <div className="flex items-center gap-3">
              <Layers size={18} className="text-sky-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Materiais e Consumo</h3>
            </div>
            
            <div className="relative group">
              <input 
                type="text"
                placeholder="Buscar material..."
                value={buscaMaterial}
                onChange={(e) => setBuscaMaterial(e.target.value)}
                className="w-full md:w-64 h-9 pl-9 pr-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-sky-500/30 outline-none text-[10px] font-bold uppercase tracking-widest transition-all"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Box className="w-3 h-3 text-sky-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Seu Inventário</span>
              </div>
              <button 
                onClick={() => setModalArmazemAberto(true)}
                className="text-[9px] font-black uppercase text-sky-500 hover:text-sky-400 transition-colors flex items-center gap-1 group"
              >
                Gerenciar Armazém <RefreshCcw className="w-2 h-2 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 min-h-[110px] items-stretch">
              {materiaisFiltrados.length > 0 ? (
                <>
                  {materiaisFiltrados.map((m) => {
                    const selecionado = materiaisSelecionados.some(s => s.id === m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => alternarMaterial(m.id)}
                        className={`flex-shrink-0 min-w-[180px] p-3 rounded-2xl border-2 transition-all text-left relative group flex items-center gap-3
                          ${selecionado 
                            ? "border-sky-500 bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.15)]" 
                            : "border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:border-sky-500/30"}
                        `}
                      >
                        <div className="shrink-0">
                          {m.tipo === "FDM" ? (
                            <Carretel cor={m.cor} tamanho={36} className="-ml-1" />
                          ) : (
                            <GarrafaResina cor={m.cor} tamanho={36} className="-ml-1" />
                          )}
                        </div>
                        
                        <div className="flex-1 overflow-hidden">
                          <h4 className="text-[10px] font-black uppercase truncate leading-tight">{m.nome}</h4>
                          <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5 whitespace-nowrap">
                            {m.tipo} • {centavosParaReais(Math.round((m.precoCentavos / m.pesoGramas) * 1000))}/kg
                          </p>
                        </div>

                        {selecionado && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-white animate-in zoom-in duration-300 shadow-lg">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => acoesMateriais.abrirEditar(null as unknown as any)}
                    className="flex-shrink-0 w-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase opacity-50 group-hover:opacity-100">Novo</span>
                  </button>
                </>
              ) : (
                [
                  { id: 'ex1', nome: 'PLA Silk', tipo: 'FDM', cor: '#3b82f6', preco: 12000 },
                  { id: 'ex2', nome: 'Resina 4K', tipo: 'SLA', cor: '#a855f7', preco: 28000 },
                  { id: 'ex3', nome: 'PETG Carbon', tipo: 'FDM', cor: '#10b981', preco: 16500 }
                ].map(ex => (
                  <div key={ex.id} className="flex-shrink-0 w-36 p-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/5 opacity-40 grayscale flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="w-7 h-7 rounded-lg" style={{ backgroundColor: ex.cor }} />
                      <span className="text-[7px] font-black bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded uppercase">Exemplo</span>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-[10px] font-black uppercase truncate leading-tight">{ex.nome}</h4>
                      <p className="text-[8px] font-bold uppercase mt-0.5">{ex.tipo} • Sugerido</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {materiaisSelecionados.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="py-12 border-2 border-dashed border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-transparent rounded-2xl flex flex-col items-center justify-center gap-3"
                >
                  <Box size={24} className="text-gray-400 dark:text-zinc-600 opacity-40" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-sky-500/80 dark:text-sky-400/80">Selecione os materiais acima para calcular</p>
                </motion.div>
              ) : (
                materiaisSelecionados.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 rounded-2xl bg-gray-50/50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 flex flex-wrap md:flex-nowrap items-center gap-6 group"
                  >
                    <div className="flex items-center gap-4 min-w-[180px]">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.cor }}>
                        <Box size={18} className="text-white/80" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-tight">{item.nome}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">{item.tipo}</span>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Quantidade ({item.tipo === "FDM" ? "g" : "ml"})</label>
                        <input type="number" value={item.quantidade || ""} onChange={(e) => atualizarQuantidade(item.id, Number(e.target.value))} className="w-full h-10 px-3 rounded-lg bg-white dark:bg-black/40 border-transparent focus:border-sky-500/30 outline-none font-black text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Preço/Kg</label>
                        <input type="number" value={item.precoKgCentavos / 100} onChange={(e) => atualizarPrecoPersonalizado(item.id, Number(e.target.value))} className="w-full h-10 px-3 rounded-lg bg-white dark:bg-black/40 border-transparent focus:border-sky-500/30 outline-none font-black text-xs" />
                      </div>
                    </div>
                    <button onClick={() => removerMaterial(item.id)} className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 2. PRODUÇÃO E G-CODE */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
            <Zap size={18} className="text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-widest">Produção</h3>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col justify-between h-full gap-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Horas</label>
                  <input type="number" placeholder="0" value={Math.floor(tempo / 60) || ""} onChange={(e) => setTempo(Number(e.target.value) * 60 + (tempo % 60))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Minutos</label>
                  <input type="number" placeholder="0" value={tempo % 60 || ""} onChange={(e) => setTempo(Math.floor(tempo / 60) * 60 + Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-auto">
                {/* CUSTO ENERGIA CALCULADO */}
                <div className="flex flex-col group">
                  <div className="flex items-end justify-between min-h-[32px] pb-1.5">
                    <label className="block text-[10px] font-black uppercase text-gray-400">Energia (R$)</label>
                    <div className="px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-[9px] font-black text-orange-500 uppercase flex items-center">
                      <input 
                        type="number" 
                        value={potencia || ""} 
                        onChange={(e) => setPotencia(Number(e.target.value))}
                        className="bg-transparent outline-none text-right placeholder:text-orange-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ width: `${Math.max(String(potencia || "").length, 1)}ch` }}
                        placeholder="0"
                      />
                      <span>W Ativos</span>
                    </div>
                  </div>
                  <div className="w-full h-[48px] px-4 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center border border-transparent group-hover:border-orange-500/30 transition-all shrink-0">
                    <span className="text-gray-400 font-black text-xs mr-2">R$</span>
                    <span className="font-black text-sm text-gray-900 dark:text-white">
                      {custoEnergiaCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="h-[18px] pt-1.5">
                    <p className="text-[8px] text-gray-500 font-medium uppercase tracking-tighter leading-none">Custo total para o tempo informado</p>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-end min-h-[32px] pb-1.5">
                    <label className="block text-[10px] font-black uppercase text-gray-400">kWh (R$)</label>
                  </div>
                  <input type="number" step="0.01" placeholder="0.95" value={precoKwh || ""} onChange={(e) => setPrecoKwh(Number(e.target.value))} className="w-full h-[48px] px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm shrink-0" />
                  <div className="h-[18px]"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between h-full gap-4">
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <label className="block text-[10px] font-black uppercase text-gray-400">Pós-Processamento</label>
                  <span className="text-xs font-black text-emerald-500">Total: {centavosParaReais(itensPosProcesso.reduce((t, i) => t + i.valor, 0) * 100)}</span>
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto scrollbar-hide flex flex-col">
                  {itensPosProcesso.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent shrink-0">
                      <span className="text-xs font-bold uppercase truncate max-w-[150px] text-gray-900 dark:text-white">{item.nome}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-900 dark:text-white">{centavosParaReais(item.valor * 100)}</span>
                        <button onClick={() => setItensPosProcesso(prev => prev.filter(i => i.id !== item.id))} className="text-rose-500 hover:scale-110 transition-transform">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {itensPosProcesso.length === 0 && (
                    <div className="flex-1 border-2 border-dashed border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-transparent rounded-2xl flex items-center justify-center min-h-[80px]">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Lixa, Primer, Pintura...</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col mt-auto shrink-0">
                <div className="min-h-[32px] pb-1.5"></div>
                <div className="flex gap-2 shrink-0">
                  <input type="text" placeholder="Item..." value={novoItemPosNome} onChange={(e) => setNovoItemPosNome(e.target.value)} className="flex-1 h-[48px] px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-bold text-xs uppercase text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#1a1a1f] focus:ring-1 focus:ring-sky-500" />
                  <input type="number" placeholder="R$" value={novoItemPosValor || ""} onChange={(e) => setNovoItemPosValor(Number(e.target.value))} className="w-20 h-[48px] px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-xs text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#1a1a1f] focus:ring-1 focus:ring-sky-500" />
                  <button onClick={() => { if (novoItemPosNome && novoItemPosValor > 0) { setItensPosProcesso(prev => [...prev, { id: crypto.randomUUID(), nome: novoItemPosNome, valor: novoItemPosValor }]); setNovoItemPosNome(""); setNovoItemPosValor(0); } }} className="w-[48px] h-[48px] rounded-xl bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors shrink-0">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="h-[18px]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* MOTORES OPERACIONAIS (LADO A LADO) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 3. MÃO DE OBRA */}
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
              <DollarSign size={18} className="text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Mão de Obra</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Valor da Hora (R$/h)</label>
                <input type="number" value={maoDeObra} onChange={(e) => setMaoDeObra(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-emerald-500/30 outline-none font-black text-sm transition-all" />
              </div>
              <div className="pb-2">
                <div className="flex justify-between mb-3">
                  <label className="text-[10px] font-black uppercase text-gray-400">Margem de Lucro</label>
                  <span className="text-xs font-black text-sky-500">{margem}%</span>
                </div>
                <input type="range" min="0" max="500" step="10" value={margem} onChange={(e) => setMargem(Number(e.target.value))} className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-sky-500" />
                
                <AnimatePresence>
                  {margem >= 300 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">⚠️</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">Atenção ao Mercado</span>
                        </div>
                        <p className="text-[9px] font-bold opacity-80 leading-relaxed uppercase">
                          Markups acima de 300% podem reduzir sua conversão de vendas, a não ser que a peça seja altamente exclusiva ou sem concorrência direta.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* 4. CUSTOS INVISÍVEIS */}
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
              <Activity size={18} className="text-rose-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Custos Invisíveis</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black uppercase text-gray-400" title="Custo de desgaste da máquina por hora">Depreciação de Máquina (R$/h)</label>
                  <button 
                    onClick={() => setModalDepreciacao(!modalDepreciacao)}
                    className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all ${modalDepreciacao ? 'text-gray-400 hover:text-gray-500' : 'text-rose-500 hover:text-rose-400'}`}
                  >
                    <Calculator size={10} />
                    {modalDepreciacao ? "Ajuste Manual" : "Calcular Fiscal 20%aa"}
                  </button>
                </div>
                
                {!modalDepreciacao ? (
                  <>
                    <input type="number" placeholder="0" value={depreciacaoHora || ""} onChange={(e) => setDepreciacaoHora(Number(e.target.value))} className="w-full h-[48px] px-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-rose-500/30 outline-none font-black text-sm transition-all" />
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase text-rose-500/80 tracking-widest">Valor do Equip. (R$)</label>
                        <input type="number" value={valorEquipamento || ""} onChange={(e) => {
                          const val = Number(e.target.value);
                          setValorEquipamento(val);
                          setDepreciacaoHora(Number((val / (5 * horasUsoPorAno)).toFixed(2)));
                        }} className="w-full h-10 px-3 rounded-xl bg-white dark:bg-black/20 border border-transparent focus:border-rose-500/30 outline-none font-bold text-xs text-rose-500" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase text-rose-500/80 tracking-widest">Horas Úteis/Ano</label>
                        <input type="number" value={horasUsoPorAno || ""} onChange={(e) => {
                          const horas = Number(e.target.value);
                          setHorasUsoPorAno(horas);
                          if (horas > 0 && valorEquipamento > 0) setDepreciacaoHora(Number((valorEquipamento / (5 * horas)).toFixed(2)));
                        }} disabled={valorEquipamento <= 0} className="w-full h-10 px-3 rounded-xl bg-white dark:bg-black/20 border border-transparent focus:border-rose-500/30 outline-none font-bold text-xs text-rose-500 disabled:opacity-50" />
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-black/30 p-3 rounded-xl border border-rose-500/10 flex justify-between items-center text-rose-500">
                      <span className="text-[10px] uppercase font-black tracking-widest">Depreciação Calculada:</span>
                      <span className="text-sm font-black">R$ {depreciacaoHora ? depreciacaoHora.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0,00"}/h</span>
                    </div>
                    <p className="text-[8px] text-rose-500/60 font-bold uppercase leading-relaxed text-justify">
                      * Método Contábil (Mandu): Taxa Anual 20%, Vida Útil 5 Anos (60 Meses). Linear para zeramento do bem em tempo operacional.
                    </p>
                  </motion.div>
                )}

                <div className="flex flex-col pt-1 mt-2">
                  <div className="w-full h-[48px] px-4 rounded-xl bg-rose-50 dark:bg-rose-500/5 hover:bg-rose-100 dark:hover:bg-rose-500/10 flex items-center justify-between border border-rose-500/20 transition-all cursor-default group">
                    <div className="flex flex-col justify-center gap-0.5">
                      <span className="text-[9px] font-black uppercase text-rose-500 tracking-widest leading-none">Custo Desgaste Total</span>
                      <span className="text-[7px] font-bold text-rose-500/60 uppercase group-hover:text-rose-500/80 transition-colors leading-none">Vinculado às ({Math.floor(tempo/60)}h {tempo%60}m) informadas</span>
                    </div>
                    <span className="font-black text-sm text-rose-500">
                      R$ {((tempo / 60) * depreciacaoHora).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. INSUMOS */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-50 dark:border-white/5">
            <div className="flex items-center gap-3">
              <Box size={18} className="text-indigo-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Insumos e Embalagens</h3>
            </div>
            
            <div className="relative group">
              <input 
                type="text"
                placeholder="Buscar insumo..."
                value={buscaInsumo}
                onChange={(e) => setBuscaInsumo(e.target.value)}
                className="w-full md:w-64 h-9 pl-9 pr-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-indigo-500/30 outline-none text-[10px] font-bold uppercase tracking-widest transition-all"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Package className="w-3 h-3 text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Seu Estoque</span>
              </div>
              <button 
                onClick={() => setModalInsumosAberto(true)}
                className="text-[9px] font-black uppercase text-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-1 group"
              >
                Gerenciar Insumos <RefreshCcw className="w-2 h-2 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 min-h-[110px] items-stretch">
              {insumosFiltrados.length > 0 ? (
                <>
                  {insumosFiltrados.map((insumo) => {
                    const selecionado = insumosSelecionados.some(i => i.id === insumo.id);
                    return (
                      <button
                        key={insumo.id}
                        onClick={() => alternarInsumo(insumo)}
                        className={`flex-shrink-0 w-32 p-4 rounded-2xl border-2 transition-all text-left relative group flex flex-col justify-between
                          ${selecionado 
                            ? "bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
                            : "bg-gray-50 dark:bg-white/[0.02] border-transparent hover:border-indigo-500/30"}
                        `}
                      >
                        <div className={`p-2 rounded-lg mb-3 inline-block transition-colors ${selecionado ? "bg-indigo-500 text-white" : "bg-white dark:bg-white/5 text-zinc-400 group-hover:text-indigo-500"}`}>
                          <Box size={16} />
                        </div>
                        
                        <div>
                          <p className={`text-[10px] font-black uppercase truncate mb-1 ${selecionado ? "text-indigo-500" : "text-zinc-500"}`}>
                            {insumo.nome}
                          </p>
                          <p className="text-[11px] font-black">
                            {centavosParaReais(insumo.custoMedioUnidade)}
                          </p>
                        </div>

                        {selecionado && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-lg">
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => abrirCriarInsumo()}
                    className="flex-shrink-0 w-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase opacity-50 group-hover:opacity-100">Novo</span>
                  </button>
                </>
              ) : (
                [
                  { id: 'ex1', nome: 'Caixa P', preco: 150 },
                  { id: 'ex2', nome: 'Plástico Bolha', preco: 50 },
                  { id: 'ex3', nome: 'Saco Env.', preco: 85 }
                ].map(ex => (
                  <div key={ex.id} className="flex-shrink-0 w-32 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/5 opacity-40 grayscale flex flex-col justify-between">
                    <div className="p-2 rounded-lg bg-gray-200 dark:bg-white/10 w-fit"><Box size={16} /></div>
                    <div className="mt-3">
                      <h4 className="text-[10px] font-black uppercase truncate leading-tight">{ex.nome}</h4>
                      <p className="text-[8px] font-bold uppercase mt-0.5">Exemplo</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-gray-50 dark:border-white/5">
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Outros Custos Fixos (R$)</label>
            <input type="number" value={insumos} onChange={(e) => setInsumos(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
          </div>
        </div>

        {/* 4. LOGÍSTICA */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
            <Warehouse size={18} className="text-indigo-500" />
            <h3 className="text-xs font-black uppercase tracking-widest">Logística e Canais</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {perfisMarketplace.map((p: any) => (
              <button
                key={p.nome}
                onClick={() => {
                  setPerfilAtivo(p.nome);
                  setTaxaEcommerce(p.taxa);
                  setTaxaFixa(p.fixa);
                  if (p.imp !== undefined) setImpostos(p.imp);
                }}
                className={`px-4 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest flex flex-col items-start leading-tight
                  ${perfilAtivo === p.nome 
                    ? "bg-sky-500/10 border-sky-500 text-sky-500 shadow-sm" 
                    : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 hover:border-sky-500/30 hover:text-sky-400"}
                `}
              >
                <span>{p.nome}</span>
                <span className={`text-[7px] opacity-60 ${perfilAtivo === p.nome ? "text-sky-500" : "text-gray-400"}`}>
                  ({p.taxa}% + R$ {p.fixa})
                </span>
              </button>
            ))}
            <button onClick={() => setModalPerfisAberto(true)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 border-transparent hover:border-amber-500/30 hover:text-amber-500 transition-all"><Settings size={14} /></button>
          </div>
          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-50 dark:border-white/5">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Comissão (%)</label>
              <input type="number" value={taxaEcommerce} onChange={(e) => setTaxaEcommerce(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Taxa Fixa (R$)</label>
              <input type="number" value={taxaFixa} onChange={(e) => setTaxaFixa(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Frete (R$)</label>
              <input type="number" value={frete} onChange={(e) => setFrete(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
            </div>
          </div>
        </div>

        {/* 5. FISCAL */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
            <TrendingUp size={18} className="text-rose-500" />
            <h3 className="text-xs font-black uppercase tracking-widest">Estrutura Fiscal</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'produto', label: 'Produto', sub: 'ICMS' },
              { id: 'servico', label: 'Serviço', sub: 'ISS' },
              { id: 'industrializacao', label: 'Indústria', sub: 'IPI+ICMS' },
              { id: 'mei', label: 'MEI', sub: 'DAS' },
            ].map((op) => (
              <button
                key={op.id}
                onClick={() => {
                  setTipoOperacao(op.id as any);
                  if (op.id === 'mei') { setIcms(0); setIss(0); setIpi(0); setImpostos(0); }
                  else if (op.id === 'servico') { setIcms(0); setIpi(0); setIss(5); }
                  else if (op.id === 'produto') { setIss(0); setIpi(0); setIcms(18); }
                  else if (op.id === 'industrializacao') { setIss(0); setIcms(18); setIpi(5); }
                }}
                className={`px-4 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest flex flex-col items-start leading-tight
                  ${tipoOperacao === op.id ? "bg-rose-500/10 border-rose-500 text-rose-500" : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 hover:border-rose-500/30"}
                `}
              >
                <span>{op.label}</span>
                <span className="text-[7px] opacity-60">({op.sub})</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-50 dark:border-white/5">
            {tipoOperacao !== 'mei' && (
              <>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Base (%)</label>
                  <input type="number" value={impostos} onChange={(e) => setImpostos(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
                </div>
                {tipoOperacao !== 'servico' && (
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">ICMS (%)</label>
                    <input type="number" value={icms} onChange={(e) => setIcms(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
                  </div>
                )}
                {tipoOperacao === 'servico' && (
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">ISS (%)</label>
                    <input type="number" value={iss} onChange={(e) => setIss(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
                  </div>
                )}
                {tipoOperacao === 'industrializacao' && (
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">IPI (%)</label>
                    <input type="number" value={ipi} onChange={(e) => setIpi(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 outline-none font-black text-sm" />
                  </div>
                )}
              </>
            )}
            {tipoOperacao === 'mei' && (
              <div className="col-span-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-[10px] font-bold text-rose-500 uppercase">MEI: Imposto fixo mensal (DAS).</div>
            )}
          </div>
        </div>
      </div>

      {/* COLUNA RESULTADOS */}
      <div className="xl:col-span-4 h-full xl:sticky xl:top-0 flex flex-col justify-center py-8 scrollbar-hide">
        <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center text-center overflow-hidden relative h-fit w-full mx-auto animate-in fade-in duration-1000">
          <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />
          <div className="relative z-10 w-full">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-sky-400 opacity-60">Preço Sugerido</span>
            <div className="mt-5 mb-8">
              <h2 className="text-5xl font-black text-white tracking-tighter leading-none mb-2">{centavosParaReais(calculo.precoSugerido)}</h2>
              <div className="flex gap-2 justify-center">
                <div className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full inline-block">
                  <span className="text-[8px] font-black text-sky-400 uppercase tracking-widest">Markup: {margem}%</span>
                </div>
                <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full inline-block">
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Margem Real: {calculo.margemReal.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-2xl mb-8 w-full shadow-inner">
              <button onClick={() => setAbaResultado('orcamento')} className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${abaResultado === 'orcamento' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>Orçamento</button>
              <button onClick={() => setAbaResultado('metricas')} className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 ${abaResultado === 'metricas' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>Métricas 360 <PieChart size={10} /></button>
            </div>
            
            {abaResultado === 'orcamento' && (
              <div className="space-y-4 w-full text-left relative animate-in fade-in slide-in-from-right-4 duration-500">
                <AnimatePresence>
                  {[
                    { label: 'Materiais', valor: calculo.custoMaterial, icone: Box, cor: 'text-sky-400' },
                    { label: 'Energia Elétrica', valor: calculo.custoEnergia, icone: Zap, cor: 'text-amber-400' },
                    { label: 'Mão de Obra', valor: calculo.custoMaoDeObra, icone: Timer, cor: 'text-emerald-400' },
                    { label: 'Depreciação', valor: calculo.custoDepreciacao, icone: Activity, cor: 'text-rose-400' },
                    { label: 'Insumos & Extras', valor: calculo.custoInsumos + calculo.custoPosProcesso, icone: Package, cor: 'text-violet-400' },
                    { label: 'Taxas & Impostos', valor: calculo.taxaMarketplace + calculo.impostoVenda, icone: DollarSign, cor: 'text-zinc-400' },
                    { label: 'Frete/Logística', valor: Math.round(frete * 100), icone: Truck, cor: 'text-orange-400' },
                  ].filter(i => i.valor > 0).map((item) => (
                    <motion.div 
                      key={item.label}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex justify-between items-center group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-white/10 transition-colors shadow-inner">
                          <item.icone size={14} className={item.cor} />
                        </div>
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">{item.label}</span>
                      </div>
                      <span className="text-xs font-black text-white">{centavosParaReais(item.valor)}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            {abaResultado === 'metricas' && (
              <div className="space-y-6 w-full text-left animate-in fade-in slide-in-from-left-4 duration-500">
                {/* Stacked Bar de Distribuição do Preço */}
                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-4 text-sky-400">
                    <BarChart2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Distribuição do Preço Final</span>
                  </div>
                  <div className="w-full h-4 flex rounded-full overflow-hidden mb-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                    <div style={{ width: `${((calculo.custoEnergia + calculo.custoMaterial + calculo.custoInsumos + calculo.custoDepreciacao) / calculo.precoSugerido) * 100}%` }} className="bg-sky-500 h-full hover:brightness-110 transition-all"></div>
                    <div style={{ width: `${(calculo.custoMaoDeObra / calculo.precoSugerido) * 100}%` }} className="bg-emerald-600 h-full hover:brightness-110 transition-all border-l border-black/20"></div>
                    <div style={{ width: `${((calculo.taxaMarketplace + calculo.impostoVenda) / calculo.precoSugerido) * 100}%` }} className="bg-zinc-600 h-full hover:brightness-110 transition-all border-l border-black/20"></div>
                    <div style={{ width: `${(calculo.lucroLiquido / calculo.precoSugerido) * 100}%` }} className="bg-emerald-400 h-full hover:brightness-110 transition-all shadow-[0_0_10px_rgba(52,211,153,0.5)] border-l border-black/20"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 px-1">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                        <span className="text-[8px] font-black uppercase text-zinc-400">Produção Base</span>
                      </div>
                      <span className="text-[9px] font-black text-sky-500/80">{((calculo.custoEnergia + calculo.custoMaterial + calculo.custoInsumos + calculo.custoDepreciacao) / calculo.precoSugerido * 100).toFixed(0)}%</span>
                    </div>

                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                        <span className="text-[8px] font-black uppercase text-zinc-400">Trabalho (Obra)</span>
                      </div>
                      <span className="text-[9px] font-black text-emerald-600/80">{(calculo.custoMaoDeObra / calculo.precoSugerido * 100).toFixed(0)}%</span>
                    </div>

                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                        <span className="text-[8px] font-black uppercase text-zinc-400">Taxas / Sistema</span>
                      </div>
                      <span className="text-[9px] font-black text-zinc-400/80">{((calculo.taxaMarketplace + calculo.impostoVenda) / calculo.precoSugerido * 100).toFixed(0)}%</span>
                    </div>

                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 focus-within:shadow-lg"></div>
                        <span className="text-[8px] font-black uppercase text-emerald-400">Lucro Líquido</span>
                      </div>
                      <span className="text-[9px] font-black text-emerald-400">{calculo.margemReal.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="h-px bg-zinc-800/50 my-8 w-full" />

            <div className="flex items-center justify-between p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 w-full">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-emerald-500 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Lucro Líquido Final</span>
                </div>
                <div className="flex flex-col ml-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">Rentabilidade:</span>
                    <span className="text-[9px] font-black text-emerald-500/80">{calculo.margemReal.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">Custo de Fabr.:</span>
                    <span className="text-[9px] font-black text-zinc-400">{centavosParaReais(calculo.custoTotalOperacional)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-500 block tracking-tighter leading-none">
                  {centavosParaReais(calculo.lucroLiquido)}
                </span>
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1 block">Saldo Livre</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full">
              <button 
                onClick={salvarComoProjeto}
                className="h-14 font-black uppercase tracking-[0.1em] text-[11px] rounded-2xl flex flex-col items-center justify-center gap-1 bg-sky-500 text-white hover:bg-sky-600 transition-all active:scale-95 shadow-[0_10px_20px_-5px_rgba(14,165,233,0.3)] disabled:opacity-20 disabled:shadow-none"
                disabled={calculo.precoSugerido <= 0}
              >
                <div className="flex items-center gap-2">
                  <FolderKanban size={14} />
                  <span>Salvar Projeto</span>
                </div>
                <span className="text-[7px] opacity-60">Enviar para o Kanban</span>
              </button>

              <button 
                onClick={() => { 
                  setGerandoPdf(true);
                  setTimeout(() => {
                    window.print();
                    setGerandoPdf(false);
                    toast.success("Orçamento gerado para impressão!");
                  }, 500);
                }} 
                className="h-14 font-black uppercase tracking-[0.1em] text-[11px] rounded-2xl flex flex-col items-center justify-center gap-1 bg-white dark:bg-zinc-800 text-black dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all active:scale-95 shadow-sm disabled:opacity-20" 
                disabled={!impressoraSelecionadaId || gerandoPdf}
              >
                <div className="flex items-center gap-2">
                  {gerandoPdf ? <Activity className="animate-spin" size={14} /> : <Download size={14} strokeWidth={3} />}
                  <span>{gerandoPdf ? "Processando..." : "Gerar PDF"}</span>
                </div>
                <span className="text-[7px] opacity-50 lowercase italic">Imprimir orçamento</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalListagemPremium 
        aberto={modalArmazemAberto} 
        aoFechar={() => setModalArmazemAberto(false)} 
        titulo="Armazém de Materiais" 
        iconeTitulo={Warehouse} 
        corDestaque="sky" 
        termoBusca={buscaModalArmazem} 
        aoMudarBusca={setBuscaModalArmazem}
        temResultados={materiaisModalFiltrados.length > 0}
        totalResultados={materiaisModalFiltrados.length}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiaisModalFiltrados.map((m) => (
            <button key={m.id} onClick={() => alternarMaterial(m.id)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${materiaisSelecionados.some(s => s.id === m.id) ? "border-sky-500 bg-sky-500/5" : "border-gray-50 dark:border-white/5 bg-gray-50/50 hover:border-sky-500/30"}`}>
              {m.tipo === "FDM" ? <Carretel cor={m.cor} tamanho={48} /> : <GarrafaResina cor={m.cor} tamanho={48} />}
              <div className="flex-1 overflow-hidden">
                <h4 className="text-[11px] font-black uppercase truncate">{m.nome}</h4>
                <p className="text-[8px] font-bold text-gray-400 uppercase">{centavosParaReais(Math.round((m.precoCentavos / m.pesoGramas) * 1000))}/kg</p>
              </div>
            </button>
          ))}
        </div>
      </ModalListagemPremium>

      <ModalListagemPremium 
        aberto={modalInsumosAberto} 
        aoFechar={() => setModalInsumosAberto(false)} 
        titulo="Estoque de Insumos" 
        iconeTitulo={Package} 
        corDestaque="indigo" 
        termoBusca={buscaModalInsumos} 
        aoMudarBusca={setBuscaModalInsumos}
        temResultados={insumosModalFiltrados.length > 0}
        totalResultados={insumosModalFiltrados.length}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insumosModalFiltrados.map((i) => {
            const selecionado = insumosSelecionados.some(s => s.id === i.id);
            return (
              <button key={i.id} onClick={() => alternarInsumo(i)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group ${selecionado ? "border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/5" : "border-gray-50 dark:border-white/5 bg-gray-50/50 hover:border-indigo-500/30"}`}>
                <div className={`p-2 rounded-lg transition-colors ${selecionado ? "bg-indigo-500 text-white" : "bg-white dark:bg-white/5 text-zinc-400 group-hover:text-indigo-500"}`}><Box size={24} /></div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-[11px] font-black uppercase truncate">{i.nome}</h4>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">{centavosParaReais(i.custoMedioUnidade)}/un</p>
                </div>
                {selecionado && <Check size={16} className="text-indigo-500" />}
              </button>
            );
          })}
        </div>
      </ModalListagemPremium>

      <FormularioMaterial aberto={estadoMateriais.modalAberto} aoSalvar={acoesMateriais.salvarMaterial} aoCancelar={acoesMateriais.fecharEditar} materialEditando={estadoMateriais.materialSendoEditado} />
      
      <Dialogo aberto={modalConfigAberto} aoFechar={() => setModalConfigAberto(false)} larguraMax="max-w-xl" esconderCabecalho={true}>
        <div className="p-10 space-y-10 bg-white dark:bg-zinc-900 rounded-[2.5rem] relative">
          {/* Botão de Fechar Customizado */}
          <button 
            onClick={() => setModalConfigAberto(false)}
            className="absolute top-8 right-8 p-2 rounded-xl text-gray-400 hover:text-zinc-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95"
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
              <Settings size={32} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">OPERACIONAL</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.15em]">Motores base de custeio</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 pt-10 border-t border-gray-100 dark:border-white/5">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-amber-500" />
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">ENERGIA (R$/KWH)</label>
                </div>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400 group-focus-within:text-amber-500 transition-colors">R$</span>
                  <input 
                    type="number" 
                    value={precoKwh} 
                    onChange={(e) => setPrecoKwh(Number(e.target.value))} 
                    className="w-full h-16 pl-14 pr-4 rounded-[1.25rem] bg-gray-50 dark:bg-white/[0.03] border border-transparent focus:border-amber-500/30 outline-none font-black text-lg transition-all" 
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Cpu size={14} className="text-zinc-500" />
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">MÁQUINA (R$/H)</label>
                </div>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400 group-focus-within:text-zinc-500 transition-colors">R$</span>
                  <input 
                    type="number" 
                    value={depreciacaoHora} 
                    onChange={(e) => setDepreciacaoHora(Number(e.target.value))} 
                    className="w-full h-16 pl-14 pr-4 rounded-[1.25rem] bg-gray-50 dark:bg-white/[0.03] border border-transparent focus:border-zinc-500/30 outline-none font-black text-lg transition-all" 
                    step="0.10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Timer size={14} className="text-indigo-500" />
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">OPERADOR (R$/H)</label>
                </div>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400 group-focus-within:text-indigo-500 transition-colors">R$</span>
                  <input 
                    type="number" 
                    value={maoDeObra} 
                    onChange={(e) => setMaoDeObra(Number(e.target.value))} 
                    className="w-full h-16 pl-14 pr-4 rounded-[1.25rem] bg-gray-50 dark:bg-white/[0.03] border border-transparent focus:border-indigo-500/30 outline-none font-black text-lg transition-all" 
                    step="1.00"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} className="text-emerald-500" />
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">MARGEM (%)</label>
                </div>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400 group-focus-within:text-emerald-500 transition-colors">%</span>
                  <input 
                    type="number" 
                    value={margem} 
                    onChange={(e) => setMargem(Number(e.target.value))} 
                    className="w-full h-16 pl-14 pr-4 rounded-[1.25rem] bg-gray-50 dark:bg-white/[0.03] border border-transparent focus:border-emerald-500/30 outline-none font-black text-lg transition-all" 
                    step="5"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-amber-500/[0.03] border border-amber-500/10 flex items-start gap-4">
            <Settings size={18} className="text-amber-500 shrink-0 mt-1" />
            <p className="text-[9px] font-bold text-amber-600/60 leading-relaxed uppercase tracking-[0.1em]">
              Estes índices são aplicados de forma global no estúdio, servindo como base matriz de cálculo financeiro e execução contratual (Art. 7º, V).
            </p>
          </div>

          <button 
            onClick={async () => { 
                config.definirCustoEnergia(formatarMoedaFinancas(precoKwh, 2));
                config.definirHoraOperador(formatarMoedaFinancas(maoDeObra, 2));
                config.definirHoraMaquina(formatarMoedaFinancas(depreciacaoHora, 3)); // Suporte a mais precisão
                config.definirMargemLucro(formatarPorcentagem(String(margem * 100)));
              
              if (usuario?.uid) {
                await config.salvarNoD1(usuario.uid);
              }

              setModalConfigAberto(false); 
              toast.success("Motores operacionais sincronizados!"); 
            }} 
            className="w-full h-20 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-[1.5rem] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-zinc-500/20"
          >
            Sincronizar Indices
          </button>
        </div>
      </Dialogo>

      <Dialogo aberto={modalPerfisAberto} aoFechar={() => setModalPerfisAberto(false)} titulo="Configurar Canais" larguraMax="max-w-3xl">
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_80px_80px_80px_80px_40px] gap-2 px-2 text-[8px] font-black uppercase text-zinc-500">
              <span>Nome</span>
              <span className="text-center">Comiss (%)</span>
              <span className="text-center">Taxa R$</span>
              <span className="text-center">Ins R$</span>
              <span className="text-center">Imp %</span>
              <span />
            </div>
            {perfisMarketplace.map((p: any, idx: number) => (
              <div key={idx} className="grid grid-cols-[1fr_80px_80px_80px_80px_40px] gap-2 items-center">
                <input type="text" value={p.nome} onChange={(e) => { const n = [...perfisMarketplace]; n[idx].nome = e.target.value; setPerfisMarketplace(n); }} className="w-full h-10 px-3 rounded-xl bg-white dark:bg-white/5 outline-none font-black text-[10px] uppercase border border-transparent focus:border-sky-500/30" />
                <input type="number" value={p.taxa} onChange={(e) => { const n = [...perfisMarketplace]; n[idx].taxa = Number(e.target.value); setPerfisMarketplace(n); }} className="w-full h-10 rounded-xl bg-white dark:bg-white/5 outline-none font-bold text-center text-xs border border-transparent focus:border-sky-500/30" />
                <input type="number" value={p.fixa} onChange={(e) => { const n = [...perfisMarketplace]; n[idx].fixa = Number(e.target.value); setPerfisMarketplace(n); }} className="w-full h-10 rounded-xl bg-white dark:bg-white/5 outline-none font-bold text-center text-xs border border-transparent focus:border-sky-500/30" />
                <input type="number" value={p.ins} onChange={(e) => { const n = [...perfisMarketplace]; n[idx].ins = Number(e.target.value); setPerfisMarketplace(n); }} className="w-full h-10 rounded-xl bg-white dark:bg-white/5 outline-none font-bold text-center text-xs border border-transparent focus:border-sky-500/30" />
                <input type="number" value={p.imp || 6} onChange={(e) => { const n = [...perfisMarketplace]; n[idx].imp = Number(e.target.value); setPerfisMarketplace(n); }} className="w-full h-10 rounded-xl bg-white dark:bg-white/5 outline-none font-bold text-center text-xs border border-transparent focus:border-sky-500/30" />
                <button onClick={() => setPerfisMarketplace(perfisMarketplace.filter((_:any, i:number) => i !== idx))} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500"><Trash2 size={16} /></button>
              </div>
            ))}
            <button onClick={() => setPerfisMarketplace([...perfisMarketplace, { nome: "NOVO", taxa: 0, fixa: 0, ins: 0, imp: 6 }])} className="w-full py-4 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase text-zinc-500 hover:text-sky-500 hover:bg-sky-500/5 transition-all flex items-center justify-center gap-2">
              <Plus size={16} /> Adicionar Novo Perfil
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModalPerfisAberto(false)} className="flex-1 h-12 bg-gray-100 dark:bg-white/5 text-zinc-500 font-black uppercase text-[10px] rounded-xl">Cancelar</button>
            <button onClick={() => { localStorage.setItem("printlog_perfis_marketplace", JSON.stringify(perfisMarketplace)); setModalPerfisAberto(false); toast.success("Perfis salvos!"); }} className="flex-[2] h-12 bg-sky-500 hover:bg-sky-400 text-black font-black uppercase text-[10px] rounded-xl shadow-lg">Salvar Perfis</button>
          </div>
        </div>
      </Dialogo>
      
      <Dialogo aberto={modalComparativoAberto} aoFechar={() => setModalComparativoAberto(false)} titulo="Comparativo de Canais">
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Projeção de rentabilidade baseada no custo de produção atual</p>
          <div className="grid grid-cols-1 gap-3">
            {perfisMarketplace.map((perfil: any) => {
              const custoBase = calculo.custoMaterial + calculo.custoEnergia + calculo.custoMaoDeObra + calculo.custoDepreciacao + calculo.custoPosProcesso + calculo.custoInsumos;
              const impostoTotal = (impostos + icms + iss + ipi) / 100;
              const den = 1 - (margem / 100) - (perfil.taxa / 100) - impostoTotal;
              const pVenda = den > 0 ? (custoBase + (perfil.fixa * 100) + (frete * 100)) / den : custoBase * 2;
              const lucro = pVenda - (custoBase + (pVenda * (perfil.taxa / 100)) + (perfil.fixa * 100) + (frete * 100) + (pVenda * impostoTotal));
              
              return (
                <div key={perfil.nome} className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-sky-500/30 transition-all flex items-center justify-between group">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-widest mb-1">{perfil.nome}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Comissão: {perfil.taxa}% + R$ {perfil.fixa}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Lucro Estimado</p>
                    <p className="text-lg font-black text-emerald-500">{centavosParaReais(Math.round(lucro))}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Dialogo>

      <FormularioInsumo aberto={modalInsumoAberto} aoCancelar={fecharInsumoAberto} insumoEditando={insumoEditando} aoSalvar={(dados) => adicionarOuAtualizarInsumo({ ...dados, id: dados.id || crypto.randomUUID(), dataCriacao: dados.dataCriacao || new Date(), dataAtualizacao: new Date(), historico: dados.historico || [] } as any)} />
    </div>
  );
}
