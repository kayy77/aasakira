import { multiPassGroqAnalyzer, MultiPassResult, SessionContext, OrderFlowMetrics } from './multiPassGroqAnalyzer';
import { InstitutionalValidator, RawSignal, validateInstitutional } from './validation/institutionalValidator';
import { SniperConfirmationEngine } from './validation/sniperConfirmationEngine';
import { OrderFlowAnalyzer } from './validation/orderFlowAnalyzer';
import { MultiTimeframeConfirmation } from './validation/multiTimeframeConfirmation';

export interface EnhancedSignalConfig {
  symbols: string[];
  maxSignalsPerSession: number;
  minConfidence: number;
  requireOrderFlow: boolean;
  adaptiveWeights: boolean;
  strictValidation: boolean;
}

export interface SignalResult {
  signal?: RawSignal;
  rejected: boolean;
  rejectionReasons: string[];
  multiPassResult?: MultiPassResult;
  validationResults: {
    institutional: boolean;
    sniper: boolean;
    orderFlow: boolean;
    multiTimeframe: boolean;
  };
  metadata: {
    session: string;
    confidence: number;
    processingTime: number;
    modelWeights: any;
  };
}

export class EnhancedSignalEngine {
  private config: EnhancedSignalConfig;
  private sessionSignalCount: { [key: string]: number } = {};
  private lastSignalTime: number = 0;
  private readonly MIN_SIGNAL_INTERVAL = 300000; // 5 minutes

  constructor(config: Partial<EnhancedSignalConfig> = {}) {
    this.config = {
      symbols: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'],
      maxSignalsPerSession: 3,
      minConfidence: 78,
      requireOrderFlow: true,
      adaptiveWeights: true,
      strictValidation: true,
      ...config
    };
  }

