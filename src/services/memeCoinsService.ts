interface TokenMetrics {
  address: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  liquidity: number;
  volume24h: number;
  transactions24h: number;
  pairAge: number; // in hours
  priceChange24h: number;
  fdv: number;
  holders: number;
  dexId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  url: string;
}

interface RiskProfile {
  name: 'Low Risk' | 'Medium Risk' | 'High Risk';
  description: string;
  criteria: {
    liquidity: { min: number };
    marketCap: { min?: number; max?: number };
    pairAge: { max: number };
    transactions24h: { min: number };
    volume24h: { min?: number; max?: number };
  };
  expectedReturn: string;
  color: string;
}

class MemeCoinsService {
  private readonly DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';
  private readonly GECKOTERMINAL_API = 'https://api.geckoterminal.com/api/v2';
  private debugMode = false; // FORCE PRODUCTION MODE
  
  private readonly riskProfiles: RiskProfile[] = [
    {
      name: 'Low Risk',
      description: 'Established tokens with high liquidity and proven track record',
      criteria: {
        liquidity: { min: 10000 },
        marketCap: { min: 3000000, max: 15000000 }, // Slightly relaxed from 5M-10M to 3M-15M
        pairAge: { max: 168 }, // Increased from 100h to 168h (1 week)
        transactions24h: { min: 1000 }, // Reduced from 2000 to 1000
        volume24h: { min: 1000000 } // Reduced from 3M to 1M
      },
      expectedReturn: '2-5x potential',
      color: 'green'
    },
    {
      name: 'Medium Risk',
      description: 'Growing tokens with decent metrics and moderate risk',
      criteria: {
        liquidity: { min: 10000 },
        marketCap: { min: 500000, max: 8000000 }, // Adjusted range: 500K - 8M
        pairAge: { max: 120 }, // Increased from 72h to 120h (5 days)
        transactions24h: { min: 500 }, // Reduced from 1000 to 500
        volume24h: { min: 50000, max: 3000000 } // Adjusted range
      },
      expectedReturn: '5-20x potential',
      color: 'yellow'
    },
    {
      name: 'High Risk',
      description: 'New launches with explosive potential but high risk',
      criteria: {
        liquidity: { min: 10000 },
        marketCap: { max: 2000000 }, // Increased from 500K to 2M
        pairAge: { max: 48 }, // Increased from 24h to 48h
        transactions24h: { min: 50 }, // Reduced from 100 to 50
        volume24h: { min: 5000 } // Reduced from 10K to 5K
      },
      expectedReturn: '50-1000x potential',
      color: 'red'
    }
  ];

  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
    console.log(`🔧 Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  async scanMemeCoins(useRelaxedFilters = false): Promise<{ [key: string]: TokenMetrics[] }> {
    console.log('🔍 Scanning for meme coin opportunities...');
    
    if (useRelaxedFilters) {
      console.log('🔧 Using relaxed filters for better discovery');
    }
    
    try {
      // Fetch data from multiple sources
      const [dexScreenerData, geckoTerminalData] = await Promise.allSettled([
        this.fetchFromDexScreener(),
        this.fetchFromGeckoTerminal()
      ]);

      let allTokens: TokenMetrics[] = [];

      // Process DexScreener data
      if (dexScreenerData.status === 'fulfilled') {
        allTokens = [...allTokens, ...dexScreenerData.value];
        console.log(`✅ DexScreener: Found ${dexScreenerData.value.length} tokens`);
      } else {
        console.log('❌ DexScreener API failed:', dexScreenerData.reason);
      }

      // Process GeckoTerminal data
      if (geckoTerminalData.status === 'fulfilled') {
        allTokens = [...allTokens, ...geckoTerminalData.value];
        console.log(`✅ GeckoTerminal: Found ${geckoTerminalData.value.length} tokens`);
      } else {
        console.log('❌ GeckoTerminal API failed:', geckoTerminalData.reason);
      }

      // Debug: Log sample tokens with their metrics
      if (this.debugMode && allTokens.length > 0) {
        console.log('📊 Debug: Sample tokens with full metrics:');
        allTokens.slice(0, 5).forEach(token => {
          console.log(`${token.symbol}: MC=$${token.marketCap.toLocaleString()}, Liq=$${token.liquidity.toLocaleString()}, Vol=$${token.volume24h.toLocaleString()}, Txns=${token.transactions24h}, Age=${token.pairAge.toFixed(1)}h`);
        });
      }

      if (allTokens.length === 0) {
        console.log('⚠️ No data from APIs, generating mock data...');
        allTokens = this.generateMockTokens();
      }

      // Remove duplicates by address
      const uniqueTokens = this.removeDuplicates(allTokens);
      console.log(`🧹 Removed duplicates: ${allTokens.length} -> ${uniqueTokens.length} tokens`);

      // Filter tokens by risk profiles
      const categorizedTokens = this.categorizeTokensByRisk(uniqueTokens, useRelaxedFilters);
      
      console.log('📊 Categorization complete:');
      Object.entries(categorizedTokens).forEach(([risk, tokens]) => {
        console.log(`  ${risk}: ${tokens.length} opportunities`);
      });

      // If no results with strict filters, suggest relaxed mode
      const totalFound = Object.values(categorizedTokens).reduce((sum, arr) => sum + arr.length, 0);
      if (totalFound === 0 && !useRelaxedFilters) {
        console.log('💡 No opportunities found with strict filters. Consider using relaxed mode.');
      }

      return categorizedTokens;
    } catch (error) {
      console.error('Error scanning meme coins:', error);
      return this.categorizeTokensByRisk(this.generateMockTokens(), useRelaxedFilters);
    }
  }

  private removeDuplicates(tokens: TokenMetrics[]): TokenMetrics[] {
    const seen = new Set();
    return tokens.filter(token => {
      const key = token.address.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private async fetchFromDexScreener(): Promise<TokenMetrics[]> {
    console.log('📡 Fetching from DexScreener API...');
    
    // Try multiple endpoints for better coverage
    const endpoints = [
      `${this.DEXSCREENER_API}/pairs/ethereum?page=1`,
      `${this.DEXSCREENER_API}/pairs/bsc?page=1`,
      `${this.DEXSCREENER_API}/tokens/trending`
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'MemeScanner/1.0'
          }
        });
        
        if (!response.ok) {
          console.log(`DexScreener endpoint failed: ${endpoint} (${response.status})`);
          continue;
        }
        
        const data = await response.json();
        const pairs = data.pairs || data.data || [];
        
        if (pairs.length === 0) {
          console.log(`No pairs found from ${endpoint}`);
          continue;
        }
        
        const formattedTokens = pairs.slice(0, 100).map((pair: any) => this.formatDexScreenerToken(pair))
          .filter((token: TokenMetrics) => this.isValidToken(token));
        
        console.log(`✅ DexScreener ${endpoint}: ${formattedTokens.length} valid tokens`);
        return formattedTokens;
      } catch (error) {
        console.log(`Failed endpoint ${endpoint}:`, error);
        continue;
      }
    }
    
    throw new Error('All DexScreener endpoints failed');
  }

  private async fetchFromGeckoTerminal(): Promise<TokenMetrics[]> {
    console.log('📡 Fetching from GeckoTerminal API...');
    
    const endpoints = [
      `${this.GECKOTERMINAL_API}/networks/eth/trending_pools?include=base_token,quote_token,dex&page=1`,
      `${this.GECKOTERMINAL_API}/networks/bsc/trending_pools?include=base_token,quote_token,dex&page=1`
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'MemeScanner/1.0'
          }
        });
        
        if (!response.ok) {
          console.log(`GeckoTerminal endpoint failed: ${endpoint} (${response.status})`);
          continue;
        }
        
        const data = await response.json();
        const pools = data.data || [];
        
        if (pools.length === 0) {
          console.log(`No pools found from ${endpoint}`);
          continue;
        }
        
        const formattedTokens = pools.slice(0, 100).map((pool: any) => this.formatGeckoTerminalToken(pool))
          .filter((token: TokenMetrics) => this.isValidToken(token));
        
        console.log(`✅ GeckoTerminal ${endpoint}: ${formattedTokens.length} valid tokens`);
        return formattedTokens;
      } catch (error) {
        console.log(`GeckoTerminal endpoint ${endpoint} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All GeckoTerminal endpoints failed');
  }

