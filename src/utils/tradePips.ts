/**
 * Shared trade pips calculation utility.
 * Used by WeeklyResults, LiveTradeSignal, and the weekly email edge function.
 *
 * Rule: Total pips for a trade = the HIGHEST TP level hit (not the sum).
 * Fallback to pips_realized when no TP pips data is available.
 */

export interface TakeProfitEntry {
  level: number;
  price: number;
  hit: boolean;
  pips: number | null;
}

export interface TradeForPips {
  take_profits: any;
  pips_realized: number | null;
  status: string;
  outcome?: string | null;
}

/**
 * Calculate pips for a single trade using the max-TP-hit methodology.
 */
export function getMaxTpPips(trade: TradeForPips): number {
  if (Array.isArray(trade.take_profits) && trade.take_profits.length > 0) {
    const hitTpPips = trade.take_profits
      .filter((tp: any) => tp?.hit === true && typeof tp?.pips === 'number')
      .map((tp: any) => tp.pips as number);

    if (hitTpPips.length > 0) {
      return Math.max(...hitTpPips);
    }
  }

  // Fallback: pips_realized (used for SL / manual close when no TP pips exist)
  return Number(trade.pips_realized) || 0;
}

/**
 * Classify a trade outcome for stats purposes.
 * Returns 'win' | 'loss'.
 * Partials and break-even count as wins (didn't fully stop out).
 */
export function classifyTradeOutcome(trade: TradeForPips): 'win' | 'loss' {
  const outcome = trade.outcome?.toUpperCase();
  const isStoppedOut = trade.status === 'STOPPED_OUT';
  const hasAnyTpHit =
    Array.isArray(trade.take_profits) &&
    trade.take_profits.some((tp: any) => tp?.hit === true);

  if (outcome === 'LOSS' || (isStoppedOut && !hasAnyTpHit)) {
    return 'loss';
  }
  return 'win';
}

/**
 * Check whether a trade should be counted in recap stats.
 * Includes CLOSED, STOPPED_OUT, and ACTIVE trades where all TPs hit.
 */
export function isTradeCountable(trade: TradeForPips): boolean {
  if (trade.status === 'CLOSED' || trade.status === 'STOPPED_OUT') {
    return true;
  }

  // Active trade with ALL take profits hit (e.g. TP4 reached but not yet formally closed)
  if (
    trade.status === 'ACTIVE' &&
    Array.isArray(trade.take_profits) &&
    trade.take_profits.length > 0 &&
    trade.take_profits.every((tp: any) => tp?.hit === true)
  ) {
    return true;
  }

  return false;
}