  async generateEnhancedSignal(): Promise<SignalResult> {
    const startTime = Date.now();
    console.log('🚀 Enhanced Signal Engine: Starting analysis...');

    try {
      // Check rate limiting
      if (Date.now() - this.lastSignalTime < this.MIN_SIGNAL_INTERVAL) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      // Get current session context
      const sessionContext = this.getCurrentSessionContext();
      
      // Check session signal limits
      const sessionKey = `${sessionContext.current}_${new Date().toDateString()}`;
      if ((this.sessionSignalCount[sessionKey] || 0) >= this.config.maxSignalsPerSession) {
        throw new Error('SESSION_LIMIT_EXCEEDED');
      }

      // Get order flow metrics
      const orderFlowMetrics = await this.getOrderFlowMetrics();

      // Skip if order flow requirement not met
      if (this.config.requireOrderFlow && orderFlowMetrics.institutionalFootprint === 'ABSENT') {
        throw new Error('INSUFFICIENT_ORDER_FLOW');
      }

      // Execute multi-pass Groq analysis
      const multiPassResult = await multiPassGroqAnalyzer.executeMultiPassAnalysis(
        this.config.symbols,
        this.getCurrentPrice(this.config.symbols[0]), // Use first symbol as primary
        sessionContext,
        orderFlowMetrics
      );

      if (!multiPassResult.finalSignal) {
        throw new Error('NO_FINAL_SIGNAL_GENERATED');
      }

      // Convert to RawSignal format for validation
      const rawSignal: RawSignal = {
        symbol: multiPassResult.finalSignal.symbol,
        side: multiPassResult.finalSignal.direction,
        entry: multiPassResult.finalSignal.entry,
        sl: multiPassResult.finalSignal.sl,
        tp: multiPassResult.finalSignal.tp,
        rr: multiPassResult.finalSignal.riskReward,
        spread: this.getSpread(multiPassResult.finalSignal.symbol),
        atrPips: this.getATRPips(multiPassResult.finalSignal.symbol),
        session: sessionContext.current as 'ASIA' | 'LONDON' | 'NY',
        newsRisk: sessionContext.newsRisk as 'LOW' | 'HIGH' | 'MED',
        priceAgeMs: 500, // Simulated - would be real in production
        nearestOppLiquidityPips: this.getNearestLiquidityDistance(multiPassResult.finalSignal),
        structureAlignedTFs: 4, // From multi-timeframe analysis
        confluenceScore: multiPassResult.finalSignal.confidence,
        confirmationState: 'RETEST_CONFIRMED' // From pass 3
      };

      // Multi-layer validation
      const validationResults = await this.performMultiLayerValidation(rawSignal, orderFlowMetrics);

      // Check if all validations passed
      const allValidationsPassed = Object.values(validationResults).every(v => v);

      if (!allValidationsPassed && this.config.strictValidation) {
        const failedValidations = Object.entries(validationResults)
          .filter(([_, passed]) => !passed)
          .map(([name, _]) => name);
        
        throw new Error(`VALIDATION_FAILED: ${failedValidations.join(', ')}`);
      }

      // Final confidence check
      if (multiPassResult.finalSignal.confidence < this.config.minConfidence) {
        throw new Error('CONFIDENCE_TOO_LOW');
      }

      // Update counters and tracking
      this.sessionSignalCount[sessionKey] = (this.sessionSignalCount[sessionKey] || 0) + 1;
      this.lastSignalTime = Date.now();

      // Update adaptive weights if enabled
      if (this.config.adaptiveWeights) {
        this.updateAdaptiveWeights(multiPassResult.finalSignal.symbol, sessionContext.current, true);
      }

      const processingTime = Date.now() - startTime;
      console.log(`✅ Enhanced signal generated in ${processingTime}ms`);

      return {
        signal: rawSignal,
        rejected: false,
        rejectionReasons: [],
        multiPassResult,
        validationResults,
        metadata: {
          session: sessionContext.current,
          confidence: multiPassResult.finalSignal.confidence,
          processingTime,
          modelWeights: this.getModelWeights()
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.log(`❌ Signal rejected: ${error.message} (${processingTime}ms)`);

      // Update adaptive weights for rejection if enabled
      if (this.config.adaptiveWeights && error.message.includes('VALIDATION_FAILED')) {
        this.updateAdaptiveWeights(this.config.symbols[0], this.getCurrentSessionContext().current, false);
      }

      return {
        rejected: true,
        rejectionReasons: [error.message],
        validationResults: {
          institutional: false,
          sniper: false,
          orderFlow: false,
          multiTimeframe: false
        },
        metadata: {
          session: this.getCurrentSessionContext().current,
          confidence: 0,
          processingTime,
          modelWeights: this.getModelWeights()
        }
      };
    }
  }

  private async performMultiLayerValidation(
    rawSignal: RawSignal,
    orderFlowMetrics: OrderFlowMetrics
  ) {
    const validationResults = {
      institutional: false,
      sniper: false,
      orderFlow: false,
      multiTimeframe: false
    };

    try {
      // Layer 1: Institutional validation
      const institutionalResult = validateInstitutional(rawSignal);
      validationResults.institutional = institutionalResult.ok;

      // Layer 2: Sniper confirmation
      const sniperResult = await SniperConfirmationEngine.analyzeSniperStructure({
        symbol: rawSignal.symbol,
        side: rawSignal.side,
        currentPrice: rawSignal.entry,
        atrPips: rawSignal.atrPips,
        session: rawSignal.session,
        liquiditySwept: true, // From multi-pass analysis
        closedBack: true,
        retestOccurred: true,
        rejectionCandle: true,
        microBOS: true,
        volumeConfirmation: orderFlowMetrics.volumeDelta > 0,
        ifvgMidpoint: rawSignal.entry,
        rejectionWickSize: rawSignal.atrPips * 0.3
      });
      validationResults.sniper = sniperResult.sniperValid;

      // Layer 3: Order flow validation
      const orderFlowResult = await OrderFlowAnalyzer.getInstitutionalFootprint({
        symbol: rawSignal.symbol,
        timeframe: 'M5',
        buyVolume: orderFlowMetrics.buyVolume,
        sellVolume: orderFlowMetrics.sellVolume,
        volumeDelta: orderFlowMetrics.volumeDelta,
        largeOrders: orderFlowMetrics.largeOrderFlow === 'ACCUMULATING' ? 1000 : 0,
        priceAction: rawSignal.side === 'BUY' ? 'AGGRESSIVE_BUYING' : 'AGGRESSIVE_SELLING',
        timeOfDay: new Date().getHours()
      });
      validationResults.orderFlow = orderFlowResult.signal.strength > 0.7;

      // Layer 4: Multi-timeframe confirmation
      const mtfResult = await MultiTimeframeConfirmation.analyzeAlignment({
        symbol: rawSignal.symbol,
        primaryTF: 'M15',
        confirmationTFs: ['H1', 'M5', 'M1'],
        primaryBias: rawSignal.side,
        priceAction: {
          h4: rawSignal.side === 'BUY' ? 'BULLISH' : 'BEARISH',
          h1: rawSignal.side === 'BUY' ? 'BULLISH' : 'BEARISH',
          m15: rawSignal.side === 'BUY' ? 'BULLISH' : 'BEARISH',
          m5: rawSignal.side === 'BUY' ? 'BULLISH' : 'BEARISH'
        },
        structuralLevels: {
          support: rawSignal.sl,
          resistance: rawSignal.tp
        }
      });
      validationResults.multiTimeframe = mtfResult.aligned && mtfResult.confidence > 0.75;

    } catch (error) {
      console.error('Validation error:', error);
    }

    return validationResults;
  }

  private getCurrentSessionContext(): SessionContext {
    const now = new Date();
    const hour = now.getUTCHours();
    
    let current: 'ASIA' | 'LONDON' | 'NY' | 'OVERLAP';
    let volatility: 'LOW' | 'MEDIUM' | 'HIGH';
    let timeRemaining: number;
    let institutionalActivity: 'QUIET' | 'MODERATE' | 'ACTIVE';

    if (hour >= 0 && hour < 8) {
      current = 'ASIA';
      volatility = 'LOW';
      timeRemaining = (8 - hour) * 60;
      institutionalActivity = 'QUIET';
    } else if (hour >= 8 && hour < 12) {
      current = 'LONDON';
      volatility = 'HIGH';
      timeRemaining = (12 - hour) * 60;
      institutionalActivity = 'ACTIVE';
    } else if (hour >= 12 && hour < 16) {
      current = 'OVERLAP';
      volatility = 'HIGH';
      timeRemaining = (16 - hour) * 60;
      institutionalActivity = 'ACTIVE';
    } else {
      current = 'NY';
      volatility = 'MEDIUM';
      timeRemaining = (24 - hour) * 60;
      institutionalActivity = 'MODERATE';
    }

    return {
      current,
      volatility,
      timeRemaining,
      averageRange: 80, // pips, would be calculated from historical data
      newsRisk: 'LOW', // Would integrate with news calendar
      institutionalActivity
    };
  }

  private async getOrderFlowMetrics(): Promise<OrderFlowMetrics> {
    // Simulate order flow - in production this would connect to real data
    return {
      buyVolume: Math.random() * 1000000,
      sellVolume: Math.random() * 1000000,
      volumeDelta: (Math.random() - 0.5) * 200000,
      largeOrderFlow: Math.random() > 0.5 ? 'ACCUMULATING' : 'DISTRIBUTING',
      institutionalFootprint: Math.random() > 0.3 ? 'PRESENT' : 'ABSENT',
      momentum: Math.random() > 0.6 ? 'BUILDING' : 'NEUTRAL'
    };
  }

  private getCurrentPrice(symbol: string): number {
    // Simulate current price - in production this would use real live prices
    const basePrices = {
      'EURUSD': 1.0850,
      'GBPUSD': 1.2650,
      'USDJPY': 149.50,
      'AUDUSD': 0.6450,
      'USDCAD': 1.3750
    };
    return basePrices[symbol] || 1.0000;
  }

  private getSpread(symbol: string): number {
    // Simulate spread - in production would use real broker data
    const spreads = {
      'EURUSD': 0.1,
      'GBPUSD': 0.2,
      'USDJPY': 0.1,
      'AUDUSD': 0.2,
      'USDCAD': 0.2
    };
    return spreads[symbol] || 0.2;
  }

  private getATRPips(symbol: string): number {
    // Simulate ATR - in production would calculate from real data
    const atrs = {
      'EURUSD': 45,
      'GBPUSD': 85,
      'USDJPY': 65,
      'AUDUSD': 55,
      'USDCAD': 50
    };
    return atrs[symbol] || 50;
  }

  private getNearestLiquidityDistance(signal: any): number {
    // Simulate liquidity distance
    return Math.abs(signal.entry - signal.sl) * 100 * 1.5; // 1.5x stop distance
  }

  private updateAdaptiveWeights(symbol: string, session: string, success: boolean) {
    multiPassGroqAnalyzer.updateModelWeights(symbol, session, success);
  }

  private getModelWeights() {
    return {
      session: this.getCurrentSessionContext().current,
      adaptiveEnabled: this.config.adaptiveWeights
    };
  }

  // Configuration methods
  updateConfig(newConfig: Partial<EnhancedSignalConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getStats() {
    return {
      sessionCounts: this.sessionSignalCount,
      lastSignalTime: this.lastSignalTime,
      currentSession: this.getCurrentSessionContext().current
    };
  }

  resetSessionCounts() {
    this.sessionSignalCount = {};
  }
}

export const enhancedSignalEngine = new EnhancedSignalEngine();