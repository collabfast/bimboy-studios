import { Link } from "wouter";

type StateBlockProps = {
  title: string;
  description?: string;
};

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="surface-card rounded-[28px] px-6 py-10 text-center text-sm text-white/55">
      {label}
    </div>
  );
}

export function EmptyBlock({ title, description }: StateBlockProps) {
  return (
    <div className="surface-card rounded-[28px] border border-dashed border-white/12 px-6 py-10 text-center">
      <p className="text-base font-semibold text-white/80">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-white/52">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function ErrorBlock({
  title = "Something went wrong",
  description,
}: Partial<StateBlockProps>) {
  return (
    <div className="surface-card rounded-[28px] border border-rose-400/25 bg-rose-500/8 px-6 py-10 text-center">
      <p className="text-base font-semibold text-rose-100">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-rose-100/70">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function AuthRequiredBlock({
  description = "These figures are operator-only. Sign in to view balances and paperwork.",
}: {
  description?: string;
}) {
  return (
    <div className="surface-card rounded-[28px] border border-amber-400/25 bg-amber-500/8 px-6 py-10 text-center">
      <p className="text-base font-semibold text-amber-100">Sign in required</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-amber-100/75">
        {description}
      </p>
      <Link
        href="/login"
        className="mt-5 inline-block rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110"
      >
        Go to sign in
      </Link>
    </div>
  );
}

export function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: number }).status === 401
  );
}
