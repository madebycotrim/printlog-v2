````md
# 🇧🇷 PrintLog — Padrão Absoluto de Linguagem (PT-BR)

📌 **Sistema:** PrintLog — Central de Gestão para Impressão 3D  
📄 **Documento:** Norma Oficial de Padronização Total em Português Brasileiro  
📍 **Versão:** 1.0  
✅ **Status:** Obrigatório e permanente

---

# ✅ 1. REGRA SUPREMA DO PROJETO

O PrintLog deve ser desenvolvido com **Português Brasileiro total (PT-BR)**.

🚫 **Nenhum termo em inglês é permitido no projeto**, incluindo:

- variáveis
- funções
- classes
- arquivos
- tabelas
- rotas
- mensagens
- logs
- interface

📌 Exceções únicas: termos técnicos inevitáveis como:

- HTML
- SQL
- JSON
- PDF

---

# ✅ 2. PADRÃO OBRIGATÓRIO PARA CÓDIGO

## 2.1 Variáveis

❌ Errado:

```ts
const filamentLeft = 200;
const printerStatus = "printing";
````

✅ Correto:

```ts
const pesoRestanteFilamento = 200;
const statusImpressora = "imprimindo";
```

---

## 2.2 Funções

❌ Errado:

```ts
function calculatePrice() {}
function saveProject() {}
```

✅ Correto:

```ts
function calcularPrecoFinal() {}
function salvarProjeto() {}
```

---

## 2.3 Classes e Serviços

❌ Errado:

```ts
class PrinterService {}
class StockManager {}
```

✅ Correto:

```ts
class ServicoImpressoras {}
class GestorEstoque {}
```

---

## 2.4 Interfaces e Tipos

❌ Errado:

```ts
interface Customer {}
type ProjectStatus = "done";
```

✅ Correto:

```ts
interface Cliente {}
type StatusProjeto = "concluido";
```

---

## 2.5 Componentes Frontend

❌ Errado:

```tsx
export function DashboardCard() {}
```

✅ Correto:

```tsx
export function CartaoPainelControle() {}
```

---

# ✅ 3. NOMES DE ARQUIVOS E PASTAS

Todo o sistema deve utilizar nomes em português.

❌ Errado:

```
src/services/printers/
src/components/dashboard/
```

✅ Correto:

```
src/servicos/impressoras/
src/componentes/painel_controle/
```

---

# ✅ 4. BANCO DE DADOS 100% PT-BR

## 4.1 Tabelas Oficiais

| Inglês ❌    | Português ✅ |
| ----------- | ----------- |
| printers    | impressoras |
| filaments   | filamentos  |
| projects    | projetos    |
| customers   | clientes    |
| orders      | pedidos     |
| maintenance | manutencoes |

---

## 4.2 Campos Oficiais

❌ Errado:

```sql
remaining_weight
created_at
```

✅ Correto:

```sql
peso_restante
data_cadastro
```

---

# ✅ 5. ROTAS DE API EM PORTUGUÊS

Caso exista API REST:

❌ Errado:

```
GET /projects
POST /customers
```

✅ Correto:

```
GET /projetos
POST /clientes
```

---

# ✅ 6. ENUMS E STATUS EM PT-BR

❌ Errado:

```ts
status: "done"
```

✅ Correto:

```ts
status: "concluido"
```

## Status Oficiais do Workflow PrintLog

```ts
type StatusWorkflow =
  | "a_fazer"
  | "em_producao"
  | "acabamento"
  | "concluido";
```

---

# ✅ 7. LOGS, ALERTAS E MENSAGENS

Todas as mensagens devem estar em português.

❌ Errado:

```
Low stock warning
Printer error
```

✅ Correto:

```
Aviso: estoque baixo
Erro: impressora sem resposta
```

---

# ✅ 8. COMENTÁRIOS INTERNOS NO CÓDIGO

❌ Errado:

```ts
// update printer status
```

✅ Correto:

```ts
// Atualiza o status atual da impressora
```

---

# ✅ 9. PADRÃO DE NOMENCLATURA PRINTLOG

Prefixos recomendados:

| Tipo           | Prefixo Oficial                    |
| -------------- | ---------------------------------- |
| Funções        | calcular, registrar, gerar, salvar |
| Serviços       | Servico                            |
| Gestores       | Gestor                             |
| Entidades      | Projeto, Cliente, Impressora       |
| Componentes UI | Tela, Painel, Cartao, Formulario   |

---

# ✅ 10. EXEMPLO REAL — CÓDIGO PRINTLOG 100% PT-BR

```ts
class ServicoOrcamentos {
  calcularPrecoFinal(
    pesoEmGramas: number,
    tempoEmHoras: number,
    precoKgFilamento: number,
    custoEnergiaKwh: number,
    margemLucro: number
  ) {
    const custoMaterial =
      (pesoEmGramas / 1000) * precoKgFilamento;

    const custoEnergia =
      tempoEmHoras * custoEnergiaKwh;

    const custoTotal = custoMaterial + custoEnergia;

    const precoFinal =
      custoTotal + custoTotal * margemLucro;

    return precoFinal;
  }
}
```

---

# ✅ 11. REGRA PARA FUTUROS UPGRADES

Toda funcionalidade nova deve seguir obrigatoriamente:

* nomes em português
* variáveis em português
* funções em português
* tabelas em português
* rotas em português
* interface em português

📌 Caso contrário: **não entra no projeto**.

---

# ✅ CONCLUSÃO

O PrintLog é oficialmente um sistema:

🇧🇷 100% PT-BR
📘 Documentado e padronizado
⚙️ Preparado para upgrades futuros sem mistura de idiomas

---

📌 Documento Oficial — PrintLog (Norma PT-BR Total)

```
```
