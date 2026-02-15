-- Tabela de Turmas (Enhanced Context)
DROP TABLE IF EXISTS turmas;
CREATE TABLE turmas (
  id TEXT PRIMARY KEY, -- Ex: "3ª A - Matutino" (Composite Key for compatibility)
  ano_letivo INTEGER, -- Ex: 2026
  serie TEXT, -- Ex: "1ª", "2ª", "3ª"
  letra TEXT, -- Ex: "A", "B", "C"
  turno TEXT, -- Ex: "Matutino", "Vespertino"
  sala TEXT, -- Local físico (Opcional)
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Alunos (LGPD Minimized - Only Essential Data)
DROP TABLE IF EXISTS alunos;
CREATE TABLE alunos (
  matricula TEXT PRIMARY KEY, -- Identificador Único
  nome_completo TEXT NOT NULL, -- Identificação Básica
  turma_id TEXT, -- Vínculo com a Turma
  status TEXT DEFAULT 'ATIVO', -- ATIVO/INATIVO (Controle de Acesso)
  foto_url TEXT, -- Necessário para identificação visual na portaria? (Confirmar necessidade estrita)
  FOREIGN KEY (turma_id) REFERENCES turmas(id)
);

-- Tabela de Registros de Acesso (Audit Trail)
DROP TABLE IF EXISTS registros_acesso;
CREATE TABLE registros_acesso (
  id TEXT PRIMARY KEY,
  aluno_matricula TEXT NOT NULL,
  tipo_movimentacao TEXT CHECK(tipo_movimentacao IN ('ENTRADA', 'SAIDA')) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  sincronizado BOOLEAN DEFAULT FALSE,
  autorizado_por TEXT -- Quem liberou, se manual (Accountability)
);

-- Configurações do Sistema (Futuro)
CREATE TABLE IF NOT EXISTS configuracoes (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- SPRINT 1: SEGURANÇA E AUDITORIA
-- ====================================

-- Logs de Auditoria (LGPD e Rastreabilidade)
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    usuario_email TEXT NOT NULL,
    acao TEXT NOT NULL,
    entidade_tipo TEXT NOT NULL,
    entidade_id TEXT,
    dados_anteriores TEXT,
    dados_novos TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs_auditoria(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_auditoria(usuario_email);
CREATE INDEX IF NOT EXISTS idx_logs_acao ON logs_auditoria(acao);
CREATE INDEX IF NOT EXISTS idx_logs_entidade ON logs_auditoria(entidade_tipo, entidade_id);

-- Usuários e Controle de Acesso (RBAC)
CREATE TABLE IF NOT EXISTS usuarios (
    email TEXT PRIMARY KEY,
    nome_completo TEXT NOT NULL,
    papel TEXT NOT NULL CHECK(papel IN ('ADMIN', 'COORDENACAO', 'SECRETARIA', 'PORTARIA', 'VISUALIZACAO')),
    ativo BOOLEAN DEFAULT 1,
    criado_por TEXT,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_papel ON usuarios(papel);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- Chaves de Assinatura para QR Codes (Rotação e Segurança)
CREATE TABLE IF NOT EXISTS chaves_assinatura (
    versao INTEGER PRIMARY KEY,
    chave_publica TEXT NOT NULL,
    chave_privada TEXT NOT NULL,
    ativa BOOLEAN DEFAULT 1,
    criada_em TEXT DEFAULT CURRENT_TIMESTAMP,
    expira_em TEXT,
    criada_por TEXT
);

CREATE INDEX IF NOT EXISTS idx_chaves_ativa ON chaves_assinatura(ativa);

-- ====================================
-- SPRINT 2: LGPD COMPLIANCE
-- ====================================

-- Registros de Consentimento (LGPD Art. 8º)
CREATE TABLE IF NOT EXISTS consentimentos (
    id TEXT PRIMARY KEY,
    aluno_matricula TEXT NOT NULL,
    versao_termo INTEGER NOT NULL,
    tipo_consentimento TEXT NOT NULL CHECK(tipo_consentimento IN ('COLETA_DADOS', 'USO_IMAGEM', 'TRATAMENTO_DADOS')),
    consentido BOOLEAN NOT NULL,
    data_consentimento TEXT NOT NULL,
    coletado_por TEXT,
    valido_ate TEXT,
    retirado BOOLEAN DEFAULT 0,
    data_retirada TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consentimentos_matricula ON consentimentos(aluno_matricula);
CREATE INDEX IF NOT EXISTS idx_consentimentos_tipo ON consentimentos(tipo_consentimento);
CREATE INDEX IF NOT EXISTS idx_consentimentos_validade ON consentimentos(valido_ate);
CREATE INDEX IF NOT EXISTS idx_consentimentos_retirado ON consentimentos(retirado);

-- Políticas de Retenção (LGPD Art. 15º e 16º)
CREATE TABLE IF NOT EXISTS politicas_retencao (
    id TEXT PRIMARY KEY,
    entidade_tipo TEXT NOT NULL,
    periodo_retencao_dias INTEGER NOT NULL,
    acao_expiracao TEXT NOT NULL CHECK(acao_expiracao IN ('DELETAR', 'ANONIMIZAR', 'ARQUIVAR')),
    ativa BOOLEAN DEFAULT 1,
    descricao TEXT,
    criada_em TEXT DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TEXT DEFAULT CURRENT_TIMESTAMP,
    criada_por TEXT
);

CREATE INDEX IF NOT EXISTS idx_politicas_entidade ON politicas_retencao(entidade_tipo);
CREATE INDEX IF NOT EXISTS idx_politicas_ativa ON politicas_retencao(ativa);

-- Registros de Anonimização (LGPD Art. 12º)
CREATE TABLE IF NOT EXISTS registros_anonimizacao (
    id TEXT PRIMARY KEY,
    entidade_tipo TEXT NOT NULL,
    entidade_id_original TEXT NOT NULL,
    entidade_id_hash TEXT NOT NULL,
    data_anonimizacao TEXT NOT NULL,
    motivo TEXT,
    executado_por TEXT,
    dados_preservados TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_anonimizacao_tipo ON registros_anonimizacao(entidade_tipo);
CREATE INDEX IF NOT EXISTS idx_anonimizacao_data ON registros_anonimizacao(data_anonimizacao);
CREATE INDEX IF NOT EXISTS idx_anonimizacao_hash ON registros_anonimizacao(entidade_id_hash);

-- Configurações LGPD
CREATE TABLE IF NOT EXISTS configuracoes_lgpd (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    descricao TEXT,
    atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    atualizado_por TEXT
);

-- Inserir valores padrão de configuração LGPD
INSERT OR IGNORE INTO configuracoes_lgpd (chave, valor, descricao) VALUES
    ('versao_termo_atual', '1', 'Versão atual do termo de consentimento'),
    ('exigir_consentimento', 'true', 'Exigir consentimento para novos cadastros'),
    ('retencao_alunos_dias', '1825', 'Período de retenção de dados de alunos (5 anos)'),
    ('retencao_acessos_dias', '730', 'Período de retenção de registros de acesso (2 anos)'),
    ('anonimizacao_automatica', 'false', 'Habilitar anonimização automática ao expirar retenção');

-- ====================================
-- SPRINT 4: OPERACIONAL
-- ====================================

-- Justificativas de Faltas
CREATE TABLE IF NOT EXISTS justificativas (
    id TEXT PRIMARY KEY,
    aluno_matricula TEXT NOT NULL,
    data_inicio TEXT NOT NULL,
    data_fim TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('ATESTADO_MEDICO', 'EVENTO_FAMILIAR', 'COMPROMISSO_JURIDICO', 'OUTROS')),
    descricao TEXT,
    documento_base64 TEXT,
    documento_nome TEXT,
    documento_tipo TEXT,
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK(status IN ('PENDENTE', 'APROVADA', 'REJEITADA')),
    motivo_rejeicao TEXT,
    criada_em TEXT DEFAULT CURRENT_TIMESTAMP,
    criada_por TEXT,
    revisada_em TEXT,
    revisada_por TEXT,
    FOREIGN KEY (aluno_matricula) REFERENCES alunos(matricula)
);

CREATE INDEX IF NOT EXISTS idx_justificativas_aluno ON justificativas(aluno_matricula);
CREATE INDEX IF NOT EXISTS idx_justificativas_status ON justificativas(status);
CREATE INDEX IF NOT EXISTS idx_justificativas_periodo ON justificativas(data_inicio, data_fim);

-- Saídas Antecipadas
CREATE TABLE IF NOT EXISTS saidas_antecipadas (
    id TEXT PRIMARY KEY,
    aluno_matricula TEXT NOT NULL,
    registro_saida_id TEXT,
    data_saida TEXT NOT NULL,
    hora_saida TEXT NOT NULL,
    hora_esperada TEXT NOT NULL,
    minutos_antecipacao INTEGER NOT NULL,
    motivo TEXT,
    responsavel_retirada TEXT,
    contato_responsavel TEXT,
    autorizada BOOLEAN DEFAULT 0,
    autorizada_por TEXT,
    autorizada_em TEXT,
    observacoes TEXT,
    criada_em TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_matricula) REFERENCES alunos(matricula),
    FOREIGN KEY (registro_saida_id) REFERENCES registros_acesso(id)
);

CREATE INDEX IF NOT EXISTS idx_saidas_aluno ON saidas_antecipadas(aluno_matricula);
CREATE INDEX IF NOT EXISTS idx_saidas_data ON saidas_antecipadas(data_saida);
CREATE INDEX IF NOT EXISTS idx_saidas_autorizada ON saidas_antecipadas(autorizada);

-- Configurações de Alertas
CREATE TABLE IF NOT EXISTS configuracoes_alertas (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    descricao TEXT,
    atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    atualizado_por TEXT
);

-- Inserir configurações padrão de alertas
INSERT OR IGNORE INTO configuracoes_alertas (chave, valor, descricao) VALUES
    ('horario_saida_matutino', '12:00', 'Horário oficial de saída do turno matutino'),
    ('horario_saida_vespertino', '18:00', 'Horário oficial de saída do turno vespertino'),
    ('horario_saida_noturno', '22:00', 'Horário oficial de saída do turno noturno'),
    ('minutos_tolerancia', '15', 'Minutos de tolerância antes de considerar saída antecipada'),
    ('alertas_habilitados', 'true', 'Habilitar sistema de alertas de saída antecipada'),
    ('notificar_coordenacao', 'true', 'Notificar coordenação sobre saídas antecipadas');
