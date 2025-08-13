// 🎯 PRICE TRUTH ENGINE - Multi-Feed Reconciliation & Accuracy Guard
// Ensures broker-grade quote accuracy with multi-source validation

type QuoteSrc = 'BROKER' | 'WEBHOOK' | 'FALLBACK1' | 'FALLBACK2';

export interface RawTick {
  src: QuoteSrc;
  symbol: string;          // e.g., "EURUSD", "USDJPY"
  bid: number;
  ask: number;
  ts: number;              // ms epoch from source
}

export interface TruthQuote {
  symbol: string;
  bid: number;
  ask: number;
  mid: number;
  spreadPips: number;
  quality: 'GOLD' | 'SILVER' | 'RED';
  driftPips: number;       // max deviation between sources
  sourcesUsed: number;
  ts: number;
  priceAge: number;        // ms since quote timestamp
}

export interface PriceValidationResult {
  valid: boolean;
  quality: 'GOLD' | 'SILVER' | 'RED';
  reasons: string[];
  adjustedPrice?: number;
  adjustedSL?: number;
  adjustedTP?: number;
}

const PIP_FACTORS: Record<string, number> = {
  'EURUSD': 10000, 'GBPUSD': 10000, 'AUDUSD': 10000, 'NZDUSD': 10000,
  'USDCHF': 10000, 'EURGBP': 10000, 'EURCHF': 10000, 'GBPCHF': 10000,
  'USDJPY': 100,   'GBPJPY': 100,   'EURJPY': 100,   'AUDJPY': 100,
  'NZDJPY': 100,   'CADJPY': 100,   'CHFJPY': 100,
  'USDCAD': 10000, 'AUDCAD': 10000, 'EURCAD': 10000, 'GBPCAD': 10000,
  'AUDNZD': 10000, 'EURNZD': 10000, 'GBPNZD': 10000
};

const SYMBOL_MAP: Record<string, { 
  std: string; 
  pipFactor: number; 
  minTick: number; 
  displayDp: number;
  maxSpreadPips: number;
}> = {
  'EURUSD': { std: 'EURUSD', pipFactor: 10000, minTick: 0.00001, displayDp: 5, maxSpreadPips: 1.2 },
  'GBPUSD': { std: 'GBPUSD', pipFactor: 10000, minTick: 0.00001, displayDp: 5, maxSpreadPips: 1.8 },
  'USDJPY': { std: 'USDJPY', pipFactor: 100,   minTick: 0.001,   displayDp: 3, maxSpreadPips: 1.0 },
  'USDCHF': { std: 'USDCHF', pipFactor: 10000, minTick: 0.00001, displayDp: 5, maxSpreadPips: 1.4 },
  'AUDUSD': { std: 'AUDUSD', pipFactor: 10000, minTick: 0.00001, displayDp: 5, maxSpreadPips: 1.5 },
  'USDCAD': { std: 'USDCAD', pipFactor: 10000, minTick: 0.00001, displayDp: 5, maxSpreadPips: 1.3 },
  'NZDUSD': { std: 'NZDUSD', pipFactor: 10000, minTick: 0.00001, displayDp: 5, maxSpreadPips: 2.0 },
  'EURJPY': { std: 'EURJPY', pipFactor: 100,   minTick: 0.001,   displayDp: 3, maxSpreadPips: 1.5 },
  'GBPJPY': { std: 'GBPJPY', pipFactor: 100,   minTick: 0.001,   displayDp: 3, maxSpreadPips: 2.2 },
  'EURGBP': { std: 'EURGBP', pipFactor: 10000, minTick: 0.00001, displayDp: 5, maxSpreadPips: 1.2 }
};

const MAX_STALE_MS = 1200;               // kill stale quotes
const MAX_CLOCK_SKEW_MS = 800;           // if source ts is too off, ignore
const MAX_DRIFT_PIPS_DEFAULT = 0.8;     // sources must agree within this
const MAX_SPREAD_PIPS_MULT_ATR = 0.35;  // sanity vs ATR on TF used

export class PriceTruthEngine {
  private recent: Record<string, RawTick[]> = {};
  private lastHeartbeat: Record<QuoteSrc, number> = {
    BROKER: 0,
    WEBHOOK: 0, 
    FALLBACK1: 0,
    FALLBACK2: 0
  };
  
  constructor() {
    this.initializeHeartbeats();
  }

