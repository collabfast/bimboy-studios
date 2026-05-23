import { PageShell } from "@/components/page-shell";

export default function JoinCreatorPage() {
  return (
    <PageShell
      eyebrow="Join Beta"
      title="Become a Creator"
      description="Create a premium profile, connect your credits to studio releases, and step into a platform built to showcase performer identity with clarity."
    >
      <section className="page-shell mt-10 grid gap-5 md:grid-cols-3">
        {[
          [
            "Build Your Presence",
            "Launch a creator page designed for premium presentation, recognition, and long-term audience value.",
          ],
          [
            "Track Your Credits",
            "Keep your appearances connected to the releases and studios that shape your profile.",
          ],
          [
            "See Royalty Participation",
            "Follow participation and visibility from profile to release inside one polished experience.",
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
