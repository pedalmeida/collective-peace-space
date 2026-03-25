

## 2FA por Email para Admins

### Porquê

Mesmo com passwords fortes, uma única camada de autenticação é vulnerável a phishing, credential stuffing ou leaks. O 2FA por email garante que só quem tem acesso ao email do admin consegue entrar no backoffice.

### Como funciona

```text
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Email +      │────▶│ Edge Function    │────▶│ Ecrã OTP     │
│ Password     │     │ gera código 6    │     │ (6 dígitos)  │
│ (login)      │     │ dígitos, envia   │     │ com timer    │
│              │     │ por email        │     │ 5 min        │
└──────────────┘     └──────────────────┘     └──────────────┘
                                                    │
                                              ┌─────▼─────┐
                                              │ Valida OTP │
                                              │ → acesso   │
                                              └───────────┘
```

1. Admin submete email + password normalmente
2. Se credenciais corretas E é admin, o login fica "pendente" -- o código não redireciona para `/admin` ainda
3. Uma Edge Function gera um código OTP de 6 dígitos, guarda-o na base de dados com expiração de 5 minutos, e envia-o por email
4. O ecrã de login transita para um segundo passo: campo OTP com 6 slots
5. O admin introduz o código; uma segunda Edge Function valida-o
6. Se válido, o acesso ao backoffice é concedido

### Alterações

**Nova tabela: `admin_otp_codes`**
- `id` (uuid, PK), `user_id` (uuid, FK auth.users), `code` (text), `expires_at` (timestamptz), `used` (boolean, default false), `created_at` (timestamptz)
- RLS: nenhuma policy pública (acesso apenas via service role nas Edge Functions)

**Nova Edge Function: `send-admin-otp`**
- Recebe `user_id` no body (chamada após login com password bem-sucedido)
- Gera código aleatório de 6 dígitos
- Invalida códigos anteriores do mesmo user
- Insere novo código com `expires_at = now() + 5 min`
- Envia email via Lovable AI (modelo leve) com o código formatado
- Rate limit: max 3 pedidos por user por 15 minutos

**Nova Edge Function: `verify-admin-otp`**
- Recebe `user_id` + `code`
- Verifica se existe código válido (não usado, não expirado)
- Se válido, marca como `used` e retorna sucesso
- Se inválido, retorna erro genérico (sem distinguir "expirado" de "errado")

**`src/pages/AdminLogin.tsx`** -- adicionar segundo passo
- Novo state: `step` ("credentials" | "otp"), `otpCode`, `userId`
- Após login com password bem-sucedido + confirmação de admin role, chama `send-admin-otp` e transita para step "otp"
- No step "otp": mostra componente InputOTP (6 slots) já existente no projeto, botão "Verificar", link "Reenviar código"
- Timer visual de 5 minutos
- Após verificação OTP bem-sucedida, permite o redirect para `/admin`

**`src/hooks/use-auth.ts`** -- adicionar estado `needsOtp`
- Novo campo `needs2FA` no retorno do hook
- O login com password deixa de definir `isAdmin = true` imediatamente; em vez disso, sinaliza que o 2FA é necessário
- Só após verificação OTP é que `isAdmin` é definido como true

**`src/pages/AdminLayout.tsx`** -- sem alterações (já verifica `isAdmin`)

### Ficheiros criados/alterados

- `supabase/migrations/xxx.sql` -- tabela `admin_otp_codes`
- `supabase/functions/send-admin-otp/index.ts` -- gerar e enviar OTP
- `supabase/functions/verify-admin-otp/index.ts` -- validar OTP
- `src/pages/AdminLogin.tsx` -- fluxo de dois passos
- `src/hooks/use-auth.ts` -- estado 2FA

### Detalhes de segurança

- Códigos OTP com hash SHA-256 na base de dados (não em texto simples)
- Códigos anteriores invalidados ao gerar novo
- Máximo 5 tentativas falhadas por código antes de bloqueio
- Respostas genéricas (sem distinguir "expirado" vs "errado")
- Rate limiting no envio de códigos

