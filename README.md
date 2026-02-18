# 📘 Documentação Técnica Completa — PrintLog (MVP Solo + TypeScript)

📌 **Projeto:** PrintLog — Sistema de Gestão para Estúdios de Impressão 3D
📌 **Versão:** 2.1 (MVP Completo + Padronização TS)
📌 **Padrão obrigatório:** 100% PT-BR (interface, variáveis, funções, pastas, logs)

---

## 🎯 Objetivo

Esta documentação define o padrão técnico oficial do PrintLog para desenvolvimento consistente, simples e escalável, pensado para:

* Desenvolvedor solo
* Nível júnior
* MVP funcional rápido
* Evolução progressiva sem burocracia

---

## ✅ Regras Obrigatórias do Projeto

### Idioma

* Tudo deve estar em português
* Nada de misturar inglês em nomes internos

✅ `peso_restante`
❌ `remainingWeight`

---

## ✅ TypeScript: Obrigatório

O PrintLog deve ser desenvolvido com **TypeScript**, pois garante:

* menos bugs
* autocomplete
* refatoração segura
* código profissional

Extensões:

* Frontend: `.tsx`
* Backend/lógica: `.ts`

---

## 🗂 Estrutura Oficial por Funcionalidades (Features)

```
src/
 ├── funcionalidades/
 │
 │    ├── filamentos/
 │    │    ├── componentes/
 │    │    ├── logica/
 │    │    ├── dados/
 │    │    └── pagina.tsx
 │
 │    ├── impressoras/
 │    ├── projetos/
 │    ├── clientes/
 │    └── financeiro/
 │
 ├── compartilhado/
 │    ├── componentes_ui/
 │    ├── utilitarios/
 │    ├── tipos_globais/
 │    └── banco_dados/
 │
 └── principal.ts
```

---

## 📦 Convenções de Código

### Arquivos

* minúsculo
* underline

✅ `calcular_preco_final.ts`

---

### Variáveis e Funções

* sempre em português
* sempre descritivas

```ts
const custo_total = 35;

function calcular_preco_final(custo_total: number, margem: number) {
  return custo_total + custo_total * margem;
}
```

---

## 📌 Tipos Globais Oficiais

Arquivo: `compartilhado/tipos_globais/modelos.ts`

```ts
export type Identificador = string;

export type StatusImpressora = "LIVRE" | "IMPRIMINDO" | "MANUTENCAO";

export type StatusProjeto =
  | "A_FAZER"
  | "EM_PRODUCAO"
  | "ACABAMENTO"
  | "CONCLUIDO";
```

---

# 🧵 Módulo: Filamentos

## Estrutura

```
filamentos/
 ├── componentes/
 ├── logica/
 ├── dados/
 └── pagina.tsx
```

---

## Tipo Oficial

```ts
export type Filamento = {
  id: Identificador;
  material: string;
  marca: string;
  cor: string;
  peso_total: number;
  peso_restante: number;
};
```

---

## Regra de Negócio

```ts
export function filamento_precisa_repor(peso_restante: number) {
  return peso_restante < 200;
}
```

---

## Componente

```tsx
export function CartaoFilamento({ filamento }: { filamento: Filamento }) {
  return (
    <div>
      <h2>{filamento.material}</h2>
      <p>Restam {filamento.peso_restante}g</p>
    </div>
  );
}
```

---

# 🖨️ Módulo: Impressoras

## Tipo Oficial

```ts
export type Impressora = {
  id: Identificador;
  nome: string;
  status: StatusImpressora;
  horas_impressao: number;
};
```

---

## Regra: Horímetro

```ts
export function adicionar_horas(impressora: Impressora, horas: number) {
  impressora.horas_impressao += horas;
}
```

---

# 📁 Módulo: Projetos

## Tipo Oficial

```ts
export type Projeto = {
  id: Identificador;
  nome: string;
  cliente_id: Identificador;
  status: StatusProjeto;
  prazo_entrega: Date;
};
```

---

## Workflow Kanban

Colunas obrigatórias:

* A Fazer
* Em Produção
* Acabamento
* Concluído

---

# 👥 Módulo: Clientes

```ts
export type Cliente = {
  id: Identificador;
  nome: string;
  telefone: string;
  endereco?: string;
};
```

---

# 💵 Módulo: Financeiro

```ts
export type LancamentoFinanceiro = {
  id: Identificador;
  tipo: "ENTRADA" | "SAIDA";
  valor: number;
  descricao: string;
  data: Date;
};
```

