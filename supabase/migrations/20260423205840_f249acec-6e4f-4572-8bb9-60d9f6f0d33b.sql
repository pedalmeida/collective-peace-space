-- 1. Table for verified admin sessions (2FA persisted in backend)
CREATE TABLE IF NOT EXISTS public.admin_verified_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text NOT NULL,
  verified_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_verified_sessions_user
  ON public.admin_verified_sessions(user_id, expires_at);

ALTER TABLE public.admin_verified_sessions ENABLE ROW LEVEL SECURITY;

-- Service role full access (edge functions write)
CREATE POLICY "Service role manages verified sessions"
  ON public.admin_verified_sessions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Authenticated user can read own sessions (for client gate)
CREATE POLICY "Users can view their own verified sessions"
  ON public.admin_verified_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated user can revoke (delete) own sessions
CREATE POLICY "Users can delete their own verified sessions"
  ON public.admin_verified_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Helper function: is current admin session 2FA-verified?
CREATE OR REPLACE FUNCTION public.has_verified_admin_session(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_verified_sessions
    WHERE user_id = _user_id
      AND expires_at > now()
  );
$$;

-- 3. Combined gate: admin role + 2FA verified
CREATE OR REPLACE FUNCTION public.can_access_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin'::app_role)
    AND public.has_verified_admin_session(_user_id);
$$;

-- 4. Update RLS policies on admin areas to require 2FA-verified session
-- events
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;

CREATE POLICY "Verified admins can insert events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (public.can_access_admin(auth.uid()));

CREATE POLICY "Verified admins can update events"
  ON public.events FOR UPDATE TO authenticated
  USING (public.can_access_admin(auth.uid()));

CREATE POLICY "Verified admins can delete events"
  ON public.events FOR DELETE TO authenticated
  USING (public.can_access_admin(auth.uid()));

-- gallery
DROP POLICY IF EXISTS "Admins can insert gallery items" ON public.gallery;
DROP POLICY IF EXISTS "Admins can update gallery items" ON public.gallery;
DROP POLICY IF EXISTS "Admins can delete gallery items" ON public.gallery;

CREATE POLICY "Verified admins can insert gallery items"
  ON public.gallery FOR INSERT TO authenticated
  WITH CHECK (public.can_access_admin(auth.uid()));

CREATE POLICY "Verified admins can update gallery items"
  ON public.gallery FOR UPDATE TO authenticated
  USING (public.can_access_admin(auth.uid()));

CREATE POLICY "Verified admins can delete gallery items"
  ON public.gallery FOR DELETE TO authenticated
  USING (public.can_access_admin(auth.uid()));

-- organizations
DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;

CREATE POLICY "Verified admins can manage organizations"
  ON public.organizations FOR ALL TO authenticated
  USING (public.can_access_admin(auth.uid()))
  WITH CHECK (public.can_access_admin(auth.uid()));

-- quotes
DROP POLICY IF EXISTS "Admins can manage quotes" ON public.quotes;

CREATE POLICY "Verified admins can manage quotes"
  ON public.quotes FOR ALL TO authenticated
  USING (public.can_access_admin(auth.uid()))
  WITH CHECK (public.can_access_admin(auth.uid()));

-- subscribers (only SELECT was admin)
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.subscribers;

CREATE POLICY "Verified admins can view subscribers"
  ON public.subscribers FOR SELECT TO authenticated
  USING (public.can_access_admin(auth.uid()));

-- user_roles (only SELECT was admin)
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Verified admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.can_access_admin(auth.uid()));