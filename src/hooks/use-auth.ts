import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async (currentUser: User | null) => {
    if (currentUser) {
      try {
        const { data } = await supabase.rpc("has_role", {
          _user_id: currentUser.id,
          _role: "admin",
        });
        setIsAdmin(!!data);
      } catch {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
    setUser(currentUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    let initialSessionHandled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (initialSessionHandled) {
          await checkAdmin(session?.user ?? null);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      initialSessionHandled = true;
      await checkAdmin(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [checkAdmin]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, isAdmin, loading, signIn, signOut };
}
