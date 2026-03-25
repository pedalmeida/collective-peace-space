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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Pedido inválido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user exists and is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user_id)
      .eq("role", "admin");

    if (!roles?.length) {
      return new Response(
        JSON.stringify({ error: "Sem permissão." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: max 3 codes per user in last 15 minutes
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: recentCodes } = await supabase
      .from("admin_otp_codes")
      .select("id")
      .eq("user_id", user_id)
      .gte("created_at", fifteenMinAgo);

    if (recentCodes && recentCodes.length >= 3) {
      return new Response(
        JSON.stringify({ error: "Demasiados pedidos. Tente novamente mais tarde." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Invalidate previous unused codes
    await supabase
      .from("admin_otp_codes")
      .update({ used: true })
      .eq("user_id", user_id)
      .eq("used", false);

    // Generate 6-digit code
    const code = Array.from(crypto.getRandomValues(new Uint8Array(3)))
      .map((b) => (b % 10).toString())
      .join("")
      .padEnd(6, "0")
      .slice(0, 6);

    // Better: use full random range
    const rawCode = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    const codeHash = await sha256(rawCode);

    // Store hashed code with 5 min expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await supabase.from("admin_otp_codes").insert({
      user_id,
      code_hash: codeHash,
      expires_at: expiresAt,
    });

    // Get user email
    const { data: { user } } = await supabase.auth.admin.getUserById(user_id);
    if (!user?.email) {
      return new Response(
        JSON.stringify({ error: "Não foi possível enviar o código." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send OTP via Lovable AI
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Serviço temporariamente indisponível." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailResponse = await fetch("https://api.lovable.dev/api/v2/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        to: user.email,
        subject: "Código de verificação — Backoffice",
        html: `
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
        `,
        text: `O seu código de verificação é: ${rawCode}. Expira em 5 minutos.`,
      }),
    });

    if (!emailResponse.ok) {
      console.error("Email send failed:", await emailResponse.text());
      return new Response(
        JSON.stringify({ error: "Não foi possível enviar o código." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-admin-otp error:", e);
    return new Response(
      JSON.stringify({ error: "Ocorreu um erro interno." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
