import { supabase } from '@/integrations/supabase/client';

export interface JournalEntry {
  id: string;
  pair: string;
  entry_price: number;
  exit_price?: number;
  entry_time: string;
  exit_time?: string;
  direction: 'LONG' | 'SHORT';
  strategy: string;
  lot_size?: number;
  fees?: number;
  feelings?: string;
  mistakes?: string;
  risk_reward_ratio?: number;
  result_pips?: number;
  result_percentage?: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  notes?: string;
  ai_feedback?: string;
  created_at: string;
}

export interface PairAnalytics {
  pair: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgPnL: number;
  totalPnL: number;
  maxLoss: number;
  maxWin: number;
  avgRiskReward: number;
}

export interface PositionSizeAnalytics {
  sizeRange: string;
  avgPnL: number;
  winRate: number;
  totalTrades: number;
  riskScore: 'Low' | 'Medium' | 'High';
}

export interface RiskRewardAnalysis {
  plannedRR: number;
  realizedRR: number;
  consistency: number;
  earlyExits: number;
  lateExits: number;
  perfectExits: number;
}

export interface SetupCluster {
  category: string;
  keywords: string[];
  trades: JournalEntry[];
  winRate: number;
  avgPnL: number;
  confidence: number;
}

export class TradeAnalyticsService {
  
  calculateRealPnL(pips: number, lotSize: number = 1, fees: number = 0): number {
    const actualLotSize = lotSize === 0 ? 0.01 : lotSize;
    const pipValue = actualLotSize * 10;
    const grossProfit = pips * pipValue;
    const netProfit = grossProfit - fees;
    return Math.round(netProfit * 100) / 100;
  }

  analyzePairPerformance(entries: JournalEntry[]): PairAnalytics[] {
    const pairMap = new Map<string, JournalEntry[]>();
    
    // Group trades by pair
    entries.forEach(entry => {
      if (entry.status === 'CLOSED' && entry.result_pips !== null && entry.result_pips !== undefined) {
        if (!pairMap.has(entry.pair)) {
          pairMap.set(entry.pair, []);
        }
        pairMap.get(entry.pair)!.push(entry);
      }
    });

    // Calculate analytics for each pair
    const analytics: PairAnalytics[] = [];
    
    pairMap.forEach((trades, pair) => {
      const winningTrades = trades.filter(t => (t.result_pips || 0) > 0).length;
      const losingTrades = trades.filter(t => (t.result_pips || 0) < 0).length;
      const totalTrades = trades.length;
      
      const pnLValues = trades.map(t => this.calculateRealPnL(t.result_pips || 0, t.lot_size || 1, t.fees || 0));
      const avgPnL = pnLValues.reduce((sum, pnl) => sum + pnl, 0) / totalTrades;
      const totalPnL = pnLValues.reduce((sum, pnl) => sum + pnl, 0);
      const maxLoss = Math.min(...pnLValues);
      const maxWin = Math.max(...pnLValues);
      
      const rrValues = trades.map(t => t.risk_reward_ratio || 0).filter(rr => rr > 0);
      const avgRiskReward = rrValues.length > 0 ? rrValues.reduce((sum, rr) => sum + rr, 0) / rrValues.length : 0;

      analytics.push({
        pair,
        totalTrades,
        winningTrades,
        losingTrades,
        winRate: (winningTrades / totalTrades) * 100,
        avgPnL,
        totalPnL,
        maxLoss,
        maxWin,
        avgRiskReward
      });
    });

    return analytics.sort((a, b) => b.totalPnL - a.totalPnL);
  }

  analyzePositionSizing(entries: JournalEntry[]): PositionSizeAnalytics[] {
    const closedTrades = entries.filter(e => e.status === 'CLOSED' && e.result_pips !== null);
    
    // Define size ranges
    const ranges = [
      { min: 0, max: 0.1, label: 'Micro (0-0.1)' },
      { min: 0.1, max: 0.5, label: 'Small (0.1-0.5)' },
      { min: 0.5, max: 1.0, label: 'Standard (0.5-1.0)' },
      { min: 1.0, max: 2.0, label: 'Large (1.0-2.0)' },
      { min: 2.0, max: Infinity, label: 'Very Large (2.0+)' }
    ];

    const analytics: PositionSizeAnalytics[] = [];

    ranges.forEach(range => {
      const tradesInRange = closedTrades.filter(t => {
        const size = t.lot_size || 1;
        return size > range.min && size <= range.max;
      });

      if (tradesInRange.length === 0) return;

      const winningTrades = tradesInRange.filter(t => (t.result_pips || 0) > 0).length;
      const winRate = (winningTrades / tradesInRange.length) * 100;
      
      const pnLValues = tradesInRange.map(t => this.calculateRealPnL(t.result_pips || 0, t.lot_size || 1, t.fees || 0));
      const avgPnL = pnLValues.reduce((sum, pnl) => sum + pnl, 0) / tradesInRange.length;

      // Risk scoring logic
      let riskScore: 'Low' | 'Medium' | 'High' = 'Low';
      if (range.min >= 1.0 && (winRate < 60 || avgPnL < 0)) riskScore = 'High';
      else if (range.min >= 0.5 && winRate < 50) riskScore = 'Medium';

      analytics.push({
        sizeRange: range.label,
        avgPnL,
        winRate,
        totalTrades: tradesInRange.length,
        riskScore
      });
    });

    return analytics;
  }

