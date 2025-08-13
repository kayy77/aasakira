import { groqService } from './groqService';

export interface MultiTimeframeContext {
  h4Trend: 'BULLISH' | 'BEARISH' | 'RANGING';
  h1Structure: 'BROKEN_HIGHER' | 'BROKEN_LOWER' | 'CONSOLIDATING';
  m15Setup: 'LONG_SETUP' | 'SHORT_SETUP' | 'NO_SETUP';
  m5Entry: 'CONFIRMED' | 'PENDING' | 'INVALID';
  m1Trigger: 'FIRED' | 'WAITING' | 'FAILED';
}

export interface LiquidityMap {
  majorResistance: number[];
  majorSupport: number[];
  liquidityPools: Array<{
    price: number;
    type: 'BUY_STOPS' | 'SELL_STOPS';
    strength: 'WEAK' | 'MODERATE' | 'STRONG';
    distance: number;
  }>;
  nearestSweepTarget: {
    price: number;
    type: 'HIGH' | 'LOW';
    probability: number;
  };
}

export interface SessionContext {
  current: 'ASIA' | 'LONDON' | 'NY' | 'OVERLAP';
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  timeRemaining: number; // minutes left in session
  averageRange: number; // pips for this session
  newsRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  institutionalActivity: 'QUIET' | 'MODERATE' | 'ACTIVE';
}

export interface OrderFlowMetrics {
  buyVolume: number;
  sellVolume: number;
  volumeDelta: number;
  largeOrderFlow: 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL';
  institutionalFootprint: 'PRESENT' | 'ABSENT';
  momentum: 'BUILDING' | 'FADING' | 'NEUTRAL';
}

export interface AIModelWeights {
  groqAccuracy: number;
  geminiAccuracy: number;
  cohereAccuracy: number;
  recentPerformance: {
    [key: string]: number; // pair -> accuracy
  };
  sessionWeights: {
    [key: string]: number; // session -> weight multiplier
  };
}

export interface MultiPassResult {
  passOne: {
    highProbabilityPairs: string[];
    reasoning: string;
    score: number;
  };
  passTwo: {
    technicalAnalysis: any;
    smcValidation: boolean;
    ictConfirmation: boolean;
    score: number;
  };
  passThree: {
    microstructureValid: boolean;
    confirmationCandle: boolean;
    liquiditySweep: boolean;
    score: number;
  };
  finalSignal?: {
    symbol: string;
    direction: 'BUY' | 'SELL';
    entry: number;
    sl: number;
    tp: number;
    confidence: number;
    riskReward: number;
    entryType: 'MARKET' | 'LIMIT' | 'STOP';
    timeInForce: number;
  };
}

export class MultiPassGroqAnalyzer {
  private apiKey: string = '';
  private modelWeights: AIModelWeights = {
    groqAccuracy: 0.75,
    geminiAccuracy: 0.72,
    cohereAccuracy: 0.68,
    recentPerformance: {},
    sessionWeights: {
      'LONDON': 1.2,
      'NY': 1.1,
      'OVERLAP': 1.3,
      'ASIA': 0.8
    }
  };

