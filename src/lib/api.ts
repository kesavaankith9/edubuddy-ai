// Thin client for our edge functions
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export type Student = {
  id: string;
  enrollment_no: string;
  name: string;
  email: string | null;
  semester: number;
  branch: string;
};

export type Subject = {
  id: string;
  student_id: string;
  semester: number;
  name: string;
  code: string;
  total_sessions: number;
  attended_sessions: number;
};

export type Mark = {
  id: string;
  student_id: string;
  subject_id: string;
  exam_type: string;
  marks_obtained: number;
  max_marks: number;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

const TOKEN_KEY = "edu_session_token";
const STUDENT_KEY = "edu_student";

export const session = {
  get token() { return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null; },
  get student(): Student | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STUDENT_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set(token: string, student: Student) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STUDENT_KEY);
  },
};

function authHeaders(): Record<string, string> {
  const t = session.token;
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    ...(t ? { "x-session-token": t } : {}),
  };
}

export async function login(enrollment_no: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/auth-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    body: JSON.stringify({ enrollment_no, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  session.set(data.token, data.student);
  return data.student as Student;
}

export async function fetchStudentData(): Promise<{ student: Student; subjects: Subject[]; marks: Mark[] }> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/student-data`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: ChatMessage[];
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok || !res.body) {
    let msg = "Chat failed";
    try { const j = await res.json(); msg = j.error || msg; } catch {}
    onError(msg); return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;
  while (!done) {
    const { done: rd, value } = await reader.read();
    if (rd) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const j = line.slice(6).trim();
      if (j === "[DONE]") { done = true; break; }
      try {
        const p = JSON.parse(j);
        const c = p.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {
        buf = line + "\n" + buf; break;
      }
    }
  }
  onDone();
}