  analyzeRiskRewardConsistency(entries: JournalEntry[]): RiskRewardAnalysis {
    const closedTrades = entries.filter(e => 
      e.status === 'CLOSED' && 
      e.result_pips !== null && 
      e.risk_reward_ratio && 
      e.risk_reward_ratio > 0
    );

    if (closedTrades.length === 0) {
      return {
        plannedRR: 0,
        realizedRR: 0,
        consistency: 0,
        earlyExits: 0,
        lateExits: 0,
        perfectExits: 0
      };
    }

    const plannedRR = closedTrades.reduce((sum, t) => sum + (t.risk_reward_ratio || 0), 0) / closedTrades.length;
    
    // Calculate realized R:R based on actual results
    const realizedRRValues = closedTrades.map(trade => {
      const pips = trade.result_pips || 0;
      const entryPrice = trade.entry_price;
      const exitPrice = trade.exit_price;
      
      if (!exitPrice) return 0;
      
      // Estimate risk based on typical 1-2% risk per trade
      const estimatedRisk = Math.abs(entryPrice * 0.02);
      const actualReward = Math.abs(exitPrice - entryPrice);
      
      return actualReward / estimatedRisk;
    });

    const realizedRR = realizedRRValues.reduce((sum, rr) => sum + rr, 0) / realizedRRValues.length;
    
    // Analyze exit quality
    let earlyExits = 0;
    let lateExits = 0;
    let perfectExits = 0;

    closedTrades.forEach(trade => {
      const planned = trade.risk_reward_ratio || 0;
      const actual = realizedRRValues[closedTrades.indexOf(trade)];
      
      const ratio = actual / planned;
      if (ratio < 0.8) earlyExits++;
      else if (ratio > 1.2) lateExits++;
      else perfectExits++;
    });

    const consistency = (perfectExits / closedTrades.length) * 100;

    return {
      plannedRR,
      realizedRR,
      consistency,
      earlyExits,
      lateExits,
      perfectExits
    };
  }

  async clusterTradeSetups(entries: JournalEntry[]): Promise<SetupCluster[]> {
    // Combine notes, strategy, and feelings to create setup descriptions
    const setupTexts = entries.map(entry => ({
      entry,
      text: [entry.strategy, entry.notes, entry.feelings].filter(Boolean).join(' ').toLowerCase()
    }));

    // Simple keyword-based clustering (could be enhanced with AI)
    const clusters = new Map<string, { trades: JournalEntry[], keywords: Set<string> }>();

    // Define common trading setups and their keywords
    const setupPatterns = {
      'Breakout': ['breakout', 'break', 'resistance', 'support', 'level'],
      'Reversal': ['reversal', 'reverse', 'bounce', 'rejection', 'turn'],
      'Trend Following': ['trend', 'trending', 'momentum', 'follow', 'direction'],
      'News Trading': ['news', 'event', 'announcement', 'economic', 'release'],
      'Scalping': ['scalp', 'quick', 'fast', 'short-term', 'minute'],
      'Pattern Trading': ['pattern', 'head', 'shoulder', 'triangle', 'flag', 'wedge']
    };

    setupTexts.forEach(({ entry, text }) => {
      let bestMatch = 'Other';
      let maxMatches = 0;

      Object.entries(setupPatterns).forEach(([category, keywords]) => {
        const matches = keywords.filter(keyword => text.includes(keyword)).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          bestMatch = category;
        }
      });

      if (!clusters.has(bestMatch)) {
        clusters.set(bestMatch, { trades: [], keywords: new Set() });
      }

      clusters.get(bestMatch)!.trades.push(entry);
      
      // Extract keywords from text
      const words = text.split(/\s+/).filter(word => word.length > 3);
      words.forEach(word => clusters.get(bestMatch)!.keywords.add(word));
    });

    // Convert to SetupCluster array
    const result: SetupCluster[] = [];
    
    clusters.forEach((data, category) => {
      const { trades } = data;
      if (trades.length === 0) return;

      const closedTrades = trades.filter(t => t.status === 'CLOSED' && t.result_pips !== null);
      const winningTrades = closedTrades.filter(t => (t.result_pips || 0) > 0).length;
      const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;
      
      const pnLValues = closedTrades.map(t => this.calculateRealPnL(t.result_pips || 0, t.lot_size || 1, t.fees || 0));
      const avgPnL = pnLValues.length > 0 ? pnLValues.reduce((sum, pnl) => sum + pnl, 0) / pnLValues.length : 0;

      result.push({
        category,
        keywords: Array.from(data.keywords).slice(0, 5), // Top 5 keywords
        trades,
        winRate,
        avgPnL,
        confidence: Math.min(trades.length / 10, 1) * 100 // Confidence based on sample size
      });
    });

    return result.sort((a, b) => b.avgPnL - a.avgPnL);
  }
}