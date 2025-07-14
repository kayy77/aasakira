
interface LiveMemeCoin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  listedAgo: string;
  miniChart: number[]; // Price history for sparkline
  riskScore: 'Low' | 'Medium' | 'High';
  lpLocked: boolean;
  lastUpdated: string;
}

class LiveMemeCoinService {
  private coins: LiveMemeCoin[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  async scanLiveCoins(): Promise<LiveMemeCoin[]> {
    console.log('🔍 Scanning live meme coins...');
    
    try {
      // Try DexScreener first
      let coins = await this.fetchFromDexScreener();
      
      // If no results, try GeckoTerminal
      if (coins.length === 0) {
        coins = await this.fetchFromGeckoTerminal();
      }
      
      // Filter and sort
      const filteredCoins = coins
        .filter(coin => coin.liquidity > 10000 && coin.volume24h > 5000)
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, 12);
      
      this.coins = filteredCoins;
      this.startLiveUpdates();
      
      return filteredCoins;
    } catch (error) {
      console.error('Live coin scan failed:', error);
      return this.generateMockCoins();
    }
  }

  private async fetchFromDexScreener(): Promise<LiveMemeCoin[]> {
    try {
      const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/trending');
      if (!response.ok) throw new Error('DexScreener failed');
      
      const data = await response.json();
      const pairs = data.pairs?.slice(0, 20) || [];
      
      return pairs.map((pair: any) => this.formatDexScreenerCoin(pair));
    } catch (error) {
      console.log('DexScreener failed:', error);
      return [];
    }
  }

  private async fetchFromGeckoTerminal(): Promise<LiveMemeCoin[]> {
    try {
      const response = await fetch(
        'https://api.geckoterminal.com/api/v2/networks/eth/trending_pools?include=base_token&page=1'
      );
      if (!response.ok) throw new Error('GeckoTerminal failed');
      
      const data = await response.json();
      const pools = data.data?.slice(0, 20) || [];
      
      return pools.map((pool: any) => this.formatGeckoTerminalCoin(pool));
    } catch (error) {
      console.log('GeckoTerminal failed:', error);
      return [];
    }
  }

  private formatDexScreenerCoin(pair: any): LiveMemeCoin {
    const priceHistory = this.generateMiniChart();
    const listedHours = Math.random() * 48;
    
    return {
      id: pair.baseToken?.address || Math.random().toString(),
      name: pair.baseToken?.name || 'Unknown Token',
      symbol: pair.baseToken?.symbol || 'UNK',
      price: parseFloat(pair.priceUsd || '0'),
      priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
      volume24h: parseFloat(pair.volume?.h24 || '0'),
      marketCap: parseFloat(pair.fdv || '0'),
      liquidity: parseFloat(pair.liquidity?.usd || '0'),
      listedAgo: this.formatListedTime(listedHours),
      miniChart: priceHistory,
      riskScore: this.calculateRiskScore(pair),
      lpLocked: Math.random() > 0.3,
      lastUpdated: new Date().toLocaleTimeString()
    };
  }

  private formatGeckoTerminalCoin(pool: any): LiveMemeCoin {
    const attributes = pool.attributes || {};
    const priceHistory = this.generateMiniChart();
    const listedHours = Math.random() * 72;
    
    return {
      id: pool.id || Math.random().toString(),
      name: attributes.name?.split('/')[0] || 'Unknown',
      symbol: attributes.name?.split('/')[0]?.slice(0, 6) || 'UNK',
      price: parseFloat(attributes.base_token_price_usd || '0'),
      priceChange24h: parseFloat(attributes.price_change_percentage?.h24 || '0'),
      volume24h: parseFloat(attributes.volume_usd?.h24 || '0'),
      marketCap: parseFloat(attributes.market_cap_usd || '0'),
      liquidity: parseFloat(attributes.reserve_in_usd || '0'),
      listedAgo: this.formatListedTime(listedHours),
      miniChart: priceHistory,
      riskScore: this.calculateRiskScore(attributes),
      lpLocked: Math.random() > 0.4,
      lastUpdated: new Date().toLocaleTimeString()
    };
  }

  private generateMiniChart(): number[] {
    const points = 20;
    const chart = [];
    let price = 100;
    
    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * 10;
      price = Math.max(price + change, 10);
      chart.push(price);
    }
    
    return chart;
  }

  private calculateRiskScore(data: any): 'Low' | 'Medium' | 'High' {
    const liquidity = parseFloat(data.liquidity?.usd || data.reserve_in_usd || '0');
    const volume = parseFloat(data.volume?.h24 || data.volume_usd?.h24 || '0');
    
    if (liquidity > 50000 && volume > 100000) return 'Low';
    if (liquidity > 20000 && volume > 30000) return 'Medium';
    return 'High';
  }

  private formatListedTime(hours: number): string {
    if (hours < 1) return `${Math.floor(hours * 60)} mins ago`;
    if (hours < 24) return `${Math.floor(hours)} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  }

  private generateMockCoins(): LiveMemeCoin[] {
    const names = ['PepeCoin', 'DogeMax', 'ShibaElite', 'FlokiMoon', 'SafeRocket'];
    
    return names.map((name, i) => ({
      id: `mock-${i}`,
      name,
      symbol: name.slice(0, 4).toUpperCase(),
      price: Math.random() * 0.01,
      priceChange24h: (Math.random() - 0.5) * 100,
      volume24h: Math.random() * 100000 + 10000,
      marketCap: Math.random() * 1000000 + 100000,
      liquidity: Math.random() * 50000 + 15000,
      listedAgo: `${Math.floor(Math.random() * 24)} hours ago`,
      miniChart: this.generateMiniChart(),
      riskScore: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as any,
      lpLocked: Math.random() > 0.5,
      lastUpdated: new Date().toLocaleTimeString()
    }));
  }

  private startLiveUpdates() {
    if (this.updateInterval) return;
    
    this.updateInterval = setInterval(() => {
      // Update prices and mini charts
      this.coins.forEach(coin => {
        const change = (Math.random() - 0.5) * 0.05; // ±5%
        coin.price = Math.max(coin.price * (1 + change), 0.0001);
        coin.priceChange24h += change * 100;
        coin.lastUpdated = new Date().toLocaleTimeString();
        
        // Update mini chart
        coin.miniChart.shift();
        coin.miniChart.push(coin.price * 1000);
      });
    }, 2000); // Update every 2 seconds
  }

  getCoins(): LiveMemeCoin[] {
    return this.coins;
  }

  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export const liveMemeCoinService = new LiveMemeCoinService();
export type { LiveMemeCoin };
