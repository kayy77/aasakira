
export interface SignalConfig {
  pair: string;
  timeframe: string;
  marketConditions: string[];
  technicalIndicators: string[];
  riskParameters: {
    maxRisk: number;
    riskRewardRatio: number;
  };
  strategyType: 'SMC' | 'ICT' | 'Hybrid' | 'Institutional';
}

export interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  analysis: string;
  timestamp: string;
  timeframe: string;
  riskReward: number;
  strategy: string;
  marketCondition: string;
  technicalSetup: string;
  entryReason: string;
  riskManagement: string;
  filtersPassed?: string[];
  sessionContext?: string;
  sessionActive?: boolean;
  enhancedValidation?: boolean;
  validationReason?: string;
  qualityScore?: number;
  signalStrength?: 'ULTRA' | 'STRONG' | 'MEDIUM';
  confluenceScore?: number;
  entry?: number;
  origin?: {
    institutional: boolean;
    smc: boolean;
    quant: boolean;
    volatility: boolean;
    visual: boolean;
    mentor: boolean;
  };
  newsRisk?: boolean;
  warning?: string;
}
