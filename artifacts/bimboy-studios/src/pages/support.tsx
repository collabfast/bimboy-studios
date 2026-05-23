import { PageShell } from "@/components/page-shell";

export default function SupportPage() {
  return (
    <PageShell
      eyebrow="Support"
      title="Support center scaffold"
      description="Support, billing, and trust routes now have a stable public-facing home instead of falling back to missing pages."
    >
      <section className="page-shell mt-10 grid gap-5 md:grid-cols-3">
        {[
          ["Account help", "Reserved for login, onboarding, and profile support."],
          ["Billing support", "Reserved for subscription, payout, and transaction questions."],
          ["Platform issues", "Reserved for technical support, reports, and escalation guidance."],
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
