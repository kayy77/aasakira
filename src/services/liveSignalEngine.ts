interface LivePriceData {
  symbol: string;
  bid: number;
  ask: number;
  mid: number;
  timestamp: number;
  source: string;
  age: number;
}

interface FilterResult {
  name: string;
  pass: boolean;
  confidence: number;
  details: any;
}

interface SignalCandidate {
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  score: number;
  filters: FilterResult[];
  priceTimestamp: number;
  priceAge: number;
  idempotencyKey: string;
  engineVersion: string;
  groqAnalysis?: {
    reasoning: string;
    confidence: number;
    grade: string;
    timestamp: number;
  };
}

class LiveSignalEngine {
  private readonly MAX_PRICE_AGE_MS = 500;
  private readonly FILTER_THRESHOLD = 3;
  private readonly ENGINE_VERSION = '1.0.0';
  private readonly SUPPORTED_SYMBOLS = ['XAUUSD', 'US30', 'NAS100'];
  
  private recentSignals = new Map<string, number>();
  private lastTicks = new Map<string, LivePriceData>();
  private groqService: any = null;

  constructor() {
    // Lazy load Groq service to avoid circular dependencies
    import('@/services/groqSignalJudge').then(module => {
      this.groqService = module.groqSignalJudge;
    });
  }

  async fetchLivePrice(symbol: string): Promise<LivePriceData | null> {
    try {
      console.log(`🔄 Fetching live price for ${symbol}...`);
      
      // Try Polygon first
      const polygonData = await this.fetchFromPolygon(symbol);
      if (polygonData) return polygonData;
      
      // Fallback to Twelve Data
      const twelveData = await this.fetchFromTwelveData(symbol);
      if (twelveData) return twelveData;
      
      console.warn(`❌ No live price data available for ${symbol}`);
      return null;
    } catch (error) {
      console.error(`Error fetching live price for ${symbol}:`, error);
      return null;
    }
  }

  private async fetchFromPolygon(symbol: string): Promise<LivePriceData | null> {
    try {
      // Convert symbol format for Polygon
      const polygonSymbol = symbol === 'XAUUSD' ? 'C:XAUUSD' : 'I:US30';
      
      const response = await fetch(
        `https://api.polygon.io/v2/last/trade/${polygonSymbol}?apikey=${process.env.POLYGON_API_KEY}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const now = Date.now();
      
      if (data.results) {
        const price = data.results.p || data.results.price;
        return {
          symbol,
          bid: price - 0.01, // Approximate spread
          ask: price + 0.01,
          mid: price,
          timestamp: data.results.t || now,
          source: 'polygon',
          age: now - (data.results.t || now)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Polygon API error:', error);
      return null;
    }
  }

  private async fetchFromTwelveData(symbol: string): Promise<LivePriceData | null> {
    try {
      const response = await fetch(
        `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.TWELVE_DATA_API_KEY}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const now = Date.now();
      
      if (data.price) {
        const price = parseFloat(data.price);
        return {
          symbol,
          bid: price - 0.01,
          ask: price + 0.01,
          mid: price,
          timestamp: now,
          source: 'twelvedata',
          age: 0
        };
      }
      
      return null;
    } catch (error) {
      console.error('Twelve Data API error:', error);
      return null;
    }
  }