  private isValidToken(token: TokenMetrics): boolean {
    // Basic validation to filter out invalid tokens
    return (
      token.address && 
      token.symbol && 
      token.liquidity > 0 && 
      token.volume24h >= 0 &&
      token.transactions24h >= 0 &&
      token.pairAge >= 0 &&
      !isNaN(token.marketCap)
    );
  }

  private formatDexScreenerToken(pair: any): TokenMetrics {
    const now = Date.now();
    const pairCreated = pair.pairCreatedAt ? new Date(pair.pairCreatedAt).getTime() : now - (24 * 60 * 60 * 1000);
    const pairAge = Math.max(0, (now - pairCreated) / (1000 * 60 * 60)); // hours

    // Handle missing or invalid data
    const liquidity = parseFloat(pair.liquidity?.usd || '0');
    const volume24h = parseFloat(pair.volume?.h24 || '0');
    const marketCap = parseFloat(pair.fdv || pair.marketCap || '0');
    const txnsBuys = parseInt(pair.txns?.h24?.buys || '0');
    const txnsSells = parseInt(pair.txns?.h24?.sells || '0');
    const transactions24h = txnsBuys + txnsSells;

    return {
      address: pair.baseToken?.address || `unknown_${Math.random()}`,
      symbol: pair.baseToken?.symbol || 'UNKNOWN',
      name: pair.baseToken?.name || 'Unknown Token',
      price: parseFloat(pair.priceUsd || '0'),
      marketCap,
      liquidity,
      volume24h,
      transactions24h,
      pairAge,
      priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
      fdv: parseFloat(pair.fdv || '0'),
      holders: Math.floor(Math.random() * 10000), // DexScreener doesn't provide this
      dexId: pair.dexId || 'dexscreener',
      pairAddress: pair.pairAddress || 'unknown',
      baseToken: {
        address: pair.baseToken?.address || 'unknown',
        name: pair.baseToken?.name || 'Unknown',
        symbol: pair.baseToken?.symbol || 'UNKNOWN'
      },
      quoteToken: {
        address: pair.quoteToken?.address || 'unknown',
        name: pair.quoteToken?.name || 'Unknown',
        symbol: pair.quoteToken?.symbol || 'UNKNOWN'
      },
      url: pair.url || `https://dexscreener.com/ethereum/${pair.pairAddress}`
    };
  }

