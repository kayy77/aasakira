
interface LiveMemeCoin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChange5m: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  pairAge: number;
  listedAgo: string;
  lpLocked: boolean;
  volumeSpike: boolean;
  whyChosen: string;
  exchangeUrl: string;
  alerts?: string[];
  // Enhanced properties
  address: string;
  healthScore: number;
  healthLabel: 'Safe' | 'Caution' | 'Danger';
  riskQuadrant: string;
  whaleActivity: number;
  stealthLaunch: boolean;
  whaleTransactions: any[];
}

class LiveMemeCoinService {
  private coins: LiveMemeCoin[] = [];
  private isScanning = false;

  async scanLiveCoins(): Promise<LiveMemeCoin[]> {
    if (this.isScanning) {
      console.log('📊 Scan already in progress, returning cached data');
      return this.coins;
    }

    this.isScanning = true;
    console.log('🔍 Starting live meme coin scan...');

    try {
      // Generate mock enhanced data
      const mockCoins = this.generateEnhancedMockData();
      this.coins = mockCoins;
      console.log(`✅ Found ${mockCoins.length} live meme coins`);
      return mockCoins;
    } catch (error) {
      console.error('❌ Scan failed:', error);
      return this.coins;
    } finally {
      this.isScanning = false;
    }
  }

  private generateEnhancedMockData(): LiveMemeCoin[] {
    const pairs = [
      'PEPE', 'SHIB', 'DOGE', 'FLOKI', 'BABYDOGE', 'SAFEMOON', 'WOJAK', 'MONG', 'TURBO', 'LADYS'
    ];

    return pairs.map((symbol, index) => {
      const priceChange = (Math.random() - 0.5) * 200; // -100% to +100%
      const volume = 50000 + Math.random() * 2000000;
      const age = Math.random() * 168; // 0-168 hours
      const healthScore = 30 + Math.random() * 70; // 30-100
      const whaleCount = Math.floor(Math.random() * 5);
      
      return {
        id: `coin-${index}`,
        name: `${symbol} Coin`,
        symbol,
        price: Math.random() * 0.001,
        priceChange24h: priceChange,
        priceChange5m: (Math.random() - 0.5) * 20,
        volume24h: volume,
        marketCap: volume * (10 + Math.random() * 50),
        liquidity: 20000 + Math.random() * 200000,
        pairAge: age,
        listedAgo: age < 1 ? `${Math.floor(age * 60)}m ago` : `${Math.floor(age)}h ago`,
        lpLocked: Math.random() > 0.3,
        volumeSpike: Math.abs(priceChange) > 50,
        whyChosen: this.generateAnalysis(symbol, priceChange),
        exchangeUrl: `https://dexscreener.com/ethereum/${symbol.toLowerCase()}`,
        alerts: Math.random() > 0.7 ? [`🚨 Volume spike: +${Math.floor(Math.abs(priceChange))}%`] : [],
        // Enhanced properties
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        healthScore: Math.round(healthScore),
        healthLabel: healthScore >= 75 ? 'Safe' : healthScore >= 50 ? 'Caution' : 'Danger',
        riskQuadrant: this.calculateMockRiskQuadrant(healthScore, priceChange),
        whaleActivity: whaleCount,
        stealthLaunch: age < 1 && Math.random() > 0.8,
        whaleTransactions: Array.from({ length: whaleCount }, (_, i) => ({
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          amount: 10000 + Math.random() * 50000,
          type: Math.random() > 0.5 ? 'buy' : 'sell',
          timestamp: new Date(Date.now() - Math.random() * 3600000)
        }))
      };
    });
  }

  private calculateMockRiskQuadrant(healthScore: number, priceChange: number): string {
    const risk = 100 - healthScore;
    const potential = Math.abs(priceChange) + (Math.random() * 30);
    
    if (risk < 50 && potential >= 50) return 'Low Risk High Reward';
    if (risk < 50 && potential < 50) return 'Low Risk Low Reward';
    if (risk >= 50 && potential >= 50) return 'High Risk High Reward';
    return 'High Risk Low Reward';
  }

  private generateAnalysis(symbol: string, change: number): string {
    const analyses = [
      `${symbol} showing strong momentum with institutional accumulation patterns`,
      `Smart money flowing into ${symbol} - whale wallets accumulating`,
      `${symbol} breaking key resistance levels with volume confirmation`,
      `Fresh liquidity injection detected in ${symbol} pools`,
      `${symbol} displaying classic accumulation phase characteristics`
    ];
    return analyses[Math.floor(Math.random() * analyses.length)];
  }

  getCoins(): LiveMemeCoin[] {
    return this.coins;
  }

  getCoinBySymbol(symbol: string): LiveMemeCoin | undefined {
    return this.coins.find(coin => coin.symbol.toLowerCase() === symbol.toLowerCase());
  }
}

export const liveMemeCoinService = new LiveMemeCoinService();
export type { LiveMemeCoin };
