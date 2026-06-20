import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  useGetCreatorVerification,
  useCreateCreatorVerificationSession,
  getGetCreatorVerificationQueryKey,
  type VerificationStatusStatus,
} from "@workspace/api-client-react";

// Where Didit returns the browser after the hosted flow. Uses the app's own
// origin + base path so it lands correctly in dev (root) and prod (/bimboy-studios/).
function returnCallbackUrl(): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}dashboard/profile?verify=return`;
}

type Props = {
  handle: string;
  /** Status already known from the creator record, used until the dedicated
   *  owner-only status query resolves. */
  initialStatus?: VerificationStatusStatus;
};

export function VerificationBanner({ handle, initialStatus }: Props) {
  const queryClient = useQueryClient();

  const verification = useGetCreatorVerification(handle, {
    query: {
      enabled: !!handle,
      queryKey: getGetCreatorVerificationQueryKey(handle),
      retry: false,
    },
  });

  const status: VerificationStatusStatus =
    verification.data?.status ?? initialStatus ?? "not_started";

  // Coming back from the Didit flow: refetch the authoritative status.
  useEffect(() => {
    if (!handle) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("verify") === "return") {
      queryClient.invalidateQueries({
        queryKey: getGetCreatorVerificationQueryKey(handle),
      });
    }
  }, [handle, queryClient]);

  const startSession = useCreateCreatorVerificationSession({
    mutation: {
      onSuccess: (data) => {
        window.location.href = data.url;
      },
    },
  });

  const begin = () => {
    if (!handle) return;
    startSession.mutate({
      handle,
      data: { callbackUrl: returnCallbackUrl() },
    });
  };

  // Verified — show a compact confirmation.
  if (status === "approved") {
    return (
      <div className="flex items-center gap-3 rounded-[28px] border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 text-emerald-200">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        <p className="text-sm">
          <span className="font-semibold text-emerald-100">
            Identity verified.
          </span>{" "}
          You can publish drops and go live.
        </p>
      </div>
    );
  }

  // Pending / in review — waiting on Didit's signed result.
  if (status === "pending" || status === "in_review") {
    return (
      <div className="rounded-[28px] border border-amber-400/30 bg-amber-500/10 px-5 py-4">
        <div className="flex items-center gap-3 text-amber-100">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
          <p className="text-sm font-semibold">
            {status === "in_review"
              ? "Your identity check is under review"
              : "Identity verification in progress"}
          </p>
        </div>
        <p className="mt-2 text-sm leading-6 text-amber-100/80">
          We'll unlock publishing automatically once your verification is
          approved. This can take a few minutes.
        </p>
        <button
          type="button"
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: getGetCreatorVerificationQueryKey(handle),
            })
          }
          disabled={verification.isFetching}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-amber-400/30 px-4 py-2 text-sm text-amber-100 transition hover:border-amber-300/60 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${verification.isFetching ? "animate-spin" : ""}`}
          />
          Check status
        </button>
      </div>
    );
  }

  // not_started or declined — prompt the creator to verify.
  const declined = status === "declined";
  return (
    <div
      className={`rounded-[28px] border px-5 py-5 ${
        declined
          ? "border-rose-400/40 bg-rose-500/10"
          : "border-pink-400/40 bg-pink-500/10"
      }`}
    >
      <div className="flex items-start gap-3">
        {declined ? (
          <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-rose-300" />
        ) : (
          <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-pink-300" />
        )}
        <div className="flex-1">
          <p className="text-lg font-semibold text-white">
            {declined
              ? "Identity verification didn't pass"
              : "Verify your identity to go live"}
          </p>
          <p className="mt-1 text-sm leading-6 text-white/70">
            {declined
              ? "Your last verification was declined. Re-run the secure ID + selfie check to unlock publishing."
              : "Before you can publish drops or go live, confirm your identity and age with a quick, secure ID + selfie check."}
          </p>
          {startSession.isError ? (
            <p className="mt-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
              {(startSession.error as Error).message ||
                "Couldn't start verification. Please try again."}
            </p>
          ) : null}
          <button
            type="button"
            onClick={begin}
            disabled={startSession.isPending}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {startSession.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BadgeCheck className="h-4 w-4" />
            )}
            {declined ? "Retry verification" : "Verify my identity"}
          </button>
        </div>
      </div>
    </div>
  );
}
