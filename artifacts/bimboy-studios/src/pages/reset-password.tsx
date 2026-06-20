import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { Loader2, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true);
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setHasSession(!!data.session);
      setReady(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-shell flex min-h-screen items-center justify-center pt-16 pb-24">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur">
        <div className="mb-6 text-center">
          <div className="swipe-brand justify-center">
            <span className="swipe-brand-bim">BIM</span>
            <span className="swipe-brand-boy">BOY</span>
          </div>
          <p className="mt-2 text-sm text-white/60">Set a new password</p>
        </div>

        {!ready ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-white/50" />
          </div>
        ) : done ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
            <p className="text-sm text-white/70">
              Your password has been updated.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-400"
            >
              Go to sign in
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : !hasSession ? (
          <div className="space-y-4 text-center">
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              This reset link is invalid or has expired. Request a new one from
              the sign in page.
            </div>
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-400"
            >
              Back to sign in
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs text-white/60">New password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 focus:border-pink-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs text-white/60">Confirm password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 focus:border-pink-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-400 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Update password
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