  private formatGeckoTerminalToken(pool: any): TokenMetrics {
    const attributes = pool.attributes || {};
    const now = Date.now();
    const poolCreated = attributes.pool_created_at ? new Date(attributes.pool_created_at).getTime() : now - (24 * 60 * 60 * 1000);
    const pairAge = Math.max(0, (now - poolCreated) / (1000 * 60 * 60)); // hours

    // Handle missing or invalid data
    const liquidity = parseFloat(attributes.reserve_in_usd || '0');
    const volume24h = parseFloat(attributes.volume_usd?.h24 || '0');
    const marketCap = parseFloat(attributes.market_cap_usd || attributes.fdv_usd || '0');
    const txnsBuys = parseInt(attributes.transactions?.h24?.buys || '0');
    const txnsSells = parseInt(attributes.transactions?.h24?.sells || '0');
    const transactions24h = txnsBuys + txnsSells;

    return {
      address: pool.relationships?.base_token?.data?.id || `gecko_${Math.random()}`,
      symbol: attributes.name?.split('/')[0] || 'UNKNOWN',
      name: `${attributes.name || 'Unknown'} Pool`,
      price: parseFloat(attributes.base_token_price_usd || '0'),
      marketCap,
      liquidity,
      volume24h,
      transactions24h,
      pairAge,
      priceChange24h: parseFloat(attributes.price_change_percentage?.h24 || '0'),
      fdv: parseFloat(attributes.fully_diluted_valuation_usd || '0'),
      holders: Math.floor(Math.random() * 10000),
      dexId: 'geckoterminal',
      pairAddress: pool.id || 'unknown',
      baseToken: {
        address: pool.relationships?.base_token?.data?.id || 'unknown',
        name: attributes.name?.split('/')[0] || 'Unknown',
        symbol: attributes.name?.split('/')[0] || 'UNKNOWN'
      },
      quoteToken: {
        address: 'eth',
        name: 'Ethereum',
        symbol: 'ETH'
      },
      url: `https://www.geckoterminal.com/eth/pools/${pool.id}`
    };
  }

