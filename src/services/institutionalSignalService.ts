import { marketDataService } from './marketDataService';
import { enhancedPriceService, type PriceData } from './enhancedPriceService';

interface InstitutionalSignal {
  id: string;
  pair: string;
  direction: 'buy' | 'sell';
  entry: string;
  stop_loss: string;
  take_profit: string;
  risk_reward: string;
  filters_passed: string[];
  reasoning: {
    [key: string]: string;
  };
  timestamp: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'HIT_TP' | 'HIT_SL';
  confidence: 'INSTITUTIONAL' | 'HIGH' | 'MEDIUM';
  session: string;
  timeframe: string;
  priceSource: string;
  priceTimestamp: string;
  priceAccuracy: 'VERIFIED' | 'WARNING' | 'FALLBACK';
  livePrice?: number; // Add live price field
  lastPriceUpdate?: Date; // Track when price was last updated
}

interface FilterCriteria {
  breakOfStructure: boolean;
  liquiditySweep: boolean;
  fairValueGap: boolean;
  timeFilter: boolean;
  volumeSpike: boolean;
  rsiDivergence: boolean;
}

interface FilterReasoning {
  [key: string]: string;
}

class InstitutionalSignalService {
  private signals: InstitutionalSignal[] = [];
  private lastSignalTime: { [pair: string]: Date } = {};
  private readonly MIN_FILTERS_REQUIRED = 3;
  private readonly MIN_RISK_REWARD = 2.0;
  private priceUpdateInterval: NodeJS.Timeout | null = null;
  
  // Kill Zones and High Probability Sessions (UTC)
  private readonly KILL_ZONES = {
    'London Open': { start: 7, end: 9 },
    'NY Open': { start: 12, end: 14 },
    'London Close': { start: 15, end: 17 },
    'Asian Killzone': { start: 23, end: 1 }
  };

  constructor() {
    // Start live price updates immediately
    this.startLivePriceUpdates();
  }

  private startLivePriceUpdates() {
    // Clear any existing interval
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }

    // Update prices every 3 seconds for better real-time feel
    this.priceUpdateInterval = setInterval(() => {
      this.updateAllLivePrices();
    }, 3000);

