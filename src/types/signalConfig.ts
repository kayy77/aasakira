
export interface SignalConfig {
  rsi: {
    enabled: boolean;
    oversold: number;
    overbought: number;
    period: number;
  };
  macd: {
    enabled: boolean;
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
  };
  bollinger: {
    enabled: boolean;
    period: number;
    stdDev: number;
  };
  sma: {
    enabled: boolean;
    period: number;
  };
  volume: {
    enabled: boolean;
    threshold: number;
  };
  pairFilters: string[];
  timeframe: string;
  minConfidence: number;
}

export interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  signalStrength: number;
  filtersScore: number;
  maxFilters: number;
  timestamp: string;
  indicators: {
    rsi?: number;
    macd?: {
      macd: number;
      signal: number;
      histogram: number;
    };
    bollinger?: {
      upper: number;
      middle: number;
      lower: number;
    };
    sma?: number;
    volume?: number;
  };
  analysis: string;
}

export interface EliteSignal extends Signal {
  institutionalFlow: 'bullish' | 'bearish' | 'neutral';
  smartMoneyActivity: boolean;
  liquidityLevels: {
    support: number[];
    resistance: number[];
  };
  riskAssessment: {
    probability: number;
    riskLevel: 'low' | 'medium' | 'high';
    maxDrawdown: number;
  };
  marketContext: {
    trend: 'bullish' | 'bearish' | 'sideways';
    volatility: 'low' | 'medium' | 'high';
    newsImpact: 'low' | 'medium' | 'high';
  };
}
