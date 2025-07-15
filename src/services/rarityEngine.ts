
interface RarityAnalysis {
  rarity: 'common' | 'rare' | 'epic' | 'mythical';
  score: number;
  factors: string[];
  color: string;
  emoji: string;
  description: string;
}

interface TradeSetup {
  confluence: number; // 1-10
  frequency: number; // how often this setup appears (1-10, 1 = very rare)
  historicalWinRate: number; // 0-100%
  volumeProfile: number; // 1-10
  timeframe: string;
  marketCondition: 'trending' | 'ranging' | 'volatile';
}

class RarityEngine {
  private rarityThresholds = {
    mythical: 85,
    epic: 70,
    rare: 50,
    common: 0
  };

  analyzeSignalRarity(setup: TradeSetup): RarityAnalysis {
    let score = 0;
    const factors: string[] = [];

    // Confluence scoring (30% weight)
    const confluenceScore = (setup.confluence / 10) * 30;
    score += confluenceScore;
    if (setup.confluence >= 8) {
      factors.push(`High confluence (${setup.confluence}/10 confirmations)`);
    }

    // Frequency scoring - rarer = higher score (25% weight)
    const frequencyScore = ((10 - setup.frequency) / 10) * 25;
    score += frequencyScore;
    if (setup.frequency <= 3) {
      factors.push(`Ultra-rare setup (occurs ${setup.frequency}/10 frequency)`);
    }

    // Historical win rate (25% weight)
    const winRateScore = (setup.historicalWinRate / 100) * 25;
    score += winRateScore;
    if (setup.historicalWinRate >= 75) {
      factors.push(`Proven track record (${setup.historicalWinRate}% win rate)`);
    }

    // Volume profile (20% weight)
    const volumeScore = (setup.volumeProfile / 10) * 20;
    score += volumeScore;
    if (setup.volumeProfile >= 8) {
      factors.push(`Strong institutional volume profile`);
    }

    // Market condition bonus
    if (setup.marketCondition === 'trending' && setup.confluence >= 7) {
      score += 5;
      factors.push(`Perfect trending market alignment`);
    }

    // Timeframe bonus for higher timeframes
    if (['4H', 'D', 'W'].includes(setup.timeframe) && score >= 60) {
      score += 10;
      factors.push(`Higher timeframe confirmation`);
    }

    return this.mapScoreToRarity(Math.min(score, 100), factors);
  }

  analyzeMemeCoinRarity(coinData: {
    hypeScore: number; // 1-10
    volumeSpike: number; // 1-10
    socialSentiment: number; // 1-10
    marketCap: number;
    age: number; // days
    influencerBacking: boolean;
    utilityScore: number; // 1-10
  }): RarityAnalysis {
    let score = 0;
    const factors: string[] = [];

    // Hype momentum (25% weight)
    const hypeScore = (coinData.hypeScore / 10) * 25;
    score += hypeScore;
    if (coinData.hypeScore >= 8) {
      factors.push(`Viral hype momentum (${coinData.hypeScore}/10)`);
    }

    // Volume explosion (30% weight)
    const volumeScore = (coinData.volumeSpike / 10) * 30;
    score += volumeScore;
    if (coinData.volumeSpike >= 8) {
      factors.push(`Massive volume spike detected`);
    }

    // Social sentiment (20% weight)
    const sentimentScore = (coinData.socialSentiment / 10) * 20;
    score += sentimentScore;
    if (coinData.socialSentiment >= 7) {
      factors.push(`Overwhelmingly positive sentiment`);
    }

    // Market cap sweet spot (15% weight)
    let capScore = 0;
    if (coinData.marketCap > 1000000 && coinData.marketCap < 50000000) {
      capScore = 15; // Sweet spot for moon potential
      factors.push(`Perfect market cap range for explosive growth`);
    } else if (coinData.marketCap < 1000000) {
      capScore = 10; // High risk, high reward
      factors.push(`Ultra-low market cap - extreme risk/reward`);
    }
    score += capScore;

    // Age factor (10% weight)
    let ageScore = 0;
    if (coinData.age <= 7 && coinData.hypeScore >= 6) {
      ageScore = 10;
      factors.push(`Fresh launch with immediate traction`);
    } else if (coinData.age <= 30) {
      ageScore = 5;
      factors.push(`Young coin with growth potential`);
    }
    score += ageScore;

    // Influencer backing bonus
    if (coinData.influencerBacking && coinData.hypeScore >= 6) {
      score += 15;
      factors.push(`Major influencer endorsement`);
    }

    // Utility bonus
    if (coinData.utilityScore >= 7) {
      score += 10;
      factors.push(`Strong utility and use case`);
    }

    return this.mapScoreToRarity(Math.min(score, 100), factors);
  }

  private mapScoreToRarity(score: number, factors: string[]): RarityAnalysis {
    if (score >= this.rarityThresholds.mythical) {
      return {
        rarity: 'mythical',
        score: Math.round(score),
        factors,
        color: 'text-yellow-400',
        emoji: '🏆',
        description: 'Once-in-a-quarter legendary opportunity'
      };
    } else if (score >= this.rarityThresholds.epic) {
      return {
        rarity: 'epic',
        score: Math.round(score),
        factors,
        color: 'text-purple-400',
        emoji: '💎',
        description: 'High-probability premium setup'
      };
    } else if (score >= this.rarityThresholds.rare) {
      return {
        rarity: 'rare',
        score: Math.round(score),
        factors,
        color: 'text-blue-400',
        emoji: '⚡',
        description: 'Solid opportunity with good potential'
      };
    } else {
      return {
        rarity: 'common',
        score: Math.round(score),
        factors,
        color: 'text-green-400',
        emoji: '📈',
        description: 'Standard trading opportunity'
      };
    }
  }

  generateRarityBadge(analysis: RarityAnalysis): string {
    const rarityMap = {
      mythical: '🏆 MYTHICAL',
      epic: '💎 EPIC',
      rare: '⚡ RARE',
      common: '📈 COMMON'
    };
    return rarityMap[analysis.rarity];
  }
}

export const rarityEngine = new RarityEngine();
export type { RarityAnalysis, TradeSetup };
