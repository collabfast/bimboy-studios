import { PageShell } from "@/components/page-shell";

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Terms"
      title="Terms page placeholder"
      description="The terms route now exists as part of the professional baseline and can be replaced with finalized language later."
    >
      <section className="page-shell mt-10">
        <div className="surface-card rounded-[28px] p-6 sm:p-8">
          <p className="text-base leading-8 text-white/64">
            Replace this placeholder with finalized terms, user obligations,
            studio conditions, royalty language, and dispute handling details.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
