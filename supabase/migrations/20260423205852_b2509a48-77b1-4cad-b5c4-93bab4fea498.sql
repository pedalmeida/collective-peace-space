-- Fix function search_path warnings
ALTER FUNCTION public.has_verified_admin_session(uuid) SET search_path = public;
ALTER FUNCTION public.can_access_admin(uuid) SET search_path = public;