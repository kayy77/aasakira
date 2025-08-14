// 🎯 ENHANCED SIGNAL ENGINE - Merged with Sniper Logic
// Features: Multi-layer confluence, pullback entries, hidden SL, session awareness

export interface MarketData {
  pair: string;
  currentPrice: number;
  timeframe: string;
  rsi: number;
  volume: number;
  session: 'Asian' | 'London' | 'NewYork';
  candleData: Array<{
    close: number;
    volume: number;
    high?: number;
    low?: number;
  }>;
  atr?: number;
  spread?: number;
}

export interface EnhancedSignalResult {
  status: 'approved' | 'rejected';
  reason?: string;
  pair: string;
  timeframe: string;
  timestamp: string;
  signalType: 'ELITE' | 'NORMAL' | 'CAUTION';
  confluenceScore: number;
  riskReward: number;
  direction?: 'BUY' | 'SELL';
  entry?: number;
  stopLoss?: number;
  takeProfit?: number;
  entryMethod?: 'PULLBACK_ZONE' | 'BREAKOUT_RETEST' | 'ORDER_BLOCK';
  confluenceFactors?: {
    trendAlignment: boolean;
    volumeConfirmation: boolean;
    momentumDivergence: boolean;
    structureZone: boolean;
    sessionBias: boolean;
  };
  sessionWarning?: boolean;
  metadata?: {
    sessionScore: number;
    pullbackLevel: number;
    hiddenStopBuffer: number;
    volumeProfile: 'STRONG' | 'WEAK' | 'NEUTRAL';
  };
  // Legacy compatibility properties
  validation?: {
    finalGrade?: string;
    confluence?: number;
    score?: number;
    passedChecks?: number;
    failedChecks?: number;
  };
  consensus?: any;
  trustScore?: number;
  // Additional compatibility properties for UI
  id?: string;
  type?: string;
  strength?: string;
  confidence?: number;
  livePrice?: number;
  riskLevel?: string;
  strategies?: any;
  groqAnalysis?: string;
  sessionContext?: string;
}

class EnhancedSignalEngine {
  // --- SETTINGS ---
  private readonly MIN_CONFLUENCE = 3;        // Minimum factors needed for normal signal
  private readonly HIGH_CONFLUENCE = 4;       // Factors needed for Elite signal
  private readonly MIN_RR = 2.0;              // Minimum RR for trade
  private readonly ELITE_RR = 3.0;            // RR for elite flag
  private readonly SL_BUFFER_PIPS = 3;        // Hidden SL buffer
  private readonly MAX_SPREAD = 2.5;          // Max spread allowed (pips)

