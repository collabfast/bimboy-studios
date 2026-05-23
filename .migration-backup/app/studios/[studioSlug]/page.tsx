import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { studios } from "@/lib/placeholders";

type PageProps = {
  params: Promise<{
    studioSlug: string;
  }>;
};

export default async function StudioDetailPage({ params }: PageProps) {
  const { studioSlug } = await params;
  const studio = studios.find((entry) => entry.slug === studioSlug);

  return (
    <PageShell
      eyebrow="Studio Detail"
      title={studio?.name ?? studioSlug}
      description={
        studio?.focus ??
        "This studio detail page is live as a clean placeholder for releases, cast lists, and publishing context."
      }
    >
      <section className="page-shell mt-10 grid gap-5 md:grid-cols-3">
        {[
          ["Featured releases", "Placeholder row for primary studio drops and promos."],
          ["Cast and credits", "Reserved for performer relationships and role metadata."],
          ["Studio notes", "Room for studio brand story, schedule, and release cadence."],
        ].map(([title, description]) => (
          <div key={title} className="surface-card rounded-[28px] p-6">
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/62">{description}</p>
          </div>
        ))}
      </section>

      <section className="page-shell mt-6">
        <Link
          href="/studios"
          className="inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20"
        >
          Back to studios
        </Link>
      </section>
    </PageShell>
  );
}
