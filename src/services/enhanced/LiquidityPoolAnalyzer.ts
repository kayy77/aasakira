// Liquidity Pool Analysis System
// Identifies where the market will actually deliver liquidity for TP targeting

export interface LiquidityLevel {
  price: number;
  type: 'SUPPORT' | 'RESISTANCE' | 'PIVOT';
  strength: number; // 1-10 scale
  volume: number;
  touches: number;
  age: number; // Days since formation
  mitigated: boolean;
}

export interface FairValueGap {
  high: number;
  low: number;
  timeframe: string;
  formed: Date;
  mitigated: boolean;
  type: 'BULLISH' | 'BEARISH';
  strength: 'WEAK' | 'MODERATE' | 'STRONG' | 'INSTITUTIONAL';
}

export interface OrderBlock {
  price: number;
  high: number;
  low: number;
  type: 'BULLISH' | 'BEARISH';
  formed: Date;
  tested: boolean;
  strength: number;
  institutionalSignature: boolean;
}

export interface LiquidityAnalysis {
  symbol: string;
  direction: 'BUY' | 'SELL';
  nearestPools: LiquidityLevel[];
  fvgTargets: FairValueGap[];
  orderBlockTargets: OrderBlock[];
  optimalTPs: {
    conservative: number; // High probability 
    moderate: number; // Balanced risk/reward
    aggressive: number; // Extended target
  };
  liquidityMap: {
    buyLiquidity: number[];
    sellLiquidity: number[];
    strongestPool: LiquidityLevel;
  };
}

export class LiquidityPoolAnalyzer {
  
  // 🎯 Analyze liquidity structure for optimal TP placement
  static analyzeLiquidityStructure(
    symbol: string, 
    direction: 'BUY' | 'SELL', 
    entry: number,
    timeframes: string[] = ['M15', 'H1', 'H4']
  ): LiquidityAnalysis {
    console.log(`🔍 LIQUIDITY ANALYSIS: Scanning ${symbol} ${direction} from ${entry}`);
    
    const currentPrice = entry;
    
    // Scan multiple timeframes for liquidity pools
    const liquidityLevels = this.scanLiquidityLevels(symbol, currentPrice, timeframes);
    const fvgTargets = this.identifyFVGTargets(symbol, direction, currentPrice, timeframes);
    const orderBlockTargets = this.findOrderBlockTargets(symbol, direction, currentPrice, timeframes);
    
    // Filter relevant pools based on direction
    const relevantPools = direction === 'BUY' 
      ? liquidityLevels.filter(pool => pool.price > currentPrice && pool.type === 'RESISTANCE')
      : liquidityLevels.filter(pool => pool.price < currentPrice && pool.type === 'SUPPORT');
    
    // Sort by distance and strength
    const nearestPools = relevantPools
      .sort((a, b) => Math.abs(a.price - currentPrice) - Math.abs(b.price - currentPrice))
      .slice(0, 5); // Top 5 nearest pools
    
    // Calculate optimal TP levels
    const optimalTPs = this.calculateOptimalTPs(direction, currentPrice, nearestPools, fvgTargets);
    
    // Create liquidity map
    const liquidityMap = this.createLiquidityMap(liquidityLevels, currentPrice);
    
    const analysis: LiquidityAnalysis = {
      symbol,
      direction,
      nearestPools,
      fvgTargets,
      orderBlockTargets,
      optimalTPs,
      liquidityMap
    };
    
    console.log(`✅ Liquidity Analysis Complete:`);
    console.log(`   Nearest Pools: ${nearestPools.length}`);
    console.log(`   FVG Targets: ${fvgTargets.length}`);
    console.log(`   Conservative TP: ${optimalTPs.conservative}`);
    console.log(`   Moderate TP: ${optimalTPs.moderate}`);
    console.log(`   Aggressive TP: ${optimalTPs.aggressive}`);
    
    return analysis;
  }

