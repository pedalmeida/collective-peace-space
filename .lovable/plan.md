

## Plano: Corrigir verificação OTP que fica em loading infinito

### Diagnóstico

A partir dos logs e da session replay:
- O user inseriu o código `359846`, clicou "Verificar"
- O botão entrou em loading mas **nenhum pedido HTTP** foi feito
- Os logs da Edge Function `verify-admin-otp` não registam invocações (a função existe e responde via curl direto)
- O loading ficou eterno (>28s sem resposta nem erro visível)

### Causa provável

`handleVerifyOTP` em `AdminLogin.tsx` não tem `try/catch`. Se `supabase.functions.invoke()` lançar uma exceção (em vez de devolver `{ error }`), o `setSubmitting(false)` nunca corre — exatamente o sintoma observado. Também não há `console.error`, por isso o erro fica invisível.

Adicionalmente, há possibilidade de o `pendingUserId` ser perdido entre passos devido a re-renders disparados pelo `onAuthStateChange` que corre logo após o `signInWithPassword`.

### Alterações

**`src/pages/AdminLogin.tsx`**
- Envolver `handleVerifyOTP` e `handleCredentials` em `try/catch/finally` para garantir que `setSubmitting(false)` corre sempre, mesmo em caso de exceção
- Adicionar `console.error` para tornar futuros erros visíveis nos logs do browser
- Persistir `loginUserId` em `sessionStorage` quando set, para sobreviver a qualquer re-render/remount inesperado entre o passo de credenciais e o passo OTP

**`src/hooks/use-auth.ts`**
- Adicionar `try/catch` em `verify2FA` e `send2FACode` para retornar erro estruturado em vez de lançar exceção
- Tornar `pendingUserId` mais resiliente: lê de `sessionStorage` como fallback se o state em memória estiver vazio

**Re-deploy:** Não é necessário (apenas frontend).

### Como testar
1. Após o deploy, ir a `/admin/login`
2. Introduzir credenciais → receber OTP por email
3. Inserir o código de 6 dígitos e clicar "Verificar"
4. Confirmar entrada no `/admin`. Se falhar, o erro estará agora visível no UI e na consola

