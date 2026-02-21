import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function TermosUso() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-300 mb-6 backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Documento Legal
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Termos de Uso
          </h1>
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-medium">
            Última atualização: 17 de fevereiro de 2026
          </p>
        </header>

        {/* ── Content Sections ── */}
        <div className="space-y-12">
          <article className="prose prose-invert prose-headings:font-bold prose-headings:text-white prose-p:text-zinc-400 prose-li:text-zinc-400 max-w-none">
            {/* 1. Aceitação */}
            <section className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 backdrop-blur-sm hover:border-white/10 transition-colors mb-12">
              <h2 className="text-xl mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-sm">
                  1
                </span>
                Aceitação dos Termos
              </h2>
              <p>
                Ao acessar e utilizar o PrintLog ("Plataforma"), você concorda
                com estes Termos de Uso. Se você não concordar com qualquer
                parte destes termos, não deve utilizar nossos serviços.
              </p>
            </section>

            {/* 2. Descrição */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-sky-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                2. Descrição do Serviço
              </h3>
              <p className="text-sm leading-relaxed">
                O PrintLog é uma plataforma de gestão e precificação para
                profissionais de impressão 3D. O serviço permite calcular custos
                de produção, gerenciar vendas, controlar estoque de filamentos e
                insumos, cadastrar impressoras e analisar a rentabilidade do seu
                negócio.
              </p>
            </section>

            {/* 3. Cadastro */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-sky-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                3. Cadastro e Conta
              </h3>
              <ul className="list-disc pl-5 space-y-3 text-sm">
                <li>
                  Você deve fornecer informações verdadeiras e atualizadas no
                  cadastro;
                </li>
                <li>
                  Você é responsável por manter a confidencialidade da sua
                  senha;
                </li>
                <li>
                  Você é responsável por todas as atividades realizadas em sua
                  conta;
                </li>
                <li>
                  Você deve notificar imediatamente sobre qualquer uso não
                  autorizado.
                </li>
              </ul>
            </section>

            {/* 4. Uso Aceitável */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-sky-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                4. Uso Aceitável
              </h3>
              <p className="text-sm mb-2">Você concorda em não:</p>
              <ul className="list-disc pl-5 space-y-3 text-sm">
                <li>Violar leis ou regulamentos aplicáveis;</li>
                <li>Tentar acessar dados de outros usuários;</li>
                <li>Interferir no funcionamento da plataforma;</li>
                <li>
                  Utilizar o serviço para atividades ilegais ou fraudulentas;
                </li>
                <li>Compartilhar sua conta com terceiros.</li>
              </ul>
            </section>

            {/* 5. Planos */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-sky-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                5. Planos e Pagamentos
              </h3>
              <p className="text-sm leading-relaxed">
                A plataforma oferece planos gratuito (Free) e pago (Pro). O
                plano Pro oferece funcionalidades adicionais mediante pagamento.
                Os valores e condições estão disponíveis na página de upgrade.
                Pagamentos são processados de forma segura através de parceiros
                autorizados.
              </p>
            </section>

            {/* 6. Propriedade Intelectual */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-sky-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                6. Propriedade Intelectual
              </h3>
              <p className="text-sm leading-relaxed">
                Todo o conteúdo da plataforma, incluindo código, design, textos
                e marca, é propriedade do PrintLog. Os dados que você insere na
                plataforma permanecem de sua propriedade.
              </p>
            </section>

            {/* 7. Disponibilidade */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-sky-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                7. Disponibilidade do Serviço
              </h3>
              <p className="text-sm leading-relaxed">
                Nos esforçamos para manter o serviço disponível 24/7, mas não
                garantimos disponibilidade ininterrupta. Podemos realizar
                manutenções programadas ou emergenciais quando necessário.
              </p>
            </section>

            {/* 8. Limitação */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-sky-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                8. Limitação de Responsabilidade
              </h3>
              <p className="text-sm leading-relaxed">
                A plataforma é fornecida "como está". Não nos responsabilizamos
                por decisões de negócio tomadas com base nos cálculos e
                relatórios gerados. Você é responsável por verificar a precisão
                das informações inseridas e dos resultados obtidos.
              </p>
            </section>

            {/* 9. Encerramento */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-sky-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                9. Encerramento
              </h3>
              <p className="text-sm leading-relaxed">
                Você pode encerrar sua conta a qualquer momento através das
                configurações do sistema. Reservamo-nos o direito de suspender
                ou encerrar contas que violem estes termos.
              </p>
            </section>

            {/* 10. Alterações */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-sky-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                10. Alterações nos Termos
              </h3>
              <p className="text-sm leading-relaxed">
                Podemos atualizar estes Termos de Uso periodicamente. Alterações
                significativas serão comunicadas através do e-mail cadastrado ou
                aviso na plataforma. O uso continuado após as alterações
                constitui aceitação dos novos termos.
              </p>
            </section>

            {/* 11. Lei */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-sky-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">
                11. Lei Aplicável
              </h3>
              <p className="text-sm leading-relaxed">
                Estes termos são regidos pelas leis da República Federativa do
                Brasil. Qualquer disputa será resolvida nos tribunais
                competentes do Brasil.
              </p>
            </section>

            {/* 12. Contato */}
            <section className="pl-4 border-l-2 border-white/5 hover:border-sky-500/50 transition-colors mb-12">
              <h3 className="text-lg text-white font-bold mb-2">12. Contato</h3>
              <p className="text-sm leading-relaxed">
                Para dúvidas sobre estes termos, entre em contato através do
                e-mail{" "}
                <a
                  href="mailto:suporte@printlog.com.br"
                  className="text-sky-400 hover:text-sky-300"
                >
                  suporte@printlog.com.br
                </a>
                .
              </p>
            </section>
          </article>

          {/* Disclaimer Box */}
          <div className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
            <div className="shrink-0 pt-1">
              <svg
                className="w-5 h-5 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              O PrintLog pode revisar estes termos de serviço a qualquer
              momento, sem aviso prévio. Ao usar esta plataforma, você concorda
              em ficar vinculado à versão atual desses termos de serviço.
            </p>
          </div>

          {/* Footer Nav */}
          <footer className="border-t border-white/5 pt-10 text-center">
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8">
              <button
                onClick={() => navigate("/seguranca-e-privacidade")}
                className="text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-2"
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
