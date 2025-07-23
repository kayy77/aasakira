
export interface SignalConfig {
  pair: string;
  timeframe: string;
  marketConditions: string[];
  technicalIndicators: string[];
  riskParameters: {
    maxRisk: number;
    riskRewardRatio: number;
  };
  strategyType: 'SMC' | 'ICT' | 'Hybrid' | 'Institutional' | 'BREAK_RETEST' | 'LIQUIDITY_SWEEP';
  tradeType?: 'SCALP' | 'SWING';
  confidenceThreshold?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  minFilters?: number;
  assetClass?: 'FOREX' | 'CRYPTO' | 'STOCKS' | 'COMMODITIES';
  pairFilter?: string;
  riskReward?: number;
  pairFilters?: string[];
  minConfidence?: number;
  maxSignalsPerHour?: number;
  enabled?: boolean;
  stopLoss?: number;
  takeProfit?: number;
  entryType?: 'market' | 'limit';
}

export interface SavedPreset {
  id: string;
  name: string;
  config: SignalConfig;
  createdAt: string;
  description?: string;
}

export interface StrategyBreakdown {
  id: string;
  name: string;
  description: string;
  filters: string[];
  riskLevel: string;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  reason: string;
  adjustments?: string;
}

export interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
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
  validated?: boolean;
  risk?: 'Low' | 'Moderate' | 'High' | 'Critical';
  message?: string;
}

export interface FilterResult {
  smc: boolean;
  liquiditySweep: boolean;
  fvg: boolean;
  volumeSpike: boolean;
  sessionTiming: boolean;
  rsiDivergence: boolean;
}

export interface SignalInput {
  filters: FilterResult;
  aiConfidence: number;
  livePrice: number;
  confluenceRequired: number;
  minConfidence: number;
  newsBlocked: boolean;
}

export interface FilterValidationResult {
  valid: boolean;
  reason: string;
  passedFilters?: string[];
}

export interface UserSignalSettings {
  minConfidence: number;
  requiredFilters: number;
  selectedFilters: {
    structureBreak: boolean;
    liquiditySweep: boolean;
    fairValueGap: boolean;
    volumeSpike: boolean;
    rsiDivergence: boolean;
    sessionFilter: boolean;
  };
  fallbackMode: boolean;
  sessionAdaptive: boolean;
  emergencyOverride: boolean;
}
