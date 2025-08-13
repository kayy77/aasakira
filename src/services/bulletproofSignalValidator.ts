// Bulletproof Signal Validation System
// Prevents catastrophic signal errors like SL=Entry that cause instant losses

interface ATRData {
  pair: string;
  atr: number;
  timeframe: string;
  minDistance: number;
}

interface ValidationInput {
  pair: string;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  tradeType: 'BUY' | 'SELL';
  confidence: number;
  timeframe: string;
  session: string;
  confluenceScore?: number;
  justification?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  adjustedSignal?: ValidationInput;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
}

export class BulletproofSignalValidator {
  private static readonly FOREX_PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF'];
  private static readonly MIN_RRR = 1.5;
  private static readonly MAX_RRR = 10.0;
  private static readonly MIN_CONFIDENCE = 65;

  // ATR-based minimum distances for each pair and timeframe
  private static readonly ATR_DATA: Record<string, Record<string, number>> = {
    'EURUSD': { 'M1': 0.00015, 'M5': 0.00025, 'M15': 0.00040, 'H1': 0.00060, 'H4': 0.00120 },
    'GBPUSD': { 'M1': 0.00020, 'M5': 0.00035, 'M15': 0.00055, 'H1': 0.00080, 'H4': 0.00150 },
    'USDJPY': { 'M1': 0.015, 'M5': 0.025, 'M15': 0.040, 'H1': 0.060, 'H4': 0.120 },
    'AUDUSD': { 'M1': 0.00018, 'M5': 0.00030, 'M15': 0.00050, 'H1': 0.00070, 'H4': 0.00140 },
    'USDCAD': { 'M1': 0.00018, 'M5': 0.00030, 'M15': 0.00050, 'H1': 0.00070, 'H4': 0.00140 },
    'NZDUSD': { 'M1': 0.00020, 'M5': 0.00035, 'M15': 0.00055, 'H1': 0.00075, 'H4': 0.00145 },
    'USDCHF': { 'M1': 0.00016, 'M5': 0.00028, 'M15': 0.00045, 'H1': 0.00065, 'H4': 0.00130 }
  };

  // STEP 1: Hard Validation Layer
  static validateSignal(signal: ValidationInput): ValidationResult {
    console.log(`🛡️ BULLETPROOF VALIDATION: Checking ${signal.pair} ${signal.tradeType} signal...`);
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Critical Error Check #1: SL = Entry (Instant Loss Prevention)
    const slEntryDistance = Math.abs(signal.entry - signal.stopLoss);
    if (slEntryDistance < 0.000001) {
      errors.push(`CRITICAL: Stop Loss equals Entry (${signal.stopLoss} = ${signal.entry}) - Instant loss guaranteed!`);
    }

    // Critical Error Check #2: SL Direction Validation
    if (signal.tradeType === 'BUY' && signal.stopLoss >= signal.entry) {
      errors.push(`CRITICAL: BUY trade has SL (${signal.stopLoss}) above/equal to Entry (${signal.entry}) - Invalid direction!`);
    }
    if (signal.tradeType === 'SELL' && signal.stopLoss <= signal.entry) {
      errors.push(`CRITICAL: SELL trade has SL (${signal.stopLoss}) below/equal to Entry (${signal.entry}) - Invalid direction!`);
    }

    // Critical Error Check #3: TP Direction Validation
    if (signal.tradeType === 'BUY' && signal.takeProfit <= signal.entry) {
      errors.push(`CRITICAL: BUY trade has TP (${signal.takeProfit}) below/equal to Entry (${signal.entry}) - Invalid direction!`);
    }
    if (signal.tradeType === 'SELL' && signal.takeProfit >= signal.entry) {
      errors.push(`CRITICAL: SELL trade has TP (${signal.takeProfit}) above/equal to Entry (${signal.entry}) - Invalid direction!`);
    }

    // Dynamic Minimum Distance Check
    const minDistance = this.getMinimumDistance(signal.pair, signal.timeframe);
    if (slEntryDistance < minDistance) {
      errors.push(`CRITICAL: SL too close to Entry. Distance: ${slEntryDistance.toFixed(5)}, Required: ${minDistance.toFixed(5)}`);
    }

    // Risk-Reward Ratio Validation
    const tpDistance = Math.abs(signal.takeProfit - signal.entry);
    const rrr = tpDistance / slEntryDistance;
    
    if (rrr < this.MIN_RRR) {
      errors.push(`INVALID: Risk-Reward ${rrr.toFixed(2)}:1 below minimum ${this.MIN_RRR}:1`);
    }
    if (rrr > this.MAX_RRR) {
      warnings.push(`WARNING: Risk-Reward ${rrr.toFixed(2)}:1 unusually high - may be unrealistic`);
    }

    // Confidence Validation
    if (signal.confidence < this.MIN_CONFIDENCE) {
      errors.push(`INVALID: Confidence ${signal.confidence}% below minimum ${this.MIN_CONFIDENCE}%`);
    }

    // Spread Risk Assessment
    const spreadRisk = this.assessSpreadRisk(signal.pair, slEntryDistance);
    if (spreadRisk === 'CRITICAL') {
      errors.push(`CRITICAL: Stop loss too close - spread alone could trigger SL`);
    }

    // Session-Based Risk Assessment
    const sessionRisk = this.assessSessionRisk(signal.session, signal.pair);
    if (sessionRisk.risk === 'HIGH') {
      warnings.push(`WARNING: ${sessionRisk.reason}`);
    }

    // Generate Recommendations
    this.generateRecommendations(signal, minDistance, rrr, recommendations);

    const riskLevel = this.calculateRiskLevel(errors.length, warnings.length, rrr, signal.confidence);
    
    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskLevel,
      recommendations
    };

