import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const ADMIN_PENDING_USER_ID_KEY = "admin_pending_user_id";
const ADMIN_2FA_VERIFIED_KEY = "admin_2fa_verified";
const ADMIN_LOGIN_STEP_KEY = "admin_login_step";
const ADMIN_LOGIN_EMAIL_KEY = "admin_login_email";
const ADMIN_OTP_EXPIRES_AT_KEY = "admin_otp_expires_at";
const ADMIN_ACCESS_TOKEN_KEY = "admin_access_token";

const readSessionValue = (key: string) =>
  typeof window === "undefined" ? null : window.sessionStorage.getItem(key);

const writeSessionValue = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(key, value);
  }
};

const clearSessionValues = (...keys: string[]) => {
  if (typeof window !== "undefined") {
    keys.forEach((key) => window.sessionStorage.removeItem(key));
  }
};

const syncAccessToken = (accessToken: string | null | undefined) => {
  if (accessToken) {
    writeSessionValue(ADMIN_ACCESS_TOKEN_KEY, accessToken);
    return;
  }

  clearSessionValues(ADMIN_ACCESS_TOKEN_KEY);
};

const callAdminFunction = async <T>(
  functionName: "send-admin-otp" | "verify-admin-otp",
  body: Record<string, unknown>,
) => {
  const accessToken = readSessionValue(ADMIN_ACCESS_TOKEN_KEY);

  if (!accessToken) {
    return { data: null as T | null, error: "Sessão expirada. Inicia sessão novamente." };
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      },
    );

    const text = await response.text();
    const data = text ? (JSON.parse(text) as T & { error?: string }) : null;

    if (!response.ok) {
      return {
        data: null as T | null,
        error: data?.error || `Pedido falhou (${response.status}).`,
      };
    }

    return { data: data as T | null, error: null };
  } catch (error) {
    console.error(`${functionName} request failed:`, error);
    return {
      data: null as T | null,
      error: "Erro de rede ao contactar o servidor. Tenta novamente.",
    };
  }
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(() =>
    readSessionValue(ADMIN_PENDING_USER_ID_KEY)
  );
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async (currentUser: User | null) => {
    if (currentUser) {
      try {
        const { data } = await supabase.rpc("has_role", {
          _user_id: currentUser.id,
          _role: "admin",
        });
        const otpVerified = readSessionValue(ADMIN_2FA_VERIFIED_KEY);
        if (!!data && otpVerified === currentUser.id) {
          setIsAdmin(true);
          setNeeds2FA(false);
          setPendingUserId(null);
          clearSessionValues(ADMIN_PENDING_USER_ID_KEY, ADMIN_LOGIN_STEP_KEY, ADMIN_OTP_EXPIRES_AT_KEY);
        } else if (!!data) {
          writeSessionValue(ADMIN_PENDING_USER_ID_KEY, currentUser.id);
          setPendingUserId(currentUser.id);
          setNeeds2FA(true);
          setIsAdmin(false);
        } else {
          setIsAdmin(false);
          setNeeds2FA(false);
          setPendingUserId(null);
          clearSessionValues(ADMIN_PENDING_USER_ID_KEY, ADMIN_LOGIN_STEP_KEY, ADMIN_OTP_EXPIRES_AT_KEY);
        }
      } catch {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
      setNeeds2FA(false);
      setPendingUserId(null);
      clearSessionValues(ADMIN_PENDING_USER_ID_KEY, ADMIN_LOGIN_STEP_KEY, ADMIN_OTP_EXPIRES_AT_KEY);
    }
    setUser(currentUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    let initialSessionHandled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncAccessToken(session?.access_token);

      if (initialSessionHandled) {
        window.setTimeout(() => {
          void checkAdmin(session?.user ?? null);
        }, 0);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      initialSessionHandled = true;
      syncAccessToken(session?.access_token);
      await checkAdmin(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [checkAdmin]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error, needs2FA: false, userId: null };

    syncAccessToken(data.session?.access_token);

    // Check if this user is admin
    const { data: roleData } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });

    if (roleData) {
      writeSessionValue(ADMIN_PENDING_USER_ID_KEY, data.user.id);
      setNeeds2FA(true);
      setPendingUserId(data.user.id);
      return { error: null, needs2FA: true, userId: data.user.id, success: true };
    }

    clearSessionValues(ADMIN_PENDING_USER_ID_KEY, ADMIN_LOGIN_STEP_KEY, ADMIN_OTP_EXPIRES_AT_KEY);
    return { error: null, needs2FA: false, userId: null, success: true };
  };

  const verify2FA = async (code: string, userId?: string) => {
    const targetUserId =
      userId || pendingUserId || readSessionValue(ADMIN_PENDING_USER_ID_KEY);
    if (!targetUserId) return { success: false, error: "Sessão inválida." };

    try {
      const { data, error } = await callAdminFunction<{ success?: boolean; error?: string }>(
        "verify-admin-otp",
        { user_id: targetUserId, code },
      );

      if (error || !data?.success) {
        console.error("verify2FA failed:", { error, data });
        return {
          success: false,
          error: data?.error || error?.message || "Código inválido ou expirado.",
        };
      }

      writeSessionValue(ADMIN_2FA_VERIFIED_KEY, targetUserId);
      clearSessionValues(ADMIN_PENDING_USER_ID_KEY, ADMIN_LOGIN_STEP_KEY, ADMIN_OTP_EXPIRES_AT_KEY);
      setPendingUserId(null);
      setIsAdmin(true);
      setNeeds2FA(false);
      return { success: true, error: null };
    } catch (e) {
      console.error("verify2FA exception:", e);
      return { success: false, error: "Erro de rede ao verificar o código. Tenta novamente." };
    }
  };

  const send2FACode = async (userId?: string) => {
    const targetUserId =
      userId || pendingUserId || readSessionValue(ADMIN_PENDING_USER_ID_KEY);
    if (!targetUserId) return { success: false, error: "Sessão inválida." };

    try {
      const { data, error } = await callAdminFunction<{ success?: boolean; error?: string }>(
        "send-admin-otp",
        { user_id: targetUserId },
      );

      if (error || !data?.success) {
        console.error("send2FACode failed:", { error, data });
        return {
          success: false,
          error: data?.error || error?.message || "Não foi possível enviar o código.",
        };
      }

      return { success: true, error: null };
    } catch (e) {
      console.error("send2FACode exception:", e);
      return { success: false, error: "Erro de rede ao enviar o código. Tenta novamente." };
    }
  };

  const signOut = async () => {
    clearSessionValues(
      ADMIN_2FA_VERIFIED_KEY,
      ADMIN_PENDING_USER_ID_KEY,
      ADMIN_LOGIN_STEP_KEY,
      ADMIN_LOGIN_EMAIL_KEY,
      ADMIN_OTP_EXPIRES_AT_KEY,
      ADMIN_ACCESS_TOKEN_KEY,
    );
    setNeeds2FA(false);
    setPendingUserId(null);
    await supabase.auth.signOut();
  };

  return { user, isAdmin, needs2FA, loading, signIn, signOut, verify2FA, send2FACode, pendingUserId };
}
