// Broker-agnostic trade execution abstraction.
// Real MT5 / cTrader adapters implement TradeExecutor; Phase 1 ships StubExecutor.

export type OrderSide = "BUY" | "SELL";

export interface OpenTradeRequest {
  symbol: string;
  side: OrderSide;
  volume: number;
  sl?: number | null;
  tp?: number | null;
  comment?: string;
}
export interface ModifyTradeRequest { broker_ticket: string; sl?: number | null; tp?: number | null; }
export interface CloseTradeRequest { broker_ticket: string; volume?: number; }
export interface ExecutionResult { success: boolean; broker_ticket?: string; executed_price?: number; executed_volume?: number; error?: string; }

export interface TradeExecutor {
  name: string;
  openTrade(req: OpenTradeRequest): Promise<ExecutionResult>;
  modifyTrade(req: ModifyTradeRequest): Promise<ExecutionResult>;
  partialClose(req: CloseTradeRequest): Promise<ExecutionResult>;
  closeTrade(req: CloseTradeRequest): Promise<ExecutionResult>;
}

export class StubExecutor implements TradeExecutor {
  name = "stub";
  async openTrade(req: OpenTradeRequest) { return { success: true, broker_ticket: `SIM-${Date.now()}`, executed_volume: req.volume } as ExecutionResult; }
  async modifyTrade(req: ModifyTradeRequest) { return { success: true, broker_ticket: req.broker_ticket } as ExecutionResult; }
  async partialClose(req: CloseTradeRequest) { return { success: true, broker_ticket: req.broker_ticket, executed_volume: req.volume } as ExecutionResult; }
  async closeTrade(req: CloseTradeRequest) { return { success: true, broker_ticket: req.broker_ticket } as ExecutionResult; }
}

let _executor: TradeExecutor = new StubExecutor();
export function getExecutor(): TradeExecutor { return _executor; }
export function setExecutor(exec: TradeExecutor) { _executor = exec; }