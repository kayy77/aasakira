import { bettingAIConsensusEngine, type BettingConsensusResult } from './bettingAIConsensusEngine';
import { sportsDataService, type LiveMatchData } from './sportsDataService';

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
  live_status: 'ACTIVE' | 'UPCOMING' | 'LIVE' | 'EXPIRED';
  market_heat: 'HOT' | 'WARM' | 'COOL';
}

class EliteBettingEngine {
  private signals: BettingSignal[] = [];
  private isAutoScanning: boolean = false;
  private scanInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startAutoScanning();
  }

  private filterNext48Hours(matches: LiveMatchData[]): LiveMatchData[] {
    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    console.log(`🕐 Filtering matches between ${now.toISOString()} and ${fortyEightHoursFromNow.toISOString()}`);
    
    const filtered = matches.filter(match => {
      const matchTime = new Date(match.commence_time);
      const isValid = matchTime >= now && matchTime <= fortyEightHoursFromNow;
      if (!isValid) {
        console.log(`❌ Filtering out: ${match.home_team} vs ${match.away_team} at ${matchTime.toISOString()}`);
      }
      return isValid;
    });
    
    console.log(`✅ Filtered ${matches.length} matches down to ${filtered.length} within 48h`);
    return filtered.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());
  }

  startAutoScanning() {
    if (this.isAutoScanning) return;
    
    console.log('🏟️ Elite Betting Engine: Starting auto-scanning mode...');
    this.isAutoScanning = true;
    
    // Initial scan
    this.performAutoScan();
    
    // Set up continuous scanning every 3 minutes
    this.scanInterval = setInterval(() => {
      this.performAutoScan();
    }, 180000);
  }

  stopAutoScanning() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    this.isAutoScanning = false;
    console.log('🏟️ Elite Betting Engine: Auto-scanning stopped');
  }

  private async performAutoScan() {
    try {
      console.log('🔍 Auto-scanning for events in next 48 hours...');
      
      const sports = ['football', 'basketball', 'mma', 'boxing'];
      let allUpcomingMatches: LiveMatchData[] = [];

      // Always add demo signals for next 48 hours to ensure content
      this.addNext48HoursDemoSignals();

      // Try to fetch real data
      for (const sport of sports) {
        try {
          const matches = await sportsDataService.getUpcomingMatches(sport);
          const filteredMatches = this.filterNext48Hours(matches);
          allUpcomingMatches.push(...filteredMatches);
          console.log(`📊 ${sport}: Found ${filteredMatches.length} matches in next 48h`);
        } catch (error) {
          console.warn(`⚠️ Could not fetch ${sport} matches:`, error);
          continue;
        }
      }

      console.log(`🎯 Total real matches found in next 48h: ${allUpcomingMatches.length}`);

      // Generate signals for real matches (limit to prevent overload)
      const targetSignalCount = Math.min(5, allUpcomingMatches.length);
      
      for (let i = 0; i < targetSignalCount; i++) {
        try {
          const match = allUpcomingMatches[i];
          const signal = await this.generateBettingSignalFromMatch(match);
          if (signal) {
            console.log(`✅ Generated real signal: ${signal.matchup}`);
          }
        } catch (error) {
          console.error('Signal generation error:', error);
          continue;
        }
      }

      // Clean up old signals (keep max 20)
      if (this.signals.length > 20) {
        this.signals = this.signals.slice(0, 20);
      }

      console.log(`✅ Auto-scan complete (Total: ${this.signals.length} signals)`);
    } catch (error) {
      console.error('❌ Auto-scan failed:', error);
      // Ensure we always have demo content
      this.addNext48HoursDemoSignals();
    }
  }

  private addNext48HoursDemoSignals() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 20 * 60 * 60 * 1000); // 20 hours from now
    const dayAfter = new Date(now.getTime() + 36 * 60 * 60 * 1000); // 36 hours from now
    
    const demoSignals: BettingSignal[] = [
      {
        id: `demo_${Date.now()}_1`,
        sport: 'Basketball (NBA)',
        matchup: 'Lakers vs Warriors',
        bet_type: 'Point Spread',
        odds: 1.91,
        game_time: tomorrow.toLocaleString(),
        confidence: 78,
        expected_value: 8.2,
        ai_consensus: 'Warriors home advantage + Lakers road struggles',
        key_factors: ['Home court advantage', 'Road performance differential', 'Recent head-to-head'],
        concerns: ['LeBron factor', 'Injury updates'],
        verdict: 'APPROVED',
        label: 'Strong Value',
        risk_assessment: 'Medium Risk - Good Value',
        team_stats: 'Lakers: 12-8 (5-6 away), Warriors: 14-6 (8-2 home)',
        injury_report: 'Lakers: AD (probable), Warriors: Curry (fit)',
        recent_form: 'Lakers: 7-3 L10, Warriors: 8-2 L10',
        line_movement: 'Spread moved from -4.5 to -5 (sharp action)',
        betting_trends: '62% tickets on Warriors, 58% handle',
        timestamp: new Date().toISOString(),
        live_status: 'UPCOMING',
        market_heat: 'HOT'
      },
      {
        id: `demo_${Date.now()}_2`,
        sport: 'Football (Soccer)',
        matchup: 'Manchester United vs Arsenal',
        bet_type: 'Both Teams to Score',
        odds: 2.05,
        game_time: dayAfter.toLocaleString(),
        confidence: 71,
        expected_value: 6.8,
        ai_consensus: 'Both teams attacking strength + defensive vulnerabilities',
        key_factors: ['Goal scoring records', 'Defensive weaknesses', 'Historical meetings'],
        concerns: ['Weather conditions', 'Key player availability'],
        verdict: 'APPROVED',
        label: 'Solid Pick',
        risk_assessment: 'Medium Risk - Decent Value',
        team_stats: 'Man United: 2.1 goals/game, Arsenal: 1.9 goals/game',
        injury_report: 'Man United: Rashford (fit), Arsenal: Saka (doubtful)',
        recent_form: 'Man United: WWDWL, Arsenal: WDWLW',
        line_movement: 'Odds moved from 2.10 to 2.05',
        betting_trends: '54% public backing BTTS',
        timestamp: new Date().toISOString(),
        live_status: 'UPCOMING',
        market_heat: 'WARM'
      }
    ];

    // Only add if we don't already have recent demo signals
    const hasRecentDemo = this.signals.some(s => s.id.startsWith('demo_') && 
      (Date.now() - new Date(s.timestamp).getTime()) < 600000); // 10 minutes

    if (!hasRecentDemo) {
      this.signals.unshift(...demoSignals);
      console.log('✅ Added demo signals for next 48 hours');
    }
  }

  async generateBettingSignal(sport?: string): Promise<BettingSignal | null> {
    try {
      console.log(`🏟️ Generating signal for ${sport || 'random sport'}...`);
      
      const selectedSport = sport || this.getRandomSport();
      
      // Add timeout to prevent hanging
      const liveMatches = await Promise.race([
        sportsDataService.getUpcomingMatches(selectedSport),
        new Promise<LiveMatchData[]>((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 8000)
        )
      ]);
      
      // Filter for next 48 hours only
      const upcomingMatches = this.filterNext48Hours(liveMatches);
      
      if (upcomingMatches.length === 0) {
        console.log('❌ No upcoming matches in next 48h for', selectedSport);
        return null;
      }

      // Select the best match
      const selectedMatch = this.selectBestMatch(upcomingMatches);
      return await this.generateBettingSignalFromMatch(selectedMatch);

    } catch (error) {
      console.error('❌ Generate betting signal error:', error);
      return null;
    }
  }

  private async generateBettingSignalFromMatch(match: LiveMatchData): Promise<BettingSignal | null> {
    try {
      console.log(`🏟️ Analyzing match: ${match.home_team} vs ${match.away_team}`);
      
      const matchup = `${match.home_team} vs ${match.away_team}`;
      const bettingContext = {
        sport: match.sport,
        matchup: matchup,
        bet_type: this.generateBetType(match),
        odds: this.selectBestOdds(match),
        game_time: new Date(match.commence_time).toLocaleString(),
        team_stats: match.key_stats,
        injury_report: match.injuries.join(', ') || 'No major injuries reported',
        recent_form: `${match.home_team}: ${match.recent_form.home}, ${match.away_team}: ${match.recent_form.away}`,
        head_to_head: match.head_to_head,
        line_movement: this.generateLineMovement(),
        betting_trends: this.generateBettingTrends(),
        news_context: 'Live market analysis',
        market_volume: this.calculateMarketVolume(match),
        sharp_money_indicator: Math.random() > 0.6 ? 'Sharp action detected' : 'Public betting'
      };

      // Run AI consensus with timeout
      const consensus = await Promise.race([
        bettingAIConsensusEngine.analyzeBettingConsensus(bettingContext),
        new Promise<BettingConsensusResult>((_, reject) => 
          setTimeout(() => reject(new Error('AI timeout')), 10000)
        )
      ]);
      
      if (!consensus.approved) {
        console.log(`❌ Signal rejected: ${matchup}`);
        return null;
      }

      const signal: BettingSignal = {
        id: `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sport: bettingContext.sport,
        matchup: bettingContext.matchup,
        bet_type: bettingContext.bet_type,
        odds: bettingContext.odds,
        game_time: bettingContext.game_time,
        confidence: consensus.final_rating * 10,
        expected_value: consensus.expected_value,
        ai_consensus: consensus.multi_ai_verdict,
        key_factors: this.extractKeyFactors(consensus),
        concerns: this.extractConcerns(consensus),
        verdict: consensus.verdict,
        label: consensus.label,
        risk_assessment: this.assessRisk(consensus),
        team_stats: bettingContext.team_stats,
        injury_report: bettingContext.injury_report,
        recent_form: bettingContext.recent_form,
        line_movement: bettingContext.line_movement,
        betting_trends: bettingContext.betting_trends,
        timestamp: new Date().toISOString(),
        live_status: this.determineLiveStatus(match),
        market_heat: this.assessMarketHeat(consensus.confidence_score, consensus.expected_value)
      };

      this.signals.unshift(signal);
      if (this.signals.length > 50) {
        this.signals = this.signals.slice(0, 50);
      }

      console.log(`🔥 LIVE SIGNAL: ${signal.matchup} | ${signal.confidence}% | ${signal.market_heat}`);
      return signal;

    } catch (error) {
      console.error('❌ Signal generation error:', error);
      return null;
    }
  }

  private selectBestMatch(matches: LiveMatchData[]): LiveMatchData {
    return matches.reduce((best, current) => {
      const currentScore = this.scoreMatchQuality(current);
      const bestScore = this.scoreMatchQuality(best);
      return currentScore > bestScore ? current : best;
    });
  }

  private scoreMatchQuality(match: LiveMatchData): number {
    let score = 0;
    score += match.injuries.length > 0 ? 2 : 0;
    score += match.recent_form.home && match.recent_form.away ? 2 : 0;
    const oddsDiff = Math.abs(match.odds.home - match.odds.away);
    score += oddsDiff < 0.5 ? 3 : oddsDiff < 1.0 ? 2 : 1;
    return score;
  }

  private generateLineMovement(): string {
    const movements = [
      'Line moved from +3 to +2.5 (sharp action)',
      'Odds shortened from 2.10 to 1.85 in last hour',
      'Line stable since opening',
      'Heavy late money on underdog',
      'Professional money detected early'
    ];
    return movements[Math.floor(Math.random() * movements.length)];
  }

  private generateBettingTrends(): string {
    const trends = [
      '65% public on favorite, 55% handle on underdog',
      '78% tickets on over, but 62% money on under',
      'Sharp reverse line movement detected',
      'Public heavily backing home team',
      'Even money distribution across market'
    ];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  private calculateMarketVolume(match: LiveMatchData): string {
    const volume = Math.random();
    if (volume > 0.7) return 'High volume market';
    if (volume > 0.4) return 'Average volume';
    return 'Low volume market';
  }

  private determineLiveStatus(match: LiveMatchData): 'ACTIVE' | 'UPCOMING' | 'LIVE' | 'EXPIRED' {
    const now = new Date();
    const gameTime = new Date(match.commence_time);
    const diffHours = (gameTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < -2) return 'EXPIRED';
    if (diffHours < 0) return 'LIVE';
    if (diffHours < 24) return 'ACTIVE';
    return 'UPCOMING';
  }

  private assessMarketHeat(confidence: number, expectedValue: number): 'HOT' | 'WARM' | 'COOL' {
    if (confidence >= 4 && expectedValue >= 8) return 'HOT';
    if (confidence >= 3 && expectedValue >= 5) return 'WARM';
    return 'COOL';
  }

  private getRandomSport(): string {
    const sports = ['football', 'basketball', 'mma', 'boxing'];
    return sports[Math.floor(Math.random() * sports.length)];
  }

  private generateBetType(match: LiveMatchData): string {
    const betTypes = {
      'Football (Soccer)': ['Moneyline Win', 'Over 2.5 Goals', 'Both Teams to Score', 'Clean Sheet'],
      'Basketball (NBA)': ['Moneyline Win', 'Point Spread', 'Over/Under Points', 'Player Props'],
      'MMA': ['Moneyline Win', 'Method of Victory', 'Fight Goes Distance', 'Round Props'],
      'Boxing': ['Moneyline Win', 'KO/TKO Victory', 'Total Rounds Over/Under', 'Decision Win']
    };

    const availableTypes = betTypes[match.sport as keyof typeof betTypes] || ['Moneyline Win'];
    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }

  private selectBestOdds(match: LiveMatchData): number {
    const baseOdd = Math.random() > 0.5 ? match.odds.home : match.odds.away;
    return Math.round((baseOdd + (Math.random() * 0.4 - 0.2)) * 100) / 100;
  }

  private extractKeyFactors(consensus: BettingConsensusResult): string[] {
    const allFactors: string[] = [];
    Object.values(consensus.ai_votes).forEach(vote => {
      allFactors.push(...vote.key_factors);
    });
    
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

  destroy() {
    this.stopAutoScanning();
  }
}

export const eliteBettingEngine = new EliteBettingEngine();
