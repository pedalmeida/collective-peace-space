
Objetivo: desbloquear com urgência o login do backoffice, atacando a causa real do bloqueio no passo “Verificar”.

Diagnóstico
- As correções anteriores melhoraram o tratamento de erros e o loading, mas não resolveram o problema principal: a submissão/verificação do OTP continua frágil.
- O que vejo no código:
  - `AdminLogin.tsx` depende do componente `InputOTP` dentro de um `<form onSubmit={handleVerifyOTP}>`.
  - `useAuth.ts` faz a verificação via `supabase.functions.invoke("verify-admin-otp")`.
  - `AdminLayout.tsx` só deixa entrar com `user && isAdmin`.
- O que os sinais apontam:
  - O login com password está a funcionar.
  - A função `verify-admin-otp` existe, mas quase não recebe chamadas.
  - O problema está muito provavelmente no frontend, antes da chamada sair.
- Porque as tentativas anteriores falharam:
  - Elas focaram-se em exceções e estado de loading.
  - Mas o bug parece estar na interação do campo OTP/submit e no estado do passo de verificação, não apenas no `try/catch`.

Solução proposta
1. Substituir o `InputOTP` por uma implementação mais robusta e simples:
   - usar um `Input` normal com `inputMode="numeric"`, `pattern="[0-9]*"`, `maxLength={6}`
   - sanitizar para aceitar apenas dígitos
   - permitir colar o código completo
   - isto remove dependência do comportamento interno do `input-otp`, que é o principal suspeito
2. Tornar o passo OTP persistente:
   - guardar `admin_login_step = "otp"` em `sessionStorage`
   - guardar também o email e `loginUserId`
   - ao montar a página, restaurar automaticamente o passo OTP se existir sessão pendente
3. Tornar a verificação totalmente explícita:
   - o botão “Verificar” chama diretamente uma função `handleVerifyOTP()` sem depender só da submissão do form
   - adicionar também suporte a Enter, mas sem depender disso como caminho principal
4. Redirecionar explicitamente após sucesso:
   - depois de `verify2FA` devolver sucesso, navegar programaticamente para `/admin`
   - assim evitamos depender apenas do rerender com `isAdmin`
5. Limpar e reforçar o estado:
   - ao voltar atrás ou sair, limpar `admin_pending_user_id`, `admin_login_step`, `admin_2fa_verified` e código parcial
   - manter mensagens de erro claras no ecrã

Ficheiros a alterar
- `src/pages/AdminLogin.tsx`
  - remover `InputOTP`
  - trocar por input numérico simples
  - persistir/restaurar o passo OTP
  - chamar verificação de forma explícita
  - navegar para `/admin` após sucesso
- `src/hooks/use-auth.ts`
  - manter fallback por `sessionStorage`
  - devolver sucesso/erro de forma inequívoca
  - opcionalmente expor um `complete2FA` mais explícito se ajudar a simplificar o fluxo

Como vou validar quando aprovares
1. Login com credenciais válidas
2. Confirmar mudança para o passo OTP
3. Introduzir ou colar 6 dígitos
4. Confirmar que sai pedido para `verify-admin-otp`
5. Confirmar redirecionamento para `/admin`
6. Testar também:
   - código inválido
   - reenvio
   - refresh da página no passo OTP
   - mobile

Detalhes técnicos
- Esta é uma mudança de estratégia, não apenas mais um remendo.
- Em vez de tentar “curar” o comportamento do componente OTP atual, vamos simplificar o fluxo para o caminho mais previsível e mais seguro.
- Isto reduz risco de eventos não dispararem, submit falhar silenciosamente, ou o valor OTP não chegar a `otpCode` como esperado.
