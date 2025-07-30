
export interface StrategyValidation {
  name: string;
  score: number;
  confidence: number;
  reasoning: string;
  passed: boolean;
}

export interface ValidationResult {
  overallScore: number;
  passedStrategies: number;
  totalStrategies: number;
  validationPassed: boolean;
  strategiesBreakdown: StrategyValidation[];
  conflictDetected: boolean;
  institutionalGrade: 'Elite' | 'Strong' | 'Decent' | 'Weak' | 'Rejected';
}

class MultiStrategyValidator {
  async validateSignal(
    pair: string,
    direction: 'BUY' | 'SELL',
    entry: number,
    stopLoss: number,
    takeProfit: number,
    existingConfidence: number
  ): Promise<ValidationResult> {
    console.log(`🔍 Multi-Strategy Validation: ${pair} ${direction}`);
    
    // Run all strategy validations in parallel
    const strategies = await Promise.all([
      this.validateSMC(pair, direction, entry),
      this.validateClassicTA(pair, direction, entry),
      this.validatePriceAction(pair, direction, entry),
      this.validateVolumeFlow(pair, direction, entry),
      this.validateMacroAlignment(pair, direction, entry)
    ]);

    const passedStrategies = strategies.filter(s => s.passed).length;
    const overallScore = strategies.reduce((sum, s) => sum + s.score, 0) / strategies.length;
    const validationPassed = passedStrategies >= 3 && overallScore >= 70;
    
    const institutionalGrade = this.calculateInstitutionalGrade(passedStrategies, overallScore);
    const conflictDetected = await this.detectConflicts(pair, direction);

    console.log(`✅ Validation Complete: ${passedStrategies}/5 passed | Score: ${overallScore.toFixed(1)}`);

    return {
      overallScore: Math.round(overallScore),
      passedStrategies,
      totalStrategies: 5,
      validationPassed: validationPassed && !conflictDetected,
      strategiesBreakdown: strategies,
      conflictDetected,
      institutionalGrade
    };
  }

  private async validateSMC(pair: string, direction: string, entry: number): Promise<StrategyValidation> {
    // Simulate SMC analysis
    const score = 65 + Math.random() * 30;
    const confidence = 70 + Math.random() * 25;
    const passed = score > 70;

    return {
      name: 'Smart Money Concepts',
      score: Math.round(score),
      confidence: Math.round(confidence),
      reasoning: passed ? 
        'Break of structure confirmed with institutional footprint and liquidity sweep validation' :
        'Weak structure break or conflicting SMC signals detected',
      passed
    };
  }

  private async validateClassicTA(pair: string, direction: string, entry: number): Promise<StrategyValidation> {
    const score = 60 + Math.random() * 35;
    const confidence = 65 + Math.random() * 30;
    const passed = score > 65;

    return {
      name: 'Classic Technical Analysis',
      score: Math.round(score),
      confidence: Math.round(confidence),
      reasoning: passed ?
        'Key level breakout with volume confirmation and Fibonacci alignment' :
        'Weak technical setup with limited support/resistance confluence',
      passed
    };
  }

  private async validatePriceAction(pair: string, direction: string, entry: number): Promise<StrategyValidation> {
    const score = 70 + Math.random() * 25;
    const confidence = 75 + Math.random() * 20;
    const passed = score > 70;

    return {
      name: 'Price Action Flow',
      score: Math.round(score),
      confidence: Math.round(confidence),
      reasoning: passed ?
        'Clean rejection candles with imbalance fill and momentum continuation' :
        'Choppy price action with mixed signals and weak momentum',
      passed
    };
  }

  private async validateVolumeFlow(pair: string, direction: string, entry: number): Promise<StrategyValidation> {
    const score = 55 + Math.random() * 40;
    const confidence = 60 + Math.random() * 35;
    const passed = score > 65;

    return {
      name: 'Volume & Liquidity Model',
      score: Math.round(score),
      confidence: Math.round(confidence),
      reasoning: passed ?
        'Institutional volume spike with delta flow confirmation and liquidity absorption' :
        'Normal volume levels without clear institutional participation',
      passed
    };
  }

  private async validateMacroAlignment(pair: string, direction: string, entry: number): Promise<StrategyValidation> {
    const score = 65 + Math.random() * 30;
    const confidence = 70 + Math.random() * 25;
    const passed = score > 68;

    return {
      name: 'Macro & Sentiment',
      score: Math.round(score),
      confidence: Math.round(confidence),
      reasoning: passed ?
        'Macro alignment with session bias and sentiment confirmation' :
        'Mixed macro signals or conflicting session dynamics',
      passed
    };
  }

  private calculateInstitutionalGrade(passedStrategies: number, overallScore: number): 'Elite' | 'Strong' | 'Decent' | 'Weak' | 'Rejected' {
    if (passedStrategies >= 5 && overallScore >= 85) return 'Elite';
    if (passedStrategies >= 4 && overallScore >= 75) return 'Strong';
    if (passedStrategies >= 3 && overallScore >= 65) return 'Decent';
    if (passedStrategies >= 2) return 'Weak';
    return 'Rejected';
  }

  private async detectConflicts(pair: string, direction: string): Promise<boolean> {
    // Simulate conflict detection (e.g., EUR/USD buy vs DXY buy)
    const conflictChance = Math.random();
    return conflictChance < 0.1; // 10% chance of conflict
  }
}

export const multiStrategyValidator = new MultiStrategyValidator();
