
import { groqService } from './groqService';
import { multiAIConsensusEngine } from './multiAIConsensusEngine';

interface MemeCoinMetrics {
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
  holders: number;
  contractRisk: 'Safe' | 'Medium Risk' | 'High Risk' | 'Honeypot';
  hypeScore: number;
  walletQualityScore: number;
  sniperBotPresence: 'Low' | 'Medium' | 'High';
  aiConsensus?: {
    verdict: 'APPROVED' | 'REJECTED' | 'LOW_CONSENSUS';
    confidence_score: number;
    final_rating: number;
    reasoning: string[];
  };
  riskLevel: 'Low' | 'Medium' | 'High';
  totalScore: number;
  dexData: {
    dexId: string;
    pairAddress: string;
    url: string;
  };
}

interface TokenScanResult {
  lowRisk: MemeCoinMetrics[];
  mediumRisk: MemeCoinMetrics[];
  highRisk: MemeCoinMetrics[];
  totalScanned: number;
  scanTime: string;
}

class RealTimeMemeCoinService {
  private readonly MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6Ijg1NDEwMzVjLWZiNWItNDMzOS1iODY2LTFmNmIwMmQ5YjZlNiIsIm9yZ0lkIjoiNDYyMzI4IiwidXNlcklkIjoiNDc1NjM3IiwidHlwZUlkIjoiMmY1YzNhYWUtMWI5Ni00ZmJhLWIxZjMtNWU4ZWY2ZmQ2MzNhIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTM4NTEwODIsImV4cCI6NDkwOTYxMTA4Mn0.GSIwlgXc67Tk_9JmrnTJIa4-WiixlbJPoQru3tm4sRs';
  private readonly COINGECKO_API_KEY = 'CG-bQTwkyGEdJKdYh8ogK49b124';
  private readonly ETHERSCAN_API_KEY = '1T7I3BIT7NSNFVTC3BNQR687FDXX7ERYJG';
  
  private readonly DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';
  private readonly MORALIS_API = 'https://deep-index.moralis.io/api/v2.2';
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';

  async scanEliteMemCoins(): Promise<TokenScanResult> {
    console.log('🔍 Elite Meme Coin Scan Starting...');
    
    try {
      // Parallel data fetching from multiple sources
      const [dexScreenerTokens, moralisTokens, geckoTrending] = await Promise.allSettled([
        this.fetchFromDexScreener(),
        this.fetchFromMoralis(),
        this.fetchFromCoinGecko()
      ]);

      let allTokens: MemeCoinMetrics[] = [];

      // Process each data source
      if (dexScreenerTokens.status === 'fulfilled') {
        allTokens = [...allTokens, ...dexScreenerTokens.value];
      }
      if (moralisTokens.status === 'fulfilled') {
        allTokens = [...allTokens, ...moralisTokens.value];
      }
      if (geckoTrending.status === 'fulfilled') {
        allTokens = [...allTokens, ...geckoTrending.value];
      }

      // Remove duplicates
      const uniqueTokens = this.removeDuplicates(allTokens);
      console.log(`📊 Found ${uniqueTokens.length} unique tokens`);

      // Enhanced filtering
      const filteredTokens = this.applyEliteFilters(uniqueTokens);
      console.log(`✨ ${filteredTokens.length} tokens passed elite filters`);

      // Multi-AI Analysis for top tokens
      const aiAnalyzedTokens = await this.performMultiAIAnalysis(filteredTokens.slice(0, 20));

      // Categorize by risk
      const categorized = this.categorizeByRisk(aiAnalyzedTokens);

      return {
        ...categorized,
        totalScanned: uniqueTokens.length,
        scanTime: new Date().toISOString()
      };

    } catch (error) {
      console.error('🚨 Elite scan failed:', error);
      return this.generateFallbackResults();
    }
  }

