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

-- Tabela de Configurações Locais (System Settings)
DROP TABLE IF EXISTS configuracoes;
CREATE TABLE configuracoes (
  chave TEXT PRIMARY KEY,
  valor TEXT
);
