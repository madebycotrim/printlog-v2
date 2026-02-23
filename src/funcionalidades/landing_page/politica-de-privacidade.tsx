import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function PoliticaPrivacidade() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#050507] text-zinc-900 dark:text-zinc-300 font-sans selection:bg-emerald-500/30 selection:text-emerald-900 dark:selection:text-emerald-200 transition-colors duration-300">
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
              POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS – PRINTLOG
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              Última atualização: 23 de fevereiro de 2026.
            </p>
          </header>

          <article className="space-y-6 text-justify">
            <p className="indent-8">
              A <strong>PRINTLOG</strong> (doravante, "Nós", "Controladora" ou "Plataforma") está rigidamente comprometida com a proteção da privacidade e dos dados pessoais de todos os nossos usuários. Esta Política de Privacidade formaliza as diretrizes adotadas sobre a coleta, uso, compartilhamento, armazenamento e eliminação de dados mediante a utilização de nosso sistema <em>SaaS</em> focado em gestão de estúdios de impressão 3D, conforme preceitos da Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e do Marco Civil da Internet (MCI - Lei nº 12.965/2014).
            </p>
            <p className="indent-8">
              Ao utilizar o PrintLog, o Usuário manifesta o aceite amplo, expresso e informado às previsões deste compêndio.
            </p>

            {/* ── SEÇÃO 1 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                1. IDENTIFICAÇÃO DO CONTROLADOR E PAPÉIS JURÍDICOS
              </h2>
              <p className="mb-3">
                Para os fins da legislação de privacidade, faz-se estritamente necessária a distinção de papéis assumidos pela Plataforma:
              </p>
              <p className="mb-3 pl-6">
                <strong>1.1. PrintLog como CONTROLADORA:</strong> Quando a PrintLog coleta dados cadastrais e financeiros diretamente do representante legal ou da pessoa física que administra o estúdio de impressão 3D (para criar o cadastro no sistema, acesso à plataforma e gestão de faturamento do plano), nós tomamos as decisões relativas ao tratamento.
              </p>
              <p className="mb-3 pl-6">
                <strong>1.2. PrintLog como OPERADORA:</strong> Quando o Usuário insere na plataforma os dados dos seus próprios clientes finais (ex: nome do consumidor que comprou a peça 3D, valor pago, endereço de entrega), a PrintLog atua exclusivamente como Operadora. Todo o processamento destes dados é efetuado estritamente pelas diretrizes do Usuário (Controlador Final). A PrintLog não utilizará dados dos clientes finais para envio de marketing, comercialização com terceiros ou ações discricionárias próprias.
              </p>
            </div>

            {/* ── SEÇÃO 2 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                2. QUAIS DADOS COLETAMOS E SUAS FINALIDADES
              </h2>
              <p className="mb-3">
                Em conformidade à premissa do <em>Privacy by Design</em> e ao princípio da minimização, capturamos unicamente os dados indispensáveis.
              </p>
              <div className="mb-3 pl-6 space-y-4">
                <p>
                  <strong>2.1. Dados Cadastrais do Usuário (Estúdio):</strong> Nome, Razão Social, endereço eletrônico (e-mail), senha criptografada e CPF/CNPJ.<br />
                  <em>Finalidade:</em> Criação de Identidade, autenticação na plataforma, comunicação de suporte e faturamento de assinatura.<br />
                  <em>Base Legal:</em> Execução de Contrato (Art. 7º, inc. V) e Cumprimento de Obrigação Legal (Art. 7º, inc. II da LGPD).
                </p>
                <p>
                  <strong>2.2. Dados Financeiros/Pagamento (Se aplicável via Gateway):</strong> Informações de cartão de crédito e metadados transacionais.<br />
                  <em>Finalidade:</em> Efetivação do pagamento do serviço. (Dados sensíveis curados por tokenização das Gateways).<br />
                  <em>Base Legal:</em> Execução de Contrato e Exercício Regular de Direitos.
                </p>
                <p>
                  <strong>2.3. Dados Coletados Automaticamente (Logs do Marco Civil):</strong> Protocolo de Internet (Endereço IP), registro de datas e horários de conexão (<em>timestamp</em>) e navegador.<br />
                  <em>Finalidade:</em> Segurança da Informação, rastreabilidade de acessos.<br />
                  <em>Base Legal:</em> Cumprimento de Obrigação Legal – MCI e Legítimo Interesse.
                </p>
              </div>
            </div>

            {/* ── SEÇÃO 3 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                3. POLÍTICA DE COOKIES E RASTREADORES
              </h2>
              <p className="mb-3">
                Para otimizar e fundamentar as funcionalidades da nossa infraestrutura SaaS, fazemos uso de identificadores armazenados localmente no dispositivo (Cookies e afins):
              </p>
              <ul className="list-disc pl-11 mb-3 space-y-2">
                <li>
                  <strong>Cookies Estritamente Necessários (Técnicos):</strong> Essenciais para que o portal opere, permitindo controle de sessões, balanceamento de tráfego de rede e segurança (CSRF). Por serem intrínsecos à aplicação, o aceite decorre da execução do contrato.
                </li>
                <li>
                  <strong>Cookies Analíticos (Desempenho):</strong> Opcionais e condicionados à permissão modal do usuário. Permitem contabilizar métricas de acesso contínuo.
                </li>
              </ul>
              <p className="mb-3 pl-6">
                <strong>3.1. Desativação:</strong> O usuário tem o direito soberano de gerenciar o bloqueio de cookies em seu próprio navegador, porém isentando-nos em situações de eventuais perdas e limitações operacionais proveniente da restrição técnica.
              </p>
            </div>

            {/* ── SEÇÃO 4 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                4. COMPARTILHAMENTO COM TERCEIROS E TRANSFERÊNCIA INTERNACIONAL
              </h2>
              <p className="mb-3">
                <strong>4.1. Operadores Homologados:</strong> O compromisso da PrintLog é operar um modelo seguro e sem comercialização de dados ("venda"). O compartilhamento está delimitado ao sub-processamento operacional indispensável perante provedores de nuvem (Ex: Supabase, AWS/GCP, Stripe/Pagar.me, envios de e-mail).
              </p>
              <p className="mb-3">
                <strong>4.2. Dever de Sigilo:</strong> Todos os subcontratados firmam obrigações equivalentes ou superiores em cota de sigilo e rigor em proteção de dados.
              </p>
              <p className="mb-3">
                <strong>4.3. Transferência Internacional:</strong> Devido ao processamento por <em>Cloud Computing</em>, os bancos de dados podem transitar fora do território nacional (EUA ou Europa). A PrintLog garante a utilização de agentes que detenham os mais restritivos padrões de validade (<em>Standard Contractual Clauses</em> e SOC 2).
              </p>
            </div>

            {/* ── SEÇÃO 5 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                5. TEMPO DE RETENÇÃO E PROCEDIMENTO DE DESCARTE
              </h2>
              <p className="mb-3">
                Manteremos as informações unicamente pelo ciclo temporal hábil para satisfazer as finalidades descritas, ou até o trânsito do pedido de eliminação integral solicitado pelo Titular.
              </p>
              <p className="mb-3 pl-6">
                <strong>5.1. Obrigação de Guarda Legal:</strong> Mesmo após a rescisão de contrato, manteremos informações imprescindíveis para execução de defesas jurídicas e o cumprimento do Art. 15 do MCI (logs por 6 meses) e retenções fiscais estaduais (até 5 anos).
              </p>
              <p className="mb-3 pl-6">
                <strong>5.2. Descarte Técnico Seguro:</strong> Quando superada a barreira dos fins previstos, as informações serão apagadas ou submetidas ao processo de anonimização mecânica.
              </p>
            </div>

            {/* ── SEÇÃO 6 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                6. SEGURANÇA DA INFORMAÇÃO E COMUNICAÇÃO DE INCIDENTES
              </h2>
              <p className="mb-3">
                <strong>6.1. Medidas de Seguridade:</strong> O acesso é contido através de encriptografia de campo transitório (AES-256 e TLS), controle de autenticação interna (<em>Row Level Security</em>) e segregação departamental.
              </p>
              <p className="mb-3">
                <strong>6.2. Notificações de Incidente:</strong> Se submetida a evento de quebra de arquitetura com real potencial de dano ao indivíduo, a Plataforma formalmente enviará notificação à ANPD e aos Titulares impactados contendo o escopo dos dados envolvidos e contenções.
              </p>
            </div>

            {/* ── SEÇÃO 7 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                7. OS DIREITOS DO TITULAR DOS DADOS
              </h2>
              <p className="mb-3">
                Prestigia-se a liberdade jurídica do titular estipulada no art. 18 da LGPD, contemplando:
              </p>
              <ul className="list-decimal pl-11 mb-3 space-y-2">
                <li><strong>Confirmação e Acesso:</strong> Evidência da operação e cópia acessível dos dados.</li>
                <li><strong>Correção:</strong> Reparo de dados inexatos, velhos ou fragmentários.</li>
                <li><strong>Eliminação:</strong> Requerer a extinção de registros tratados via consentimento.</li>
                <li><strong>Portabilidade:</strong> Exportação autônoma da matriz de dados de forma legível.</li>
                <li><strong>Revogação:</strong> Interrupção do tratamento outrora ratificado.</li>
              </ul>
            </div>

            {/* ── SEÇÃO 8 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                8. DADOS DE CLIENTES DOS ESTÚDIOS E MENORES DE IDADE
              </h2>
              <p className="mb-3">
                <strong>8.1. Clientes do Estúdio:</strong> Se o Usuário insere dados de eventuais clientes (pedidos de peças 3D), este deverá suportar perante si a anuência jurídica desses indivíduos. A PrintLog é salvaguarda apenas do processamento como ferramenta logística.
              </p>
              <p className="mb-3">
                <strong>8.2. Proteção de Menores:</strong> A plataforma não é desenhada ou direcionada para menores de idade. A observância e curadoria de dados de clientes do estúdio menores caberá inteiramente à responsabilidade de gerência do Usuário.
              </p>
            </div>

            {/* ── SEÇÃO 9 ── */}
            <div className="pt-6">
              <h2 className="text-lg font-bold uppercase text-black dark:text-white mb-4">
                9. CONDIÇÕES GERAIS E ATENDIMENTO PARA EXERCÍCIO DE DIREITOS
              </h2>
              <p className="mb-3">
                Esta Política poderá suportar revisões pontuais face a inovações legislativas. O Encarregado de Proteção de Dados (DPO) encontra-se disponível incondicionalmente a responder aos titulares no respectivo endereço de contato.
              </p>
            </div>

            <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm font-medium">
              <p className="mt-2 text-emerald-600 dark:text-emerald-400">privacidade@printlog.com.br</p>
            </div>
          </article>
        </div>

        <footer className="mt-12 text-center print:hidden">
          <div className="flex justify-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition-colors flex items-center gap-2"
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
