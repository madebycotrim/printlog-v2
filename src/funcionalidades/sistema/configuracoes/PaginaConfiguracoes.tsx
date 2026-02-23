import { useState } from "react";
import {
  Save,
  Check,
  Sun,
  Moon,
  User,
  Shield,
  Lock,
  Mail,
  Loader2,
  Database,
  FileText,
  FileJson,
  Trash2,
  FileDown,
  Activity,
  PackageSearch,
  DollarSign,
  Palette,
  Download,
  AlertTriangle,
} from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contexto/ContextoAutenticacao";
import { Dialogo } from "@/compartilhado/componentes_ui/Dialogo";
import { usarContextoTema } from "@/compartilhado/tema/tema_provider";
import type { CorPrimaria } from "@/compartilhado/tipos_globais/modelos";

export function PaginaConfiguracoes() {
  const { usuario, atualizarPerfil, recuperarSenha } = usarAutenticacao();
  const { modo_tema, alternar_tema, cor_primaria, definir_cor_primaria } = usarContextoTema();

  const [nome, definirNome] = useState(usuario?.nome || "");
  const [salvando, definirSalvando] = useState(false);
  const [sucesso, definirSucesso] = useState(false);
  const [enviandoEmail, definirEnviandoEmail] = useState(false);
  const [confirmouEliminacao, definirConfirmouEliminacao] = useState(false);
  const [modalEliminacaoAberto, definirModalEliminacaoAberto] = useState(false);
  const [toastVisivel, definirToastVisivel] = useState(false);
  const [passoEliminacao, definirPassoEliminacao] = useState(1);

  const lidarComTrocaSenha = async () => {
    if (!usuario?.email) return;
    definirEnviandoEmail(true);
    try {
      await recuperarSenha(usuario.email);
      definirToastVisivel(true);
      setTimeout(() => definirToastVisivel(false), 4000);
    } catch (erro) {
      console.error("Erro ao enviar e-mail:", erro);
      alert("Erro ao enviar e-mail de redefinicao.");
    } finally {
      definirEnviandoEmail(false);
    }
  };

  const lidarComSalvar = async () => {
    definirSalvando(true);
    definirSucesso(false);
    try {
      await atualizarPerfil({ nome });
      definirSucesso(true);
      definirToastVisivel(true);
      setTimeout(() => {
        definirSucesso(false);
        definirToastVisivel(false);
      }, 4000);
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
      definirToastVisivel(true);
      setTimeout(() => definirToastVisivel(false), 4000);
    } finally {
      definirSalvando(false);
    }
  };

  usarDefinirCabecalho({
    titulo: "Configuracoes",
    subtitulo: "Personalize seu painel maker",
    ocultarBusca: true,
    acao: {
      texto: salvando ? "Salvando..." : sucesso ? "Salvo!" : "Salvar",
      icone: sucesso ? Check : salvando ? Loader2 : Save,
      aoClicar: lidarComSalvar,
      desabilitado: salvando,
    },
  });

  return (
    <div className="flex-1 w-full overflow-y-auto p-3 md:p-5">
      <div className="mx-auto w-full max-w-7xl space-y-4 md:space-y-5 animate-in fade-in duration-500">
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-12 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111113] p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-sky-100 dark:bg-sky-500/15 p-2 text-sky-600 dark:text-sky-300">
                  <Save size={18} />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-900 dark:text-white">Acoes Rapidas</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Salve alteracoes e acompanhe o status da conta.</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2 bg-gray-50 dark:bg-white/[0.02] text-xs text-gray-600 dark:text-zinc-300">
                  {usuario?.email}
                </div>
                <button
                  onClick={lidarComSalvar}
                  disabled={salvando}
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-xs font-black uppercase tracking-[0.13em] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {salvando ? <Loader2 size={14} className="animate-spin" /> : sucesso ? <Check size={14} /> : <Save size={14} />}
                  {salvando ? "Salvando..." : sucesso ? "Salvo!" : "Salvar"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111113] p-4 md:p-6 space-y-4">
            <CabecalhoCard titulo="Perfil" descricao="Conta e acesso" icone={User} corIcone="text-sky-500" />

            <div className="grid gap-4 md:grid-cols-[170px,1fr]">
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 bg-gray-50/70 dark:bg-white/[0.02]">
                <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 p-[3px]">
                  <div className="w-full h-full rounded-full bg-white dark:bg-[#111113] flex items-center justify-center overflow-hidden">
                    {usuario?.fotoUrl ? (
                      <img src={usuario.fotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-gray-400 dark:text-zinc-700">{usuario?.nome?.charAt(0) || "C"}</span>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-zinc-500">
                  Usuario
                </p>
              </div>

              <div className="space-y-3">
                <CampoDashboard
                  label="Nome Completo"
                  valor={nome}
                  aoMudar={definirNome}
                  icone={User}
                  placeholder="Seu nome"
                />
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-zinc-500">
                    E-mail verificado
                  </label>
                  <div className="h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] px-3 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <span className="truncate text-sm font-bold text-gray-700 dark:text-zinc-300">{usuario?.email}</span>
                    <Check size={16} className="ml-auto text-emerald-500" />
                  </div>
                </div>
                <button
                  onClick={lidarComTrocaSenha}
                  disabled={enviandoEmail}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-xs font-black uppercase tracking-[0.13em] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Lock size={16} className={enviandoEmail ? "animate-spin" : ""} />
                  {enviandoEmail ? "Enviando..." : "Redefinir Senha"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111113] p-4 md:p-6 space-y-4">
            <CabecalhoCard titulo="Aparencia" descricao="Tema e cor principal" icone={Palette} corIcone="text-violet-500" />

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: "CLARO", label: "Modo Dia", icone: Sun, detalhe: "Fundo claro para ambientes iluminados" },
                { id: "ESCURO", label: "Modo Noite", icone: Moon, detalhe: "Menor brilho para foco prolongado" },
              ].map((modo) => (
                <button
                  key={modo.id}
                  onClick={modo_tema !== modo.id ? alternar_tema : undefined}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    modo_tema === modo.id
                      ? "border-sky-400 dark:border-sky-500/50 bg-sky-50 dark:bg-sky-500/10"
                      : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl p-2 bg-white dark:bg-white/10">
                      <modo.icone size={18} className={modo.id === "CLARO" ? "text-amber-500" : "text-sky-500"} />
                    </span>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">{modo.label}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-500">{modo.detalhe}</p>
                    </div>
                    {modo_tema === modo.id && <Check size={16} className="ml-auto text-emerald-500" />}
                  </div>
                </button>
              ))}
            </div>

            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 dark:text-zinc-500">
                Cor principal
              </p>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {[
                  { id: "sky", classe: "bg-sky-500" },
                  { id: "emerald", classe: "bg-emerald-500" },
                  { id: "violet", classe: "bg-violet-500" },
                  { id: "amber", classe: "bg-amber-500" },
                  { id: "rose", classe: "bg-rose-500" },
                  { id: "cyan", classe: "bg-cyan-500" },
                  { id: "indigo", classe: "bg-indigo-500" },
                  { id: "teal", classe: "bg-teal-500" },
                  { id: "orange", classe: "bg-orange-500" },
                  { id: "fuchsia", classe: "bg-fuchsia-500" },
                ].map((cor) => (
                  <button
                    key={cor.id}
                    onClick={() => definir_cor_primaria(cor.id as CorPrimaria)}
                    className={`h-11 rounded-xl ${cor.classe} border-2 border-white dark:border-[#111113] ${
                      cor_primaria === cor.id
                        ? "outline outline-2 outline-offset-2"
                        : ""
                    }`}
                    style={cor_primaria === cor.id ? { outlineColor: "var(--cor-primaria)" } : undefined}
                    aria-label={`Selecionar cor ${cor.id}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111113] p-4 md:p-6 space-y-4">
            <CabecalhoCard titulo="Dados" descricao="Resumo e exportacao" icone={Database} corIcone="text-cyan-500" />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {[
                { val: "12", lab: "Clientes", icone: User, cor: "text-sky-500", fundo: "bg-sky-500/10" },
                { val: "24", lab: "Filamentos", icone: Database, cor: "text-violet-500", fundo: "bg-violet-500/10" },
                { val: "8", lab: "Insumos", icone: PackageSearch, cor: "text-amber-500", fundo: "bg-amber-500/10" },
                { val: "5", lab: "Maquinas", icone: Activity, cor: "text-emerald-500", fundo: "bg-emerald-500/10" },
                { val: "42", lab: "Projetos", icone: DollarSign, cor: "text-rose-500", fundo: "bg-rose-500/10" },
                { val: "100%", lab: "Potencial", icone: Activity, cor: "text-indigo-500", fundo: "bg-indigo-500/10" },
              ].map((item) => (
                <div
                  key={item.lab}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 bg-gray-50/70 dark:bg-white/[0.02]"
                >
                  <span className={`inline-flex rounded-lg p-2 ${item.fundo} ${item.cor}`}>
                    <item.icone size={16} />
                  </span>
                  <p className="mt-3 text-2xl font-black text-gray-900 dark:text-white">{item.val}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] font-black text-gray-500 dark:text-zinc-500">{item.lab}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 dark:text-zinc-500 flex items-center gap-2">
                <Download size={14} className="text-sky-500" />
                Exportar
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { nome: "CSV", icone: FileDown, cor: "text-sky-500", fundo: "bg-sky-500/10" },
                  { nome: "PDF", icone: FileText, cor: "text-emerald-500", fundo: "bg-emerald-500/10" },
                  { nome: "JSON", icone: FileJson, cor: "text-violet-500", fundo: "bg-violet-500/10" },
                ].map((item) => (
                  <button
                    key={item.nome}
                    className="rounded-xl border border-gray-200 dark:border-white/10 p-3 flex flex-col items-center gap-2 bg-gray-50 dark:bg-white/[0.02] hover:border-gray-300 dark:hover:border-white/20"
                  >
                    <span className={`rounded-lg p-2 ${item.fundo}`}>
                      <item.icone size={16} className={item.cor} />
                    </span>
                    <span className="text-xs font-black text-gray-900 dark:text-white">{item.nome}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111113] p-4 md:p-6 space-y-4">
            <CabecalhoCard titulo="Privacidade" descricao="LGPD e eliminacao de dados" icone={Shield} corIcone="text-rose-500" />

            <div className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/60 dark:bg-rose-500/[0.05] p-4">
              <p className="text-sm leading-relaxed text-rose-700 dark:text-rose-300/90">
                Voce pode solicitar acesso, correcao, portabilidade e eliminacao de dados conforme a Lei 13.709/2018.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { titulo: "Acesso", texto: "Solicitar copia dos dados." },
                { titulo: "Retificacao", texto: "Corrigir dados incorretos." },
                { titulo: "Portabilidade", texto: "Transferencia em formato aberto." },
                { titulo: "Eliminacao", texto: "Remocao permanente da conta.", risco: true },
              ].map((item) => (
                <div
                  key={item.titulo}
                  className={`rounded-xl border p-3 ${
                    item.risco
                      ? "border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/[0.05]"
                      : "border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.02]"
                  }`}
                >
                  <p
                    className={`text-xs font-black uppercase tracking-[0.12em] ${
                      item.risco ? "text-rose-700 dark:text-rose-400" : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {item.titulo}
                  </p>
                  <p className={`mt-1 text-xs ${item.risco ? "text-rose-600 dark:text-rose-300" : "text-gray-600 dark:text-zinc-400"}`}>
                    {item.texto}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                definirModalEliminacaoAberto(true);
                definirPassoEliminacao(1);
              }}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-black uppercase tracking-[0.13em] flex items-center justify-center gap-2"
            >
              <AlertTriangle size={16} />
              Exercer Direito de Eliminacao
            </button>
          </div>
        </section>
      </div>

      {toastVisivel && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="rounded-xl border border-white/20 bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-white flex items-center gap-2 shadow-2xl">
            <Check size={16} />
            {sucesso ? "Configuracoes salvas com sucesso!" : "E-mail enviado com sucesso!"}
          </div>
        </div>
      )}

      <Dialogo
        aberto={modalEliminacaoAberto}
        aoFechar={() => definirModalEliminacaoAberto(false)}
        titulo={passoEliminacao === 1 ? "Confirmar eliminacao de dados" : "Termo de consentimento"}
        larguraMax="max-w-2xl"
      >
        <div className="p-4">
          <div className="mb-4 flex gap-2">
            {[1, 2].map((step) => (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-full ${
                  step <= passoEliminacao ? "bg-gradient-to-r from-rose-500 to-rose-600" : "bg-gray-200 dark:bg-white/10"
                }`}
              />
            ))}
          </div>

          {passoEliminacao === 1 ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/70 dark:bg-rose-500/[0.05] p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-500" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-700 dark:text-rose-400">Acao irreversivel</p>
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-300/90">
                      A eliminacao da conta remove dados pessoais de forma permanente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {["Perfil", "Projetos", "Clientes", "Insumos", "Historico", "Logs"].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] px-3 py-2 text-xs text-gray-700 dark:text-zinc-300 flex items-center gap-2"
                  >
                    <Trash2 size={12} className="text-rose-500" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => definirModalEliminacaoAberto(false)}
                  className="h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 text-xs font-black uppercase tracking-[0.12em] text-gray-700 dark:text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => definirPassoEliminacao(2)}
                  className="h-10 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 text-xs font-black uppercase tracking-[0.12em] text-white"
                >
                  Continuar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="max-h-52 overflow-y-auto rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] p-3">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-gray-800 dark:text-zinc-200">
                  Termo de consentimento - Lei 13.709/2018
                </p>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-zinc-400">
                  Declaro ciencia de que a eliminacao e permanente, remove dados pessoais e pode manter apenas
                  informacoes exigidas legalmente em periodo especifico.
                </p>
              </div>

              <label className="flex items-start gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmouEliminacao}
                  onChange={(e) => definirConfirmouEliminacao(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs text-gray-700 dark:text-zinc-300">
                  Confirmo que li e aceito eliminar permanentemente minha conta e dados.
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => definirPassoEliminacao(1)}
                  className="h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 text-xs font-black uppercase tracking-[0.12em] text-gray-700 dark:text-zinc-300"
                >
                  Voltar
                </button>
                <button
                  disabled={!confirmouEliminacao}
                  className={`h-10 rounded-lg text-xs font-black uppercase tracking-[0.12em] ${
                    confirmouEliminacao
                      ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white"
                      : "bg-gray-100 dark:bg-zinc-800/50 text-gray-400 dark:text-zinc-700 cursor-not-allowed"
                  }`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialogo>
    </div>
  );
}

interface PropsCampo {
  label: string;
  valor: string;
  aoMudar: (v: string) => void;
  placeholder?: string;
  icone: typeof User;
}

function CampoDashboard({ label, valor, aoMudar, placeholder, icone: Icone }: PropsCampo) {
  return (
    <div className="w-full">
      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-zinc-500">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icone size={16} />
        </span>
        <input
          type="text"
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] pl-10 pr-3 text-sm font-semibold text-gray-800 dark:text-zinc-200 outline-none focus:border-sky-500/50"
        />
      </div>
    </div>
  );
}

interface PropsCabecalhoCard {
  titulo: string;
  descricao: string;
  icone: typeof User;
  corIcone: string;
}

function CabecalhoCard({ titulo, descricao, icone: Icone, corIcone }: PropsCabecalhoCard) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-white/10">
      <span className="rounded-xl bg-gray-100 dark:bg-white/5 p-2">
        <Icone size={18} className={corIcone} />
      </span>
      <div>
        <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">{titulo}</h2>
        <p className="text-xs text-gray-500 dark:text-zinc-500">{descricao}</p>
      </div>
    </div>
  );
}
