import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const ADMIN_PENDING_USER_ID_KEY = "admin_pending_user_id";
const ADMIN_LOGIN_STEP_KEY = "admin_login_step";
const ADMIN_LOGIN_EMAIL_KEY = "admin_login_email";
const ADMIN_OTP_EXPIRES_AT_KEY = "admin_otp_expires_at";

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

const getRemainingOtpSeconds = () => {
  const expiresAt = Number(readSessionValue(ADMIN_OTP_EXPIRES_AT_KEY) ?? "0");
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const initialPendingUserId = readSessionValue(ADMIN_PENDING_USER_ID_KEY);
  const shouldRestoreOtpStep =
    readSessionValue(ADMIN_LOGIN_STEP_KEY) === "otp" && !!initialPendingUserId;
  const { user, isAdmin, pendingUserId, loading, signIn, verify2FA, send2FACode } = useAuth();
  const [email, setEmail] = useState(() => readSessionValue(ADMIN_LOGIN_EMAIL_KEY) ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"credentials" | "otp">(
    shouldRestoreOtpStep ? "otp" : "credentials",
  );
  const [otpCode, setOtpCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(() =>
    shouldRestoreOtpStep ? getRemainingOtpSeconds() : OTP_EXPIRY_SECONDS,
  );
  const [canResend, setCanResend] = useState(() =>
    shouldRestoreOtpStep ? getRemainingOtpSeconds() <= 0 : false,
  );
  const [loginUserId, setLoginUserId] = useState<string | null>(initialPendingUserId);

  useEffect(() => {
    if (email) {
      writeSessionValue(ADMIN_LOGIN_EMAIL_KEY, email);
      return;
    }
    clearSessionValues(ADMIN_LOGIN_EMAIL_KEY);
  }, [email]);

  useEffect(() => {
    if (step === "otp" && !loginUserId && pendingUserId) {
      setLoginUserId(pendingUserId);
    }
  }, [step, loginUserId, pendingUserId]);

  const startOtpStep = (userId: string) => {
    const expiresAt = Date.now() + OTP_EXPIRY_SECONDS * 1000;
    writeSessionValue(ADMIN_PENDING_USER_ID_KEY, userId);
    writeSessionValue(ADMIN_LOGIN_STEP_KEY, "otp");
    writeSessionValue(ADMIN_OTP_EXPIRES_AT_KEY, String(expiresAt));
    setLoginUserId(userId);
    setStep("otp");
    setOtpCode("");
    setSecondsLeft(OTP_EXPIRY_SECONDS);
    setCanResend(false);
  };

  const resetOtpStep = () => {
    clearSessionValues(
      ADMIN_PENDING_USER_ID_KEY,
      ADMIN_LOGIN_STEP_KEY,
      ADMIN_OTP_EXPIRES_AT_KEY,
      "admin_2fa_verified",
    );
    setStep("credentials");
    setOtpCode("");
    setLoginUserId(null);
    setSecondsLeft(OTP_EXPIRY_SECONDS);
    setCanResend(false);
    setSubmitting(false);
  };

  useEffect(() => {
    if (step !== "otp") return;
    if (secondsLeft <= 0) {
      setCanResend(true);
      clearSessionValues(ADMIN_OTP_EXPIRES_AT_KEY);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, secondsLeft]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { error: authError, needs2FA: requires2FA, userId } = await signIn(email, password);

      if (authError) {
        setError("Credenciais inválidas.");
        return;
      }

      if (requires2FA && userId) {
        const { error: otpError } = await send2FACode(userId);
        if (otpError) {
          setError(otpError);
          return;
        }
        startOtpStep(userId);
      }
    } catch (err) {
      console.error("handleCredentials exception:", err);
      setError("Ocorreu um erro inesperado. Tenta novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== OTP_LENGTH) return;
    setError("");
    setSubmitting(true);

    try {
      const targetUserId =
        loginUserId || pendingUserId || readSessionValue(ADMIN_PENDING_USER_ID_KEY) || undefined;
      const { error: verifyError } = await verify2FA(otpCode, targetUserId);

      if (verifyError) {
        setError(verifyError);
        setOtpCode("");
        return;
      }

      clearSessionValues(ADMIN_LOGIN_STEP_KEY, ADMIN_OTP_EXPIRES_AT_KEY);
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("handleVerifyOTP exception:", err);
      setError("Ocorreu um erro inesperado. Tenta novamente.");
      setOtpCode("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setCanResend(false);
    try {
      const targetUserId =
        loginUserId || pendingUserId || readSessionValue(ADMIN_PENDING_USER_ID_KEY) || undefined;
      const { error: resendError } = await send2FACode(targetUserId);
      if (resendError) {
        setError(resendError);
        setCanResend(true);
        return;
      }
      if (targetUserId) {
        startOtpStep(targetUserId);
      }
    } catch (err) {
      console.error("handleResend exception:", err);
      setError("Erro ao reenviar o código.");
      setCanResend(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold text-foreground">Backoffice</h1>
          <p className="text-sm text-muted-foreground">
            {step === "credentials"
              ? "Iniciar sessão como administrador"
              : "Verificação de segurança"}
          </p>
        </div>

        {step === "credentials" ? (
          <form onSubmit={handleCredentials} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Entrar
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Enviámos um código de 6 dígitos para o seu email. Introduza-o abaixo.
              </p>
              {secondsLeft > 0 && (
                <p className="text-xs text-muted-foreground">
                  Expira em <span className="font-mono font-medium text-foreground">{formatTime(secondsLeft)}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp-code" className="sr-only">
                Código de verificação
              </Label>
              <Input
                id="otp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                value={otpCode}
                autoFocus
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedCode = e.clipboardData
                    .getData("text")
                    .replace(/\D/g, "")
                    .slice(0, OTP_LENGTH);
                  setOtpCode(pastedCode);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleVerifyOTP();
                  }
                }}
                className="text-center font-mono text-lg tracking-[0.6em]"
              />
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button
              type="button"
              className="w-full"
              disabled={submitting || otpCode.length !== OTP_LENGTH}
              onClick={() => void handleVerifyOTP()}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Verificar
            </Button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={resetOtpStep}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Voltar
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reenviar código
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
