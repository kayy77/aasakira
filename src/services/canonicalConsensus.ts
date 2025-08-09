// Canonical AI consensus and confluence utilities (no live price usage)
// This module centralizes AI voting, confluence bucketing, and EV math.

export type Tier = 'elite' | 'moderate' | 'weak';
export type AITierVote = {
  name: string;
  tier: Tier;
  direction: 'long' | 'short' | 'neutral';
  confidence?: number; // 0..1 optional
};

export const AI_TIER_SCORE: Record<Tier, number> = {
  elite: 2,
  moderate: 1,
  weak: 0,
};

export function computeAIConsensus(votes: AITierVote[]) {
  const maxScore = votes.length * 2;
  let rawScore = 0;
  let directionCounts = { long: 0, short: 0 } as { long: number; short: number };

  for (const v of votes) {
    const s = AI_TIER_SCORE[v.tier] ?? 0;
    if (v.direction !== 'neutral') {
      rawScore += s;
      directionCounts[v.direction] = directionCounts[v.direction] + 1;
    }
  }

  const frac = maxScore > 0 ? rawScore / maxScore : 0; // 0..1
  const majorityDirection = directionCounts.long >= directionCounts.short ? 'long' : 'short';
  return { rawScore, maxScore, frac, majorityDirection, directionCounts };
}

export type FilterScore = { name: string; score: number; reason?: string };

export function computeConfluenceBucket(filterResults: FilterScore[]) {
  const weights: Record<string, number> = {
    'Order Block': 1.2,
    'Liquidity Sweep': 1.2,
    'FVG': 1.0,
    'Volume Spike': 0.8,
    'Trend Alignment': 1.0,
    'RSI Divergence': 0.6,
  };

  let total = 0;
  let maxTotal = 0;
  for (const f of filterResults) {
    const w = weights[f.name] ?? 1;
    total += f.score * w;
    maxTotal += 1 * w;
  }
  const frac = maxTotal > 0 ? total / maxTotal : 0; // 0..1
  const bucket = Math.round(frac * 6); // 0..6
  return { total, maxTotal, frac, bucket };
}

export function defaultRRBySession(session?: 'Asian' | 'London' | 'NewYork') {
  switch (session) {
    case 'London':
    case 'NewYork':
      return 2.4;
    default:
      return 2.0;
  }
}

export function computeEV(p: number, rr: number) {
  // p: 0..1 probability, rr: risk:reward
  return p * rr - (1 - p);
}
