import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, MailWarning, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  getGetCreatorQueryKey,
  getGetCreatorCollabQueryKey,
  getGetCreatorEmailQueryKey,
  useGetCreator,
  useGetCreatorCollab,
  useGetCreatorEmail,
  useRefreshCreatorFollowers,
  useSetCreatorEmail,
  useUpdateCreatorProfile,
  type PlatformLink,
} from "@workspace/api-client-react";
import { useDashboardCreators } from "@/hooks/use-dashboard-creators";
import { accountUrl, accountUrlLabel } from "@/lib/links";

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function DashboardProfilePage() {
  const queryClient = useQueryClient();
  const {
    creators,
    isLoading: creatorsLoading,
    isClaimMode,
  } = useDashboardCreators();
  const [handle, setHandle] = useState<string>("");

  useEffect(() => {
    if (!handle && creators.length > 0) {
      setHandle(creators[0].handle);
    }
  }, [creators, handle]);

  const { data: creator } = useGetCreator(handle, {
    query: { enabled: !!handle, queryKey: getGetCreatorQueryKey(handle) },
  });
  const { data: collab } = useGetCreatorCollab(handle, {
    query: {
      enabled: !!handle,
      queryKey: getGetCreatorCollabQueryKey(handle),
      retry: false,
    },
  });
  const { data: emailStatus } = useGetCreatorEmail(handle, {
    query: {
      enabled: !!handle,
      queryKey: getGetCreatorEmailQueryKey(handle),
      retry: false,
    },
  });

  const [copied, setCopied] = useState(false);
  const copyAccountUrl = async () => {
    if (!handle) return;
    try {
      await navigator.clipboard.writeText(accountUrl(handle));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const [links, setLinks] = useState<PlatformLink[]>([]);
  const [xHandle, setXHandle] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [collabFastUrl, setCollabFastUrl] = useState("");
  const [testingVerified, setTestingVerified] = useState(false);
  const [lastTestedAt, setLastTestedAt] = useState("");
  const [email, setEmail] = useState("");
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (!creator) return;
    setLinks(creator.platformLinks ?? []);
    setXHandle(creator.xHandle ?? "");
    setFollowerCount(
      creator.followerCount != null ? String(creator.followerCount) : "",
    );
    setTestingVerified(creator.testingVerified);
    setLastTestedAt(toDateInput(creator.lastTestedAt));
  }, [creator]);

  useEffect(() => {
    setEmail(emailStatus?.email ?? "");
    setEmailNotice(null);
    setEmailError(null);
  }, [emailStatus]);

  useEffect(() => {
    setCollabFastUrl(collab?.collabFastUrl ?? "");
  }, [collab]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetCreatorQueryKey(handle) });
    queryClient.invalidateQueries({
      queryKey: getGetCreatorCollabQueryKey(handle),
    });
    queryClient.invalidateQueries({
      queryKey: getGetCreatorEmailQueryKey(handle),
    });
  };

  const updateProfile = useUpdateCreatorProfile({
    mutation: { onSuccess: invalidate },
  });

  const setCreatorEmail = useSetCreatorEmail({
    mutation: {
      onSuccess: () => {
        setEmailError(null);
        setEmailNotice(
          "Confirmation link sent. Check your inbox to verify this email.",
        );
        invalidate();
      },
      onError: (err) => {
        setEmailNotice(null);
        setEmailError((err as Error).message);
      },
    },
  });

  const onSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle) return;
    const trimmed = email.trim();
    setEmailNotice(null);
    setEmailError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setCreatorEmail.mutate({
      handle,
      data: {
        email: trimmed,
        appUrl: `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}`,
      },
    });
  };
  const refreshFollowers = useRefreshCreatorFollowers({
    mutation: {
      onSuccess: (updated) => {
        setFollowerCount(
          updated.followerCount != null ? String(updated.followerCount) : "",
        );
        invalidate();
      },
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle) return;
    const cleanedLinks = links
      .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
      .filter((l) => l.label && l.url);
    const trimmedCount = followerCount.trim();
    updateProfile.mutate({
      handle,
      data: {
        platformLinks: cleanedLinks,
        xHandle: xHandle.trim() || null,
        followerCount: trimmedCount === "" ? null : Number(trimmedCount),
        collabFastUrl: collabFastUrl.trim() || null,
        testingVerified,
        lastTestedAt: lastTestedAt
          ? new Date(`${lastTestedAt}T00:00:00Z`).toISOString()
          : null,
      },
    });
  };

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none transition focus:border-pink-400/40";

  return (
    <div className="grid gap-6">
      <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
              Profile
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
              Links, reach & testing status
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
              Manage external platform links, X follower count, health & STI
              testing status, and the CollabFast link shown to other creators.
            </p>
            {handle && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-[0.18em] text-white/40">
                  Your page
                </span>
                <a
                  href={accountUrl(handle)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-full border border-pink-400/30 bg-pink-500/10 px-4 py-1.5 text-sm font-medium text-pink-200 transition hover:border-pink-400/60"
                >
                  {accountUrlLabel(handle)}
                </a>
                <button
                  type="button"
                  onClick={copyAccountUrl}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            )}
          </div>
          <label className="flex flex-col gap-1.5 text-xs uppercase tracking-[0.18em] text-white/45">
            {isClaimMode ? "Claim a profile" : "Your profile"}
            <select
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              disabled={creatorsLoading}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-medium normal-case tracking-normal text-white outline-none transition focus:border-pink-400/40"
            >
              {creators.map((c) => (
                <option key={c.id} value={c.handle}>
                  {c.displayName} (@{c.handle})
                </option>
              ))}
            </select>
            {isClaimMode ? (
              <span className="max-w-[260px] text-[11px] normal-case tracking-normal text-white/45">
                Saving links this profile to your account — afterwards only you
                can edit it.
              </span>
            ) : null}
          </label>
        </div>
      </section>

      <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-semibold text-white">Contact email</p>
          {emailStatus?.email ? (
            emailStatus.emailVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
                <MailWarning className="h-3.5 w-3.5" /> Unverified
              </span>
            )
          ) : null}
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-white/55">
          Used for payouts and account recovery. We'll email a confirmation link
          whenever you set or change it.
        </p>
        <form
          onSubmit={onSubmitEmail}
          className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`${inputClass} sm:max-w-md`}
          />
          <button
            type="submit"
            disabled={!handle || setCreatorEmail.isPending}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
          >
            {setCreatorEmail.isPending
              ? "Sending…"
              : emailStatus?.email
                ? "Update & resend"
                : "Save & send link"}
          </button>
        </form>
        {emailNotice && (
          <p className="mt-3 text-sm text-emerald-300">{emailNotice}</p>
        )}
        {emailError && (
          <p className="mt-3 text-sm text-red-300">{emailError}</p>
        )}
        {emailStatus?.email && !emailStatus.emailVerified && !emailNotice && (
          <p className="mt-3 text-xs text-white/45">
            We sent a confirmation link to {emailStatus.email}. Didn't get it?
            Update &amp; resend above.
          </p>
        )}
      </section>

      <form onSubmit={onSubmit} className="grid gap-6">
        <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-white">Platform links</p>
            <button
              type="button"
              onClick={() => setLinks((l) => [...l, { label: "", url: "" }])}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/25"
            >
              <Plus className="h-4 w-4" /> Add link
            </button>
          </div>
          {links.length === 0 ? (
            <p className="mt-4 text-sm text-white/50">
              No links yet. Add OnlyFans, Fansly, Linktree, etc.
            </p>
          ) : (
            <div className="mt-5 grid gap-3">
              {links.map((link, i) => (
                <div key={i} className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={link.label}
                    onChange={(e) =>
                      setLinks((l) =>
                        l.map((x, j) =>
                          j === i ? { ...x, label: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="Label (e.g. OnlyFans)"
                    className={`${inputClass} sm:max-w-[220px]`}
                  />
                  <input
                    value={link.url}
                    onChange={(e) =>
                      setLinks((l) =>
                        l.map((x, j) =>
                          j === i ? { ...x, url: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="https://…"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setLinks((l) => l.filter((_, j) => j !== i))
                    }
                    aria-label="Remove link"
                    className="shrink-0 rounded-2xl border border-white/10 px-3 py-2.5 text-white/60 transition hover:border-rose-400/40 hover:text-rose-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
          <p className="text-lg font-semibold text-white">X / Twitter reach</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm text-white/70">
              X handle
              <input
                value={xHandle}
                onChange={(e) => setXHandle(e.target.value)}
                placeholder="username (without @)"
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5 text-sm text-white/70">
              Follower count
              <div className="flex gap-2">
                <input
                  value={followerCount}
                  onChange={(e) => setFollowerCount(e.target.value)}
                  inputMode="numeric"
                  placeholder="Manual or fetched"
                  className={inputClass}
                />
                <button
                  type="button"
                  disabled={
                    !xHandle.trim() || refreshFollowers.isPending
                  }
                  onClick={() => refreshFollowers.mutate({ handle })}
                  title="Fetch live count from X (requires X API token)"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-white/10 px-3 py-2.5 text-sm text-white/80 transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshFollowers.isPending ? "animate-spin" : ""}`}
                  />
                  Fetch
                </button>
              </div>
            </label>
          </div>
          {refreshFollowers.isError ? (
            <p className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Could not fetch from X — enter the follower count manually and
              save.
            </p>
          ) : null}
        </section>

        <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
          <p className="text-lg font-semibold text-white">Health & safety</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={testingVerified}
                onChange={(e) => setTestingVerified(e.target.checked)}
                className="h-5 w-5 rounded border-white/20 bg-black/40 accent-pink-500"
              />
              Health & STI testing verified
            </label>
            <label className="grid gap-1.5 text-sm text-white/70">
              Last tested date
              <input
                type="date"
                value={lastTestedAt}
                onChange={(e) => setLastTestedAt(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
          <p className="text-lg font-semibold text-white">CollabFast link</p>
          <p className="mt-1 text-sm text-white/55">
            Shown only to verified creators/pornstars viewing your profile.
          </p>
          <input
            value={collabFastUrl}
            onChange={(e) => setCollabFastUrl(e.target.value)}
            placeholder="https://collabfast.com/…"
            className={`${inputClass} mt-4`}
          />
        </section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={!handle || updateProfile.isPending}
            className="rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {updateProfile.isPending ? "Saving…" : "Save profile"}
          </button>
          {updateProfile.isSuccess ? (
            <span className="text-sm text-emerald-300">Saved.</span>
          ) : null}
          {updateProfile.isError ? (
            <span className="text-sm text-rose-300">
              Could not save. Check the fields and try again.
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
