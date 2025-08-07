
import { groqService } from './groqService';

export interface StrategyFilter {
  name: string;
  passed: boolean;
  score: number;
  reasoning: string;
  weight: number;
}

export interface InstitutionalValidation {
  filters: StrategyFilter[];
  overallScore: number;
  passedFilters: number;
  totalFilters: number;
  institutionalGrade: 'ELITE' | 'INSTITUTIONAL' | 'PROFESSIONAL' | 'STANDARD' | 'REJECTED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  recommendation: 'TAKE_FULL' | 'TAKE_REDUCED' | 'WATCH_ONLY' | 'AVOID';
}

export class InstitutionalSignalValidator {
  private static readonly STRATEGY_FILTERS = [
    { name: 'SMC Structure', weight: 3.0, minScore: 70 },
    { name: 'Liquidity Sweep', weight: 2.5, minScore: 65 },
    { name: 'Fair Value Gap', weight: 2.5, minScore: 65 },
    { name: 'Volume Analysis', weight: 2.0, minScore: 60 },
    { name: 'Session Timing', weight: 1.5, minScore: 55 },
    { name: 'RSI Divergence', weight: 2.0, minScore: 60 }
  ];

  static async validateInstitutionalSignal(
    pair: string,
    direction: 'BUY' | 'SELL',
    entry: number,
    stopLoss: number,
    takeProfit: number,
    confidence: number
  ): Promise<InstitutionalValidation> {
    console.log(`🏛️ Running institutional validation for ${pair} ${direction}`);

    // Run all strategy filters in parallel
    const filterPromises = this.STRATEGY_FILTERS.map(filterConfig => 
      this.runStrategyFilter(pair, direction, entry, filterConfig)
    );

    const filters = await Promise.all(filterPromises);
    
    // Calculate institutional metrics
    const passedFilters = filters.filter(f => f.passed).length;
    const totalFilters = filters.length;
    const overallScore = this.calculateOverallScore(filters);
    
    // Determine institutional grade
    const institutionalGrade = this.determineInstitutionalGrade(
      overallScore, 
      passedFilters, 
      totalFilters, 
      confidence
    );
    
    // Assess risk and recommendation
    const riskLevel = this.assessRiskLevel(institutionalGrade, overallScore);
    const recommendation = this.generateRecommendation(institutionalGrade, riskLevel);

    console.log(`📊 Institutional validation complete: ${institutionalGrade} grade, ${passedFilters}/${totalFilters} filters`);

    return {
      filters,
      overallScore,
      passedFilters,
      totalFilters,
      institutionalGrade,
      riskLevel,
      recommendation
    };
  }

  private static async runStrategyFilter(
    pair: string,
    direction: 'BUY' | 'SELL',
    entry: number,
    filterConfig: any
  ): Promise<StrategyFilter> {
    try {
      const prompt = this.buildFilterPrompt(pair, direction, entry, filterConfig.name);
      const response = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.1,
        max_tokens: 200
      });

      const analysis = this.parseFilterResponse(response);
      
