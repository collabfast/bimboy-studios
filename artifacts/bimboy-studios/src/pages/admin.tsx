export default function AdminPage() {
  return (
    <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
      <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
        Admin Overview
      </p>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
        Admin panel baseline
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
        This is the internal operations shell for moderation, creator review,
        studio management, and royalty oversight.
      </p>
    </section>
  );
}
