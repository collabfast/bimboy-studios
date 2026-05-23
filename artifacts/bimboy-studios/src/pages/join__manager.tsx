import { PageShell } from "@/components/page-shell";

export default function JoinManagerPage() {
  return (
    <PageShell
      eyebrow="Join Beta"
      title="Apply as Manager"
      description="Step into a management role centered on creator development, studio coordination, and premium release oversight across the BimBoy Studios platform."
    >
      <section className="page-shell mt-10 grid gap-5 md:grid-cols-3">
        {[
          [
            "Guide Creator Growth",
            "Support creator positioning, profile quality, and release opportunities with a polished operational flow.",
          ],
          [
            "Coordinate With Studios",
            "Bridge talent, credits, schedules, and release planning across studio relationships.",
          ],
          [
            "Oversee Participation",
            "Keep visibility around credits and royalty participation central to the management process.",
          ],
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