  ingest(tick: RawTick): boolean {
    // Reject stale or clock-skewed ticks
    const now = Date.now();
    if (now - tick.ts > MAX_STALE_MS) {
      console.warn(`Rejecting stale tick: ${now - tick.ts}ms old`);
      return false;
    }
    
    if (Math.abs(tick.ts - now) > MAX_CLOCK_SKEW_MS) {
      console.warn(`Rejecting clock-skewed tick: ${Math.abs(tick.ts - now)}ms skew`);
      return false;
    }

    const sym = this.normalizeSymbol(tick.symbol);
    if (!sym) {
      console.warn(`Unknown symbol: ${tick.symbol}`);
      return false;
    }

    // Basic sanity checks
    if (tick.bid <= 0 || tick.ask <= 0 || tick.ask <= tick.bid) {
      console.warn(`Invalid bid/ask: ${tick.bid}/${tick.ask}`);
      return false;
    }

    this.recent[sym] = (this.recent[sym] || []).filter(t => now - t.ts < MAX_STALE_MS);
    this.recent[sym].push({ ...tick, symbol: sym });
    this.lastHeartbeat[tick.src] = now;
    
    return true;
  }

  getTruth(symbol: string, atrPips?: number): TruthQuote | null {
    const sym = this.normalizeSymbol(symbol);
    if (!sym) return null;

    const ticks = (this.recent[sym] || []).slice().sort((a,b) => b.ts - a.ts);
    if (ticks.length === 0) return null;

    // Take the most recent snapshot across sources
    const latestTs = Math.max(...ticks.map(t => t.ts));
    const fresh = ticks.filter(t => latestTs - t.ts < 500); // Tighten window to 500ms

    if (fresh.length < 2) {
      console.log(`Insufficient fresh quotes for ${sym}: ${fresh.length} sources`);
      return null; // Need quorum
    }

    const mids = fresh.map(t => (t.bid + t.ask) / 2);
    mids.sort((a,b) => a - b);

    // Trimmed mean to drop outliers
    const trim = Math.max(1, Math.floor(fresh.length * 0.15));
    const midsTrimmed = mids.slice(trim, mids.length - trim);
    const mid = midsTrimmed.reduce((a,b) => a + b, 0) / midsTrimmed.length;

    // Pick bid/ask by median of each
    const bids = fresh.map(t => t.bid).sort((a,b) => a - b);
    const asks = fresh.map(t => t.ask).sort((a,b) => a - b);
    const bid = bids[Math.floor(bids.length / 2)];
    const ask = asks[Math.floor(asks.length / 2)];

    const pipFactor = PIP_FACTORS[sym] ?? 10000;
    const driftPips = Math.max(
      ...fresh.map(t => Math.abs(((t.bid + t.ask)/2) - mid) * pipFactor)
    );

    // Spread sanity vs ATR (if provided)
    const spreadPips = (ask - bid) * pipFactor;
    const symbolInfo = SYMBOL_MAP[sym];
    const maxSpread = atrPips 
      ? Math.max(symbolInfo?.maxSpreadPips || 2.0, atrPips * MAX_SPREAD_PIPS_MULT_ATR)
      : symbolInfo?.maxSpreadPips || 3.0;

    let quality: TruthQuote['quality'] = 'GOLD';
    const maxDrift = atrPips 
      ? Math.max(0.6, 0.12 * atrPips) 
      : MAX_DRIFT_PIPS_DEFAULT;

    if (driftPips > maxDrift) quality = 'SILVER';
    if (spreadPips > maxSpread) quality = 'RED';

    const now = Date.now();
    const priceAge = now - latestTs;

    return { 
      symbol: sym, 
      bid: this.roundToTick(sym, bid), 
      ask: this.roundToTick(sym, ask), 
      mid: this.roundToTick(sym, mid), 
      spreadPips: Number(spreadPips.toFixed(1)), 
      quality, 
      driftPips: Number(driftPips.toFixed(1)), 
      sourcesUsed: fresh.length, 
      ts: latestTs,
      priceAge
    };
  }

