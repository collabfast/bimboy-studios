import { CreatorCard } from "@/components/creator-card";
import { PageShell } from "@/components/page-shell";
import { creators } from "@/lib/placeholders";

const featuredCreator = creators[0];

export default function CreatorsPage() {
  return (
    <PageShell
      eyebrow="Creators"
      title="Explore verified creators, featured talent, and rising names."
      description="Browse performer profiles built for discovery, identity, and premium audience growth."
    >
      <section className="page-shell mt-10">
        <div className="surface-card rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-300">
                Featured Creator
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                {featuredCreator?.name ?? "Featured Talent"}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                Premium creator identity, verified profile presence, and room to
                grow audience, credits, and long-term value.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90">
                  Royalty Rate: {featuredCreator?.royaltyRate ?? "18%"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90">
                  Verified Talent
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90">
                  Featured Profile
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/8">
                Verified
              </button>
              <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/8">
                Featured
              </button>
              <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/8">
                Highest Royalty
              </button>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Search creators"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-pink-400/30"
              />
              <button className="rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-300">
              Creator Grid
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Featured talent and creator profiles
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
              Discover creators across premium studio releases, branded profiles,
              and rising audience momentum.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {creators.map((creator) => (
            <CreatorCard key={creator.slug} creator={creator} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}