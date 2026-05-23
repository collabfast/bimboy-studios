import { PageShell } from "@/components/page-shell";

export default function RoyaltiesPage() {
  return (
    <PageShell
      eyebrow="Royalties"
      title="Royalty transparency has a dedicated public route."
      description="This page is intentionally broad and polished rather than fully implemented, giving the platform a stable place for future payout explanations and creator education."
    >
      <section className="page-shell mt-10 grid gap-5 md:grid-cols-3">
        {[
          ["Creator earnings", "Placeholder area for how performers participate in recurring payouts."],
          ["Studio splits", "Reserved for studio-side split visibility and deal framing."],
          ["Statement clarity", "Reserved for FAQ content, examples, and transparent payout language."],
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