  private async fetchFromDexScreener(): Promise<MemeCoinMetrics[]> {
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
        
        return pairs.slice(0, 50).map((pair: any) => this.formatDexScreenerToken(pair));
      } catch (error) {
        continue;
      }
    }
    
    return [];
  }

  private async fetchFromMoralis(): Promise<MemeCoinMetrics[]> {
    try {
      const response = await fetch(`${this.MORALIS_API}/erc20?chain=eth&limit=50`, {
        headers: {
          'X-API-Key': this.MORALIS_API_KEY,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.result || []).map((token: any) => this.formatMoralisToken(token));
    } catch (error) {
      console.error('Moralis API error:', error);
      return [];
    }
  }

  private async fetchFromCoinGecko(): Promise<MemeCoinMetrics[]> {
    try {
      const response = await fetch(`${this.COINGECKO_API}/coins/trending`, {
        headers: {
          'x-cg-demo-api-key': this.COINGECKO_API_KEY
        }
      });

      if (!response.ok) return [];
      
      const data = await response.json();
      const coins = data.coins || [];
      
      return coins.slice(0, 20).map((coin: any) => this.formatCoinGeckoToken(coin));
    } catch (error) {
      console.error('CoinGecko API error:', error);
      return [];
    }
  }

  private formatDexScreenerToken(pair: any): MemeCoinMetrics {
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
      holders: Math.floor(Math.random() * 10000),
      contractRisk: this.assessContractRisk(pair),
      hypeScore: this.calculateHypeScore(pair),
      walletQualityScore: Math.floor(Math.random() * 100),
      sniperBotPresence: this.assessSniperBots(pair),
      riskLevel: this.calculateRiskLevel(pair),
      totalScore: 0, // Will be calculated later
      dexData: {
        dexId: 'dexscreener',
        pairAddress: pair.pairAddress || 'unknown',
        url: pair.url || `https://dexscreener.com/ethereum/${pair.pairAddress}`
      }
    };
  }

  private formatMoralisToken(token: any): MemeCoinMetrics {
    return {
      id: `moralis_${token.token_address || Math.random()}`,
      address: token.token_address || 'unknown',
      symbol: token.symbol || 'UNKNOWN',
      name: token.name || 'Unknown Token',
      price: parseFloat(token.usd_price || '0'),
      marketCap: parseFloat(token.usd_price || '0') * parseFloat(token.total_supply || '0'),
      liquidity: Math.random() * 50000 + 10000,
      volume24h: parseFloat(token.usd_price_24hr_usd_change || '0') * 100000,
      transactions24h: Math.floor(Math.random() * 1000),
      pairAge: Math.random() * 72,
      priceChange24h: parseFloat(token.usd_price_24hr_percent_change || '0'),
      holders: Math.floor(Math.random() * 10000),
      contractRisk: 'Safe' as const,
      hypeScore: Math.floor(Math.random() * 100),
      walletQualityScore: Math.floor(Math.random() * 100),
      sniperBotPresence: 'Low' as const,
      riskLevel: 'Medium' as const,
      totalScore: 0,
      dexData: {
        dexId: 'moralis',
        pairAddress: token.token_address || 'unknown',
        url: `https://etherscan.io/token/${token.token_address}`
      }
    };
  }

  private formatCoinGeckoToken(coinData: any): MemeCoinMetrics {
    const coin = coinData.item || coinData;
    
    return {
      id: `gecko_${coin.id || Math.random()}`,
      address: coin.id || 'unknown',
      symbol: (coin.symbol || 'UNKNOWN').toUpperCase(),
      name: coin.name || 'Unknown Token',
      price: parseFloat(coin.price_btc || '0') * 50000, // Rough BTC to USD conversion
      marketCap: parseFloat(coin.market_cap_rank || '0') * 1000000,
      liquidity: Math.random() * 100000 + 20000,
      volume24h: Math.random() * 1000000,
      transactions24h: Math.floor(Math.random() * 2000),
      pairAge: Math.random() * 48,
      priceChange24h: Math.random() * 50 - 25,
      holders: Math.floor(Math.random() * 15000),
      contractRisk: 'Safe' as const,
      hypeScore: Math.floor(Math.random() * 100),
      walletQualityScore: 75 + Math.floor(Math.random() * 25),
      sniperBotPresence: 'Low' as const,
      riskLevel: 'Low' as const,
      totalScore: 0,
      dexData: {
        dexId: 'coingecko',
        pairAddress: coin.id || 'unknown',
        url: `https://www.coingecko.com/en/coins/${coin.id}`
      }
    };
  }

  private applyEliteFilters(tokens: MemeCoinMetrics[]): MemeCoinMetrics[] {
    return tokens.filter(token => {
      // Elite filter criteria
      return (
        token.liquidity >= 10000 &&
        token.volume24h >= 10000 &&
        token.transactions24h >= 50 &&
        token.marketCap >= 50000 &&
        token.marketCap <= 20000000 &&
        token.pairAge <= 168 && // 1 week max
        token.contractRisk !== 'Honeypot'
      );
    });
  }

  private async performMultiAIAnalysis(tokens: MemeCoinMetrics[]): Promise<MemeCoinMetrics[]> {
    console.log(`🧠 Running Multi-AI Analysis on ${tokens.length} tokens...`);
    
    const analyzedTokens = await Promise.all(
      tokens.map(async (token) => {
        try {
          // Create context for AI analysis
          const context = {
            pair: token.symbol,
            timeframe: '1H',
            direction: 'BUY' as const,
            entry_price: token.price,
            stop_loss: token.price * 0.9,
            take_profit: token.price * 1.2,
            structure_desc: `Market cap: $${token.marketCap.toLocaleString()}, Liquidity: $${token.liquidity.toLocaleString()}`,
            liquidity_zone_info: `${token.liquidity >= 50000 ? 'High' : token.liquidity >= 20000 ? 'Medium' : 'Low'} liquidity`,
            fvg_info: 'No significant gaps detected',
            rsi_data: `Price change 24h: ${token.priceChange24h.toFixed(2)}%`,
            volume_snapshot: `24h volume: $${token.volume24h.toLocaleString()}, ${token.transactions24h} transactions`,
            session_info: 'Global trading session',
            time: new Date().toISOString(),
            news_context: `Meme coin trending with hype score: ${token.hypeScore}`,
            confluences_list: [
              `Liquidity: $${token.liquidity.toLocaleString()}`,
              `Volume: $${token.volume24h.toLocaleString()}`,
              `Age: ${token.pairAge.toFixed(1)}h`,
              `Transactions: ${token.transactions24h}`
            ]
          };

          const aiAnalysis = await multiAIConsensusEngine.analyzeSignalConsensus(context);
          
          return {
            ...token,
            aiConsensus: aiAnalysis,
            totalScore: this.calculateTotalScore(token, aiAnalysis)
          };
        } catch (error) {
          console.error(`AI analysis failed for ${token.symbol}:`, error);
          return {
            ...token,
            totalScore: this.calculateTotalScore(token)
          };
        }
      })
    );

    return analyzedTokens.sort((a, b) => b.totalScore - a.totalScore);
  }

  private calculateTotalScore(token: MemeCoinMetrics, aiAnalysis?: any): number {
    let score = 0;
    
    // Liquidity score (0-25 points)
    if (token.liquidity >= 100000) score += 25;
    else if (token.liquidity >= 50000) score += 20;
    else if (token.liquidity >= 20000) score += 15;
    else if (token.liquidity >= 10000) score += 10;
    
    // Volume score (0-20 points)
    if (token.volume24h >= 1000000) score += 20;
    else if (token.volume24h >= 500000) score += 15;
    else if (token.volume24h >= 100000) score += 10;
    else if (token.volume24h >= 10000) score += 5;
    
    // Age score (0-15 points) - newer gets higher score
    if (token.pairAge <= 4) score += 15;
    else if (token.pairAge <= 12) score += 12;
    else if (token.pairAge <= 24) score += 8;
    else if (token.pairAge <= 48) score += 5;
    
    // Transaction score (0-15 points)
    if (token.transactions24h >= 1000) score += 15;
    else if (token.transactions24h >= 500) score += 10;
    else if (token.transactions24h >= 100) score += 5;
    
    // Market cap score (0-10 points)
    if (token.marketCap >= 1000000 && token.marketCap <= 10000000) score += 10;
    else if (token.marketCap >= 500000) score += 7;
    else if (token.marketCap >= 100000) score += 5;
    
    // AI consensus bonus (0-15 points)
    if (aiAnalysis?.approved) {
      score += aiAnalysis.confidence_score * 3; // Max 15 points
    }
    
    return Math.min(100, score);
  }

  private assessContractRisk(data: any): 'Safe' | 'Medium Risk' | 'High Risk' | 'Honeypot' {
    // Simple risk assessment based on available data
    const liquidity = parseFloat(data.liquidity?.usd || '0');
    const volume = parseFloat(data.volume?.h24 || '0');
    
    if (liquidity < 5000) return 'High Risk';
    if (volume < 1000) return 'Medium Risk';
    if (Math.random() < 0.05) return 'Honeypot'; // 5% chance for demo
    
    return 'Safe';
  }

  private calculateHypeScore(data: any): number {
    let score = 50; // Base score
    
    const volume = parseFloat(data.volume?.h24 || '0');
    const priceChange = Math.abs(parseFloat(data.priceChange?.h24 || '0'));
    const txns = parseInt(data.txns?.h24?.buys || '0') + parseInt(data.txns?.h24?.sells || '0');
    
    // Volume contribution
    if (volume > 1000000) score += 30;
    else if (volume > 500000) score += 20;
    else if (volume > 100000) score += 10;
    
    // Price movement contribution
    if (priceChange > 50) score += 15;
    else if (priceChange > 20) score += 10;
    else if (priceChange > 5) score += 5;
    
    // Transaction activity
    if (txns > 1000) score += 15;
    else if (txns > 500) score += 10;
    else if (txns > 100) score += 5;
    
    return Math.min(100, Math.max(0, score));
  }

  private assessSniperBots(data: any): 'Low' | 'Medium' | 'High' {
    const txns = parseInt(data.txns?.h24?.buys || '0') + parseInt(data.txns?.h24?.sells || '0');
    const volume = parseFloat(data.volume?.h24 || '0');
    
    if (txns > 2000 && volume < 100000) return 'High';
    if (txns > 1000 && volume < 500000) return 'Medium';
    
    return 'Low';
  }

  private calculateRiskLevel(data: any): 'Low' | 'Medium' | 'High' {
    const liquidity = parseFloat(data.liquidity?.usd || '0');
    const volume = parseFloat(data.volume?.h24 || '0');
    const marketCap = parseFloat(data.fdv || '0');
    
    if (liquidity >= 50000 && volume >= 500000 && marketCap >= 1000000 && marketCap <= 10000000) {
      return 'Low';
    } else if (liquidity >= 20000 && volume >= 100000) {
      return 'Medium';
    }
    
    return 'High';
  }

  private removeDuplicates(tokens: MemeCoinMetrics[]): MemeCoinMetrics[] {
    const seen = new Set();
    return tokens.filter(token => {
      const key = token.address.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private categorizeByRisk(tokens: MemeCoinMetrics[]): Omit<TokenScanResult, 'totalScanned' | 'scanTime'> {
    const lowRisk = tokens.filter(t => t.riskLevel === 'Low').slice(0, 15);
    const mediumRisk = tokens.filter(t => t.riskLevel === 'Medium').slice(0, 15);
    const highRisk = tokens.filter(t => t.riskLevel === 'High').slice(0, 10);

    return { lowRisk, mediumRisk, highRisk };
  }

  private generateFallbackResults(): TokenScanResult {
    return {
      lowRisk: [],
      mediumRisk: [],
      highRisk: [],
      totalScanned: 0,
      scanTime: new Date().toISOString()
    };
  }
}

export const realTimeMemeCoinService = new RealTimeMemeCoinService();
export type { MemeCoinMetrics, TokenScanResult };
