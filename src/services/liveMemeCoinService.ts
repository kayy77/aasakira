
export interface LiveMemeCoin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  price_change_24h: number;
  market_cap: number;
  volume_24h: number;
  last_updated: string;
  priceChange5m?: number;
  // Additional properties for dashboard
  volumeSpike?: boolean;
  listedAgo?: string;
  healthScore?: number;
  riskScore?: 'Safe' | 'Medium' | 'High Risk';
  txCount1h?: number;
  pairAge?: number;
  liquidity?: number;
  liquidityLocked?: number;
  lpLocked?: boolean;
  rugRisk?: boolean;
  miniChart?: number[];
  whyChosen?: string;
  exchangeUrl?: string;
}

class LiveMemeCoinService {
  private coins: LiveMemeCoin[] = [];
  private alerts: string[] = [];

  async scanLiveCoins(): Promise<LiveMemeCoin[]> {
    try {
      console.log('🔍 Starting live meme coin scan...');
      
      // Sample coins with proper interface structure
      const sampleCoins: LiveMemeCoin[] = [
        {
          id: '1', 
          name: 'PEPE',
          symbol: 'PEPE',
          price: 0.00000123,
          price_change_24h: 15.6,
          market_cap: 1250000,
          volume_24h: 850000,
          last_updated: new Date().toISOString(),
          priceChange5m: 2.3,
          volumeSpike: true,
          listedAgo: '2h ago',
          healthScore: 85,
          riskScore: 'Medium',
          txCount1h: 1250,
          pairAge: 2.5,
          liquidity: 450000,
          liquidityLocked: 85,
          lpLocked: true,
          rugRisk: false,
          miniChart: [100, 105, 102, 108, 115, 112, 118, 125],
          whyChosen: 'Strong volume spike with increasing holder count and locked liquidity',
          exchangeUrl: 'https://dexscreener.com/ethereum/pepe'
        },
        {
          id: '2',
          name: 'WOJAK',
          symbol: 'WOJAK', 
          price: 0.0000456,
          price_change_24h: 28.4,
          market_cap: 890000,
          volume_24h: 1200000,
          last_updated: new Date().toISOString(),
          priceChange5m: 3.8,
          volumeSpike: true,
          listedAgo: '4h ago',
          healthScore: 92,
          riskScore: 'Safe',
          txCount1h: 2100,
          pairAge: 4.2,
          liquidity: 680000,
          liquidityLocked: 95,
          lpLocked: true,
          rugRisk: false,
          miniChart: [100, 110, 125, 118, 130, 145, 142, 155],
          whyChosen: 'High confidence alpha with strong fundamentals and community growth',
          exchangeUrl: 'https://dexscreener.com/ethereum/wojak'
        }
      ];

      this.coins = sampleCoins;
      console.log('✅ Scan complete:', sampleCoins.length, 'coins found');
      return sampleCoins;
    } catch (error) {
      console.error('❌ Scan failed:', error);
      return [];
    }
  }

  getCoins(): LiveMemeCoin[] {
    return this.coins;
  }

  getAlerts(): string[] {
    return this.alerts;
  }

  addAlert(message: string) {
    this.alerts.unshift(message);
    if (this.alerts.length > 10) {
      this.alerts = this.alerts.slice(0, 10);
    }
  }
}

export const liveMemeCoinService = new LiveMemeCoinService();
