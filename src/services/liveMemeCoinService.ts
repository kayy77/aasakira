export interface LiveMemeCoin {
  name: string;
  symbol: string;
  price: number;
  liquidity: number;
  volume24h: number;
  txnsPerHour: number;
  ageHours: number;
  marketCap: number;
  address?: string;
  healthScore?: number;
  healthLabel?: 'Safe' | 'Medium' | 'High Risk';
  riskQuadrant?: 'High Risk/Low Gain' | 'Low Risk/High Gain' | 'High Risk/High Gain' | 'Low Risk/Low Gain';
  whaleActivity?: boolean;
  stealthLaunch?: boolean;
  whaleTransactions?: { wallet: string; amount: number; txHash: string }[];
  // Additional properties used in LiveMemeCoinDashboard
  riskScore?: number;
  rugRisk?: number;
  txCount1h?: number;
  priceChange1h?: number;
  priceChange24h?: number;
  miniChart?: number[];
  liquidityLocked?: boolean;
  lastUpdated?: string;
}

export class LiveMemeCoinService {
  private static instance: LiveMemeCoinService;
  private cache = new Map<string, { data: LiveMemeCoin[]; timestamp: number }>();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds

  static getInstance(): LiveMemeCoinService {
    if (!LiveMemeCoinService.instance) {
      LiveMemeCoinService.instance = new LiveMemeCoinService();
    }
    return LiveMemeCoinService.instance;
  }

  async getAlerts(): Promise<any[]> {
    // Mock implementation for alerts
    return [];
  }

  async fetchLiveCoins(): Promise<LiveMemeCoin[]> {
    const cacheKey = 'live-coins';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Mock data with all required properties
      const mockCoins: LiveMemeCoin[] = [
        {
          name: "PepeCoin",
          symbol: "PEPE",
          price: 0.000001234,
          liquidity: 1250000,
          volume24h: 2500000,
          txnsPerHour: 450,
          ageHours: 72,
          marketCap: 12500000,
          address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
          healthScore: 85,
          healthLabel: "Safe",
          riskScore: 25,
          rugRisk: 15,
          txCount1h: 120,
          priceChange1h: 5.2,
          priceChange24h: 12.8,
          miniChart: [100, 105, 103, 108, 112, 110, 115],
          liquidityLocked: true,
          lastUpdated: new Date().toISOString(),
          whaleActivity: true,
          stealthLaunch: false,
          riskQuadrant: "Low Risk/High Gain"
        }
      ];

      this.cache.set(cacheKey, { data: mockCoins, timestamp: Date.now() });
      return mockCoins;
    } catch (error) {
      console.error('Error fetching live coins:', error);
      return [];
    }
  }
}

export const liveMemeCoinService = LiveMemeCoinService.getInstance();
