import Link from "next/link";
import { cloudflareStreamConfig, creatorVideos } from "@/lib/placeholders";

export default function DashboardPage() {
  const publishedCount = creatorVideos.filter(
    (video) => video.status === "Published",
  ).length;
  const processingCount = creatorVideos.filter(
    (video) => video.status === "Processing",
  ).length;

  return (
    <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
      <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
        Dashboard Overview
      </p>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
        Creator video command center
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
        Manage long-form uploads, review video status, and prepare your profile
        library for premium release on BimBoy.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          [
            "Video Library",
            `${creatorVideos.length} uploads`,
            "Your creator-owned catalog across every status.",
          ],
          [
            "Live Releases",
            `${publishedCount} published`,
            "Videos ready for profile discovery and playback.",
          ],
          [
            "Upload Pipeline",
            cloudflareStreamConfig.supportsTus ? "Tus-ready" : "Standard upload",
            `${processingCount} currently moving through processing.`,
          ],
        ].map(([label, value, description]) => (
          <div
            key={label}
            className="rounded-[28px] border border-white/8 bg-black/28 p-5"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-white/42">
              {label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-2 text-sm leading-7 text-white/58">{description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/dashboard/uploads"
          className="rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110"
        >
          Upload New Video
        </Link>
        <Link
          href="/dashboard/videos"
          className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/8"
        >
          View My Videos
        </Link>
      </div>
    </section>
  );
}