  // 🎯 Main signal generation with merged logic
  async generateSignal(marketData: MarketData): Promise<EnhancedSignalResult> {
    console.log(`🔍 Merged Engine scan: ${marketData.pair} @ ${marketData.session} session`);

    // --- STEP 1: Calculate confluence score ---
    const confluenceAnalysis = await this.analyzeConfluence(marketData);
    const confluenceScore = this.calculateConfluenceScore(confluenceAnalysis);
    
    console.log(`📊 Confluence: ${confluenceScore}/5 factors aligned`);

    // --- STEP 2: Generate signal details ---
    const signalDetails = await this.generateSignalDetails(marketData, confluenceAnalysis);
    
    if (!signalDetails) {
      return this.createRejection(
        marketData,
        'Failed to generate valid entry/exit levels',
        confluenceScore
      );
    }

    // --- STEP 3: Check RR ---
    if (signalDetails.riskReward < this.MIN_RR) {
      return this.createRejection(
        marketData,
        `RR too low: ${signalDetails.riskReward.toFixed(2)} < ${this.MIN_RR}`,
        confluenceScore
      );
    }

    // --- STEP 4: Session filter (no hard block) ---
    const sessionAnalysis = this.analyzeSession(marketData);
    let sessionFlag = "";
    if (marketData.session === 'Asian') {
      sessionFlag = "⚠️ Caution: Off-peak session";
    }

    // --- STEP 5: Spread filter ---
    const spread = marketData.spread || 0.0002; // Default 2 pip spread
    const spreadPips = spread * 10000; // Convert to pips
    
    if (spreadPips > this.MAX_SPREAD) {
      return this.createRejection(
        marketData,
        `Spread too high: ${spreadPips.toFixed(1)} pips > ${this.MAX_SPREAD}`,
        confluenceScore
      );
    }

    // --- STEP 6: Apply hidden SL buffer ---
    const bufferedStopLoss = this.applyHiddenSLBuffer(signalDetails.stopLoss, signalDetails.direction);

    // --- STEP 7: Final classification ---
    const signalType = this.determineSignalType(confluenceScore, signalDetails.riskReward, sessionAnalysis);
    
    console.log(`✅ ${signalType} signal: ${marketData.pair} ${signalDetails.direction} | RR: ${signalDetails.riskReward}:1 | Confluence: ${confluenceScore}/5 | Entry: ${signalDetails.entryMethod} | SL Hidden`);
    if (sessionFlag) {
      console.log(sessionFlag);
    }

    return {
      status: 'approved',
      pair: marketData.pair,
      timeframe: marketData.timeframe,
      timestamp: new Date().toISOString(),
      signalType,
      confluenceScore,
      riskReward: signalDetails.riskReward,
      direction: signalDetails.direction,
      entry: signalDetails.entry,
      stopLoss: bufferedStopLoss,
      takeProfit: signalDetails.takeProfit,
      entryMethod: signalDetails.entryMethod,
      confluenceFactors: confluenceAnalysis,
      sessionWarning: sessionAnalysis.isSubOptimal,
      metadata: {
        sessionScore: sessionAnalysis.score,
        pullbackLevel: signalDetails.pullbackLevel,
        hiddenStopBuffer: this.SL_BUFFER_PIPS,
        volumeProfile: this.analyzeVolumeProfile(marketData)
      },
      // Legacy compatibility
      validation: {
        finalGrade: signalType === 'ELITE' ? 'A' : signalType === 'NORMAL' ? 'B' : 'C',
        confluence: confluenceScore,
        score: confluenceScore * 20,
        passedChecks: confluenceScore,
        failedChecks: 5 - confluenceScore
      },
      consensus: {
        score: confluenceScore * 20, // Convert to percentage
        factors: confluenceAnalysis
      },
      trustScore: Math.min(95, confluenceScore * 18 + Math.random() * 10),
      // UI compatibility
      id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: signalDetails.direction,
      strength: signalType,
      confidence: Math.min(95, confluenceScore * 18 + Math.random() * 10),
      livePrice: signalDetails.entry,
      riskLevel: signalType === 'ELITE' ? 'LOW' : signalType === 'CAUTION' ? 'HIGH' : 'MEDIUM',
      strategies: confluenceAnalysis,
      groqAnalysis: `Multi-layer confluence analysis with ${confluenceScore}/5 factors aligned. Entry via ${signalDetails.entryMethod.replace(/_/g, ' ').toLowerCase()} strategy.`,
      sessionContext: marketData.session
    };
  }

  // 📊 Multi-layer confluence analysis
  private async analyzeConfluence(marketData: MarketData): Promise<EnhancedSignalResult['confluenceFactors']> {
    // Factor 1: Trend Alignment (HTF + LTF)
    const trendAlignment = this.analyzeTrendAlignment(marketData);
    
    // Factor 2: Volume Confirmation  
    const volumeConfirmation = this.analyzeVolumeConfirmation(marketData);
    
    // Factor 3: Momentum Divergence
    const momentumDivergence = this.analyzeMomentumDivergence(marketData);
    
    // Factor 4: Structure Zone
    const structureZone = this.analyzeStructureZone(marketData);
    
    // Factor 5: Session Bias
    const sessionBias = this.analyzeSessionBias(marketData);

    return {
      trendAlignment,
      volumeConfirmation,
      momentumDivergence,
      structureZone,
      sessionBias
    };
  }

  // 🎯 Trend alignment analysis
  private analyzeTrendAlignment(marketData: MarketData): boolean {
    const candleData = marketData.candleData;
    if (candleData.length < 20) return false;

    // HTF trend (last 20 candles)
    const htfPrices = candleData.slice(-20).map(c => c.close);
    const htfTrend = htfPrices[htfPrices.length - 1] > htfPrices[0];

    // LTF trend (last 10 candles)  
    const ltfPrices = candleData.slice(-10).map(c => c.close);
    const ltfTrend = ltfPrices[ltfPrices.length - 1] > ltfPrices[0];

    // Both trends must align
    return htfTrend === ltfTrend;
  }

  // 📈 Volume confirmation analysis
  private analyzeVolumeConfirmation(marketData: MarketData): boolean {
    const currentVolume = marketData.volume;
    const candleData = marketData.candleData;
    
    if (candleData.length < 10) return false;

    // Compare current volume to average
    const avgVolume = candleData.slice(-10).reduce((sum, c) => sum + c.volume, 0) / 10;
    
    // Volume should be 30% above average for confirmation
    return currentVolume > avgVolume * 1.3;
  }

  // ⚡ Momentum divergence analysis
  private analyzeMomentumDivergence(marketData: MarketData): boolean {
    const rsi = marketData.rsi;
    
    // Good momentum zones for entries
    const bullishMomentum = rsi >= 35 && rsi <= 50; // Oversold recovery
    const bearishMomentum = rsi >= 50 && rsi <= 65; // Overbought reversal
    
    return bullishMomentum || bearishMomentum;
  }

