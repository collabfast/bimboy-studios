import { PageShell } from "@/components/page-shell";

export default function DmcaPage() {
  return (
    <PageShell
      eyebrow="DMCA"
      title="DMCA process placeholder"
      description="This legal route is now present and styled consistently, ready for final takedown policy and rights-holder instructions."
    >
      <section className="page-shell mt-10">
        <div className="surface-card rounded-[28px] p-6 sm:p-8">
          <p className="text-base leading-8 text-white/64">
            Add the formal DMCA notice workflow, submission requirements,
            contact method, and review process here during the legal and trust
            phase of the build.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
