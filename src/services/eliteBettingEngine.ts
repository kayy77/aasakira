
import { bettingAIConsensusEngine, type BettingConsensusResult } from './bettingAIConsensusEngine';

export interface BettingSignal {
  id: string;
  sport: string;
  matchup: string;
  bet_type: string;
  odds: number;
  game_time: string;
  confidence: number;
  expected_value: number;
  ai_consensus: string;
  key_factors: string[];
  concerns: string[];
  verdict: 'APPROVED' | 'REJECTED' | 'LOW_CONSENSUS';
  label: string;
  risk_assessment: string;
  team_stats: string;
  injury_report: string;
  recent_form: string;
  line_movement: string;
  betting_trends: string;
  timestamp: string;
}

class EliteBettingEngine {
  private signals: BettingSignal[] = [];

  async generateBettingSignal(): Promise<BettingSignal | null> {
    try {
      console.log('🏟️ Elite Betting Engine: Generating institutional-grade betting signal...');
      
      // Mock betting context - in real implementation, this would come from sports APIs
      const mockBettingContext = {
        sport: 'Basketball (NBA)',
        matchup: 'Lakers vs Warriors',
        bet_type: 'Warriors -3.5 Spread',
        odds: -110,
        game_time: '7:30 PM EST',
        team_stats: 'Warriors: 65% ATS home, Lakers: 45% ATS away last 10',
        injury_report: 'LeBron questionable (ankle), Curry probable',
        recent_form: 'Warriors 8-2 L10, Lakers 5-5 L10',
        head_to_head: 'Warriors won last 3 meetings by avg 8.5 pts',
        line_movement: 'Opened -2.5, moved to -3.5 (sharp money)',
        betting_trends: '67% public on Lakers, 58% handle on Warriors',
        news_context: 'Latest injury reports and team updates'
      };

      // Run multi-AI consensus analysis
      const consensus = await bettingAIConsensusEngine.analyzeBettingConsensus(mockBettingContext);
      
      if (!consensus.approved) {
        console.log('❌ Betting signal rejected by AI consensus');
        return null;
      }

      // Create betting signal
      const signal: BettingSignal = {
        id: `betting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sport: mockBettingContext.sport,
        matchup: mockBettingContext.matchup,
        bet_type: mockBettingContext.bet_type,
        odds: mockBettingContext.odds,
        game_time: mockBettingContext.game_time,
        confidence: consensus.final_rating * 10,
        expected_value: consensus.expected_value,
        ai_consensus: consensus.multi_ai_verdict,
        key_factors: this.extractKeyFactors(consensus),
        concerns: this.extractConcerns(consensus),
        verdict: consensus.verdict,
        label: consensus.label,
        risk_assessment: this.assessRisk(consensus),
        team_stats: mockBettingContext.team_stats,
        injury_report: mockBettingContext.injury_report,
        recent_form: mockBettingContext.recent_form,
        line_movement: mockBettingContext.line_movement,
        betting_trends: mockBettingContext.betting_trends,
        timestamp: new Date().toISOString()
      };

      // Add to signals array
      this.signals.unshift(signal);
      if (this.signals.length > 20) {
        this.signals = this.signals.slice(0, 20);
      }

      console.log(`✅ ELITE BETTING SIGNAL GENERATED: ${signal.matchup} | ${signal.confidence}% confidence | ${signal.expected_value}% EV`);
      return signal;

    } catch (error) {
      console.error('❌ Elite Betting Engine error:', error);
      return null;
    }
  }

  private extractKeyFactors(consensus: BettingConsensusResult): string[] {
    const allFactors: string[] = [];
    Object.values(consensus.ai_votes).forEach(vote => {
      allFactors.push(...vote.key_factors);
    });
    
    // Return top 3 most mentioned factors
    const factorCounts = allFactors.reduce((acc, factor) => {
      acc[factor] = (acc[factor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(factorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([factor]) => factor);
  }

  private extractConcerns(consensus: BettingConsensusResult): string[] {
    const allConcerns: string[] = [];
    Object.values(consensus.ai_votes).forEach(vote => {
      allConcerns.push(...vote.concerns);
    });
    
    // Return unique concerns
    return [...new Set(allConcerns)].slice(0, 3);
  }

  private assessRisk(consensus: BettingConsensusResult): string {
    const avgRating = consensus.final_rating;
    const confidenceScore = consensus.confidence_score;
    
    if (avgRating >= 8 && confidenceScore >= 4) return 'Low Risk - High Conviction';
    if (avgRating >= 6 && confidenceScore >= 3) return 'Medium Risk - Solid Edge';
    if (avgRating >= 5) return 'High Risk - Speculative';
    return 'Very High Risk - Avoid';
  }

  getSignals(): BettingSignal[] {
    return this.signals;
  }

  clearSignals(): void {
    this.signals = [];
  }

  getPerformanceStats() {
    const approvedSignals = this.signals.filter(s => s.verdict === 'APPROVED');
    const avgExpectedValue = approvedSignals.reduce((sum, s) => sum + s.expected_value, 0) / (approvedSignals.length || 1);
    
    return {
      totalSignals: this.signals.length,
      approvedSignals: approvedSignals.length,
      avgExpectedValue: Math.round(avgExpectedValue * 10) / 10,
      avgConfidence: Math.round(approvedSignals.reduce((sum, s) => sum + s.confidence, 0) / (approvedSignals.length || 1))
    };
  }
}

export const eliteBettingEngine = new EliteBettingEngine();
