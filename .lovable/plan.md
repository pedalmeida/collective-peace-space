

## Corrigir envio de OTP para usar a fila de emails

### Problema

A função `send-admin-otp` envia emails diretamente via `fetch("https://api.lovable.dev/api/v2/email")`, contornando toda a infraestrutura de email já configurada no projeto. Os logs mostram erros "404 page not found" e 429 porque este endpoint direto não é o caminho correto — o projeto usa a biblioteca `@lovable.dev/email-js` através da fila pgmq gerida pelo `process-email-queue`.

### Solução

Reescrever `send-admin-otp` para enfileirar o email OTP via `supabase.rpc('enqueue_email', ...)` em vez de chamar a API diretamente. O email será processado pelo dispatcher `process-email-queue` que já gere rate-limiting, retries e logging automaticamente.

### Alteração

**`supabase/functions/send-admin-otp/index.ts`**:
- Remover o `fetch` direto à API Lovable e a dependência do `LOVABLE_API_KEY`
- Substituir por uma chamada `supabase.rpc('enqueue_email', { queue_name: 'transactional_emails', payload: { ... } })` com os campos necessários (`to`, `from`, `sender_domain`, `subject`, `html`, `text`, `purpose`, `label`, `message_id`, `queued_at`)
- Usar `notify.meditarmundomelhor.org` como `sender_domain` e `from: "Meditar um Mundo Melhor <noreply@meditarmundomelhor.org>"`
- Gerar um `message_id` único (UUID) para rastreamento

Após a edição, redeploy da Edge Function `send-admin-otp`.

### Ficheiros alterados
- `supabase/functions/send-admin-otp/index.ts`

