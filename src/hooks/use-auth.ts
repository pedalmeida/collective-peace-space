import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async (currentUser: User | null) => {
    if (currentUser) {
      try {
        const { data } = await supabase.rpc("has_role", {
          _user_id: currentUser.id,
          _role: "admin",
        });
        // Don't set isAdmin yet — only after 2FA verification on fresh login
        // But if already authenticated (page refresh), check if 2FA was completed
        const otpVerified = sessionStorage.getItem("admin_2fa_verified");
        if (!!data && otpVerified === currentUser.id) {
          setIsAdmin(true);
          setNeeds2FA(false);
        } else if (!!data) {
          // Admin but no 2FA yet — don't grant access
          setIsAdmin(false);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
      setNeeds2FA(false);
      setPendingUserId(null);
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error, needs2FA: false, userId: null };

    // Check if this user is admin
    const { data: roleData } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });

    if (roleData) {
      // Admin login — require 2FA
      setNeeds2FA(true);
      setPendingUserId(data.user.id);
      return { error: null, needs2FA: true, userId: data.user.id };
    }

    return { error: null, needs2FA: false, userId: null };
  };

  const verify2FA = async (code: string) => {
    if (!pendingUserId) return { error: "Sessão inválida." };

    const { data, error } = await supabase.functions.invoke("verify-admin-otp", {
      body: { user_id: pendingUserId, code },
    });

    if (error || !data?.success) {
      return { error: data?.error || "Código inválido ou expirado." };
    }

    // Mark 2FA as verified for this session
    sessionStorage.setItem("admin_2fa_verified", pendingUserId);
    setIsAdmin(true);
    setNeeds2FA(false);
    return { error: null };
  };

  const send2FACode = async (userId?: string) => {
    const targetUserId = userId || pendingUserId;
    if (!targetUserId) return { error: "Sessão inválida." };

    const { data, error } = await supabase.functions.invoke("send-admin-otp", {
      body: { user_id: targetUserId },
    });

    if (error || !data?.success) {
      return { error: data?.error || "Não foi possível enviar o código." };
    }

    return { error: null };
  };

  const signOut = async () => {
    sessionStorage.removeItem("admin_2fa_verified");
    setNeeds2FA(false);
    setPendingUserId(null);
    await supabase.auth.signOut();
  };

  return { user, isAdmin, needs2FA, loading, signIn, signOut, verify2FA, send2FACode, pendingUserId };
}
