import { PageShell } from "@/components/page-shell";

export default function LoginPage() {
  return (
    <PageShell
      eyebrow="Login"
      title="Login page scaffold"
      description="This is a clean authentication placeholder that keeps the route working and aligned with the rest of the platform shell."
    >
      <section className="page-shell mt-10 max-w-2xl">
        <div className="surface-card rounded-[28px] p-6 sm:p-8">
          <div className="grid gap-5">
            {["Email address", "Password"].map((label) => (
              <label key={label} className="grid gap-2 text-sm text-white/70">
                {label}
                <input
                  type={label === "Password" ? "password" : "email"}
                  placeholder={`Placeholder ${label.toLowerCase()}`}
                  className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none placeholder:text-white/30"
                />
              </label>
            ))}
          </div>
          <button className="mt-6 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-3 font-semibold text-white">
            Continue
          </button>
        </div>
      </section>
    </PageShell>
  );
}
