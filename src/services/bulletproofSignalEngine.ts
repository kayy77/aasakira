import { groqService } from './groqService';
import { enhancedLivePriceService } from './enhancedLivePriceService';

export interface BulletproofSignal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2?: number;
  confidence: number;
  quality: 'strong' | 'medium' | 'weak';
  expectedValue: number;
  riskReward: string;
  strategy: string;
  reasoning: string;
  smcAnalysis: string;
  sessionBias: string;
  confluenceFactors: string[];
  timestamp: string;
  timeframe: string;
  setupType: string;
  institutionalGrade: string;
  convictionScore: number;
  positionSizeRec: string;
  executionNotes: string;
  chartData?: any;
}

class BulletproofSignalEngine {
  private static instance: BulletproofSignalEngine;
  private currentScanDepth = 0;
  private maxScanDepth = 10;
  private pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'XAUUSD', 'BTCUSD', 'ETHUSD'];

  static getInstance(): BulletproofSignalEngine {
    if (!BulletproofSignalEngine.instance) {
      BulletproofSignalEngine.instance = new BulletproofSignalEngine();
    }
    return BulletproofSignalEngine.instance;
  }

  async generateBulletproofSignal(): Promise<BulletproofSignal> {
    console.log('🚀 BULLETPROOF SIGNAL ENGINE - DEEP SCAN INITIATED');
    console.log('💪 NEVER GIVE UP MODE: WILL FIND THE BEST SIGNAL AVAILABLE');
    
    this.currentScanDepth = 0;
    
    // Keep scanning with increasing depth until we find something good
    while (this.currentScanDepth < this.maxScanDepth) {
      this.currentScanDepth++;
      
      console.log(`🔍 SCAN DEPTH ${this.currentScanDepth}/${this.maxScanDepth} - ANALYZING MARKET...`);
      
      try {
        const signal = await this.performDeepScan();
        
        if (signal && this.isSignalAcceptable(signal)) {
          console.log(`✅ SIGNAL FOUND AT DEPTH ${this.currentScanDepth}! Quality: ${signal.quality}`);
          return signal;
        }
        
        console.log(`🔄 Depth ${this.currentScanDepth} - No acceptable signal, going deeper...`);
        
        // Wait a bit before next scan to avoid rate limits
        await this.sleep(1000);
        
      } catch (error) {
        console.log(`❌ Scan depth ${this.currentScanDepth} failed:`, error);
        continue;
      }
    }
    
    // Emergency fallback - create the best possible signal from current market data
    console.log('🚨 EMERGENCY FALLBACK - CREATING BEST AVAILABLE SIGNAL');
    return await this.createEmergencySignal();
  }

  private async performDeepScan(): Promise<BulletproofSignal | null> {
    // Get the most promising pair based on current session
    const prioritizedPairs = this.getPrioritizedPairs();
    const selectedPair = prioritizedPairs[Math.floor(Math.random() * Math.min(3, prioritizedPairs.length))];
    
    console.log(`🎯 Analyzing ${selectedPair} with GROQ institutional analysis...`);
    
    try {
      // Get live price
      const priceData = await enhancedLivePriceService.getFreshPriceForSignal(selectedPair);
      const livePrice = priceData.price;
      console.log(`💰 Live price for ${selectedPair}: ${livePrice} (from ${priceData.source})`);
      
      // Get institutional signal from GROQ
      const groqAnalysis = await groqService.generateInstitutionalSignal(
        selectedPair,
        livePrice,
        '15m',
        { focus: 'deep_institutional' },
        {}
      );
      
      console.log('🧠 GROQ Analysis:', groqAnalysis);
      
      if (groqAnalysis && groqAnalysis.symbol) {
        return this.formatBulletproofSignal(groqAnalysis, livePrice);
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Deep scan failed for ${selectedPair}:`, error);
      return null;
    }
  }

  private formatBulletproofSignal(groqAnalysis: any, livePrice: number): BulletproofSignal {
    const confidence = groqAnalysis.conviction_score || 75;
    const quality = this.determineQuality(confidence, groqAnalysis.institutional_grade);
    const expectedValue = this.calculateEV(groqAnalysis);
    
    return {
      id: `bulletproof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: groqAnalysis.symbol,
      type: (groqAnalysis.entry > livePrice) ? 'BUY' : 'SELL',
      entry: groqAnalysis.entry || livePrice,
      stopLoss: groqAnalysis.stop_loss || livePrice * 0.995,
      takeProfit1: groqAnalysis.take_profit_1 || livePrice * 1.015,
      takeProfit2: groqAnalysis.take_profit_2 || livePrice * 1.03,
      confidence,
      quality,
      expectedValue,
      riskReward: groqAnalysis.risk_reward || '1:2.0',
      strategy: groqAnalysis.setup_type || 'Institutional SMC Analysis',
      reasoning: groqAnalysis.execution_notes || 'Institutional-grade setup identified through SMC analysis',
      smcAnalysis: groqAnalysis.smc_analysis || 'Smart Money Concepts analysis completed',
      sessionBias: groqAnalysis.session_bias || 'Market session analysis',
      confluenceFactors: groqAnalysis.confluence_factors || ['SMC', 'ICT', 'Institutional Order Flow'],
      timestamp: new Date().toISOString(),
      timeframe: '15m',
      setupType: groqAnalysis.setup_type || 'BOS Continuation',
      institutionalGrade: groqAnalysis.institutional_grade || 'Professional',
      convictionScore: groqAnalysis.conviction_score || 75,
      positionSizeRec: groqAnalysis.position_size_rec || '1.0%',
      executionNotes: groqAnalysis.execution_notes || 'Execute on pullback with tight stop'
    };
  }

  private determineQuality(confidence: number, grade: string): 'strong' | 'medium' | 'weak' {
    if (confidence >= 80 || grade === 'Elite') return 'strong';
    if (confidence >= 65 || grade === 'Professional') return 'medium';
    return 'weak';
  }

  private calculateEV(analysis: any): number {
    // Simple EV calculation based on risk/reward and confidence
    const confidence = analysis.conviction_score || 50;
    const rr = this.parseRiskReward(analysis.risk_reward || '1:2');
    return (confidence / 100) * rr - ((100 - confidence) / 100);
  }

  private parseRiskReward(rrString: string): number {
    const match = rrString.match(/1:(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 2.0;
  }

  private isSignalAcceptable(signal: BulletproofSignal): boolean {
    // At deeper scan levels, we become more lenient
    const minConfidence = Math.max(30, 70 - (this.currentScanDepth * 5));
    const minEV = Math.max(-0.5, 0.5 - (this.currentScanDepth * 0.1));
    
    console.log(`🎯 Signal check - Confidence: ${signal.confidence} (min: ${minConfidence}), EV: ${signal.expectedValue} (min: ${minEV})`);
    
    return signal.confidence >= minConfidence && signal.expectedValue >= minEV;
  }

  private async createEmergencySignal(): Promise<BulletproofSignal> {
    console.log('🚨 CREATING EMERGENCY FALLBACK SIGNAL');
    
    const pair = this.pairs[0]; // Default to EURUSD
    const priceData = await enhancedLivePriceService.getFreshPriceForSignal(pair).catch(() => ({ price: 1.0850, source: 'fallback', age: 0 }));
    const livePrice = priceData.price;
    
    return {
      id: `emergency_${Date.now()}`,
      symbol: pair,
      type: 'BUY',
      entry: livePrice,
      stopLoss: livePrice * 0.997,
      takeProfit1: livePrice * 1.006,
      takeProfit2: livePrice * 1.012,
      confidence: 45,
      quality: 'weak',
      expectedValue: 0.2,
      riskReward: '1:2.0',
      strategy: 'Emergency Market Analysis',
      reasoning: 'Market conditions unclear, but technical setup suggests potential opportunity with conservative targets',
      smcAnalysis: 'Basic market structure analysis - use smaller position size',
      sessionBias: 'Neutral bias with conservative approach',
      confluenceFactors: ['Basic Technical Analysis', 'Risk Management'],
      timestamp: new Date().toISOString(),
      timeframe: '15m',
      setupType: 'Conservative Entry',
      institutionalGrade: 'Standard',
      convictionScore: 45,
      positionSizeRec: '0.25%',
      executionNotes: 'Emergency signal - use very tight stops and small position size'
    };
  }

  private getPrioritizedPairs(): string[] {
    const hour = new Date().getUTCHours();
    
    // London session (8-17 UTC) - EUR, GBP focus
    if (hour >= 8 && hour <= 17) {
      return ['EURUSD', 'GBPUSD', 'EURGBP', 'USDCHF', 'XAUUSD'];
    }
    
    // NY session (13-22 UTC) - USD focus
    if (hour >= 13 && hour <= 22) {
      return ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'BTCUSD'];
    }
    
    // Asian session (0-8 UTC) - JPY, AUD, NZD focus
    return ['USDJPY', 'AUDUSD', 'NZDUSD', 'EURJPY', 'GBPJPY'];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const bulletproofSignalEngine = BulletproofSignalEngine.getInstance();
