import { useGetFeed } from "@workspace/api-client-react";
import { VideoRevenueRow } from "@/components/dashboard/video-revenue-row";
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
} from "@/components/dashboard/state-block";

export default function DashboardVideosPage() {
  const { data, isLoading, isError } = useGetFeed({ limit: 50 });
  const videos = (data?.items ?? []).filter((v) => v.postType !== "studio");

  return (
    <div className="grid gap-6">
      <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
        <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
          My Videos
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
          Creator posts & revenue splits
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
          Every creator-owned post takes a 20% {""}
          platform cut; the remaining 80% is divided across the participating
          creators. Expand a row for date-range revenue and conversion.
        </p>
      </section>

      {isLoading ? (
        <LoadingBlock label="Loading your videos…" />
      ) : isError ? (
        <ErrorBlock description="Could not load videos. Please try again." />
      ) : videos.length === 0 ? (
        <EmptyBlock
          title="No creator posts yet"
          description="Creator-owned uploads will appear here with their per-post revenue split."
        />
      ) : (
        <section className="surface-card overflow-hidden rounded-[32px]">
          {videos.map((item) => (
            <VideoRevenueRow key={item.id} item={item} />
          ))}
        </section>
      )}
    </div>
  );
}
