
export interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  entryPrice?: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  strategy: 'Smart_Money' | 'Breakout+Retest' | 'Trend_Continuation' | 'Multi_Confluence' | 'FALLBACK' | 'EMERGENCY' | 'TEST_STRATEGY';
  analysis: string;
  timestamp: string;
  livePrice?: number;
  spreadToMarket?: number;
  confluenceLevel?: number;
  consensus?: SignalConsensusResult; // Use specific type for signals
  
  // Additional properties used by various components
  timeframe?: string;
  riskReward?: number;
  marketCondition?: string;
  technicalSetup?: string;
  entryReason?: string;
  riskManagement?: string;
  filtersPassed?: string[];
  sessionContext?: string;
  sessionActive?: boolean;
  enhancedValidation?: boolean;
  validationReason?: string;
  qualityScore?: number;
  signalStrength?: 'WEAK' | 'MEDIUM' | 'STRONG' | 'ULTRA';
  confluenceScore?: number;
  validated?: boolean;
  message?: string;
  warning?: string;
}

// Filter-related interfaces
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

// Add UserSignalSettings interface
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

// Enhanced signal config for tactical parameters
export interface EnhancedSignalConfig {
  strategyType: 'SMC' | 'ICT' | 'BREAK_RETEST' | 'LIQUIDITY_SWEEP';
  confidenceThreshold: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  minFilters: number;
  assetClass: 'FOREX' | 'CRYPTO' | 'STOCKS' | 'COMMODITIES';
  pairFilter: string;
  pair: string;
  timeframe: string;
  marketConditions: string[];
  technicalIndicators: string[];
  riskParameters: {
    maxRisk: number;
    riskRewardRatio: number;
  };
  riskReward: number;
  pairFilters: string[];
  minConfidence: number;
  maxSignalsPerHour: number;
  enabled: boolean;
  stopLoss: number;
  takeProfit: number;
  entryType: 'market' | 'limit';
  tradeType: 'SCALP' | 'SWING';
}

// Add SavedPreset interface with config property
export interface SavedPreset {
  id: string;
  name: string;
  description?: string;
  settings?: UserSignalSettings;
  config?: EnhancedSignalConfig;
  createdAt: string;
}

// Add StrategyBreakdown interface
export interface StrategyBreakdown {
  strategy: string;
  description: string;
  confluenceFactors: string[];
  timeframeOptimal: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  successRate: number;
  avgRiskReward: number;
}

// Signal-specific consensus result (different from betting consensus)
export interface SignalConsensusResult {
  models: Array<{
    name: string;
    confidence: number;
    reasoning: string;
  }>;
  averageConfidence: number;
  verdict: 'APPROVED' | 'REJECTED' | 'LOW_CONSENSUS' | 'STRONG' | 'WEAK' | 'MEDIUM';
  summary: string;
}

// Betting consensus result (for betting AI engine)
export interface ConsensusResult {
  approved: boolean;
  confidence_score: number;
  ai_votes: any;
  verdict: 'APPROVED' | 'REJECTED' | 'LOW_CONSENSUS';
  label: string;
  reasoning: string[];
  final_rating: number;
  consensus_strength: string;
  multi_ai_verdict: string;
}
