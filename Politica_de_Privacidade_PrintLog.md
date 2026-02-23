# POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS – PRINTLOG

**Última atualização:** 23 de fevereiro de 2026.

A **PRINTLOG** (doravante, "Nós", "Controladora" ou "Plataforma") está rigidamente comprometida com a proteção da privacidade e dos dados pessoais de todos os nossos usuários. Esta Política de Privacidade formaliza as diretrizes adotadas sobre a coleta, uso, compartilhamento, armazenamento e eliminação de dados mediante a utilização de nosso sistema *SaaS* focado em gestão de estúdios de impressão 3D, conforme preceitos da Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e do Marco Civil da Internet (MCI - Lei nº 12.965/2014).

Ao utilizar o PrintLog, o Usuário manifesta o aceite amplo, expresso e informado às previsões deste compêndio.

---

## 1. IDENTIFICAÇÃO DO CONTROLADOR E PAPÉIS JURÍDICOS

Para os fins da legislação de privacidade, faz-se estritamente necessária a distinção de papéis assumidos pela Plataforma:

**1.1. PrintLog como CONTROLADORA:**
Quando a PrintLog coleta dados cadastrais e financeiros diretamente do representante legal ou da pessoa física que administra o estúdio de impressão 3D (para criar o cadastro no sistema, acesso à plataforma e gestão de faturamento do plano), nós tomamos as decisões relativas ao tratamento.

**1.2. PrintLog como OPERADORA:**
Quando o Usuário insere na plataforma os dados dos **seus próprios clientes finais** (ex: nome do consumidor que comprou a peça 3D, valor pago, endereço de entrega), a PrintLog atua exclusivamente como **Operadora**. Todo o processamento destes dados é efetuado estritamente pelas diretrizes do Usuário (Controlador Final). A PrintLog não utilizará dados dos clientes finais para envio de marketing, comercialização com terceiros ou ações discricionárias próprias.

## 2. QUAIS DADOS COLETAMOS E SUAS FINALIDADES

Em conformidade à premissa do *Privacy by Design* e ao princípio da minimização, capturamos unicamente os dados indispensáveis.

*   **Dados Cadastrais do Usuário (Estúdio):** Nome, Razão Social, endereço eletrônico (e-mail), senha criptografada e CPF/CNPJ.
    *   *Finalidade:* Criação de Identidade, autenticação na plataforma, comunicação de suporte e faturamento de assinatura.
    *   *Base Legal (Art. 7 LGPD):* Execução de Contrato (inc. V) e Cumprimento de Obrigação Legal (inc. II).
*   **Dados Financeiros/Pagamento (Se aplicável via Gateway):** Informações de cartão de crédito e metadados transacionais.
    *   *Finalidade:* Efetivação do pagamento do serviço/sistema SaaS da PrintLog.
    *   *Nota estrutural:* Dados sensíveis de cartão não são armazenados nos servidores da PrintLog, sendo tokenizados e administrados diretamente pelas entidades Gateway de Pagamentos.
    *   *Base Legal:* Execução de Contrato e Exercício Regular de Direitos.
*   **Dados Coletados Automaticamente (Logs do Marco Civil):** Protocolo de Internet (Endereço IP), registro de datas e horários de conexão (*timestamp*), e dados do navegador (User-Agent).
    *   *Finalidade:* Segurança da Informação, rastreabilidade de acessos e fornecimento em caso de ordens judiciais.
    *   *Base Legal:* Cumprimento de Obrigação Legal – Marco Civil da Internet (retenção obrigatória imposta de até 6 meses) e Legítimo Interesse (segurança).

## 3. POLÍTICA DE COOKIES E RASTREADORES

Para otimizar e fundamentar as funcionalidades da nossa infraestrutura SaaS, fazemos uso de identificadores armazenados localmente no dispositivo (Cookies e afins):

*   **Cookies Estritamente Necessários (Técnicos):** Essenciais para que o portal opere, permitindo controle de sessões, balanceamento de tráfego de rede e segurança anti-cross-site (CSRF). Por serem intrínsecos à funcionalidade da aplicação, seu aceite é atrelado à navegação contínua no site e execução do contrato.
*   **Cookies Analíticos (Desempenho):** Opcionais e condicionados à permissão modal do usuário. Permitem contabilizar métricas de acesso para melhorar a *Dashboard* e o fluxo contínuo.
*   *Desativação:* O usuário tem o direito soberano de gerenciar o bloqueio de cookies em seu próprio navegador, porém isentando-nos em situações de eventuais perdas e limitações operacionais proveniente da restrição excessiva aos cookies técnicos.

## 4. COMPARTILHAMENTO COM TERCEIROS E TRANSFERÊNCIA INTERNACIONAL

