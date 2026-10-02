import { supabase } from "@/integrations/supabase/client";

export type RealTrade = {
  symbol: string;
  lots: number | null;
  openTime: Date;
  closeTime: Date | null;
  pnl: number | null; // money if available, otherwise pips
  hasNotes: boolean;
};

export type TradeSource = "account" | "journal" | "none";

export type CheckResult = {
  passed: boolean;
  metric: string;
  insight: string;
  sample: number;
};

export type RealTradeCheck = {
  requirement: string;
  evaluate: (t: RealTrade[]) => CheckResult;
};

const DAY = 86_400_000;

/** Loads the last 90 days of real trades: linked account history first, Journal as fallback. */
export async function loadRealTrades(userId: string): Promise<{ source: TradeSource; trades: RealTrade[] }> {
  const since = new Date(Date.now() - 90 * DAY).toISOString();
  const { data: hist } = await supabase
    .from("trade_history")
    .select("symbol, lots, open_time, close_time, profit, pips, comment")
    .eq("user_id", userId)
    .gte("open_time", since)
    .order("open_time", { ascending: true })
    .limit(1000);
  if (hist && hist.length > 0) {
    return {
      source: "account",
      trades: hist
        .filter((h) => h.open_time)
        .map((h) => ({
          symbol: h.symbol ?? "?",
          lots: h.lots,
          openTime: new Date(h.open_time!),
          closeTime: h.close_time ? new Date(h.close_time) : null,
          pnl: h.profit ?? h.pips,
          hasNotes: !!h.comment,
        })),
    };
  }
  const { data: j } = await supabase
    .from("journal_entries")
    .select("pair, lot_size, entry_time, exit_time, result_pips, notes, mistakes, feelings")
    .eq("user_id", userId)
    .gte("entry_time", since)
    .order("entry_time", { ascending: true })
    .limit(1000);
  if (j && j.length > 0) {
    return {
      source: "journal",
      trades: j.map((e) => ({
        symbol: e.pair,
        lots: e.lot_size,
        openTime: new Date(e.entry_time),
        closeTime: e.exit_time ? new Date(e.exit_time) : null,
        pnl: e.result_pips,
        hasNotes: !!(e.notes || e.mistakes || e.feelings),
      })),
    };
  }
  return { source: "none", trades: [] };
}

