import { PageShell } from "@/components/page-shell";
import { studios } from "@/lib/placeholders";
import Link from "next/link";

const featuredStudio = studios[0];

export default function StudiosPage() {
  return (
    <PageShell
      eyebrow="Studios"
      title="Discover premium studios shaping the next generation of releases."
      description="Browse branded studio destinations built for premium content, cast identity, and long-term audience growth."
    >
      <section className="page-shell mt-10">
        <div className="surface-card rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-300">
                Featured Studio
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                {featuredStudio?.name ?? "Featured Studio"}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                Premium studio identity designed for branded releases, cast discovery,
                and polished presentation across every production.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90">
                  Premium Partner
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90">
                  Verified Studio
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90">
                  Featured Brand
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/8">
                Premium
              </button>
              <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/8">
                Verified
              </button>
              <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/8">
                Trending
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-300">
              Studio Directory
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Premium studios and branded release houses
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
              Explore studio brands building premium catalogs, creator partnerships,
              and signature release identities.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {studios.map((studio) => (
            <article
              key={studio.slug}
              className="surface-card rounded-[28px] p-6 transition hover:border-white/15"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-pink-300">
                {studio.status}
              </p>

              <h3 className="mt-4 text-2xl font-semibold text-white">
                {studio.name}
              </h3>

              <p className="mt-3 text-sm leading-7 text-white/62">
                {studio.focus}
              </p>

              <Link
                href={`/studios/${studio.slug}`}
                className="mt-6 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20"
              >
                View Studio
              </Link>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}