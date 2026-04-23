import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SESSION_TTL_MINUTES = 60 * 12; // 12 hours

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1. Authenticate caller from bearer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.warn("[verify-admin-otp] missing bearer token");
      return jsonResponse({ error: "Sessão inválida." }, 401);
    }
    const token = authHeader.replace("Bearer ", "");

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: claimsErr } = await authClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      console.warn("[verify-admin-otp] invalid token", claimsErr);
      return jsonResponse({ error: "Sessão inválida." }, 401);
    }
    const userId = claims.claims.sub as string;
    const sessionId =
      (claims.claims.session_id as string | undefined) ||
      (claims.claims.sid as string | undefined) ||
      token.slice(-32);

    // 2. Validate body
    let body: { code?: string };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Pedido inválido." }, 400);
    }
    const code = (body.code ?? "").trim();
    if (!/^\d{6}$/.test(code)) {
      return jsonResponse({ error: "Código inválido." }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 3. Verify caller is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin");

    if (!roles?.length) {
      console.warn("[verify-admin-otp] not admin", userId);
      return jsonResponse({ error: "Sem permissão." }, 403);
    }

    // 4. Find latest active OTP for this user
    const { data: otpRecords } = await supabase
      .from("admin_otp_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (!otpRecords?.length) {
      console.warn("[verify-admin-otp] no active OTP for user", userId);
      return jsonResponse({ error: "Código inválido ou expirado." }, 401);
    }

    const otpRecord = otpRecords[0];

    if (otpRecord.attempts >= 5) {
      await supabase
        .from("admin_otp_codes")
        .update({ used: true })
        .eq("id", otpRecord.id);
      console.warn("[verify-admin-otp] max attempts reached", userId);
      return jsonResponse({ error: "Código inválido ou expirado." }, 401);
    }

    const codeHash = await sha256(code);

    if (codeHash !== otpRecord.code_hash) {
      await supabase
        .from("admin_otp_codes")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);
      console.warn("[verify-admin-otp] wrong code", userId);
      return jsonResponse({ error: "Código inválido ou expirado." }, 401);
    }

    // 5. Mark OTP as used
    await supabase
      .from("admin_otp_codes")
      .update({ used: true })
      .eq("id", otpRecord.id);

    // 6. Persist verified admin session in backend
    const expiresAt = new Date(
      Date.now() + SESSION_TTL_MINUTES * 60 * 1000,
    ).toISOString();

    const { error: sessionErr } = await supabase
      .from("admin_verified_sessions")
      .upsert(
        {
          user_id: userId,
          session_id: sessionId,
          verified_at: new Date().toISOString(),
          expires_at: expiresAt,
        },
        { onConflict: "user_id,session_id" },
      );

    if (sessionErr) {
      console.error("[verify-admin-otp] failed to persist session:", sessionErr);
      return jsonResponse({ error: "Não foi possível registar a sessão." }, 500);
    }

    console.log("[verify-admin-otp] OTP verified for user", userId);
    return jsonResponse({ success: true, expires_at: expiresAt });
  } catch (e) {
    console.error("[verify-admin-otp] error:", e);
    return jsonResponse({ error: "Ocorreu um erro interno." }, 500);
  }
});
