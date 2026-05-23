import Link from "next/link";
import type { VideoSummary } from "@/lib/types";

type VideoCardProps = {
  video: VideoSummary;
};

export function VideoCard({ video }: VideoCardProps) {
  return (
    <article className="surface-card overflow-hidden rounded-[28px]">
      <div className="h-52 bg-[radial-gradient(circle_at_top,_rgba(255,92,168,0.3),_transparent_38%),linear-gradient(135deg,_rgba(141,125,255,0.5),_rgba(10,10,14,0.98))]" />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">
              {video.studio}
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {video.title}
            </h3>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
            {video.status}
          </span>
        </div>
        <p className="mt-4 text-sm leading-7 text-white/62">{video.summary}</p>
        <Link
          href={`/videos/${video.slug}`}
          className="mt-6 inline-flex rounded-full bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
        >
          Open video page
        </Link>
      </div>
    </article>
  );
}
