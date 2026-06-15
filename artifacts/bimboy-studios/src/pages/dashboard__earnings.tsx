import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetCreatorEarningsQueryKey,
  getListCreatorPayoutsQueryKey,
  useGetCreatorEarnings,
  useListCreatorPayouts,
  useListCreators,
  useRequestCreatorPayout,
} from "@workspace/api-client-react";
import { formatCents } from "@/lib/dashboard";
import {
  AuthRequiredBlock,
  EmptyBlock,
  ErrorBlock,
  isUnauthorized,
  LoadingBlock,
} from "@/components/dashboard/state-block";

function payoutStatusLabel(status: string): string {
  if (status === "pending") return "Pending — awaiting processor";
  if (status === "paid") return "Paid";
  if (status === "failed") return "Failed";
  return status;
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[28px] border p-5 ${
        accent
          ? "border-pink-400/30 bg-pink-500/10"
          : "border-white/8 bg-black/28"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.22em] text-white/42">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default function DashboardEarningsPage() {
  const queryClient = useQueryClient();
  const { data: creators, isLoading: creatorsLoading } = useListCreators();
  const [handle, setHandle] = useState<string>("");

  useEffect(() => {
    if (!handle && creators && creators.length > 0) {
      setHandle(creators[0].handle);
    }
  }, [creators, handle]);

  const {
    data: earnings,
    isLoading: earningsLoading,
    isError: earningsError,
    error: earningsErr,
  } = useGetCreatorEarnings(handle, {
    query: {
      enabled: !!handle,
      retry: false,
      queryKey: getGetCreatorEarningsQueryKey(handle),
    },
  });
  const { data: payouts } = useListCreatorPayouts(handle, {
    query: {
      enabled: !!handle,
      retry: false,
      queryKey: getListCreatorPayoutsQueryKey(handle),
    },
  });

  const requestPayout = useRequestCreatorPayout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetCreatorEarningsQueryKey(handle),
        });
        queryClient.invalidateQueries({
          queryKey: getListCreatorPayoutsQueryKey(handle),
        });
      },
    },
  });

  const available = earnings?.availableCents ?? 0;

  return (
    <div className="grid gap-6">
      <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
              Earnings
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
              Balance & payout history
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
              Net earnings after the platform split, available balance, and
              payout requests.
            </p>
          </div>
          <label className="flex flex-col gap-1.5 text-xs uppercase tracking-[0.18em] text-white/45">
            Creator
            <select
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              disabled={creatorsLoading}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-medium normal-case tracking-normal text-white outline-none transition focus:border-pink-400/40"
            >
              {(creators ?? []).map((c) => (
                <option key={c.id} value={c.handle}>
                  {c.displayName} (@{c.handle})
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {earningsLoading || !handle ? (
        <LoadingBlock label="Loading earnings…" />
      ) : earningsError ? (
        isUnauthorized(earningsErr) ? (
          <AuthRequiredBlock />
        ) : (
          <ErrorBlock description="Could not load earnings for this creator." />
        )
      ) : earnings ? (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total earned"
              value={formatCents(earnings.totalEarnedCents)}
            />
            <SummaryCard
              label="Paid out"
              value={formatCents(earnings.paidOutCents)}
            />
            <SummaryCard
              label="Available"
              value={formatCents(earnings.availableCents)}
              accent
            />
          </section>

          <section className="surface-card rounded-[32px] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-white">
                  Request a payout
                </p>
                <p className="mt-1 text-sm text-white/55">
                  Pays out the full available balance of{" "}
                  {formatCents(available)}. Payouts are queued as pending until a
                  payment processor is connected.
                </p>
              </div>
              <button
                type="button"
                disabled={available <= 0 || requestPayout.isPending}
                onClick={() => requestPayout.mutate({ handle, data: {} })}
                className="shrink-0 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {requestPayout.isPending ? "Requesting…" : "Request payout"}
              </button>
            </div>
            {requestPayout.isSuccess ? (
              <p className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Payout requested — pending, awaiting processor.
              </p>
            ) : null}
            {requestPayout.isError ? (
              <p className="mt-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                Could not request a payout. Please try again.
              </p>
            ) : null}
          </section>

          <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
            <p className="text-xs uppercase tracking-[0.22em] text-white/42">
              Earnings by post
            </p>
            {earnings.byVideo.length === 0 ? (
              <p className="mt-4 text-sm text-white/50">No earnings yet.</p>
            ) : (
              <div className="mt-5 grid gap-3">
                {earnings.byVideo.map((row) => (
                  <div
                    key={row.videoId}
                    className="flex items-center justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white/90">
                        {row.title}
                      </p>
                      <p className="text-xs text-white/45">
                        {row.postType === "studio"
                          ? "Studio exclusive"
                          : "Creator post"}{" "}
                        · {row.purchases} sales
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-white">
                      {formatCents(row.amountCents)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
            <p className="text-xs uppercase tracking-[0.22em] text-white/42">
              Payout history
            </p>
            {!payouts || payouts.length === 0 ? (
              <p className="mt-4 text-sm text-white/50">
                No payouts requested yet.
              </p>
            ) : (
              <div className="mt-5 grid gap-3">
                {payouts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {formatCents(p.amountCents)}
                      </p>
                      <p className="text-xs text-white/45">
                        {new Date(p.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-100">
                      {payoutStatusLabel(p.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <EmptyBlock title="No earnings data" />
      )}
    </div>
  );
}
