
import { groqService } from './groqService';
import { confidenceEngine } from './confidenceEngine';

interface EnhancedSignalInput {
  pair: string;
  confidence: number;
  expectedValue: number;
  confluenceScore: number;
  maxConfluence: number;
  strategies: string[];
  aiVotes: {
    groq?: { vote: string; confidence: number };
    gemini?: { vote: string; confidence: number };
    cohere?: { vote: string; confidence: number };
    together?: { vote: string; confidence: number };
    openRouter?: { vote: string; confidence: number };
  };
  rsiDivergence: boolean;
  volumeSpike: boolean;
  session: string;
  hasOrderBlock: boolean;
  hasFVG: boolean;
  hasBOS: boolean;
  entry: number;
  stopLoss: number;
  takeProfit: number;
}

interface ValidationResult {
  status: 'APPROVED' | 'REJECTED' | 'WEAK_APPROVED';
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'FAILED';
  reason: string;
  criticalIssues: string[];
  recommendations: string[];
  finalConfidence: number;
}

export class EnhancedSignalValidationEngine {
  
  static async validateSignal(signal: EnhancedSignalInput): Promise<ValidationResult> {
    console.log('🔍 Starting enhanced signal validation...');
    
    // STEP 1: Confluence Check (Critical)
    if (signal.confluenceScore < 4) {
      return {
        status: 'REJECTED',
        grade: 'FAILED',
        reason: `Insufficient strategy confluence: ${signal.confluenceScore}/${signal.maxConfluence} (minimum 4 required)`,
        criticalIssues: ['Confluence score too low', 'Strategy alignment failed'],
        recommendations: ['Wait for more confluences to align', 'Check for fresh structure breaks'],
        finalConfidence: 0
      };
    }

    // STEP 2: AI Consensus Validation
    const aiValidation = this.validateAIConsensus(signal.aiVotes);
    if (!aiValidation.passed) {
      return {
        status: 'REJECTED',
        grade: 'FAILED',
        reason: `AI consensus failed: ${aiValidation.reason}`,
        criticalIssues: ['AI models not aligned', aiValidation.reason],
        recommendations: ['Re-analyze with fresh data', 'Check market conditions'],
        finalConfidence: 0
      };
    }

    // STEP 3: Entry Precision Check (Sniper Requirements)
    const entryValidation = this.validateEntryPrecision(signal);
    if (!entryValidation.passed) {
      return {
        status: 'REJECTED',
        grade: 'D',
        reason: `Entry requirements not met: ${entryValidation.reason}`,
        criticalIssues: [entryValidation.reason],
        recommendations: entryValidation.recommendations,
        finalConfidence: Math.max(30, signal.confidence - 20)
      };
    }

    // STEP 4: Session & Risk Management Check
    const riskValidation = this.validateRiskManagement(signal);
    
    // STEP 5: Grade Assignment
    const finalGrade = this.assignSignalGrade(signal, aiValidation, entryValidation, riskValidation);
    
    // STEP 6: Final Status Decision
    let status: 'APPROVED' | 'REJECTED' | 'WEAK_APPROVED' = 'APPROVED';
    let finalConfidence = signal.confidence;
    
    if (finalGrade === 'A+' || finalGrade === 'A') {
      status = 'APPROVED';
      finalConfidence = Math.min(95, signal.confidence + 10);
    } else if (finalGrade === 'B') {
      status = 'APPROVED';
      finalConfidence = signal.confidence;
    } else if (finalGrade === 'C') {
      status = 'WEAK_APPROVED';
      finalConfidence = Math.max(60, signal.confidence - 10);
    } else {
      status = 'REJECTED';
      finalConfidence = Math.max(30, signal.confidence - 20);
    }

    const allIssues = [
      ...(!aiValidation.passed ? [aiValidation.reason] : []),
      ...(!entryValidation.passed ? [entryValidation.reason] : []),
      ...(!riskValidation.passed ? [riskValidation.reason] : [])
    ];

    return {
      status,
      grade: finalGrade,
      reason: this.buildValidationSummary(signal, finalGrade, status),
      criticalIssues: allIssues,
      recommendations: this.generateRecommendations(signal, finalGrade),
      finalConfidence
    };
  }

  private static validateAIConsensus(aiVotes: EnhancedSignalInput['aiVotes']): { passed: boolean; reason: string; agreementCount: number } {
    const votes = Object.entries(aiVotes).filter(([_, vote]) => vote !== undefined);
    const approvedVotes = votes.filter(([_, vote]) => 
      vote && (vote.vote.includes('BUY') || vote.vote.includes('SELL')) && vote.confidence >= 70
    );

    // Require at least 3 AI models with 70%+ confidence
    if (approvedVotes.length < 3) {
      return {
        passed: false,
        reason: `Only ${approvedVotes.length}/5 AI models agreed with sufficient confidence`,
        agreementCount: approvedVotes.length
      };
    }

    // Check if Groq (institutional bias) is among approvers for high-grade signals
    const groqApproved = aiVotes.groq && aiVotes.groq.confidence >= 75;
    const geminiApproved = aiVotes.gemini && aiVotes.gemini.confidence >= 70;

    if (!groqApproved && !geminiApproved) {
      return {
        passed: false,
        reason: 'Neither Groq (institutional) nor Gemini (SMC) models approved the signal',
        agreementCount: approvedVotes.length
      };
    }

    return {
      passed: true,
      reason: `${approvedVotes.length}/5 AI models agreed`,
      agreementCount: approvedVotes.length
    };
  }

