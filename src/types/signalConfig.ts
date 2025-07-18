
export interface SignalConfig {
  pair: string;
  timeframe: string;
  strategyType: 'Conservative' | 'Balanced' | 'Aggressive' | 'Hybrid';
  tradeType: 'scalp' | 'intraday' | 'swing' | 'position';
  confidenceThreshold: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  minFilters: number;
  assetClass: 'forex' | 'crypto' | 'stocks' | 'commodities';
  pairFilter: string;
  timeValidity: string;
  marketConditions: string[];
  technicalIndicators: string[];
  riskManagement: {
    maxRiskPerTrade: number;
    stopLossMethod: string;
    takeProfitRatio: number;
  };
  sessionFilters: string[];
  volumeFilter: boolean;
  newsFilter: boolean;
}

export interface StrategyBreakdown {
  title: string;
  description: string;
  keyPoints: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  timeframe: string;
  winRate: number;
  riskReward: string;
}

export interface Signal {
  id: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  timeframe: string;
  reason: string;
  timestamp: Date;
  riskReward?: string;
  signalStrength?: number;
  sessionContext?: string;
}