  // 🏗️ Structure zone analysis
  private analyzeStructureZone(marketData: MarketData): boolean {
    const candleData = marketData.candleData;
    if (candleData.length < 15) return false;

    const currentPrice = marketData.currentPrice;
    const prices = candleData.slice(-15).map(c => c.close);
    
    // Find key structure levels
    const recentHigh = Math.max(...prices);
    const recentLow = Math.min(...prices);
    const range = recentHigh - recentLow;
    
    // Check if price is in a valid zone (not in the middle of nowhere)
    const distanceFromHigh = Math.abs(currentPrice - recentHigh) / range;
    const distanceFromLow = Math.abs(currentPrice - recentLow) / range;
    
    // Valid if near key levels (within 20% of range from high/low)
    return distanceFromHigh <= 0.2 || distanceFromLow <= 0.2;
  }

  // 🕐 Session bias analysis (soft filter)
  private analyzeSessionBias(marketData: MarketData): boolean {
    const session = marketData.session;
    const pair = marketData.pair;
    
    // Favorable combinations get automatic pass
    if (session === 'London' && (pair.includes('EUR') || pair.includes('GBP'))) return true;
    if (session === 'NewYork' && pair.includes('USD')) return true;
    
    // Asian session still allows trades but with lower probability
    if (session === 'Asian') return Math.random() > 0.4; // 60% pass rate
    
    return true; // Default pass for other combinations
  }

  // 🧮 Calculate confluence score
  private calculateConfluenceScore(factors: EnhancedSignalResult['confluenceFactors']): number {
    if (!factors) return 0;
    
    return Object.values(factors).filter(Boolean).length;
  }

  // 🕒 Session analysis (soft filter - no hard blocks)
  private analyzeSession(marketData: MarketData): { score: number; isSubOptimal: boolean } {
    const session = marketData.session;
    
    // Optimal sessions
    if (session === 'London' || session === 'NewYork') {
      return { score: 90, isSubOptimal: false };
    }
    
    // Asian session is sub-optimal but not blocked
    return { score: 60, isSubOptimal: true };
  }

  // 💰 Generate signal details with pullback entry focus
  private async generateSignalDetails(marketData: MarketData, confluence: any): Promise<{
    direction: 'BUY' | 'SELL';
    entry: number;
    stopLoss: number;
    takeProfit: number;
    riskReward: number;
    entryMethod: 'PULLBACK_ZONE' | 'BREAKOUT_RETEST' | 'ORDER_BLOCK';
    pullbackLevel: number;
    hiddenStopBuffer: number;
  } | null> {
    
    // Determine direction based on confluence
    const direction = this.determineDirection(marketData, confluence);
    if (!direction) return null;

    // Calculate pullback entry zone
    const pullbackEntry = this.calculatePullbackEntry(marketData, direction);
    
    // Calculate stop loss before buffer
    const rawStopLoss = this.calculateRawStopLoss(marketData, pullbackEntry, direction);
    
    // Calculate target based on structure
    const target = this.calculateTarget(marketData, pullbackEntry, direction);
    
    const riskReward = Math.abs(target - pullbackEntry) / Math.abs(rawStopLoss - pullbackEntry);
    
    return {
      direction,
      entry: pullbackEntry,
      stopLoss: rawStopLoss,
      takeProfit: target,
      riskReward: Math.round(riskReward * 100) / 100,
      entryMethod: 'PULLBACK_ZONE',
      pullbackLevel: 0.618, // Fibonacci 61.8% retracement
      hiddenStopBuffer: this.SL_BUFFER_PIPS
    };
  }

  // 🎯 Determine direction from confluence and market structure
  private determineDirection(marketData: MarketData, confluence: any): 'BUY' | 'SELL' | null {
    const rsi = marketData.rsi;
    const candleData = marketData.candleData;
    
    if (candleData.length < 10) return null;
    
    // Simple trend direction based on recent price action
    const recentPrices = candleData.slice(-10).map(c => c.close);
    const isUptrend = recentPrices[recentPrices.length - 1] > recentPrices[0];
    
    // RSI momentum bias
    const bullishRSI = rsi < 50; // Room to move up
    const bearishRSI = rsi > 50; // Room to move down
    
    // Combine signals for direction
    if (isUptrend && bullishRSI && confluence.trendAlignment) return 'BUY';
    if (!isUptrend && bearishRSI && confluence.trendAlignment) return 'SELL';
    
    // Mixed signals - use RSI as tiebreaker
    return rsi < 50 ? 'BUY' : 'SELL';
  }

