import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useVerifyCreatorEmail } from "@workspace/api-client-react";
import { PageShell } from "@/components/page-shell";

type Status = "verifying" | "success" | "failed";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<Status>("verifying");
  const verify = useVerifyCreatorEmail();
  // Guard against double-invocation (React Strict Mode / re-renders) so the
  // single-use token is only consumed once.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("failed");
      return;
    }

    verify.mutate(
      { data: { token } },
      {
        onSuccess: (res) => setStatus(res.verified ? "success" : "failed"),
        onError: () => setStatus("failed"),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell
      eyebrow="Email"
      title="Confirm your email"
      description="We're verifying the confirmation link from your email."
    >
      <section className="page-shell mt-10 max-w-xl">
        <div className="surface-card grid gap-4 rounded-[28px] p-6 sm:p-8">
          {status === "verifying" && (
            <div className="flex items-center gap-3 text-white/70">
              <Loader2 className="h-5 w-5 animate-spin" /> Verifying your link…
            </div>
          )}

          {status === "success" && (
            <>
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
                <span className="text-lg font-semibold">Email confirmed</span>
              </div>
              <p className="text-white/70">
                Thanks — your email address is now verified. You can manage it
                anytime from your dashboard.
              </p>
              <Link
                href="/dashboard/profile"
                className="inline-flex w-fit items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-3 font-semibold text-white"
              >
                Go to your profile
              </Link>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="flex items-center gap-2 text-red-300">
                <XCircle className="h-6 w-6" />
                <span className="text-lg font-semibold">
                  This link is invalid or expired
                </span>
              </div>
              <p className="text-white/70">
                Confirmation links expire after 24 hours and can only be used
                once. Head to your profile to send a fresh one.
              </p>
              <Link
                href="/dashboard/profile"
                className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:border-white/30"
              >
                Resend from your profile
              </Link>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