// ---------- metric helpers ----------
const closed = (t: RealTrade[]) => t.filter((x) => x.pnl != null);
const wins = (t: RealTrade[]) => closed(t).filter((x) => x.pnl! > 0);
const losses = (t: RealTrade[]) => closed(t).filter((x) => x.pnl! < 0);
const avg = (n: number[]) => (n.length ? n.reduce((a, b) => a + b, 0) / n.length : 0);
const median = (n: number[]) => {
  if (!n.length) return 0;
  const s = [...n].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
const fmt = (n: number, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "∞");
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

function needs(min: number, t: RealTrade[]): CheckResult | null {
  const n = closed(t).length;
  if (n >= min) return null;
  return {
    passed: false,
    metric: `${n} / ${min} closed trades`,
    insight: `Not enough real trades yet. Log at least ${min} closed trades to measure this lesson against your own results.`,
    sample: n,
  };
}

function winRate(t: RealTrade[]) {
  const c = closed(t).length;
  return c ? (wins(t).length / c) * 100 : 0;
}
function payoff(t: RealTrade[]) {
  const l = Math.abs(avg(losses(t).map((x) => x.pnl!)));
  const w = avg(wins(t).map((x) => x.pnl!));
  return l === 0 ? (w > 0 ? Infinity : 0) : w / l;
}
function profitFactor(t: RealTrade[]) {
  const g = wins(t).reduce((a, x) => a + x.pnl!, 0);
  const l = Math.abs(losses(t).reduce((a, x) => a + x.pnl!, 0));
  return l === 0 ? (g > 0 ? Infinity : 0) : g / l;
}
function maxLossStreak(t: RealTrade[]) {
  let cur = 0, max = 0;
  for (const x of closed(t)) {
    if (x.pnl! < 0) { cur++; max = Math.max(max, cur); } else cur = 0;
  }
  return max;
}
function sizeUpAfterLoss(t: RealTrade[]) {
  const c = closed(t).filter((x) => x.lots != null);
  let count = 0;
  for (let i = 1; i < c.length; i++) if (c[i - 1].pnl! < 0 && c[i].lots! > c[i - 1].lots! * 1.25) count++;
  return count;
}
function tradesPerDay(t: RealTrade[]) {
  const m = new Map<string, number>();
  t.forEach((x) => m.set(dayKey(x.openTime), (m.get(dayKey(x.openTime)) ?? 0) + 1));
  return m;
}

// ---------- checks per module ----------
const ok = (passed: boolean, metric: string, good: string, bad: string, sample: number): CheckResult => ({
  passed, metric, insight: passed ? good : bad, sample,
});

const CHECKS: Record<string, RealTradeCheck> = {
  // Beginner
  Foundations: {
    requirement: "Place and close at least 3 real trades.",
    evaluate: (t) => needs(3, t) ?? ok(true, `${closed(t).length} closed trades`, "You are trading live and every trade is now data you can learn from.", "", closed(t).length),
  },
  "Market Mechanics": {
    requirement: "Focus on no more than 3 instruments.",
    evaluate: (t) => {
      const n = new Set(t.map((x) => x.symbol)).size;
      return needs(3, t) ?? ok(n <= 3, `${n} instruments traded`, "Good focus — you are learning how a few markets really move.", `You traded ${n} instruments. Narrow to your best 2–3 to read them properly.`, t.length);
    },
  },
  "Risk & Capital": {
    requirement: "Keep position size consistent: largest lot no more than 2× your typical lot.",
    evaluate: (t) => {
      const l = t.map((x) => x.lots).filter((x): x is number => x != null && x > 0);
      if (l.length < 3) return needs(99, []) && { passed: false, metric: `${l.length} trades with size`, insight: "Record lot size on at least 3 trades so we can check your sizing.", sample: l.length };
      const r = Math.max(...l) / median(l);
      return ok(r <= 2, `Largest lot ${fmt(r, 1)}× typical`, "Your sizing is consistent — risk is under control.", `One trade was ${fmt(r, 1)}× your normal size. Oversized trades are where accounts get hurt.`, l.length);
    },
  },
  "Reading Price": {
    requirement: "Average winner at least as large as average loser.",
    evaluate: (t) => needs(5, t) ?? ok(payoff(t) >= 1, `Avg win / avg loss ${fmt(payoff(t))}`, "Your winners pay for your losers — keep letting good trades run.", "Your losers are bigger than your winners. Tighten exits on bad trades or hold winners longer.", closed(t).length),
  },
  "Execution & Discipline": {
    requirement: "Never more than 5 trades in a single day.",
    evaluate: (t) => {
      const mx = Math.max(0, ...tradesPerDay(t).values());
      return needs(3, t) ?? ok(mx <= 5, `Busiest day: ${mx} trades`, "No overtrading days — your discipline shows.", `You took ${mx} trades in one day. Set a daily cap and stop when you hit it.`, t.length);
    },
  },
  // Intermediate
  "Market Structure": {
    requirement: "Win rate of 40% or better over at least 10 trades.",
    evaluate: (t) => needs(10, t) ?? ok(winRate(t) >= 40, `Win rate ${fmt(winRate(t), 0)}%`, "Your structure reads are landing often enough to build on.", "Fewer than 4 in 10 trades win. Only enter after a clear break of structure.", closed(t).length),
  },
  Liquidity: {
    requirement: "Average win at least 1.2× your average loss.",
    evaluate: (t) => needs(10, t) ?? ok(payoff(t) >= 1.2, `Avg win / avg loss ${fmt(payoff(t))}`, "You are targeting liquidity well — winners clearly outsize losers.", "Aim targets at the next liquidity pool so winners outgrow losers.", closed(t).length),
  },
  "Sessions & Timing": {
    requirement: "At least 70% of trades opened during London or New York (07:00–21:00 UTC).",
    evaluate: (t) => {
      const inS = t.filter((x) => { const h = x.openTime.getUTCHours(); return h >= 7 && h < 21; }).length;
      const p = t.length ? (inS / t.length) * 100 : 0;
      return needs(10, t) ?? ok(p >= 70, `${fmt(p, 0)}% in main sessions`, "You trade when the market has volume behind it.", "Too many trades in quiet hours. Concentrate on London and New York.", t.length);
    },
  },
  "Multi-Timeframe Execution": {
    requirement: "Average holding time of at least 15 minutes.",
    evaluate: (t) => {
      const h = t.filter((x) => x.closeTime).map((x) => (x.closeTime!.getTime() - x.openTime.getTime()) / 60000);
      if (h.length < 10) return { passed: false, metric: `${h.length} / 10 trades with close time`, insight: "We need close times on at least 10 trades to check this.", sample: h.length };
      const a = avg(h);
      return ok(a >= 15, `Avg hold ${fmt(a, 0)} min`, "You give trades time to work on your execution timeframe.", "Trades are closed very quickly — a sign of entries without higher-timeframe context.", h.length);
    },
  },
  "Trade Management": {
    requirement: "Profit factor of 1.0 or better over at least 10 trades.",
    evaluate: (t) => needs(10, t) ?? ok(profitFactor(t) >= 1, `Profit factor ${fmt(profitFactor(t))}`, "Your management keeps you net positive.", "Losses outweigh gains. Review where you cut winners early or let losers run.", closed(t).length),
  },
  // Advanced
  "Institutional Order Flow": {
    requirement: "Build a sample of at least 15 trades with a 45%+ win rate.",
    evaluate: (t) => needs(15, t) ?? ok(winRate(t) >= 45, `Win rate ${fmt(winRate(t), 0)}% over ${closed(t).length}`, "Your entries align with where larger players are acting.", "Win rate is below 45% — wait for clearer displacement before entering.", closed(t).length),
  },
  "Volume & Auction Theory": {
    requirement: "Largest single loss no more than 2.5× your average loss.",
    evaluate: (t) => {
      const l = losses(t).map((x) => Math.abs(x.pnl!));
      if (l.length < 3) return { passed: false, metric: `${l.length} / 3 losing trades`, insight: "Need at least 3 losing trades to measure loss control.", sample: l.length };
      const r = Math.max(...l) / avg(l);
      return ok(r <= 2.5, `Worst loss ${fmt(r, 1)}× average`, "No outsized losses — your stops respect value areas.", "One loss was far bigger than normal. Place stops beyond value, never move them wider.", l.length);
    },
  },
  "Intermarket Analysis": {
    requirement: "Profitable on at least 2 different instruments.",
    evaluate: (t) => {
      const by = new Map<string, number>();
      closed(t).forEach((x) => by.set(x.symbol, (by.get(x.symbol) ?? 0) + x.pnl!));
      const n = [...by.values()].filter((v) => v > 0).length;
      return needs(10, t) ?? ok(n >= 2, `${n} profitable instruments`, "Your edge holds across related markets.", "Only one market is profitable. Use correlations to confirm, not to add random pairs.", closed(t).length);
    },
  },
  "Portfolio Risk": {
    requirement: "No more than 4 losses in a row.",
    evaluate: (t) => needs(10, t) ?? ok(maxLossStreak(t) <= 4, `Longest losing run: ${maxLossStreak(t)}`, "Your losing runs stay contained.", "Long losing streaks — add a rule to pause after 3 straight losses.", closed(t).length),
  },
  "Systematic Edge": {
    requirement: "Positive expectancy over at least 20 trades.",
    evaluate: (t) => {
      const e = avg(closed(t).map((x) => x.pnl!));
      return needs(20, t) ?? ok(e > 0, `Expectancy ${fmt(e)} per trade`, "Your system has a measurable positive edge.", "Expectancy is negative — your rules need refining before adding size.", closed(t).length);
    },
  },
  // Elite
  "Prop Firm Mastery": {
    requirement: "Worst day no larger than 3× your average losing trade.",
    evaluate: (t) => {
      const d = new Map<string, number>();
      closed(t).forEach((x) => d.set(dayKey(x.openTime), (d.get(dayKey(x.openTime)) ?? 0) + x.pnl!));
      const worst = Math.abs(Math.min(0, ...d.values()));
      const al = Math.abs(avg(losses(t).map((x) => x.pnl!))) || 1;
      return needs(15, t) ?? ok(worst <= al * 3, `Worst day ${fmt(worst / al, 1)}× avg loss`, "Your daily losses would survive prop firm drawdown rules.", "One bad day would breach most prop daily limits. Set a hard daily stop.", closed(t).length);
    },
  },
  "Psychology Under Size": {
    requirement: "Never increase size straight after a loss.",
    evaluate: (t) => needs(10, t) ?? ok(sizeUpAfterLoss(t) === 0, `${sizeUpAfterLoss(t)} size-ups after a loss`, "No revenge sizing — your emotions are not driving risk.", "You increased size right after losses. That is revenge trading — keep size fixed.", closed(t).length),
  },
  "Performance Systems": {
    requirement: "Notes on at least half of your trades.",
    evaluate: (t) => {
      const p = t.length ? (t.filter((x) => x.hasNotes).length / t.length) * 100 : 0;
      return needs(10, t) ?? ok(p >= 50, `${fmt(p, 0)}% of trades have notes`, "You are reviewing your trades — that is how professionals improve.", "Most trades have no notes. Add a reason and a lesson to each trade in your Journal.", t.length);
    },
  },
  "Scaling Capital": {
    requirement: "Profit factor of 1.3 or better over at least 30 trades.",
    evaluate: (t) => needs(30, t) ?? ok(profitFactor(t) >= 1.3, `Profit factor ${fmt(profitFactor(t))}`, "Your edge is strong enough to justify scaling.", "Not yet ready to scale — get profit factor above 1.3 first.", closed(t).length),
  },
  "Professional Operations": {
    requirement: "Trade on at least 10 different days in the last 30.",
    evaluate: (t) => {
      const since = Date.now() - 30 * DAY;
      const n = new Set(t.filter((x) => x.openTime.getTime() >= since).map((x) => dayKey(x.openTime))).size;
      return ok(n >= 10, `${n} active days in 30`, "You operate consistently, like a business.", "Activity is irregular. Build a routine with set trading days.", n);
    },
  },
};

export function getCheckForModule(module: string): RealTradeCheck | undefined {
  return CHECKS[module];
}
