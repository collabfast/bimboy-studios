import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  useCreateSceneApplication,
  useListMySceneApplications,
  getListMySceneApplicationsQueryKey,
  type SceneBrand,
  type ScenePaymentModel,
  type SceneApplication,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useDashboardCreators } from "@/hooks/use-dashboard-creators";
import {
  SCENE_BRAND_LIST,
  SCENE_BRAND_LABELS,
  PAYMENT_MODEL_LIST,
  PAYMENT_MODEL_LABELS,
} from "@/lib/scene-brands";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-400/15 text-amber-200 border-amber-300/30",
  approved: "bg-emerald-400/15 text-emerald-200 border-emerald-300/30",
  declined: "bg-rose-400/15 text-rose-200 border-rose-300/30",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
        STATUS_STYLES[status] ?? "border-white/20 text-white/70"
      }`}
    >
      {status}
    </span>
  );
}

export default function ScenesPage() {
  const { session, loading: authLoading } = useAuth();
  const isLoggedIn = !!session;

  return (
    <div className="page-shell space-y-16 pt-12 pb-24">
      <Hero />
      <BrandShowcase />
      <PaymentModels />
      <section id="apply" className="scroll-mt-24">
        <header className="mb-6">
          <h2 className="text-3xl font-bold text-white">Apply to perform</h2>
          <p className="mt-2 max-w-2xl text-white/64">
            Applications are tied to your creator profile so our team can review
            your page, reach, and verification before booking a shoot.
          </p>
        </header>
        {authLoading ? (
          <div className="surface-card rounded-[28px] px-6 py-10 text-white/60">
            Loading…
          </div>
        ) : isLoggedIn ? (
          <ApplySection />
        ) : (
          <LoggedOutGate />
        )}
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-pink-500/15 via-violet-500/10 to-black px-6 py-14 sm:px-12">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink-300/80">
        Studio Casting
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
        Shoot scenes with our studio brands
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
        We produce for two distinct labels and back you with crew, distribution,
        and an audience that already shows up. Pick a brand, choose how you want
        to get paid, and apply with your creator profile.
      </p>
      <a
        href="#apply"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110"
      >
        Apply now
      </a>
    </section>
  );
}

function BrandShowcase() {
  return (
    <section>
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-white">Our brands</h2>
        <p className="mt-2 max-w-2xl text-white/64">
          Two labels, two vibes. You choose which fits your brand.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        {SCENE_BRAND_LIST.map((brand) => (
          <article
            key={brand.key}
            className="surface-card flex flex-col overflow-hidden rounded-[28px]"
          >
            <div
              className={`flex items-center justify-center bg-gradient-to-br ${brand.accent} p-8`}
            >
              <img
                src={brand.logo}
                alt={`${brand.name} logo`}
                className="max-h-28 w-auto object-contain drop-shadow-xl"
              />
            </div>
            <div className="flex flex-1 flex-col px-6 py-6">
              <h3 className="text-xl font-bold text-white">{brand.name}</h3>
              <p className="mt-1 text-sm font-semibold text-pink-300/90">
                {brand.tagline}
              </p>
              <p className="mt-3 flex-1 text-sm leading-7 text-white/64">
                {brand.blurb}
              </p>
              <a
                href="#apply"
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:text-white"
              >
                Apply for {brand.name}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PaymentModels() {
  return (
    <section>
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-white">Choose how you get paid</h2>
        <p className="mt-2 max-w-2xl text-white/64">
          Every booking lets you pick one of two compensation models. You select
          your preference when you apply.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        {PAYMENT_MODEL_LIST.map((model) => (
          <article
            key={model.key}
            className="surface-card flex flex-col rounded-[28px] px-6 py-7"
          >
            <h3 className="text-lg font-bold text-white">{model.name}</h3>
            <p className="mt-1 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-2xl font-black text-transparent">
              {model.headline}
            </p>
            <p className="mt-3 text-sm leading-7 text-white/64">
              {model.summary}
            </p>
            <ul className="mt-5 space-y-3">
              {model.highlights.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 text-sm leading-6 text-white/78"
                >
                  <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-pink-400 to-violet-400" />
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-2xl bg-white/5 px-4 py-3 text-xs font-medium text-white/60">
              Best for: {model.bestFor}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LoggedOutGate() {
  return (
    <div className="surface-card rounded-[28px] px-6 py-10 text-center sm:px-10">
      <h3 className="text-xl font-bold text-white">
        Log in to apply
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-white/64">
        Scene applications are for creators with a profile on BimBoy. Log in or
        create your creator profile to get started.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/login"
          className="rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110"
        >
          Log in
        </Link>
        <Link
          href="/join/creator"
          className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30"
        >
          Become a Creator
        </Link>
      </div>
    </div>
  );
}

function ApplySection() {
  const { creators, isLoading, isClaimMode } = useDashboardCreators();

  if (isLoading) {
    return (
      <div className="surface-card rounded-[28px] px-6 py-10 text-white/60">
        Loading your profile…
      </div>
    );
  }

  // A user with no owned profile (claim mode means they own none yet) can't
  // tie an application to a profile — prompt them to set one up first.
  if (isClaimMode || creators.length === 0) {
    return (
      <div className="surface-card rounded-[28px] px-6 py-10 text-center sm:px-10">
        <h3 className="text-xl font-bold text-white">
          Set up your creator profile first
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-white/64">
          You need an owned creator profile before you can apply. Create or claim
          yours, then come back to apply.
        </p>
        <Link
          href="/dashboard/profile"
          className="mt-6 inline-flex rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110"
        >
          Go to my profile
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <ApplyForm handles={creators.map((c) => ({ handle: c.handle, displayName: c.displayName }))} />
      <MyApplications />
    </div>
  );
}

function ApplyForm({
  handles,
}: {
  handles: { handle: string; displayName: string }[];
}) {
  const qc = useQueryClient();
  const mutation = useCreateSceneApplication();
  const [handle, setHandle] = useState(handles[0]?.handle ?? "");
  const [brand, setBrand] = useState<SceneBrand>(SCENE_BRAND_LIST[0].key);
  const [paymentModel, setPaymentModel] = useState<ScenePaymentModel>(
    PAYMENT_MODEL_LIST[0].key,
  );
  const [experience, setExperience] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await mutation.mutateAsync({
        data: {
          handle,
          brand,
          paymentModel,
          experience: experience.trim() || null,
          message: message.trim() || null,
        },
      });
      await qc.invalidateQueries({
        queryKey: getListMySceneApplicationsQueryKey(),
      });
      setDone(true);
      setExperience("");
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    }
  }

  const fieldClass =
    "w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-pink-400/60";

  return (
    <form
      onSubmit={onSubmit}
      className="surface-card space-y-5 rounded-[28px] px-6 py-7"
    >
      <h3 className="text-lg font-bold text-white">Submit an application</h3>

      {done ? (
        <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          Application submitted. Track its status on the right.
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {handles.length > 1 ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium text-white/80">
            Apply as
          </span>
          <select
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className={fieldClass}
          >
            {handles.map((h) => (
              <option key={h.handle} value={h.handle} className="bg-[#0b0b10]">
                {h.displayName} (@{h.handle})
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="text-sm text-white/60">
          Applying as{" "}
          <span className="font-semibold text-white">
            {handles[0]?.displayName} (@{handles[0]?.handle})
          </span>
        </p>
      )}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-white/80">Brand</span>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value as SceneBrand)}
          className={fieldClass}
        >
          {SCENE_BRAND_LIST.map((b) => (
            <option key={b.key} value={b.key} className="bg-[#0b0b10]">
              {b.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-white/80">
          Payment model
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {PAYMENT_MODEL_LIST.map((m) => {
            const active = paymentModel === m.key;
            return (
              <button
                type="button"
                key={m.key}
                onClick={() => setPaymentModel(m.key)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  active
                    ? "border-pink-400/70 bg-pink-500/10"
                    : "border-white/12 bg-white/5 hover:border-white/25"
                }`}
              >
                <span className="block text-sm font-semibold text-white">
                  {m.name}
                </span>
                <span className="mt-1 block text-xs text-white/60">
                  {m.headline}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-white/80">
          Experience <span className="text-white/40">(optional)</span>
        </span>
        <textarea
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          rows={3}
          placeholder="Tell us about your shooting experience, comfort levels, and any prior studio work."
          className={fieldClass}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-white/80">
          Anything else <span className="text-white/40">(optional)</span>
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Availability, scene ideas, questions for the team…"
          className={fieldClass}
        />
      </label>

      <button
        type="submit"
        disabled={mutation.isPending || !handle}
        className="w-full rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110 disabled:opacity-50"
      >
        {mutation.isPending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

function MyApplications() {
  const { data, isLoading } = useListMySceneApplications({
    query: { queryKey: getListMySceneApplicationsQueryKey() },
  });

  const apps = useMemo<SceneApplication[]>(() => data ?? [], [data]);

  return (
    <aside className="surface-card rounded-[28px] px-6 py-7">
      <h3 className="text-lg font-bold text-white">Your applications</h3>
      {isLoading ? (
        <p className="mt-4 text-sm text-white/55">Loading…</p>
      ) : apps.length === 0 ? (
        <p className="mt-4 text-sm leading-7 text-white/55">
          You haven't applied yet. Submit your first application to see its
          status here.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {apps.map((app) => (
            <li
              key={app.id}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-white">
                  {SCENE_BRAND_LABELS[app.brand]}
                </span>
                <StatusPill status={app.status} />
              </div>
              <p className="mt-1 text-xs text-white/55">
                {PAYMENT_MODEL_LABELS[app.paymentModel]} · @{app.handle}
              </p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
