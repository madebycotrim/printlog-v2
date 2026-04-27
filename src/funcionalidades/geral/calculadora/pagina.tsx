import { useState, useMemo, useEffect } from "react";
import { 
  ChevronDown, Check, Settings, X, History
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { usarGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/usarGerenciadorImpressoras";
import { usarGerenciadorMateriais } from "@/funcionalidades/producao/materiais/hooks/usarGerenciadorMateriais";
import { usarGerenciadorInsumos } from "@/funcionalidades/producao/insumos/hooks/usarGerenciadorInsumos";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { FormularioMaterial } from "@/funcionalidades/producao/materiais/componentes/FormularioMaterial";
import { FormularioInsumo } from "@/funcionalidades/producao/insumos/componentes/FormularioInsumo";
import { formatarMoedaFinancas, formatarPorcentagem } from "@/compartilhado/utilitarios/formatadores";

// Hook e Componentes Refatorados
import { usarCalculadora } from "./hooks/usarCalculadora";
import { CardMateriais } from "./componentes/CardMateriais";
import { CardProducao } from "./componentes/CardProducao";
import { CardOperacional } from "./componentes/CardOperacional";
import { CardInsumos } from "./componentes/CardInsumos";
import { CardLogisticaFiscal } from "./componentes/CardLogisticaFiscal";
import { PainelResultados } from "./componentes/PainelResultados";
import { ModalHistorico } from "./componentes/ModalHistorico";

export function PaginaCalculadora() {
  const navigate = useNavigate();
  const { usuario } = usarAutenticacao();
  const config = usarArmazemConfiguracoes();
  const { criarPedido } = usarPedidos();
  const { estado: { impressoras = [] } = {} } = usarGerenciadorImpressoras();
  const { materiais } = usarArmazemMateriais();
  const { insumos: insumosEstoque, adicionarOuAtualizarInsumo, abrirEditar: abrirCriarInsumo, modalCricaoAberto: modalInsumoAberto, fecharEditar: fecharInsumoAberto, insumoEditando } = usarArmazemInsumos();
  const { estado: estadoMateriais, acoes: acoesMateriais } = usarGerenciadorMateriais();
  usarGerenciadorInsumos();

  // Hook Central de Inteligência
  const hook = usarCalculadora();

  // Estados de UI locais
  const [abertoSeletor, setAbertoSeletor] = useState(false);
  const [modalArmazemAberto, setModalArmazemAberto] = useState(false);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [abaResultado, setAbaResultado] = useState<'orcamento' | 'metricas'>('orcamento');
  const [buscaMaterial, setBuscaMaterial] = useState("");
  const [buscaInsumo, setBuscaInsumo] = useState("");

  const impressoraSelecionada = useMemo(() => 
    impressoras.find(i => i.id === hook.impressoraSelecionadaId),
    [impressoras, hook.impressoraSelecionadaId]
  );

  const alternarMaterial = (id: string) => {
    const jaSelecionado = hook.materiaisSelecionados.find(m => m.id === id);
    if (jaSelecionado) {
      hook.setMateriaisSelecionados(prev => prev.filter(m => m.id !== id));
    } else {
      const matOriginal = materiais.find(m => m.id === id);
      if (matOriginal) {
        hook.setMateriaisSelecionados(prev => [...prev, {
          id: matOriginal.id,
          nome: matOriginal.nome,
          cor: matOriginal.cor,
          tipo: matOriginal.tipo,
          quantidade: 0,
          precoKgCentavos: Math.round((matOriginal.precoCentavos / matOriginal.pesoGramas) * 1000)
        }]);
      }
    }
  };

  const salvarComoProjeto = async () => {
    try {
      const novoPedido = await criarPedido({
        idCliente: "ORCAMENTO_DIRETO",
        descricao: hook.materiaisSelecionados.length > 0 ? `Impressão: ${hook.materiaisSelecionados.map(m => m.nome).join(", ")}` : "Orçamento via Calculadora",
        valorCentavos: hook.calculo.precoSugerido,
        material: hook.materiaisSelecionados.map(m => m.nome).join(", "),
        pesoGramas: hook.materiaisSelecionados.reduce((acc, m) => acc + m.quantidade, 0),
        tempoMinutos: hook.tempo,
        idImpressora: hook.impressoraSelecionadaId || undefined,
        prazoEntrega: hook.estimativaPrazo.data,
        observacoes: `Gerado via calculadora em ${new Date().toLocaleDateString('pt-BR')}.`
      });

      if (novoPedido) {
        toast.success("Orçamento salvo como projeto!");
        navigate("/producao/projetos");
      }
    } catch (erro) {
      console.error(erro);
    }
  };

  // Sincronizar potência ao carregar ou mudar impressora
  useEffect(() => {
    if (impressoraSelecionada?.potenciaWatts) {
      hook.setPotencia(impressoraSelecionada.potenciaWatts);
    }
  }, [impressoraSelecionada?.potenciaWatts, hook.setPotencia]);

  const elementoAcao = useMemo(() => (
    <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
      <div className="relative">
        <button 
          onClick={() => setAbertoSeletor(!abertoSeletor)}
          className={`flex items-center gap-3 px-4 h-11 rounded-xl transition-all duration-300 group ${abertoSeletor ? "bg-white dark:bg-white/10 shadow-md" : ""}`}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <div className="flex flex-col items-start leading-none py-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-0.5">
              {impressoraSelecionada?.nome || "Selecionar..."}
            </span>
            {impressoraSelecionada && (
              <div className="flex items-center gap-1.5">
                {(impressoraSelecionada.marca || impressoraSelecionada.modeloBase) && (
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">
                    {impressoraSelecionada.marca} {impressoraSelecionada.modeloBase}
                  </span>
                )}
                {impressoraSelecionada.potenciaWatts && (
                  <span className="text-[8px] font-black text-sky-500 uppercase tracking-tighter">• {impressoraSelecionada.potenciaWatts}W</span>
                )}
              </div>
            )}
          </div>
          <ChevronDown size={14} className={`text-zinc-400 group-hover:text-sky-500 transition-transform ${abertoSeletor ? "rotate-180" : ""}`} />
        </button>
        {abertoSeletor && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/10 shadow-2xl z-[100] min-w-[250px]">
            {impressoras.map((imp) => (
              <button 
                key={imp.id}
                onClick={() => { hook.setImpressoraSelecionadaId(imp.id); localStorage.setItem("printlog_ultima_impressora", imp.id); setAbertoSeletor(false); if (imp.potenciaWatts) hook.setPotencia(imp.potenciaWatts); }}
                className={`w-full flex flex-col items-start px-4 py-3 rounded-xl transition-all ${hook.impressoraSelecionadaId === imp.id ? "bg-sky-500/10 text-sky-500" : "hover:bg-gray-50 dark:hover:bg-white/5"}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-black uppercase tracking-widest">{imp.nome}</span>
                  {hook.impressoraSelecionadaId === imp.id && <Check size={14} />}
                </div>
                {(imp.marca || imp.modeloBase) && (
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-0.5">
                    {imp.marca} {imp.modeloBase}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => setModalHistoricoAberto(true)} className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white dark:hover:bg-white/10 text-zinc-400 hover:text-sky-500 transition-all"><History size={18} /></button>
      <button onClick={() => setModalConfigAberto(true)} className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white dark:hover:bg-white/10 text-zinc-400 hover:text-amber-500 transition-all"><Settings size={18} /></button>
    </div>
  ), [abertoSeletor, hook.impressoraSelecionadaId, impressoraSelecionada?.nome, impressoras]);

  usarDefinirCabecalho({ 
    titulo: "Precificação Inteligente", 
    subtitulo: "Engenharia de custos e rentabilidade", 
    ocultarBusca: true, 
    elementoAcao 
  });

  return (
    <div className="absolute inset-0 grid grid-cols-1 xl:grid-cols-12 gap-8 overflow-hidden px-6 md:px-12">
      <div className="xl:col-span-8 space-y-6 h-full overflow-y-auto pt-8 pb-20 scrollbar-hide">
        
        <CardMateriais 
          materiais={materiais.filter(m => m.nome.toLowerCase().includes(buscaMaterial.toLowerCase()))}
          selecionados={hook.materiaisSelecionados}
          alertas={hook.alertasEstoque}
          busca={buscaMaterial}
          setBusca={setBuscaMaterial}
          alternar={alternarMaterial}
          atualizarQtd={(id, qtd) => hook.setMateriaisSelecionados(prev => prev.map(m => m.id === id ? { ...m, quantidade: qtd } : m))}
          atualizarPreco={(id, p) => hook.setMateriaisSelecionados(prev => prev.map(m => m.id === id ? { ...m, precoKgCentavos: Math.round(p * 100) } : m))}
          remover={(id) => hook.setMateriaisSelecionados(prev => prev.filter(m => m.id !== id))}
          abrirArmazem={() => setModalArmazemAberto(true)}
          abrirCriar={() => acoesMateriais.abrirEditar(null as any)}
        />

        <CardProducao 
          tempo={hook.tempo} setTempo={hook.setTempo}
          potencia={hook.potencia} setPotencia={hook.setPotencia}
          precoKwh={hook.precoKwh} setPrecoKwh={hook.setPrecoKwh}
          custoEnergia={hook.calculo.custoEnergia / 100}
          posProcesso={hook.itensPosProcesso} setPosProcesso={hook.setItensPosProcesso}
        />

        <CardOperacional 
          maoDeObra={hook.maoDeObra} setMaoDeObra={hook.setMaoDeObra}
          margem={hook.margem} setMargem={hook.setMargem}
          depreciacao={hook.depreciacaoHora} setDepreciacao={hook.setDepreciacaoHora}
          tempo={hook.tempo}
        />

        <CardInsumos 
          insumos={insumosEstoque.filter(i => i.nome.toLowerCase().includes(buscaInsumo.toLowerCase()))}
          selecionados={hook.insumosSelecionados}
          busca={buscaInsumo} setBusca={setBuscaInsumo}
          alternar={(insumo) => {
            const existe = hook.insumosSelecionados.find(i => i.id === insumo.id);
            if (existe) hook.setInsumosSelecionados(prev => prev.filter(i => i.id !== insumo.id));
            else hook.setInsumosSelecionados(prev => [...prev, { id: insumo.id, nome: insumo.nome, custoCentavos: insumo.custoMedioUnidade }]);
          }}
          insumosFixos={hook.insumosFixos} setInsumosFixos={hook.setInsumosFixos}
          abrirGerenciar={() => {}}
          abrirNovo={() => abrirCriarInsumo()}
        />

        <CardLogisticaFiscal 
          perfis={hook.perfisMarketplace} perfilAtivo={hook.perfilAtivo} setPerfilAtivo={hook.setPerfilAtivo}
          taxaEcommerce={hook.perfisMarketplace.find(p => p.nome === hook.perfilAtivo)?.taxa || 0} setTaxaEcommerce={() => {}}
          taxaFixa={hook.perfisMarketplace.find(p => p.nome === hook.perfilAtivo)?.fixa || 0} setTaxaFixa={() => {}}
          frete={hook.frete} setFrete={hook.setFrete}
          tipoOperacao={hook.perfilAtivo === 'Direto' ? 'servico' : 'produto'} setTipoOperacao={() => {}}
          impostos={hook.impostos} setImpostos={hook.setImpostos}
          icms={hook.icms} setIcms={hook.setIcms}
          iss={hook.iss} setIss={hook.setIss}
          abrirPerfis={() => {}}
        />
      </div>

      <div className="xl:col-span-4 h-full xl:sticky xl:top-0 flex flex-col justify-center py-8">
        <PainelResultados 
          calculo={hook.calculo}
          estimativa={hook.estimativaPrazo}
          dadosPizza={hook.dadosGraficoPizza}
          aba={abaResultado} setAba={setAbaResultado}
          salvarProjeto={salvarComoProjeto}
          gerarPdf={hook.gerarPdf}
          carregandoPdf={false}
          temImpressora={!!hook.impressoraSelecionadaId}
        />
      </div>

      {/* Modais de Gerenciamento (Zustand) */}
      <ModalListagemPremium aberto={modalArmazemAberto} aoFechar={() => setModalArmazemAberto(false)} titulo="Armazém de Materiais" iconeTitulo={Settings} corDestaque="sky" termoBusca="" aoMudarBusca={() => {}} temResultados={true} totalResultados={materiais.length}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiais.map(m => (
            <button key={m.id} onClick={() => alternarMaterial(m.id)} className={`p-4 rounded-2xl border-2 transition-all text-left ${hook.materiaisSelecionados.some(s => s.id === m.id) ? "border-sky-500 bg-sky-500/5" : "border-gray-50 dark:border-white/5 hover:border-sky-500/30"}`}>
              <h4 className="text-[11px] font-black uppercase">{m.nome}</h4>
            </button>
          ))}
        </div>
      </ModalListagemPremium>

      <ModalHistorico aberto={modalHistoricoAberto} aoFechar={() => setModalHistoricoAberto(false)} historico={hook.historico} aoSalvar={hook.salvarSnapshot} aoCarregar={(v) => { hook.carregarSnapshot(v); setModalHistoricoAberto(false); }} aoRemover={hook.removerSnapshot} />

      <Dialogo aberto={modalConfigAberto} aoFechar={() => setModalConfigAberto(false)} larguraMax="max-w-xl" esconderCabecalho={true}>
        <div className="p-10 space-y-10 bg-white dark:bg-zinc-900 rounded-[2.5rem] relative">
          <button onClick={() => setModalConfigAberto(false)} className="absolute top-8 right-8 p-2 rounded-xl text-gray-400 hover:text-zinc-900 dark:hover:text-white"><X size={20} /></button>
          <div className="flex flex-col items-center text-center gap-2">
            <h3 className="text-xl font-black uppercase tracking-[0.2em]">OPERACIONAL</h3>
          </div>
          <button 
            onClick={async () => { 
                config.definirCustoEnergia(formatarMoedaFinancas(hook.precoKwh, 2));
                config.definirHoraOperador(formatarMoedaFinancas(hook.maoDeObra, 2));
                config.definirHoraMaquina(formatarMoedaFinancas(hook.depreciacaoHora, 3));
                config.definirMargemLucro(formatarPorcentagem(String(hook.margem * 100)));
              if (usuario?.uid) await config.salvarNoD1(usuario.uid);
              setModalConfigAberto(false); 
              toast.success("Sincronizado!"); 
            }} 
            className="w-full h-20 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-[1.5rem] hover:scale-[1.02] transition-all"
          >
            Sincronizar Indices
          </button>
        </div>
      </Dialogo>

      <FormularioMaterial aberto={estadoMateriais.modalAberto} aoSalvar={acoesMateriais.salvarMaterial} aoCancelar={acoesMateriais.fecharEditar} materialEditando={estadoMateriais.materialSendoEditado} />
      <FormularioInsumo aberto={modalInsumoAberto} aoCancelar={fecharInsumoAberto} insumoEditando={insumoEditando} aoSalvar={(dados) => adicionarOuAtualizarInsumo({ ...dados, id: dados.id || crypto.randomUUID(), dataCriacao: dados.dataCriacao || new Date(), dataAtualizacao: new Date(), historico: dados.historico || [] } as any)} />
    </div>
  );
}
