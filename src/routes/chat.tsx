import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { GraduationCap, LogOut, Send, Loader2, Sparkles, BookOpen, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { fetchStudentData, session, streamChat, type ChatMessage, type Subject, type Mark, type Student } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

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
    // Auto-scroll to bottom when new messages arrive
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const isNearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 100;
      if (isNearBottom || messages.length === 0) {
        setTimeout(() => {
          scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: "smooth" });
        }, 100);
      }
    }
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
    let assistantIndex = next.length;
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    // Use a ref to avoid stale closures and batch updates
    let updateTimer: NodeJS.Timeout | null = null;
    
    await streamChat({
      messages: next,
      onDelta: (c) => {
        acc += c;
        // Batch updates to reduce re-renders
        if (updateTimer) clearTimeout(updateTimer);
        updateTimer = setTimeout(() => {
          setMessages((m) => {
            const copy = [...m];
            if (copy[assistantIndex]) {
              copy[assistantIndex] = { role: "assistant", content: acc };
            }
            return copy;
          });
        }, 50); // ~20fps update rate for better performance
      },
      onDone: () => {
        if (updateTimer) clearTimeout(updateTimer);
        setMessages((m) => {
          const copy = [...m];
          if (copy[assistantIndex]) {
            copy[assistantIndex] = { role: "assistant", content: acc };
          }
          return copy;
        });
        setStreaming(false);
      },
      onError: (msg) => {
        if (updateTimer) clearTimeout(updateTimer);
        setErr(msg); 
        setStreaming(false);
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
    <div className="h-screen flex lg:flex-row">
      {/* Sidebar - Static Header, Scrollable Content */}
      <aside className="w-full lg:w-80 lg:h-screen border-b lg:border-b-0 lg:border-r bg-card flex flex-col flex-shrink-0">
        {/* Static Header */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0 min-h-[72px]">
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

        {/* Scrollable Content - starts from Welcome section */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-20 lg:pb-5">
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

      {/* Chat area - Static Header, Scrollable Content */}
      <main className="flex-1 flex flex-col h-screen lg:h-auto overflow-hidden">
        {/* Static Header */}
        <header className="p-4 border-b bg-card/50 backdrop-blur flex-shrink-0 min-h-[72px]">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <div>
              <div className="font-semibold">Chat with EduMate</div>
              <div className="text-xs text-muted-foreground">Ask about your attendance, marks, or how to improve.</div>
            </div>
          </div>
        </header>

        {/* Chat messages - Scrollable - starts from Hi Aarav section */}
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
                <div className="text-sm leading-relaxed markdown-content">
                  {m.content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="pl-1">{children}</li>,
                        code: ({ node, inline, className, children, ...props }: any) => 
                          inline ? 
                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code> :
                            <code className="block bg-muted p-3 rounded-md text-sm font-mono overflow-x-auto mb-2">{children}</code>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-2 bg-muted/50 rounded-r-md">{children}</blockquote>,
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    streaming && i === messages.length - 1 && (
                      <span className="inline-flex gap-1">
                        <span className="size-1.5 bg-primary rounded-full animate-bounce" />
                        <span className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:120ms]" />
                        <span className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:240ms]" />
                      </span>
                    )
                  )}
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

        {/* Input form - Static at bottom */}
        <div className="flex-shrink-0">
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

          {/* Footer */}
          <footer className="border-t bg-background/95 backdrop-blur">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex flex-col items-center gap-4">
                {/* Copyright */}
                <div className="text-sm text-muted-foreground text-center">
                  © {new Date().getFullYear()} EduMate. All rights reserved.
                </div>

                {/* Links and Social */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                  <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                  <div className="flex items-center gap-4 border-l pl-6">
                    <a href="mailto:contact@edumate.com" className="text-muted-foreground hover:text-foreground transition-colors" title="Email">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                    </a>
                    <a href="https://linkedin.com/company/edumate" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="LinkedIn">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                    <a href="https://instagram.com/edumate" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="Instagram">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
