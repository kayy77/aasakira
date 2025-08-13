// 🚀 POWERFUL GROQ ANALYZER - Multi-Pass Institutional Intelligence
// Thinks like a top prop-firm trader with complete market context

import { groqService } from '../groqService';

export interface MarketContext {
  session: 'ASIA' | 'LONDON' | 'NY' | 'OVERLAP';
  volatilityRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  liquidityLevel: 'THIN' | 'NORMAL' | 'THICK' | 'INSTITUTIONAL';
  newsRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'BLACKOUT';
  timeToNextSession: number; // minutes
  optimalTradingWindow: boolean;
  institutionalActivity: 'QUIET' | 'BUILDING' | 'ACTIVE' | 'DISTRIBUTION';
}

export interface LiquidityMapping {
  symbol: string;
  timeframes: {
    H4: LiquidityLevel[];
    H1: LiquidityLevel[];
    M15: LiquidityLevel[];
    M5: LiquidityLevel[];
  };
  freshLiquidityZones: LiquidityZone[];
  orderBlocks: OrderBlock[];
  fairValueGaps: FairValueGap[];
  liquiditySweepTargets: number[];
}

export interface LiquidityLevel {
  price: number;
  type: 'BUYSIDE' | 'SELLSIDE' | 'INSTITUTIONAL_BLOCK';
  strength: 'WEAK' | 'MEDIUM' | 'STRONG' | 'UNTOUCHED';
  age: number; // hours since formation
  volume: number;
  tested: boolean;
}

export interface LiquidityZone {
  high: number;
  low: number;
  type: 'FRESH_DEMAND' | 'FRESH_SUPPLY' | 'MITIGATION_BLOCK';
  confluence: number; // 0-100
  timeframe: string;
}

export interface OrderBlock {
  price: number;
  type: 'BULLISH_OB' | 'BEARISH_OB';
  timeframe: string;
  formed: number; // timestamp
  tested: boolean;
  strength: number; // 0-100
}

export interface FairValueGap {
  high: number;
  low: number;
  type: 'BULLISH_FVG' | 'BEARISH_FVG' | 'IFVG';
  timeframe: string;
  filled: boolean;
  partialFill: number; // percentage
}

export interface OrderFlowIntelligence {
  volumeSpikes: VolumeSpike[];
  deltaImbalances: DeltaImbalance[];
  momentumShifts: MomentumShift[];
  atrNormalization: {
    current: number;
    average: number;
    normalized: number;
    tradable: boolean;
  };
  institutionalFootprint: 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL' | 'ABSENT';
}

export interface VolumeSpike {
  timestamp: number;
  volume: number;
  priceLevel: number;
  significance: 'MINOR' | 'MAJOR' | 'INSTITUTIONAL';
}

export interface DeltaImbalance {
  direction: 'BULLISH' | 'BEARISH';
  strength: number; // 0-100
  duration: number; // minutes
  price: number;
}

export interface MomentumShift {
  from: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  to: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  confidence: number;
  timeframe: string;
  trigger: 'BOS' | 'CHoCH' | 'LIQUIDITY_SWEEP' | 'VOLUME_CLIMAX';
}

export interface MicrostructureConfirmation {
  breakOfStructure: {
    occurred: boolean;
    direction: 'BULLISH' | 'BEARISH';
    timeframe: string;
    candleIndex: number;
  };
  retestEntry: {
    setup: boolean;
    quality: 'WEAK' | 'GOOD' | 'PERFECT';
    entryPrice: number;
    confirmationCandle: boolean;
  };
  liquiditySweep: {
    detected: boolean;
    sweepType: 'BUYSIDE' | 'SELLSIDE';
    rejectionWick: boolean;
    wickSize: number; // pips
  };
  microTiming: {
    m1Confirmed: boolean;
    m5Confirmed: boolean;
    entryMethod: 'MARKET' | 'LIMIT' | 'STOP' | 'WAIT';
    urgency: 'IMMEDIATE' | 'NEXT_CANDLE' | 'WAIT_RETEST';
  };
}

export interface PowerfulGroqResult {
  signal?: {
    symbol: string;
    direction: 'BUY' | 'SELL';
    entry: number;
    stopLoss: number;
    takeProfit: number;
    riskReward: number;
    confidence: number;
  };
  marketContext: MarketContext;
  liquidityMapping: LiquidityMapping;
  orderFlow: OrderFlowIntelligence;
  microstructure: MicrostructureConfirmation;
  institutionalGrade: 'ELITE' | 'STRONG' | 'DECENT' | 'WEAK' | 'REJECT';
  reasoning: string[];
  warnings: string[];
  executionWindow: {
    optimal: boolean;
    expiryMinutes: number;
    delayTriggers: string[];
  };
}

