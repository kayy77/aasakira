
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
  strategy: 'Smart_Money' | 'Breakout+Retest' | 'Trend_Continuation' | 'Multi_Confluence' | 'FALLBACK' | 'EMERGENCY';
  analysis: string;
  timestamp: string;
  livePrice?: number;
  spreadToMarket?: number;
  confluenceLevel?: number;
  consensus?: ConsensusResult;
  
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

// Add SavedPreset interface
export interface SavedPreset {
  id: string;
  name: string;
  settings: UserSignalSettings;
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

// Add import for ConsensusResult if not already imported
import type { ConsensusResult } from '@/services/multiAIConsensusEngine';
