import { useMemo, useState } from "react";
import {
  useListSceneApplications,
  useUpdateSceneApplicationStatus,
  getListSceneApplicationsQueryKey,
  type SceneApplicationAdmin,
  type SceneApplicationStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SCENE_BRAND_LABELS } from "@/lib/scene-brands";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-400/15 text-amber-200 border-amber-300/30",
  approved: "bg-emerald-400/15 text-emerald-200 border-emerald-300/30",
  declined: "bg-rose-400/15 text-rose-200 border-rose-300/30",
};

const FILTERS: { key: "all" | SceneApplicationStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "declined", label: "Declined" },
];

export default function AdminSceneApplicationsPage() {
  const { data, isLoading, error } = useListSceneApplications({
    query: { queryKey: getListSceneApplicationsQueryKey(), retry: false },
  });
  const [filter, setFilter] = useState<"all" | SceneApplicationStatus>("all");

  const apps = useMemo<SceneApplicationAdmin[]>(() => data ?? [], [data]);
  const filtered = useMemo(
    () => (filter === "all" ? apps : apps.filter((a) => a.status === filter)),
    [apps, filter],
  );

  const forbidden =
    (error as { status?: number } | null)?.status === 403;

  return (
    <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
      <h1 className="text-3xl font-bold text-white">Scene Applications</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-white/64">
        Review and respond to creators applying to perform for BackPackBoys and
        BimBoys &amp; Bad Bitches.
      </p>

      {forbidden ? (
        <div className="mt-6 rounded-2xl border border-rose-300/30 bg-rose-400/10 px-5 py-4 text-sm leading-7 text-rose-100">
          You don't have admin access. Your account email must be on the
          <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5">
            ADMIN_EMAILS
          </code>
          allowlist to view applications.
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-rose-300/30 bg-rose-400/10 px-5 py-4 text-sm text-rose-100">
          Failed to load applications.
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              const count =
                f.key === "all"
                  ? apps.length
                  : apps.filter((a) => a.status === f.key).length;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-white/12 text-white"
                      : "text-white/60 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  {f.label} ({count})
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <p className="mt-8 text-sm text-white/55">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="mt-8 text-sm text-white/55">
              No applications {filter === "all" ? "yet" : `with status "${filter}"`}.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {filtered.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ApplicationCard({ app }: { app: SceneApplicationAdmin }) {
  const qc = useQueryClient();
  const mutation = useUpdateSceneApplicationStatus();

  async function setStatus(status: SceneApplicationStatus) {
    await mutation.mutateAsync({ id: app.id, data: { status } });
    await qc.invalidateQueries({ queryKey: getListSceneApplicationsQueryKey() });
  }

  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {app.avatarUrl ? (
            <img
              src={app.avatarUrl}
              alt=""
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : null}
          <div>
            <p className="font-semibold text-white">{app.displayName}</p>
            <p className="text-xs text-white/55">@{app.handle}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
            STATUS_STYLES[app.status] ?? "border-white/20 text-white/70"
          }`}
        >
          {app.status}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Field label="Brand" value={SCENE_BRAND_LABELS[app.brand]} />
        <Field
          label="Contact email"
          value={
            app.contactEmail
              ? `${app.contactEmail}${app.contactEmailVerified ? " ✓" : " (unverified)"}`
              : "—"
          }
        />
        <Field
          label="X / followers"
          value={
            app.xHandle
              ? `@${app.xHandle}${app.followerCount != null ? ` · ${app.followerCount.toLocaleString()}` : ""}`
              : "—"
          }
        />
      </div>

      {app.experience ? (
        <Block label="Experience" text={app.experience} />
      ) : null}
      {app.message ? <Block label="Message" text={app.message} /> : null}

      <p className="mt-4 text-xs text-white/45">
        Applied {new Date(app.createdAt).toLocaleString()}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={mutation.isPending || app.status === "approved"}
          onClick={() => setStatus("approved")}
          className="rounded-full bg-emerald-500/90 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-40"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={mutation.isPending || app.status === "declined"}
          onClick={() => setStatus("declined")}
          className="rounded-full bg-rose-500/90 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-40"
        >
          Decline
        </button>
        {app.status !== "pending" ? (
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => setStatus("pending")}
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 disabled:opacity-40"
          >
            Reset to pending
          </button>
        ) : null}
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-0.5 text-white/85">{value}</p>
    </div>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-white/75">
        {text}
      </p>
    </div>
  );
}
