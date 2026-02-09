DROP TABLE IF EXISTS turmas;
CREATE TABLE turmas (
  id TEXT PRIMARY KEY,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS alunos;
CREATE TABLE alunos (
  matricula TEXT PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  turma_id TEXT,
  FOREIGN KEY (turma_id) REFERENCES turmas(id)
);

DROP TABLE IF EXISTS registros_acesso;
CREATE TABLE registros_acesso (
  id TEXT PRIMARY KEY,
  aluno_matricula TEXT NOT NULL,
  tipo_movimentacao TEXT CHECK(tipo_movimentacao IN ('ENTRADA', 'SAIDA')) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  sincronizado BOOLEAN DEFAULT FALSE
);