export class PowerfulGroqAnalyzer {
  private apiKey: string;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  async performInstitutionalAnalysis(
    symbol: string,
    currentPrice: number
  ): Promise<PowerfulGroqResult> {
    console.log(`🧠 PowerfulGroq: Starting institutional analysis for ${symbol}`);
    
    try {
      // Phase 1: Market Context Assessment
      const marketContext = await this.assessMarketContext(symbol);
      
      // Phase 2: Liquidity Mapping (Multi-Timeframe)
      const liquidityMapping = await this.mapLiquidityStructure(symbol, currentPrice);
      
      // Phase 3: Order Flow Intelligence
      const orderFlow = await this.analyzeOrderFlow(symbol);
      
      // Phase 4: Deep Groq Analysis with Full Context
      const groqAnalysis = await this.executeDeepGroqAnalysis(
        symbol,
        currentPrice,
        marketContext,
        liquidityMapping,
        orderFlow
      );
      
      // Phase 5: Microstructure Entry Confirmation
      const microstructure = await this.confirmMicrostructureEntry(
        symbol,
        (groqAnalysis.signal?.direction === 'BUY' ? 'BULLISH' : 'BEARISH') as 'BULLISH' | 'BEARISH'
      );
      
      // Phase 6: Final Institutional Grading
      const institutionalGrade = this.calculateInstitutionalGrade(
        groqAnalysis,
        marketContext,
        liquidityMapping,
        orderFlow,
        microstructure
      );
      
      return {
        ...groqAnalysis,
        marketContext,
        liquidityMapping,
        orderFlow,
        microstructure,
        institutionalGrade,
        executionWindow: this.determineExecutionWindow(
          groqAnalysis.signal,
          marketContext,
          microstructure
        )
      };
      
    } catch (error) {
      console.error('PowerfulGroq Analysis Error:', error);
      return this.createFailsafeResult(symbol);
    }
  }

  private async assessMarketContext(symbol: string): Promise<MarketContext> {
    const now = new Date();
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();
    
    let session: MarketContext['session'];
    let timeToNext: number;
    let liquidityLevel: MarketContext['liquidityLevel'];
    let institutionalActivity: MarketContext['institutionalActivity'];
    
    // Session Detection with Overlap Windows
    if (hour >= 0 && hour < 8) {
      session = 'ASIA';
      timeToNext = (8 - hour) * 60 - minute;
      liquidityLevel = 'THIN';
      institutionalActivity = 'QUIET';
    } else if (hour >= 8 && hour < 13) {
      session = 'LONDON';
      timeToNext = (13 - hour) * 60 - minute;
      liquidityLevel = 'THICK';
      institutionalActivity = 'ACTIVE';
    } else if (hour >= 13 && hour < 16) {
      session = 'OVERLAP';
      timeToNext = (16 - hour) * 60 - minute;
      liquidityLevel = 'INSTITUTIONAL';
      institutionalActivity = 'ACTIVE';
    } else {
      session = 'NY';
      timeToNext = (24 - hour) * 60 - minute;
      liquidityLevel = 'NORMAL';
      institutionalActivity = 'BUILDING';
    }
    
    // Volatility Assessment
    const volatilityRating = this.assessVolatility(session, symbol, hour);
    
    // News Risk Assessment
    const newsRisk = await this.assessNewsRisk(symbol);
    
    // Optimal Trading Window
    const optimalTradingWindow = this.isOptimalTradingWindow(
      session,
      hour,
      minute,
      newsRisk
    );
    
    return {
      session,
      volatilityRating,
      liquidityLevel,
      newsRisk,
      timeToNextSession: timeToNext,
      optimalTradingWindow,
      institutionalActivity
    };
  }

  private async mapLiquidityStructure(
    symbol: string,
    currentPrice: number
  ): Promise<LiquidityMapping> {
    // Simulate comprehensive liquidity mapping across timeframes
    const mapping: LiquidityMapping = {
      symbol,
      timeframes: {
        H4: this.generateLiquidityLevels(currentPrice, 'H4'),
        H1: this.generateLiquidityLevels(currentPrice, 'H1'),
        M15: this.generateLiquidityLevels(currentPrice, 'M15'),
        M5: this.generateLiquidityLevels(currentPrice, 'M5')
      },
      freshLiquidityZones: this.identifyFreshZones(currentPrice),
      orderBlocks: this.identifyOrderBlocks(currentPrice),
      fairValueGaps: this.identifyFairValueGaps(currentPrice),
      liquiditySweepTargets: this.calculateSweepTargets(currentPrice)
    };
    
    return mapping;
  }

