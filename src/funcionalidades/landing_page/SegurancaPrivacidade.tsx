import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function SegurancaPrivacidade() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-300 font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* ── Background Effects (Shared with Landing) ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#050507]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
        <div
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px] mix-blend-screen animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] mix-blend-screen animate-pulse"
          style={{ animationDuration: "6s" }}
        />

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            maskImage:
              "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 max-w-4xl">
        {/* ── Header ── */}
        <nav className="flex items-center justify-between mb-16">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
          >
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:bg-white/10 transition-all">
              <ArrowLeft size={14} />
            </div>
            Voltar ao site
          </button>
        </nav>

        <header className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-400 mb-6 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Segurança e Privacidade
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">
            No PrintLog, a proteção dos seus
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
              dados é nossa prioridade.
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Conheça como mantemos suas informações seguras e resguardamos sua
            privacidade com tecnologias de ponta e políticas transparentes.
          </p>
        </header>

        {/* ── Content Sections ── */}
        <div className="space-y-16">
          {/* Section 1: Data Ownership */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-sm relative overflow-hidden group hover:border-sky-500/20 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-sky-500/10 transition-colors" />

            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white pt-2">
                Seus dados pertencem a você
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3">
                <h3 className="text-white font-semibold">
                  Dados completamente isolados
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Cada conta possui dados separados e inacessíveis por outros
                  usuários. Utilizamos{" "}
                  <strong className="text-sky-300">
                    Row-Level Security (RLS)
                  </strong>{" "}
                  no banco de dados para garantir o isolamento completo.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-white font-semibold">
                  Sem acesso administrativo
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  A equipe do PrintLog não possui acesso aos seus relatórios,
                  vendas, produtos ou informações estratégicas do seu negócio.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Technical Protection */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/5 pb-4">
              Proteção técnica
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Criptografia SSL/TLS",
                  desc: "Todas as conexões são protegidas com criptografia SSL de ponta a ponta, garantindo que seus dados não possam ser interceptados.",
                  icon: "lock",
                },
                {
                  title: "Armazenamento seguro",
                  desc: "Utilizamos infraestrutura de nível empresarial com servidores seguros e políticas de acesso rigorosas.",
                  icon: "server",
                },
                {
                  title: "Controle de acesso",
                  desc: "Sistema de autenticação robusto com verificação de e-mail e proteção contra senhas comprometidas.",
                  icon: "shield-check",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon
                      name={item.icon}
                      className="w-5 h-5 text-zinc-400 group-hover:text-white"
                    />
                  </div>
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Transparency & LGPD */}
          <div className="grid md:grid-cols-2 gap-8">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/5 pb-4">
                Transparência
              </h2>
              <ul className="space-y-5">
                <li className="flex gap-4">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold text-sm">
                      Sem compartilhamento com terceiros
                    </h4>
                    <p className="text-zinc-400 text-sm mt-1">
                      Seus dados pessoais e informações de negócio nunca são
                      compartilhados com empresas terceiras, parceiros ou
                      anunciantes.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold text-sm">
                      Métricas anônimas
                    </h4>
                    <p className="text-zinc-400 text-sm mt-1">
                      Podemos utilizar métricas globais anônimas e agregadas
                      (como número total de usuários) apenas para melhoria do
                      produto.
                    </p>
                  </div>
                </li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/5 pb-4">
                Direitos (LGPD)
              </h2>
              <div className="grid gap-4">
                <div className="p-4 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 transition-colors cursor-default">
                  <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                    <Icon name="download" className="w-4 h-4 text-zinc-400" />{" "}
                    Exportar dados
                  </h4>
                  <p className="text-zinc-500 text-xs">
                    Baixe todos os seus dados em formato CSV a qualquer momento.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-dashed border-zinc-700 hover:border-red-500/50 hover:bg-red-500/5 transition-colors cursor-default group">
                  <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2 group-hover:text-red-400">
                    <Icon
                      name="trash"
                      className="w-4 h-4 text-zinc-400 group-hover:text-red-400"
                    />{" "}
                    Excluir conta
                  </h4>
                  <p className="text-zinc-500 text-xs">
                    Solicite a exclusão completa da sua conta e dados
                    associados.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Coming Soon */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 p-8">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Icon name="finger-print" className="w-8 h-8" />
              </div>
              <div className="text-center md:text-left">
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-indigo-500 text-white mb-2">
                  Em breve
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  Autenticação em Dois Fatores (2FA)
                </h3>
                <p className="text-zinc-400 text-sm max-w-xl">
                  Estamos desenvolvendo a autenticação em dois fatores para
                  adicionar uma camada extra de segurança à sua conta. Você
                  poderá utilizar aplicativos como Google Authenticator.
                </p>
              </div>
            </div>
          </section>

          {/* Footer Links */}
          <footer className="border-t border-white/5 pt-10 mt-10 text-center">
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <a
                href="/politica-de-privacidade"
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Política de Privacidade
              </a>
              <span className="text-zinc-800">•</span>
              <a
                href="/termos-de-uso"
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Termos de Uso
              </a>
              <span className="text-zinc-800">•</span>
              <a
                href="mailto:contato@printlog.com.br"
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Contato
              </a>
            </div>
            <p className="text-xs text-zinc-600">
              © 2026 PrintLog. Todos os direitos reservados.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function Icon({ name, className }: { name: string; className?: string }) {
  const icons: any = {
    lock: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    ),
    server: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
      />
    ),
    "shield-check": (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    download: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    ),
    trash: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    ),
    "finger-print": (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
      />
    ),
  };

  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {icons[name] || null}
    </svg>
  );
}