      return {
        name: filterConfig.name,
        passed: analysis.score >= filterConfig.minScore,
        score: analysis.score,
        reasoning: analysis.reasoning,
        weight: filterConfig.weight
      };
    } catch (error) {
      console.error(`Filter ${filterConfig.name} failed:`, error);
      return {
        name: filterConfig.name,
        passed: false,
        score: 0,
        reasoning: 'Analysis failed - system error',
        weight: filterConfig.weight
      };
    }
  }

  private static buildFilterPrompt(pair: string, direction: 'BUY' | 'SELL', entry: number, filterName: string): string {
    const baseContext = `Analyze ${pair} for ${direction} at ${entry} focusing on ${filterName}`;
    
    switch (filterName) {
      case 'SMC Structure':
        return `${baseContext}. Check for: Break of Structure, Order Blocks, Market Structure shifts. Score 0-100 based on structural integrity. Return: SCORE: X, REASONING: [brief explanation]`;
      
      case 'Liquidity Sweep':
        return `${baseContext}. Analyze: Liquidity grabs above/below key levels, stop hunts, sweep patterns. Score 0-100. Return: SCORE: X, REASONING: [brief explanation]`;
      
      case 'Fair Value Gap':
        return `${baseContext}. Identify: FVG presence, mitigation levels, imbalance zones. Score 0-100. Return: SCORE: X, REASONING: [brief explanation]`;
      
      case 'Volume Analysis':
        return `${baseContext}. Examine: Volume spikes, institutional footprint, smart money flow. Score 0-100. Return: SCORE: X, REASONING: [brief explanation]`;
      
      case 'Session Timing':
        return `${baseContext}. Assess: Current session volatility, optimal timing window, liquidity conditions. Score 0-100. Return: SCORE: X, REASONING: [brief explanation]`;
      
      case 'RSI Divergence':
        return `${baseContext}. Check: RSI divergence patterns, momentum shifts, overbought/oversold levels. Score 0-100. Return: SCORE: X, REASONING: [brief explanation]`;
      
      default:
        return `${baseContext}. Provide general analysis and score 0-100. Return: SCORE: X, REASONING: [brief explanation]`;
    }
  }

  private static parseFilterResponse(response: string): { score: number; reasoning: string } {
    try {
      const scoreMatch = response.match(/SCORE:\s*(\d+)/i);
      const reasoningMatch = response.match(/REASONING:\s*(.+)/i);
      
      return {
        score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
        reasoning: reasoningMatch ? reasoningMatch[1].trim() : 'No detailed reasoning provided'
      };
    } catch (error) {
      return {
        score: 0,
        reasoning: 'Failed to parse analysis'
      };
    }
  }

  private static calculateOverallScore(filters: StrategyFilter[]): number {
    let weightedScore = 0;
    let totalWeight = 0;
    
    filters.forEach(filter => {
      weightedScore += filter.score * filter.weight;
      totalWeight += filter.weight;
    });
    
    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  }

  private static determineInstitutionalGrade(
    overallScore: number,
    passedFilters: number,
    totalFilters: number,
    confidence: number
  ): 'ELITE' | 'INSTITUTIONAL' | 'PROFESSIONAL' | 'STANDARD' | 'REJECTED' {
    // Strict institutional requirements
    if (overallScore >= 85 && passedFilters >= 5 && confidence >= 90) {
      return 'ELITE';
    }
    
    if (overallScore >= 75 && passedFilters >= 4 && confidence >= 80) {
      return 'INSTITUTIONAL';
    }
    
    if (overallScore >= 65 && passedFilters >= 3 && confidence >= 70) {
      return 'PROFESSIONAL';
    }
    
    if (overallScore >= 55 && passedFilters >= 2 && confidence >= 60) {
      return 'STANDARD';
    }
    
    return 'REJECTED';
  }

  private static assessRiskLevel(
    grade: string,
    score: number
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
    switch (grade) {
      case 'ELITE':
        return 'LOW';
      case 'INSTITUTIONAL':
        return 'LOW';
      case 'PROFESSIONAL':
        return 'MEDIUM';
      case 'STANDARD':
        return 'HIGH';
      default:
        return 'EXTREME';
    }
  }

  private static generateRecommendation(
    grade: string,
    riskLevel: string
  ): 'TAKE_FULL' | 'TAKE_REDUCED' | 'WATCH_ONLY' | 'AVOID' {
    if (grade === 'ELITE' && riskLevel === 'LOW') {
      return 'TAKE_FULL';
    }
    
    if (grade === 'INSTITUTIONAL' || grade === 'PROFESSIONAL') {
      return 'TAKE_REDUCED';
    }
    
    if (grade === 'STANDARD') {
      return 'WATCH_ONLY';
    }
    
    return 'AVOID';
  }
}
