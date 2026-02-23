import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function TermosUso() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#050507] text-zinc-900 dark:text-zinc-300 font-sans selection:bg-sky-500/30 selection:text-sky-900 dark:selection:text-sky-200 transition-colors duration-300">
      <div className="relative z-10 container mx-auto px-6 py-20 max-w-4xl">
        {/* ── Navegação ── */}
        <nav className="flex items-center justify-between mb-16 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium"
            aria-label="Voltar para a página anterior"
          >
            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 group-hover:bg-zinc-200 dark:group-hover:bg-white/10 transition-all">
              <ArrowLeft size={14} />
            </div>
            Voltar ao site
          </button>
          <button
            onClick={() => window.print()}
            className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline underline-offset-4"
            aria-label="Imprimir documento"
          >
            IMPRIMIR (CTRL+P)
          </button>
        </nav>

        {/* ── Folha ABNT ── */}
        <div className="bg-white dark:bg-transparent shadow-sm dark:shadow-none ring-1 ring-zinc-200 dark:ring-0 p-8 sm:p-12 md:p-16 rounded-sm text-base leading-relaxed">
          <header className="mb-12 text-center">
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-black dark:text-white mb-4">
              TERMOS DE USO E LICENÇA DE SOFTWARE – PRINTLOG
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              Última atualização: 23 de fevereiro de 2026.
            </p>
          </header>

          <article className="space-y-6 text-justify">
            <p className="indent-8">
              Este instrumento de "Termos de Uso" (doravante "Termo") constitui um acordo legal, vinculante e exequível, celebrado entre a <strong>PRINTLOG</strong>, detentora e licenciante do sistema e modelo de negócio (doravante "Licenciante" ou "Plataforma"), e você, pessoa física ou jurídica, ao se cadastrar e utilizar os serviços (doravante "Licenciado" ou "Usuário").
            </p>
            <p className="indent-8">
              O acesso, cadastro e uso da Plataforma implicam a aceitação total, irrevogável e irrestrita das condições aqui estabelecidas. Caso o Usuário não concorde com qualquer disposição deste Termo, deverá abster-se imediatamente de utilizar o sistema.
            </p>

            {/* ── SEÇÃO 1 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                1. DEFINIÇÕES CONCEITUAIS E NATUREZA DO SERVIÇO
              </h2>
              <p className="mb-3">
                <strong>1.1. Objeto e Natureza Jurídica:</strong> O presente Termo regulamenta o licenciamento temporário, precário, não exclusivo, revogável e intransferível de uso do software PrintLog. A Plataforma é fornecida no modelo <em>Software as a Service</em> (SaaS), hospedada na nuvem.
              </p>
              <p className="mb-3">
                <strong>1.2. Inexistência de Cessão:</strong> A utilização da Plataforma não implica subordinação, representação, ou transferência de códigos-fonte, propriedade intelectual ou banco de dados estruturais da Licenciante ao Licenciado.
              </p>
              <p className="mb-3">
                <strong>1.3. PrintLog:</strong> Plataforma de gestão desenhada especificamente para estúdios de impressão 3D, que oferece ferramentas para controle de fatiamentos, custos de filamentos, tempos de máquina, gestão de clientes e emissão de orçamentos.
              </p>
            </div>

            {/* ── SEÇÃO 2 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                2. ACESSO, CADASTRO E AUTENTICAÇÃO
              </h2>
              <p className="mb-3">
                <strong>2.1. Requisitos de Capacidade:</strong> Para utilizar a Plataforma, o Usuário assegura ter capacidade civil plena ou estar legitimamente representado, sendo responsável por quaisquer atos praticados em nome da pessoa jurídica cadastrada.
              </p>
              <p className="mb-3">
                <strong>2.2. Veracidade dos Dados:</strong> O Usuário compromete-se a fornecer informações precisas, atualizadas e completas durante o cadastro, assumindo responsabilidade civil e criminal (falsidade ideológica) pela exatidão dos dados.
              </p>
              <p className="mb-3">
                <strong>2.3. Autenticação e Sigilo:</strong> As credenciais de acesso (login e senha) são pessoais e intransferíveis. O Usuário é o único responsável pela guarda e confidencialidade de suas credenciais, devendo notificar a PrintLog imediatamente em caso de acesso não autorizado, suspeita de vazamento de senha ou quebra de segurança.
              </p>
            </div>

            {/* ── SEÇÃO 3 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                3. RESPONSABILIDADES DO USUÁRIO
              </h2>
              <p className="mb-3">
                São deveres inalienáveis do Usuário, sob pena de rescisão e responsabilização legal:
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800">
                <strong>3.1. Uso Lícito:</strong> Utilizar a Plataforma para fins estritamente lícitos e ligados à gestão do próprio estúdio de impressão 3D, respeitando a legislação brasileira em vigor, a moral e os bons costumes.
              </p>
              <p className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800">
                <strong>3.2. Dados de Clientes Finais:</strong> O Usuário compreende que atua como Controlador dos dados pessoais de seus próprios clientes inseridos na Plataforma, de acordo com a Lei Geral de Proteção de Dados (LGPD - nº 13.709/2018). É dever do Usuário recolher o consentimento ou garantir outra base legal antes de qualificar seus clientes na Plataforma.
              </p>
              <div className="mb-3 pl-6 border-l-2 border-zinc-200 dark:border-zinc-800">
                <strong>3.3. Proibições Técnicas:</strong> É terminantemente proibido:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Realizar engenharia reversa, descompilação ou desmontagem da Plataforma;</li>
                  <li>Utilizar <em>crawlers</em>, robôs, <em>scripts</em> ou ferramentas automatizadas de extração de dados;</li>
                  <li>Sublicenciar, revender, alugar, ou ceder os direitos de uso do software a terceiros;</li>
                  <li>Transmitir vírus, malwares ou executar ataques de negação de serviço (DDoS).</li>
                </ul>
              </div>
            </div>

            {/* ── SEÇÃO 4 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                4. LIMITAÇÃO DE RESPONSABILIDADE E EXCLUSÃO DE GARANTIAS
              </h2>
              <p className="mb-3">
                <strong>4.1. Plataforma "As Is":</strong> O sistema é fornecido no estado em que se encontra (<em>"as is"</em> e <em>"as available"</em>), sem garantias expressas ou implícitas de adequação a fins particulares, escalabilidade ilimitada ou infalibilidade comercial.
              </p>
              <p className="mb-3">
                <strong>4.2. Inexistência de Garantia de Lucros:</strong> A PrintLog é exclusivamente uma ferramenta de gestão e controle, não assegurando incremento de vendas, clientes ou receitas para o estúdio do Usuário.
              </p>
              <p className="mb-3">
                <strong>4.3. Isenção de Danos Indiretos:</strong> A Licenciante não poderá ser responsabilizada, em nenhuma hipótese, por lucros cessantes, perda de receita, perda de dados causadas por negligência do Usuário (como exclusão acidental de informações de clientes), falhas de conexão de internet do Usuário, ou indisponibilidades de provedores terceiros (como Cloud, Supabase, ou Gateways de Pagamento).
              </p>
              <p className="mb-3">
                <strong>4.4. Limite de Indenização:</strong> Na extensão máxima permitida por lei, a responsabilidade civil total e acumulada da PrintLog limitar-se-á, caso aplicável, ao valor pago pelo Usuário para acesso à plataforma nos últimos 12 (doze) meses.
              </p>
            </div>

            {/* ── SEÇÃO 5 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                5. NÍVEIS DE SERVIÇO (SLA) E DISPONIBILIDADE
              </h2>
              <p className="mb-3">
                <strong>5.1. Esforço Operacional:</strong> A PrintLog empregará seus melhores esforços comerciais para manter o sistema operacional com uma disponibilidade estimada de 99% (noventa e nove por cento).
              </p>
              <p className="mb-3">
                <strong>5.2. Exclusões Funcionais:</strong> Interrupções decorrentes de manutenções preventivas programadas (notificadas com antecedência), eventos de força maior, instabilidades em provedores terceiros ou na infraestrutura do próprio Usuário não serão qualificadas como violação de disponibilidade.
              </p>
            </div>

            {/* ── SEÇÃO 6 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                6. PROPRIEDADE INTELECTUAL E DIREITOS AUTORAIS
              </h2>
              <p className="mb-3">
                <strong>6.1. Titularidade:</strong> Todo o conteúdo estrutural da Plataforma, incluindo códigos, <em>layout</em>, bases de dados organizacionais, algoritmos de cálculo, <em>design tokens</em>, logomarcas, marcas registradas e nomes de domínio, pertencem irrestritamente à Licenciante, amparados pelas Leis nº 9.609/1998 (Lei do Software) e nº 9.279/1996 (Propriedade Industrial).
              </p>
              <p className="mb-3">
                <strong>6.2. Uso de Brand:</strong> Nenhuma disposição contida neste Termo garante ao Licenciado direito de usar patentes, marcas ou <em>trade dress</em> da PrintLog sem prévia autorização por escrito.
              </p>
            </div>

            {/* ── SEÇÃO 7 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                7. EVOLUÇÃO DA PLATAFORMA E POLÍTICA COMERCIAL
              </h2>
              <p className="mb-3">
                <strong>7.1. Mudanças de Escopo:</strong> A PrintLog reserva-se o direito de realizar atualizações contínuas de interface, adições de módulos ou remoção de funcionalidades legadas, visando a melhoria do software.
              </p>
              <p className="mb-3">
                <strong>7.2. Fases de Monetização:</strong> A versão atual pode ser submetida a planos comissionados, gratuitos (<em>freemium</em>), ou modelos de assinatura (Premium, Pro). A implementação de cobranças ou restrições de limite (múltiplos usuários, limitação de chamadas via API, volume de uploads) será comunicada antecipadamente ao Usuário através do e-mail cadastrado ou de notificações via interface, podendo o Usuário rescindir o termo caso discorde da migração.
              </p>
            </div>

            {/* ── SEÇÃO 8 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                8. TRATAMENTO DE DADOS (CONTROLADOR VS OPERADOR)
              </h2>
              <p className="mb-3">
                <strong>8.1. Papel da PrintLog:</strong> Para os dados cadastrais do próprio administrador/Usuário, a PrintLog atua como Controladora. Para os dados inseridos ativamente no sistema referentes à gestão do estúdio de impressão (clientes do usuário, peças impressas), a PrintLog atua estritamente como Operadora, fornecendo apenas o espaço de armazenamento e as ferramentas de processamento das informações, não exercendo controle ou escopo de uso autônomo sobre essas parcelas (conforme detalhado na Política de Privacidade).
              </p>
            </div>

            {/* ── SEÇÃO 9 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                9. SUSPENSÃO DOS SERVIÇOS, RESCISÃO E EXCLUSÃO DA CONTA
              </h2>
              <p className="mb-3">
                <strong>9.1. Direito de Rescisão:</strong> O Usuário poderá, a qualquer tempo, encerrar este Termo por meio do cancelamento e exclusão de sua conta nos recursos da própria Plataforma.
              </p>
              <p className="mb-3">
                <strong>9.2. Suspensão por Descumprimento:</strong> A PrintLog reserva-se o direito de, a seu exclusivo critério, suspender parcial ou definitivamente o acesso do Usuário em caso de identificação de uso indevido, atividades ilícitas, inadimplência financeira (caso aplicável) ou suspeita de fraude contumaz com dados da plataforma.
              </p>
              <p className="mb-3">
                <strong>9.3. Efeitos do Encerramento:</strong> Após a rescisão, o direito de utilizar a Plataforma cessa imediatamente. O acesso à base de clientes do estúdio poderá ser extraído pelo Usuário previamente. A PrintLog excluirá (ou anonimizará) os dados pessoais na medida em que obrigações legais de guarda expirarem.
              </p>
            </div>

            {/* ── SEÇÃO 10 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                10. DISPOSIÇÕES GERAIS E FORO APLICÁVEL
              </h2>
              <p className="mb-3">
                <strong>10.1. Modificações do Termo:</strong> Este Termo pode ser modificado a qualquer tempo mediante aviso prévio estipulado na plataforma. O uso contínuo após as alterações constitui validação das novas regras.
              </p>
              <p className="mb-3">
                <strong>10.2. Nulidade Parcial:</strong> Se qualquer cláusula deste instrumento for julgada nula ou inválida, as demais disposições permanecerão vigentes garantindo o sentido econômico e funcional da outorga original.
              </p>
              <p className="mb-3">
                <strong>10.3. Tolerância:</strong> A tolerância ou condescendência na aplicação imediata das sanções cabíveis ou na exigência de cumprimento de obrigações não significa renúncia ao direito legal ("<em>waiver</em>").
              </p>
              <p className="mb-3">
                <strong>10.4. Foro:</strong> Fica eleito preferencialmente o foro da Comarca do domicilio comercial da PrintLog (ou, na proteção legal consumerista stricto sensu se aplicável, o domicílio do impetrante) no Brasil, renunciando ambas as partes a qualquer outro, por mais privilegiado que seja, para dirimir eventuais litígios judiciais relativos a este contrato.
              </p>
            </div>

            <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm font-medium">
              <p className="mt-2 text-sky-600 dark:text-sky-400">suporte@printlog.com.br</p>
            </div>
          </article>
        </div>

        <footer className="mt-12 text-center print:hidden">
          <div className="flex justify-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar para a página anterior
            </button>
          </div>
          <p className="text-xs text-zinc-500">
            Este documento está em total conformidade e estrutura de acordo com as determinações da ABNT.
            <br />© 2026 PrintLog. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
}
