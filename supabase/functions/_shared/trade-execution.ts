// TradeExecutionService: broker-agnostic trade execution contract.
//
// Phase 1 ships only MockTradeExecutionProvider. A real provider (MetaApi,
// MT5 Manager API, cTrader Open API, ...) implements the same interface and
// is swapped in at the call site (copy-job-processor) with no changes
// required anywhere else in the copy engine.

export type TradeDirection = "BUY" | "SELL";

export interface OpenTradeParams {
  accountId: string; // follower_accounts.id
  symbol: string;
  direction: TradeDirection;
  lotSize: number;
  sl?: number | null;
  tp?: number | null;
  meta?: { copyJobId?: string };
}

export interface ModifyTradeParams {
  tradeId: string; // trade_history.id of the open position
  sl?: number | null;
  tp?: number | null;
  meta?: { copyJobId?: string };
}

export interface PartialCloseParams {
  tradeId: string;
  lotSize: number;
  meta?: { copyJobId?: string };
}

export interface ExecutionResult {
  success: boolean;
  brokerTicket?: string;
  executedPrice?: number;
  executedVolume?: number;
  error?: string;
}

export interface TradeExecutionService {
  openTrade(params: OpenTradeParams): Promise<ExecutionResult>;
  modifyTrade(params: ModifyTradeParams): Promise<ExecutionResult>;
  closeTrade(tradeId: string, meta?: { copyJobId?: string }): Promise<ExecutionResult>;
  partialClose(params: PartialCloseParams): Promise<ExecutionResult>;
}

// Rough per-symbol reference prices so simulated fills look plausible.
// Not a market data feed — purely cosmetic for the mock.
const BASE_PRICES: Record<string, number> = {
  XAUUSD: 2400, XAGUSD: 29, EURUSD: 1.085, GBPUSD: 1.27, USDJPY: 155,
  AUDUSD: 0.66, USDCAD: 1.36, USDCHF: 0.905, NZDUSD: 0.61,
  BTCUSD: 65000, ETHUSD: 3400, US30: 39000, NAS100: 19500, SPX500: 5400,
};

function synthPrice(symbol: string): number {
  const base = BASE_PRICES[symbol.toUpperCase()] ?? 100;
  const jitter = (Math.random() - 0.5) * 0.002; // +/-0.1%
  return Math.round(base * (1 + jitter) * 100000) / 100000;
}