  private createIdempotencyKey(
    symbol: string, 
    timestamp: number, 
    price: number, 
    direction: string
  ): string {
    const timestampFloor = Math.floor(timestamp / 1000);
    const roundedPrice = Math.round(price * 100000) / 100000;
    const input = `${symbol}|${timestampFloor}|${roundedPrice}|${direction}|${this.ENGINE_VERSION}`;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private async runFilters(priceData: LivePriceData): Promise<FilterResult[]> {
    const filters: FilterResult[] = [];
    
    // 1. SMC Structure Filter
    const smcResult = await this.checkSMCStructure(priceData);
    filters.push({
      name: 'SMC_STRUCTURE',
      pass: smcResult.pass,
      confidence: smcResult.confidence,
      details: smcResult.details
    });

    // 2. Price Action Filter
    const priceActionResult = this.checkPriceAction(priceData);
    filters.push({
      name: 'PRICE_ACTION',
      pass: priceActionResult.pass,
      confidence: priceActionResult.confidence,
      details: priceActionResult.details
    });

    // 3. Volume Spike Filter
    const volumeResult = this.checkVolumeSpike(priceData);
    filters.push({
      name: 'VOLUME_SPIKE',
      pass: volumeResult.pass,
      confidence: volumeResult.confidence,
      details: volumeResult.details
    });

    // 4. Session Timing Filter
    const sessionResult = this.checkSessionTiming(priceData);
    filters.push({
      name: 'SESSION_TIMING',
      pass: sessionResult.pass,
      confidence: sessionResult.confidence,
      details: sessionResult.details
    });

    // 5. Fair Value Gap Filter
    const fvgResult = this.checkFairValueGap(priceData);
    filters.push({
      name: 'FAIR_VALUE_GAP',
      pass: fvgResult.pass,
      confidence: fvgResult.confidence,
      details: fvgResult.details
    });

    // 6. Momentum Filter
    const momentumResult = this.checkMomentum(priceData);
    filters.push({
      name: 'MOMENTUM',
      pass: momentumResult.pass,
      confidence: momentumResult.confidence,
      details: momentumResult.details
    });

    return filters;
  }

  private async checkSMCStructure(priceData: LivePriceData) {
    // Simplified SMC structure check
    const lastTick = this.lastTicks.get(priceData.symbol);
    
    if (!lastTick) {
      return { pass: false, confidence: 0, details: 'No previous tick data' };
    }

    const priceChange = priceData.mid - lastTick.mid;
    const changePercent = Math.abs(priceChange / lastTick.mid) * 100;

    // Strong directional move indicates structure break
    const pass = changePercent > 0.05; // 0.05% move
    const confidence = Math.min(changePercent / 0.2, 1); // Max confidence at 0.2% move

    return {
      pass,
      confidence,
      details: {
        priceChange,
        changePercent,
        direction: priceChange > 0 ? 'bullish' : 'bearish'
      }
    };
  }

  private checkPriceAction(priceData: LivePriceData) {
    // Check spread and price action quality
    const spread = priceData.ask - priceData.bid;
    const spreadPercent = (spread / priceData.mid) * 100;
    
    // Good price action = tight spread
    const pass = spreadPercent < 0.1; // Less than 0.1% spread
    const confidence = Math.max(0, 1 - spreadPercent / 0.1);

    return {
      pass,
      confidence,
      details: { spread, spreadPercent }
    };
  }

  private checkVolumeSpike(priceData: LivePriceData) {
    // Simplified volume check based on price volatility
    const now = new Date();
    const hour = now.getUTCHours();
    
    // High volume during major sessions
    const isHighVolumeSession = (hour >= 8 && hour <= 16) || (hour >= 13 && hour <= 21);
    const pass = isHighVolumeSession;
    const confidence = isHighVolumeSession ? 0.8 : 0.3;

    return {
      pass,
      confidence,
      details: { hour, isHighVolumeSession }
    };
  }

  private checkSessionTiming(priceData: LivePriceData) {
    const now = new Date();
    const hour = now.getUTCHours();
    
    // London (8-16 UTC) and New York (13-21 UTC) sessions
    const isLondonSession = hour >= 8 && hour <= 16;
    const isNewYorkSession = hour >= 13 && hour <= 21;
    const isOverlapSession = hour >= 13 && hour <= 16; // Overlap
    
    const pass = isLondonSession || isNewYorkSession;
    const confidence = isOverlapSession ? 0.9 : (pass ? 0.7 : 0.2);

    return {
      pass,
      confidence,
      details: { hour, isLondonSession, isNewYorkSession, isOverlapSession }
    };
  }

  private checkFairValueGap(priceData: LivePriceData) {
    // Simplified FVG check - look for price gaps
    const lastTick = this.lastTicks.get(priceData.symbol);
    
    if (!lastTick) {
      return { pass: false, confidence: 0, details: 'No previous data' };
    }

    const gap = Math.abs(priceData.mid - lastTick.mid);
    const gapPercent = (gap / lastTick.mid) * 100;
    
    // Significant gap indicates potential FVG
    const pass = gapPercent > 0.02; // 0.02% gap
    const confidence = Math.min(gapPercent / 0.1, 1);

    return {
      pass,
      confidence,
      details: { gap, gapPercent }
    };
  }

  private checkMomentum(priceData: LivePriceData) {
    // Simple momentum based on price age and freshness
    const pass = priceData.age < this.MAX_PRICE_AGE_MS;
    const confidence = Math.max(0, 1 - priceData.age / this.MAX_PRICE_AGE_MS);

    return {
      pass,
      confidence,
      details: { age: priceData.age, freshness: confidence }
    };
  }

  private calculateStopLossAndTakeProfit(
    entryPrice: number, 
    direction: 'BUY' | 'SELL',
    symbol: string
  ) {
    // Symbol-specific risk parameters
    const riskPercent = symbol === 'XAUUSD' ? 0.005 : 0.01; // 0.5% for gold, 1% for indices
    const rewardRatio = 2; // 1:2 risk reward

    const risk = entryPrice * riskPercent;
    
    if (direction === 'BUY') {
      return {
        stopLoss: entryPrice - risk,
        takeProfit: entryPrice + (risk * rewardRatio)
      };
    } else {
      return {
        stopLoss: entryPrice + risk,
        takeProfit: entryPrice - (risk * rewardRatio)
      };
    }
  }

  async generateSignal(symbol: string): Promise<SignalCandidate | null> {
    if (!this.SUPPORTED_SYMBOLS.includes(symbol)) {
      console.warn(`❌ Symbol ${symbol} not supported`);
      return null;
    }

    // Get live price
    const priceData = await this.fetchLivePrice(symbol);
    if (!priceData) {
      console.warn(`❌ No price data for ${symbol}`);
      return null;
    }

    // Check price freshness
    if (priceData.age > this.MAX_PRICE_AGE_MS) {
      console.warn(`❌ Price too stale for ${symbol}: ${priceData.age}ms`);
      return null;
    }

    // Update last tick
    this.lastTicks.set(symbol, priceData);

    // Run filters
    const filters = await this.runFilters(priceData);
    const passedFilters = filters.filter(f => f.pass).length;

    if (passedFilters < this.FILTER_THRESHOLD) {
      console.log(`⚠️ Signal rejected: Only ${passedFilters}/${filters.length} filters passed`);
      return null;
    }

    // Determine direction based on filter analysis
    const direction = this.determineDirection(filters);
    
    // Create idempotency key
    const idempotencyKey = this.createIdempotencyKey(
      symbol, 
      priceData.timestamp, 
      priceData.mid, 
      direction
    );

    // Check for recent duplicate
    const recentSignalTime = this.recentSignals.get(idempotencyKey);
    if (recentSignalTime && (Date.now() - recentSignalTime) < 3600000) { // 1 hour
      console.log(`⚠️ Duplicate signal prevented: ${idempotencyKey}`);
      return null;
    }

    // Calculate stop loss and take profit
    const { stopLoss, takeProfit } = this.calculateStopLossAndTakeProfit(
      priceData.mid, 
      direction, 
      symbol
    );

    // Calculate score
    const score = Math.round(
      filters.reduce((sum, f) => sum + (f.pass ? f.confidence * 100 : 0), 0) / filters.length
    );

    // Record this signal to prevent duplicates
    this.recentSignals.set(idempotencyKey, Date.now());

    const signal: SignalCandidate = {
      symbol,
      direction,
      entryPrice: priceData.mid,
      stopLoss,
      takeProfit,
      score,
      filters,
      priceTimestamp: priceData.timestamp,
      priceAge: priceData.age,
      idempotencyKey,
      engineVersion: this.ENGINE_VERSION
    };

    // Run Groq AI validation and analysis
    if (this.groqService) {
      try {
        console.log('🧠 Running Groq AI validation...');
        const groqValidation = await this.groqService.evaluateSignal({
          symbol,
          direction,
          entry: priceData.mid,
          stop: stopLoss,
          target: takeProfit,
          frameworks: filters.filter(f => f.pass).map(f => f.name),
          session: this.getCurrentSession(),
          confluence: passedFilters,
          confidence: score
        });

        // Add Groq analysis to signal
        signal.groqAnalysis = {
          reasoning: groqValidation.reason,
          confidence: groqValidation.confidence_adjustment || 0,
          grade: groqValidation.institutional_grade,
          timestamp: Date.now()
        };

        // Adjust confidence based on Groq feedback
        if (groqValidation.confidence_adjustment) {
          signal.score = Math.min(95, Math.max(60, score + groqValidation.confidence_adjustment));
        }

        console.log(`🏆 Groq Analysis: ${groqValidation.institutional_grade} | ${groqValidation.reason}`);

        // Reject if Groq says NO
        if (groqValidation.decision === 'reject' || ['C', 'FAIL'].includes(groqValidation.institutional_grade)) {
          console.log(`🚫 Signal rejected by Groq: ${groqValidation.reason}`);
          return null;
        }
      } catch (error) {
        console.warn('⚠️ Groq validation failed, proceeding without AI analysis:', error);
      }
    }

    console.log(`✅ Signal generated: ${symbol} ${direction} @ ${priceData.mid} (Score: ${signal.score})`);
    return signal;
  }

  private determineDirection(filters: FilterResult[]): 'BUY' | 'SELL' {
    // Analyze filter details to determine direction
    const smcFilter = filters.find(f => f.name === 'SMC_STRUCTURE');
    
    if (smcFilter?.details?.direction === 'bullish') {
      return 'BUY';
    } else if (smcFilter?.details?.direction === 'bearish') {
      return 'SELL';
    }
    
    // Default based on overall filter confidence
    const avgConfidence = filters.reduce((sum, f) => sum + f.confidence, 0) / filters.length;
    return avgConfidence > 0.6 ? 'BUY' : 'SELL';
  }

  private getCurrentSession(): string {
    const hour = new Date().getUTCHours();
    if (hour >= 8 && hour <= 16) return 'London';
    if (hour >= 13 && hour <= 21) return 'New York';
    if (hour >= 0 && hour <= 8) return 'Asian';
    return 'Off-hours';
  }

  // Clean up old records
  cleanup() {
    const now = Date.now();
    const oneHour = 3600000;
    
    // Clean recent signals
    for (const [key, timestamp] of this.recentSignals.entries()) {
      if (now - timestamp > oneHour) {
        this.recentSignals.delete(key);
      }
    }
    
    // Clean old ticks (keep only last hour)
    for (const [symbol, tick] of this.lastTicks.entries()) {
      if (now - tick.timestamp > oneHour) {
        this.lastTicks.delete(symbol);
      }
    }
  }
}

export const liveSignalEngine = new LiveSignalEngine();
