import Link from "next/link";
import { creatorVideos } from "@/lib/placeholders";

const statusStyles = {
  Draft: "border-white/10 bg-black/35 text-white/72",
  Processing: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  Published: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  Locked: "border-pink-400/30 bg-pink-500/12 text-pink-100",
} as const;

export default function DashboardVideosPage() {
  return (
    <div className="grid gap-6">
      <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
              My Videos
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
              Manage your creator video library
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
              Review creator uploads across draft, processing, published, and
              locked states from one polished control surface.
            </p>
          </div>

          <Link
            href="/dashboard/uploads"
            className="rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110"
          >
            Upload New Video
          </Link>
        </div>
      </section>

      <section className="surface-card overflow-hidden rounded-[32px]">
        <div className="hidden grid-cols-[1.4fr_0.8fr_0.5fr_0.6fr_0.6fr] gap-4 border-b border-white/8 bg-white/[0.03] px-6 py-4 text-xs uppercase tracking-[0.22em] text-white/42 lg:grid">
          <p>Video</p>
          <p>Tags</p>
          <p>Status</p>
          <p>Access</p>
          <p>Stream</p>
        </div>

        <div className="grid">
          {creatorVideos.map((video) => (
            <div
              key={video.id}
              className="grid gap-4 border-b border-white/8 px-6 py-5 last:border-b-0 lg:grid-cols-[1.4fr_0.8fr_0.5fr_0.6fr_0.6fr] lg:items-center"
            >
              <div>
                <p className="text-xl font-semibold text-white">{video.title}</p>
                <p className="mt-1 text-sm text-white/58">
                  {video.durationMinutes} min · {video.creatorName} ·{" "}
                  {video.updatedAt}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/58">
                  {video.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/68"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusStyles[video.status]}`}
                >
                  {video.status}
                </span>
              </div>

              <div className="text-sm font-medium text-white/72">
                {video.access}
              </div>

              <div className="text-sm text-white/58">
                {video.streamAssetStatus === "ready" && "Ready"}
                {video.streamAssetStatus === "processing" && "Processing"}
                {video.streamAssetStatus === "queued" && "Queued"}
                {video.streamAssetStatus === "awaiting_upload" &&
                  "Awaiting Upload"}
                {video.streamAssetStatus === "error" && "Error"}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {(["Draft", "Processing", "Published", "Locked"] as const).map(
          (status) => {
            const count = creatorVideos.filter((video) => video.status === status)
              .length;

            return (
              <div
                key={status}
                className="surface-card rounded-[28px] px-6 py-6 text-center"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                  {status}
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">{count}</p>
              </div>
            );
          },
        )}
      </section>
    </div>
  );
}
