-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  endereco TEXT,
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Filamentos
CREATE TABLE IF NOT EXISTS filamentos (
  id TEXT PRIMARY KEY,
  material TEXT NOT NULL, -- PLA, ABS, PETG
  marca TEXT NOT NULL,
  cor TEXT NOT NULL,
  peso_total REAL NOT NULL, -- em gramas
  peso_restante REAL NOT NULL, -- em gramas
  preco_kg REAL NOT NULL,
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Impressoras
CREATE TABLE IF NOT EXISTS impressoras (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  modelo TEXT NOT NULL,
  status TEXT CHECK(status IN ('LIVRE', 'IMPRIMINDO', 'MANUTENCAO')) DEFAULT 'LIVRE',
  horas_impressao REAL DEFAULT 0,
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Projetos
CREATE TABLE IF NOT EXISTS projetos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  cliente_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('A_FAZER', 'EM_PRODUCAO', 'ACABAMENTO', 'CONCLUIDO')) DEFAULT 'A_FAZER',
  prazo_entrega DATETIME,
  custo_estimado REAL,
  valor_cobrado REAL,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Tabela Financeira (Entradas e Saídas)
CREATE TABLE IF NOT EXISTS financeiro (
  id TEXT PRIMARY KEY,
  tipo TEXT CHECK(tipo IN ('ENTRADA', 'SAIDA')) NOT NULL,
  valor REAL NOT NULL,
  descricao TEXT NOT NULL,
  data_lancamento DATETIME DEFAULT CURRENT_TIMESTAMP,
  projeto_id TEXT, -- Opcional, se vinculado a um projeto
  FOREIGN KEY (projeto_id) REFERENCES projetos(id)
);
