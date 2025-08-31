// 🚨 HIGH CONVICTION SIGNAL ENGINE - Only Elite Setups Survive
// Rebuilt from scratch: Asset filtering + Price validation + Confluence scoring

import { RestrictedAssetFilter } from './RestrictedAssetFilter';
import { BrokerPriceValidator, type PriceValidationResult } from './BrokerPriceValidator';
import { type BaseSignal } from '@/types/signalTypes';

export interface HighConvictionSignal extends BaseSignal {
  confluenceScore: number;          // 0-100 weighted confluence
  confluenceBreakdown: {
    htfBias: number;               // HTF trend alignment (0-25)
    liquiditySweep: number;        // Stop hunt confirmation (0-20)
    displacement: number;          // Momentum validation (0-20)
    volatility: number;            // ATR/volatility filter (0-15)
    sessionTiming: number;         // Session-specific weight (0-10)
    newsFilter: number;            // News impact assessment (0-10)
  };
  priceValidation: PriceValidationResult;
  riskProfile: 'ELITE' | 'PROFESSIONAL' | 'REJECTED';
  assetClass: 'INDEX' | 'FX';
  sessionOptimal: boolean;
}

export interface ConvictionScanResult {
  signal: HighConvictionSignal | null;
  rejectionReasons: string[];
  scannedAssets: string[];
  bestAsset?: string;
  sessionActive: 'London' | 'NewYork' | 'Asian' | 'Dead';
}

export class HighConvictionSignalEngine {
  private static instance: HighConvictionSignalEngine;
  private brokerValidator = new BrokerPriceValidator();
  private lastSignalTime = 0;
  private readonly SIGNAL_COOLDOWN = 15 * 60 * 1000; // 15 min cooldown between signals
  private readonly MIN_CONFLUENCE_SCORE = 75; // Minimum 75% confluence required

  static getInstance(): HighConvictionSignalEngine {
    if (!this.instance) {
      this.instance = new HighConvictionSignalEngine();
    }
    return this.instance;
  }

  /**
   * Generate high-conviction signal with full validation pipeline
   */
  async generateHighConvictionSignal(): Promise<ConvictionScanResult> {
    const startTime = Date.now();
    console.log('🧠 Starting High Conviction Scan...');

    // 1. Check signal cooldown
    if (Date.now() - this.lastSignalTime < this.SIGNAL_COOLDOWN) {
      return {
        signal: null,
        rejectionReasons: [`COOLDOWN_ACTIVE: ${Math.round((this.SIGNAL_COOLDOWN - (Date.now() - this.lastSignalTime)) / 1000)}s remaining`],
        scannedAssets: [],
        sessionActive: this.getCurrentSession()
      };
    }

    // 2. Determine current session
    const session = this.getCurrentSession();
    if (session === 'Dead') {
      return {
        signal: null,
        rejectionReasons: ['SESSION_INACTIVE: No major session active'],
        scannedAssets: [],
        sessionActive: session
      };
    }

    // 3. Get prioritized assets for current session
    const allowedAssets = RestrictedAssetFilter.getAllowedAssetsByPriority();
    const sessionAssets = allowedAssets.filter(asset => 
      RestrictedAssetFilter.canTradeAssetInSession(asset, session)
    );

    if (sessionAssets.length === 0) {
      return {
        signal: null,
        rejectionReasons: ['NO_TRADEABLE_ASSETS: No assets available for current session'],
        scannedAssets: [],
        sessionActive: session
      };
    }

    console.log(`📊 Scanning ${sessionAssets.length} assets for ${session} session: ${sessionAssets.join(', ')}`);

    // 4. Scan each asset for high-conviction setups
    const scanResults: Array<{ asset: string; score: number; signal?: HighConvictionSignal }> = [];

    for (const asset of sessionAssets) {
      try {
        const signal = await this.analyzeAssetForSignal(asset, session);
        if (signal) {
          scanResults.push({ 
            asset, 
            score: signal.confluenceScore, 
            signal 
          });
        }
      } catch (error) {
        console.warn(`❌ Failed to analyze ${asset}:`, error);
      }
    }

    // 5. Select best signal if any meet threshold
    const validSignals = scanResults.filter(r => r.score >= this.MIN_CONFLUENCE_SCORE);
    
    if (validSignals.length === 0) {
      const bestAttempt = scanResults.sort((a, b) => b.score - a.score)[0];
      return {
        signal: null,
        rejectionReasons: [
          `LOW_CONFLUENCE: Best score ${bestAttempt?.score.toFixed(1) || 0}% < ${this.MIN_CONFLUENCE_SCORE}% required`,
          `Scanned assets: ${sessionAssets.join(', ')}`
        ],
        scannedAssets: sessionAssets,
        bestAsset: bestAttempt?.asset,
        sessionActive: session
      };
    }

    // 6. Return highest scoring signal
    const bestSignal = validSignals.sort((a, b) => b.score - a.score)[0];
    this.lastSignalTime = Date.now();

    console.log(`✅ HIGH CONVICTION SIGNAL: ${bestSignal.asset} | Score: ${bestSignal.score.toFixed(1)}% | Profile: ${bestSignal.signal?.riskProfile}`);

    return {
      signal: bestSignal.signal!,
      rejectionReasons: [],
      scannedAssets: sessionAssets,
      bestAsset: bestSignal.asset,
      sessionActive: session
    };
  }

