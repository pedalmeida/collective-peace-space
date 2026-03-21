

## Subscritores para Google Sheets + Campo de Nome

### Resumo
Migrar o armazenamento de subscritores da base de dados para uma Google Spreadsheet e adicionar um campo "Nome" ao formulário e à spreadsheet.

### Pré-requisitos (feitos por ti)
1. Criar projeto no Google Cloud Console → ativar Google Sheets API
2. Criar Service Account → download da chave JSON
3. Criar Google Spreadsheet com cabeçalhos: **Nome | Email | Data**
4. Partilhar a spreadsheet com o email da Service Account (Editor)
5. Fornecer a chave JSON e o ID da spreadsheet ao Lovable (serão guardados como secrets)

### Implementação

**1. Guardar 2 secrets**
- `GOOGLE_SERVICE_ACCOUNT_KEY` — JSON da service account
- `GOOGLE_SHEET_ID` — ID da spreadsheet (extraído do URL)

**2. Criar edge function `add-subscriber`**
- Recebe `{ name, email }` via POST
- Autentica com Google Sheets API via JWT (Service Account)
- Verifica duplicados (coluna Email)
- Adiciona linha: Nome, Email, Data/Hora
- Retorna sucesso, duplicado ou erro

**3. Criar edge function `list-subscribers`**
- Lê todas as linhas da spreadsheet
- Devolve array de `{ name, email, date }` para o backoffice
- Requer autenticação de admin

**4. Atualizar `Participate.tsx`**
- Adicionar campo "Nome" ao formulário (antes do email)
- Substituir insert no Supabase por chamada à edge function `add-subscriber`
- Manter feedback visual (sucesso, duplicado, erro)

**5. Atualizar `AdminSubscribers.tsx`**
- Puxar dados via edge function `list-subscribers` em vez da tabela
- Adicionar coluna "Nome" à tabela do backoffice
- Atualizar exportação CSV para incluir Nome

**6. Migração DB: adicionar coluna `name` à tabela `subscribers`**
- Manter a tabela como fallback durante a transição
- `ALTER TABLE subscribers ADD COLUMN name text;`

### Secção técnica
- Autenticação Google: JWT assinado com Web Crypto API (Deno nativo, sem deps externas)
- Detecção de duplicados: leitura da coluna B (Email) antes de inserir
- CORS headers incluídos em ambas as edge functions

