import { PageShell } from "@/components/page-shell";

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="About BimBoy Studios"
      description="This route anchors the company and product story inside the same premium shell as the rest of the site."
    >
      <section className="page-shell mt-10 grid gap-5 md:grid-cols-3">
        {[
          ["Mission", "Explain the premium platform vision and long-term product direction."],
          ["Creators", "Reserve space for performer identity, royalties, and profile ownership."],
          ["Studios", "Introduce studio partnerships, release philosophy, and platform standards."],
        ].map(([title, description]) => (
          <div key={title} className="surface-card rounded-[28px] p-6">
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/62">{description}</p>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
