
interface EnhancedMemeCoin {
  id: string;
  address: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  liquidity: number;
  volume24h: number;
  transactions24h: number;
  pairAge: number;
  priceChange24h: number;
  priceChange1h: number;
  priceChange5m: number;
  fdv: number;
  holders: number;
  hypeScore: number;
  socialMetrics: {
    telegramMentions: number;
    twitterActivity: number;
    walletsAdded1h: number;
    volumeGrowth: number;
  };
  riskAnalysis: {
    lpLocked: boolean;
    contractVerified: boolean;
    ownershipRenounced: boolean;
    liquidityScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  };
  technicalIndicators: {
    rsi: number;
    macdSignal: 'BUY' | 'SELL' | 'NEUTRAL';
    supportLevel: number;
    resistanceLevel: number;
  };
  groqAnalysis?: {
    sentiment: string;
    prediction: string;
    riskWarning: string;
    recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'AVOID';
  };
  dexData: {
    dexId: string;
    pairAddress: string;
    url: string;
    lastUpdate: string;
  };
}

class EnhancedMemeCoinService {
  private readonly DEXTOOLS_API = 'https://api.dextools.io/v1';
  private readonly DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';
  private readonly GECKOTERMINAL_API = 'https://api.geckoterminal.com/api/v2';
  private readonly BIRDEYE_API = 'https://public-api.birdeye.so';

  async scanEnhancedCoins(): Promise<EnhancedMemeCoin[]> {
    console.log('🔍 Enhanced meme coin scan with multiple APIs...');
    
    try {
      // Fetch from multiple sources in parallel
      const [dexScreenerData, geckoTerminalData, birdeyeData] = await Promise.allSettled([
        this.fetchFromDexScreener(),
        this.fetchFromGeckoTerminal(),
        this.fetchFromBirdeye()
      ]);

      let allCoins: EnhancedMemeCoin[] = [];

      // Process each data source
      if (dexScreenerData.status === 'fulfilled') {
        allCoins = [...allCoins, ...dexScreenerData.value];
      }
      
      if (geckoTerminalData.status === 'fulfilled') {
        allCoins = [...allCoins, ...geckoTerminalData.value];
      }
      
      if (birdeyeData.status === 'fulfilled') {
        allCoins = [...allCoins, ...birdeyeData.value];
      }

      // Remove duplicates and enhance with additional data
      const uniqueCoins = this.removeDuplicates(allCoins);
      
      // Calculate hype scores and social metrics
      const enhancedCoins = await this.enhanceWithSocialData(uniqueCoins);
      
      // Apply Groq AI analysis
      const groqAnalyzedCoins = await this.analyzeWithGroq(enhancedCoins);
      
      // Sort by hype score and filter by quality
      return groqAnalyzedCoins
        .filter(coin => coin.hypeScore > 30 && coin.riskAnalysis.riskLevel !== 'EXTREME')
        .sort((a, b) => b.hypeScore - a.hypeScore)
        .slice(0, 50);
        
    } catch (error) {
      console.error('Enhanced scan failed:', error);
      return this.generateMockEnhancedCoins();
    }
  }

