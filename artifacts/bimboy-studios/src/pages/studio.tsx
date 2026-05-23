import { Link } from "wouter";
import { Eye, Heart, DollarSign, Sparkles } from "lucide-react";
import { useListCreators, useGetCreatorVideos } from "@workspace/api-client-react";

// Pre-launch placeholder dashboard. Wires to the real /creators list so the
// numbers move when seed data changes, but auth/ownership is stubbed: we
// hard-pick the first creator as "you". A Supabase-backed studio identity
// will replace this when auth lands.
export default function StudioPage() {
  const { data: creators } = useListCreators();
  const me = creators?.[0];
  const { data: videos } = useGetCreatorVideos(me?.handle ?? "");

  const items = videos?.items ?? [];
  const totalLikes = items.reduce((s, v) => s + v.likesCount, 0);
  const totalSaves = items.reduce((s, v) => s + v.savesCount, 0);
  // Earnings estimate: assume modest unlock rate per like, weighted by split.
  const estEarningsCents = items.reduce((sum, v) => {
    const myPart =
      v.participants.find((p) => p.creator.handle === me?.handle)?.splitBps ??
      10000;
    const estUnlocks = Math.floor(v.likesCount * 0.04);
    const gross = estUnlocks * v.priceCents;
    return sum + Math.floor((gross * myPart) / 10000);
  }, 0);

  return (
    <div className="page-shell pt-8 pb-28">
      <header className="studio-header">
        <div>
          <div className="studio-eyebrow">Creator studio</div>
          <h1 className="studio-title">
            {me ? `Hey, ${me.displayName.split(" ")[0]}` : "Studio"}
          </h1>
          <p className="studio-sub">
            Earnings, drops, and collabs. Real payouts go live with CCBill in
            the next phase.
          </p>
        </div>
        <Link
          href={me ? `/c/${me.handle}` : "/"}
          className="studio-public-link"
        >
          View public profile →
        </Link>
      </header>

      <section className="studio-stats">
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Estimated earnings (30d)"
          value={`$${(estEarningsCents / 100).toFixed(2)}`}
          hint="Based on likes × est. unlock rate × your split"
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="Total likes"
          value={totalLikes.toLocaleString()}
        />
        <StatCard
          icon={<Eye className="h-5 w-5" />}
          label="Total saves"
          value={totalSaves.toLocaleString()}
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="Drops live"
          value={items.length.toString()}
        />
      </section>

      <section className="studio-section">
        <h2 className="studio-section-title">Your drops</h2>
        {items.length === 0 ? (
          <div className="library-empty">No drops yet. Upload coming soon.</div>
        ) : (
          <table className="studio-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Likes</th>
                <th>Saves</th>
                <th>Your split</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => {
                const myPart =
                  v.participants.find((p) => p.creator.handle === me?.handle)
                    ?.splitBps ?? 10000;
                return (
                  <tr key={v.id}>
                    <td className="studio-cell-title">{v.title}</td>
                    <td>${(v.priceCents / 100).toFixed(2)}</td>
                    <td>{v.likesCount.toLocaleString()}</td>
                    <td>{v.savesCount.toLocaleString()}</td>
                    <td>
                      <span className="studio-split-badge">
                        {(myPart / 100).toFixed(0)}%
                      </span>
                      {v.participants.length > 1 && (
                        <span className="studio-split-collab">
                          {" "}
                          · collab w/{" "}
                          {v.participants
                            .filter((p) => p.creator.handle !== me?.handle)
                            .map((p) => p.creator.displayName.split(" ")[0])
                            .join(", ")}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="studio-stat">
      <div className="studio-stat-icon">{icon}</div>
      <div className="studio-stat-label">{label}</div>
      <div className="studio-stat-value">{value}</div>
      {hint && <div className="studio-stat-hint">{hint}</div>}
    </div>
  );
}
