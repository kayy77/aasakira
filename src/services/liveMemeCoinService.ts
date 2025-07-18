
import { LiveMemeCoin } from '@/integrations/supabase/types';

export class LiveMemeCoinService {
  private coins: LiveMemeCoin[] = [];

  async getTokens(): Promise<LiveMemeCoin[]> {
    // Mock data with all required properties
    const mockTokens: LiveMemeCoin[] = [
      {
        name: "PepeCoin",
        symbol: "PEPE", 
        price: 0.000001234,
        liquidity: 2500000,
        volume24h: 1250000,
        priceChange1h: 12.5,
        priceChange24h: 45.2,
        priceChange5m: 3.8,
        txnsPerHour: 450,
        txCount1h: 450,
        ageHours: 24,
        marketCap: 125000000,
        address: "0x1234567890abcdef",
        healthScore: 85,
        healthLabel: "Safe",
        stealthLaunch: false,
        whaleActivity: true,
        whaleTransactions: [
          { wallet: "0xabcd...", amount: 50000, txHash: "0x123..." }
        ],
        riskQuadrant: "Low Risk/High Gain",
        riskScore: 25,
        rugRisk: false,
        liquidityLocked: true,
        miniChart: [],
        lastUpdated: new Date().toISOString()
      }
    ];
    
    this.coins = mockTokens;
    return mockTokens;
  }

  async getAlerts(): Promise<any[]> {
    return [];
  }

  getHealthScore(coin: LiveMemeCoin): number {
    return coin.healthScore || 50;
  }

  private calculateHealthScore(coin: LiveMemeCoin): number {
    let score = 50;
    
    if (coin.liquidity > 1000000) score += 20;
    if (coin.ageHours > 24) score += 15;
    if (!coin.rugRisk) score += 15;
    
    return Math.min(100, score);
  }
}

export const liveMemeCoinService = new LiveMemeCoinService();
