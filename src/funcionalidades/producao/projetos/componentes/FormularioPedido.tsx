import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
    Save, User, FileText, Calendar, Scale, Clock, 
    Cpu, DollarSign, Box, Package 
} from "lucide-react";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Combobox } from "@/compartilhado/componentes/Combobox";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoAreaTexto } from "@/compartilhado/componentes/CampoAreaTexto";
import { CriarPedidoInput, Pedido } from "../tipos";
import { usarGerenciadorClientes } from "@/funcionalidades/comercial/clientes/hooks/usarGerenciadorClientes";
import { SeletorInsumosSecundarios } from "./SeletorInsumosSecundarios";
import { SeletorMateriaisPedido } from "./SeletorMateriaisPedido";
import { usarArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";

import { extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";

const esquemaPedido = z.object({
    idCliente: z.string().min(1, "Selecione um cliente"),
    descricao: z.string().min(3, "A descrição deve ter pelo menos 3 caracteres"),
    valorCentavos: z.number().min(0),
    prazoEntrega: z.string().optional(),
    material: z.string().optional(),
    pesoGramas: z.number().min(0).optional(),
    tempoMinutos: z.number().int().min(0).optional(),
    idImpressora: z.string().optional(),
    observacoes: z.string().optional(),
    insumosSecundarios: z.array(z.object({
        idInsumo: z.string(),
        nome: z.string(),
        quantidade: z.number().min(0),
        custoUnitarioCentavos: z.number().int().min(0),
    })).optional(),
    materiais: z.array(z.object({
        idMaterial: z.string(),
        nome: z.string(),
        quantidadeGasta: z.number().min(0),
    })).optional(),
});

type PedidoFormData = z.infer<typeof esquemaPedido>;

interface PropriedadesFormularioPedido {
    aberto: boolean;
    aoSalvar: (dados: CriarPedidoInput) => Promise<any> | void;
    aoCancelar: () => void;
    pedidoEdicao?: Pedido | null;
}

export function FormularioPedido({ aberto, aoSalvar, aoCancelar, pedidoEdicao }: PropriedadesFormularioPedido) {
    const { estado, acoes } = usarGerenciadorClientes();
    
    const [modalArmazemAberto, setModalArmazemAberto] = useState(false);
    const [modalInsumosAberto, setModalInsumosAberto] = useState(false);
    const [buscaMaterial, setBuscaMaterial] = useState("");
    const [buscaInsumo, setBuscaInsumo] = useState("");

    const { materiais } = usarArmazemMateriais();
    const { insumos } = usarArmazemInsumos();
    const { impressoras } = usarArmazemImpressoras();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<PedidoFormData>({
        resolver: zodResolver(esquemaPedido) as any,
        mode: "onChange",
        defaultValues: {
            idCliente: "",
            descricao: "",
            valorCentavos: 0,
            prazoEntrega: "",
            material: "",
            pesoGramas: 0,
            tempoMinutos: 0,
            idImpressora: "",
            observacoes: "",
            insumosSecundarios: [],
            materiais: [],
        },
    });

    const materiaisSelecionados = watch("materiais") || [];
    const insumosSecundarios = watch("insumosSecundarios") || [];

    useEffect(() => {
        if (aberto) {
            if (pedidoEdicao) {
                reset({
                    idCliente: pedidoEdicao.idCliente,
                    descricao: pedidoEdicao.descricao,
                    valorCentavos: pedidoEdicao.valorCentavos / 100,
                    prazoEntrega: pedidoEdicao.prazoEntrega
                        ? new Date(pedidoEdicao.prazoEntrega).toISOString().split("T")[0]
                        : "",
                    material: pedidoEdicao.material || "",
                    pesoGramas: pedidoEdicao.pesoGramas || 0,
                    tempoMinutos: pedidoEdicao.tempoMinutos || 0,
                    idImpressora: pedidoEdicao.idImpressora || "",
                    observacoes: pedidoEdicao.observacoes || "",
                    insumosSecundarios: pedidoEdicao.insumosSecundarios || [],
                    materiais: pedidoEdicao.materiais || [],
                });
            } else {
                reset({
                    idCliente: "",
                    descricao: "",
                    valorCentavos: 0,
                    prazoEntrega: "",
                    material: "",
                    pesoGramas: 0,
                    tempoMinutos: 0,
                    idImpressora: "",
                    observacoes: "",
                    insumosSecundarios: [],
                    materiais: [],
                });
            }
        }
    }, [aberto, reset, pedidoEdicao]);

    const aoSubmeter = async (dados: PedidoFormData) => {
        try {
            await aoSalvar({
                idCliente: dados.idCliente,
                descricao: dados.descricao,
                valorCentavos: Math.round(dados.valorCentavos * 100),
                prazoEntrega: dados.prazoEntrega ? new Date(dados.prazoEntrega) : undefined,
                material: dados.material,
                pesoGramas: dados.pesoGramas,
                tempoMinutos: dados.tempoMinutos,
                idImpressora: dados.idImpressora,
                observacoes: dados.observacoes,
                insumosSecundarios: dados.insumosSecundarios,
                materiais: dados.materiais,
            });
            aoCancelar();
        } catch (erro) {
            registrar.error({ rastreioId: "sistema", servico: "FormularioPedido" }, "Erro ao salvar pedido", erro);
        }
    };

    const lidarComCriarCliente = async (nome: string) => {
        const novo = await acoes.salvarCliente({ nome, email: "", telefone: "" });
        setValue("idCliente", novo.id, { shouldDirty: true, shouldValidate: true });
        return novo.id;
    };

    const opcoesClientes = useMemo(() => estado.clientes.map(c => ({ valor: c.id, rotulo: c.nome })), [estado.clientes]);
    const opcoesImpressoras = useMemo(() => impressoras.map(i => ({ valor: i.id, rotulo: `${i.nome} (${i.modeloBase || 'FDM'})` })), [impressoras]);

    const materiaisFiltrados = materiais.filter(m => m.nome.toLowerCase().includes(buscaMaterial.toLowerCase()));
    const insumosFiltrados = insumos.filter(i => i.nome.toLowerCase().includes(buscaInsumo.toLowerCase()));

    const selecionarMaterial = (m: any) => {
        const novos = [...materiaisSelecionados, { idMaterial: m.id, nome: m.nome, quantidadeGasta: 0 }];
        setValue("materiais", novos, { shouldDirty: true });
        setValue("material", novos.map(item => item.nome).join(", "));
        setModalArmazemAberto(false);
    };

    const selecionarInsumo = (i: any) => {
        const novos = [...insumosSecundarios, { idInsumo: i.id, nome: i.nome, quantidade: 1, custoUnitarioCentavos: i.custoMedioUnidade }];
        setValue("insumosSecundarios", novos, { shouldDirty: true });
        setModalInsumosAberto(false);
    };

    return (
        <Dialogo aberto={aberto} aoFechar={aoCancelar} titulo={pedidoEdicao ? "Painel de Edição de Projeto" : "Configuração de Novo Projeto"} larguraMax="max-w-6xl">
            <form onSubmit={handleSubmit(aoSubmeter)} className="flex flex-col bg-zinc-950">
                <div className="p-8 max-h-[78vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700">
                    
                    {/* CABEÇALHO DINÂMICO (FULL WIDTH) */}
                    <header className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600/20 to-violet-600/5 border border-indigo-500/10 overflow-hidden group mb-10">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />
                        
                        <div className="relative flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-500/10">
                                <Package size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                                    {pedidoEdicao ? "Ajustar Parâmetros" : "Novo Fluxo de Trabalho"}
                                </h2>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                    {pedidoEdicao ? `Editando ID: #${pedidoEdicao.id.slice(0,8)}` : "Preencha os detalhes técnicos para iniciar"}
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* COLUNA ESQUERDA: IDENTIFICAÇÃO E TÉCNICA */}
                        <div className="space-y-12">
                            {/* SEÇÃO: CLIENTE */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-1.5 h-6 rounded-full bg-indigo-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Identificação & Cliente</h3>
                                </div>
                                
                                <div className="p-1 rounded-[2rem] bg-white/[0.02] border border-white/5">
                                    <Combobox
                                        titulo="Responsável pelo Projeto"
                                        opcoes={opcoesClientes}
                                        valor={watch("idCliente")}
                                        aoAlterar={(val) => setValue("idCliente", val, { shouldDirty: true })}
                                        aoCriarNovo={lidarComCriarCliente}
                                        placeholder="Selecione ou crie um cliente..."
                                        icone={User}
                                        erro={errors.idCliente?.message}
                                    />
                                </div>
                            </section>

                            {/* SEÇÃO: ESPECIFICAÇÕES TÉCNICAS */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-1.5 h-6 rounded-full bg-emerald-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Especificações Técnicas</h3>
                                </div>

                                <div className="space-y-6">
                                    <CampoTexto
                                        rotulo="Título do Projeto / Descrição do Job"
                                        placeholder="Ex: Chaveiro Astronauta V2 - Escala 1:10"
                                        icone={FileText}
                                        erro={errors.descricao?.message}
                                        {...register("descricao")}
                                    />

                                    <div className="p-6 bg-zinc-900/40 rounded-[2.5rem] border border-white/5 space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Tempo Est. (Min)</label>
                                                <div className="flex items-center gap-3 px-5 py-4 bg-black/40 border border-white/5 rounded-2xl focus-within:border-emerald-500/50 transition-all group">
                                                    <Clock size={16} className="text-zinc-500 group-focus-within:text-emerald-500" />
                                                    <input type="number" className="w-full bg-transparent text-sm font-black text-white outline-none" {...register("tempoMinutos", { valueAsNumber: true })} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Peso Total (G)</label>
                                                <div className="flex items-center gap-3 px-5 py-4 bg-black/40 border border-white/5 rounded-2xl focus-within:border-emerald-500/50 transition-all group">
                                                    <Scale size={16} className="text-zinc-500 group-focus-within:text-emerald-500" />
                                                    <input type="number" className="w-full bg-transparent text-sm font-black text-white outline-none" {...register("pesoGramas", { valueAsNumber: true })} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Equipamento</label>
                                            <div className="flex items-center gap-3 px-5 py-4 bg-black/40 border border-white/5 rounded-2xl focus-within:border-emerald-500/50 transition-all group">
                                                <Cpu size={16} className="text-zinc-500 group-focus-within:text-emerald-500" />
                                                <select className="w-full bg-transparent text-sm font-black text-white outline-none appearance-none cursor-pointer" {...register("idImpressora")}>
                                                    <option value="" className="bg-zinc-900">Automático</option>
                                                    {opcoesImpressoras.map(o => <option key={o.valor} value={o.valor} className="bg-zinc-900">{o.rotulo}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* COLUNA DIREITA: COMPOSIÇÃO E FINANCEIRO */}
                        <div className="space-y-12">
                            {/* SEÇÃO: MATERIAIS E INSUMOS */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-1.5 h-6 rounded-full bg-sky-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Composição & Suprimentos</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-12">
                                    <SeletorMateriaisPedido
                                        selecionados={materiaisSelecionados}
                                        aoAbrirArmazem={() => setModalArmazemAberto(true)}
                                        aoAlterar={(novos) => {
                                            setValue("materiais", novos, { shouldDirty: true });
                                            setValue("material", novos.map(m => m.nome).join(", "));
                                            setValue("pesoGramas", novos.reduce((acc, m) => acc + m.quantidadeGasta, 0));
                                        }}
                                    />
                                    <SeletorInsumosSecundarios
                                        selecionados={insumosSecundarios}
                                        aoAbrirArmazem={() => setModalInsumosAberto(true)}
                                        aoAlterar={(novos) => setValue("insumosSecundarios", novos, { shouldDirty: true })}
                                    />
                                </div>
                            </section>

                            {/* SEÇÃO: PRAZOS E VALORES */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-1.5 h-6 rounded-full bg-amber-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Financeiro & Entrega</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <CampoTexto rotulo="Data Limite para Entrega" type="date" icone={Calendar} {...register("prazoEntrega")} />
                                    
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Preço Final do Projeto (BRL)</label>
                                        <div className="flex items-center gap-4 px-6 py-5 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-[2rem] focus-within:border-emerald-500 transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-focus-within:bg-emerald-500 group-focus-within:text-white transition-all">
                                                <DollarSign size={20} strokeWidth={3} />
                                            </div>
                                            <input 
                                                type="text" 
                                                className="w-full bg-transparent text-2xl font-black text-white outline-none tabular-nums"
                                                onChange={(e) => setValue("valorCentavos", extrairValorNumerico(e.target.value), { shouldDirty: true })}
                                                value={(watch("valorCentavos") || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* OBSERVAÇÕES (FULL WIDTH) */}
                    <section className="mt-12">
                        <CampoAreaTexto
                            rotulo="Observações Internas (Opcional)"
                            placeholder="Notas sobre acabamento, cores específicas ou detalhes de envio..."
                            icone={FileText}
                            {...register("observacoes")}
                        />
                    </section>
                </div>

                {/* RODAPÉ DE AÇÕES */}
                <footer className="px-8 py-8 bg-zinc-900/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between">
                    <button 
                        type="button" 
                        onClick={aoCancelar} 
                        className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors"
                    >
                        Descartar
                    </button>
                    
                    <button 
                        type="submit" 
                        className="group relative flex items-center gap-4 px-12 py-4 bg-white text-zinc-950 rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/5 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Save size={18} strokeWidth={3} className="relative z-10" />
                        <span className="relative z-10 text-xs font-black uppercase tracking-widest">
                            {pedidoEdicao ? "Salvar Alterações" : "Lançar no Kanban"}
                        </span>
                    </button>
                </footer>
            </form>

            {/* Modais de Seleção */}
            <ModalListagemPremium aberto={modalArmazemAberto} aoFechar={() => setModalArmazemAberto(false)} titulo="Armazém de Materiais" iconeTitulo={Box} corDestaque="amber" termoBusca={buscaMaterial} aoMudarBusca={setBuscaMaterial} temResultados={materiaisFiltrados.length > 0} totalResultados={materiaisFiltrados.length}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materiaisFiltrados.map(m => (
                        <div key={m.id} onClick={() => selecionarMaterial(m)} className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:border-amber-500/40 cursor-pointer transition-all flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><Box size={24} /></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase text-zinc-900 dark:text-white">{m.nome}</span>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">{m.tipo} • {m.cor}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </ModalListagemPremium>

            <ModalListagemPremium aberto={modalInsumosAberto} aoFechar={() => setModalInsumosAberto(false)} titulo="Armazém de Insumos" iconeTitulo={Package} corDestaque="sky" termoBusca={buscaInsumo} aoMudarBusca={setBuscaInsumo} temResultados={insumosFiltrados.length > 0} totalResultados={insumosFiltrados.length}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {insumosFiltrados.map(i => (
                        <div key={i.id} onClick={() => selecionarInsumo(i)} className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:border-sky-500/40 cursor-pointer transition-all flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform"><Package size={24} /></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase text-zinc-900 dark:text-white">{i.nome}</span>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">{i.categoria} • {i.unidadeMedida}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </ModalListagemPremium>
        </Dialogo>
    );
}
