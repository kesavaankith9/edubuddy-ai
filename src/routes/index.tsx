import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, useEffect } from "react";
import { GraduationCap, Sparkles, Loader2, BookOpen, BarChart3, MessageSquare } from "lucide-react";
import { login, session } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EduMate — AI-Powered Student Companion" },
      { name: "description", content: "Login to chat with your AI study mentor and track your academic progress." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session.token && session.student) navigate({ to: "/chat" });
    // Reset scroll position to top on mount
    window.scrollTo(0, 0);
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(enrollment, password);
      navigate({ to: "/chat" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: brand panel */}
      <aside className="bg-brand text-primary-foreground lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-[28rem] h-[28rem] rounded-full bg-white/5 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <GraduationCap className="size-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">EduMate</span>
          </div>
        </div>
        <div className="relative space-y-8 my-12">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            Your AI study mentor — <span className="opacity-80">always one question away.</span>
          </h1>
          <p className="text-lg opacity-85 max-w-md">
            Track attendance, decode your marks, and get a personalized plan to improve — all powered by your live SIS data.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 pt-4 max-w-lg">
            {[
              { icon: BarChart3, t: "Attendance insights" },
              { icon: BookOpen, t: "Subject breakdown" },
              { icon: MessageSquare, t: "Smart chat" },
            ].map((f) => (
              <div key={f.t} className="bg-white/10 rounded-xl p-4 backdrop-blur">
                <f.icon className="size-5 mb-2" />
                <div className="text-sm font-medium">{f.t}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-sm opacity-70">© {new Date().getFullYear()} EduMate </div>
      </aside>

      {/* Right: form */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-3">
              <Sparkles className="size-4" /> Student Portal
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Sign in to EduMate</h2>
            <p className="text-muted-foreground mt-2">Use your enrollment number and password.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium block mb-2">Enrollment Number</label>
              <input
                value={enrollment}
                onChange={(e) => setEnrollment(e.target.value)}
                required
                placeholder="e.g. STU001"
                className="w-full px-4 py-3 rounded-lg border bg-card focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border bg-card focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>

            {error && (
              <div className="text-sm rounded-lg bg-destructive/10 text-destructive px-3 py-2 border border-destructive/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-primary-foreground font-semibold py-3 rounded-lg shadow-brand hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-muted border text-sm">
            <div className="font-semibold mb-2">Demo accounts</div>
            <ul className="space-y-1 text-muted-foreground">
              <li><code className="text-foreground">STU001</code> · Aarav (low attendance)</li>
              <li><code className="text-foreground">STU002</code> · Diya (good standing)</li>
              <li><code className="text-foreground">STU003</code> · Rohan (ECE)</li>
              <li><code className="text-foreground">STU004</code> · Sneha (1st year)</li>
            </ul>
            <div className="mt-2">Password for all: <code className="text-foreground">student123</code></div>
          </div>
        </div>
      </main>
    </div>
  );
}
