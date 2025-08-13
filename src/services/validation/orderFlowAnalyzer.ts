// Order Flow Analysis Engine
// Simulates institutional order flow analysis

export interface OrderFlowData {
  symbol: string;
  timestamp: number;
  bidSize: number;
  askSize: number;
  lastTradeSize: number;
  lastTradePrice: number;
  cumulativeDelta: number;
  volumeImbalance: number;
  largeTradeCount: number; // trades > threshold
  absorptionLevels: number[]; // price levels showing absorption
}

export interface OrderFlowSignal {
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: number; // 0-100
  bigMoneyActive: boolean;
  absorptionDetected: boolean;
  imbalanceRatio: number;
  liquidityShift: 'BUYING_PRESSURE' | 'SELLING_PRESSURE' | 'BALANCED';
  confidence: number;
  reasoning: string[];
}

export interface InstitutionalFootprint {
  accumulationActive: boolean;
  distributionActive: boolean;
  smartMoneyDirection: 'LONG' | 'SHORT' | 'SIDEWAYS';
  volumeSignature: 'INSTITUTIONAL' | 'RETAIL' | 'MIXED';
  timeOfDayBias: 'LONDON_OPEN' | 'NY_OPEN' | 'ASIA' | 'OVERLAP' | 'OFF_HOURS';
  sessionVolatility: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class OrderFlowAnalyzer {
  private static readonly LARGE_TRADE_THRESHOLD = 1000000; // 1M notional
  private static readonly IMBALANCE_THRESHOLD = 0.65; // 65% imbalance
  private static readonly BIG_MONEY_VOLUME_MULTIPLE = 3; // 3x average volume
  
  static analyzeOrderFlow(data: OrderFlowData[]): OrderFlowSignal {
    if (!data || data.length === 0) {
      return this.createNeutralSignal('NO_DATA');
    }

    const latest = data[data.length - 1];
    const signal: OrderFlowSignal = {
      direction: 'NEUTRAL',
      strength: 0,
      bigMoneyActive: false,
      absorptionDetected: false,
      imbalanceRatio: 0,
      liquidityShift: 'BALANCED',
      confidence: 0,
      reasoning: []
    };

    // 1. Analyze Volume Imbalance
    const imbalanceAnalysis = this.analyzeVolumeImbalance(data);
    signal.imbalanceRatio = imbalanceAnalysis.ratio;
    signal.liquidityShift = imbalanceAnalysis.shift;
    
    if (imbalanceAnalysis.ratio > this.IMBALANCE_THRESHOLD) {
      signal.strength += 25;
      signal.reasoning.push(`${(imbalanceAnalysis.ratio * 100).toFixed(1)}% volume imbalance detected`);
    }

    // 2. Detect Big Money Activity
    const bigMoneyAnalysis = this.detectBigMoneyActivity(data);
    signal.bigMoneyActive = bigMoneyAnalysis.active;
    
    if (bigMoneyAnalysis.active) {
      signal.strength += 30;
      signal.direction = bigMoneyAnalysis.direction;
      signal.reasoning.push(`Large institutional orders detected: ${bigMoneyAnalysis.tradeCount} trades`);
    }

    // 3. Check for Absorption
    const absorptionAnalysis = this.detectAbsorption(data);
    signal.absorptionDetected = absorptionAnalysis.detected;
    
    if (absorptionAnalysis.detected) {
      signal.strength += 20;
      signal.reasoning.push(`Liquidity absorption at ${absorptionAnalysis.levels.length} level(s)`);
    }

    // 4. Cumulative Delta Analysis
    const deltaAnalysis = this.analyzeCumulativeDelta(data);
    if (deltaAnalysis.strength > 0) {
      signal.strength += deltaAnalysis.strength;
      signal.direction = deltaAnalysis.direction;
      signal.reasoning.push(`Cumulative delta: ${deltaAnalysis.delta > 0 ? '+' : ''}${deltaAnalysis.delta.toFixed(0)}`);
    }

    // 5. Calculate final confidence
    signal.confidence = Math.min(signal.strength, 100);
    
    // Require minimum conditions for non-neutral signal
    if (signal.strength < 40 || !signal.bigMoneyActive) {
      signal.direction = 'NEUTRAL';
      signal.reasoning.push('Insufficient order flow strength for directional bias');
    }

    return signal;
  }

  static getInstitutionalFootprint(symbol: string, session: string): InstitutionalFootprint {
    const currentHour = new Date().getUTCHours();
    
    return {
      accumulationActive: this.detectAccumulation(symbol, currentHour),
      distributionActive: this.detectDistribution(symbol, currentHour),
      smartMoneyDirection: this.getSmartMoneyDirection(symbol, session),
      volumeSignature: this.getVolumeSignature(symbol, currentHour),
      timeOfDayBias: this.getTimeOfDayBias(currentHour),
      sessionVolatility: this.getSessionVolatility(session, symbol)
    };
  }

  private static analyzeVolumeImbalance(data: OrderFlowData[]): {
    ratio: number;
    shift: 'BUYING_PRESSURE' | 'SELLING_PRESSURE' | 'BALANCED';
  } {
    const recent = data.slice(-10);
    let totalBidSize = 0;
    let totalAskSize = 0;

    recent.forEach(tick => {
      totalBidSize += tick.bidSize;
      totalAskSize += tick.askSize;
    });

    const total = totalBidSize + totalAskSize;
    const buyerRatio = totalBidSize / total;

    return {
      ratio: Math.max(buyerRatio, 1 - buyerRatio),
      shift: buyerRatio > 0.6 ? 'BUYING_PRESSURE' : 
             buyerRatio < 0.4 ? 'SELLING_PRESSURE' : 'BALANCED'
    };
  }

  private static detectBigMoneyActivity(data: OrderFlowData[]): {
    active: boolean;
    direction: 'BULLISH' | 'BEARISH';
    tradeCount: number;
  } {
    const recent = data.slice(-20);
    const avgVolume = recent.reduce((sum, tick) => sum + tick.lastTradeSize, 0) / recent.length;
    const largeTradesThreshold = avgVolume * this.BIG_MONEY_VOLUME_MULTIPLE;

    const largeTrades = recent.filter(tick => tick.lastTradeSize > largeTradesThreshold);
    
    if (largeTrades.length < 3) {
      return { active: false, direction: 'BULLISH', tradeCount: 0 };
    }

    // Analyze direction of large trades
    let bullishTrades = 0;
    let bearishTrades = 0;

    for (let i = 1; i < largeTrades.length; i++) {
      if (largeTrades[i].lastTradePrice > largeTrades[i - 1].lastTradePrice) {
        bullishTrades++;
      } else {
        bearishTrades++;
      }
    }

    return {
      active: true,
      direction: bullishTrades > bearishTrades ? 'BULLISH' : 'BEARISH',
      tradeCount: largeTrades.length
    };
  }

  private static detectAbsorption(data: OrderFlowData[]): {
    detected: boolean;
    levels: number[];
  } {
    const recent = data.slice(-15);
    const absorptionLevels: number[] = [];

    // Look for price levels where large volume was absorbed without significant price movement
    const priceGroups = new Map<number, { volume: number; priceChange: number }>();

    recent.forEach((tick, index) => {
      if (index === 0) return;
      
      const priceLevel = Math.round(tick.lastTradePrice * 10000) / 10000; // Round to 4 decimals
      const prevTick = recent[index - 1];
      const priceChange = Math.abs(tick.lastTradePrice - prevTick.lastTradePrice);

      if (!priceGroups.has(priceLevel)) {
        priceGroups.set(priceLevel, { volume: 0, priceChange: 0 });
      }

      const group = priceGroups.get(priceLevel)!;
      group.volume += tick.lastTradeSize;
      group.priceChange += priceChange;
    });

    // Find levels with high volume but low price movement (absorption)
    priceGroups.forEach((data, price) => {
      const avgVolume = recent.reduce((sum, tick) => sum + tick.lastTradeSize, 0) / recent.length;
      if (data.volume > avgVolume * 2 && data.priceChange < 0.0005) {
        absorptionLevels.push(price);
      }
    });

    return {
      detected: absorptionLevels.length > 0,
      levels: absorptionLevels
    };
  }

  private static analyzeCumulativeDelta(data: OrderFlowData[]): {
    delta: number;
    direction: 'BULLISH' | 'BEARISH';
    strength: number;
  } {
    const recent = data.slice(-10);
    const totalDelta = recent.reduce((sum, tick) => sum + tick.cumulativeDelta, 0);
    const avgDelta = Math.abs(totalDelta) / recent.length;

    let strength = 0;
    if (avgDelta > 1000) strength = 25;
    else if (avgDelta > 500) strength = 15;
    else if (avgDelta > 200) strength = 10;

    return {
      delta: totalDelta,
      direction: totalDelta > 0 ? 'BULLISH' : 'BEARISH',
      strength
    };
  }

  private static detectAccumulation(symbol: string, hour: number): boolean {
    // Simulate accumulation detection based on time and symbol
    const majorPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF'];
    const isLondonSession = hour >= 8 && hour <= 16;
    const isNYSession = hour >= 13 && hour <= 21;
    
    return majorPairs.includes(symbol) && (isLondonSession || isNYSession) && Math.random() > 0.6;
  }

  private static detectDistribution(symbol: string, hour: number): boolean {
    // Simulate distribution detection
    const isAsianSession = hour >= 0 && hour <= 8;
    return isAsianSession && Math.random() > 0.7;
  }

  private static getSmartMoneyDirection(symbol: string, session: string): 'LONG' | 'SHORT' | 'SIDEWAYS' {
    // Simulate smart money direction based on session and symbol
    if (session === 'LONDON' && symbol.includes('GBP')) {
      return Math.random() > 0.5 ? 'LONG' : 'SHORT';
    }
    if (session === 'NY' && symbol.includes('USD')) {
      return Math.random() > 0.5 ? 'LONG' : 'SHORT';
    }
    return 'SIDEWAYS';
  }

  private static getVolumeSignature(symbol: string, hour: number): 'INSTITUTIONAL' | 'RETAIL' | 'MIXED' {
    const isPeakHours = (hour >= 8 && hour <= 12) || (hour >= 13 && hour <= 17);
    return isPeakHours ? 'INSTITUTIONAL' : 'RETAIL';
  }

  private static getTimeOfDayBias(hour: number): InstitutionalFootprint['timeOfDayBias'] {
    if (hour >= 8 && hour <= 12) return 'LONDON_OPEN';
    if (hour >= 13 && hour <= 17) return 'NY_OPEN';
    if (hour >= 9 && hour <= 11) return 'OVERLAP';
    if (hour >= 0 && hour <= 7) return 'ASIA';
    return 'OFF_HOURS';
  }

  private static getSessionVolatility(session: string, symbol: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (session === 'LONDON' && symbol.includes('GBP')) return 'HIGH';
    if (session === 'NY' && symbol.includes('USD')) return 'HIGH';
    if (session === 'ASIA') return 'LOW';
    return 'MEDIUM';
  }

  private static createNeutralSignal(reason: string): OrderFlowSignal {
    return {
      direction: 'NEUTRAL',
      strength: 0,
      bigMoneyActive: false,
      absorptionDetected: false,
      imbalanceRatio: 0.5,
      liquidityShift: 'BALANCED',
      confidence: 0,
      reasoning: [reason]
    };
  }

  // Mock data generator for testing
  static generateMockOrderFlow(symbol: string, minutes: number = 30): OrderFlowData[] {
    const data: OrderFlowData[] = [];
    const basePrice = symbol.includes('JPY') ? 147.5 : 1.0856;
    let cumulativeDelta = 0;

    for (let i = 0; i < minutes; i++) {
      const price = basePrice + (Math.random() - 0.5) * 0.01;
      const volume = 100000 + Math.random() * 500000;
      const delta = (Math.random() - 0.5) * 10000;
      cumulativeDelta += delta;

      data.push({
        symbol,
        timestamp: Date.now() - (minutes - i) * 60000,
        bidSize: volume * (0.4 + Math.random() * 0.2),
        askSize: volume * (0.4 + Math.random() * 0.2),
        lastTradeSize: volume,
        lastTradePrice: price,
        cumulativeDelta,
        volumeImbalance: (Math.random() - 0.5) * 2,
        largeTradeCount: Math.floor(Math.random() * 5),
        absorptionLevels: [price + (Math.random() - 0.5) * 0.005]
      });
    }

    return data;
  }
}

export const orderFlowAnalyzer = new OrderFlowAnalyzer();

// Export static methods for direct access
export const getInstitutionalFootprint = OrderFlowAnalyzer.getInstitutionalFootprint;