  validateSignalPrices(
    symbol: string,
    entry: number,
    stopLoss: number,
    takeProfit: number,
    direction: 'BUY' | 'SELL',
    atrPips?: number
  ): PriceValidationResult {
    const truth = this.getTruth(symbol, atrPips);
    
    if (!truth) {
      return {
        valid: false,
        quality: 'RED',
        reasons: ['No truth quote available']
      };
    }

    const reasons: string[] = [];
    
    // Quality gate
    if (truth.quality !== 'GOLD') {
      reasons.push(`Price quality ${truth.quality} (drift: ${truth.driftPips} pips)`);
    }

    // Price age check
    if (truth.priceAge > MAX_STALE_MS) {
      reasons.push(`Stale price: ${truth.priceAge}ms old`);
    }

    // Spread validation
    const symbolInfo = SYMBOL_MAP[symbol];
    if (symbolInfo && truth.spreadPips > symbolInfo.maxSpreadPips) {
      reasons.push(`Spread too wide: ${truth.spreadPips} > ${symbolInfo.maxSpreadPips} pips`);
    }

    // Entry price validation (should be executable at current bid/ask)
    const executablePrice = direction === 'BUY' ? truth.ask : truth.bid;
    const entryDeviation = Math.abs(entry - executablePrice);
    const pipFactor = PIP_FACTORS[symbol] || 10000;
    const entryDeviationPips = entryDeviation * pipFactor;
    
    if (entryDeviationPips > 2.0) {
      reasons.push(`Entry price too far from executable: ${entryDeviationPips.toFixed(1)} pips`);
    }

    // SL/TP direction validation
    if (direction === 'BUY') {
      if (stopLoss >= entry) reasons.push('Stop loss must be below entry for BUY');
      if (takeProfit <= entry) reasons.push('Take profit must be above entry for BUY');
    } else {
      if (stopLoss <= entry) reasons.push('Stop loss must be above entry for SELL');
      if (takeProfit >= entry) reasons.push('Take profit must be below entry for SELL');
    }

    // Minimum SL distance
    const slDistance = Math.abs(entry - stopLoss) * pipFactor;
    const minSlDistance = Math.max(truth.spreadPips * 1.5, 8); // Minimum 8 pips or 1.5x spread
    
    if (slDistance < minSlDistance) {
      reasons.push(`Stop loss too tight: ${slDistance.toFixed(1)} < ${minSlDistance.toFixed(1)} pips`);
    }

    // Generate adjusted prices if needed
    let adjustedPrice: number | undefined;
    let adjustedSL: number | undefined;
    let adjustedTP: number | undefined;

    if (entryDeviationPips > 1.0) {
      adjustedPrice = this.roundToTick(symbol, executablePrice);
    }

    if (slDistance < minSlDistance) {
      const adjustment = (minSlDistance / pipFactor) * (direction === 'BUY' ? -1 : 1);
      adjustedSL = this.roundToTick(symbol, entry + adjustment);
    }

    const valid = reasons.length === 0 || (truth.quality === 'GOLD' && reasons.length <= 1);

    return {
      valid,
      quality: truth.quality,
      reasons,
      adjustedPrice,
      adjustedSL,
      adjustedTP
    };
  }

  // Utility methods
  toPips(symbol: string, priceDiff: number): number {
    const pipFactor = PIP_FACTORS[symbol] ?? 10000;
    return priceDiff * pipFactor;
  }

  roundToTick(symbol: string, price: number): number {
    const symbolInfo = SYMBOL_MAP[symbol];
    const tick = symbolInfo?.minTick ?? 0.00001;
    return Math.round(price / tick) * tick;
  }

  private normalizeSymbol(s: string): string | null {
    const normalized = s.replace(/[^A-Z]/g, '').toUpperCase();
    return SYMBOL_MAP[normalized] ? normalized : null;
  }

  private initializeHeartbeats(): void {
    const sources: QuoteSrc[] = ['BROKER', 'WEBHOOK', 'FALLBACK1', 'FALLBACK2'];
    const now = Date.now();
    sources.forEach(src => {
      this.lastHeartbeat[src] = now;
    });
  }

  // Monitoring methods
  getSourceHealth(): Record<QuoteSrc, { healthy: boolean; lastSeen: number; ageMs: number }> {
    const now = Date.now();
    const health: Record<QuoteSrc, { healthy: boolean; lastSeen: number; ageMs: number }> = {} as any;
    
    Object.entries(this.lastHeartbeat).forEach(([src, lastSeen]) => {
      const ageMs = now - lastSeen;
      health[src as QuoteSrc] = {
        healthy: ageMs < 5000, // 5 second threshold
        lastSeen,
        ageMs
      };
    });
    
    return health;
  }