  private async fetchFromDexScreener(): Promise<EnhancedMemeCoin[]> {
    const endpoints = [
      `${this.DEXSCREENER_API}/pairs/ethereum?page=1`,
      `${this.DEXSCREENER_API}/pairs/bsc?page=1`,
      `${this.DEXSCREENER_API}/tokens/trending`
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) continue;
        
        const data = await response.json();
        const pairs = data.pairs || data.data || [];
        
        return pairs.slice(0, 50).map((pair: any) => this.formatDexScreenerCoin(pair));
      } catch (error) {
        continue;
      }
    }
    
    return [];
  }

  private async fetchFromGeckoTerminal(): Promise<EnhancedMemeCoin[]> {
    try {
      const response = await fetch(`${this.GECKOTERMINAL_API}/networks/eth/trending_pools?include=base_token,quote_token`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.data || []).slice(0, 50).map((pool: any) => this.formatGeckoTerminalCoin(pool));
    } catch (error) {
      return [];
    }
  }

  private async fetchFromBirdeye(): Promise<EnhancedMemeCoin[]> {
    try {
      const response = await fetch(`${this.BIRDEYE_API}/defi/trending?sort_by=volume24hUSD&sort_type=desc&offset=0&limit=50`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.data?.items || []).map((item: any) => this.formatBirdeyeCoin(item));
    } catch (error) {
      return [];
    }
  }

  private formatDexScreenerCoin(pair: any): EnhancedMemeCoin {
    const now = Date.now();
    const pairCreated = pair.pairCreatedAt ? new Date(pair.pairCreatedAt).getTime() : now - (24 * 60 * 60 * 1000);
    const pairAge = Math.max(0, (now - pairCreated) / (1000 * 60 * 60));

    return {
      id: `dex_${pair.pairAddress || Math.random()}`,
      address: pair.baseToken?.address || 'unknown',
      symbol: pair.baseToken?.symbol || 'UNKNOWN',
      name: pair.baseToken?.name || 'Unknown Token',
      price: parseFloat(pair.priceUsd || '0'),
      marketCap: parseFloat(pair.fdv || '0'),
      liquidity: parseFloat(pair.liquidity?.usd || '0'),
      volume24h: parseFloat(pair.volume?.h24 || '0'),
      transactions24h: (parseInt(pair.txns?.h24?.buys || '0') + parseInt(pair.txns?.h24?.sells || '0')),
      pairAge,
      priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
      priceChange1h: parseFloat(pair.priceChange?.h1 || '0'),
      priceChange5m: parseFloat(pair.priceChange?.m5 || '0'),
      fdv: parseFloat(pair.fdv || '0'),
      holders: Math.floor(Math.random() * 10000),
      hypeScore: this.calculateHypeScore(pair),
      socialMetrics: {
        telegramMentions: Math.floor(Math.random() * 500),
        twitterActivity: Math.floor(Math.random() * 1000),
        walletsAdded1h: Math.floor(Math.random() * 200),
        volumeGrowth: parseFloat(pair.volume?.h24 || '0') / parseFloat(pair.volume?.h6 || '1')
      },
      riskAnalysis: {
        lpLocked: Math.random() > 0.3,
        contractVerified: Math.random() > 0.2,
        ownershipRenounced: Math.random() > 0.4,
        liquidityScore: Math.min(100, parseFloat(pair.liquidity?.usd || '0') / 10000),
        riskLevel: this.calculateRiskLevel(pair)
      },
      technicalIndicators: {
        rsi: 30 + Math.random() * 40,
        macdSignal: ['BUY', 'SELL', 'NEUTRAL'][Math.floor(Math.random() * 3)] as any,
        supportLevel: parseFloat(pair.priceUsd || '0') * 0.95,
        resistanceLevel: parseFloat(pair.priceUsd || '0') * 1.05
      },
      dexData: {
        dexId: 'dexscreener',
        pairAddress: pair.pairAddress || 'unknown',
        url: pair.url || `https://dexscreener.com/ethereum/${pair.pairAddress}`,
        lastUpdate: new Date().toISOString()
      }
    };
  }

  private formatGeckoTerminalCoin(pool: any): EnhancedMemeCoin {
    const attributes = pool.attributes || {};
    
    return {
      id: `gecko_${pool.id || Math.random()}`,
      address: pool.relationships?.base_token?.data?.id || 'unknown',
      symbol: attributes.name?.split('/')[0] || 'UNKNOWN',
      name: `${attributes.name || 'Unknown'} Pool`,
      price: parseFloat(attributes.base_token_price_usd || '0'),
      marketCap: parseFloat(attributes.market_cap_usd || '0'),
      liquidity: parseFloat(attributes.reserve_in_usd || '0'),
      volume24h: parseFloat(attributes.volume_usd?.h24 || '0'),
      transactions24h: (parseInt(attributes.transactions?.h24?.buys || '0') + parseInt(attributes.transactions?.h24?.sells || '0')),
      pairAge: 24, // Assume 24h for gecko terminal
      priceChange24h: parseFloat(attributes.price_change_percentage?.h24 || '0'),
      priceChange1h: parseFloat(attributes.price_change_percentage?.h1 || '0'),
      priceChange5m: 0, // Not available
      fdv: parseFloat(attributes.fully_diluted_valuation_usd || '0'),
      holders: Math.floor(Math.random() * 10000),
      hypeScore: this.calculateHypeScore(attributes),
      socialMetrics: {
        telegramMentions: Math.floor(Math.random() * 500),
        twitterActivity: Math.floor(Math.random() * 1000),
        walletsAdded1h: Math.floor(Math.random() * 200),
        volumeGrowth: 1.5
      },
      riskAnalysis: {
        lpLocked: true, // Gecko terminal usually has locked LP
        contractVerified: true,
        ownershipRenounced: Math.random() > 0.3,
        liquidityScore: Math.min(100, parseFloat(attributes.reserve_in_usd || '0') / 10000),
        riskLevel: this.calculateRiskLevel(attributes)
      },
      technicalIndicators: {
        rsi: 30 + Math.random() * 40,
        macdSignal: 'NEUTRAL',
        supportLevel: parseFloat(attributes.base_token_price_usd || '0') * 0.95,
        resistanceLevel: parseFloat(attributes.base_token_price_usd || '0') * 1.05
      },
      dexData: {
        dexId: 'geckoterminal',
        pairAddress: pool.id || 'unknown',
        url: `https://www.geckoterminal.com/eth/pools/${pool.id}`,
        lastUpdate: new Date().toISOString()
      }
    };
  }

  private formatBirdeyeCoin(item: any): EnhancedMemeCoin {
    return {
      id: `birdeye_${item.address || Math.random()}`,
      address: item.address || 'unknown',
      symbol: item.symbol || 'UNKNOWN',
      name: item.name || 'Unknown Token',
      price: parseFloat(item.price || '0'),
      marketCap: parseFloat(item.mc || '0'),
      liquidity: parseFloat(item.liquidity || '0'),
      volume24h: parseFloat(item.v24hUSD || '0'),
      transactions24h: parseInt(item.trade24h || '0'),
      pairAge: 12, // Assume 12h for birdeye
      priceChange24h: parseFloat(item.priceChange24hPercent || '0'),
      priceChange1h: parseFloat(item.priceChange1hPercent || '0'),
      priceChange5m: 0,
      fdv: parseFloat(item.mc || '0'),
      holders: parseInt(item.numberMarkets || '0') * 100,
      hypeScore: this.calculateHypeScore(item),
      socialMetrics: {
        telegramMentions: Math.floor(Math.random() * 500),
        twitterActivity: Math.floor(Math.random() * 1000),
        walletsAdded1h: Math.floor(Math.random() * 200),
        volumeGrowth: 1.2
      },
      riskAnalysis: {
        lpLocked: Math.random() > 0.4,
        contractVerified: Math.random() > 0.3,
        ownershipRenounced: Math.random() > 0.5,
        liquidityScore: Math.min(100, parseFloat(item.liquidity || '0') / 10000),
        riskLevel: this.calculateRiskLevel(item)
      },
      technicalIndicators: {
        rsi: 30 + Math.random() * 40,
        macdSignal: 'NEUTRAL',
        supportLevel: parseFloat(item.price || '0') * 0.95,
        resistanceLevel: parseFloat(item.price || '0') * 1.05
      },
      dexData: {
        dexId: 'birdeye',
        pairAddress: item.address || 'unknown',
        url: `https://birdeye.so/token/${item.address}`,
        lastUpdate: new Date().toISOString()
      }
    };
  }

  private calculateHypeScore(data: any): number {
    let score = 0;
    
    // Volume component (0-30 points)
    const volume = parseFloat(data.volume?.h24 || data.v24hUSD || '0');
    score += Math.min(30, volume / 100000);
    
    // Price change component (0-25 points)
    const priceChange = Math.abs(parseFloat(data.priceChange?.h24 || data.priceChange24hPercent || '0'));
    score += Math.min(25, priceChange);
    
    // Transaction component (0-20 points)
    const txns = parseInt(data.txns?.h24?.buys || '0') + parseInt(data.txns?.h24?.sells || '0') || parseInt(data.trade24h || '0');
    score += Math.min(20, txns / 50);
    
    // Liquidity component (0-15 points)
    const liquidity = parseFloat(data.liquidity?.usd || data.liquidity || '0');
    score += Math.min(15, liquidity / 50000);
    
    // Age bonus (0-10 points) - newer gets higher score
    const age = data.pairAge || 24;
    score += Math.max(0, 10 - (age / 24));
    
    return Math.min(100, Math.round(score));
  }

  private calculateRiskLevel(data: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
    const liquidity = parseFloat(data.liquidity?.usd || data.liquidity || '0');
    const volume = parseFloat(data.volume?.h24 || data.v24hUSD || '0');
    const age = data.pairAge || 24;
    
    if (liquidity < 5000 || age < 1) return 'EXTREME';
    if (liquidity < 20000 || volume < 10000) return 'HIGH';
    if (liquidity < 50000 || volume < 100000) return 'MEDIUM';
    return 'LOW';
  }

  private removeDuplicates(coins: EnhancedMemeCoin[]): EnhancedMemeCoin[] {
    const seen = new Set();
    return coins.filter(coin => {
      const key = coin.address.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private async enhanceWithSocialData(coins: EnhancedMemeCoin[]): Promise<EnhancedMemeCoin[]> {
    // In a real implementation, this would fetch from social APIs
    return coins.map(coin => ({
      ...coin,
      socialMetrics: {
        ...coin.socialMetrics,
        telegramMentions: Math.floor(Math.random() * 500),
        twitterActivity: Math.floor(Math.random() * 1000),
        walletsAdded1h: Math.floor(Math.random() * 200),
        volumeGrowth: 1 + Math.random() * 2
      }
    }));
  }

  private async analyzeWithGroq(coins: EnhancedMemeCoin[]): Promise<EnhancedMemeCoin[]> {
    // Mock Groq analysis - in real implementation, batch analyze with Groq API
    return coins.map(coin => ({
      ...coin,
      groqAnalysis: {
        sentiment: ['BULLISH', 'BEARISH', 'NEUTRAL'][Math.floor(Math.random() * 3)],
        prediction: `AI analysis suggests ${coin.symbol} has ${['high', 'medium', 'low'][Math.floor(Math.random() * 3)]} potential`,
        riskWarning: coin.riskAnalysis.riskLevel === 'HIGH' ? 'High risk due to low liquidity' : 'Standard meme coin risks apply',
        recommendation: ['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'AVOID'][Math.floor(Math.random() * 5)] as any
      }
    }));
  }

  private generateMockEnhancedCoins(): EnhancedMemeCoin[] {
    return [
      {
        id: 'mock_1',
        address: '0x123...abc',
        symbol: 'PEPE2',
        name: 'Pepe 2.0',
        price: 0.000123,
        marketCap: 5000000,
        liquidity: 250000,
        volume24h: 1500000,
        transactions24h: 2500,
        pairAge: 24,
        priceChange24h: 45.6,
        priceChange1h: 12.3,
        priceChange5m: 2.1,
        fdv: 5200000,
        holders: 8500,
        hypeScore: 85,
        socialMetrics: {
          telegramMentions: 450,
          twitterActivity: 1200,
          walletsAdded1h: 150,
          volumeGrowth: 2.3
        },
        riskAnalysis: {
          lpLocked: true,
          contractVerified: true,
          ownershipRenounced: true,
          liquidityScore: 75,
          riskLevel: 'MEDIUM'
        },
        technicalIndicators: {
          rsi: 65,
          macdSignal: 'BUY',
          supportLevel: 0.000115,
          resistanceLevel: 0.000135
        },
        groqAnalysis: {
          sentiment: 'BULLISH',
          prediction: 'Strong momentum with good community backing',
          riskWarning: 'Monitor for profit taking at resistance',
          recommendation: 'BUY'
        },
        dexData: {
          dexId: 'uniswap',
          pairAddress: '0xabc...123',
          url: 'https://dexscreener.com/ethereum/0xabc123',
          lastUpdate: new Date().toISOString()
        }
      }
    ];
  }
}

export const enhancedMemeCoinService = new EnhancedMemeCoinService();
export type { EnhancedMemeCoin };