    // Attempt Auto-Adjustment if possible
    if (!result.isValid && this.canAutoAdjust(errors)) {
      result.adjustedSignal = this.autoAdjustSignal(signal, minDistance);
      console.log(`🔧 Auto-adjustment attempted for ${signal.pair}`);
    }

    console.log(`🛡️ Validation result: ${result.isValid ? 'PASSED' : 'FAILED'} | Risk: ${result.riskLevel} | Errors: ${errors.length} | Warnings: ${warnings.length}`);
    
    return result;
  }

  // STEP 2: Dynamic Minimum Distance Calculation
  private static getMinimumDistance(pair: string, timeframe: string): number {
    const pairData = this.ATR_DATA[pair];
    if (!pairData) {
      // Fallback for unknown pairs
      const isJPY = pair.includes('JPY');
      return isJPY ? 0.03 : 0.0003; // 3 pips for JPY, 0.3 pips for others
    }

    const atrDistance = pairData[timeframe] || pairData['M15']; // Fallback to M15
    
    // Add session multiplier for safety
    const sessionMultiplier = this.getSessionMultiplier();
    
    return atrDistance * sessionMultiplier;
  }

  private static getSessionMultiplier(): number {
    const hour = new Date().getUTCHours();
    
    // Higher multiplier during low liquidity periods
    if ((hour >= 0 && hour <= 6) || (hour >= 22 && hour <= 24)) {
      return 2.0; // Asian session - double the minimum distance
    }
    if (hour >= 8 && hour <= 16) {
      return 1.2; // London session - slight increase
    }
    if (hour >= 13 && hour <= 21) {
      return 1.0; // NY session - normal distance
    }
    
    return 1.5; // Overlap or transition periods
  }

  // STEP 3: Auto-Adjustment Logic
  private static canAutoAdjust(errors: string[]): boolean {
    // Only attempt auto-adjustment for distance and direction errors
    const adjustableErrors = errors.filter(error => 
      error.includes('too close') || 
      error.includes('Invalid direction') || 
      error.includes('Risk-Reward')
    );
    
    return adjustableErrors.length > 0 && adjustableErrors.length === errors.length;
  }

  private static autoAdjustSignal(signal: ValidationInput, minDistance: number): ValidationInput {
    const adjusted = { ...signal };
    
    // Fix SL direction and distance
    if (signal.tradeType === 'BUY') {
      adjusted.stopLoss = Math.min(signal.stopLoss, signal.entry - minDistance);
    } else {
      adjusted.stopLoss = Math.max(signal.stopLoss, signal.entry + minDistance);
    }
    
    // Recalculate TP to maintain reasonable RRR
    const newSlDistance = Math.abs(adjusted.entry - adjusted.stopLoss);
    const targetRRR = 2.5; // Conservative target
    
    if (signal.tradeType === 'BUY') {
      adjusted.takeProfit = signal.entry + (newSlDistance * targetRRR);
    } else {
      adjusted.takeProfit = signal.entry - (newSlDistance * targetRRR);
    }
    
    console.log(`🔧 Auto-adjusted: SL ${signal.stopLoss} → ${adjusted.stopLoss}, TP ${signal.takeProfit} → ${adjusted.takeProfit}`);
    
    return adjusted;
  }

  // STEP 4: Risk Assessment Functions
  private static assessSpreadRisk(pair: string, slDistance: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const typicalSpreads: Record<string, number> = {
      'EURUSD': 0.00001, 'GBPUSD': 0.00002, 'USDJPY': 0.001,
      'AUDUSD': 0.00002, 'USDCAD': 0.00002, 'NZDUSD': 0.00003
    };
    
    const spread = typicalSpreads[pair] || 0.00002;
    const spreadToSlRatio = spread / slDistance;
    
    if (spreadToSlRatio > 0.5) return 'CRITICAL'; // Spread is 50%+ of SL distance
    if (spreadToSlRatio > 0.3) return 'HIGH';      // Spread is 30%+ of SL distance
    if (spreadToSlRatio > 0.1) return 'MEDIUM';    // Spread is 10%+ of SL distance
    return 'LOW';
  }

  private static assessSessionRisk(session: string, pair: string): { risk: 'LOW' | 'MEDIUM' | 'HIGH'; reason: string } {
    const hour = new Date().getUTCHours();
    
    // Asian session (low liquidity)
    if (hour >= 0 && hour <= 6) {
      return {
        risk: 'HIGH',
        reason: 'Asian session - reduced liquidity may cause erratic price movement'
      };
    }
    
    // Pre-London (transition)
    if (hour >= 6 && hour <= 8) {
      return {
        risk: 'MEDIUM',
        reason: 'Pre-London session - volatility increasing but not fully established'
      };
    }
    
    // London session (optimal)
    if (hour >= 8 && hour <= 16) {
      return {
        risk: 'LOW',
        reason: 'London session - optimal liquidity and volatility'
      };
    }
    
    // NY session (optimal)
    if (hour >= 13 && hour <= 21) {
      return {
        risk: 'LOW',
        reason: 'New York session - high liquidity and institutional activity'
      };
    }
    
    // Late NY/Early Asian
    return {
      risk: 'MEDIUM',
      reason: 'Late trading session - reduced institutional activity'
    };
  }

  private static calculateRiskLevel(errorCount: number, warningCount: number, rrr: number, confidence: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (errorCount > 0) return 'CRITICAL';
    if (warningCount >= 3) return 'HIGH';
    if (warningCount >= 2 || rrr < 2.0 || confidence < 75) return 'MEDIUM';
    return 'LOW';
  }

  private static generateRecommendations(signal: ValidationInput, minDistance: number, rrr: number, recommendations: string[]): void {
    if (Math.abs(signal.entry - signal.stopLoss) < minDistance * 1.5) {
      recommendations.push(`Consider wider stop loss. Minimum safe distance: ${(minDistance * 1.5).toFixed(5)}`);
    }
    
    if (rrr < 2.0) {
      recommendations.push(`Improve risk-reward ratio. Current: ${rrr.toFixed(2)}:1, Target: 2.5:1+`);
    }
    
    if (signal.confidence < 80) {
      recommendations.push(`Wait for higher confluence. Current confidence: ${signal.confidence}%, Target: 80%+`);
    }
    
    const hour = new Date().getUTCHours();
    if (hour >= 0 && hour <= 6) {
      recommendations.push(`Consider waiting for London/NY session for better liquidity`);
    }
    
    if (!signal.confluenceScore || signal.confluenceScore < 5) {
      recommendations.push(`Increase confluence score with additional confirmations (SMC, FVG, Volume)`);
    }
  }

  // STEP 5: Post-Validation Rescan
  static async postValidationRescan(rejectedSignal: ValidationInput, maxAttempts: number = 3): Promise<ValidationInput | null> {
    console.log(`🔄 Post-validation rescan: Attempting to generate alternative signal for ${rejectedSignal.pair}...`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Rescan attempt ${attempt}/${maxAttempts}...`);
      
      // Generate alternative signal with adjusted parameters
      const alternativeSignal = await this.generateAlternativeSignal(rejectedSignal, attempt);
      
      if (alternativeSignal) {
        const validation = this.validateSignal(alternativeSignal);
        
        if (validation.isValid) {
          console.log(`✅ Rescan successful on attempt ${attempt}: Found valid alternative signal`);
          return alternativeSignal;
        }
        
        console.log(`❌ Rescan attempt ${attempt} failed validation`);
      }
    }
    
    console.log(`❌ Post-validation rescan failed: No valid alternative found after ${maxAttempts} attempts`);
    return null;
  }

  private static async generateAlternativeSignal(originalSignal: ValidationInput, attempt: number): Promise<ValidationInput | null> {
    // Modify parameters based on attempt number to find a valid signal
    const adjustmentFactor = 1 + (attempt * 0.2); // 1.2x, 1.4x, 1.6x adjustments
    const minDistance = this.getMinimumDistance(originalSignal.pair, originalSignal.timeframe);
    
    // Try different stop loss distances
    const newSlDistance = minDistance * adjustmentFactor;
    const targetRRR = 2.5;
    
    let adjustedEntry = originalSignal.entry;
    let adjustedStopLoss: number;
    let adjustedTakeProfit: number;
    
    if (originalSignal.tradeType === 'BUY') {
      adjustedStopLoss = adjustedEntry - newSlDistance;
      adjustedTakeProfit = adjustedEntry + (newSlDistance * targetRRR);
    } else {
      adjustedStopLoss = adjustedEntry + newSlDistance;
      adjustedTakeProfit = adjustedEntry - (newSlDistance * targetRRR);
    }
    
    // Simulate slight entry adjustment for better structure
    const entryAdjustment = newSlDistance * 0.1; // 10% of SL distance
    if (Math.random() > 0.5) {
      adjustedEntry += originalSignal.tradeType === 'BUY' ? entryAdjustment : -entryAdjustment;
      
      // Recalculate levels with new entry
      if (originalSignal.tradeType === 'BUY') {
        adjustedStopLoss = adjustedEntry - newSlDistance;
        adjustedTakeProfit = adjustedEntry + (newSlDistance * targetRRR);
      } else {
        adjustedStopLoss = adjustedEntry + newSlDistance;
        adjustedTakeProfit = adjustedEntry - (newSlDistance * targetRRR);
      }
    }
    
    return {
      ...originalSignal,
      entry: adjustedEntry,
      stopLoss: adjustedStopLoss,
      takeProfit: adjustedTakeProfit,
      confidence: Math.max(originalSignal.confidence - (attempt * 2), this.MIN_CONFIDENCE), // Slightly reduce confidence
      justification: `${originalSignal.justification || ''} [Auto-adjusted via rescan attempt ${attempt}]`
    };
  }

  // Utility method for external validation
  static quickValidate(entry: number, stopLoss: number, takeProfit: number, tradeType: 'BUY' | 'SELL'): boolean {
    // Quick validation for critical errors only
    const slEntryDistance = Math.abs(entry - stopLoss);
    
    // Check for SL = Entry
    if (slEntryDistance < 0.000001) return false;
    
    // Check SL direction
    if (tradeType === 'BUY' && stopLoss >= entry) return false;
    if (tradeType === 'SELL' && stopLoss <= entry) return false;
    
    // Check TP direction
    if (tradeType === 'BUY' && takeProfit <= entry) return false;
    if (tradeType === 'SELL' && takeProfit >= entry) return false;
    
    // Check minimum RRR
    const tpDistance = Math.abs(takeProfit - entry);
    const rrr = tpDistance / slEntryDistance;
    
    return rrr >= this.MIN_RRR;
  }
}

export const bulletproofValidator = new BulletproofSignalValidator();
export type { ValidationInput, ValidationResult };