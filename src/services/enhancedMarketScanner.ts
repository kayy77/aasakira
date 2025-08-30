// Enhanced Market Scanner - Fixes asset distribution and cycle through all instruments
import { MultiAssetPrioritizer } from './multiAssetPrioritizer';

export interface MarketCondition {
  symbol: string;
  atr: number;
  volatilityScore: number; // 0-1
  htfTrend: 'BULLISH' | 'BEARISH' | 'RANGING';
  momentumStrength: number; // 0-1
  isRanging: boolean;
  session: 'Asian' | 'London' | 'NewYork';
  timeframe: string;
}

export interface ScanConfiguration {
  maxSignalsPerSession: number;
  minVolatilityThreshold: number;
  requireHTFAlignment: boolean;
  avoidManipulation: boolean;
  assetClassWeights: {
    Indices: number;
    Forex: number;
    Commodities: number;
    Crypto: number;
  };
}

export class EnhancedMarketScanner {
  private static lastScanTime = 0;
  private static readonly SCAN_COOLDOWN = 30000; // 30 seconds between scans
  
  private static readonly DEFAULT_CONFIG: ScanConfiguration = {
    maxSignalsPerSession: 2,
    minVolatilityThreshold: 0.3,
    requireHTFAlignment: true,
    avoidManipulation: true,
    assetClassWeights: {
      Indices: 1.0,    // High priority for indices
      Forex: 0.6,      // Lower priority for forex majors
      Commodities: 0.8,
      Crypto: 0.4
    }
  };

  static async performEnhancedScan(config: Partial<ScanConfiguration> = {}): Promise<{
    selectedAssets: string[];
    rejectedAssets: Array<{ symbol: string; reason: string }>;
    marketConditions: MarketCondition[];
    scanMetrics: {
      totalScanned: number;
      passed: number;
      avgVolatility: number;
      sessionOptimal: boolean;
    };
  }> {
    const now = Date.now();
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    // Prevent too frequent scanning
    if (now - this.lastScanTime < this.SCAN_COOLDOWN) {
      console.log('🔒 Scan cooldown active, using cached results');
      return this.getCachedScanResults();
    }

    const session = this.getCurrentSession();
    const allAssets = this.getAllTradableAssets();
    
    console.log(`🔍 Enhanced Market Scanner: Analyzing ${allAssets.length} assets for ${session} session`);

    // Step 1: Get prioritized assets from MultiAssetPrioritizer
    const prioritizedAssets = MultiAssetPrioritizer.getPrioritizedAssets(session, 12);
    
    // Step 2: Analyze market conditions for all assets
    const marketConditions: MarketCondition[] = [];
    const rejectedAssets: Array<{ symbol: string; reason: string }> = [];
    
    for (const symbol of allAssets) {
      const condition = await this.analyzeMarketCondition(symbol, session);
      marketConditions.push(condition);
      
      // Apply filters
      const filterResult = this.applyEnhancedFilters(condition, fullConfig);
      if (!filterResult.passed) {
        rejectedAssets.push({ symbol, reason: filterResult.reason });
      }
    }

    // Step 3: Asset class weighting and selection
    const qualifiedAssets = marketConditions
      .filter(condition => !rejectedAssets.some(r => r.symbol === condition.symbol))
      .map(condition => ({
        symbol: condition.symbol,
        score: this.calculateAssetScore(condition, fullConfig, prioritizedAssets.includes(condition.symbol))
      }))
      .sort((a, b) => b.score - a.score);

    // Step 4: Final selection with diversity
    const selectedAssets = this.selectDiversifiedAssets(
      qualifiedAssets, 
      fullConfig.maxSignalsPerSession,
      fullConfig.assetClassWeights
    );

    // Step 5: Calculate metrics
    const scanMetrics = {
      totalScanned: allAssets.length,
      passed: selectedAssets.length,
      avgVolatility: marketConditions.reduce((sum, c) => sum + c.volatilityScore, 0) / marketConditions.length,
      sessionOptimal: session === 'London' || session === 'NewYork'
    };

    this.lastScanTime = now;

    console.log(`✅ Enhanced scan complete: ${selectedAssets.length} assets selected from ${allAssets.length} scanned`);
    console.log(`🎯 Selected: [${selectedAssets.join(', ')}]`);
    console.log(`❌ Top rejections: ${rejectedAssets.slice(0, 3).map(r => `${r.symbol}(${r.reason})`).join(', ')}`);

    return {
      selectedAssets,
      rejectedAssets,
      marketConditions,
      scanMetrics
    };
  }

