import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { Loader2, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateCreator,
  useListMyCreators,
  getListMyCreatorsQueryKey,
} from "@workspace/api-client-react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth";

type AccountType = "creator" | "fan";

const ONBOARDED_KEY = "bimboy:onboarded";

export default function SignupPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("creator");
  const [error, setError] = useState<string | null>(null);

  // Only creators get a backing record; load the user's existing ones so we can
  // skip straight to the dashboard if they already onboarded as a creator.
  const myCreators = useListMyCreators({
    query: { enabled: !!user, queryKey: getListMyCreatorsQueryKey() },
  });
  const alreadyCreator = (myCreators.data?.length ?? 0) > 0;

  // Prefill the display name from whatever Supabase has (full_name / name
  // metadata, otherwise the local part of the email).
  useEffect(() => {
    if (!user || displayName) return;
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const fromMeta =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      "";
    const fromEmail = user.email ? user.email.split("@")[0] : "";
    const next = fromMeta || fromEmail;
    if (next) setDisplayName(next);
  }, [user, displayName]);

  const createCreator = useCreateCreator({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListMyCreatorsQueryKey(),
        });
        try {
          localStorage.setItem(ONBOARDED_KEY, "creator");
        } catch {
          /* ignore storage failures (private mode) */
        }
        navigate("/dashboard/profile");
      },
      onError: (err) => setError((err as Error).message),
    },
  });

  const busy = createCreator.isPending;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user) {
      navigate("/login");
      return;
    }

    if (accountType === "fan") {
      try {
        localStorage.setItem(ONBOARDED_KEY, "fan");
      } catch {
        /* ignore */
      }
      navigate("/feed");
      return;
    }

    const name = displayName.trim();
    if (!name) {
      setError("Please enter a display name.");
      return;
    }
    createCreator.mutate({ data: { displayName: name } });
  }

  const inputClass =
    "rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-pink-400/50 placeholder:text-white/30";

  const content = useMemo(() => {
    // Wait for auth to resolve before deciding what to show.
    if (authLoading) {
      return (
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      );
    }

    // Not signed in — onboarding attaches to an account, so send them to auth.
    if (!user) {
      return (
        <div className="grid gap-4">
          <p className="text-white/70">
            Create an account or sign in first, then finish setting up your
            profile here.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-3 font-semibold text-white"
          >
            Sign in / Create account <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      );
    }

    // Already a creator — nothing to onboard, jump to the dashboard.
    if (alreadyCreator) {
      return (
        <div className="grid gap-4">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">You're all set up.</span>
          </div>
          <p className="text-white/70">
            Your creator profile is ready. Head to your dashboard to manage
            drops, links, and earnings.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-3 font-semibold text-white"
          >
            Go to dashboard <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={onSubmit} className="grid gap-5">
        <label className="grid gap-2 text-sm text-white/70">
          Display name
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Luna Vega"
            className={inputClass}
            disabled={accountType === "fan"}
          />
        </label>

        <label className="grid gap-2 text-sm text-white/70">
          Email address
          <input
            type="email"
            value={user.email ?? ""}
            readOnly
            className={`${inputClass} cursor-not-allowed opacity-70`}
          />
        </label>

        <div className="grid gap-2 text-sm text-white/70">
          Account type
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  key: "creator" as const,
                  title: "Creator",
                  blurb: "Publish drops, set prices, and earn.",
                },
                {
                  key: "fan" as const,
                  title: "Fan",
                  blurb: "Browse and unlock exclusive content.",
                },
              ]
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setAccountType(opt.key)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  accountType === opt.key
                    ? "border-pink-400/60 bg-pink-500/10"
                    : "border-white/10 bg-black/30 hover:border-white/25"
                }`}
              >
                <span className="block font-semibold text-white">
                  {opt.title}
                </span>
                <span className="mt-1 block text-xs text-white/55">
                  {opt.blurb}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-1 inline-flex w-fit items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-3 font-semibold text-white transition disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {accountType === "creator" ? "Create my profile" : "Start browsing"}
        </button>
      </form>
    );
  }, [authLoading, user, alreadyCreator, displayName, accountType, error, busy]);

  return (
    <PageShell
      eyebrow="Signup"
      title="Finish onboarding"
      description="Set up your account to start sharing drops or unlocking exclusive content."
    >
      <section className="page-shell mt-10 max-w-2xl">
        <div className="surface-card rounded-[28px] p-6 sm:p-8">{content}</div>
      </section>
    </PageShell>
  );
}
