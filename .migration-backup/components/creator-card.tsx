import Link from "next/link";
import type { CreatorSummary } from "@/lib/types";

type CreatorCardProps = {
  creator: CreatorSummary;
};

export function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <article className="surface-card rounded-[28px] p-6">
      <div className="rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(255,92,168,0.35),_transparent_45%),linear-gradient(160deg,_rgba(141,125,255,0.4),_rgba(8,8,10,0.92))] p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-white/55">
          Creator
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-white">{creator.name}</h3>
        <p className="mt-2 text-sm text-white/70">{creator.tagline}</p>
      </div>
      <div className="mt-5 space-y-3 text-sm text-white/62">
        <p>{creator.specialty}</p>
        <p>Royalty rate: {creator.royaltyRate}%</p>
        <p>{creator.verified ? "Verified profile shell" : "Profile baseline"}</p>
      </div>
      <Link
        href={`/${creator.slug}`}
        className="mt-6 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20"
      >
        View profile
      </Link>
    </article>
  );
}
