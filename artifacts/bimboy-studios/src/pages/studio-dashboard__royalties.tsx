import { useGetFeed } from "@workspace/api-client-react";
import { SplitBreakdown } from "@/components/dashboard/split-breakdown";
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
} from "@/components/dashboard/state-block";
import { PLATFORM_BASE_BPS } from "@/lib/dashboard";

const STUDIO_SHARE_PCT = PLATFORM_BASE_BPS.studio / 100;

export default function StudioDashboardRoyaltiesPage() {
  const { data, isLoading, isError } = useGetFeed({ limit: 50 });
  const videos = (data?.items ?? []).filter((v) => v.postType === "studio");

  return (
    <div className="grid gap-6">
      <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
        <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
          Royalties
        </p>
        <h1 className="mt-4 text-3xl font-bold text-white">
          Studio share & cast splits
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
          Studio exclusives reserve a {STUDIO_SHARE_PCT}% studio share; the
          remainder is divided across the featured cast by their agreed splits.
        </p>
      </section>

      {isLoading ? (
        <LoadingBlock label="Loading royalties…" />
      ) : isError ? (
        <ErrorBlock description="Could not load royalties." />
      ) : videos.length === 0 ? (
        <EmptyBlock
          title="No studio exclusives yet"
          description="Royalty splits will appear once studio releases are published."
        />
      ) : (
        <section className="grid gap-4">
          {videos.map((item) => (
            <div
              key={item.id}
              className="surface-card rounded-[28px] px-6 py-6 sm:px-8"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-white">{item.title}</p>
                <span className="shrink-0 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                  {STUDIO_SHARE_PCT}% studio
                </span>
              </div>
              <div className="mt-4">
                <SplitBreakdown
                  postType={item.postType}
                  participants={item.participants}
                />
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