  getSymbolStats(symbol: string): {
    tickCount: number;
    sources: QuoteSrc[];
    latestSpreadPips: number;
    avgDriftPips: number;
  } | null {
    const sym = this.normalizeSymbol(symbol);
    if (!sym) return null;

    const ticks = this.recent[sym] || [];
    if (ticks.length === 0) return null;

    const latest = ticks[ticks.length - 1];
    const pipFactor = PIP_FACTORS[sym] || 10000;
    const latestSpreadPips = (latest.ask - latest.bid) * pipFactor;

    const uniqueSources = [...new Set(ticks.map(t => t.src))];
    
    // Calculate average drift
    const mids = ticks.map(t => (t.bid + t.ask) / 2);
    const avgMid = mids.reduce((a, b) => a + b, 0) / mids.length;
    const drifts = mids.map(mid => Math.abs(mid - avgMid) * pipFactor);
    const avgDriftPips = drifts.reduce((a, b) => a + b, 0) / drifts.length;

    return {
      tickCount: ticks.length,
      sources: uniqueSources,
      latestSpreadPips: Number(latestSpreadPips.toFixed(1)),
      avgDriftPips: Number(avgDriftPips.toFixed(1))
    };
  }

  // Mock data injection for testing
  simulateMultiSourceTicks(symbol: string, basePrice: number, sourcesCount: number = 3): void {
    const now = Date.now();
    const sources: QuoteSrc[] = ['BROKER', 'WEBHOOK', 'FALLBACK1', 'FALLBACK2'];
    
    for (let i = 0; i < sourcesCount; i++) {
      const spread = 0.0001 + Math.random() * 0.0003; // 1-4 pip spread
      const priceVariation = (Math.random() - 0.5) * 0.0002; // ±2 pip variation
      const adjustedPrice = basePrice + priceVariation;
      
      this.ingest({
        src: sources[i],
        symbol,
        bid: adjustedPrice - spread / 2,
        ask: adjustedPrice + spread / 2,
        ts: now - Math.random() * 200 // Small time variation
      });
    }
  }

  // Integration helper for existing price feeds
  integrateExistingPriceFeed(
    symbol: string, 
    bid: number, 
    ask: number, 
    source: QuoteSrc = 'BROKER'
  ): boolean {
    return this.ingest({
      src: source,
      symbol,
      bid,
      ask,
      ts: Date.now()
    });
  }
}

export const priceTruthEngine = new PriceTruthEngine();

// Helper functions for signal engines
export function validateSignalWithTruth(
  symbol: string,
  entry: number,
  stopLoss: number,
  takeProfit: number,
  direction: 'BUY' | 'SELL',
  atrPips?: number
): { valid: boolean; truthQuote?: TruthQuote; validation?: PriceValidationResult; errors: string[] } {
  
  const truthQuote = priceTruthEngine.getTruth(symbol, atrPips);
  if (!truthQuote) {
    return { valid: false, errors: ['No price truth available'] };
  }

  const validation = priceTruthEngine.validateSignalPrices(
    symbol, entry, stopLoss, takeProfit, direction, atrPips
  );

  return {
    valid: validation.valid && truthQuote.quality === 'GOLD',
    truthQuote,
    validation,
    errors: validation.reasons
  };
}

export function adjustSignalPricesForTruth(
  signal: {
    symbol: string;
    entry: number;
    stopLoss: number;
    takeProfit: number;
    direction: 'BUY' | 'SELL';
  },
  atrPips?: number
): {
  adjusted: boolean;
  originalSignal: typeof signal;
  adjustedSignal: typeof signal;
  adjustments: string[];
} {
  
  const validation = priceTruthEngine.validateSignalPrices(
    signal.symbol, 
    signal.entry, 
    signal.stopLoss, 
    signal.takeProfit, 
    signal.direction, 
    atrPips
  );

  const adjustments: string[] = [];
  const adjustedSignal = { ...signal };

  if (validation.adjustedPrice) {
    adjustedSignal.entry = validation.adjustedPrice;
    adjustments.push(`Entry adjusted to executable price: ${validation.adjustedPrice.toFixed(5)}`);
  }

  if (validation.adjustedSL) {
    adjustedSignal.stopLoss = validation.adjustedSL;
    adjustments.push(`Stop loss adjusted for minimum distance: ${validation.adjustedSL.toFixed(5)}`);
  }

  if (validation.adjustedTP) {
    adjustedSignal.takeProfit = validation.adjustedTP;
    adjustments.push(`Take profit adjusted: ${validation.adjustedTP.toFixed(5)}`);
  }

  return {
    adjusted: adjustments.length > 0,
    originalSignal: signal,
    adjustedSignal,
    adjustments
  };
}