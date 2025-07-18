
export interface LiveMemeCoin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange1h: number;
  priceChange24h: number;
  liquidity: number;
  volume24h: number;
  txnsPerHour: number;
  ageHours: number;
  marketCap: number;
  holders: number;
  address?: string;
  healthScore?: number;
  healthLabel?: 'Safe' | 'Medium' | 'High Risk';
  stealthLaunch?: boolean;
  whaleActivity?: boolean;
  whaleTransactions?: { wallet: string; amount: number; txHash: string }[];
  riskQuadrant?: 'High Risk/Low Gain' | 'Low Risk/High Gain' | 'High Risk/High Gain' | 'Low Risk/Low Gain';
  volumeSpike?: boolean;
  listedAgo?: string;
  lpLocked?: boolean;
  exchangeUrl?: string;
  whyChosen?: string;
  alerts?: string[];
  pairAge?: string;
}

export class LiveMemeCoinService {
  async scanLiveCoins(): Promise<LiveMemeCoin[]> {
    // Mock implementation for now
    return [
      {
        id: '1',
        name: 'SafeMoon',
        symbol: 'SAFEMOON',
        price: 0.0001234,
        priceChange1h: 5.2,
        priceChange24h: 15.8,
        liquidity: 850000,
        volume24h: 2500000,
        txnsPerHour: 245,
        ageHours: 8,
        marketCap: 125000000,
        holders: 8500,
        healthScore: 85,
        healthLabel: 'Safe',
        stealthLaunch: false,
        whaleActivity: true,
        volumeSpike: true,
        listedAgo: '8h ago',
        lpLocked: true,
        exchangeUrl: 'https://poocoin.app',
        whyChosen: 'Strong fundamentals',
        alerts: ['Volume Spike', 'Whale Buy']
      }
    ];
  }

  async getCoins(): Promise<LiveMemeCoin[]> {
    return this.scanLiveCoins();
  }
}

export const liveMemeCoinService = new LiveMemeCoinService();
