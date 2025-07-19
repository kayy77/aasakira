export interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number | string;
  stopLoss: number | string;
  takeProfit: number | string;
  confidence: number;
  timestamp: Date;
  riskReward?: number;
  filtersPassed?: string[];
  confluenceScore?: number;
  sessionContext?: string;
  sessionActive?: boolean;
  enhancedValidation?: boolean;
  validationReason?: string;
  qualityScore?: number;
  signalStrength?: 'ULTRA' | 'STRONG' | 'MEDIUM';
}

export interface StrategyBreakdown {
  title: string;
  description: string;
  keyPoints: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timeframe: string;
  successRate: number;
}

export interface SignalConfig {
  pair: string;
  timeframe: string;
  strategyType: 'SMC' | 'ICT' | 'Hybrid';
  tradeType: 'scalp' | 'intraday' | 'swing';
  confidenceThreshold: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  minFilters: number;
  assetClass: 'forex' | 'crypto' | 'stocks';
  pairFilter: string;
  timeValidity: string;
  marketConditions: string[];
  technicalIndicators: string[];
  riskManagement: {
    maxRisk: number;
    stopLoss: number;
    takeProfit: number;
  };
  sessionFilters: string[];
  volumeProfile: string;
  marketStructure: string;
}

export const defaultSignalConfig: SignalConfig = {
  pair: 'EURUSD',
  timeframe: '15m',
  strategyType: 'Hybrid',
  tradeType: 'intraday',
  confidenceThreshold: 85,
  riskLevel: 'moderate',
  minFilters: 3,
  assetClass: 'forex',
  pairFilter: 'major',
  timeValidity: '4h',
  marketConditions: ['trending', 'ranging'],
  technicalIndicators: ['RSI', 'MACD', 'OrderBlocks'],
  riskManagement: {
    maxRisk: 2,
    stopLoss: 20,
    takeProfit: 40
  },
  sessionFilters: ['london', 'newyork'],
  volumeProfile: 'high',
  marketStructure: 'bullish'
};