function randomDelayMs(): number {
  return 200 + Math.floor(Math.random() * 600); // 200-800ms
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Occasional realistic failures so retry/error-logging paths get exercised.
const FAILURE_RATE = 0.08;
const FAILURE_REASONS = [
  "insufficient margin",
  "invalid stops",
  "requote: price moved",
  "market closed for symbol",
];

function maybeFail(): string | null {
  if (Math.random() >= FAILURE_RATE) return null;
  return FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
}

function genTicket(): string {
  return `SIM-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export class MockTradeExecutionProvider implements TradeExecutionService {
  constructor(private supabase: any, private userId: string) {}

  private async log(level: "info" | "warn" | "error", message: string, context: Record<string, unknown>, copyJobId?: string) {
    await this.supabase.from("execution_logs").insert({
      copy_job_id: copyJobId ?? null,
      user_id: this.userId,
      level,
      message,
      context,
    });
  }

  async openTrade(params: OpenTradeParams): Promise<ExecutionResult> {
    await sleep(randomDelayMs());
    const copyJobId = params.meta?.copyJobId;

    const failure = maybeFail();
    if (failure) {
      await this.log("error", `Open failed: ${failure}`, { symbol: params.symbol, lotSize: params.lotSize }, copyJobId);
      return { success: false, error: failure };
    }

    const price = synthPrice(params.symbol);
    const ticket = genTicket();

    const { data: row, error } = await this.supabase
      .from("trade_history")
      .insert({
        follower_account_id: params.accountId,
        user_id: this.userId,
        copy_job_id: copyJobId ?? null,
        source: "copy",
        external_ticket: ticket,
        symbol: params.symbol,
        side: params.direction.toLowerCase(),
        lots: params.lotSize,
        open_price: price,
        open_time: new Date().toISOString(),
        raw: { sl: params.sl ?? null, tp: params.tp ?? null },
      })
      .select()
      .single();
    if (error) {
      await this.log("error", `Open failed: could not persist trade_history (${error.message})`, { symbol: params.symbol }, copyJobId);
      return { success: false, error: error.message };
    }

    await this.log("info", `Opened ${params.direction} ${params.lotSize} ${params.symbol} @ ${price}`, { tradeId: row.id, ticket }, copyJobId);
    return { success: true, brokerTicket: ticket, executedPrice: price, executedVolume: params.lotSize };
  }

  async modifyTrade(params: ModifyTradeParams): Promise<ExecutionResult> {
    await sleep(randomDelayMs());
    const copyJobId = params.meta?.copyJobId;

    const { data: trade } = await this.supabase.from("trade_history").select("*").eq("id", params.tradeId).maybeSingle();
    if (!trade || trade.close_time) {
      await this.log("error", "Modify failed: no open position found", { tradeId: params.tradeId }, copyJobId);
      return { success: false, error: "no open position found" };
    }

    const failure = maybeFail();
    if (failure) {
      await this.log("error", `Modify failed: ${failure}`, { tradeId: params.tradeId }, copyJobId);
      return { success: false, error: failure };
    }

    const oldSl = trade.raw?.sl ?? null;
    const oldTp = trade.raw?.tp ?? null;
    await this.supabase.from("trade_history").update({ raw: { ...trade.raw, sl: params.sl ?? oldSl, tp: params.tp ?? oldTp } }).eq("id", trade.id);
    await this.supabase.from("trade_modifications").insert({
      copy_job_id: copyJobId ?? null,
      user_id: this.userId,
      broker_ticket: trade.external_ticket,
      old_sl: oldSl, new_sl: params.sl ?? oldSl,
      old_tp: oldTp, new_tp: params.tp ?? oldTp,
    });

    await this.log("info", "Modified stops", { tradeId: trade.id, sl: params.sl, tp: params.tp }, copyJobId);
    return { success: true, brokerTicket: trade.external_ticket };
  }

  async closeTrade(tradeId: string, meta?: { copyJobId?: string }): Promise<ExecutionResult> {
    await sleep(randomDelayMs());
    const copyJobId = meta?.copyJobId;

    const { data: trade } = await this.supabase.from("trade_history").select("*").eq("id", tradeId).maybeSingle();
    if (!trade || trade.close_time) {
      await this.log("error", "Close failed: no open position found", { tradeId }, copyJobId);
      return { success: false, error: "no open position found" };
    }

    const failure = maybeFail();
    if (failure) {
      await this.log("error", `Close failed: ${failure}`, { tradeId }, copyJobId);
      return { success: false, error: failure };
    }

    const closePrice = synthPrice(trade.symbol);
    const direction = trade.side === "sell" ? -1 : 1;
    const pnl = Math.round((closePrice - trade.open_price) * direction * trade.lots * 100 * 100) / 100;

    await this.supabase.from("trade_history").update({
      close_price: closePrice,
      close_time: new Date().toISOString(),
      profit: pnl,
    }).eq("id", trade.id);

    await this.supabase.from("trade_closures").insert({
      copy_job_id: copyJobId ?? null,
      user_id: this.userId,
      broker_ticket: trade.external_ticket,
      close_type: "full",
      volume_closed: trade.lots,
      close_price: closePrice,
      pnl,
    });

    await this.bumpEquity(trade.follower_account_id, pnl);
    await this.log("info", `Closed ${trade.symbol} @ ${closePrice} (pnl ${pnl})`, { tradeId: trade.id, pnl }, copyJobId);
    return { success: true, brokerTicket: trade.external_ticket, executedPrice: closePrice, executedVolume: trade.lots };
  }

  async partialClose(params: PartialCloseParams): Promise<ExecutionResult> {
    await sleep(randomDelayMs());
    const copyJobId = params.meta?.copyJobId;

    const { data: trade } = await this.supabase.from("trade_history").select("*").eq("id", params.tradeId).maybeSingle();
    if (!trade || trade.close_time) {
      await this.log("error", "Partial close failed: no open position found", { tradeId: params.tradeId }, copyJobId);
      return { success: false, error: "no open position found" };
    }

    const failure = maybeFail();
    if (failure) {
      await this.log("error", `Partial close failed: ${failure}`, { tradeId: params.tradeId }, copyJobId);
      return { success: false, error: failure };
    }

    const closeLots = Math.min(params.lotSize, trade.lots);
    const closePrice = synthPrice(trade.symbol);
    const direction = trade.side === "sell" ? -1 : 1;
    const pnl = Math.round((closePrice - trade.open_price) * direction * closeLots * 100 * 100) / 100;
    const remaining = Math.round((trade.lots - closeLots) * 100) / 100;

    if (remaining <= 0) {
      await this.supabase.from("trade_history").update({ close_price: closePrice, close_time: new Date().toISOString(), profit: pnl }).eq("id", trade.id);
    } else {
      await this.supabase.from("trade_history").update({ lots: remaining }).eq("id", trade.id);
    }

    await this.supabase.from("trade_closures").insert({
      copy_job_id: copyJobId ?? null,
      user_id: this.userId,
      broker_ticket: trade.external_ticket,
      close_type: "partial",
      volume_closed: closeLots,
      close_price: closePrice,
      pnl,
    });

    await this.bumpEquity(trade.follower_account_id, pnl);
    await this.log("info", `Partial close ${closeLots} of ${trade.symbol} @ ${closePrice} (pnl ${pnl})`, { tradeId: trade.id, remaining }, copyJobId);
    return { success: true, brokerTicket: trade.external_ticket, executedPrice: closePrice, executedVolume: closeLots };
  }

  private async bumpEquity(followerAccountId: string, pnl: number) {
    const { data: fa } = await this.supabase.from("follower_accounts").select("equity").eq("id", followerAccountId).maybeSingle();
    const current = Number(fa?.equity ?? 10000);
    await this.supabase.from("follower_accounts").update({ equity: Math.round((current + pnl) * 100) / 100 }).eq("id", followerAccountId);
  }
}
