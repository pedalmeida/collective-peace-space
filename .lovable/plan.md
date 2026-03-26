

## Traduzir títulos dos emails de autenticação para português

Os títulos (subjects) dos emails estão em inglês no ficheiro `supabase/functions/auth-email-hook/index.ts`. Os templates já estão em português, falta apenas traduzir os subjects.

### Alteração

**`supabase/functions/auth-email-hook/index.ts`** — atualizar o objeto `EMAIL_SUBJECTS`:

| Tipo | Atual (EN) | Novo (PT) |
|------|-----------|-----------|
| signup | Confirm your email | Confirme o seu email |
| invite | You've been invited | Foi convidado(a) |
| magiclink | Your login link | O seu link de acesso |
| recovery | Reset your password | Redefinir a sua password |
| email_change | Confirm your new email | Confirme o seu novo email |
| reauthentication | Your verification code | O seu código de verificação |

Após a edição, a Edge Function `auth-email-hook` será reimplantada para que as alterações entrem em vigor.

