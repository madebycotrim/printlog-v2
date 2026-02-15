/**
 * Termo de Consentimento LGPD
 * Versão 1.0 - Conforme LGPD (Lei 13.709/2018)
 */

export const VERSAO_ATUAL = 1;

export const TERMO_CONSENTIMENTO_V1 = {
    versao: 1,
    dataPublicacao: '2026-02-12',
    titulo: 'Termo de Consentimento para Tratamento de Dados Pessoais',
    conteudo: `
# TERMO DE CONSENTIMENTO PARA TRATAMENTO DE DADOS PESSOAIS

**Versão 1.0 | Vigência: 12/02/2026**

De acordo com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD), solicitamos seu consentimento livre, informado e inequívoco para o tratamento dos dados pessoais coletados.

## 1. IDENTIFICAÇÃO DO CONTROLADOR

**Sistema de Controle de Acesso Escolar (SCAE)**
Responsável pelo tratamento dos dados pessoais coletados através desta plataforma.

## 2. DADOS COLETADOS

Os seguintes dados pessoais serão coletados e tratados:

- **Dados Cadastrais**: Nome completo, matrícula
- **Dados Educacionais**: Turma, série, turno
- **Dados de Acesso**: Registros de entrada e saída da instituição
- **Imagem**: Código QR personalizado para identificação

## 3. FINALIDADE DO TRATAMENTO

Os dados pessoais serão utilizados exclusivamente para:

- Controle de acesso à instituição de ensino
- Registro de frequência e presença
- Segurança e proteção dos estudantes
- Comunicação com responsáveis em casos de emergência
- Geração de relatórios estatísticos e administrativos

## 4. COMPARTILHAMENTO DE DADOS

Os dados **NÃO** serão compartilhados com terceiros, exceto:

- Quando exigido por lei ou ordem judicial
- Com responsáveis legais do estudante
- Para cumprimento de obrigações legais e regulatórias

## 5. DIREITOS DO TITULAR

Nos termos da LGPD, você tem direito a:

- **Confirmar** a existência de tratamento dos seus dados
- **Acessar** seus dados pessoais
- **Corrigir** dados incompletos, inexatos ou desatualizados
- **Anonimizar, bloquear ou eliminar** dados desnecessários
- **Revogar o consentimento** a qualquer momento
- **Solicitar portabilidade** dos dados

Para exercer seus direitos, entre em contato com a administração da instituição.

## 6. ARMAZENAMENTO E SEGURANÇA

- Os dados são armazenados em servidores seguros com criptografia
- Políticas de backup e recuperação de desastres estão implementadas
- Acesso restrito apenas a pessoal autorizado
- Logs de auditoria registram todas as operações

## 7. RETENÇÃO DE DADOS

Os dados pessoais serão mantidos pelo período necessário para:

- Cumprimento das finalidades descritas
- Cumprimento de obrigações legais (mínimo 5 anos)
- Após este período, os dados serão anonimizados ou excluídos

## 8. CONSENTIMENTO

Ao aceitar este termo, você declara:

- Ter lido e compreendido todas as informações acima
- Estar ciente dos seus direitos
- Consentir livre e inequivocamente com o tratamento dos dados pessoais conforme descrito

**O consentimento pode ser revogado a qualquer momento, sem custos.**

---

*Este termo está em conformidade com a Lei nº 13.709/2018 (LGPD) e suas regulamentações.*
`.trim()
};

export const obterTermoAtual = () => {
    return TERMO_CONSENTIMENTO_V1;
};

export const obterVersaoAtual = () => {
    return VERSAO_ATUAL;
};

export const TIPOS_CONSENTIMENTO = {
    COLETA_DADOS: 'COLETA_DADOS',
    USO_IMAGEM: 'USO_IMAGEM',
    TRATAMENTO_DADOS: 'TRATAMENTO_DADOS'
};

export const LABELS_TIPOS = {
    [TIPOS_CONSENTIMENTO.COLETA_DADOS]: 'Coleta de Dados Pessoais',
    [TIPOS_CONSENTIMENTO.USO_IMAGEM]: 'Uso de Imagem',
    [TIPOS_CONSENTIMENTO.TRATAMENTO_DADOS]: 'Tratamento de Dados'
};
