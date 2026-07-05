export interface RiskProfile {
  max_daily_drawdown_pct: number;
  max_drawdown_pct: number;
  max_lot_size: number;
  max_open_trades: number;
  min_margin_level: number;
  equity_floor: number | null;
}
export interface AccountState {
  balance: number | null;
  equity: number | null;
  open_trades_count: number;
  daily_drawdown_pct: number;
  drawdown_pct: number;
  margin_level: number;
}
export interface RiskCheckResult { allowed: boolean; reason?: string; }

export function checkRisk(profile: RiskProfile, state: AccountState, plannedLot: number): RiskCheckResult {
  if (plannedLot > profile.max_lot_size) return { allowed: false, reason: `Lot ${plannedLot} exceeds max ${profile.max_lot_size}` };
  if (state.open_trades_count >= profile.max_open_trades) return { allowed: false, reason: "Max open trades reached" };
  if (state.daily_drawdown_pct >= profile.max_daily_drawdown_pct) return { allowed: false, reason: "Daily drawdown breached" };
  if (state.drawdown_pct >= profile.max_drawdown_pct) return { allowed: false, reason: "Max drawdown breached" };
  if (state.margin_level && state.margin_level < profile.min_margin_level) return { allowed: false, reason: "Margin level too low" };
  if (profile.equity_floor && state.equity && state.equity < profile.equity_floor) return { allowed: false, reason: "Equity below floor" };
  return { allowed: true };
}