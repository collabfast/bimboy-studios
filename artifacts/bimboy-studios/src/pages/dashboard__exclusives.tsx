import { useGetFeed } from "@workspace/api-client-react";
import { VideoRevenueRow } from "@/components/dashboard/video-revenue-row";
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
} from "@/components/dashboard/state-block";

export default function DashboardExclusivesPage() {
  const { data, isLoading, isError } = useGetFeed({ limit: 50 });
  const videos = (data?.items ?? []).filter((v) => v.postType === "studio");

  return (
    <div className="grid gap-6">
      <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
        <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
          Exclusives
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
          Studio exclusives & royalty splits
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
          Studio-produced exclusives take a 33% BackpackBoys share; the rest is
          divided across the featured cast. Expand a row for date-range revenue
          and conversion.
        </p>
      </section>

      {isLoading ? (
        <LoadingBlock label="Loading exclusives…" />
      ) : isError ? (
        <ErrorBlock description="Could not load exclusives. Please try again." />
      ) : videos.length === 0 ? (
        <EmptyBlock
          title="No studio exclusives yet"
          description="Studio-produced releases will appear here with the 33% studio share applied."
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
