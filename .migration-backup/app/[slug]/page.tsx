import Link from "next/link";
import { SectionTitle } from "@/components/section-title";
import { creators } from "@/lib/placeholders";
import { supabase } from "@/lib/supabase";

type CreatorRecord = {
  slug: string;
  stage_name: string;
  bio: string | null;
  royalty_percent: number | null;
  payout_balance: number | null;
  verified: boolean | null;
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CreatorProfilePage({ params }: PageProps) {
  const { slug } = await params;

  let creator: CreatorRecord | null = null;

  try {
    const response = await supabase
      .from("creators")
      .select("slug, stage_name, bio, royalty_percent, payout_balance, verified")
      .eq("slug", slug)
      .maybeSingle();

    if (response.data) {
      creator = response.data as CreatorRecord;
    }
  } catch {
    creator = null;
  }

  const fallbackCreator = creators.find((entry) => entry.slug === slug);
  const name = creator?.stage_name ?? fallbackCreator?.name ?? slug;
  const bio =
    creator?.bio ??
    fallbackCreator?.tagline ??
    "This creator profile is live as a polished placeholder while the richer media and monetization modules are phased in.";
  const royaltyRate =
    creator?.royalty_percent ?? fallbackCreator?.royaltyRate ?? 15;
  const payoutBalance =
    creator?.payout_balance?.toString() ??
    fallbackCreator?.monthlyAudience ??
    "Placeholder";
  const verified = creator?.verified ?? fallbackCreator?.verified ?? false;

  return (
    <div className="pt-8">
      <section className="page-shell">
        <div className="surface-card overflow-hidden rounded-[36px]">
          <div className="h-44 bg-[radial-gradient(circle_at_top_left,_rgba(255,92,168,0.35),_transparent_42%),linear-gradient(135deg,_rgba(141,125,255,0.48),_rgba(8,8,10,0.92))]" />
          <div className="grid gap-10 px-6 py-8 sm:px-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-pink-300">
                Creator Profile
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                {name}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-white/68">
                {bio}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/creators"
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white/88"
                >
                  Back to creators
                </Link>
                <Link
                  href="/signup"
                  className="rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-3 font-semibold text-white"
                >
                  Join as creator
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                ["Verification", verified ? "Verified creator" : "Verification pending"],
                ["Royalty rate", `${royaltyRate}%`],
                ["Payout balance", `${payoutBalance}`],
                ["Profile slug", `/${slug}`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-white/8 bg-black/35 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                    {label}
                  </p>
                  <p className="mt-3 text-xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell mt-12">
        <SectionTitle
          eyebrow="Profile Modules"
          title="This route is ready for releases, credits, subscriptions, and royalty detail."
          description="The page now stays professional and usable even when live creator data is missing, which keeps the scaffold stable during early buildout."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Featured releases", "Placeholder area for the creator's latest scenes and collaborations."],
            ["Credits and cast", "Reserved for linked appearances, partners, and performer metadata."],
            ["Royalty summary", "Reserved for transparent payout and ownership details."],
          ].map(([title, description]) => (
            <div
              key={title}
              className="surface-card rounded-3xl p-6 text-white/78"
            >
              <h2 className="text-2xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/60">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
