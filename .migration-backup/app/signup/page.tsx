import { PageShell } from "@/components/page-shell";

export default function SignupPage() {
  return (
    <PageShell
      eyebrow="Signup"
      title="Signup page scaffold"
      description="This route is ready for future onboarding, creator applications, and studio intake without overcommitting to final business flows."
    >
      <section className="page-shell mt-10 max-w-2xl">
        <div className="surface-card rounded-[28px] p-6 sm:p-8">
          <div className="grid gap-5">
            {["Display name", "Email address", "Account type"].map((label) => (
              <label key={label} className="grid gap-2 text-sm text-white/70">
                {label}
                <input
                  type="text"
                  placeholder={`Placeholder ${label.toLowerCase()}`}
                  className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none placeholder:text-white/30"
                />
              </label>
            ))}
          </div>
          <button className="mt-6 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-3 font-semibold text-white">
            Start onboarding
          </button>
        </div>
      </section>
    </PageShell>
  );
}
