// Server-side risk engine. Never trust frontend-calculated risk — every
// copy_job is checked here, against the follower's stored risk_profile and
// its actual trade_history / equity, before the execution provider is
// called.

export interface RiskCheckContext {
  followerAccountId: string;
  symbol: string;
  plannedLotSize: number;
}

export interface RiskCheckResult {
  allowed: boolean;
  reason?: string;
}

const DEFAULT_RISK = {
  max_daily_drawdown_pct: 5,
  max_drawdown_pct: 15,
  max_lot_size: 1.0,
  max_open_trades: 10,
  min_margin_level: 200,
  equity_floor: null as number | null,
};

// Placeholder margin heuristic: $1,000 notional margin reserved per standard
// lot open. Real margin depends on broker leverage/contract size and should
// come from the broker connection once a real TradeExecutionService is
// plugged in; this keeps the check exercisable for $0 in the meantime.
const MOCK_MARGIN_PER_LOT = 1000;

export async function checkRisk(supabase: any, ctx: RiskCheckContext): Promise<RiskCheckResult> {
  const { data: riskRow } = await supabase
    .from("risk_profiles")
    .select("*")
    .eq("follower_account_id", ctx.followerAccountId)
    .maybeSingle();
  const risk = { ...DEFAULT_RISK, ...(riskRow ?? {}) };

  const { data: follower } = await supabase
    .from("follower_accounts")
    .select("balance, equity")
    .eq("id", ctx.followerAccountId)
    .maybeSingle();
  const balance = Number(follower?.balance ?? 10000);
  const equity = Number(follower?.equity ?? balance);

  // 1. Lot size
  if (ctx.plannedLotSize > Number(risk.max_lot_size)) {
    return { allowed: false, reason: `Lot size ${ctx.plannedLotSize} exceeds max allowed ${risk.max_lot_size}` };
  }

  // 2. Open position count
  const { count: openCount } = await supabase
    .from("trade_history")
    .select("id", { count: "exact", head: true })
    .eq("follower_account_id", ctx.followerAccountId)
    .is("close_time", null);
  if ((openCount ?? 0) >= Number(risk.max_open_trades)) {
    return { allowed: false, reason: `Open positions ${openCount} would meet/exceed max ${risk.max_open_trades}` };
  }

  // 3. Equity floor
  if (risk.equity_floor != null && equity < Number(risk.equity_floor)) {
    return { allowed: false, reason: `Equity ${equity} is below floor ${risk.equity_floor}` };
  }

  // 4. Daily drawdown (realized PnL today vs. starting balance)
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { data: todaysTrades } = await supabase
    .from("trade_history")
    .select("profit")
    .eq("follower_account_id", ctx.followerAccountId)
    .not("close_time", "is", null)
    .gte("close_time", startOfDay.toISOString());
  const dailyPnl = (todaysTrades ?? []).reduce((s: number, t: any) => s + Number(t.profit ?? 0), 0);
  const dailyDrawdownPct = dailyPnl < 0 ? (-dailyPnl / balance) * 100 : 0;
  if (dailyDrawdownPct >= Number(risk.max_daily_drawdown_pct)) {
    return { allowed: false, reason: `Daily drawdown ${dailyDrawdownPct.toFixed(2)}% would meet/exceed max ${risk.max_daily_drawdown_pct}%` };
  }

  // 5. Total drawdown (equity vs. balance)
  const totalDrawdownPct = balance > equity ? ((balance - equity) / balance) * 100 : 0;
  if (totalDrawdownPct >= Number(risk.max_drawdown_pct)) {
    return { allowed: false, reason: `Total drawdown ${totalDrawdownPct.toFixed(2)}% would meet/exceed max ${risk.max_drawdown_pct}%` };
  }

  // 6. Margin level (heuristic — see MOCK_MARGIN_PER_LOT note above)
  const { data: openTrades } = await supabase
    .from("trade_history")
    .select("lots")
    .eq("follower_account_id", ctx.followerAccountId)
    .is("close_time", null);
  const openLots = (openTrades ?? []).reduce((s: number, t: any) => s + Number(t.lots ?? 0), 0) + ctx.plannedLotSize;
  const usedMargin = openLots * MOCK_MARGIN_PER_LOT;
  const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : Number.POSITIVE_INFINITY;
  if (marginLevel < Number(risk.min_margin_level)) {
    return { allowed: false, reason: `Margin level ${marginLevel.toFixed(0)}% would be below min ${risk.min_margin_level}%` };
  }

  return { allowed: true };
}
