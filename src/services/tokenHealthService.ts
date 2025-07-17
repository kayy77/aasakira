
interface TokenHealthMetrics {
  liquidityLocked: boolean;
  liquidityPercentage: number;
  volumeStability: number;
  transactionConsistency: number;
  holderGrowth: number;
  tokenAge: number; // in hours
  whaleActivity: number;
  socialBuzz: number;
  contractVerified: boolean;
  ownershipRenounced: boolean;
}

interface HealthScore {
  overall: number;
  breakdown: {
    liquidity: number;
    volume: number;
    transactions: number;
    holders: number;
    age: number;
    whale: number;
    social: number;
    security: number;
  };
  label: 'Safe' | 'Caution' | 'Danger';
  risk: 'Low' | 'Medium' | 'High';
  recommendation: string;
}

interface RiskQuadrant {
  x: number; // Risk level (0-100)
  y: number; // Potential gain (0-100)
  quadrant: 'Low Risk Low Reward' | 'Low Risk High Reward' | 'High Risk Low Reward' | 'High Risk High Reward';
  color: string;
}

class TokenHealthService {
  calculateHealthScore(metrics: TokenHealthMetrics): HealthScore {
    const breakdown = {
      liquidity: this.scoreLiquidity(metrics),
      volume: this.scoreVolume(metrics),
      transactions: this.scoreTransactions(metrics),
      holders: this.scoreHolders(metrics),
      age: this.scoreAge(metrics),
      whale: this.scoreWhaleActivity(metrics),
      social: this.scoreSocialBuzz(metrics),
      security: this.scoreSecurity(metrics)
    };

    // Weighted average (security and liquidity are most important)
    const overall = Math.round(
      (breakdown.security * 0.25) +
      (breakdown.liquidity * 0.20) +
      (breakdown.volume * 0.15) +
      (breakdown.transactions * 0.15) +
      (breakdown.holders * 0.10) +
      (breakdown.age * 0.05) +
      (breakdown.whale * 0.05) +
      (breakdown.social * 0.05)
    );

    const label = this.getHealthLabel(overall);
    const risk = this.getRiskLevel(overall);
    const recommendation = this.getRecommendation(overall, breakdown);

    return {
      overall,
      breakdown,
      label,
      risk,
      recommendation
    };
  }

  private scoreLiquidity(metrics: TokenHealthMetrics): number {
    let score = 0;
    
    if (metrics.liquidityLocked) score += 40;
    
    if (metrics.liquidityPercentage >= 80) score += 30;
    else if (metrics.liquidityPercentage >= 60) score += 20;
    else if (metrics.liquidityPercentage >= 40) score += 10;
    
    return Math.min(100, score);
  }

  private scoreVolume(metrics: TokenHealthMetrics): number {
    // Volume stability score (0-100)
    if (metrics.volumeStability >= 0.9) return 90;
    if (metrics.volumeStability >= 0.7) return 70;
    if (metrics.volumeStability >= 0.5) return 50;
    if (metrics.volumeStability >= 0.3) return 30;
    return 10;
  }

  private scoreTransactions(metrics: TokenHealthMetrics): number {
    // Transaction consistency score
    return Math.min(100, metrics.transactionConsistency * 100);
  }

  private scoreHolders(metrics: TokenHealthMetrics): number {
    // Holder growth rate score
    if (metrics.holderGrowth >= 50) return 100;
    if (metrics.holderGrowth >= 25) return 80;
    if (metrics.holderGrowth >= 10) return 60;
    if (metrics.holderGrowth >= 5) return 40;
    return 20;
  }

  private scoreAge(metrics: TokenHealthMetrics): number {
    // Age scoring (sweet spot is 24-168 hours)
    if (metrics.tokenAge < 1) return 20; // Too new
    if (metrics.tokenAge <= 24) return 100; // Prime time
    if (metrics.tokenAge <= 168) return 80; // Still good
    if (metrics.tokenAge <= 720) return 50; // Older but ok
    return 30; // Old token
  }

