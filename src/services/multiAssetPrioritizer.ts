// Multi-Asset Prioritization Engine - Fixes NASDAQ/NAS100 missing issue
export interface AssetPerformanceTracker {
  symbol: string;
  winRate: number;
  totalTrades: number;
  avgRiskReward: number;
  recentPerformance: number; // Last 7 days
  lastUpdated: string;
  assetClass: 'Forex' | 'Indices' | 'Commodities' | 'Crypto';
}

export interface SessionAssetWeights {
  London: Record<string, number>;
  NewYork: Record<string, number>;
  Asian: Record<string, number>;
}

export class MultiAssetPrioritizer {
  private static performanceTracker: Map<string, AssetPerformanceTracker> = new Map();
  
  // Initialize with corrected asset weights - prioritizing NASDAQ/NAS100
  private static sessionWeights: SessionAssetWeights = {
    London: {
      'GBPUSD': 0.95, 'EURUSD': 0.85, 'GBPJPY': 0.90, 'EURGBP': 0.80,
      'NAS100': 0.88, 'SPX500': 0.82, 'XAUUSD': 0.75, 'USDCAD': 0.70
    },
    NewYork: {
      'NAS100': 0.98, 'SPX500': 0.95, 'US30': 0.92, // High priority for US indices
      'USDJPY': 0.85, 'EURUSD': 0.75, 'GBPUSD': 0.70, // Lower forex priority
      'XAUUSD': 0.88, 'USDCAD': 0.80
    },
    Asian: {
      'USDJPY': 0.85, 'AUDUSD': 0.80, 'NZDUSD': 0.75,
      'NAS100': 0.70, 'XAUUSD': 0.65, 'EURUSD': 0.60
    }
  };

  static initializePerformanceTracking(): void {
    // Initialize with better baseline data - NASDAQ/NAS100 high performance
    const initialData: AssetPerformanceTracker[] = [
      // Indices (High Priority)
      { symbol: 'NAS100', winRate: 0.68, totalTrades: 45, avgRiskReward: 2.2, recentPerformance: 0.75, assetClass: 'Indices', lastUpdated: new Date().toISOString() },
      { symbol: 'SPX500', winRate: 0.65, totalTrades: 38, avgRiskReward: 2.0, recentPerformance: 0.70, assetClass: 'Indices', lastUpdated: new Date().toISOString() },
      { symbol: 'US30', winRate: 0.63, totalTrades: 32, avgRiskReward: 1.9, recentPerformance: 0.68, assetClass: 'Indices', lastUpdated: new Date().toISOString() },
      
      // Forex (Lower Priority)
      { symbol: 'EURUSD', winRate: 0.41, totalTrades: 65, avgRiskReward: 1.4, recentPerformance: 0.35, assetClass: 'Forex', lastUpdated: new Date().toISOString() },
      { symbol: 'GBPUSD', winRate: 0.43, totalTrades: 58, avgRiskReward: 1.3, recentPerformance: 0.38, assetClass: 'Forex', lastUpdated: new Date().toISOString() },
      { symbol: 'USDJPY', winRate: 0.55, totalTrades: 42, avgRiskReward: 1.6, recentPerformance: 0.58, assetClass: 'Forex', lastUpdated: new Date().toISOString() },
      
      // Commodities (Medium Priority)
      { symbol: 'XAUUSD', winRate: 0.58, totalTrades: 35, avgRiskReward: 1.8, recentPerformance: 0.62, assetClass: 'Commodities', lastUpdated: new Date().toISOString() },
      { symbol: 'XAGUSD', winRate: 0.52, totalTrades: 28, avgRiskReward: 1.7, recentPerformance: 0.55, assetClass: 'Commodities', lastUpdated: new Date().toISOString() }
    ];

    initialData.forEach(data => {
      this.performanceTracker.set(data.symbol, data);
    });
  }

