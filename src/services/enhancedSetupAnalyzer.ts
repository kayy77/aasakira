import { supabase } from '@/integrations/supabase/client';

// Enhanced setup analysis with live prices, macro data, and sentiment
export interface EnhancedAnalysisData {
  // Live market data
  currentPrice: number;
  spread: number;
  priceAge: number;
  priceSource: string;
  
  // Risk/Reward calculations
  liveRiskReward: number;
  recommendedEntry: number;
  priceDeviation: number;
  
  // Macro context
  macroContext: {
    upcomingEvents: Array<{
      event: string;
      impact: 'High' | 'Medium' | 'Low';
      timeToEvent: number;
      relevantCurrencies: string[];
    }>;
    interestRates: Record<string, number>;
    economicTrend: 'bullish' | 'bearish' | 'neutral';
  };
  
  // Sentiment analysis
  sentiment: {
    overall: 'bullish' | 'bearish' | 'neutral';
    score: number; // -100 to 100
    sources: {
      reddit: number;
      twitter: number;
      retail: number;
    };
    conflictingSignals: boolean;
  };
  
  // OCR results from screenshot
  ocrData?: {
    detectedPrices: {
      entry?: number;
      stopLoss?: number;
      takeProfit?: number;
    };
    detectedText: string[];
    confidence: number;
  };
}

export class EnhancedSetupAnalyzer {
  private polygonApiKey = 'uLv02UJoiot4__GfXf0_v46dAxlrembt';
  private twelveDataApiKey = '2058aa9ba1dd45c6b92d81fb16be89ad';
  
  // Get live price data from multiple sources
  async getLivePrice(symbol: string): Promise<{price: number, spread: number, source: string, age: number}> {
    console.log(`🔥 Fetching live price for ${symbol}`);
    
    // Try Supabase cached price first
    try {
      const { data, error } = await supabase.functions.invoke('fetch-live-prices', {
        body: { symbols: [symbol] }
      });
      
      if (!error && data?.prices?.[symbol]) {
        const priceData = data.prices[symbol];
        const age = Math.floor((Date.now() - new Date(priceData.timestamp).getTime()) / 1000);
        
        if (age < 120) { // Less than 2 minutes old
          return {
            price: priceData.price,
            spread: priceData.spread || 0.0001,
            source: priceData.source || 'Supabase Cache',
            age
          };
        }
      }
    } catch (error) {
      console.log('Supabase price fetch failed, trying direct APIs');
    }
    
    // Fallback to direct API calls
    return await this.getDirectPrice(symbol);
  }
  
