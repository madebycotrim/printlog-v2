# Plano de Resposta a Incidentes de Segurança - PrintLog

Este plano estabelece as ações imediatas em caso de suspeita ou confirmação de violação de dados (vazamentos, acessos indevidos, falhas de segurança) dentro da infraestrutura do PrintLog.

## 1. Quem decide que houve vazamento?
O Encarregado de Dados (DPO) ou o responsável direto pela segurança técnica (CTO/Lead Developer) é a autoridade central que classificará o evento. A decisão sobre a gravidade da violação baseia-se em:
- Avaliação dos logs providenciados pelos operadores (Firebase e Cloudflare).
- Análise de escopo: quais bancos de dados foram expostos e qual formato (criptografado ou em texto claro).
- Uma vez classificado como incidente de risco aos direitos fundamentais dos titulares, aciona-se os gatilhos dos passos 2 e 3.

## 2. Como notifica a ANPD em até 72h?
Se a análise confirmar que a violação pode acarretar risco ou dano relevante aos usuários, o DPO deve, de imediato (e no máximo em até 2 dias úteis contados a partir do conhecimento definitivo):
1. Acessar o sistema de peticionamento eletrônico (Super/SEI) da Autoridade Nacional de Proteção de Dados (ANPD).
2. Preencher e enviar o Formulário de Comunicação de Incidente de Segurança com Dados Pessoais disponibilizado no site gov.br/anpd.
3. Fornecer informações sobre a natureza dos dados, número de titulares, medidas corretivas adotadas pela equipe técnica (ex: bloqueio de acessos, keys revogadas, redefinição de IPs) e as mitigações realizadas via Cloudflare e Firebase.

## 3. Como notifica os titulares afetados?
Caso o risco seja alto para as liberdades dos titulares:
1. **Canal Oficial:** Um aviso individualizado será disparado via e-mail eletrônico (o mesmo utilizado para o cadastro na plataforma).
2. **Prazo:** Dentro das mesmas 72h após a descoberta e estabilização da ameaça primária, de forma clara, utilizando linguagem simples e direta.
3. **Conteúdo do aviso:**
   - Descrição sumária do que ocorreu e a data estimada do ocorrido.
   - Os tipos de dados que foram comprometidos (ex: e-mail vazado, nomes).
   - Aviso importante de que o Firebase mantém as senhas dos usuários hasheadas, não expondo em "plaintext".
   - As ações e medidas que a empresa já tomou e de modo a impedir novas ocorrências.
   - Orientações aos usuários (ex: redefinir senhas, ativar 2FA nos emails onde usam senhas iguais).
