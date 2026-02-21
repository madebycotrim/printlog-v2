import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function PoliticaPrivacidade() {
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
            onClick={() => navigate("/seguranca-e-privacidade")}
            className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
          >
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:bg-white/10 transition-all">
              <ArrowLeft size={14} />
            </div>
            Voltar ao site
          </button>
        </nav>

        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 mb-6 backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-widest">
              LGPD & Proteção de Dados
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Política de Privacidade
          </h1>
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-medium">
            Última atualização: 17 de fevereiro de 2026
          </p>
        </header>

        {/* ── Content Sections ── */}
        <div className="space-y-12">
          <article className="prose prose-invert prose-headings:font-bold prose-headings:text-white prose-p:text-zinc-400 prose-li:text-zinc-400 max-w-none">
            {/* 1. Introdução */}
            <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 backdrop-blur-sm hover:border-white/10 transition-colors mb-12">
              <h2 className="text-xl mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-sm">
                  1
                </span>
                Introdução
              </h2>
              <p>
                O PrintLog ("nós", "nosso" ou "Plataforma") está comprometido
                com a proteção da sua privacidade. Esta Política de Privacidade
                explica como coletamos, usamos, armazenamos e protegemos seus
                dados pessoais em conformidade com a Lei Geral de Proteção de
                Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </section>

            {/* 2. Dados Coletados */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-emerald-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                2. Dados Coletados
              </h3>
              <p className="text-sm mb-2">
                Coletamos os seguintes tipos de dados:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-sm">
                <li>
                  <strong>Dados de cadastro:</strong> nome, e-mail e senha
                  criptografada.
                </li>
                <li>
                  <strong>Dados de uso:</strong> informações sobre produtos,
                  vendas, máquinas, filamentos e canais de venda que você
                  cadastra na plataforma.
                </li>
                <li>
                  <strong>Dados técnicos:</strong> logs de acesso, endereço IP e
                  informações do dispositivo para fins de segurança.
                </li>
              </ul>
            </section>

            {/* 3. Finalidade */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-emerald-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                3. Finalidade do Tratamento
              </h3>
              <p className="text-sm mb-2">Utilizamos seus dados para:</p>
              <ul className="list-disc pl-5 space-y-3 text-sm">
                <li>Fornecer e manter os serviços da plataforma;</li>
                <li>Autenticar seu acesso de forma segura;</li>
                <li>Enviar comunicações essenciais sobre sua conta;</li>
                <li>Melhorar a experiência do usuário;</li>
                <li>Cumprir obrigações legais e regulatórias.</li>
              </ul>
            </section>

            {/* 4. Compartilhamento */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-emerald-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                4. Compartilhamento de Dados
              </h3>
              <p className="text-sm leading-relaxed mb-2">
                Não vendemos, alugamos ou compartilhamos seus dados pessoais com
                terceiros para fins comerciais. Seus dados podem ser
                compartilhados apenas:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-sm">
                <li>
                  Com provedores de infraestrutura essenciais para o
                  funcionamento do serviço;
                </li>
                <li>Quando exigido por lei ou ordem judicial;</li>
                <li>Para proteger nossos direitos legais.</li>
              </ul>
            </section>

            {/* 5. Armazenamento */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-emerald-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                5. Armazenamento e Segurança
              </h3>
              <p className="text-sm leading-relaxed">
                Seus dados são armazenados em servidores seguros com
                criptografia SSL/TLS. Implementamos políticas de Row-Level
                Security (RLS) que garantem que cada usuário tenha acesso apenas
                aos seus próprios dados. Realizamos backups automáticos
                regulares para garantir a integridade das informações.
              </p>
            </section>

            {/* 6. Seus Direitos */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-emerald-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                6. Seus Direitos (LGPD)
              </h3>
              <p className="text-sm mb-2">
                Conforme a LGPD, você tem direito a:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-sm">
                <li>
                  <strong>Acesso:</strong> solicitar uma cópia dos seus dados
                  pessoais;
                </li>
                <li>
                  <strong>Correção:</strong> corrigir dados incompletos ou
                  desatualizados;
                </li>
                <li>
                  <strong>Exclusão:</strong> solicitar a exclusão dos seus
                  dados;
                </li>
                <li>
                  <strong>Portabilidade:</strong> exportar seus dados em formato
                  legível;
                </li>
                <li>
                  <strong>Revogação:</strong> revogar o consentimento a qualquer
                  momento.
                </li>
              </ul>
            </section>

            {/* 7. Retenção */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-emerald-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                7. Retenção de Dados
              </h3>
              <p className="text-sm leading-relaxed">
                Mantemos seus dados enquanto sua conta estiver ativa. Após a
                exclusão da conta, seus dados são removidos de forma permanente,
                exceto quando a retenção for necessária para cumprimento de
                obrigações legais ou resolução de disputas.
              </p>
            </section>

            {/* 8. Cookies */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-emerald-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">8. Cookies</h3>
              <p className="text-sm leading-relaxed">
                Utilizamos cookies essenciais para manter sua sessão
                autenticada. Não utilizamos cookies de rastreamento ou
                publicidade de terceiros.
              </p>
            </section>

            {/* 9. Alterações */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-emerald-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                9. Alterações nesta Política
              </h3>
              <p className="text-sm leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente.
                Notificaremos sobre alterações significativas através do e-mail
                cadastrado ou aviso na plataforma.
              </p>
            </section>

            {/* 10. Contato */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-emerald-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">10. Contato</h3>
              <p className="text-sm leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta
                política, entre em contato através do e-mail{" "}
                <a
                  href="mailto:suporte@printlog.com.br"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  suporte@printlog.com.br
                </a>
                .
              </p>
            </section>
          </article>

          {/* Disclaimer Box */}
          <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex gap-4">
            <div className="shrink-0 pt-1">
              <svg
                className="w-5 h-5 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Esta política é efetiva a partir de 2026. Se você tiver dúvidas
              sobre como lidamos com dados do usuário e informações pessoais,
              entre em contato conosco através do e-mail disponibilizado acima.
            </p>
          </div>

          {/* Footer Nav */}
          <footer className="border-t border-white/5 pt-10 text-center">
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8">
              <button
                onClick={() => navigate("/seguranca-e-privacidade")}
                className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Voltar para Segurança e Privacidade
              </button>
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