  constructor(apiKey?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
      groqService.setApiKey(apiKey);
    }
  }

  async executeMultiPassAnalysis(
    symbols: string[],
    livePrice: number,
    sessionContext: SessionContext,
    orderFlowMetrics: OrderFlowMetrics
  ): Promise<MultiPassResult> {
    console.log('🎯 Starting Multi-Pass Groq Analysis');

    // Skip if conditions aren't met
    if (sessionContext.volatility === 'LOW' && sessionContext.current === 'ASIA') {
      throw new Error('SKIP_LOW_VOLATILITY_SESSION');
    }

    if (sessionContext.newsRisk === 'HIGH') {
      throw new Error('SKIP_HIGH_NEWS_RISK');
    }

    // Pass 1: High-probability pair filtering
    const passOne = await this.passOneFilter(symbols, sessionContext, orderFlowMetrics);
    
    if (passOne.score < 70) {
      throw new Error('INSUFFICIENT_PROBABILITY_SCORE');
    }

    // Pass 2: Deep technical analysis
    const passTwo = await this.passTwoTechnical(passOne.highProbabilityPairs[0], livePrice, sessionContext);
    
    if (passTwo.score < 75) {
      throw new Error('TECHNICAL_ANALYSIS_FAILED');
    }

    // Pass 3: Microstructure confirmation
    const passThree = await this.passThreeMicrostructure(passOne.highProbabilityPairs[0], livePrice);
    
    if (passThree.score < 80) {
      throw new Error('MICROSTRUCTURE_CONFIRMATION_FAILED');
    }

    // Generate final signal only if all passes succeeded
    const finalSignal = await this.generateFinalSignal(
      passOne.highProbabilityPairs[0],
      livePrice,
      passTwo,
      passThree,
      sessionContext
    );

    return {
      passOne,
      passTwo,
      passThree,
      finalSignal
    };
  }

  private async passOneFilter(
    symbols: string[],
    sessionContext: SessionContext,
    orderFlowMetrics: OrderFlowMetrics
  ) {
    const prompt = `
PASS 1: HIGH-PROBABILITY PAIR FILTER

Session: ${sessionContext.current} (${sessionContext.timeRemaining}min remaining)
Volatility: ${sessionContext.volatility}
Order Flow: ${orderFlowMetrics.largeOrderFlow}
Institutional Activity: ${sessionContext.institutionalActivity}

Symbols to analyze: ${symbols.join(', ')}

FILTER CRITERIA:
- Session alignment (London/NY best, Asia avoid unless breakout)
- Order flow momentum (need ACCUMULATING or DISTRIBUTING)
- Volatility match (HIGH vol = trend continuation, MED = reversal setups)
- News risk assessment

Return JSON:
{
  "highProbabilityPairs": ["symbol1", "symbol2"],
  "reasoning": "detailed explanation",
  "score": 85,
  "sessionBias": "BULLISH/BEARISH/NEUTRAL",
  "skipReasons": []
}

CRITICAL: Only return pairs with >70% probability in current session.
`;

    const response = await groqService.generateResponse(prompt, {
      model: 'llama3-70b-8192',
      temperature: 0.2,
      max_tokens: 1000
    });

    return this.parseJsonResponse(response, {
      highProbabilityPairs: [],
      reasoning: 'Failed to parse',
      score: 0
    });
  }

  private async passTwoTechnical(
    symbol: string,
    livePrice: number,
    sessionContext: SessionContext
  ) {
    const liquidityMap = await this.generateLiquidityMap(symbol, livePrice);
    const mtfContext = await this.analyzeMultiTimeframe(symbol, livePrice);

    const prompt = `
PASS 2: DEEP TECHNICAL ANALYSIS

Symbol: ${symbol}
Current Price: ${livePrice}
Session: ${sessionContext.current}

MULTI-TIMEFRAME CONTEXT:
H4 Trend: ${mtfContext.h4Trend}
H1 Structure: ${mtfContext.h1Structure}
M15 Setup: ${mtfContext.m15Setup}
M5 Entry: ${mtfContext.m5Entry}

LIQUIDITY MAP:
Major Support: ${liquidityMap.majorSupport.join(', ')}
Major Resistance: ${liquidityMap.majorResistance.join(', ')}
Nearest Sweep Target: ${liquidityMap.nearestSweepTarget.price} (${liquidityMap.nearestSweepTarget.type})

SMC/ICT VALIDATION REQUIRED:
1. Structure break confirmation (ChoCh/BOS)
2. Fair Value Gap identification
3. Order block validation
4. Liquidity sweep setup
5. Imbalance mitigation

Return JSON:
{
  "technicalAnalysis": {
    "structureBreak": "confirmed/pending/invalid",
    "fvgPresent": true/false,
    "orderBlockValid": true/false,
    "liquiditySetup": "sweep_pending/sweep_complete/no_setup"
  },
  "smcValidation": true/false,
  "ictConfirmation": true/false,
  "score": 82,
  "direction": "BUY/SELL",
  "invalidationLevel": 1.2345
}

REQUIREMENT: All 5 SMC/ICT criteria must be met for score >75.
`;

    const response = await groqService.generateResponse(prompt, {
      model: 'llama3-70b-8192',
      temperature: 0.1,
      max_tokens: 1200
    });

    return this.parseJsonResponse(response, {
      technicalAnalysis: {},
      smcValidation: false,
      ictConfirmation: false,
      score: 0
    });
  }

  private async passThreeMicrostructure(symbol: string, livePrice: number) {
    const prompt = `
PASS 3: MICROSTRUCTURE CONFIRMATION

Symbol: ${symbol}
Current Price: ${livePrice}

MICROSTRUCTURE CHECKLIST:
1. Liquidity sweep completed (high/low taken)
2. Close back above/below sweep level (ChoCh confirmed)
3. Retest of IFVG/OB with rejection wick
4. M1 confirmation candle (2+ consecutive closes in bias direction)
5. Volume confirmation on trigger candle

STRICT ENTRY REQUIREMENTS:
- Must have liquidity sweep + close back
- Must have retest with rejection (not first touch)
- Must have M1 trigger candle sequence
- Must be within optimal entry zone (0.5-0.618 of move)

Return JSON:
{
  "microstructureValid": true/false,
  "confirmationCandle": true/false,
  "liquiditySweep": true/false,
  "retestQuality": "strong/weak/none",
  "volumeConfirmation": true/false,
  "m1TriggerSequence": true/false,
  "score": 85,
  "entryTiming": "immediate/wait_retest/invalid",
  "optimalEntry": 1.2345
}

CRITICAL: Score <80 = reject. All microstructure elements must align.
`;

    const response = await groqService.generateResponse(prompt, {
      model: 'llama3-70b-8192',
      temperature: 0.1,
      max_tokens: 800
    });

    return this.parseJsonResponse(response, {
      microstructureValid: false,
      confirmationCandle: false,
      liquiditySweep: false,
      score: 0
    });
  }

  private async generateFinalSignal(
    symbol: string,
    livePrice: number,
    passTwo: any,
    passThree: any,
    sessionContext: SessionContext
  ) {
    const sessionWeight = this.modelWeights.sessionWeights[sessionContext.current] || 1.0;
    const adjustedConfidence = Math.min(95, (passTwo.score + passThree.score) / 2 * sessionWeight);

    if (adjustedConfidence < 78) {
      throw new Error('FINAL_CONFIDENCE_TOO_LOW');
    }

    const prompt = `
FINAL SIGNAL GENERATION

Symbol: ${symbol}
Technical Score: ${passTwo.score}
Microstructure Score: ${passThree.score}
Session Weight: ${sessionWeight}
Final Confidence: ${adjustedConfidence}%

Direction: ${passTwo.direction}
Optimal Entry: ${passThree.optimalEntry}
Invalidation: ${passTwo.invalidationLevel}

INSTITUTIONAL EXECUTION PLAN:
Entry Type: LIMIT (wait for retest) or STOP (momentum continuation) or MARKET (immediate)
Risk Management: SL beyond liquidity + ATR buffer
Target: Minimum 1:2 RR, optimal 1:3
Time in Force: Cancel if not filled within session

Return JSON:
{
  "symbol": "${symbol}",
  "direction": "${passTwo.direction}",
  "entry": ${passThree.optimalEntry},
  "sl": calculated_stop_loss,
  "tp": calculated_take_profit,
  "confidence": ${adjustedConfidence},
  "riskReward": calculated_rr,
  "entryType": "LIMIT/STOP/MARKET",
  "timeInForce": minutes_to_cancel,
  "reasoning": "concise execution rationale"
}

REQUIREMENTS: RR ≥ 1:2, Confidence ≥ 78%, Stop beyond liquidity.
`;

    const response = await groqService.generateResponse(prompt, {
      model: 'llama3-70b-8192',
      temperature: 0.05,
      max_tokens: 600
    });

    return this.parseJsonResponse(response, null);
  }

  private async generateLiquidityMap(symbol: string, livePrice: number): Promise<LiquidityMap> {
    // Simulate liquidity analysis - in production this would use real market data
    const atr = 50; // pips, would be calculated from real data
    
    return {
      majorResistance: [livePrice + atr * 1.5, livePrice + atr * 2.5],
      majorSupport: [livePrice - atr * 1.5, livePrice - atr * 2.5],
      liquidityPools: [
        {
          price: livePrice + atr,
          type: 'BUY_STOPS',
          strength: 'STRONG',
          distance: atr
        }
      ],
      nearestSweepTarget: {
        price: livePrice + atr,
        type: 'HIGH',
        probability: 0.75
      }
    };
  }

  private async analyzeMultiTimeframe(symbol: string, livePrice: number): Promise<MultiTimeframeContext> {
    // Simulate MTF analysis - in production this would analyze real chart data
    return {
      h4Trend: 'BULLISH',
      h1Structure: 'BROKEN_HIGHER',
      m15Setup: 'LONG_SETUP',
      m5Entry: 'CONFIRMED',
      m1Trigger: 'FIRED'
    };
  }

  private parseJsonResponse(response: string, fallback: any) {
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse Groq response:', error);
      return fallback;
    }
  }

  updateModelWeights(symbol: string, session: string, success: boolean) {
    if (!this.modelWeights.recentPerformance[symbol]) {
      this.modelWeights.recentPerformance[symbol] = 0.75;
    }
    
    const adjustment = success ? 0.02 : -0.03;
    this.modelWeights.recentPerformance[symbol] += adjustment;
    this.modelWeights.recentPerformance[symbol] = Math.max(0.3, Math.min(0.95, this.modelWeights.recentPerformance[symbol]));
    
    console.log(`📊 Updated ${symbol} accuracy: ${this.modelWeights.recentPerformance[symbol]}`);
  }

  setApiKey(key: string) {
    this.apiKey = key;
    groqService.setApiKey(key);
  }

  isConfigured(): boolean {
    return groqService.isConfigured();
  }
}

export const multiPassGroqAnalyzer = new MultiPassGroqAnalyzer();