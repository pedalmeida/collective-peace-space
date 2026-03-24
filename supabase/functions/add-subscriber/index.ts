import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter (resets on cold start, but effective against bursts)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Google Sheets JWT auth helpers
async function getAccessToken(serviceAccountKey: string): Promise<string> {
  const sa = JSON.parse(serviceAccountKey);
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));

  const signInput = `${header}.${payload}`;

  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signInput)
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${header}.${payload}.${sig}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(`Token error: ${JSON.stringify(tokenData)}`);
  return tokenData.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") || "unknown";
    if (isRateLimited(clientIp)) {
      return new Response(JSON.stringify({ error: "Demasiados pedidos. Tenta novamente mais tarde." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceAccountKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
    const sheetId = Deno.env.get("GOOGLE_SHEET_ID");
    if (!serviceAccountKey || !sheetId) {
      throw new Error("Google Sheets credentials not configured");
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 255) : "";
    const comments = typeof body.comments === "string" ? body.comments.trim().slice(0, 1000) : "";
    const wants_to_organize = body.wants_to_organize === true;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Email inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = await getAccessToken(serviceAccountKey);
    const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // Check for duplicates - read column B (Email)
    const readRes = await fetch(`${baseUrl}/values/Sheet1!B:B`, { headers });
    const readData = await readRes.json();
    const emails = (readData.values || []).flat().map((e: string) => e.toLowerCase().trim());

    if (emails.includes(email)) {
      return new Response(JSON.stringify({ duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Append row
    const now = new Date().toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" });
    const appendRes = await fetch(
      `${baseUrl}/values/Sheet1!A:E:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          values: [[
            name,
            email,
            now,
            comments,
            wants_to_organize ? "Sim" : "Não",
          ]],
        }),
      }
    );

    if (!appendRes.ok) {
      const err = await appendRes.json();
      console.error("Sheets append error:", JSON.stringify(err));
      throw new Error("Failed to save subscription");
    }

    // Also save to DB as fallback
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      await supabase.from("subscribers").insert({
        email,
        name: name || null,
        comments: comments || null,
        wants_to_organize,
      });
    } catch (_) {
      // Non-critical - Google Sheets is the primary store
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("add-subscriber error:", e);
    return new Response(JSON.stringify({ error: "Ocorreu um erro. Tenta novamente." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
