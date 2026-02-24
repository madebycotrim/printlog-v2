import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Save,
    User,
    Mail,
    Phone,
    AlertCircle
} from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { Cliente } from "../tipos";
import { esquemaCliente, TipoDadosCliente } from "../esquemas";

interface FormularioClienteProps {
    aberto: boolean;
    clienteEditando: Cliente | null;
    aoSalvar: (dados: Partial<Cliente>) => Promise<void>;
    aoCancelar: () => void;
}

export function FormularioCliente({
    aberto,
    clienteEditando,
    aoSalvar,
    aoCancelar,
}: FormularioClienteProps) {
    const isEditando = Boolean(clienteEditando);
    const [confirmarDescarte, definirConfirmarDescarte] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<TipoDadosCliente>({
        resolver: zodResolver(esquemaCliente),
        defaultValues: {
            nome: "",
            email: "",
            telefone: "",
        },
    });

    useEffect(() => {
        if (aberto) {
            if (clienteEditando) {
                reset({
                    nome: clienteEditando.nome,
                    email: clienteEditando.email,
                    telefone: clienteEditando.telefone,
                });
            } else {
                reset({
                    nome: "",
                    email: "",
                    telefone: "",
                });
            }
            definirConfirmarDescarte(false);
        }
    }, [aberto, clienteEditando, reset]);

    const lidarComEnvio = async (dados: TipoDadosCliente) => {
        await aoSalvar(dados);
    };

    const lidarComTentativaFechamento = () => {
        if (isDirty && !confirmarDescarte) {
            definirConfirmarDescarte(true);
        } else {
            aoCancelar();
        }
    };

    return (
        <Dialogo
            aberto={aberto}
            aoFechar={lidarComTentativaFechamento}
            titulo={isEditando ? "Editar Cliente" : "Novo Cliente"}
            larguraMax="max-w-2xl"
        >
            <form onSubmit={handleSubmit(lidarComEnvio)} className="flex flex-col bg-white dark:bg-[#18181b]">
                <div className="p-6 md:p-8 space-y-8">

                    {/* SEÇÃO 1: DADOS BÁSICOS */}
                    <div className="space-y-5">
                        <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-zinc-100 dark:border-white/5 pb-2 text-zinc-400">
                            Informações de Contato
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-400 mb-2">Nome Completo</label>
                                <div className="relative group">
                                    <User size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[var(--cor-primaria)] transition-colors" />
                                    <input
                                        {...register("nome")}
                                        className="w-full h-11 pl-8 pr-4 bg-transparent border-b-2 border-zinc-200 dark:border-white/10 focus:border-[var(--cor-primaria)] text-sm font-medium outline-none transition-all dark:text-white"
                                        placeholder="Ex: João Silva"
                                    />
                                </div>
                                {errors.nome && <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.nome.message}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-400 mb-2">E-mail</label>
                                <div className="relative group">
                                    <Mail size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[var(--cor-primaria)] transition-colors" />
                                    <input
                                        {...register("email")}
                                        className="w-full h-11 pl-8 pr-4 bg-transparent border-b-2 border-zinc-200 dark:border-white/10 focus:border-[var(--cor-primaria)] text-sm font-medium outline-none transition-all dark:text-white"
                                        placeholder="joao@exemplo.com"
                                    />
                                </div>
                                {errors.email && <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.email.message}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-400 mb-2">Telefone</label>
                                <div className="relative group">
                                    <Phone size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[var(--cor-primaria)] transition-colors" />
                                    <input
                                        {...register("telefone")}
                                        className="w-full h-11 pl-8 pr-4 bg-transparent border-b-2 border-zinc-200 dark:border-white/10 focus:border-[var(--cor-primaria)] text-sm font-medium outline-none transition-all dark:text-white"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                                {errors.telefone && <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.telefone.message}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col items-end gap-3">
                    {!confirmarDescarte ? (
                        <div className="flex items-center gap-3 w-full justify-end">
                            <button
                                type="button"
                                onClick={lidarComTentativaFechamento}
                                className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                style={{ backgroundColor: "var(--cor-primaria)" }}
                                className="px-8 py-3 hover:brightness-110 text-white text-sm font-black rounded-xl shadow-lg shadow-sky-500/10 flex items-center gap-2 active:scale-95 transition-all"
                            >
                                <Save size={18} />
                                {isEditando ? "Salvar Alterações" : "Cadastrar Cliente"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-end gap-3 w-full animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="flex items-center gap-3 w-full justify-end">
                                <button
                                    type="button"
                                    onClick={() => aoCancelar()}
                                    className="px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => definirConfirmarDescarte(false)}
                                    style={{ backgroundColor: "var(--cor-primaria)" }}
                                    className="px-6 py-2.5 hover:brightness-110 text-white text-sm font-bold rounded-xl transition-all"
                                >
                                    Continuar Editando
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Alterações não salvas serão perdidas</span>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </Dialogo>
    );
}