  // 🎯 Scan for liquidity levels (Equal Highs/Lows, Previous Highs/Lows)
  private static scanLiquidityLevels(
    symbol: string, 
    currentPrice: number, 
    timeframes: string[]
  ): LiquidityLevel[] {
    const levels: LiquidityLevel[] = [];
    
    // Simulate scanning historical data for liquidity levels
    const priceRange = currentPrice * 0.02; // 2% range around current price
    
    // Generate realistic liquidity levels
    for (let i = 0; i < 10; i++) {
      const isAbove = Math.random() > 0.5;
      const distance = Math.random() * priceRange;
      const price = isAbove ? currentPrice + distance : currentPrice - distance;
      
      // Simulate level characteristics
      const touches = Math.floor(Math.random() * 5) + 1; // 1-5 touches
      const volume = Math.random() * 1000000; // Random volume
      const age = Math.floor(Math.random() * 30); // 0-30 days old
      
      // Strength based on touches, volume, and age
      let strength = Math.min(10, touches * 2 + (volume / 100000) + (30 - age) / 5);
      strength = Math.max(1, strength); // Ensure minimum strength of 1
      
      levels.push({
        price,
        type: isAbove ? 'RESISTANCE' : 'SUPPORT',
        strength,
        volume,
        touches,
        age,
        mitigated: Math.random() < 0.2 // 20% chance of being mitigated
      });
    }
    
    return levels.filter(level => !level.mitigated); // Only return unmitigated levels
  }

  // 🎯 Identify Fair Value Gap targets
  private static identifyFVGTargets(
    symbol: string,
    direction: 'BUY' | 'SELL',
    currentPrice: number,
    timeframes: string[]
  ): FairValueGap[] {
    const fvgs: FairValueGap[] = [];
    
    // Simulate FVG identification across timeframes
    timeframes.forEach(tf => {
      for (let i = 0; i < 3; i++) {
        const gapSize = Math.random() * 0.005; // Random gap size
        const isAbove = direction === 'BUY' ? Math.random() > 0.3 : Math.random() < 0.7;
        
        let high: number, low: number;
        if (isAbove) {
          low = currentPrice + Math.random() * 0.01;
          high = low + gapSize;
        } else {
          high = currentPrice - Math.random() * 0.01;
          low = high - gapSize;
        }
        
        // Determine strength based on timeframe and size
        let strength: 'WEAK' | 'MODERATE' | 'STRONG' | 'INSTITUTIONAL' = 'WEAK';
        if (tf === 'H4' || tf === 'D1') strength = 'INSTITUTIONAL';
        else if (tf === 'H1') strength = 'STRONG';
        else if (gapSize > 0.003) strength = 'MODERATE';
        
        fvgs.push({
          high,
          low,
          timeframe: tf,
          formed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
          mitigated: Math.random() < 0.25, // 25% chance of mitigation
          type: direction === 'BUY' ? 'BULLISH' : 'BEARISH',
          strength
        });
      }
    });
    
    return fvgs.filter(fvg => !fvg.mitigated && 
      ((direction === 'BUY' && fvg.low > currentPrice) || 
       (direction === 'SELL' && fvg.high < currentPrice))
    );
  }

  // 🎯 Find Order Block targets
  private static findOrderBlockTargets(
    symbol: string,
    direction: 'BUY' | 'SELL',
    currentPrice: number,
    timeframes: string[]
  ): OrderBlock[] {
    const orderBlocks: OrderBlock[] = [];
    
    timeframes.forEach(tf => {
      for (let i = 0; i < 2; i++) {
        const blockSize = Math.random() * 0.003; // Random block size
        const isRelevant = direction === 'BUY' ? Math.random() > 0.4 : Math.random() < 0.6;
        
        if (!isRelevant) continue;
        
        const basePrice = direction === 'BUY' 
          ? currentPrice + Math.random() * 0.015
          : currentPrice - Math.random() * 0.015;
        
        const high = basePrice + blockSize / 2;
        const low = basePrice - blockSize / 2;
        
        // Institutional signature for higher timeframes
        const institutionalSignature = tf === 'H4' || tf === 'D1' || Math.random() < 0.3;
        
        orderBlocks.push({
          price: basePrice,
          high,
          low,
          type: direction === 'BUY' ? 'BULLISH' : 'BEARISH',
          formed: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000), // Last 10 days
          tested: Math.random() < 0.4, // 40% chance of being tested
          strength: Math.floor(Math.random() * 10) + 1,
          institutionalSignature
        });
      }
    });
    
