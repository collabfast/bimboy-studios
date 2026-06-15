// Revenue split rules for BackpackBoys.
//
// - Creator/star posts (postType "creator"): platform takes 20%; the remaining
//   80% is divided among the participating creators. Duo → 40% / 40%.
// - Studio posts (postType "studio"): platform takes 33%; the remaining is
//   divided among the participating creators. Duo → ~33% / ~33%.
//
// Splits are computed in integer cents. Each creator's share is distributed
// from the "creator pool" weighted by their stored splitBps (equal weighting
// when no override is set). All rounding remainder is assigned to the platform,
// so the rows for a purchase always sum to the exact amount paid.

export const PLATFORM_BASE_BPS: Record<string, number> = {
  creator: 2000,
  studio: 3300,
};

export type ParticipantWeight = { creatorId: string; splitBps?: number | null };

export type CreatorSplit = {
  creatorId: string;
  splitBps: number;
  amountCents: number;
};

export type RevenueSplit = {
  platformBps: number;
  platformCents: number;
  creators: CreatorSplit[];
};

export function platformBaseBps(postType: string): number {
  return PLATFORM_BASE_BPS[postType] ?? PLATFORM_BASE_BPS.creator;
}

export function computeRevenueSplit(
  amountCents: number,
  postType: string,
  participants: ParticipantWeight[],
): RevenueSplit {
  const baseBps = platformBaseBps(postType);
  const poolBps = 10000 - baseBps;

  if (participants.length === 0 || amountCents <= 0) {
    return { platformBps: 10000, platformCents: amountCents, creators: [] };
  }

  const weights = participants.map((p) =>
    p.splitBps && p.splitBps > 0 ? p.splitBps : 1,
  );
  const totalWeight = weights.reduce((s, w) => s + w, 0);

  const poolCents = Math.floor((amountCents * poolBps) / 10000);

  let distributed = 0;
  const creators: CreatorSplit[] = participants.map((p, i) => {
    const amount = Math.floor((poolCents * weights[i]) / totalWeight);
    distributed += amount;
    return {
      creatorId: p.creatorId,
      splitBps: Math.round((poolBps * weights[i]) / totalWeight),
      amountCents: amount,
    };
  });

  const platformCents = amountCents - distributed;
  return { platformBps: baseBps, platformCents, creators };
}
