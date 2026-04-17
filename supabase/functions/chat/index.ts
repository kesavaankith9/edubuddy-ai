import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function getStudentFromToken(supabase: any, token: string | null) {
  if (!token) return null;
  const { data: session } = await supabase
    .from("student_sessions")
    .select("student_id, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (!session || new Date(session.expires_at) < new Date()) return null;
  const { data: student } = await supabase
    .from("students")
    .select("id, enrollment_no, name, semester, branch")
    .eq("id", session.student_id)
    .maybeSingle();
  return student;
}

function buildContext(student: any, subjects: any[], marks: any[]) {
  const subjectLines = subjects.map((s) => {
    const pct = ((s.attended_sessions / s.total_sessions) * 100).toFixed(2);
    const remaining = s.total_sessions - s.attended_sessions;
    const perSessionGain = (1 / s.total_sessions) * 100;
    const sm = marks.filter((m) => m.subject_id === s.id)
      .map((m) => `${m.exam_type}: ${m.marks_obtained}/${m.max_marks}`)
      .join("; ");
    return `- ${s.name} (${s.code}): attended ${s.attended_sessions}/${s.total_sessions} = ${pct}%. Remaining sessions: ${remaining}. Each session ≈ ${perSessionGain.toFixed(2)}%. Marks → ${sm || "none yet"}.`;
  }).join("\n");

  const overallAttended = subjects.reduce((a, s) => a + s.attended_sessions, 0);
  const overallTotal = subjects.reduce((a, s) => a + s.total_sessions, 0);
  const overallPct = overallTotal ? ((overallAttended / overallTotal) * 100).toFixed(2) : "0";

  return `STUDENT PROFILE
Name: ${student.name}
Enrollment: ${student.enrollment_no}
Semester: ${student.semester} | Branch: ${student.branch}
Overall attendance: ${overallAttended}/${overallTotal} = ${overallPct}%

SUBJECT-WISE DATA (current semester):
${subjectLines}

INSTRUCTIONS:
- Answer questions about the student's attendance, marks, and academics using ONLY the data above.
- For attendance queries: state current %, mention if it's below the 75% threshold, and give a precise plan: how many MORE consecutive sessions to attend to reach 75%, and the % gain/loss per session.
- For improvement: compute (0.75 * total - attended) / (1 - 0.75) sessions needed if current < 75%; otherwise say they're safe.
- Be encouraging, concise, and use bullet points or short tables when helpful.
- If asked something outside academics, gently redirect to study/career guidance.`;
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

    const { messages } = await req.json();

    const [{ data: subjects }, { data: marks }] = await Promise.all([
      supabase.from("subjects").select("*").eq("student_id", student.id),
      supabase.from("marks").select("*").eq("student_id", student.id),
    ]);

    const systemPrompt = `You are EduMate, a friendly AI study mentor. ${buildContext(student, subjects ?? [], marks ?? [])}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // Save user message
    const lastUser = messages[messages.length - 1];
    if (lastUser?.role === "user") {
      await supabase.from("chat_messages").insert({
        student_id: student.id, role: "user", content: lastUser.content,
      });
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tee stream so we can save the assistant message after streaming
    const [streamForClient, streamForSave] = aiResp.body!.tee();

    (async () => {
      try {
        const reader = streamForSave.getReader();
        const decoder = new TextDecoder();
        let full = "";
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let nl;
          while ((nl = buf.indexOf("\n")) !== -1) {
            let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const j = line.slice(6).trim();
            if (j === "[DONE]") continue;
            try {
              const p = JSON.parse(j);
              const c = p.choices?.[0]?.delta?.content;
              if (c) full += c;
            } catch {}
          }
        }
        if (full) {
          await supabase.from("chat_messages").insert({
            student_id: student.id, role: "assistant", content: full,
          });
        }
      } catch (err) { console.error("save stream err:", err); }
    })();

    return new Response(streamForClient, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
