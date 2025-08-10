// CRITICAL HOTFIX: Signal Validation Gate
// This prevents low-quality/contradictory signals from reaching users

export interface SignalValidationInput {
  id?: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  ai_votes?: AIVoteResult[];
  confluence_bucket?: number;
  confidence?: number;
  status?: string;
  raw_ai_responses?: any[];
  strategy_results?: any[];
}

export interface AIVoteResult {
  name: string;
  tier: 'elite' | 'moderate' | 'weak';
  direction: 'long' | 'short' | 'neutral';
  confidence?: number;
}

export interface ValidationResult {
  passed: boolean;
  status: 'APPROVED' | 'REJECTED' | 'WEAK';
  ui_label: string;
  rejection_reasons: string[];
  weighted_ai_score: number;
  max_ai_score: number;
  confluence_check: boolean;
  ai_check: boolean;
}

// Required AI models for full consensus
const REQUIRED_MODELS = ['Groq', 'Gemini', 'Cohere', 'OpenRouter', 'Together'];
const AI_TIER_SCORES = { elite: 2, moderate: 1, weak: 0 };

// Thresholds (tune based on backtest)
const MIN_AI_SCORE_FRACTION = 0.60; // 60% of max possible AI score
const MIN_CONFLUENCE_BUCKET = 3; // Require ≥3 confluence
const STRATEGY_OVERRIDE_CONFIDENCE = 0.72; // 72% strategy confidence for override

export class SignalValidationGate {
  static validateSignal(signal: SignalValidationInput): ValidationResult {
    const votes = signal.ai_votes || [];
    const rawResponses = signal.raw_ai_responses || [];
    const strategyResults = signal.strategy_results || [];
    
    // Check 1: Required models present
    const receivedNames = new Set(votes.map(v => v.name));
    const missingModels = REQUIRED_MODELS.filter(m => !receivedNames.has(m));
    
    // Check 2: Weighted AI score calculation
    const rawScore = votes.reduce((sum, vote) => {
      const tierScore = AI_TIER_SCORES[vote.tier] || 0;
      return vote.direction !== 'neutral' ? sum + tierScore : sum;
    }, 0);
    
    const maxScore = REQUIRED_MODELS.length * 2; // Max possible with all elite
    const minRequiredScore = Math.ceil(maxScore * MIN_AI_SCORE_FRACTION);
    const passesAi = rawScore >= minRequiredScore;
    
    // Check 3: Confluence bucket
    const confluenceBucket = signal.confluence_bucket || 0;
    const passesConfluence = confluenceBucket >= MIN_CONFLUENCE_BUCKET;
    
    // Check 4: Strategy override
    const hasStrategyOverride = strategyResults.some(strategy => 
      strategy.strategyConfidence >= STRATEGY_OVERRIDE_CONFIDENCE && 
      strategy.passedFilters >= 3
    );
    
    // Check 5: Raw responses validation
    const hasRawResponses = rawResponses.length >= REQUIRED_MODELS.length - 1; // Allow 1 failure
    
    // Collect rejection reasons
    const rejectionReasons: string[] = [];
    
    if (missingModels.length > 0) {
      rejectionReasons.push(`missing_models:${missingModels.join(',')}`);
    }
    
    if (!passesAi) {
      rejectionReasons.push(`low_ai_score:${rawScore}/${maxScore}`);
    }
    
    if (!passesConfluence && !hasStrategyOverride) {
      rejectionReasons.push(`low_confluence:${confluenceBucket}/6`);
    }
    
    if (!hasRawResponses) {
      rejectionReasons.push(`insufficient_raw_responses:${rawResponses.length}`);
    }
    
    // Final decision logic
    const meetsAiThreshold = passesAi && missingModels.length === 0;
    const meetsConfluenceThreshold = passesConfluence || hasStrategyOverride;
    const hasValidResponses = hasRawResponses;
    
    const passed = meetsAiThreshold && meetsConfluenceThreshold && hasValidResponses;
    
    let status: 'APPROVED' | 'REJECTED' | 'WEAK';
    let ui_label: string;
    
    if (passed) {
      // Determine quality tier
      if (confluenceBucket >= 5 && rawScore >= maxScore * 0.8) {
        status = 'APPROVED';
        ui_label = 'Strong';
      } else if (confluenceBucket >= 4 || hasStrategyOverride) {
        status = 'APPROVED';
        ui_label = 'Medium';
      } else {
        status = 'APPROVED';
        ui_label = 'Decent';
      }
    } else {
      // Failed validation
      if (meetsAiThreshold && confluenceBucket >= 2) {
        status = 'WEAK';
        ui_label = 'Weak (Hold)';
      } else {
        status = 'REJECTED';
        ui_label = 'Rejected';
      }
    }
    
    return {
      passed,
      status,
      ui_label,
      rejection_reasons: rejectionReasons,
      weighted_ai_score: rawScore,
      max_ai_score: maxScore,
      confluence_check: passesConfluence,
      ai_check: passesAi
    };
  }
  
  // Hotfix gate for existing signals
  static hotfixGate(signal: any): any {
    const validation = this.validateSignal(signal);
    
    return {
      ...signal,
      status: validation.status,
      ui_label: validation.ui_label,
      rejection_reasons: validation.rejection_reasons,
      weighted_ai_score: validation.weighted_ai_score,
      max_ai_score: validation.max_ai_score
    };
  }
  
  // Check if signal should be shown to users
  static shouldShowToUsers(signal: any): boolean {
    return signal.status === 'APPROVED';
  }
  
  // Admin QA check for signals
  static getQAStatus(signal: any): 'PASS' | 'REVIEW' | 'BLOCK' {
    const validation = this.validateSignal(signal);
    
    if (validation.passed) return 'PASS';
    if (validation.ai_check && signal.confluence_bucket >= 2) return 'REVIEW';
    return 'BLOCK';
  }
}

export const signalValidationGate = new SignalValidationGate();