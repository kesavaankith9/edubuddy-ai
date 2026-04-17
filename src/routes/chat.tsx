import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { GraduationCap, LogOut, Send, Loader2, Sparkles, BookOpen, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { fetchStudentData, session, streamChat, type ChatMessage, type Subject, type Mark, type Student } from "@/lib/api";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "EduMate Chat — Your AI Study Mentor" },
      { name: "description", content: "Ask your AI mentor anything about your attendance, marks, and studies." },
    ],
  }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "What's my attendance for this semester?",
  "Which subject am I doing worst in?",
  "How can I improve my attendance?",
  "Show my marks summary.",
];

function ChatPage() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [err, setErr] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session.token) { navigate({ to: "/" }); return; }
    fetchStudentData()
      .then((d) => { setStudent(d.student); setSubjects(d.subjects); setMarks(d.marks); })
      .catch(() => { session.clear(); navigate({ to: "/" }); });
  }, [navigate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  function logout() { session.clear(); navigate({ to: "/" }); }

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    setErr("");
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setStreaming(true);

    let acc = "";
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    await streamChat({
      messages: next,
      onDelta: (c) => {
        acc += c;
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      },
      onDone: () => setStreaming(false),
      onError: (msg) => {
        setErr(msg); setStreaming(false);
        setMessages((m) => m.slice(0, -1));
      },
    });
  }

  function onSubmit(e: FormEvent) { e.preventDefault(); send(input); }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const overallAttended = subjects.reduce((a, s) => a + s.attended_sessions, 0);
  const overallTotal = subjects.reduce((a, s) => a + s.total_sessions, 0);
  const overallPct = overallTotal ? (overallAttended / overallTotal) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-80 lg:min-h-screen border-b lg:border-b-0 lg:border-r bg-card">
        <div className="p-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-brand flex items-center justify-center text-primary-foreground">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <div className="font-bold leading-tight">EduMate</div>
              <div className="text-xs text-muted-foreground">AI Study Mentor</div>
            </div>
          </div>
          <button onClick={logout} title="Logout"
            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition">
            <LogOut className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl p-4 bg-brand text-primary-foreground shadow-brand">
            <div className="text-xs opacity-80">Welcome,</div>
            <div className="font-bold text-lg">{student.name}</div>
            <div className="text-sm opacity-90">{student.enrollment_no} · {student.branch} · Sem {student.semester}</div>
          </div>

          <div className="rounded-xl p-4 border bg-background">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium flex items-center gap-1.5">
                <TrendingUp className="size-4 text-primary" /> Overall Attendance
              </div>
              <div className={`text-sm font-bold ${overallPct >= 75 ? "text-success" : "text-destructive"}`}>
                {overallPct.toFixed(1)}%
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={overallPct >= 75 ? "h-full bg-success" : "h-full bg-destructive"}
                style={{ width: `${Math.min(100, overallPct)}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {overallAttended} / {overallTotal} sessions attended
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
              <BookOpen className="size-3.5" /> Subjects
            </div>
            <div className="space-y-2">
              {subjects.map((s) => {
                const pct = (s.attended_sessions / s.total_sessions) * 100;
                const ok = pct >= 75;
                return (
                  <div key={s.id} className="rounded-lg p-3 border bg-background">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.code}</div>
                      </div>
                      <span className={`text-xs font-semibold inline-flex items-center gap-1 ${ok ? "text-success" : "text-destructive"}`}>
                        {ok ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                      <div className={ok ? "h-full bg-success" : "h-full bg-destructive"} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="p-4 border-b bg-card/50 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <div>
              <div className="font-semibold">Chat with EduMate</div>
              <div className="text-xs text-muted-foreground">Ask about your attendance, marks, or how to improve.</div>
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4">
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="size-16 rounded-2xl bg-brand mx-auto flex items-center justify-center mb-5 shadow-brand">
                <Sparkles className="size-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Hi {student.name.split(" ")[0]} 👋</h3>
              <p className="text-muted-foreground mb-8">Try one of these to get started:</p>
              <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className="text-left p-4 rounded-xl border bg-card hover:border-primary hover:shadow-card transition group">
                    <span className="text-sm font-medium group-hover:text-primary">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="size-8 rounded-lg bg-brand flex-shrink-0 flex items-center justify-center text-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-brand text-primary-foreground rounded-br-sm shadow-brand"
                  : "bg-card border rounded-bl-sm shadow-card"
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {m.content || (streaming && i === messages.length - 1 ? <span className="inline-flex gap-1"><span className="size-1.5 bg-primary rounded-full animate-bounce" /><span className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:120ms]" /><span className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:240ms]" /></span> : null)}
                </div>
              </div>
            </div>
          ))}

          {err && (
            <div className="max-w-2xl mx-auto text-sm rounded-lg bg-destructive/10 text-destructive px-3 py-2 border border-destructive/20">
              {err}
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="p-4 border-t bg-card/50 backdrop-blur">
          <div className="max-w-3xl mx-auto flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your attendance, marks, or anything academic…"
              disabled={streaming}
              className="flex-1 px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-60"
            />
            <button type="submit" disabled={streaming || !input.trim()}
              className="bg-brand text-primary-foreground font-medium px-5 rounded-xl shadow-brand hover:opacity-95 active:scale-[0.98] transition disabled:opacity-60 inline-flex items-center gap-2">
              {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
