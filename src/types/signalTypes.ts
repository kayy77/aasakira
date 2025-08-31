// Unified signal types with proper null guards and validation

export type Direction = 'BUY' | 'SELL';
export type Bias = 'BULLISH' | 'BEARISH';
export type SetupState = 'IDLE' | 'SWEEP' | 'DISPLACE' | 'RETRACE' | 'CONFIRM' | 'READY';
export type SessionType = 'ASIAN' | 'LONDON' | 'NEWYORK' | 'SYDNEY';
export type SignalQuality = 'ELITE' | 'PROFESSIONAL' | 'INSTITUTIONAL' | 'STANDARD' | 'REJECTED';

export interface Quote {
  bid: number;
  ask: number;
  ts: number;
  source: string;
}

export interface BaseSignal {
  id: string;
  symbol: string;
  direction: Direction;
  bias: Bias;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  confidence: number; // 0..100
  createdAt: number;
  quality: SignalQuality;
  evidenceScore: number; // 0..100
  setupState: SetupState;
  session: SessionType;
  reasoning?: string;
  timeframe?: string;
  timestamp?: number;
  status?: 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  meta?: Record<string, unknown>;
}

export interface Consensus {
  votes: Array<{ model: string; direction: Bias; confidence: number }>;
  agreementPct: number;        // 0..100
  scoreFraction: number;       // 0..1
}

export interface MarketContext {
  symbol: string;
  currentPrice: number;
  spread: number;
  atr: number;
  session: SessionType;
  primary: Quote;
  secondary: Quote;
  setupState: SetupState;
  hasLiquiditySweep: boolean;
  hasDisplacement: boolean;
  taggedPOI: boolean;
  ltfBOSConfirm: boolean;
  inEntryZone: boolean;
  poiQuality: number; // 0..20
  ltfConfirmScore: number; // 0..20
  liquidityMapAlign: number; // 0..15
  regimeFit: number; // 0..10
  priceIntegrityOK: boolean;
  fvgConfirmationStage?: 'DETECTED' | 'CONFIRMED' | 'RETESTING' | 'READY';
}

export interface ValidationResult {
  isValid: boolean;
  reason: string;
  evidenceScore: number;
  gate: string;
  adjustments?: Partial<BaseSignal>;
  fvgState?: any;
  validationErrors?: Array<{
    code: string;
    message: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    details?: any;
  }>;
}

export interface BacktestResult {
  tp1HitRate: number;
  meanMAE: number;
  profitFactor: number;
  maxDrawdown: number;
}

// NEVER trust external shapes - use safe constructors:
export function safeConsensus(raw: any): Consensus {
  const votes = Array.isArray(raw?.votes) ? raw.votes : [];
  const agreementPct = Number.isFinite(raw?.agreementPct) ? raw.agreementPct : 0;
  const scoreFraction = Number.isFinite(raw?.scoreFraction) ? raw.scoreFraction : (agreementPct / 100);
  return { votes, agreementPct, scoreFraction };
}

export function safeQuote(raw: any, fallbackPrice: number = 1.0): Quote {
  return {
    bid: Number.isFinite(raw?.bid) ? raw.bid : fallbackPrice,
    ask: Number.isFinite(raw?.ask) ? raw.ask : fallbackPrice + 0.0002,
    ts: Number.isFinite(raw?.ts) ? raw.ts : Date.now(),
    source: typeof raw?.source === 'string' ? raw.source : 'fallback'
  };
}

export function safeMarketContext(raw: any): MarketContext {
  const currentPrice = Number.isFinite(raw?.currentPrice) ? raw.currentPrice : 1.0800;
  return {
    symbol: typeof raw?.symbol === 'string' ? raw.symbol : 'EURUSD',
    currentPrice,
    spread: Number.isFinite(raw?.spread) ? raw.spread : 0.0002,
    atr: Number.isFinite(raw?.atr) ? raw.atr : 0.0015,
    session: raw?.session || 'LONDON',
    primary: safeQuote(raw?.primary, currentPrice),
    secondary: safeQuote(raw?.secondary, currentPrice),
    setupState: raw?.setupState || 'IDLE',
    hasLiquiditySweep: Boolean(raw?.hasLiquiditySweep),
    hasDisplacement: Boolean(raw?.hasDisplacement),
    taggedPOI: Boolean(raw?.taggedPOI),
    ltfBOSConfirm: Boolean(raw?.ltfBOSConfirm),
    inEntryZone: Boolean(raw?.inEntryZone),
    poiQuality: Number.isFinite(raw?.poiQuality) ? Math.max(0, Math.min(20, raw.poiQuality)) : 0,
    ltfConfirmScore: Number.isFinite(raw?.ltfConfirmScore) ? Math.max(0, Math.min(20, raw.ltfConfirmScore)) : 0,
    liquidityMapAlign: Number.isFinite(raw?.liquidityMapAlign) ? Math.max(0, Math.min(15, raw.liquidityMapAlign)) : 0,
    regimeFit: Number.isFinite(raw?.regimeFit) ? Math.max(0, Math.min(10, raw.regimeFit)) : 0,
    priceIntegrityOK: Boolean(raw?.priceIntegrityOK),
    fvgConfirmationStage: raw?.fvgConfirmationStage || 'DETECTED'
  };
}