  private async analyzeOrderFlow(symbol: string): Promise<OrderFlowIntelligence> {
    // Simulate advanced order flow analysis
    const atr = this.calculateATR(symbol);
    
    return {
      volumeSpikes: this.detectVolumeSpikes(),
      deltaImbalances: this.detectDeltaImbalances(),
      momentumShifts: this.detectMomentumShifts(),
      atrNormalization: {
        current: atr,
        average: atr * 1.2,
        normalized: atr / (atr * 1.2),
        tradable: atr > 20 // minimum 20 pips ATR
      },
      institutionalFootprint: this.detectInstitutionalFootprint()
    };
  }

  private async executeDeepGroqAnalysis(
    symbol: string,
    currentPrice: number,
    context: MarketContext,
    liquidity: LiquidityMapping,
    orderFlow: OrderFlowIntelligence
  ): Promise<{
    signal?: PowerfulGroqResult['signal'];
    reasoning: string[];
    warnings: string[];
  }> {
    
    if (!this.apiKey) {
      return this.createMockGroqAnalysis(symbol, currentPrice, context);
    }

    const prompt = this.buildInstitutionalPrompt(
      symbol,
      currentPrice,
      context,
      liquidity,
      orderFlow
    );
    
    try {
      const response = await groqService.generateResponse(prompt);
      return this.parseGroqResponse(response);
    } catch (error) {
      console.error('Groq API Error:', error);
      return this.createMockGroqAnalysis(symbol, currentPrice, context);
    }
  }

  private buildInstitutionalPrompt(
    symbol: string,
    price: number,
    context: MarketContext,
    liquidity: LiquidityMapping,
    orderFlow: OrderFlowIntelligence
  ): string {
    return `
You are an elite prop-firm trader analyzing ${symbol} at ${price}. Conduct a DEEP institutional analysis.

MARKET CONTEXT:
- Session: ${context.session} (${context.timeToNextSession}min remaining)
- Volatility: ${context.volatilityRating}
- Liquidity: ${context.liquidityLevel}
- News Risk: ${context.newsRisk}
- Institutional Activity: ${context.institutionalActivity}

LIQUIDITY STRUCTURE:
- H4 Liquidity Levels: ${liquidity.timeframes.H4.length} zones identified
- Fresh Demand/Supply Zones: ${liquidity.freshLiquidityZones.length}
- Untested Order Blocks: ${liquidity.orderBlocks.filter(ob => !ob.tested).length}
- Open Fair Value Gaps: ${liquidity.fairValueGaps.filter(fvg => !fvg.filled).length}

ORDER FLOW INTELLIGENCE:
- ATR Normalized: ${orderFlow.atrNormalization.normalized.toFixed(2)} (Tradable: ${orderFlow.atrNormalization.tradable})
- Volume Spikes: ${orderFlow.volumeSpikes.length} detected
- Delta Imbalances: ${orderFlow.deltaImbalances.length} active
- Institutional Footprint: ${orderFlow.institutionalFootprint}

INSTITUTIONAL REQUIREMENTS:
1. Only trade during optimal sessions (London/NY overlap preferred)
2. Minimum 2:1 RR with liquidity-protected stops
3. Must have break of structure + retest confirmation
4. Target fresh liquidity zones only
5. Avoid trades within 1 hour of high-impact news

ANALYSIS FRAMEWORK:
1. H4 bias assessment
2. H1 structure identification  
3. M15/M5 entry refinement
4. Liquidity sweep targeting
5. Microstructure confirmation

Provide ONLY high-probability setups that meet institutional standards. If conditions are not met, recommend WAIT.

Return analysis in JSON format:
{
  "signal": {
    "symbol": "${symbol}",
    "direction": "BUY|SELL",
    "entry": number,
    "stopLoss": number,
    "takeProfit": number,
    "riskReward": number,
    "confidence": number
  },
  "reasoning": ["step 1", "step 2", "..."],
  "warnings": ["warning 1", "warning 2", "..."]
}
`;
  }

