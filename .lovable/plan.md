

## Fix Security Issues

### 3 findings to address

**1. CRITICAL — Privilege escalation on `user_roles` (fix with migration)**

Add an INSERT RLS policy that blocks all inserts (only allow via service role / direct DB access):

```sql
CREATE POLICY "No public inserts on user_roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (false);
```

This prevents any authenticated user from self-assigning the admin role.

**2. WARN — Permissive INSERT on `subscribers` (dismiss — intentional)**

This is the public subscription form. Mark as ignored in the security scan with reason: "Intentional — public email subscription form requires unauthenticated inserts."

**3. WARN — Leaked password protection disabled**

Enable the HIBP (Have I Been Pwned) leaked password check via the auth configuration tool. This prevents users from signing up with known compromised passwords.

### No code changes needed
All fixes are database/config level — no application code changes required.