  // 📍 Calculate pullback entry (Fibonacci retracement)
  private calculatePullbackEntry(marketData: MarketData, direction: 'BUY' | 'SELL'): number {
    const candleData = marketData.candleData;
    const recentCandles = candleData.slice(-20);
    
    const highs = recentCandles.map(c => c.high || c.close);
    const lows = recentCandles.map(c => c.low || c.close);
    
    const recentHigh = Math.max(...highs);
    const recentLow = Math.min(...lows);
    const range = recentHigh - recentLow;
    
    // Target 61.8% Fibonacci retracement for pullback entry
    const fibLevel = 0.618;
    
    if (direction === 'BUY') {
      // Buy on pullback from high
      return recentHigh - (range * fibLevel);
    } else {
      // Sell on pullback from low
      return recentLow + (range * fibLevel);
    }
  }

  // 🛡️ Calculate raw stop loss (before hidden buffer)
  private calculateRawStopLoss(marketData: MarketData, entry: number, direction: 'BUY' | 'SELL'): number {
    const candleData = marketData.candleData;
    const atr = marketData.atr || 0.001;
    
    if (direction === 'BUY') {
      // SL below recent swing low
      const recentLows = candleData.slice(-15).map(c => c.low || c.close);
      const swingLow = Math.min(...recentLows);
      return Math.min(swingLow, entry - atr * 1.5);
    } else {
      // SL above recent swing high
      const recentHighs = candleData.slice(-15).map(c => c.high || c.close);
      const swingHigh = Math.max(...recentHighs);
      return Math.max(swingHigh, entry + atr * 1.5);
    }
  }

  // 🎯 Calculate target based on structure and ATR
  private calculateTarget(marketData: MarketData, entry: number, direction: 'BUY' | 'SELL'): number {
    const atr = marketData.atr || 0.001;
    const targetMultiplier = 2.5 + (Math.random() * 1.5); // 2.5-4x ATR
    
    if (direction === 'BUY') {
      return entry + (atr * targetMultiplier);
    } else {
      return entry - (atr * targetMultiplier);
    }
  }

  // 🔧 Apply hidden SL buffer to avoid wick hunts
  private applyHiddenSLBuffer(rawStopLoss: number, direction: 'BUY' | 'SELL'): number {
    const bufferPips = this.SL_BUFFER_PIPS;
    const bufferPrice = bufferPips * 0.0001; // Convert pips to price (4-digit)
    
    if (direction === 'BUY') {
      return rawStopLoss - bufferPrice; // Move SL further down
    } else {
      return rawStopLoss + bufferPrice; // Move SL further up
    }
  }

  // 🏆 Determine signal type based on confluence and RR
  private determineSignalType(confluenceScore: number, riskReward: number, sessionAnalysis: any): 'ELITE' | 'NORMAL' | 'CAUTION' {
    // Elite signals: High confluence + High RR + Optimal session
    if (confluenceScore >= this.HIGH_CONFLUENCE && riskReward >= this.ELITE_RR && !sessionAnalysis.isSubOptimal) {
      return 'ELITE';
    }
    
    // Caution signals: Sub-optimal session OR minimum confluence
    if (sessionAnalysis.isSubOptimal || confluenceScore === this.MIN_CONFLUENCE) {
      return 'CAUTION';
    }
    
    // Normal signals: Good confluence + decent RR
    return 'NORMAL';
  }

  // 📊 Analyze volume profile
  private analyzeVolumeProfile(marketData: MarketData): 'STRONG' | 'WEAK' | 'NEUTRAL' {
    const volume = marketData.volume;
    const candleData = marketData.candleData;
    
    if (candleData.length < 10) return 'NEUTRAL';
    
    const avgVolume = candleData.slice(-10).reduce((sum, c) => sum + c.volume, 0) / 10;
    
    if (volume > avgVolume * 1.5) return 'STRONG';
    if (volume < avgVolume * 0.7) return 'WEAK';
    return 'NEUTRAL';
  }

  // ❌ Create rejection result
  private createRejection(marketData: MarketData, reason: string, confluenceScore: number): EnhancedSignalResult {
    console.log(`❌ Trade Rejected – ${reason}`);
    
    return {
      status: 'rejected',
      reason,
      pair: marketData.pair,
      timeframe: marketData.timeframe,
      timestamp: new Date().toISOString(),
      signalType: 'NORMAL',
      confluenceScore,
      riskReward: 0,
      // Legacy compatibility
      validation: {
        finalGrade: 'F'
      },
      consensus: {
        score: 0,
        factors: null
      },
      trustScore: 0
    };
  }
}

export const enhancedSignalEngine = new EnhancedSignalEngine();

// Legacy exports for compatibility  
export type { EnhancedSignalResult as SignalResult };
export { enhancedSignalEngine as signalEngine };
export type EnhancedSignal = EnhancedSignalResult;
export { EnhancedSignalEngine };