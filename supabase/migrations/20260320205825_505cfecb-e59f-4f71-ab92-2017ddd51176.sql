CREATE POLICY "No public inserts on user_roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (false);