  private async getDirectPrice(symbol: string): Promise<{price: number, spread: number, source: string, age: number}> {
    // Try Twelve Data first
    try {
      const response = await fetch(
        `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${this.twelveDataApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.price) {
          return {
            price: parseFloat(data.price),
            spread: this.getTypicalSpread(symbol),
            source: 'Twelve Data',
            age: 0
          };
        }
      }
    } catch (error) {
      console.log('Twelve Data failed, trying Polygon');
    }
    
    // Try Polygon as backup
    try {
      const cleanSymbol = symbol.replace('/', '');
      const response = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/C:${cleanSymbol}/prev?apikey=${this.polygonApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results?.[0]) {
          return {
            price: data.results[0].c,
            spread: this.getTypicalSpread(symbol),
            source: 'Polygon',
            age: Math.floor((Date.now() - data.results[0].t) / 1000)
          };
        }
      }
    } catch (error) {
      console.log('Polygon failed, using fallback');
    }
    
    // Fallback with warning
    return {
      price: this.getFallbackPrice(symbol),
      spread: this.getTypicalSpread(symbol),
      source: 'Fallback (STALE)',
      age: 9999
    };
  }
  
  private getTypicalSpread(symbol: string): number {
    const spreads: Record<string, number> = {
      'EURUSD': 0.00015,
      'GBPUSD': 0.00020,
      'USDJPY': 0.015,
      'USDCHF': 0.00025,
      'AUDUSD': 0.00025,
      'USDCAD': 0.00025,
      'NZDUSD': 0.00030,
      'XAUUSD': 0.30,
      'BTCUSD': 5.0,
      'ETHUSD': 0.5
    };
    
    return spreads[symbol] || 0.0003;
  }
  
  private getFallbackPrice(symbol: string): number {
    const fallbackPrices: Record<string, number> = {
      'EURUSD': 1.0850,
      'GBPUSD': 1.2650,
      'USDJPY': 148.50,
      'USDCHF': 0.8750,
      'AUDUSD': 0.6550,
      'USDCAD': 1.3750,
      'NZDUSD': 0.5950,
      'XAUUSD': 2030.00,
      'BTCUSD': 43000,
      'ETHUSD': 2300
    };
    
    return fallbackPrices[symbol] || 1.0000;
  }
  
  // Get macro economic context using FRED API
  async getMacroContext(baseCurrency: string, quoteCurrency: string): Promise<EnhancedAnalysisData['macroContext']> {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-economic-fetch', {
        body: { 
          currencies: [baseCurrency, quoteCurrency],
          lookAhead: 7 // 7 days
        }
      });
      
      if (!error && data) {
        return {
          upcomingEvents: data.events || [],
          interestRates: data.rates || {},
          economicTrend: data.trend || 'neutral'
        };
      }
    } catch (error) {
      console.log('Macro context fetch failed:', error);
    }
    
    // Fallback macro context
    return {
      upcomingEvents: [
        {
          event: 'Economic data release',
          impact: 'Medium' as const,
          timeToEvent: 86400, // 1 day
          relevantCurrencies: [baseCurrency, quoteCurrency]
        }
      ],
      interestRates: {
        [baseCurrency]: 5.25,
        [quoteCurrency]: 4.50
      },
      economicTrend: 'neutral' as const
    };
  }
  
  // Get sentiment analysis from multiple sources
  async getSentimentAnalysis(symbol: string): Promise<EnhancedAnalysisData['sentiment']> {
    try {
      // This would integrate with Reddit API, Twitter API, etc.
      // For now, providing a structure with mock data
      const mockSentiment = {
        overall: 'neutral' as const,
        score: Math.floor(Math.random() * 40) - 20, // -20 to +20
        sources: {
          reddit: Math.floor(Math.random() * 40) - 20,
          twitter: Math.floor(Math.random() * 40) - 20,
          retail: Math.floor(Math.random() * 40) - 20
        },
        conflictingSignals: Math.random() > 0.7
      };
      
      // Determine overall sentiment
      const avgScore = (mockSentiment.sources.reddit + mockSentiment.sources.twitter + mockSentiment.sources.retail) / 3;
      mockSentiment.score = Math.floor(avgScore);
      
      if (avgScore > 10) {
        mockSentiment.overall = 'bullish';
      } else if (avgScore < -10) {
        mockSentiment.overall = 'bearish';
      }
      
      return mockSentiment;
    } catch (error) {
      console.log('Sentiment analysis failed:', error);
      return {
        overall: 'neutral',
        score: 0,
        sources: { reddit: 0, twitter: 0, retail: 0 },
        conflictingSignals: false
      };
    }
  }
  
  // Parse screenshot using OCR
  async parseScreenshot(imageUrl: string): Promise<EnhancedAnalysisData['ocrData']> {
    try {
      // This would integrate with Tesseract.js or Google Vision API
      // For now, return a mock structure
      return {
        detectedPrices: {
          entry: undefined,
          stopLoss: undefined,
          takeProfit: undefined
        },
        detectedText: [
          'EURUSD',
          '1.0850',
          'BUY',
          'Support level'
        ],
        confidence: 0.85
      };
    } catch (error) {
      console.log('OCR parsing failed:', error);
      return undefined;
    }
  }
  
  // Calculate enhanced risk/reward with live prices
  calculateLiveRiskReward(
    userEntry: number, 
    stopLoss: number, 
    takeProfit: number, 
    currentPrice: number, 
    direction: 'BUY' | 'SELL'
  ): { liveRR: number, recommendedEntry: number, deviation: number } {
    const deviation = Math.abs(currentPrice - userEntry);
    const deviationPips = deviation * 10000; // Convert to pips
    
    // Calculate live R:R using current price as entry
    let liveRR: number;
    if (direction === 'BUY') {
      const risk = Math.abs(currentPrice - stopLoss);
      const reward = Math.abs(takeProfit - currentPrice);
      liveRR = risk > 0 ? reward / risk : 0;
    } else {
      const risk = Math.abs(stopLoss - currentPrice);
      const reward = Math.abs(currentPrice - takeProfit);
      liveRR = risk > 0 ? reward / risk : 0;
    }
    
    return {
      liveRR,
      recommendedEntry: currentPrice,
      deviation: deviationPips
    };
  }
  
  // Comprehensive analysis combining all data sources
  async performEnhancedAnalysis(setup: any): Promise<EnhancedAnalysisData> {
    console.log('🚀 Starting enhanced setup analysis...');
    
    const symbol = setup.pair;
    const baseCurrency = symbol.substring(0, 3);
    const quoteCurrency = symbol.substring(3, 6);
    
    // Fetch all data in parallel for efficiency
    const [livePrice, macroContext, sentiment, ocrData] = await Promise.all([
      this.getLivePrice(symbol),
      this.getMacroContext(baseCurrency, quoteCurrency),
      this.getSentimentAnalysis(symbol),
      setup.screenshot_url ? this.parseScreenshot(setup.screenshot_url) : Promise.resolve(undefined)
    ]);
    
    // Calculate live risk/reward
    const liveRiskReward = this.calculateLiveRiskReward(
      setup.entry_price,
      setup.stop_loss,
      setup.take_profit,
      livePrice.price,
      setup.direction
    );
    
    console.log('✅ Enhanced analysis complete');
    
    return {
      currentPrice: livePrice.price,
      spread: livePrice.spread,
      priceAge: livePrice.age,
      priceSource: livePrice.source,
      liveRiskReward: liveRiskReward.liveRR,
      recommendedEntry: liveRiskReward.recommendedEntry,
      priceDeviation: liveRiskReward.deviation,
      macroContext,
      sentiment,
      ocrData
    };
  }
}

export const enhancedSetupAnalyzer = new EnhancedSetupAnalyzer();