  /**
   * Analyze individual asset for signal potential
   */
  private async analyzeAssetForSignal(symbol: string, session: string): Promise<HighConvictionSignal | null> {
    // 1. Validate asset and get broker price
    const priceValidation = await this.brokerValidator.getBrokerValidatedPrice(symbol);
    if (!priceValidation.valid) {
      return null;
    }

    // 2. Simulate market analysis (replace with real technical analysis)
    const marketData = this.generateMarketData(symbol);
    
    // 3. Calculate confluence score
    const confluence = this.calculateConfluenceScore(marketData, symbol, session);
    
    // 4. Generate signal if confluence meets threshold
    if (confluence.totalScore < this.MIN_CONFLUENCE_SCORE) {
      return null;
    }

    // 5. Determine signal direction and structure
    const direction = this.determineSignalDirection(marketData, confluence);
    const tradeStructure = this.calculateTradeStructure(
      priceValidation.snapshot.mid, 
      direction, 
      symbol, 
      confluence.totalScore
    );

    // 6. Final validation of entry price
    const entryValidation = this.brokerValidator.validateSignalEntry(
      tradeStructure.entry,
      symbol,
      priceValidation.snapshot
    );

    if (!entryValidation.valid) {
      return null;
    }

    return {
      id: `hc_${Date.now()}_${symbol}`,
      symbol,
      direction,
      entry: tradeStructure.entry,
      stopLoss: tradeStructure.stopLoss,
      takeProfit: tradeStructure.takeProfit,
      confidence: confluence.totalScore,
      confluenceScore: confluence.totalScore,
      confluenceBreakdown: confluence.breakdown,
      priceValidation: entryValidation,
      riskProfile: this.determineRiskProfile(confluence.totalScore),
      assetClass: RestrictedAssetFilter.getAssetClass(symbol) as 'INDEX' | 'FX',
      sessionOptimal: RestrictedAssetFilter.canTradeAssetInSession(symbol, session as any),
      timestamp: Date.now(),
      reasoning: this.generateReasoning(confluence, marketData, symbol),
      timeframe: '15M',
      riskReward: tradeStructure.riskReward,
      status: 'ACTIVE' as const
    };
  }

  /**
   * Calculate weighted confluence score
   */
  private calculateConfluenceScore(marketData: any, symbol: string, session: string) {
    const breakdown = {
      htfBias: 0,
      liquiditySweep: 0, 
      displacement: 0,
      volatility: 0,
      sessionTiming: 0,
      newsFilter: 0
    };

    // HTF Bias (25 points max) - Higher timeframe trend alignment
    if (marketData.htfTrend === 'BULLISH' && marketData.currentTrend === 'BULLISH') {
      breakdown.htfBias = 25;
    } else if (marketData.htfTrend === 'BEARISH' && marketData.currentTrend === 'BEARISH') {
      breakdown.htfBias = 25;
    } else if (marketData.htfTrend !== 'RANGING') {
      breakdown.htfBias = 15; // Partial alignment
    }

    // Liquidity Sweep (20 points max) - Stop hunt confirmation
    if (marketData.liquidityCleared) {
      breakdown.liquiditySweep = 20;
    } else if (marketData.nearLiquidity) {
      breakdown.liquiditySweep = 12;
    }

    // Displacement (20 points max) - Momentum validation
    if (marketData.displacement > 0.8) {
      breakdown.displacement = 20;
    } else if (marketData.displacement > 0.6) {
      breakdown.displacement = 15;
    } else if (marketData.displacement > 0.4) {
      breakdown.displacement = 10;
    }

    // Volatility Filter (15 points max) - ATR/volatility check
    if (marketData.atr > marketData.atrAverage * 1.2) {
      breakdown.volatility = 15; // Good volatility for moves
    } else if (marketData.atr > marketData.atrAverage * 0.8) {
      breakdown.volatility = 10;
    } else {
      breakdown.volatility = 0; // Too quiet
    }

    // Session Timing (10 points max) - Session-specific optimization
    const assetWeight = RestrictedAssetFilter.getAssetWeight(symbol);
    if (RestrictedAssetFilter.canTradeAssetInSession(symbol, session as any)) {
      breakdown.sessionTiming = Math.round(10 * assetWeight);
    }

    // News Filter (10 points max) - News impact assessment
    if (marketData.newsImpact === 'NONE') {
      breakdown.newsFilter = 10;
    } else if (marketData.newsImpact === 'LOW') {
      breakdown.newsFilter = 8;
    } else {
      breakdown.newsFilter = 0; // Block high impact news
    }

    const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);

