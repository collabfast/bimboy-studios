import Link from "next/link";
import { creatorVideos } from "@/lib/placeholders";

export default function DashboardContentPage() {
  return (
    <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
      <h1 className="text-3xl font-bold text-white">Content</h1>
      <p className="mt-4 text-base leading-8 text-white/64">
        Organize creator-owned long-form releases, keep your metadata clean,
        and move from upload to publishing inside one premium workflow.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/uploads"
          className="rounded-[28px] border border-white/8 bg-black/28 p-6 transition hover:border-white/14 hover:bg-white/[0.04]"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-pink-300">
            Upload Flow
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-white">
            Send a new long-form video to Stream
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/60">
            Prepare title, description, tags, preview controls, and a transfer
            flow that can expand into direct and resumable uploads.
          </p>
        </Link>

        <Link
          href="/dashboard/videos"
          className="rounded-[28px] border border-white/8 bg-black/28 p-6 transition hover:border-white/14 hover:bg-white/[0.04]"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-pink-300">
            My Videos
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-white">
            Manage your creator library
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/60">
            Review draft, processing, published, and locked uploads from one
            control surface.
          </p>
        </Link>
      </div>

      <div className="mt-8 rounded-[28px] border border-white/8 bg-black/28 p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-pink-300">
          Current Library
        </p>
        <div className="mt-5 grid gap-3">
          {creatorVideos.slice(0, 3).map((video) => (
            <div
              key={video.id}
              className="flex flex-col gap-3 rounded-[22px] border border-white/8 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-lg font-semibold text-white">{video.title}</p>
                <p className="mt-1 text-sm text-white/58">
                  {video.durationMinutes} min · {video.creatorName}
                </p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
                {video.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
