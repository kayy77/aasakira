// Fixed Signal Engine - Addresses NASDAQ missing, asset prioritization, and confidence overhaul
import { EnhancedMarketScanner } from './enhancedMarketScanner';
import { MultiAssetPrioritizer } from './multiAssetPrioritizer';
import { ConfidenceOverhaul, WeightedConfidenceResult } from './confidenceOverhaul';

export interface FixedSignalResult {
  status: 'approved' | 'rejected';
  symbol: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  confidence: WeightedConfidenceResult;
  reasoning: string;
  scanMetrics: {
    assetsScanned: number;
    assetsPassed: number;
    priorityAssets: string[];
  };
  timestamp: string;
}

export interface SignalFlowConfig {
  maxSignalsPerSession: number;
  minConfluenceBucket: number; // 0-6
  requireHTFAlignment: boolean;
  assetDiversification: boolean;
  onlyHighPerformers: boolean;
}

export class FixedSignalEngine {
  private static instance: FixedSignalEngine;
  private lastScanTime = 0;
  private readonly SCAN_COOLDOWN = 25000; // 25 seconds
  
  private readonly DEFAULT_CONFIG: SignalFlowConfig = {
    maxSignalsPerSession: 2, // Max 1-2 signals per session
    minConfluenceBucket: 3,  // Minimum 3/6 confluence required
    requireHTFAlignment: true,
    assetDiversification: true,
    onlyHighPerformers: false
  };

  private constructor() {}

  static getInstance(): FixedSignalEngine {
    if (!this.instance) {
      this.instance = new FixedSignalEngine();
    }
    return this.instance;
  }

  async generateRobustSignal(config: Partial<SignalFlowConfig> = {}): Promise<FixedSignalResult | null> {
    const now = Date.now();
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };

    // Prevent signal flooding - enforced cooldown
    if (now - this.lastScanTime < this.SCAN_COOLDOWN) {
      console.log('🚫 Signal cooldown active - preventing spam generation');
      return null;
    }

    console.log('🔍 Fixed Signal Engine: Starting enhanced scan process...');

    // Step 1: Enhanced market scan with asset prioritization
    const scanResult = await EnhancedMarketScanner.performEnhancedScan({
      maxSignalsPerSession: fullConfig.maxSignalsPerSession,
      minVolatilityThreshold: 0.4, // Higher threshold for quality
      requireHTFAlignment: fullConfig.requireHTFAlignment,
      avoidManipulation: true,
      assetClassWeights: {
        Indices: 1.0,    // Prioritize NASDAQ/NAS100/US30
        Forex: 0.5,      // Reduce forex weight (addresses EURUSD/GBPUSD over-weighting)
        Commodities: 0.8,
        Crypto: 0.3
      }
    });

    if (scanResult.selectedAssets.length === 0) {
      console.log('❌ No qualifying assets found in enhanced scan');
      this.lastScanTime = now;
      return null;
    }

    console.log(`✅ Enhanced scan selected: [${scanResult.selectedAssets.join(', ')}]`);

    // Step 2: Select top asset for signal generation
    const topAsset = scanResult.selectedAssets[0];
    console.log(`🎯 Generating signal for top asset: ${topAsset}`);

    // Step 3: Simulate market data for selected asset
    const marketData = this.generateMarketData(topAsset);

    // Step 4: Determine signal direction and structure
    const signalDirection = this.determineSignalDirection(marketData);
    const signalStructure = this.calculateSignalStructure(marketData, signalDirection);

    // Step 5: New confidence system - weighted confluence instead of meaningless %
    const confidenceResult = ConfidenceOverhaul.calculateWeightedConfidence(
      topAsset,
      signalDirection,
      this.getCurrentSession(),
      marketData
    );

    // Step 6: Apply quality gates
    const qualityCheck = this.applyQualityGates(confidenceResult, fullConfig);
    if (!qualityCheck.passed) {
      console.log(`❌ Signal rejected: ${qualityCheck.reason}`);
      
      // Update asset performance tracking
      MultiAssetPrioritizer.updateAssetPerformance(topAsset, 'loss');
      this.lastScanTime = now;
      
      return {
        status: 'rejected',
        symbol: topAsset,
        direction: signalDirection === 'BULLISH' ? 'BUY' : 'SELL',
        entry: signalStructure.entry,
        stopLoss: signalStructure.stopLoss,
        takeProfit: signalStructure.takeProfit,
        riskReward: signalStructure.riskReward,
        confidence: confidenceResult,
        reasoning: `Rejected: ${qualityCheck.reason}. ${ConfidenceOverhaul.generateConfluenceExplanation(confidenceResult)}`,
        scanMetrics: {
          assetsScanned: scanResult.scanMetrics.totalScanned,
          assetsPassed: scanResult.scanMetrics.passed,
          priorityAssets: MultiAssetPrioritizer.getPrioritizedAssets(this.getCurrentSession(), 5)
        },
        timestamp: new Date().toISOString()
      };
    }