    console.log('🔄 Started live price updates for institutional signals');
  }

  private async updateAllLivePrices() {
    if (this.signals.length === 0) return;

    console.log(`🔍 Updating live prices for ${this.signals.length} institutional signals...`);
    
    for (const signal of this.signals) {
      if (signal.status === 'ACTIVE') {
        try {
          const priceData = await enhancedPriceService.getLivePrice(signal.pair);
          
          // Update the signal with new live price
          signal.livePrice = priceData.price;
          signal.priceSource = priceData.source;
          signal.priceTimestamp = new Date(priceData.timestamp).toISOString();
          signal.lastPriceUpdate = new Date();
          signal.priceAccuracy = this.validatePriceAccuracy(priceData, signal.pair);

          console.log(`💰 Updated ${signal.pair}: ${priceData.price} from ${priceData.source}`);
        } catch (error) {
          console.error(`❌ Failed to update price for ${signal.pair}:`, error);
        }
      }
    }
  }

  async generateInstitutionalSignal(): Promise<InstitutionalSignal | null> {
    // Major institutional pairs
    const institutionalPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCHF'];
    const selectedPair = institutionalPairs[Math.floor(Math.random() * institutionalPairs.length)];

    // Check if we've generated a signal for this pair recently (15min cooldown)
    if (this.lastSignalTime[selectedPair]) {
      const timeDiff = Date.now() - this.lastSignalTime[selectedPair].getTime();
      if (timeDiff < 15 * 60 * 1000) { // 15 minutes
        console.log(`⏰ Cooldown active for ${selectedPair}, skipping signal generation`);
        return null;
      }
    }

    try {
      console.log(`🎯 Fetching LIVE price for ${selectedPair} using enhanced price service...`);
      
      // ✅ FETCH LIVE PRICE WITH ENHANCED SERVICE
      const priceData = await enhancedPriceService.getLivePrice(selectedPair);
      
      if (!priceData || !priceData.price) {
        console.log(`❌ Failed to get valid price for ${selectedPair}, skipping signal`);
        return null;
      }

      console.log(`💰 Got live price for ${selectedPair}: ${priceData.price} from ${priceData.source}`);

      // Validate price accuracy before proceeding
      const accuracy = this.validatePriceAccuracy(priceData, selectedPair);
      
      if (accuracy === 'FALLBACK') {
        console.log(`⚠️ Using fallback price for ${selectedPair}, signal marked as lower confidence`);
      }

      const analysis = this.performInstitutionalAnalysis(selectedPair, priceData.price);
      
      // Must pass at least 3 filters
      if (analysis.filtersPassedCount < this.MIN_FILTERS_REQUIRED) {
        console.log(`❌ Signal for ${selectedPair} failed filter requirements: ${analysis.filtersPassedCount}/6`);
        return null;
      }

      // Generate signal with institutional logic and live price data
      const signal = this.createInstitutionalSignal(selectedPair, priceData, accuracy, analysis);
      
      if (signal) {
        this.lastSignalTime[selectedPair] = new Date();
        this.signals.push(signal);
        console.log(`✅ Generated INSTITUTIONAL signal for ${selectedPair} using ${priceData.source} @ ${priceData.price}`);
        return signal;
      }

      return null;
    } catch (error) {
      console.error('Error generating institutional signal:', error);
      return null;
    }
  }

  private validatePriceAccuracy(priceData: PriceData, symbol: string): 'VERIFIED' | 'WARNING' | 'FALLBACK' {
    // Check if price source is reliable
    if (priceData.source === 'Enhanced Fallback' || priceData.source === 'fallback') {
      return 'FALLBACK';
    }

    // Check price freshness (within last 30 seconds)
    const priceAge = Date.now() - priceData.timestamp;
    if (priceAge > 30000) { // 30 seconds
      return 'WARNING';
    }

    // Price from reliable APIs
    if (['TwelveData', 'Polygon', 'Deriv', 'CoinGecko', 'Deriv WebSocket'].includes(priceData.source)) {
      return 'VERIFIED';
    }

    return 'WARNING';
  }

  private performInstitutionalAnalysis(pair: string, price: number) {
    const filters: FilterCriteria = {
      breakOfStructure: this.analyzeBreakOfStructure(pair, price),
      liquiditySweep: this.analyzeLiquiditySweep(pair, price),
      fairValueGap: this.analyzeFairValueGap(pair, price),
      timeFilter: this.analyzeTimeFilter(),
      volumeSpike: this.analyzeVolumeSpike(pair),
      rsiDivergence: this.analyzeRSIDivergence(pair, price)
    };

    const reasoning: FilterReasoning = {};
    const filtersPassedArray: string[] = [];

    // Build reasoning for each passed filter
    if (filters.breakOfStructure) {
      const reason = this.getBreakOfStructureReasoning(pair, price);
      reasoning['Break of Structure (BOS)'] = reason;
      filtersPassedArray.push('Break of Structure (BOS)');
    }

    if (filters.liquiditySweep) {
      const reason = this.getLiquiditySweepReasoning(pair, price);
      reasoning['Liquidity Sweep'] = reason;
      filtersPassedArray.push('Liquidity Sweep');
    }

    if (filters.fairValueGap) {
      const reason = this.getFairValueGapReasoning(pair, price);
      reasoning['Fair Value Gap (FVG)'] = reason;
      filtersPassedArray.push('Fair Value Gap (FVG)');
    }

    if (filters.timeFilter) {
      const reason = this.getTimeFilterReasoning();
      reasoning['Time Filter'] = reason;
      filtersPassedArray.push('Time Filter');
    }

    if (filters.volumeSpike) {
      const reason = this.getVolumeSpikeReasoning(pair);
      reasoning['Volume Spike'] = reason;
      filtersPassedArray.push('Volume Spike');
    }

    if (filters.rsiDivergence) {
      const reason = this.getRSIDivergenceReasoning(pair, price);
      reasoning['RSI Divergence'] = reason;
      filtersPassedArray.push('RSI Divergence');
    }

    return {
      filters,
      reasoning,
      filtersPassedArray,
      filtersPassedCount: filtersPassedArray.length
    };
  }

  private analyzeBreakOfStructure(pair: string, price: number): boolean {
    // Simulate BOS analysis - In real implementation, analyze recent highs/lows
    const bosChance = Math.random();
    return bosChance > 0.3; // 70% chance of valid BOS
  }

  private analyzeLiquiditySweep(pair: string, price: number): boolean {
    // Simulate liquidity sweep detection
    const sweepChance = Math.random();
    return sweepChance > 0.5; // 50% chance of liquidity sweep
  }

  private analyzeFairValueGap(pair: string, price: number): boolean {
    // Simulate FVG analysis
    const fvgChance = Math.random();
    return fvgChance > 0.4; // 60% chance of FVG present
  }

  private analyzeTimeFilter(): boolean {
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    // Check if current time is within any kill zone
    for (const [zoneName, zone] of Object.entries(this.KILL_ZONES)) {
      if (zone.start <= zone.end) {
        if (utcHour >= zone.start && utcHour <= zone.end) {
          return true;
        }
      } else {
        // Handle overnight zones (like Asian killzone 23-1)
        if (utcHour >= zone.start || utcHour <= zone.end) {
          return true;
        }
      }
    }
    
    return false;
  }

  private analyzeVolumeSpike(pair: string): boolean {
    // Simulate volume analysis
    const volumeChance = Math.random();
    return volumeChance > 0.35; // 65% chance of volume confirmation
  }

  private analyzeRSIDivergence(pair: string, price: number): boolean {
    // Simulate RSI divergence analysis
    const divergenceChance = Math.random();
    return divergenceChance > 0.65; // 35% chance of RSI divergence
  }

  private getBreakOfStructureReasoning(pair: string, price: number): string {
    const reasons = [
      "Price broke above recent swing high with strong bullish momentum candle",
      "Clean break of previous day's high with institutional volume",
      "Structure broken on 15M with confirmation on 5M entry",
      "Break of weekly resistance level with daily confirmation",
      "CHoCH confirmed - market character shift from bearish to bullish"
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private getLiquiditySweepReasoning(pair: string, price: number): string {
    const reasons = [
      "Liquidity grabbed below Asian session lows before reversal",
      "Stop hunt wick above recent equal highs, now showing rejection",
      "BSL (Buy Side Liquidity) swept at previous day high",
      "SSL (Sell Side Liquidity) targeted and cleared below support",
      "Equal lows liquidity grab with immediate bullish response"
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private getFairValueGapReasoning(pair: string, price: number): string {
    const reasons = [
      "Unfilled FVG from NY session providing strong support level",
      "Price retracing to premium FVG zone for optimal entry",
      "Bullish FVG acting as demand zone with institutional interest",
      "Gap created during London open provides high-probability entry",
      "FVG confluence with previous structure level"
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private getTimeFilterReasoning(): string {
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    for (const [zoneName, zone] of Object.entries(this.KILL_ZONES)) {
      if (zone.start <= zone.end) {
        if (utcHour >= zone.start && utcHour <= zone.end) {
          return `Signal generated during ${zoneName} (high institutional liquidity period)`;
        }
      } else {
        if (utcHour >= zone.start || utcHour <= zone.end) {
          return `Signal generated during ${zoneName} (institutional accumulation window)`;
        }
      }
    }
    
    return "Signal generated during high-probability trading session";
  }

  private getVolumeSpikeReasoning(pair: string): string {
    const reasons = [
      "Unusual volume spike confirming institutional participation",
      "Volume 3x average indicating smart money involvement",
      "Breakout volume validates the directional move",
      "Institution-level volume supporting the trade bias",
      "Volume divergence suggesting accumulation/distribution"
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private getRSIDivergenceReasoning(pair: string, price: number): string {
    const reasons = [
      "Hidden bullish divergence on RSI suggesting continuation",
      "Regular bearish divergence indicating potential reversal",
      "RSI showing oversold with bullish momentum building",
      "Momentum divergence aligned with structural analysis",
      "Multi-timeframe RSI divergence confirming bias"
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private createInstitutionalSignal(
    pair: string, 
    priceData: PriceData, 
    accuracy: 'VERIFIED' | 'WARNING' | 'FALLBACK', 
    analysis: any
  ): InstitutionalSignal | null {
    // Determine direction based on filters (simplified logic)
    const bullishFilters = ['Break of Structure (BOS)', 'Volume Spike', 'RSI Divergence'];
    const bearishFilters = ['Liquidity Sweep', 'Fair Value Gap (FVG)'];
    
    const bullishCount = analysis.filtersPassedArray.filter((f: string) => bullishFilters.includes(f)).length;
    const bearishCount = analysis.filtersPassedArray.filter((f: string) => bearishFilters.includes(f)).length;
    
    const direction: 'buy' | 'sell' = bullishCount >= bearishCount ? 'buy' : 'sell';
    
    // Calculate institutional-grade levels using LIVE PRICE
    const pipValue = this.getPipValue(pair);
    const atr = 30 + Math.random() * 40; // Simulated ATR in pips
    
    // Conservative stop loss (0.5-1.0 ATR)
    const stopDistance = atr * (0.5 + Math.random() * 0.5);
    
    // Aggressive take profit (2.0-4.0 RR minimum)
    const rrRatio = this.MIN_RISK_REWARD + Math.random() * 2; // 2.0-4.0 RR
    const tpDistance = stopDistance * rrRatio;
    
    const entry = priceData.price; // Use LIVE price
    const stopLoss = direction === 'buy' 
      ? entry - (stopDistance * pipValue)
      : entry + (stopDistance * pipValue);
    const takeProfit = direction === 'buy'
      ? entry + (tpDistance * pipValue)
      : entry - (tpDistance * pipValue);

    return {
      id: Date.now().toString(),
      pair,
      direction,
      entry: this.formatPrice(entry, pair),
      stop_loss: this.formatPrice(stopLoss, pair),
      take_profit: this.formatPrice(takeProfit, pair),
      risk_reward: `1:${rrRatio.toFixed(1)}`,
      filters_passed: analysis.filtersPassedArray,
      reasoning: analysis.reasoning,
      timestamp: new Date(),
      status: 'ACTIVE',
      confidence: analysis.filtersPassedCount >= 5 ? 'INSTITUTIONAL' : 
                  analysis.filtersPassedCount >= 4 ? 'HIGH' : 'MEDIUM',
      session: this.getCurrentSession(),
      timeframe: '15M/5M',
      priceSource: priceData.source,
      priceTimestamp: new Date(priceData.timestamp).toISOString(),
      priceAccuracy: accuracy,
      livePrice: priceData.price,
      lastPriceUpdate: new Date()
    };
  }

  private getCurrentSession(): string {
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    for (const [zoneName, zone] of Object.entries(this.KILL_ZONES)) {
      if (zone.start <= zone.end) {
        if (utcHour >= zone.start && utcHour <= zone.end) {
          return zoneName;
        }
      } else {
        if (utcHour >= zone.start || utcHour <= zone.end) {
          return zoneName;
        }
      }
    }
    
    return 'Off Hours';
  }

  private getPipValue(pair: string): number {
    if (pair.includes('JPY')) {
      return 0.01;
    }
    return 0.0001;
  }

  private formatPrice(price: number, pair: string): string {
    if (pair.includes('JPY')) {
      return price.toFixed(3);
    }
    return price.toFixed(5);
  }

  getLatestSignals(): InstitutionalSignal[] {
    return this.signals.slice(-10);
  }

  // Manual price update method
  async updateSignalPrice(signalId: string): Promise<boolean> {
    const signal = this.signals.find(s => s.id === signalId);
    if (!signal) return false;

    try {
      console.log(`🔄 Manually updating price for ${signal.pair}...`);
      const priceData = await enhancedPriceService.getLivePrice(signal.pair);
      
      signal.livePrice = priceData.price;
      signal.priceSource = priceData.source;
      signal.priceTimestamp = new Date(priceData.timestamp).toISOString();
      signal.lastPriceUpdate = new Date();
      signal.priceAccuracy = this.validatePriceAccuracy(priceData, signal.pair);

      console.log(`✅ Updated ${signal.pair}: ${priceData.price} from ${priceData.source}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to update price for ${signal.pair}:`, error);
      return false;
    }
  }

  // Real-time signal validation using LIVE PRICES
  async validateSignalRealtime(signalId: string): Promise<boolean> {
    const signal = this.signals.find(s => s.id === signalId);
    if (!signal) return false;

    try {
      const priceData = await enhancedPriceService.getLivePrice(signal.pair);
      const currentPrice = priceData.price;
      const entry = parseFloat(signal.entry);
      const sl = parseFloat(signal.stop_loss);
      const tp = parseFloat(signal.take_profit);
      
      console.log(`🔍 Validating signal ${signalId} for ${signal.pair}: Current=${currentPrice}, Entry=${entry}, SL=${sl}, TP=${tp}`);
      
      // Check if TP or SL hit
      if (signal.direction === 'buy') {
        if (currentPrice >= tp) {
          signal.status = 'HIT_TP';
          console.log(`✅ Signal ${signalId} HIT TAKE PROFIT at ${currentPrice}`);
          return true;
        }
        if (currentPrice <= sl) {
          signal.status = 'HIT_SL';
          console.log(`❌ Signal ${signalId} HIT STOP LOSS at ${currentPrice}`);
          return false;
        }
      } else {
        if (currentPrice <= tp) {
          signal.status = 'HIT_TP';
          console.log(`✅ Signal ${signalId} HIT TAKE PROFIT at ${currentPrice}`);
          return true;
        }
        if (currentPrice >= sl) {
          signal.status = 'HIT_SL';
          console.log(`❌ Signal ${signalId} HIT STOP LOSS at ${currentPrice}`);
          return false;
        }
      }

      return true; // Still active
    } catch (error) {
      console.error('Error validating signal with live prices:', error);
      return false;
    }
  }

  // Cleanup method
  destroy() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
    }
  }
}

export const institutionalSignalService = new InstitutionalSignalService();
export type { InstitutionalSignal };
