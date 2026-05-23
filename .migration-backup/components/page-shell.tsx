import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: PageShellProps) {
  return (
    <div className="pt-8">
      <section className="page-shell">
        <div className="surface-card rounded-[32px] px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-xs uppercase tracking-[0.28em] text-pink-300">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
            {description}
          </p>
        </div>
      </section>
      {children}
    </div>
  );
}
