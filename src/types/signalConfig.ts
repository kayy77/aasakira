
export interface SignalConfig {
  pair: string;
  timeframe: string;
  marketConditions: string[];
  technicalIndicators: string[];
  riskReward: number;
  pairFilters: string[];
  minConfidence: number;
  maxSignalsPerHour: number;
  enabled: boolean;
  stopLoss: number;
  takeProfit: number;
  entryType: 'market' | 'limit';
  // New properties for enhanced functionality
  strategyType?: 'SMC' | 'ICT' | 'BREAK_RETEST' | 'LIQUIDITY_SWEEP';
  tradeType?: 'SWING' | 'SCALP' | 'POSITION';
  confidenceThreshold?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  minFilters?: number;
  assetClass?: 'FOREX' | 'CRYPTO' | 'STOCKS' | 'COMMODITIES';
  pairFilter?: string;
}

export interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  marketCondition: string;
  technicalSetup: string;
  entryReason: string;
  riskManagement: string;
  confidence: number;
  analysis: string;
  timestamp: string;
  timeframe: string;
  strategy: string;
  filtersPassed?: string[];
  // Additional signal properties
  sessionContext?: string;
  sessionActive?: boolean;
  enhancedValidation?: boolean;
  validationReason?: string;
  qualityScore?: number;
  signalStrength?: 'ULTRA' | 'STRONG' | 'MEDIUM';
  confluenceScore?: number;
  entry?: number | string;
  // Origin tracking
  origin?: {
    institutional: boolean;
    smc: boolean;
    quant: boolean;
    volatility: boolean;
    visual: boolean;
    mentor: boolean;
  };
}

export interface SignalDNA {
  symbol: string;
  type: 'BUY' | 'SELL';
  confidence: number;
  aiThought: string;
  origin: {
    institutional: boolean;
    smc: boolean;
    quant: boolean;
    volatility: boolean;
    visual: boolean;
    mentor: boolean;
  };
}

export type SavedPreset = {
  id: string;
  name: string;
  config: Partial<SignalConfig>;
  description: string;
  createdAt: string;
};

export type TradeType = 'SWING' | 'SCALP' | 'POSITION';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type AssetClass = 'FOREX' | 'CRYPTO' | 'STOCKS' | 'COMMODITIES';
export type StrategyType = 'SMC' | 'ICT' | 'BREAK_RETEST' | 'LIQUIDITY_SWEEP';

export interface StrategyBreakdown {
  strategy: string;
  confidence: number;
  reasoning: string;
  keyLevels: string[];
  timeframes: string[];
  riskFactors: string[];
}
