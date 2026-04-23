import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
      console.warn("[send-admin-otp] missing bearer token");
      return jsonResponse({ error: "Sessão inválida." }, 401);
    }
    const token = authHeader.replace("Bearer ", "");

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: claimsErr } = await authClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      console.warn("[send-admin-otp] invalid token", claimsErr);
      return jsonResponse({ error: "Sessão inválida." }, 401);
    }
    const userId = claims.claims.sub as string;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 2. Verify caller is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin");

    if (!roles?.length) {
      console.warn("[send-admin-otp] user is not admin", userId);
      return jsonResponse({ error: "Sem permissão." }, 403);
    }

    // 3. Rate limit: max 3 codes per user in last 15 minutes
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: recentCodes } = await supabase
      .from("admin_otp_codes")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", fifteenMinAgo);

    if (recentCodes && recentCodes.length >= 3) {
      console.warn("[send-admin-otp] rate limit hit", userId);
      return jsonResponse(
        { error: "Demasiados pedidos. Tente novamente mais tarde." },
        429,
      );
    }

    // 4. Invalidate previous unused codes
    await supabase
      .from("admin_otp_codes")
      .update({ used: true })
      .eq("user_id", userId)
      .eq("used", false);

    // 5. Generate code
    const rawCode = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await sha256(rawCode);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await supabase.from("admin_otp_codes").insert({
      user_id: userId,
      code_hash: codeHash,
      expires_at: expiresAt,
    });

    // 6. Get user email
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    if (!user?.email) {
      console.error("[send-admin-otp] no email for user", userId);
      return jsonResponse({ error: "Não foi possível enviar o código." }, 500);
    }

    // 7. Enqueue OTP email via pgmq
    const messageId = crypto.randomUUID();
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="font-size: 20px; color: #1a1a1a; margin-bottom: 8px;">Código de verificação</h2>
        <p style="font-size: 14px; color: #666; margin-bottom: 24px;">
          Use o código abaixo para aceder ao backoffice. Este código expira em 5 minutos.
        </p>
        <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">${rawCode}</span>
        </div>
        <p style="font-size: 12px; color: #999;">
          Se não solicitou este código, ignore este email.
        </p>
      </div>
    `;

    const { data: existingToken } = await supabase
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", user.email)
      .maybeSingle();

    let unsubscribeToken: string;
    if (existingToken?.token) {
      unsubscribeToken = existingToken.token;
    } else {
      unsubscribeToken = crypto.randomUUID();
      await supabase.from("email_unsubscribe_tokens").insert({
        email: user.email,
        token: unsubscribeToken,
      });
    }

    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: "admin-otp",
      recipient_email: user.email,
      status: "pending",
    });

    const { error: enqueueError } = await supabase.rpc("enqueue_email", {
      queue_name: "auth_emails",
      payload: {
        to: user.email,
        from: "Meditar um Mundo Melhor <noreply@meditarmundomelhor.org>",
        sender_domain: "notify.meditarmundomelhor.org",
        subject: "Código de verificação — Backoffice",
        html: emailHtml,
        text: `O seu código de verificação é: ${rawCode}. Expira em 5 minutos.`,
        purpose: "transactional",
        label: "admin-otp",
        idempotency_key: `admin-otp-${messageId}`,
        unsubscribe_token: unsubscribeToken,
        message_id: messageId,
        queued_at: new Date().toISOString(),
      },
    });

    if (enqueueError) {
      console.error("[send-admin-otp] enqueue failed:", enqueueError);
      return jsonResponse({ error: "Não foi possível enviar o código." }, 500);
    }

    console.log("[send-admin-otp] OTP sent for user", userId);
    return jsonResponse({ success: true });
  } catch (e) {
    console.error("[send-admin-otp] error:", e);
    return jsonResponse({ error: "Ocorreu um erro interno." }, 500);
  }
});
