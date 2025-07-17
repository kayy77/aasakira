
export type TradeType = 'scalp' | 'intraday' | 'swing' | 'position';
export type RiskLevel = 'conservative' | 'moderate' | 'aggressive';
export type AssetClass = 'forex' | 'crypto' | 'commodities' | 'indices';
export type StrategyType = 'SMC' | 'Institutional' | 'Hybrid';

export interface SignalConfig {
  strategyType: StrategyType;
  tradeType: TradeType;
  confidenceThreshold: number;
  riskLevel: RiskLevel;
  minFilters: number;
  assetClass: AssetClass;
  pairFilter: 'all' | 'majors' | 'eurusd';
  timeValidity?: string;
}

export interface SavedPreset {
  id: string;
  name: string;
  config: SignalConfig;
  createdAt: Date;
}

export interface StrategyBreakdown {
  smc: boolean;
  liquidity: boolean;
  fvg: boolean;
  volume: boolean;
  session: boolean;
  rsiEma: boolean;
}

// Enhanced Signal interface with all required properties
export interface Signal {
  id: number;
  pair: string;
  type: 'BUY' | 'SELL';
  confidence: number;
  entry: string | number;
  stopLoss: string | number;
  takeProfit: string | number;
  status: 'active' | 'monitoring' | 'confirmed' | 'completed';
  timestamp: string;
  analysis: string;
  timeframe: string;
  risk: 'Low' | 'Medium' | 'High';
  reason: string;
  pips?: number;
  riskReward?: number;
  signalStrength?: string;
  filtersScore?: number;
  maxFilters?: number;
  confluenceScore?: number;
  filtersPassed?: string[];
  sessionContext?: string;
  sessionActive?: boolean;
  enhancedValidation?: boolean;
  validationReason?: string;
  qualityScore?: number;
  rejectionReason?: string;
}

// Elite Signal interface extending Signal
export interface EliteSignal extends Signal {
  filtersScore: number;
  maxFilters: number;
  riskReward: number;
  signalStrength: string;
  confidenceReason: string;
  timeGenerated: string;
}