  private static validateEntryPrecision(signal: EnhancedSignalInput): { passed: boolean; reason: string; recommendations: string[] } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for essential SMC elements
    if (!signal.hasBOS && !signal.hasFVG) {
      issues.push('Missing Break of Structure (BOS) or Fair Value Gap (FVG)');
      recommendations.push('Wait for clear structure break or FVG formation');
    }

    if (!signal.hasOrderBlock && !signal.hasFVG) {
      issues.push('No Order Block or FVG for precise entry');
      recommendations.push('Look for institutional order blocks or fair value gaps');
    }

    // RSI/Volume requirements for sniper entries
    if (!signal.rsiDivergence && !signal.volumeSpike) {
      issues.push('Missing RSI divergence AND volume spike confirmation');
      recommendations.push('Wait for either RSI divergence or institutional volume spike');
    }

    // SL distance check
    const slDistance = Math.abs(signal.entry - signal.stopLoss);
    const pipValue = signal.pair.includes('JPY') ? 0.01 : 0.0001;
    const slPips = slDistance / pipValue;

    if (slPips > 15) {
      issues.push(`Stop loss too wide: ${slPips.toFixed(1)} pips (max 15 pips)`);
      recommendations.push('Tighten stop loss to recent structure level');
    }

    // Risk-reward check
    const tpDistance = Math.abs(signal.takeProfit - signal.entry);
    const riskReward = tpDistance / slDistance;

    if (riskReward < 2) {
      issues.push(`Risk-reward ratio too low: ${riskReward.toFixed(2)}:1 (minimum 2:1)`);
      recommendations.push('Extend take profit or tighten stop loss');
    }

    return {
      passed: issues.length === 0,
      reason: issues.join('; '),
      recommendations
    };
  }

  private static validateRiskManagement(signal: EnhancedSignalInput): { passed: boolean; reason: string } {
    // Session validation
    const currentHour = new Date().getUTCHours();
    const isAsiaSession = currentHour >= 0 && currentHour < 8;
    
    if (isAsiaSession && signal.confluenceScore < 6 && signal.confidence < 90) {
      return {
        passed: false,
        reason: 'Asia session requires 6/6 confluence or 90%+ confidence'
      };
    }

    // Check for optimal trading sessions
    const isOptimalSession = 
      (currentHour >= 8 && currentHour <= 17) || // London
      (currentHour >= 13 && currentHour <= 22);  // NY

    if (!isOptimalSession && signal.confluenceScore < 5) {
      return {
        passed: false,
        reason: 'Off-session trading requires higher confluence (5+)'
      };
    }

    return { passed: true, reason: 'Risk management checks passed' };
  }

  private static assignSignalGrade(
    signal: EnhancedSignalInput,
    aiValidation: any,
    entryValidation: any,
    riskValidation: any
  ): 'A+' | 'A' | 'B' | 'C' | 'D' | 'FAILED' {
    
    // A+ Grade: Exceptional sniper setup
    if (
      signal.confluenceScore >= 6 &&
      signal.confidence >= 90 &&
      aiValidation.agreementCount >= 4 &&
      entryValidation.passed &&
      riskValidation.passed &&
      (signal.rsiDivergence || signal.volumeSpike) &&
      signal.hasBOS &&
      signal.hasFVG
    ) {
      return 'A+';
    }

    // A Grade: Strong institutional setup
    if (
      signal.confluenceScore >= 5 &&
      signal.confidence >= 80 &&
      aiValidation.agreementCount >= 4 &&
      entryValidation.passed &&
      riskValidation.passed
    ) {
      return 'A';
    }

    // B Grade: Professional quality
    if (
      signal.confluenceScore >= 4 &&
      signal.confidence >= 70 &&
      aiValidation.agreementCount >= 3 &&
      riskValidation.passed
    ) {
      return 'B';
    }

    // C Grade: Acceptable but risky
    if (
      signal.confluenceScore >= 4 &&
      signal.confidence >= 60 &&
      aiValidation.agreementCount >= 3
    ) {
      return 'C';
    }

    // D Grade: Poor quality
    if (signal.confluenceScore >= 3 && signal.confidence >= 50) {
      return 'D';
    }

    return 'FAILED';
  }

  private static buildValidationSummary(signal: EnhancedSignalInput, grade: string, status: string): string {
    const confluenceText = `${signal.confluenceScore}/${signal.maxConfluence} confluence`;
    const aiText = `AI models aligned`;
    const sessionText = `${signal.session} session`;
    
    if (status === 'APPROVED') {
      return `${grade} grade signal approved: ${confluenceText}, ${aiText}, ${sessionText}`;
    } else if (status === 'WEAK_APPROVED') {
      return `${grade} grade signal (weak approval): ${confluenceText}, proceed with caution`;
    } else {
      return `Signal rejected: Failed ${grade} grade requirements`;
    }
  }

  private static generateRecommendations(signal: EnhancedSignalInput, grade: string): string[] {
    const recommendations: string[] = [];

    if (grade === 'C' || grade === 'D') {
      recommendations.push('Use smaller position size due to lower quality');
      recommendations.push('Monitor price action closely for early exit signals');
    }

    if (!signal.rsiDivergence && !signal.volumeSpike) {
      recommendations.push('Wait for RSI divergence or volume confirmation before entry');
    }

    if (signal.confluenceScore < 5) {
      recommendations.push('Wait for additional confluences to align');
    }

    if (grade === 'A+' || grade === 'A') {
      recommendations.push('High-quality setup - suitable for larger position');
      recommendations.push('Set partial profits at 1:1 risk-reward');
    }

    return recommendations;
  }
}
