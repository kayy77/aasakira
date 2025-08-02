export interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number | string;
  stopLoss: number | string;
  takeProfit: number | string;
  confidence: number;
  risk: 'Low' | 'Medium' | 'High';
  strategy: 'Smart_Money' | 'Breakout+Retest' | 'Trend_Continuation' | 'Multi_Confluence';
  analysis: string;
  timestamp: string;
  livePrice?: number;
  spreadToMarket?: number;
  confluenceLevel?: number;
  consensus?: ConsensusResult; // Add this line
}

// Add import for ConsensusResult if not already imported
import type { ConsensusResult } from '@/services/multiAIConsensusEngine';