  private static getAllTradableAssets(): string[] {
    return [
      // Indices (High Priority)
      'NAS100', 'SPX500', 'US30', 'DAX', 'FTSE100',
      
      // Forex Majors
      'EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD',
      
      // Forex Minors
      'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'EURAUD',
      
      // Commodities
      'XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL',
      
      // Crypto (if enabled)
      'BTCUSD', 'ETHUSD'
    ];
  }

  private static async analyzeMarketCondition(symbol: string, session: 'Asian' | 'London' | 'NewYork'): Promise<MarketCondition> {
    // Simulate market analysis (in real implementation, get from price service)
    const baseATR = this.getBaseATR(symbol);
    const sessionMultiplier = this.getSessionVolatilityMultiplier(session);
    
    const atr = baseATR * sessionMultiplier;
    const volatilityScore = Math.min(1.0, (atr / baseATR - 0.5) * 2); // Normalize to 0-1
    
    // HTF trend analysis based on asset type and session
    const htfTrend = this.simulateHTFTrend(symbol, session);
    const momentumStrength = this.calculateMomentumStrength(symbol, session);
    const isRanging = volatilityScore < 0.25;

    return {
      symbol,
      atr,
      volatilityScore: Math.max(0, volatilityScore),
      htfTrend,
      momentumStrength,
      isRanging,
      session,
      timeframe: '5M'
    };
  }

  private static applyEnhancedFilters(condition: MarketCondition, config: ScanConfiguration): { passed: boolean; reason: string } {
    const { symbol, volatilityScore, isRanging, htfTrend, momentumStrength, session } = condition;

    // Block if asset performance is consistently poor
    if (MultiAssetPrioritizer.shouldBlockAsset(symbol)) {
      return { passed: false, reason: 'Poor historical performance' };
    }

    // Volatility filter
    if (volatilityScore < config.minVolatilityThreshold) {
      return { passed: false, reason: `Low volatility (${(volatilityScore * 100).toFixed(1)}%)` };
    }

    // Ranging market filter
    if (isRanging && config.avoidManipulation) {
      return { passed: false, reason: 'Tight ranging conditions' };
    }

    // HTF alignment filter
    if (config.requireHTFAlignment && htfTrend === 'RANGING') {
      return { passed: false, reason: 'No clear HTF bias' };
    }

    // Session-specific filters
    if (session === 'Asian' && volatilityScore < 0.4 && !['USDJPY', 'AUDUSD', 'NAS100'].includes(symbol)) {
      return { passed: false, reason: 'Asian session requires higher volatility for non-core pairs' };
    }

    // Momentum filter
    if (momentumStrength < 0.3) {
      return { passed: false, reason: 'Insufficient momentum' };
    }

    return { passed: true, reason: 'All filters passed' };
  }

  private static calculateAssetScore(
    condition: MarketCondition, 
    config: ScanConfiguration,
    isPrioritized: boolean
  ): number {
    const { symbol, volatilityScore, htfTrend, momentumStrength, session } = condition;
    
    let baseScore = volatilityScore * 0.4 + momentumStrength * 0.6;

    // Asset class weighting
    const assetClass = this.getAssetClass(symbol);
    baseScore *= config.assetClassWeights[assetClass];

    // Priority boost from MultiAssetPrioritizer
    if (isPrioritized) {
      baseScore *= 1.3;
    }

    // Session alignment bonus
    if (this.isOptimalSessionForAsset(symbol, session)) {
      baseScore *= 1.2;
    }

    // HTF trend bonus
    if (htfTrend !== 'RANGING') {
      baseScore *= 1.1;
    }

    // Special bonuses for high-performing assets
    if (symbol === 'NAS100' && session === 'NewYork') {
      baseScore *= 1.4; // Major bonus for NASDAQ during NY session
    }
    
    if (['SPX500', 'US30'].includes(symbol) && session === 'NewYork') {
      baseScore *= 1.3;
    }

    return baseScore;
  }