**4.1. Operadores Homologados:** O compromisso da PrintLog é operar um modelo seguro e sem comercialização de dados ("venda"). O compartilhamento está delimitado ao sub-processamento operacional indispensável, perante as seguintes categorias de fornecedores e *Cloud Providers* (Ex: Supabase API, soluções AWS/GCP, provedores transacionais como Stripe/Pagar.me, serviços de envio de e-mail).

**4.2. Dever de Sigilo:** Todos os agentes de tratamento subcontratados firmam obrigações equivalentes ou superiores em cota de sigilo e rigor em proteção de dados.

**4.3. Transferência Internacional:** Em razão do processamento por nuvem (*Cloud Computing*), os bancos de dados podem transitar e ser processados fora do território nacional, preponderantemente localizados nos EUA ou Europa. Nós garantimos a utilização prioritária de agentes de tratamento que detenham avaliações do mais restritivo padrão de *compliance* de proteção (ex: Modelos contratuais padrão – *Standard Contractual Clauses*, certidões SOC 2 Tipo II).

## 5. TEMPO DE RETENÇÃO E PROCEDIMENTO DE DESCARTE

Manteremos as informações unicamente pelo ciclo temporal hábil para satisfazer as finalidades descritas, ou até o trânsito do pedido de eliminação integral solicitado pelo Titular.

**5.1. Obrigação de Guarda Legal:** Mesmo após a rescisão de contrato entre PrintLog e Usuário, deveremos salvaguardar algumas massas de informações que sejam imprescindíveis para a execução de defesas jurídicas, cumprimento do art. 15 da Lei do Marco Civil da Internet (registro de acesso - 6 meses), e retenção fiscal e contábil oriunda do Estado brasileiro (até 5 anos ou exigências singulares).
**5.2. Descarte Técnico Seguro:** Quando superada a barreira cronológico-fática dos fins previstos, as informações serão apagadas ou sofrerão processo mecânico de anonimização (sintetismo estatístico sem retoma do dado primário).

## 6. SEGURANÇA DA INFORMAÇÃO E COMUNICAÇÃO DE INCIDENTES

**6.1. Medidas de Seguridade:** O acesso às interfaces sistêmicas de banco é contido através de diretrizes do padrão da indústria: encriptografia em campo transitório (AES-256 e Transport Layer Security), rígido controle de autenticação interna (*Row Level Security* na própria arquitetura) e segregação departamental por permissões (Zero-Trust Architecture).

**6.2. Notificações de Incidência de Segurança:** Se submetida a evento materializado de quebra de arquitetura de dados com real potencial de dano ao indivíduo, a Plataforma formalmente enviara notificação detalhada à Autoridade Nacional de Proteção de Dados (ANPD) e aos Titulares impactados contendo o escopo dos dados envolvidos e atitudes contenção aduzidas.

## 7. OS DIREITOS DO TITULAR DOS DADOS

Prestigia-se a liberdade jurídica do titular estipulada no art. 18 da LGPD, contemplando os corolários à:

1.  **Confirmação e Acesso:** Obter evidência da incidência da operação de processamento com os atrelados dados e cópia sistêmica fidedigna.
2.  **Correção:** Determinar reparo e/ou completude dos dados inexatos, velhos ou fragmentários na Dashboard do usuário.
3.  **Eliminação (Direito ao Esquecimento Modulado):** Excetuadas as vedações de retenção normativa de litígio, demandar extinção de registros coletados pelo lastro do Consentimento.
4.  **Portabilidade:** Recusar contínua dependência via exportação do quadro relacional das informações.
5.  **Revogação Positiva:** Interrupção do tratamento oriunda do consentimento prévio a qualquer fôlego.

## 8. DADOS DE CLIENTES DOS ESTÚDIOS E MENORES DE IDADE

**8.1. Clientes do Estúdio:** Reiteramos que se o Usuário insere dados de eventuais clientes ("pedidos de peças"), este deverá suportar perante si o recolhimento das bases legais frente aos indivíduos que comercializou as impressões, e não a PrintLog, que possui salvaguarda como simples ferramenta virtual ("fornecedor logístico") e operadora.

**8.2. Proteção de Menores:** A plataforma não é desenhada ou direcionada estruturalmente para menores de idade. Caso existam clientes menores entre os consumidores do estúdio 3D usuário, a observância cautelar de processamento caberá inteiramente na relação comercial do estúdio.

## 9. CONDIÇÕES GERAIS E ATENDIMENTO PARA EXERCÍCIO DE DIREITOS

Esta Política poderá suportar revisões pontuais, de modo a preservar sua utilidade em razão de inovações sistêmicas e legislações vigentes, caso em que o documento reformulado indicará a "Data da Modificação" na premissa inaugural.

O Encarregado de Proteção de Dados (DPO) encontra-se disponível incondicionalmente a responder à indagações de conformidade, bem como processar as demandas sobre exercício de diretos supramencionadas no endereço de contato eletrônico suportado pela plataforma oficial (ex: *privacy@printlog.com.br* ou via chat de suporte validado).