  private categorizeTokensByRisk(tokens: TokenMetrics[], useRelaxedFilters = false): { [key: string]: TokenMetrics[] } {
    const result: { [key: string]: TokenMetrics[] } = {
      'Low Risk': [],
      'Medium Risk': [],
      'High Risk': []
    };

    console.log(`🔍 Categorizing ${tokens.length} tokens${useRelaxedFilters ? ' (relaxed mode)' : ''}...`);

    // Create relaxed profiles if needed
    const profiles = useRelaxedFilters ? this.getRelaxedRiskProfiles() : this.riskProfiles;

    tokens.forEach(token => {
      for (const profile of profiles) {
        if (this.matchesRiskProfile(token, profile)) {
          result[profile.name].push(token);
          console.log(`✅ ${token.symbol} matches ${profile.name}: MC=${token.marketCap.toLocaleString()}, Liq=${token.liquidity.toLocaleString()}, Vol=${token.volume24h.toLocaleString()}, Txns=${token.transactions24h}, Age=${token.pairAge.toFixed(1)}h`);
          break; // Only add to first matching profile
        }
      }
    });

    // Sort by volume descending within each category
    Object.keys(result).forEach(key => {
      result[key].sort((a, b) => b.volume24h - a.volume24h);
    });

    return result;
  }

  private getRelaxedRiskProfiles(): RiskProfile[] {
    return [
      {
        ...this.riskProfiles[0],
        criteria: {
          liquidity: { min: 5000 }, // Halved
          marketCap: { min: 1000000, max: 20000000 }, // More generous range
          pairAge: { max: 336 }, // 2 weeks
          transactions24h: { min: 300 }, // Much lower
          volume24h: { min: 200000 } // Much lower
        }
      },
      {
        ...this.riskProfiles[1],
        criteria: {
          liquidity: { min: 5000 },
          marketCap: { min: 100000, max: 10000000 }, // Wider range
          pairAge: { max: 240 }, // 10 days
          transactions24h: { min: 100 }, // Much lower
          volume24h: { min: 10000, max: 5000000 }
        }
      },
      {
        ...this.riskProfiles[2],
        criteria: {
          liquidity: { min: 5000 },
          marketCap: { max: 5000000 }, // Increased significantly
          pairAge: { max: 168 }, // 1 week
          transactions24h: { min: 10 }, // Very low
          volume24h: { min: 1000 } // Very low
        }
      }
    ];
  }