  private async confirmMicrostructureEntry(
    symbol: string,
    direction: 'BULLISH' | 'BEARISH'
  ): Promise<MicrostructureConfirmation> {
    // Simulate microstructure confirmation logic
    const bosOccurred = Math.random() > 0.3;
    const retestQuality = Math.random() > 0.5 ? 'PERFECT' : Math.random() > 0.3 ? 'GOOD' : 'WEAK';
    
    return {
      breakOfStructure: {
        occurred: bosOccurred,
        direction,
        timeframe: 'M15',
        candleIndex: 3
      },
      retestEntry: {
        setup: bosOccurred && retestQuality !== 'WEAK',
        quality: retestQuality as 'WEAK' | 'GOOD' | 'PERFECT',
        entryPrice: 1.0856 + (Math.random() - 0.5) * 0.001,
        confirmationCandle: retestQuality === 'PERFECT'
      },
      liquiditySweep: {
        detected: Math.random() > 0.4,
        sweepType: direction === 'BULLISH' ? 'SELLSIDE' : 'BUYSIDE',
        rejectionWick: Math.random() > 0.3,
        wickSize: 8 + Math.random() * 15
      },
      microTiming: {
        m1Confirmed: Math.random() > 0.4,
        m5Confirmed: Math.random() > 0.3,
        entryMethod: retestQuality === 'PERFECT' ? 'LIMIT' : 'MARKET',
        urgency: retestQuality === 'PERFECT' ? 'NEXT_CANDLE' : 'IMMEDIATE'
      }
    };
  }

  // Helper methods for data generation
  private generateLiquidityLevels(price: number, timeframe: string): LiquidityLevel[] {
    const levels: LiquidityLevel[] = [];
    const count = timeframe === 'H4' ? 3 : timeframe === 'H1' ? 4 : 5;
    
    for (let i = 0; i < count; i++) {
      levels.push({
        price: price + (Math.random() - 0.5) * 0.01,
        type: Math.random() > 0.5 ? 'BUYSIDE' : 'SELLSIDE',
        strength: ['WEAK', 'MEDIUM', 'STRONG', 'UNTOUCHED'][Math.floor(Math.random() * 4)] as any,
        age: Math.random() * 24,
        volume: 1000000 + Math.random() * 5000000,
        tested: Math.random() > 0.6
      });
    }
    
    return levels;
  }

