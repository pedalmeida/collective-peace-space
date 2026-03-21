

## OrgTicker — Melhorias visuais + Backoffice de organizações

### 1. Ticker visual (OrgTicker.tsx)
- **Mais devagar**: duração de 25s → 40s
- **Logos mais juntos**: gap de `gap-16 md:gap-24` → `gap-10 md:gap-16`
- **Ordem aleatória**: randomizar o array `organizations` com `useMemo` no mount (Fisher-Yates shuffle) — custo zero, executa uma vez por visita

### 2. Links clicáveis
- Adicionar campo `url` ao array de organizações (hardcoded por agora)
- Envolver cada logo num `<a href={org.url} target="_blank" rel="noopener noreferrer">`

### 3. Backoffice de organizações (tabela + CRUD)
- **Nova tabela `organizations`**: `id`, `name`, `logo_url`, `website_url`, `sort_order`, `is_active`, `created_at`
- **RLS**: leitura pública (select), escrita apenas para admins via `has_role`
- **Storage**: reutilizar bucket `media` para logos
- **Nova página admin** `src/pages/AdminOrganizations.tsx`: listagem, criar/editar/eliminar orgs, upload de logo
- **AdminLayout**: adicionar entrada "Organizações" na sidebar
- **App.tsx**: nova rota `/admin/organizacoes`
- **OrgTicker.tsx**: substituir dados hardcoded por query à tabela `organizations` (com fallback para os dados atuais enquanto carrega)

### Ficheiros alterados
- `src/components/OrgTicker.tsx` — velocidade, gap, shuffle, query DB, links
- `src/pages/AdminOrganizations.tsx` — novo
- `src/pages/AdminLayout.tsx` — nova entrada nav
- `src/App.tsx` — nova rota
- Migration SQL — tabela `organizations` + RLS + seed com dados atuais