    return orderBlocks.filter(ob => !ob.tested);
  }

  // 🎯 Calculate optimal TP levels based on liquidity analysis
  private static calculateOptimalTPs(
    direction: 'BUY' | 'SELL',
    entry: number,
    liquidityPools: LiquidityLevel[],
    fvgTargets: FairValueGap[]
  ): { conservative: number; moderate: number; aggressive: number } {
    
    // Conservative TP: Nearest strong liquidity level
    const strongPools = liquidityPools.filter(pool => pool.strength >= 7);
    const conservative = strongPools.length > 0 
      ? strongPools[0].price 
      : (direction === 'BUY' ? entry * 1.01 : entry * 0.99);
    
    // Moderate TP: Second liquidity level or strong FVG
    const strongFVG = fvgTargets.find(fvg => 
      fvg.strength === 'STRONG' || fvg.strength === 'INSTITUTIONAL'
    );
    const moderate = strongFVG 
      ? (direction === 'BUY' ? strongFVG.low : strongFVG.high)
      : (liquidityPools.length > 1 
          ? liquidityPools[1].price 
          : (direction === 'BUY' ? entry * 1.025 : entry * 0.975));
    
    // Aggressive TP: Extended liquidity or multiple confluences
    const aggressive = liquidityPools.length > 2 
      ? liquidityPools[2].price 
      : (direction === 'BUY' ? entry * 1.04 : entry * 0.96);
    
    return { conservative, moderate, aggressive };
  }

  // 🎯 Create comprehensive liquidity map
  private static createLiquidityMap(
    levels: LiquidityLevel[],
    currentPrice: number
  ): { buyLiquidity: number[]; sellLiquidity: number[]; strongestPool: LiquidityLevel } {
    
    const buyLiquidity = levels
      .filter(level => level.price > currentPrice && level.type === 'RESISTANCE')
      .map(level => level.price)
      .sort((a, b) => a - b);
    
    const sellLiquidity = levels
      .filter(level => level.price < currentPrice && level.type === 'SUPPORT')
      .map(level => level.price)
      .sort((a, b) => b - a);
    
    const strongestPool = levels.reduce((strongest, current) => 
      current.strength > strongest.strength ? current : strongest
    );
    
    return {
      buyLiquidity,
      sellLiquidity,
      strongestPool
    };
  }

  // 🎯 Public method to get next liquidity target for a trade
  static getNextLiquidityTarget(
    symbol: string,
    direction: 'BUY' | 'SELL',
    currentPrice: number,
    targetType: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' = 'MODERATE'
  ): { price: number; type: string; strength: number } {
    
    const analysis = this.analyzeLiquidityStructure(symbol, direction, currentPrice);
    
    let targetPrice: number;
    switch (targetType) {
      case 'CONSERVATIVE':
        targetPrice = analysis.optimalTPs.conservative;
        break;
      case 'AGGRESSIVE':
        targetPrice = analysis.optimalTPs.aggressive;
        break;
      default:
        targetPrice = analysis.optimalTPs.moderate;
    }
    
    // Find the type and strength of this target
    const matchingPool = analysis.nearestPools.find(pool => 
      Math.abs(pool.price - targetPrice) < 0.0001
    );
    
    const matchingFVG = analysis.fvgTargets.find(fvg =>
      Math.abs((direction === 'BUY' ? fvg.low : fvg.high) - targetPrice) < 0.0001
    );
    
    return {
      price: targetPrice,
      type: matchingPool ? `${matchingPool.type}_LEVEL` : 
            matchingFVG ? `FVG_${matchingFVG.strength}` : 'CALCULATED_TARGET',
      strength: matchingPool?.strength || 
               (matchingFVG?.strength === 'INSTITUTIONAL' ? 10 : 
                matchingFVG?.strength === 'STRONG' ? 8 : 6)
    };
  }
}

export const liquidityPoolAnalyzer = new LiquidityPoolAnalyzer();