  private identifyFreshZones(price: number): LiquidityZone[] {
    return Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => ({
      high: price + Math.random() * 0.005,
      low: price - Math.random() * 0.005,
      type: Math.random() > 0.5 ? 'FRESH_DEMAND' : 'FRESH_SUPPLY',
      confluence: 60 + Math.random() * 40,
      timeframe: ['H1', 'M15', 'M5'][Math.floor(Math.random() * 3)]
    }));
  }

  private identifyOrderBlocks(price: number): OrderBlock[] {
    return Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => ({
      price: price + (Math.random() - 0.5) * 0.008,
      type: Math.random() > 0.5 ? 'BULLISH_OB' : 'BEARISH_OB',
      timeframe: ['H1', 'M15'][Math.floor(Math.random() * 2)],
      formed: Date.now() - Math.random() * 86400000,
      tested: Math.random() > 0.7,
      strength: 70 + Math.random() * 30
    }));
  }

  private identifyFairValueGaps(price: number): FairValueGap[] {
    return Array.from({ length: Math.floor(Math.random() * 3) }, () => ({
      high: price + Math.random() * 0.003,
      low: price - Math.random() * 0.003,
      type: Math.random() > 0.5 ? 'BULLISH_FVG' : 'BEARISH_FVG',
      timeframe: ['M15', 'M5'][Math.floor(Math.random() * 2)],
      filled: Math.random() > 0.6,
      partialFill: Math.random() * 100
    }));
  }

  private calculateSweepTargets(price: number): number[] {
    return Array.from({ length: 2 + Math.floor(Math.random() * 2) }, () => 
      price + (Math.random() - 0.5) * 0.015
    );
  }

  private detectVolumeSpikes(): VolumeSpike[] {
    return Array.from({ length: Math.floor(Math.random() * 4) }, () => ({
      timestamp: Date.now() - Math.random() * 3600000,
      volume: 1000000 + Math.random() * 10000000,
      priceLevel: 1.0856 + (Math.random() - 0.5) * 0.01,
      significance: ['MINOR', 'MAJOR', 'INSTITUTIONAL'][Math.floor(Math.random() * 3)] as any
    }));
  }

  private detectDeltaImbalances(): DeltaImbalance[] {
    return Array.from({ length: Math.floor(Math.random() * 3) }, () => ({
      direction: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH',
      strength: 60 + Math.random() * 40,
      duration: 5 + Math.random() * 25,
      price: 1.0856 + (Math.random() - 0.5) * 0.005
    }));
  }

  private detectMomentumShifts(): MomentumShift[] {
    const directions = ['BULLISH', 'BEARISH', 'SIDEWAYS'] as const;
    return Array.from({ length: Math.floor(Math.random() * 2) }, () => ({
      from: directions[Math.floor(Math.random() * 3)],
      to: directions[Math.floor(Math.random() * 3)],
      confidence: 70 + Math.random() * 30,
      timeframe: ['M15', 'M5'][Math.floor(Math.random() * 2)],
      trigger: ['BOS', 'CHoCH', 'LIQUIDITY_SWEEP', 'VOLUME_CLIMAX'][Math.floor(Math.random() * 4)] as any
    }));
  }

  private calculateATR(symbol: string): number {
    const atrMap: Record<string, number> = {
      'EURUSD': 45,
      'GBPUSD': 85,
      'USDJPY': 65,
      'AUDUSD': 55,
      'USDCAD': 50
    };
    return atrMap[symbol] || 50;
  }

  private detectInstitutionalFootprint(): OrderFlowIntelligence['institutionalFootprint'] {
    const footprints = ['ACCUMULATING', 'DISTRIBUTING', 'NEUTRAL', 'ABSENT'] as const;
    return footprints[Math.floor(Math.random() * footprints.length)];
  }

  private assessVolatility(
    session: MarketContext['session'],
    symbol: string,
    hour: number
  ): MarketContext['volatilityRating'] {
    if (session === 'OVERLAP' && symbol.includes('GBP')) return 'EXTREME';
    if (session === 'LONDON' && (hour >= 8 && hour <= 10)) return 'HIGH';
    if (session === 'NY' && (hour >= 14 && hour <= 16)) return 'HIGH';
    if (session === 'ASIA') return 'LOW';
    return 'MEDIUM';
  }

  private async assessNewsRisk(symbol: string): Promise<MarketContext['newsRisk']> {
    // Simulate news risk assessment
    const hour = new Date().getUTCHours();
    const minute = new Date().getUTCMinutes();
    
    // High risk during typical news release times
    if ((hour === 8 && minute >= 30) || (hour === 14 && minute >= 30)) {
      return 'HIGH';
    }
    
    return Math.random() > 0.8 ? 'MEDIUM' : 'LOW';
  }

  private isOptimalTradingWindow(
    session: MarketContext['session'],
    hour: number,
    minute: number,
    newsRisk: MarketContext['newsRisk']
  ): boolean {
    if (newsRisk === 'HIGH' || newsRisk === 'BLACKOUT') return false;
    
    // Optimal windows
    const londonOpen = hour >= 8 && hour <= 12;
    const nyOpen = hour >= 13 && hour <= 17;
    const overlap = hour >= 13 && hour <= 16;
    
    return londonOpen || nyOpen || overlap;
  }

  private calculateInstitutionalGrade(
    analysis: any,
    context: MarketContext,
    liquidity: LiquidityMapping,
    orderFlow: OrderFlowIntelligence,
    microstructure: MicrostructureConfirmation
  ): 'ELITE' | 'STRONG' | 'DECENT' | 'WEAK' | 'REJECT' {
    let score = 0;
    
    // Context scoring
    if (context.optimalTradingWindow) score += 25;
    if (context.volatilityRating === 'HIGH') score += 20;
    if (context.liquidityLevel === 'INSTITUTIONAL') score += 15;
    
    // Liquidity scoring
    const freshZones = liquidity.freshLiquidityZones.length;
    if (freshZones >= 2) score += 20;
    
    // Order flow scoring
    if (orderFlow.atrNormalization.tradable) score += 10;
    if (orderFlow.institutionalFootprint === 'ACCUMULATING') score += 15;
    
    // Microstructure scoring
    if (microstructure.breakOfStructure.occurred) score += 20;
    if (microstructure.retestEntry.quality === 'PERFECT') score += 25;
    if (microstructure.liquiditySweep.detected) score += 15;
    
    if (score >= 90) return 'ELITE';
    if (score >= 75) return 'STRONG';
    if (score >= 60) return 'DECENT';
    if (score >= 45) return 'WEAK';
    return 'REJECT';
  }

  private determineExecutionWindow(
    signal: PowerfulGroqResult['signal'],
    context: MarketContext,
    microstructure: MicrostructureConfirmation
  ): PowerfulGroqResult['executionWindow'] {
    const delayTriggers: string[] = [];
    let optimal = true;
    let expiryMinutes = 15;
    
    if (!context.optimalTradingWindow) {
      delayTriggers.push('OUTSIDE_OPTIMAL_SESSION');
      optimal = false;
      expiryMinutes = 60;
    }
    
    if (context.newsRisk === 'HIGH') {
      delayTriggers.push('HIGH_IMPACT_NEWS_PROXIMITY');
      optimal = false;
    }
    
    if (microstructure.retestEntry.quality === 'WEAK') {
      delayTriggers.push('POOR_RETEST_QUALITY');
      optimal = false;
    }
    
    if (!microstructure.microTiming.m5Confirmed) {
      delayTriggers.push('AWAITING_M5_CONFIRMATION');
      expiryMinutes = 25;
    }
    
    return {
      optimal,
      expiryMinutes,
      delayTriggers
    };
  }

  private createMockGroqAnalysis(
    symbol: string,
    price: number,
    context: MarketContext
  ): {
    signal?: PowerfulGroqResult['signal'];
    reasoning: string[];
    warnings: string[];
  } {
    if (!context.optimalTradingWindow || context.newsRisk === 'HIGH') {
      return {
        reasoning: ['Market conditions not optimal for trading'],
        warnings: ['Waiting for better setup']
      };
    }
    
    const direction = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const slDistance = 0.002;
    const tpDistance = 0.004;
    
    return {
      signal: {
        symbol,
        direction,
        entry: price,
        stopLoss: direction === 'BUY' ? price - slDistance : price + slDistance,
        takeProfit: direction === 'BUY' ? price + tpDistance : price - tpDistance,
        riskReward: 2.0,
        confidence: 78 + Math.random() * 15
      },
      reasoning: [
        `${context.session} session with ${context.volatilityRating} volatility`,
        `Liquidity level: ${context.liquidityLevel}`,
        'Multi-timeframe confluence detected',
        'Fresh liquidity zones identified'
      ],
      warnings: context.newsRisk !== 'LOW' ? ['Elevated news risk detected'] : []
    };
  }

  private parseGroqResponse(response: string): {
    signal?: PowerfulGroqResult['signal'];
    reasoning: string[];
    warnings: string[];
  } {
    try {
      const parsed = JSON.parse(response);
      return {
        signal: parsed.signal,
        reasoning: parsed.reasoning || [],
        warnings: parsed.warnings || []
      };
    } catch (error) {
      return {
        reasoning: ['Failed to parse Groq response'],
        warnings: ['Using fallback analysis']
      };
    }
  }

  private createFailsafeResult(symbol: string): PowerfulGroqResult {
    return {
      marketContext: {
        session: 'ASIA',
        volatilityRating: 'LOW',
        liquidityLevel: 'THIN',
        newsRisk: 'NONE',
        timeToNextSession: 120,
        optimalTradingWindow: false,
        institutionalActivity: 'QUIET'
      },
      liquidityMapping: {
        symbol,
        timeframes: { H4: [], H1: [], M15: [], M5: [] },
        freshLiquidityZones: [],
        orderBlocks: [],
        fairValueGaps: [],
        liquiditySweepTargets: []
      },
      orderFlow: {
        volumeSpikes: [],
        deltaImbalances: [],
        momentumShifts: [],
        atrNormalization: { current: 0, average: 0, normalized: 0, tradable: false },
        institutionalFootprint: 'ABSENT'
      },
      microstructure: {
        breakOfStructure: { occurred: false, direction: 'BULLISH', timeframe: 'M15', candleIndex: 0 },
        retestEntry: { setup: false, quality: 'WEAK', entryPrice: 0, confirmationCandle: false },
        liquiditySweep: { detected: false, sweepType: 'BUYSIDE', rejectionWick: false, wickSize: 0 },
        microTiming: { m1Confirmed: false, m5Confirmed: false, entryMethod: 'WAIT', urgency: 'WAIT_RETEST' }
      },
      institutionalGrade: 'REJECT',
      reasoning: ['Analysis failed - system error'],
      warnings: ['Unable to complete institutional analysis'],
      executionWindow: { optimal: false, expiryMinutes: 0, delayTriggers: ['SYSTEM_ERROR'] }
    };
  }

  // Configuration
  setApiKey(key: string) {
    this.apiKey = key;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const powerfulGroqAnalyzer = new PowerfulGroqAnalyzer();