import { PageShell } from "@/components/page-shell";

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy"
      title="Privacy page placeholder"
      description="A complete premium scaffold needs a real privacy route even before final policy text is ready."
    >
      <section className="page-shell mt-10">
        <div className="surface-card rounded-[28px] p-6 sm:p-8">
          <p className="text-base leading-8 text-white/64">
            Add finalized privacy disclosures, data handling practices, cookie
            language, and user-rights details here when policy work begins.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
