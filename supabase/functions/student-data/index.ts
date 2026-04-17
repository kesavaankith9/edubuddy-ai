import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export async function getStudentFromToken(supabase: any, token: string | null) {
  if (!token) return null;
  const { data: session } = await supabase
    .from("student_sessions")
    .select("student_id, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  const { data: student } = await supabase
    .from("students")
    .select("id, enrollment_no, name, semester, branch, email")
    .eq("id", session.student_id)
    .maybeSingle();
  return student;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const token = req.headers.get("x-session-token");
    const student = await getStudentFromToken(supabase, token);
    if (!student) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: subjects }, { data: marks }] = await Promise.all([
      supabase.from("subjects").select("*").eq("student_id", student.id).order("name"),
      supabase.from("marks").select("*").eq("student_id", student.id),
    ]);

    return new Response(JSON.stringify({ student, subjects: subjects ?? [], marks: marks ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("student-data error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
