// Backwards-compatible re-export. The real implementation lives in the
// AuthProvider so the whole app shares a single auth state and a single
// subscription to supabase.auth.onAuthStateChange.
export { useAuth } from "@/providers/AuthProvider";
