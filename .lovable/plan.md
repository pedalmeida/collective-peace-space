

## Nova Secção: "Inspira-te e Partilha 🌿"

### Resumo
Criar uma secção interativa com citações inspiradoras, gerador aleatório, partilha social (nativo + WhatsApp), e gestão de citações no backoffice. Posicionada entre "Como participar" e "Eventos passados".

---

### 1. Base de dados — nova tabela `quotes`

```sql
CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler citações ativas
CREATE POLICY "Anyone can view active quotes" ON public.quotes
  FOR SELECT TO public USING (is_active = true);

-- Admins gerem tudo
CREATE POLICY "Admins can manage quotes" ON public.quotes
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) 
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

Inserir ~10-15 citações iniciais sobre meditação, paz e mindfulness.

---

### 2. Componente `InspireShare.tsx`

- Busca citações ativas da tabela `quotes`
- Estado local com citação atual (aleatória ao carregar)
- Botão **"Inspira-me 🌿"** — seleciona nova citação aleatória com fade transition
- Card central com tipografia elegante, fundo suave (gradiente subtil)
- Dois botões de partilha:
  - **"Partilhar 🌍"** — usa `navigator.share()` (mobile) com fallback para copiar link. Mensagem pré-preenchida com a citação + dados do próximo evento (dinâmicos da tabela `events`)
  - **"Enviar a alguém 💌"** — abre WhatsApp (`https://wa.me/?text=...`) com mensagem pré-preenchida incluindo citação + dados do próximo evento
- Busca o próximo evento (mesmo query do `NextEvent`) para preencher data/hora dinamicamente

---

### 3. Integração no Index.tsx

Adicionar `<InspireShare />` entre `<Participate />` e `<PastEvents />`.

---

### 4. Backoffice — nova página `AdminQuotes.tsx`

- CRUD de citações: listar, criar, editar, ativar/desativar
- Tabela com colunas: Texto, Autor, Ativo, Ações
- Formulário inline ou modal para adicionar/editar
- Toggle de ativo/inativo

---

### 5. Routing e navegação

- Nova rota `/admin/citacoes` no `App.tsx`
- Novo item no sidebar do `AdminLayout.tsx` (icon: `Quote` ou `Sparkles`)

---

### Secção técnica
- Animação de troca de citação: `AnimatePresence` + `motion.div` com fade (já usado no projeto)
- Partilha nativa: `navigator.share` API com fallback
- WhatsApp: URL scheme `https://wa.me/?text=` com `encodeURIComponent`
- Dados do próximo evento: query `events` onde `is_past = false`, ordenado por data, limit 1
- Design: segue estética existente (off-white, accent dourado, tipografia editorial)

