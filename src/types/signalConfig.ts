
export interface Signal {
  pair: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  confidence: number;
  timeframe: string;
  analysis: string;
  timestamp: Date;
  signalStrength: number;
  status?: 'active' | 'filled' | 'cancelled';
  sessionContext?: string;
}

export interface SignalConfig {
  pair: string;
  timeframe: string;
  strategyType: 'SMC' | 'Classic' | 'Hybrid';
  tradeType: 'swing' | 'intraday' | 'scalping';
  confidenceThreshold: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  minFilters: number;
  assetClass: 'forex' | 'crypto' | 'stocks';
  marketConditions: string;
  technicalIndicators: string[];
  pairFilter: string;
  timeValidity: string;
  riskRewardRatio: number;
  maxSignalsPerDay: number;
  sessionFilters: string[];
  volumeFilter: boolean;
  newsFilter: boolean;
  correlationFilter: boolean;
}

export interface StrategyBreakdown {
  title: string;
  description: string;
  keyPoints: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  timeframe: string;
  winRate: number;
  examples: string[];
}

export const defaultSignalConfig: SignalConfig = {
  pair: 'EURUSD',
  timeframe: '1H',
  strategyType: 'Hybrid',
  tradeType: 'intraday',
  confidenceThreshold: 75,
  riskLevel: 'moderate',
  minFilters: 3,
  assetClass: 'forex',
  marketConditions: 'trending',
  technicalIndicators: ['RSI', 'MACD', 'Moving Averages'],
  pairFilter: 'major',
  timeValidity: '24h',
  riskRewardRatio: 2.0,
  maxSignalsPerDay: 5,
  sessionFilters: ['London', 'New York'],
  volumeFilter: true,
  newsFilter: true,
  correlationFilter: false
};
