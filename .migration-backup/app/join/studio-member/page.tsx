import { PageShell } from "@/components/page-shell";

export default function JoinStudioMemberPage() {
  return (
    <PageShell
      eyebrow="Join Beta"
      title="Become a Studio Member"
      description="Join a studio-facing workflow designed for premium releases, clean team collaboration, and strong creator visibility across every page."
    >
      <section className="page-shell mt-10 grid gap-5 md:grid-cols-3">
        {[
          [
            "Support Studio Releases",
            "Work within a refined environment for release pages, cast visibility, and premium presentation.",
          ],
          [
            "Coordinate Talent",
            "Help keep creators, credits, and studio identity aligned across the platform.",
          ],
          [
            "Operate With Clarity",
            "Use a workflow built around polished publishing, organized metadata, and royalty-aware operations.",
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