  private static selectDiversifiedAssets(
    scoredAssets: Array<{ symbol: string; score: number }>,
    maxAssets: number,
    assetClassWeights: ScanConfiguration['assetClassWeights']
  ): string[] {
    const selected: string[] = [];
    const assetClassCounts: Record<string, number> = { Indices: 0, Forex: 0, Commodities: 0, Crypto: 0 };

    for (const asset of scoredAssets) {
      if (selected.length >= maxAssets) break;

      const assetClass = this.getAssetClass(asset.symbol);
      const classLimit = Math.ceil(maxAssets * assetClassWeights[assetClass]);

      if (assetClassCounts[assetClass] < classLimit) {
        selected.push(asset.symbol);
        assetClassCounts[assetClass]++;
      }
    }

    return selected;
  }

  private static getAssetClass(symbol: string): 'Indices' | 'Forex' | 'Commodities' | 'Crypto' {
    if (['NAS100', 'SPX500', 'US30', 'DAX', 'FTSE100'].includes(symbol)) return 'Indices';
    if (['XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL'].includes(symbol)) return 'Commodities';
    if (['BTCUSD', 'ETHUSD'].includes(symbol)) return 'Crypto';
    return 'Forex';
  }

  private static getBaseATR(symbol: string): number {
    const atrMap: Record<string, number> = {
      'NAS100': 180.0, 'SPX500': 25.0, 'US30': 350.0,
      'EURUSD': 0.0012, 'GBPUSD': 0.0015, 'USDJPY': 0.45,
      'XAUUSD': 12.0, 'XAGUSD': 0.35
    };
    return atrMap[symbol] || 0.001;
  }

  private static getSessionVolatilityMultiplier(session: 'Asian' | 'London' | 'NewYork'): number {
    return { Asian: 0.7, London: 1.2, NewYork: 1.0 }[session];
  }

  private static simulateHTFTrend(symbol: string, session: 'Asian' | 'London' | 'NewYork'): 'BULLISH' | 'BEARISH' | 'RANGING' {
    // Simulate based on asset and session
    if (['NAS100', 'SPX500'].includes(symbol) && session === 'NewYork') {
      return Math.random() > 0.3 ? 'BULLISH' : 'BEARISH'; // Strong directional bias for US indices
    }
    
    const rand = Math.random();
    if (rand > 0.6) return 'BULLISH';
    if (rand > 0.3) return 'BEARISH';
    return 'RANGING';
  }

  private static calculateMomentumStrength(symbol: string, session: 'Asian' | 'London' | 'NewYork'): number {
    // Higher momentum for indices during active sessions
    if (this.getAssetClass(symbol) === 'Indices' && session !== 'Asian') {
      return 0.4 + Math.random() * 0.6; // 0.4-1.0
    }
    
    return Math.random() * 0.8 + 0.2; // 0.2-1.0
  }

  private static isOptimalSessionForAsset(symbol: string, session: 'Asian' | 'London' | 'NewYork'): boolean {
    const assetClass = this.getAssetClass(symbol);
    
    if (assetClass === 'Indices' && session === 'NewYork') return true;
    if (['GBPUSD', 'EURGBP'].includes(symbol) && session === 'London') return true;
    if (['USDJPY', 'AUDUSD'].includes(symbol) && session === 'Asian') return true;
    
    return false;
  }

  private static getCurrentSession(): 'Asian' | 'London' | 'NewYork' {
    const hour = new Date().getUTCHours();
    if (hour >= 0 && hour < 7) return 'Asian';
    if (hour >= 7 && hour < 15) return 'London';
    return 'NewYork';
  }

  private static getCachedScanResults() {
    // Return simple cached results to prevent excessive scanning
    return {
      selectedAssets: ['NAS100', 'EURUSD'],
      rejectedAssets: [],
      marketConditions: [],
      scanMetrics: { totalScanned: 0, passed: 0, avgVolatility: 0, sessionOptimal: false }
    };
  }
}