  private scoreWhaleActivity(metrics: TokenHealthMetrics): number {
    // Whale activity can be good or bad
    if (metrics.whaleActivity >= 80) return 60; // High activity might be risky
    if (metrics.whaleActivity >= 40) return 90; // Moderate activity is good
    if (metrics.whaleActivity >= 20) return 70; // Some activity
    return 40; // Low whale interest
  }

  private scoreSocialBuzz(metrics: TokenHealthMetrics): number {
    return Math.min(100, metrics.socialBuzz);
  }

  private scoreSecurity(metrics: TokenHealthMetrics): number {
    let score = 0;
    
    if (metrics.contractVerified) score += 40;
    if (metrics.ownershipRenounced) score += 30;
    if (metrics.liquidityLocked) score += 30;
    
    return score;
  }

  private getHealthLabel(score: number): 'Safe' | 'Caution' | 'Danger' {
    if (score >= 75) return 'Safe';
    if (score >= 50) return 'Caution';
    return 'Danger';
  }

  private getRiskLevel(score: number): 'Low' | 'Medium' | 'High' {
    if (score >= 75) return 'Low';
    if (score >= 50) return 'Medium';
    return 'High';
  }

  private getRecommendation(score: number, breakdown: any): string {
    if (score >= 80) return 'Strong fundamentals. Good for position trading.';
    if (score >= 60) return 'Decent metrics. Suitable for swing trading with caution.';
    if (score >= 40) return 'Mixed signals. Only for experienced traders.';
    return 'High risk. Avoid or use minimal position size only.';
  }

  calculateRiskQuadrant(healthScore: HealthScore, priceChange24h: number, volume24h: number): RiskQuadrant {
    // Risk calculation (inverse of health)
    const risk = 100 - healthScore.overall;
    
    // Potential gain based on recent performance and volume
    let potentialGain = 0;
    if (Math.abs(priceChange24h) > 50) potentialGain += 40;
    else if (Math.abs(priceChange24h) > 20) potentialGain += 30;
    else if (Math.abs(priceChange24h) > 10) potentialGain += 20;
    
    if (volume24h > 1000000) potentialGain += 30;
    else if (volume24h > 500000) potentialGain += 20;
    else if (volume24h > 100000) potentialGain += 10;
    
    // Age bonus for potential
    if (healthScore.breakdown.age > 80) potentialGain += 20;
    
    potentialGain = Math.min(100, potentialGain);

    let quadrant: RiskQuadrant['quadrant'];
    let color: string;

    if (risk < 50 && potentialGain >= 50) {
      quadrant = 'Low Risk High Reward';
      color = '#22c55e'; // green
    } else if (risk < 50 && potentialGain < 50) {
      quadrant = 'Low Risk Low Reward';
      color = '#3b82f6'; // blue
    } else if (risk >= 50 && potentialGain >= 50) {
      quadrant = 'High Risk High Reward';
      color = '#f59e0b'; // amber
    } else {
      quadrant = 'High Risk Low Reward';
      color = '#ef4444'; // red
    }

    return {
      x: risk,
      y: potentialGain,
      quadrant,
      color
    };
  }

  // Generate mock health metrics for demo
  generateMockHealthMetrics(): TokenHealthMetrics {
    return {
      liquidityLocked: Math.random() > 0.3,
      liquidityPercentage: 60 + Math.random() * 40,
      volumeStability: 0.3 + Math.random() * 0.7,
      transactionConsistency: 0.4 + Math.random() * 0.6,
      holderGrowth: Math.random() * 100,
      tokenAge: Math.random() * 168, // 0-168 hours
      whaleActivity: Math.random() * 100,
      socialBuzz: Math.random() * 100,
      contractVerified: Math.random() > 0.2,
      ownershipRenounced: Math.random() > 0.4
    };
  }
}

export const tokenHealthService = new TokenHealthService();
export type { TokenHealthMetrics, HealthScore, RiskQuadrant };
