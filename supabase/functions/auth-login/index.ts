import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SALT = "lovable_salt::";

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { enrollment_no, password } = await req.json();
    if (!enrollment_no || !password) {
      return new Response(JSON.stringify({ error: "Enrollment number and password required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: student } = await supabase
      .from("students")
      .select("id, enrollment_no, password_hash, name, semester, branch, email")
      .eq("enrollment_no", enrollment_no.trim().toUpperCase())
      .maybeSingle();

    if (!student) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hash = await sha256Hex(SALT + password);
    if (hash !== student.password_hash) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate session token
    const token = crypto.randomUUID() + "-" + crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from("student_sessions").insert({
      token, student_id: student.id, expires_at: expiresAt,
    });

    const { password_hash: _, ...studentSafe } = student;
    return new Response(JSON.stringify({ token, student: studentSafe }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("login error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