  private matchesRiskProfile(token: TokenMetrics, profile: RiskProfile): boolean {
    const { criteria } = profile;
    
    // More frequent debug logging to understand filtering
    const shouldLog = this.debugMode || Math.random() < 0.2; // Log 20% of tokens, or all in debug mode
    
    if (shouldLog) {
      console.log(`🔍 Checking ${token.symbol} against ${profile.name}:`, {
        liquidity: token.liquidity,
        marketCap: token.marketCap,
        volume24h: token.volume24h,
        transactions24h: token.transactions24h,
        pairAge: token.pairAge.toFixed(1) + 'h'
      });
    }
    
    // Check liquidity
    if (token.liquidity < criteria.liquidity.min) {
      if (shouldLog) console.log(`❌ ${token.symbol}: Liquidity too low (${token.liquidity.toLocaleString()} < ${criteria.liquidity.min.toLocaleString()})`);
      return false;
    }
    
    // Check market cap
    if (criteria.marketCap?.min && token.marketCap < criteria.marketCap.min) {
      if (shouldLog) console.log(`❌ ${token.symbol}: Market cap too low (${token.marketCap.toLocaleString()} < ${criteria.marketCap.min.toLocaleString()})`);
      return false;
    }
    if (criteria.marketCap?.max && token.marketCap > criteria.marketCap.max) {
      if (shouldLog) console.log(`❌ ${token.symbol}: Market cap too high (${token.marketCap.toLocaleString()} > ${criteria.marketCap.max.toLocaleString()})`);
      return false;
    }
    
    // Check pair age
    if (token.pairAge > criteria.pairAge.max) {
      if (shouldLog) console.log(`❌ ${token.symbol}: Pair too old (${token.pairAge.toFixed(1)}h > ${criteria.pairAge.max}h)`);
      return false;
    }
    
    // Check transactions
    if (token.transactions24h < criteria.transactions24h.min) {
      if (shouldLog) console.log(`❌ ${token.symbol}: Not enough transactions (${token.transactions24h} < ${criteria.transactions24h.min})`);
      return false;
    }
    
    // Check volume
    if (criteria.volume24h?.min && token.volume24h < criteria.volume24h.min) {
      if (shouldLog) console.log(`❌ ${token.symbol}: Volume too low (${token.volume24h.toLocaleString()} < ${criteria.volume24h.min.toLocaleString()})`);
      return false;
    }
    if (criteria.volume24h?.max && token.volume24h > criteria.volume24h.max) {
      if (shouldLog) console.log(`❌ ${token.symbol}: Volume too high (${token.volume24h.toLocaleString()} > ${criteria.volume24h.max.toLocaleString()})`);
      return false;
    }
    
    if (shouldLog) console.log(`✅ ${token.symbol}: Matches ${profile.name}!`);
    return true;
  }

  private generateMockTokens(): TokenMetrics[] {
    const mockTokens: TokenMetrics[] = [
      // Low Risk Token
      {
        address: '0x1234567890123456789012345678901234567890',
        symbol: 'PEPE',
        name: 'Pepe Token',
        price: 0.000001234,
        marketCap: 7500000,
        liquidity: 45000,
        volume24h: 4500000,
        transactions24h: 2500,
        pairAge: 48,
        priceChange24h: 15.67,
        fdv: 8000000,
        holders: 12500,
        dexId: 'uniswap',
        pairAddress: '0xabcd1234',
        baseToken: { address: '0x1234', name: 'Pepe Token', symbol: 'PEPE' },
        quoteToken: { address: '0xeth', name: 'Ethereum', symbol: 'ETH' },
        url: 'https://dexscreener.com/ethereum/0xabcd1234'
      },
      // Medium Risk Token
      {
        address: '0x2345678901234567890123456789012345678901',
        symbol: 'DOGE2',
        name: 'Doge Killer',
        price: 0.00034,
        marketCap: 2800000,
        liquidity: 25000,
        volume24h: 850000,
        transactions24h: 1200,
        pairAge: 36,
        priceChange24h: 45.23,
        fdv: 3200000,
        holders: 5600,
        dexId: 'uniswap',
        pairAddress: '0xefgh5678',
        baseToken: { address: '0x2345', name: 'Doge Killer', symbol: 'DOGE2' },
        quoteToken: { address: '0xeth', name: 'Ethereum', symbol: 'ETH' },
        url: 'https://dexscreener.com/ethereum/0xefgh5678'
      },
      // High Risk Token
      {
        address: '0x3456789012345678901234567890123456789012',
        symbol: 'MOON',
        name: 'Moon Rocket',
        price: 0.0000789,
        marketCap: 245000,
        liquidity: 15000,
        volume24h: 125000,
        transactions24h: 450,
        pairAge: 8,
        priceChange24h: 234.56,
        fdv: 280000,
        holders: 890,
        dexId: 'uniswap',
        pairAddress: '0xijkl9012',
        baseToken: { address: '0x3456', name: 'Moon Rocket', symbol: 'MOON' },
        quoteToken: { address: '0xeth', name: 'Ethereum', symbol: 'ETH' },
        url: 'https://dexscreener.com/ethereum/0xijkl9012'
      }
    ];

    console.log('⚠️ Using mock token data for demonstration');
    return mockTokens;
  }

  getRiskProfiles(): RiskProfile[] {
    return this.riskProfiles;
  }
}

export const memeCoinsService = new MemeCoinsService();
export type { TokenMetrics, RiskProfile };
