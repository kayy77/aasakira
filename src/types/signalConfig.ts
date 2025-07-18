
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
  entryLogic?: string;
  exitLogic?: string;
  stopLossLogic?: string;
  takeProfitLogic?: string;
  timeValidity?: string;
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
  // Additional required fields
  sessionContext?: string;
  signalStrength?: number;
}

export interface StrategyBreakdown {
  label: string;
  explanation: string;
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