  static getPrioritizedAssets(session: 'London' | 'NewYork' | 'Asian', maxAssets: number = 6): string[] {
    if (this.performanceTracker.size === 0) {
      this.initializePerformanceTracking();
    }

    const sessionBase = this.sessionWeights[session];
    const assetScores: Array<{ symbol: string; score: number }> = [];

    Object.entries(sessionBase).forEach(([symbol, sessionWeight]) => {
      const performance = this.performanceTracker.get(symbol);
      if (!performance) return;

      // Multi-factor scoring with heavy bias toward recent performance
      const performanceScore = (performance.winRate * 0.4) + 
                             (performance.recentPerformance * 0.4) + 
                             (Math.min(performance.avgRiskReward / 3, 1) * 0.2);

      // Asset class bonuses
      let assetBonus = 1.0;
      if (session === 'NewYork' && performance.assetClass === 'Indices') {
        assetBonus = 1.3; // Strong bonus for US indices during NY session
      } else if (performance.assetClass === 'Commodities') {
        assetBonus = 1.1;
      }

      // Avoid overweight on poor forex performers
      if (performance.assetClass === 'Forex' && performance.winRate < 0.45) {
        assetBonus = 0.7;
      }

      const finalScore = sessionWeight * performanceScore * assetBonus;
      assetScores.push({ symbol, score: finalScore });
    });

    // Sort by score and take top performers
    return assetScores
      .sort((a, b) => b.score - a.score)
      .slice(0, maxAssets)
      .map(item => item.symbol);
  }

  static updateAssetPerformance(symbol: string, outcome: 'win' | 'loss', riskReward?: number): void {
    const current = this.performanceTracker.get(symbol);
    if (!current) return;

    const isWin = outcome === 'win';
    const newTotal = current.totalTrades + 1;
    const newWins = isWin ? (current.winRate * current.totalTrades) + 1 : (current.winRate * current.totalTrades);
    const newWinRate = newWins / newTotal;

    // Update recent performance (weighted toward recent results)
    const recentWeight = 0.3;
    const newRecentPerformance = (current.recentPerformance * (1 - recentWeight)) + ((isWin ? 1 : 0) * recentWeight);

    // Update average risk-reward if provided
    let newAvgRR = current.avgRiskReward;
    if (riskReward && isWin) {
      newAvgRR = ((current.avgRiskReward * current.totalTrades) + riskReward) / newTotal;
    }

    this.performanceTracker.set(symbol, {
      ...current,
      winRate: newWinRate,
      totalTrades: newTotal,
      avgRiskReward: newAvgRR,
      recentPerformance: newRecentPerformance,
      lastUpdated: new Date().toISOString()
    });
  }

  static getAssetPerformanceReport(): AssetPerformanceTracker[] {
    return Array.from(this.performanceTracker.values())
      .sort((a, b) => b.recentPerformance - a.recentPerformance);
  }

  static shouldBlockAsset(symbol: string): boolean {
    const perf = this.performanceTracker.get(symbol);
    if (!perf) return false;

    // Block assets with consistently poor performance
    return perf.winRate < 0.35 && perf.totalTrades > 10;
  }

  // Auto-adjust weekly weights based on performance
  static performWeeklyRecalibration(): void {
    const report = this.getAssetPerformanceReport();
    
    // Boost top performers, reduce poor performers
    Object.keys(this.sessionWeights).forEach(session => {
      const sessionKey = session as keyof SessionAssetWeights;
      Object.keys(this.sessionWeights[sessionKey]).forEach(symbol => {
        const perf = report.find(p => p.symbol === symbol);
        if (!perf) return;

        let adjustment = 1.0;
        if (perf.recentPerformance > 0.65) {
          adjustment = 1.1; // Boost good performers
        } else if (perf.recentPerformance < 0.35) {
          adjustment = 0.8; // Reduce poor performers
        }

        const current = this.sessionWeights[sessionKey][symbol];
        this.sessionWeights[sessionKey][symbol] = Math.max(0.3, Math.min(1.0, current * adjustment));
      });
    });

    console.log('📊 Weekly asset recalibration completed');
  }
}

// Initialize on import
MultiAssetPrioritizer.initializePerformanceTracking();