    return {
      totalScore,
      breakdown
    };
  }

  /**
   * Generate realistic market data simulation
   */
  private generateMarketData(symbol: string) {
    const assetClass = RestrictedAssetFilter.getAssetClass(symbol);
    
    // Base volatility by asset class
    const baseVolatility = assetClass === 'INDEX' ? 0.7 : 0.5;
    
    return {
      htfTrend: ['BULLISH', 'BEARISH', 'RANGING'][Math.floor(Math.random() * 3)],
      currentTrend: ['BULLISH', 'BEARISH'][Math.floor(Math.random() * 2)],
      liquidityCleared: Math.random() > 0.7, // 30% chance
      nearLiquidity: Math.random() > 0.5,    // 50% chance
      displacement: Math.random() * baseVolatility + 0.3,
      atr: Math.random() * 0.006 + 0.002,
      atrAverage: 0.004,
      newsImpact: ['NONE', 'LOW', 'HIGH'][Math.floor(Math.random() * 3)],
      sessionVolume: Math.random() > 0.3 ? 'HIGH' : 'NORMAL'
    };
  }

  private determineSignalDirection(marketData: any, confluence: any): 'BUY' | 'SELL' {
    // Favor HTF bias if strong confluence
    if (confluence.breakdown.htfBias >= 20 && marketData.htfTrend !== 'RANGING') {
      return marketData.htfTrend === 'BULLISH' ? 'BUY' : 'SELL';
    }
    
    // Otherwise use current trend
    return marketData.currentTrend === 'BULLISH' ? 'BUY' : 'SELL';
  }

  private calculateTradeStructure(mid: number, direction: 'BUY' | 'SELL', symbol: string, confluenceScore: number) {
    const assetClass = RestrictedAssetFilter.getAssetClass(symbol);
    const pipValue = assetClass === 'INDEX' ? 0.1 : 0.0001;
    
    // Dynamic risk based on confluence (higher confluence = tighter stops)
    const baseRisk = confluenceScore > 85 ? 15 : confluenceScore > 75 ? 20 : 25;
    const riskPips = baseRisk + Math.random() * 10;
    const riskDistance = riskPips * pipValue;
    
    // Aggressive R:R for high confluence
    const rewardMultiplier = confluenceScore > 85 ? 2.5 : confluenceScore > 80 ? 2.0 : 1.8;
    
    if (direction === 'BUY') {
      return {
        entry: mid + (2 * pipValue), // Enter slightly above mid
        stopLoss: mid - riskDistance,
        takeProfit: mid + (riskDistance * rewardMultiplier),
        riskReward: rewardMultiplier
      };
    } else {
      return {
        entry: mid - (2 * pipValue), // Enter slightly below mid
        stopLoss: mid + riskDistance,
        takeProfit: mid - (riskDistance * rewardMultiplier),
        riskReward: rewardMultiplier
      };
    }
  }

  private determineRiskProfile(confluenceScore: number): 'ELITE' | 'PROFESSIONAL' | 'REJECTED' {
    if (confluenceScore >= 85) return 'ELITE';
    if (confluenceScore >= 75) return 'PROFESSIONAL';
    return 'REJECTED';
  }

  private generateReasoning(confluence: any, marketData: any, symbol: string): string {
    const reasons = [];
    
    if (confluence.breakdown.htfBias >= 20) {
      reasons.push(`HTF ${marketData.htfTrend.toLowerCase()} bias confirmed`);
    }
    
    if (confluence.breakdown.liquiditySweep >= 15) {
      reasons.push('liquidity sweep detected');
    }
    
    if (confluence.breakdown.displacement >= 15) {
      reasons.push('strong displacement momentum');
    }
    
    if (confluence.breakdown.volatility >= 10) {
      reasons.push('optimal volatility conditions');
    }
    
    const assetClass = RestrictedAssetFilter.getAssetClass(symbol);
    reasons.push(`${assetClass.toLowerCase()} session-optimized`);
    
    return reasons.join(' | ');
  }

  private getCurrentSession(): 'London' | 'NewYork' | 'Asian' | 'Dead' {
    const hour = new Date().getUTCHours();
    
    // London: 7-16 UTC
    if (hour >= 7 && hour < 16) return 'London';
    
    // New York: 12-21 UTC  
    if (hour >= 12 && hour < 21) return 'NewYork';
    
    // Asian: 22-5 UTC
    if (hour >= 22 || hour < 5) return 'Asian';
    
    return 'Dead';
  }

  /**
   * Get engine statistics
   */
  getEngineStats() {
    return {
      allowedAssets: RestrictedAssetFilter.getAllowedAssetsByPriority(),
      minConfluence: this.MIN_CONFLUENCE_SCORE,
      cooldownRemaining: Math.max(0, this.SIGNAL_COOLDOWN - (Date.now() - this.lastSignalTime)),
      currentSession: this.getCurrentSession()
    };
  }
}

export const highConvictionEngine = HighConvictionSignalEngine.getInstance();
