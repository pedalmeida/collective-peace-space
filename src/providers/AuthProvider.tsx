import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AdminGateStatus =
  | "anonymous"
  | "signed_in_not_admin"
  | "signed_in_pending_2fa"
  | "verified_admin";

type AuthContextValue = {
  authReady: boolean;
  user: User | null;
  session: Session | null;
  isAdminRole: boolean;
  isAdmin2FAVerified: boolean;
  canAccessAdmin: boolean;
  adminGateStatus: AdminGateStatus;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needs2FA: boolean; userId: string | null }>;
  send2FACode: () => Promise<{ error: string | null }>;
  verify2FA: (code: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const callEdgeFunction = async <T,>(
  functionName: "send-admin-otp" | "verify-admin-otp",
  body: Record<string, unknown>,
  accessToken: string | null,
): Promise<{ data: T | null; error: string | null }> => {
  if (!accessToken) {
    return { data: null, error: "Sessão expirada. Inicia sessão novamente." };
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
        data: null,
        error: data?.error || `Pedido falhou (${response.status}).`,
      };
    }

    return { data: data as T, error: null };
  } catch (error) {
    console.error(`${functionName} request failed:`, error);
    return {
      data: null,
      error: "Erro de rede ao contactar o servidor. Tenta novamente.",
    };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [isAdmin2FAVerified, setIsAdmin2FAVerified] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Track latest session synchronously for callbacks
  const sessionRef = useRef<Session | null>(null);

  const refreshAdminStatus = useCallback(async () => {
    const currentSession = sessionRef.current;
    if (!currentSession?.user) {
      setIsAdminRole(false);
      setIsAdmin2FAVerified(false);
      return;
    }

    try {
      const [roleRes, sessionRes] = await Promise.all([
        supabase.rpc("has_role", {
          _user_id: currentSession.user.id,
          _role: "admin",
        }),
        // @ts-expect-error - new RPC not yet in generated types
        supabase.rpc("has_verified_admin_session", {
          _user_id: currentSession.user.id,
        }),
      ]);

      setIsAdminRole(!!roleRes.data);
      setIsAdmin2FAVerified(!!sessionRes.data);
    } catch (e) {
      console.error("refreshAdminStatus failed:", e);
      setIsAdminRole(false);
      setIsAdmin2FAVerified(false);
    }
  }, []);

  // Boot: subscribe FIRST, then restore session, then mark ready
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        sessionRef.current = nextSession;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        // Defer admin checks outside the callback to avoid auth deadlocks
        setTimeout(() => {
          if (!mounted) return;
          void refreshAdminStatus();
        }, 0);
      },
    );

    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      if (!mounted) return;
      sessionRef.current = initial;
      setSession(initial);
      setUser(initial?.user ?? null);

      refreshAdminStatus().finally(() => {
        if (mounted) setAuthReady(true);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshAdminStatus]);

  const signIn = useCallback<AuthContextValue["signIn"]>(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "Credenciais inválidas.", needs2FA: false, userId: null };

    sessionRef.current = data.session;
    setSession(data.session);
    setUser(data.user);

    const { data: roleData } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });

    setIsAdminRole(!!roleData);
    setIsAdmin2FAVerified(false);

    return {
      error: null,
      needs2FA: !!roleData,
      userId: data.user.id,
    };
  }, []);

  const send2FACode = useCallback<AuthContextValue["send2FACode"]>(async () => {
    const accessToken = sessionRef.current?.access_token ?? null;
    const { error } = await callEdgeFunction<{ success?: boolean }>(
      "send-admin-otp",
      {},
      accessToken,
    );
    return { error };
  }, []);

  const verify2FA = useCallback<AuthContextValue["verify2FA"]>(async (code) => {
    const accessToken = sessionRef.current?.access_token ?? null;
    const { data, error } = await callEdgeFunction<{ success?: boolean; error?: string }>(
      "verify-admin-otp",
      { code },
      accessToken,
    );

    if (error || !data?.success) {
      return { error: error || "Código inválido ou expirado." };
    }

    // Re-check 2FA status from backend (admin_verified_sessions)
    await refreshAdminStatus();
    return { error: null };
  }, [refreshAdminStatus]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    sessionRef.current = null;
    setSession(null);
    setUser(null);
    setIsAdminRole(false);
    setIsAdmin2FAVerified(false);
  }, []);

  const adminGateStatus: AdminGateStatus = useMemo(() => {
    if (!user) return "anonymous";
    if (!isAdminRole) return "signed_in_not_admin";
    if (!isAdmin2FAVerified) return "signed_in_pending_2fa";
    return "verified_admin";
  }, [user, isAdminRole, isAdmin2FAVerified]);

  const canAccessAdmin = adminGateStatus === "verified_admin";

  const value = useMemo<AuthContextValue>(
    () => ({
      authReady,
      user,
      session,
      isAdminRole,
      isAdmin2FAVerified,
      canAccessAdmin,
      adminGateStatus,
      signIn,
      send2FACode,
      verify2FA,
      signOut,
      refreshAdminStatus,
    }),
    [
      authReady,
      user,
      session,
      isAdminRole,
      isAdmin2FAVerified,
      canAccessAdmin,
      adminGateStatus,
      signIn,
      send2FACode,
      verify2FA,
      signOut,
      refreshAdminStatus,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