    // Step 7: Approved signal
    const approvedReason = this.generateApprovalReason(confidenceResult, topAsset, qualityCheck);
    
    console.log(`✅ APPROVED: ${topAsset} ${signalDirection} - ${confidenceResult.grade} grade`);
    console.log(`📊 Confluence: ${confidenceResult.confluenceScore}/100 (${confidenceResult.bucketScore}/6 bucket)`);

    // Update performance tracking for successful signal
    MultiAssetPrioritizer.updateAssetPerformance(topAsset, 'win', signalStructure.riskReward);
    this.lastScanTime = now;

    return {
      status: 'approved',
      symbol: topAsset,
      direction: signalDirection === 'BULLISH' ? 'BUY' : 'SELL',
      entry: signalStructure.entry,
      stopLoss: signalStructure.stopLoss,
      takeProfit: signalStructure.takeProfit,
      riskReward: signalStructure.riskReward,
      confidence: confidenceResult,
      reasoning: approvedReason,
      scanMetrics: {
        assetsScanned: scanResult.scanMetrics.totalScanned,
        assetsPassed: scanResult.scanMetrics.passed,
        priorityAssets: MultiAssetPrioritizer.getPrioritizedAssets(this.getCurrentSession(), 5)
      },
      timestamp: new Date().toISOString()
    };
  }

  private generateMarketData(symbol: string): any {
    // Simulate enhanced market data with realistic values
    const basePrice = this.getBasePrice(symbol);
    const session = this.getCurrentSession();
    
    return {
      symbol,
      currentPrice: basePrice * (1 + (Math.random() - 0.5) * 0.02), // ±1% variation
      session,
      atr: this.calculateATR(symbol, session),
      volume: this.getSessionVolume(symbol, session),
      rsi: 30 + Math.random() * 40, // 30-70 range
      macd: {
        macd: (Math.random() - 0.5) * 0.001,
        signal: (Math.random() - 0.5) * 0.0008,
        histogram: (Math.random() - 0.5) * 0.0003,
        trend: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH'
      },
      candleData: this.generateCandleData(basePrice, 20)
    };
  }

  private determineSignalDirection(marketData: any): 'BULLISH' | 'BEARISH' {
    // Enhanced direction logic based on confluence
    const factors = {
      macdAlignment: marketData.macd.trend,
      rsiLevel: marketData.rsi > 50 ? 'BULLISH' : 'BEARISH',
      sessionBias: this.getSessionBias(marketData.symbol, marketData.session),
      volumeSupport: marketData.volume > 1000 ? 'STRONG' : 'WEAK'
    };

    // For indices during NY session, slight bullish bias
    if (['NAS100', 'SPX500', 'US30'].includes(marketData.symbol) && 
        marketData.session === 'NewYork' && factors.volumeSupport === 'STRONG') {
      return Math.random() > 0.35 ? 'BULLISH' : 'BEARISH'; // 65% bullish bias
    }

    // Default confluence-based direction
    const bullishFactors = [
      factors.macdAlignment === 'BULLISH',
      factors.rsiLevel === 'BULLISH',
      factors.sessionBias === 'BULLISH'
    ].filter(Boolean).length;

    return bullishFactors >= 2 ? 'BULLISH' : 'BEARISH';
  }

  private calculateSignalStructure(marketData: any, direction: 'BULLISH' | 'BEARISH'): {
    entry: number;
    stopLoss: number;
    takeProfit: number;
    riskReward: number;
  } {
    const entry = marketData.currentPrice;
    const atr = marketData.atr;
    
    // Improved risk management based on asset type
    const isIndex = ['NAS100', 'SPX500', 'US30'].includes(marketData.symbol);
    const riskMultiplier = isIndex ? 1.5 : 1.0; // Indices can handle wider stops
    
    let stopDistance, takeProfitDistance;
    
    if (direction === 'BULLISH') {
      stopDistance = atr * riskMultiplier * 0.8;
      takeProfitDistance = stopDistance * (1.8 + Math.random() * 0.8); // 1.8-2.6 RR
      
      return {
        entry,
        stopLoss: entry - stopDistance,
        takeProfit: entry + takeProfitDistance,
        riskReward: takeProfitDistance / stopDistance
      };
    } else {
      stopDistance = atr * riskMultiplier * 0.8;
      takeProfitDistance = stopDistance * (1.8 + Math.random() * 0.8);
      
      return {
        entry,
        stopLoss: entry + stopDistance,
        takeProfit: entry - takeProfitDistance,
        riskReward: takeProfitDistance / stopDistance
      };
    }
  }

  private applyQualityGates(confidence: WeightedConfidenceResult, config: SignalFlowConfig): {
    passed: boolean;
    reason: string;
    additionalChecks: string[];
  } {
    const checks: string[] = [];

    // Primary confluence gate
    if (confidence.bucketScore < config.minConfluenceBucket) {
      return {
        passed: false,
        reason: `Confluence ${confidence.bucketScore}/6 below minimum ${config.minConfluenceBucket}/6`,
        additionalChecks: checks
      };
    }
    checks.push(`Confluence ${confidence.bucketScore}/6 passed`);

    // Grade-based gate
    if (confidence.grade === 'Rejected' || confidence.grade === 'Weak') {
      return {
        passed: false,
        reason: `Signal grade too low: ${confidence.grade}`,
        additionalChecks: checks
      };
    }
    checks.push(`Grade ${confidence.grade} acceptable`);

    // Weak points check
    if (confidence.weakPoints.length > 2) {
      return {
        passed: false,
        reason: `Too many weak factors: ${confidence.weakPoints.join(', ')}`,
        additionalChecks: checks
      };
    }
    checks.push(`Weak points check passed (${confidence.weakPoints.length}/3)`);

    // Signal worthiness check
    if (!confidence.isSignalWorthy) {
      return {
        passed: false,
        reason: 'Overall signal quality insufficient',
        additionalChecks: checks
      };
    }
    checks.push('Signal worthiness confirmed');

    return {
      passed: true,
      reason: 'All quality gates passed',
      additionalChecks: checks
    };
  }

  private generateApprovalReason(confidence: WeightedConfidenceResult, symbol: string, qualityCheck: any): string {
    const confluenceExplanation = ConfidenceOverhaul.generateConfluenceExplanation(confidence);
    const checksSummary = qualityCheck.additionalChecks.join(', ');
    
    return `${symbol} ${confidence.grade} signal approved. ${confluenceExplanation} Quality checks: ${checksSummary}.`;
  }

  // Helper methods
  private getCurrentSession(): 'Asian' | 'London' | 'NewYork' {
    const hour = new Date().getUTCHours();
    if (hour >= 0 && hour < 7) return 'Asian';
    if (hour >= 7 && hour < 15) return 'London';
    return 'NewYork';
  }

  private getBasePrice(symbol: string): number {
    const priceMap: Record<string, number> = {
      'NAS100': 15800.0, 'SPX500': 4400.0, 'US30': 35000.0,
      'EURUSD': 1.0850, 'GBPUSD': 1.2650, 'USDJPY': 149.50,
      'XAUUSD': 2050.0, 'BTCUSD': 42000.0
    };
    return priceMap[symbol] || 1.0;
  }

  private calculateATR(symbol: string, session: string): number {
    const baseATR: Record<string, number> = {
      'NAS100': 180.0, 'SPX500': 25.0, 'US30': 350.0,
      'EURUSD': 0.0012, 'GBPUSD': 0.0015, 'USDJPY': 0.45,
      'XAUUSD': 12.0
    };
    
    const multiplier = session === 'NewYork' ? 1.2 : (session === 'London' ? 1.0 : 0.7);
    return (baseATR[symbol] || 0.001) * multiplier;
  }

  private getSessionVolume(symbol: string, session: string): number {
    const baseVolume = Math.random() * 1000 + 500;
    const sessionMultiplier = { Asian: 0.6, London: 1.0, NewYork: 1.4 }[session];
    return baseVolume * sessionMultiplier;
  }

  private getSessionBias(symbol: string, session: string): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    if (['NAS100', 'SPX500'].includes(symbol) && session === 'NewYork') {
      return Math.random() > 0.4 ? 'BULLISH' : 'BEARISH'; // 60% bullish bias
    }
    return Math.random() > 0.5 ? 'BULLISH' : 'BEARISH';
  }

  private generateCandleData(basePrice: number, count: number): any[] {
    const candles = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < count; i++) {
      const variation = (Math.random() - 0.5) * 0.002; // 0.2% max variation
      const open = currentPrice;
      const close = currentPrice * (1 + variation);
      const high = Math.max(open, close) * (1 + Math.random() * 0.001);
      const low = Math.min(open, close) * (1 - Math.random() * 0.001);
      
      candles.push({
        open, high, low, close,
        volume: Math.random() * 1000 + 100,
        timestamp: Date.now() - (count - i) * 300000 // 5-minute intervals
      });
      
      currentPrice = close;
    }
    
    return candles;
  }

  // Performance and reporting methods
  getAssetPerformanceReport() {
    return MultiAssetPrioritizer.getAssetPerformanceReport();
  }

  performWeeklyRecalibration() {
    return MultiAssetPrioritizer.performWeeklyRecalibration();
  }
}

// Export singleton instance
export const fixedSignalEngine = FixedSignalEngine.getInstance();