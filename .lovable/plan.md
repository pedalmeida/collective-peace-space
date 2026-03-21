

## Adicionar campos "Comentários" e "Quero organizar" ao formulário de inscrição

### O que muda

Dois novos campos opcionais no formulário de participação:
1. **Textarea de comentários** — campo de texto livre, placeholder "Algum comentário? (opcional)"
2. **Checkbox "Quero organizar"** — com label explicativo, tipo "Tenho interesse em ajudar a organizar eventos"

Os dados são enviados para o Google Sheets (colunas adicionais) e guardados na tabela `subscribers` no backend.

### Ficheiros alterados

1. **Migration SQL** — adicionar colunas `comments text` e `wants_to_organize boolean default false` à tabela `subscribers`

2. **`src/components/Participate.tsx`**
   - Novos estados: `comments` (string) e `wantsToOrganize` (boolean)
   - Textarea de comentários entre o input de email e o botão submit
   - Checkbox com label abaixo do textarea, alinhada à esquerda
   - Passar os novos campos no body do `supabase.functions.invoke`

3. **`supabase/functions/add-subscriber/index.ts`**
   - Extrair `comments` e `wants_to_organize` do body
   - Expandir o append ao Google Sheets para 5 colunas: Nome, Email, Data, Comentários, Quero Organizar
   - Incluir os campos no insert à tabela `subscribers`

### Layout do formulário atualizado

```text
┌─────────────────────────┐
│  [Nome]                 │
│  [Email]                │
│  [Comentários (textarea)]│
│  ☐ Tenho interesse em   │
│    ajudar a organizar   │
│  [Receber informações]  │
└─────────────────────────┘
```

