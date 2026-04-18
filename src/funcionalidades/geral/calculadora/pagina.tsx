import {
  Calculator,
  Zap,
  Scale,
  Timer,
  DollarSign,
  TrendingUp,
  RefreshCcw,
  Cpu,
  Layers,
  ChevronDown,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useState, useMemo, useEffect } from "react";
import { calcularCustoImpressao } from "@/compartilhado/utilitarios/calculosFinanceiros";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { usarAnalisadorGCode } from "@/compartilhado/hooks/usarAnalisadorGCode";
import { motion, AnimatePresence } from "framer-motion";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { useShallow } from "zustand/react/shallow";
import { usarGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/usarGerenciadorImpressoras";

export function PaginaCalculadora() {
  // Estados do Formulário (Valores em Reais para facilitar input, convertidos depois)
  const [peso, setPeso] = useState<number>(0);
  const [tempo, setTempo] = useState<number>(0);
  const [precoFilamento, setPrecoFilamento] = useState<number>(120); // R$ 120/kg padrão
  const [potencia, setPotencia] = useState<number>(150); // 150W média
  const [precoKwh, setPrecoKwh] = useState<number>(0.85); // R$ 0.85/kWh média
  const [maoDeObra, setMaoDeObra] = useState<number>(25); // R$ 25/hora
  const [margem, setMargem] = useState<number>(100); // 100% de lucro padrão
  
  // Estados Comerciais
  const [taxaEcommerce, setTaxaEcommerce] = useState<number>(18); // 18% padrão
  const [taxaFixa, setTaxaFixa] = useState<number>(3); // R$ 3,00 padrão
  const [frete, setFrete] = useState<number>(0);
  const [insumos, setInsumos] = useState<number>(5.50); // Caixa + Plástico bolha
  const [materialSelecionadoId, setMaterialSelecionadoId] = useState<string>("");
  const [impressoraSelecionadaId, setImpressoraSelecionadaId] = useState<string>("");
  const [abertoSeletor, setAbertoSeletor] = useState(false);

  const { materiais } = usarArmazemMateriais(useShallow(s => ({ materiais: s.materiais })));
  const { estado: { impressoras = [] } = {} } = usarGerenciadorImpressoras();

  const { resultado, analisarArquivo, erro: erroAnalise } = usarAnalisadorGCode();

  const elementoAcaoCalculadora = useMemo(() => (
    <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
      {/* Seletor Customizado de Impressora */}
      <div className="relative">
        <button
          onClick={() => setAbertoSeletor(!abertoSeletor)}
          className={`flex items-center gap-3 px-4 h-11 rounded-xl transition-all duration-300 group
            ${abertoSeletor 
              ? "bg-white dark:bg-white/10 shadow-md" 
              : "hover:bg-white/40 dark:hover:bg-white/5"}
          `}
        >
          <div className={`p-1.5 rounded-lg transition-colors ${abertoSeletor ? "bg-sky-500 text-white" : "bg-sky-500/10 text-sky-500"}`}>
            <Cpu size={14} />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-sky-500 transition-colors">Equipamento</span>
            <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">
              {impressoras.find(i => i.id === impressoraSelecionadaId)?.nome || "Selecionar..."}
            </span>
          </div>
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${abertoSeletor ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {abertoSeletor && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 15, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#121214]/95 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden z-[100]"
            >
              <div className="p-2 space-y-1">
                <div className="px-3 py-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Suas Impressoras</span>
                </div>
                {impressoras.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase">Nenhuma máquina encontrada</p>
                  </div>
                ) : (
                  impressoras.map(imp => (
                    <button
                      key={imp.id}
                      onClick={() => {
                        setImpressoraSelecionadaId(imp.id);
                        setAbertoSeletor(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group
                        ${impressoraSelecionadaId === imp.id 
                          ? "bg-sky-500/10 text-sky-500" 
                          : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-zinc-400"}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${imp.status === 'manutencao' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{imp.nome}</span>
                      </div>
                      {impressoraSelecionadaId === imp.id && (
                        <Check size={14} className="animate-in zoom-in duration-300" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divisor Visual */}
      <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />

      {/* Botão G-Code Rápido */}
      <label className="flex items-center gap-3 px-4 h-11 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer group">
        <div className="p-1.5 rounded-lg bg-zinc-500/10 text-zinc-500 group-hover:bg-sky-500 group-hover:text-white transition-all">
          <Layers size={14} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">G-Code</span>
        <input
          type="file"
          accept=".gcode"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) analisarArquivo(file);
          }}
        />
      </label>
    </div>
  ), [abertoSeletor, impressoraSelecionadaId, impressoras, analisarArquivo]);

  usarDefinirCabecalho({
    titulo: "Calculadora Pro",
    subtitulo: "Engenharia de custos para estúdios 3D",
    ocultarBusca: true,
    ocultarNotificacoes: true,
    elementoAcao: elementoAcaoCalculadora
  });

  // Feedback visual e auto-preenchimento
  useEffect(() => {
    if (resultado) {
      setPeso(resultado.pesoEstimadoGramas);
      setTempo(resultado.tempoEstimadoMinutos);
      toast.success(`Parâmetros importados: ${resultado.fatiadorDetectado}`, {
        icon: '🚀',
        style: {
          borderRadius: '12px',
          background: '#121214',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      });
    }
  }, [resultado]);

  useEffect(() => {
    if (erroAnalise) {
      toast.error(erroAnalise, {
        style: {
          borderRadius: '12px',
          background: '#121214',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      });
    }
  }, [erroAnalise]);

  const calculo = useMemo(() => {
    return calcularCustoImpressao({
      pesoGramas: peso,
      tempoMinutos: tempo,
      precoFilamentoKgCentavos: Math.round(precoFilamento * 100),
      potenciaW: potencia,
      precoKwhCentavos: Math.round(precoKwh * 100),
      taxaLucro: margem / 100,
      maoDeObraHoraCentavos: Math.round(maoDeObra * 100),
      custoInsumosCentavos: Math.round(insumos * 100),
      custoFreteCentavos: Math.round(frete * 100),
      taxaEcommercePercentual: taxaEcommerce / 100,
      taxaFixaVendaCentavos: Math.round(taxaFixa * 100),
    });
  }, [peso, tempo, precoFilamento, potencia, precoKwh, margem, maoDeObra, insumos, frete, taxaEcommerce, taxaFixa]);

  // Sincroniza preço do material selecionado
  useEffect(() => {
    if (materialSelecionadoId) {
      const mat = materiais.find(m => m.id === materialSelecionadoId);
      if (mat) {
        setPrecoFilamento((mat.precoCentavos / 100) / (mat.pesoGramas / 1000));
      }
    }
  }, [materialSelecionadoId, materiais]);

  // Sincroniza potência da impressora selecionada
  useEffect(() => {
    if (impressoraSelecionadaId) {
      const imp = impressoras.find(i => i.id === impressoraSelecionadaId);
      if (imp) {
        setPotencia((imp.consumoKw ?? 0.1) * 1000); // Converte Kw para W com fallback de 100W
      }
    }
  }, [impressoraSelecionadaId, impressoras]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* COLUNA DE INPUTS */}
      <div className="xl:col-span-8 space-y-6">
        {/* GRADES DE INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CARD PROJETO */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
              <Calculator size={18} className="text-sky-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Dimensões do Projeto</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Peso Estimado (Gramas)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    value={peso}
                    onChange={(e) => setPeso(Number(e.target.value.replace(",", ".")) || 0)}
                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-sky-500/50 focus:bg-white dark:focus:bg-black transition-all outline-none font-black text-sm"
                  />
                  <Scale size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Tempo de Impressão (Minutos)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    value={tempo}
                    onChange={(e) => setTempo(Number(e.target.value.replace(",", ".")) || 0)}
                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-sky-500/50 focus:bg-white dark:focus:bg-black transition-all outline-none font-black text-sm"
                  />
                  <Timer size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          {/* CARD OPERAÇÃO */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
              <Zap size={18} className="text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Configurações de Custo</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 font-['Inter']">
                  Material Utilizado
                </label>
                <select
                  value={materialSelecionadoId}
                  onChange={(e) => setMaterialSelecionadoId(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-amber-500/50 transition-all outline-none font-black text-xs appearance-none"
                >
                  <option value="">Personalizado (R$ {precoFilamento.toFixed(2)}/kg)</option>
                  {materiais.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome} ({m.cor}) - {centavosParaReais(m.precoCentavos)}
                    </option>
                  ))}
                </select>
              </div>
              
              {!materialSelecionadoId && (
                <div className="col-span-2 animate-in fade-in duration-300">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Preço do Filamento (R$/kg)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    value={precoFilamento}
                    onChange={(e) => setPrecoFilamento(Number(e.target.value.replace(",", ".")) || 0)}
                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-amber-500/50 transition-all outline-none font-black text-sm"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Consumo (W)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  value={potencia}
                  onChange={(e) => setPotencia(Number(e.target.value.replace(",", ".")) || 0)}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-amber-500/50 transition-all outline-none font-black text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  kWh (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  value={precoKwh}
                  onChange={(e) => setPrecoKwh(Number(e.target.value.replace(",", ".")) || 0)}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-amber-500/50 transition-all outline-none font-black text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ SEÇÃO COMERCIAL & LOGÍSTICA ═══════ */}
        <div className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
            <TrendingUp size={18} className="text-emerald-500" />
            <h3 className="text-xs font-black uppercase tracking-widest">E-commerce & Logística</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Taxa Marketplace (%)
              </label>
              <input
                type="number"
                value={taxaEcommerce}
                onChange={(e) => setTaxaEcommerce(Number(e.target.value))}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500/50 transition-all outline-none font-black text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Taxa Fixa (R$)
              </label>
              <input
                type="number"
                value={taxaFixa}
                onChange={(e) => setTaxaFixa(Number(e.target.value))}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500/50 transition-all outline-none font-black text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Insumos/Embalagem
              </label>
              <input
                type="number"
                value={insumos}
                onChange={(e) => setInsumos(Number(e.target.value))}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500/50 transition-all outline-none font-black text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Custo de Frete (R$)
              </label>
              <input
                type="number"
                value={frete}
                onChange={(e) => setFrete(Number(e.target.value))}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-emerald-500/50 transition-all outline-none font-black text-sm"
              />
            </div>
          </div>
        </div>

        {/* MARGEM E MÃO DE OBRA */}
        <div className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Margem de Lucro Sugerida
              </label>
              <span className="text-sm font-black text-sky-500">{margem}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={margem}
              onChange={(e) => setMargem(Number(e.target.value))}
              className="w-full accent-sky-500 h-2 bg-gray-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Mão de Obra por Hora (R$)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                value={maoDeObra}
                onChange={(e) => setMaoDeObra(Number(e.target.value.replace(",", ".")) || 0)}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-sky-500/50 transition-all outline-none font-black text-sm"
              />
              <DollarSign size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
            </div>
          </div>
        </div>
      </div>

      {/* COLUNA DE RESULTADOS */}
      <div className="xl:col-span-4 space-y-6 lg:sticky lg:top-8">
        <div className="p-10 rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center text-center overflow-hidden relative">
          {/* Efeito Glow de Fundo */}
          <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />

          <div className="relative z-10 w-full">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-400 opacity-60">
              Preço Estimado de Venda
            </span>
            <div className="mt-6 mb-10 flex flex-col items-center">
              <h2 className="text-6xl font-black text-white tracking-tighter leading-none mb-2">
                {centavosParaReais(calculo.precoSugerido)}
              </h2>
              <div className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full">
                <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">
                  Margem de {margem}% Aplicada
                </span>
              </div>
            </div>

            <div className="space-y-4 w-full pt-10 border-t border-white/5">
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                    <Scale size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">
                    Material
                  </span>
                </div>
                <span className="text-sm font-black text-white">{centavosParaReais(calculo.custoMaterial)}</span>
              </div>

              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                    <Zap size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">
                    Energia
                  </span>
                </div>
                <span className="text-sm font-black text-white">{centavosParaReais(calculo.custoEnergia)}</span>
              </div>

              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                    <TrendingUp size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">
                    Mão de Obra
                  </span>
                </div>
                <span className="text-sm font-black text-white">{centavosParaReais(calculo.custoMaoDeObra)}</span>
              </div>

              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                    <DollarSign size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">
                    Taxas & Frete
                  </span>
                </div>
                <span className="text-sm font-black text-rose-400">{centavosParaReais(calculo.taxaMarketplace + (Math.round(frete * 100)))}</span>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 flex justify-between items-center bg-emerald-500/5 -mx-10 px-10 py-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/60">
                    Líquido Real (Aproximado)
                  </span>
                  <span className="text-[7px] text-zinc-500 uppercase tracking-widest">Pós produção e taxas</span>
                </div>
                <span className="text-xl font-black text-emerald-400">
                  {centavosParaReais(calculo.precoSugerido - calculo.taxaMarketplace - (Math.round(frete * 100)))}
                </span>
              </div>
            </div>

            <button className="mt-8 w-full h-14 bg-white hover:bg-sky-400 text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-black/20">
              <RefreshCcw size={16} strokeWidth={3} />
              Salvar Orçamento
            </button>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-sky-500/5 border border-sky-500/10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
            <TrendingUp size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
              Insight Maker
            </h4>
            <p className="text-[11px] font-medium text-gray-500 dark:text-sky-200/50 leading-relaxed">
              Aumentar a margem para {margem + 20}% pode cobrir amortizações de hardware em menos de 6 meses baseado no
              fluxo atual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
