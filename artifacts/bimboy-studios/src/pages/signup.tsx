import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import {
  Loader2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Twitter,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateCreator,
  useListMyCreators,
  getListMyCreatorsQueryKey,
} from "@workspace/api-client-react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { accountUrlLabel } from "@/lib/links";

type AccountType = "creator" | "fan";

const ONBOARDED_KEY = "bimboy:onboarded";

// Mirror the server's handle rules (lowercase, alphanumeric only) so the live
// "www.bimboy.com/<name>/" preview matches the handle the API will actually mint.
function slugifyHandle(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 30);
}

type TwitterInfo = {
  name: string;
  username: string;
};

// Pull the connected X (Twitter) profile out of Supabase user metadata. The key
// names vary by provider/version, so probe the common ones.
function readTwitterInfo(
  meta: Record<string, unknown>,
): TwitterInfo | null {
  const str = (v: unknown) => (typeof v === "string" && v ? v : "");
  const username =
    str(meta.user_name) || str(meta.preferred_username) || str(meta.nickname);
  const name = str(meta.full_name) || str(meta.name);
  if (!username && !name) return null;
  return { name, username: username.replace(/^@/, "") };
}

export default function SignupPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountTouched, setAccountTouched] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("creator");
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const twitter = useMemo<TwitterInfo | null>(() => {
    if (!user) return null;
    return readTwitterInfo((user.user_metadata ?? {}) as Record<string, unknown>);
  }, [user]);

  // Only creators get a backing record; load the user's existing ones so we can
  // skip straight to the dashboard if they already onboarded as a creator.
  const myCreators = useListMyCreators({
    query: { enabled: !!user, queryKey: getListMyCreatorsQueryKey() },
  });
  const alreadyCreator = (myCreators.data?.length ?? 0) > 0;

  // Prefill the display name from the connected X account, then Supabase
  // metadata (full_name / name), otherwise the local part of the email.
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

  // Default the account name (handle) from the connected X username, falling
  // back to the display name. Stop once the user edits it themselves.
  useEffect(() => {
    if (accountTouched) return;
    const source = twitter?.username || displayName;
    const slug = slugifyHandle(source);
    if (slug) setAccountName(slug);
  }, [twitter, displayName, accountTouched]);

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

  // Kick off X (Twitter) OAuth via Supabase. Returns to /signup, where the
  // connected profile is read from user metadata to prefill the form. Requires
  // the Twitter provider to be enabled in the Supabase project.
  async function connectTwitter() {
    setError(null);
    setConnecting(true);
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}signup`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: { redirectTo },
    });
    if (oauthError) {
      setConnecting(false);
      setError(
        `Couldn't connect X: ${oauthError.message}. Make sure the Twitter provider is enabled in your Supabase project.`,
      );
    }
  }

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
    const handle = slugifyHandle(accountName || name);
    if (!handle) {
      setError("Please enter an account name (letters and numbers).");
      return;
    }
    createCreator.mutate({
      data: {
        displayName: name,
        handle,
        xHandle: twitter?.username || null,
      },
    });
  }

  const inputClass =
    "rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-pink-400/50 placeholder:text-white/30";

  const twitterButton = (label: string) => (
    <button
      type="button"
      onClick={connectTwitter}
      disabled={connecting}
      className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#1d9bf0] px-5 py-3 font-semibold text-white transition hover:bg-[#1a8cd8] disabled:opacity-60"
    >
      {connecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Twitter className="h-4 w-4" />
      )}
      {label}
    </button>
  );

  const accountSlug = slugifyHandle(accountName || displayName);

  const content = useMemo(() => {
    // Wait for auth to resolve before deciding what to show.
    if (authLoading) {
      return (
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      );
    }

    // Not signed in — let them start with X, or fall back to email auth.
    if (!user) {
      return (
        <div className="grid gap-4">
          <p className="text-white/70">
            Connect your X (Twitter) account to start — we'll use it to set up
            your display name and bimboy account name. Or sign in with email.
          </p>
          {twitterButton("Continue with X (Twitter)")}
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
          <button
            onClick={() => navigate("/login")}
            className="inline-flex w-fit items-center gap-2 text-sm text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            Sign in / Create account with email{" "}
            <ArrowRight className="h-4 w-4" />
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
        {twitter ? (
          <div className="flex items-center gap-2 rounded-2xl border border-[#1d9bf0]/40 bg-[#1d9bf0]/10 px-4 py-3 text-sm text-white/80">
            <Twitter className="h-4 w-4 text-[#1d9bf0]" />
            <span>
              Connected as{" "}
              <strong className="text-white">
                {twitter.username ? `@${twitter.username}` : twitter.name}
              </strong>
            </span>
          </div>
        ) : (
          <div className="grid gap-2">
            <p className="text-sm text-white/60">
              Connect X (Twitter) to autofill your name and account name.
            </p>
            {twitterButton("Connect X (Twitter)")}
          </div>
        )}

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

        {accountType === "creator" && (
          <label className="grid gap-2 text-sm text-white/70">
            Account name
            <input
              type="text"
              value={accountName}
              onChange={(e) => {
                setAccountTouched(true);
                setAccountName(e.target.value);
              }}
              placeholder="e.g. lunavega"
              className={inputClass}
            />
            <span className="text-xs text-white/45">
              Your page will be{" "}
              <span className="text-pink-300">
                {accountUrlLabel(accountSlug || "yourname")}
              </span>
            </span>
          </label>
        )}

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
  }, [
    authLoading,
    user,
    twitter,
    alreadyCreator,
    displayName,
    accountName,
    accountSlug,
    accountType,
    error,
    busy,
    connecting,
  ]);

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
