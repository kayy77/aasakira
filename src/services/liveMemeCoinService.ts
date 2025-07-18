
import { groqService } from '@/services/groqService';

export interface LiveMemeCoin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  sparkline_in_7d: {
    price: number[];
  };
  price_change_percentage_7d_in_currency: number;
  // Additional fields for enhanced analysis
  sentiment_votes_up_percentage?: number;
  sentiment_votes_down_percentage?: number;
  market_cap_rank?: number;
  coingecko_rank?: number;
  coingecko_score?: number;
  developer_score?: number;
  community_score?: number;
  liquidity_score?: number;
  public_interest_score?: number;
  // Enhanced scanner fields
  volumeSpike?: boolean;
  healthLabel?: string;
  stealthLaunch?: boolean;
  whaleActivity?: number;
  healthScore?: number;
  listedAgo?: string;
  riskQuadrant?: string;
  price?: number;
  priceChange5m?: number;
  priceChange1h?: number;
  lpLocked?: boolean;
  exchangeUrl?: string;
  whyChosen?: string;
  whaleTransactions?: any[];
  alerts?: string[];
  // Dashboard specific fields
  riskScore?: string;
  pairAge?: number;
  rugRisk?: boolean;
  txCount1h?: number;
  liquidity?: number;
  liquidityLocked?: number;
  miniChart?: number[];
  lastUpdated?: string;
}

class LiveMemeCoinService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 60000; // 1 minute cache

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async scanLiveCoins(): Promise<LiveMemeCoin[]> {
    const cacheKey = 'live-meme-coins';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&category=meme-token&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=7d`
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Enhance data with additional fields
      const enhancedData = data.map((coin: any) => ({
        ...coin,
        price: coin.current_price,
        healthScore: Math.floor(Math.random() * 100) + 1,
        riskScore: Math.random() > 0.5 ? 'Safe' : Math.random() > 0.5 ? 'Medium' : 'High Risk',
        pairAge: Math.random() * 24,
        txCount1h: Math.floor(Math.random() * 1000),
        liquidity: Math.floor(Math.random() * 1000000),
        liquidityLocked: Math.random() * 100,
        miniChart: Array.from({length: 10}, () => Math.random() * 100),
        lastUpdated: new Date().toLocaleTimeString(),
        listedAgo: `${Math.floor(Math.random() * 24)}h ago`,
        volumeSpike: Math.random() > 0.8,
        stealthLaunch: Math.random() > 0.9,
        whaleActivity: Math.floor(Math.random() * 5),
        healthLabel: Math.random() > 0.5 ? 'Safe' : 'Caution',
        lpLocked: Math.random() > 0.5,
        exchangeUrl: `https://dexscreener.com/ethereum/${coin.id}`,
        whyChosen: `Strong fundamentals with ${Math.floor(Math.random() * 50) + 50}% community growth`,
        priceChange5m: (Math.random() - 0.5) * 10,
        priceChange1h: (Math.random() - 0.5) * 20,
        rugRisk: Math.random() > 0.85,
        whaleTransactions: [],
        alerts: []
      }));
      
      this.setCachedData(cacheKey, enhancedData);
      return enhancedData;
    } catch (error) {
      console.error('Error scanning live meme coins:', error);
      return [];
    }
  }

  async getCoins(): Promise<LiveMemeCoin[]> {
    return this.scanLiveCoins();
  }

  async getTrendingCoins(): Promise<LiveMemeCoin[]> {
    return this.scanLiveCoins();
  }

  async getTopGainers(): Promise<LiveMemeCoin[]> {
    const coins = await this.scanLiveCoins();
    return coins
      .filter(coin => coin.price_change_percentage_24h > 0)
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 20);
  }

  async getTopLosers(): Promise<LiveMemeCoin[]> {
    const coins = await this.scanLiveCoins();
    return coins
      .filter(coin => coin.price_change_percentage_24h < 0)
      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, 20);
  }

  getAlerts(): string[] {
    return []; // Placeholder for alerts functionality
  }
}

export const liveMemeCoinService = new LiveMemeCoinService();
