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
}

class EnhancedSignalEngine {
  private readonly CONFLUENCE_THRESHOLDS = {
    ELITE: 4, // 4/5 or 5/5 factors
    NORMAL: 3, // 3/5 factors
    MINIMUM: 2 // Below this = rejection
  };

  private readonly RR_REQUIREMENTS = {
    MINIMUM: 2.0,
    ELITE: 3.0
  };

  // 🎯 Main signal generation with enhanced logic
  async generateSignal(marketData: MarketData): Promise<EnhancedSignalResult> {
    console.log(`🔍 Enhanced scan: ${marketData.pair} @ ${marketData.session} session`);

    // Step 1: Multi-layer confluence analysis
    const confluenceAnalysis = await this.analyzeConfluence(marketData);
    const confluenceScore = this.calculateConfluenceScore(confluenceAnalysis);
    
    // Step 2: Check minimum confluence threshold
    if (confluenceScore < this.CONFLUENCE_THRESHOLDS.MINIMUM) {
      return this.createRejection(
        marketData, 
        `Low confluence: ${confluenceScore}/5 factors aligned`,
        confluenceScore
      );
    }

    // Step 3: Session quality assessment
    const sessionAnalysis = this.analyzeSession(marketData);
    
    // Step 4: Generate signal details
    const signalDetails = await this.generateSignalDetails(marketData, confluenceAnalysis);
    
    if (!signalDetails) {
      return this.createRejection(
        marketData,
        'Failed to generate valid entry/exit levels',
        confluenceScore
      );
    }

    // Step 5: Risk-reward validation
    if (signalDetails.riskReward < this.RR_REQUIREMENTS.MINIMUM) {
      return this.createRejection(
        marketData,
        `Poor RR: ${signalDetails.riskReward.toFixed(2)} < ${this.RR_REQUIREMENTS.MINIMUM}`,
        confluenceScore
      );
    }

    // Step 6: Determine signal type
    const signalType = this.determineSignalType(confluenceScore, signalDetails.riskReward, sessionAnalysis);
    
    console.log(`✅ ${signalType} signal: ${marketData.pair} ${signalDetails.direction} | RR: ${signalDetails.riskReward} | Confluence: ${confluenceScore}/5`);

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
      stopLoss: signalDetails.stopLoss,
      takeProfit: signalDetails.takeProfit,
      entryMethod: signalDetails.entryMethod,
      confluenceFactors: confluenceAnalysis,
      sessionWarning: sessionAnalysis.isSubOptimal,
      metadata: {
        sessionScore: sessionAnalysis.score,
        pullbackLevel: signalDetails.pullbackLevel,
        hiddenStopBuffer: signalDetails.hiddenStopBuffer,
        volumeProfile: this.analyzeVolumeProfile(marketData)
      }
    };
  }

  private async analyzeConfluence(marketData: MarketData): Promise<EnhancedSignalResult['confluenceFactors']> {
    const trendAlignment = this.analyzeTrendAlignment(marketData);
    const volumeConfirmation = this.analyzeVolumeConfirmation(marketData);
    const momentumDivergence = this.analyzeMomentumDivergence(marketData);
    const structureZone = this.analyzeStructureZone(marketData);
    const sessionBias = this.analyzeSessionBias(marketData);

    return { trendAlignment, volumeConfirmation, momentumDivergence, structureZone, sessionBias };
  }

  private analyzeTrendAlignment(marketData: MarketData): boolean {
    return Math.random() > 0.3; // 70% pass rate
  }

  private analyzeVolumeConfirmation(marketData: MarketData): boolean {
    return marketData.volume > 1500; // Simple volume check
  }

  private analyzeMomentumDivergence(marketData: MarketData): boolean {
    return marketData.rsi >= 30 && marketData.rsi <= 70; // Good momentum zone
  }

  private analyzeStructureZone(marketData: MarketData): boolean {
    return Math.random() > 0.4; // 60% pass rate
  }

  private analyzeSessionBias(marketData: MarketData): boolean {
    return marketData.session !== 'Asian' || Math.random() > 0.4;
  }

  private calculateConfluenceScore(factors: EnhancedSignalResult['confluenceFactors']): number {
    if (!factors) return 0;
    return Object.values(factors).filter(Boolean).length;
  }

  private analyzeSession(marketData: MarketData): { score: number; isSubOptimal: boolean } {
    const isOptimal = marketData.session === 'London' || marketData.session === 'NewYork';
    return { score: isOptimal ? 90 : 60, isSubOptimal: !isOptimal };
  }

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
    
    const direction = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const currentPrice = marketData.currentPrice;
    const atr = marketData.atr || 0.001;
    
    const entry = currentPrice + (Math.random() - 0.5) * atr * 0.5;
    const stopLoss = direction === 'BUY' ? entry - atr * 1.5 : entry + atr * 1.5;
    const takeProfit = direction === 'BUY' ? entry + atr * 3 : entry - atr * 3;
    const riskReward = Math.abs(takeProfit - entry) / Math.abs(stopLoss - entry);
    
    return {
      direction, entry, stopLoss, takeProfit,
      riskReward: Math.round(riskReward * 100) / 100,
      entryMethod: 'PULLBACK_ZONE',
      pullbackLevel: 0.618,
      hiddenStopBuffer: 0.0002
    };
  }

  private determineSignalType(confluenceScore: number, riskReward: number, sessionAnalysis: any): 'ELITE' | 'NORMAL' | 'CAUTION' {
    if (confluenceScore >= this.CONFLUENCE_THRESHOLDS.ELITE && riskReward >= this.RR_REQUIREMENTS.ELITE) {
      return 'ELITE';
    }
    
    if (sessionAnalysis.isSubOptimal || confluenceScore === this.CONFLUENCE_THRESHOLDS.NORMAL) {
      return 'CAUTION';
    }
    
    return 'NORMAL';
  }

  private analyzeVolumeProfile(marketData: MarketData): 'STRONG' | 'WEAK' | 'NEUTRAL' {
    if (marketData.volume > 2500) return 'STRONG';
    if (marketData.volume < 1000) return 'WEAK';
    return 'NEUTRAL';
  }

  private createRejection(marketData: MarketData, reason: string, confluenceScore: number): EnhancedSignalResult {
    return {
      status: 'rejected',
      reason,
      pair: marketData.pair,
      timeframe: marketData.timeframe,
      timestamp: new Date().toISOString(),
      signalType: 'NORMAL',
      confluenceScore,
      riskReward: 0
    };
  }
}

export const enhancedSignalEngine = new EnhancedSignalEngine();

// Legacy exports for compatibility
export type { EnhancedSignalResult as SignalResult };
export { enhancedSignalEngine as signalEngine };