---

# 🔧 Evolução do Projeto

O MVP deve permanecer simples.

Quando crescer, poderá evoluir para camadas enterprise:

* entidade.ts
* servico.ts
* controlador.ts

Mas somente após:

✅ MVP completo
✅ usuários reais
✅ necessidade clara

---

# ✅ Checklist Final

* [x] Sistema 100% PT-BR
* [x] TypeScript obrigatório
* [x] Estrutura simples por features
* [x] Tipos globais definidos
* [x] Módulos principais documentados

---

## 🌗 Tema (Modo Claro/Escuro)

📌 **Função:** permitir que o usuário alterne entre modo claro e modo escuro no PrintLog.

---

## ✅ Regras Obrigatórias do Tema

* Tudo em português
* Nada de nomes internos em inglês

✅ `modo_tema`
❌ `darkMode`

---

## 🗂 Estrutura Oficial do Tema

Adicionar dentro de `compartilhado/`:

```
src/
 ├── compartilhado/
 │    ├── tema/
 │    │    ├── componentes/
 │    │    │    └── botao_alternar_tema.tsx
 │    │    ├── logica/
 │    │    │    └── usar_tema.ts
 │    │    └── tema_provider.tsx
```

---

## 📌 Tipo Global Oficial

Arquivo: `compartilhado/tipos_globais/modelos.ts`

```ts
export type ModoTema = "CLARO" | "ESCURO";
```

---

## 🧠 Lógica Oficial do Tema

Arquivo: `compartilhado/tema/logica/usar_tema.ts`

```ts
import { useEffect, useState } from "react";
import type { ModoTema } from "../../tipos_globais/modelos";

export function usar_tema() {
  const [modo_tema, definir_modo_tema] = useState<ModoTema>("CLARO");

  useEffect(() => {
    const tema_salvo = localStorage.getItem("modo_tema") as ModoTema;

    if (tema_salvo) {
      definir_modo_tema(tema_salvo);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("modo_tema", modo_tema);

    document.documentElement.setAttribute(
      "data-tema",
      modo_tema.toLowerCase()
    );
  }, [modo_tema]);

  function alternar_tema() {
    definir_modo_tema((tema_atual) =>
      tema_atual === "CLARO" ? "ESCURO" : "CLARO"
    );
  }

  return {
    modo_tema,
    alternar_tema,
  };
}
```

---

## 🌍 Provider Global Oficial

Arquivo: `compartilhado/tema/tema_provider.tsx`

```tsx
import { createContext, useContext } from "react";
import { usar_tema } from "./logica/usar_tema";
import type { ModoTema } from "../tipos_globais/modelos";

type TemaContexto = {
  modo_tema: ModoTema;
  alternar_tema: () => void;
};

const ContextoTema = createContext<TemaContexto | null>(null);

export function ProvedorTema({ children }: { children: React.ReactNode }) {
  const tema = usar_tema();

  return (
    <ContextoTema.Provider value={tema}>
      {children}
    </ContextoTema.Provider>
  );
}

export function usar_contexto_tema() {
  const contexto = useContext(ContextoTema);

  if (!contexto) {
    throw new Error("usar_contexto_tema deve estar dentro do ProvedorTema");
  }

  return contexto;
}
```

---

## 🔘 Componente: Botão de Alternância

Arquivo: `compartilhado/tema/componentes/botao_alternar_tema.tsx`

```tsx
import { usar_contexto_tema } from "../tema_provider";

export function BotaoAlternarTema() {
  const { modo_tema, alternar_tema } = usar_contexto_tema();

  return (
    <button onClick={alternar_tema}>
      Tema atual: {modo_tema}
    </button>
  );
}
```

---

## 🏗 Aplicação Global Obrigatória

Arquivo: `src/principal.ts`

```tsx
import { ProvedorTema } from "./compartilhado/tema/tema_provider";

export function App() {
  return (
    <ProvedorTema>
      {/* Sistema inteiro aqui */}
    </ProvedorTema>
  );
}
```

---

## 🎨 Estilo Oficial (CSS Simples)

Arquivo sugerido: `compartilhado/tema/tema.css`

```css
:root[data-tema="claro"] {
  --cor_fundo: white;
  --cor_texto: black;
}

:root[data-tema="escuro"] {
  --cor_fundo: #111;
  --cor_texto: white;
}

body {
  background: var(--cor_fundo);
  color: var(--cor_texto);
}
```

##

---

📍 Documento Técnico Oficial — PrintLog 2.1
