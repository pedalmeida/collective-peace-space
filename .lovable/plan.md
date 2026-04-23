
Objetivo: eliminar a causa estrutural do problema no login do backoffice, para que o OTP deixe de falhar de forma intermitente e o acesso admin fique também mais seguro.

### Root cause identificado
O problema não é apenas o botão “Verificar”. Há 4 falhas de arquitetura a causar comportamento intermitente:

1. **Race condition de autenticação**
   - `useAuth` faz verificações admin demasiado cedo, durante o restauro da sessão.
   - `has_role` depende de `auth.uid()` e pode devolver resultado diferente conforme o token já esteja ou não pronto.

2. **Fonte de verdade duplicada**
   - `useAuth()` cria estado local e listeners próprios.
   - `AdminLogin` e `AdminLayout` podem arrancar com estados diferentes e sobrescrever chaves em `sessionStorage`.

3. **2FA guardado só no browser**
   - O estado `admin_2fa_verified` está em `sessionStorage`, não no backend.
   - Isso é frágil em refreshes, remounts, token refresh e também não é segurança real.

4. **Funções OTP demasiado confiantes no cliente**
   - `send-admin-otp` e `verify-admin-otp` recebem `user_id` do body.
   - O token também está a ser espelhado em `sessionStorage`, o que cria mais um ponto de dessincronização.

### Plano de correção definitiva

#### 1. Centralizar autenticação num único provider
Criar um `AuthProvider`/contexto global para haver **uma só subscrição** à autenticação e **um só estado** para:
- `authReady`
- `user`
- `isAdminRole`
- `isAdmin2FAVerified`
- `adminGateStatus` (`anonymous`, `signed_in_pending_2fa`, `verified_admin`)

Isto elimina o conflito entre múltiplas instâncias de `useAuth`.

#### 2. Corrigir o boot da sessão
Reestruturar o arranque da auth para:
- subscrever a mudanças de auth
- restaurar a sessão
- só depois marcar `authReady = true`

Sem `await` de verificações pesadas dentro de `onAuthStateChange`. As verificações de admin passam a correr fora desse callback, de forma controlada.

#### 3. Tirar a verificação 2FA do `sessionStorage`
Substituir `admin_2fa_verified` por uma **sessão admin validada no backend**.

Implementação:
- criar tabela tipo `admin_verified_sessions`
- guardar:
  - `user_id`
  - `session_id`
  - `verified_at`
  - `expires_at`
- ao validar o OTP, a função backend associa a verificação à sessão autenticada atual

Resultado:
- refresh deixa de quebrar o estado
- o backend sabe realmente se aquela sessão admin já passou 2FA
- o front deixa de depender de flags frágeis no browser

#### 4. Passar a validar 2FA também no controlo de acesso
Hoje o acesso admin está efetivamente protegido só por role + lógica client-side.

A correção definitiva é:
- criar função backend/security definer do tipo `has_verified_admin_session()`
- criar uma função wrapper, por exemplo `can_access_admin()`, que combine:
  - role admin
  - sessão autenticada
  - 2FA verificado e não expirado

Depois atualizar as policies/admin checks para usar esta regra nas áreas protegidas.

Isto garante que o 2FA não é apenas “visual”; passa a ser realmente exigido.

#### 5. Harden das Edge Functions OTP
Atualizar `send-admin-otp` e `verify-admin-otp` para:
- ler o utilizador autenticado a partir do bearer token
- ignorar ou validar estritamente o `user_id` recebido no body
- confirmar que o caller só pode agir sobre a sua própria conta
- devolver erros consistentes
- manter rate limiting e invalidação de códigos anteriores
- registar logs claros de:
  - pedido OTP
  - OTP verificado
  - OTP expirado
  - rejeição por sessão inválida

#### 6. Simplificar o frontend do login
Refatorar `AdminLogin` para usar o estado central do provider:
- passo 1: credenciais
- passo 2: OTP pendente
- passo 3: sessão admin validada

Remover do frontend:
- `admin_access_token` em `sessionStorage`
- `admin_2fa_verified` em `sessionStorage`
- lógica duplicada de recuperação frágil

Manter apenas persistência não sensível, se necessário:
- email digitado
- countdown do OTP
- passo visual atual

#### 7. Tornar o gate `/admin` determinístico
`AdminLayout` passa a bloquear acesso com base em:
- `authReady`
- `canAccessAdmin === true`

Assim deixa de depender de estados temporários ou efeitos que ainda estão a correr.

### Ficheiros a alterar
- `src/App.tsx`
- `src/hooks/use-auth.ts` ou substituição por provider + consumer hook
- novo ficheiro de auth context/provider
- `src/pages/AdminLogin.tsx`
- `src/pages/AdminLayout.tsx`
- `supabase/functions/send-admin-otp/index.ts`
- `supabase/functions/verify-admin-otp/index.ts`
- nova migration para sessão admin verificada + atualização de functions/policies admin

### Validação após implementação
Vou validar estes cenários:
1. login admin completo com OTP válido
2. refresh no ecrã OTP
3. refresh após OTP validado
4. reenvio de código
5. código inválido
6. código expirado
7. logout e novo login imediato
8. abrir `/admin` sem 2FA validado
9. confirmar que o acesso admin continua estável em tentativas repetidas

### Detalhes técnicos
- O problema principal é arquitetural, não apenas de UI.
- A correção certa é trocar:
  - **estado disperso + flags em browser**
  por
  - **uma fonte de verdade central + verificação admin persistida no backend**
- Isto resolve ao mesmo tempo:
  - intermitência
  - refresh bugs
  - race conditions
  - fragilidade de sessão
  - falha de segurança no 2FA

