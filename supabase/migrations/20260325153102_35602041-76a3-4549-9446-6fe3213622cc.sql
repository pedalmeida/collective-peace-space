
CREATE TABLE public.admin_otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_otp_codes ENABLE ROW LEVEL SECURITY;

-- No public policies - only service role access via edge functions

-- Index for fast lookups
CREATE INDEX idx_admin_otp_user_expires ON public.admin_otp_codes (user_id, expires_at DESC);
