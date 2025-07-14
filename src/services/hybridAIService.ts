import { geminiService } from './geminiService';
import { replicateService, type ChartGenerationRequest } from './replicateService';

interface AIResponse {
  text: string;
  analysis?: TradingAnalysis;
  visualUrl?: string;
  confidence: number;
  source: 'gemini';
}

interface TradingAnalysis {
  pair?: string;
  timeframe?: string;
  trend: string;
  keyLevels: Array<{ level: number; type: 'support' | 'resistance' | 'order_block' }>;
  entryZone?: { min: number; max: number };
  stopLoss?: number;
  takeProfit?: number[];
  reasoning: string;
  confidence: number;
}

class HybridAIService {
  private readonly rateLimitKey = 'hybrid_ai_calls';
  private readonly maxCallsPerHour = 100;

  private async checkRateLimit(): Promise<boolean> {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    const calls = JSON.parse(localStorage.getItem(this.rateLimitKey) || '[]');
    const recentCalls = calls.filter((timestamp: number) => timestamp > hourAgo);
    
    if (recentCalls.length >= this.maxCallsPerHour) {
      throw new Error('AI rate limit exceeded. Please try again later.');
    }
    
    recentCalls.push(now);
    localStorage.setItem(this.rateLimitKey, JSON.stringify(recentCalls));
    return true;
  }

  async generateComprehensiveResponse(
    message: string, 
    context: any = {},
    includeVisual: boolean = false
  ): Promise<AIResponse> {
    try {
      await this.checkRateLimit();

      // Enhanced prompt for structured trading responses
      const enhancedPrompt = this.createTradingPrompt(message, context);
      
      // Use Gemini service for now (can be expanded later)
      const response = await geminiService.generateTradingResponse(enhancedPrompt);

      // Extract trading analysis from response
      const analysis = this.extractTradingAnalysis(response);
      
      // Generate visual if requested and analysis contains chart-worthy data
      let visualUrl: string | undefined;
      if (includeVisual && this.shouldGenerateVisual(message)) {
        try {
          const chartRequest: ChartGenerationRequest = {
            prompt: `Trading chart visualization: ${response.substring(0, 500)}`,
            chartType: this.determineChartType(message),
            pair: analysis?.pair,
            timeframe: analysis?.timeframe
          };
          
          const visualResult = await replicateService.generateTradingChart(chartRequest);
          if (visualResult.status === 'success') {
            visualUrl = visualResult.imageUrl;
          }
        } catch (visualError) {
          console.warn('Visual generation failed:', visualError);
          // Continue without visual
        }
      }

      return {
        text: response,
        analysis,
        visualUrl,
        confidence: analysis?.confidence || 0.8,
        source: 'gemini'
      };

    } catch (error) {
      console.error('Hybrid AI service error:', error);
      throw error;
    }
  }

  private createTradingPrompt(message: string, context: any): string {
    return `You are Aasakira 2.0, the world's most advanced AI trading mentor with expertise in Smart Money Concepts (SMC), institutional trading, and market structure analysis.

User Context:
- Experience Level: ${context.experience || 'Intermediate'}
- Trading Style: ${context.tradingStyle || 'Swing Trading'}
- Risk Tolerance: ${context.riskTolerance || 'Moderate'}
- Recent Performance: ${context.winRate || 0}% win rate
- Total Study Time: ${context.totalStudyTime || 0} hours
- Current Streak: ${context.currentStreak || 0}
- Charts Analyzed: ${context.chartsAnalyzed || 0}
- Messages Sent: ${context.messagesSent || 0}

User Question: ${message}

Provide a comprehensive, personalized response that includes:
1. Direct answer to their question with specific details
2. SMC/institutional perspective where relevant (order blocks, liquidity, market structure)
3. Specific actionable advice they can implement
4. Risk management considerations
5. Reference their progress and learning journey
6. If applicable, mention key levels, entry zones, or market structure
7. Use relevant emojis and clear formatting

Keep the tone professional but personable, like a seasoned trader mentoring a colleague. Remember their context and adapt your teaching style to their experience level.

If this involves chart analysis or technical concepts, structure your response to be visual-friendly for potential chart generation with specific trading zones and levels.`;
  }

  private extractTradingAnalysis(response: string): TradingAnalysis | undefined {
    try {
      const analysis: Partial<TradingAnalysis> = {};
      
      // Extract key information using regex patterns
      const pairMatch = response.match(/([A-Z]{3}\/[A-Z]{3}|[A-Z]{6}|EUR\/USD|GBP\/USD|USD\/JPY|AUD\/USD|USD\/CAD|USD\/CHF|NZD\/USD)/i);
      if (pairMatch) analysis.pair = pairMatch[0].toUpperCase();
      
      const timeframeMatch = response.match(/(\d+[HMD]|1H|4H|1D|H1|H4|D1|15M|M15|5M|M5)/i);
      if (timeframeMatch) analysis.timeframe = timeframeMatch[0];
      
      // Extract trend
      const trendKeywords = response.toLowerCase();
      if (trendKeywords.includes('bullish') || trendKeywords.includes('uptrend') || trendKeywords.includes('buying')) {
        analysis.trend = 'bullish';
      } else if (trendKeywords.includes('bearish') || trendKeywords.includes('downtrend') || trendKeywords.includes('selling')) {
        analysis.trend = 'bearish';
      } else {
        analysis.trend = 'neutral';
      }
      
      // Extract confidence based on language certainty
      const confidenceWords = ['very confident', 'highly likely', 'strong signal', 'clear indication', 'definitely'];
      const uncertainWords = ['maybe', 'possibly', 'might', 'uncertain', 'could be'];
      
      if (confidenceWords.some(word => response.toLowerCase().includes(word))) {
        analysis.confidence = 0.9;
      } else if (uncertainWords.some(word => response.toLowerCase().includes(word))) {
        analysis.confidence = 0.6;
      } else {
        analysis.confidence = 0.75;
      }
      
      // Extract price levels
      const priceMatches = response.match(/\b\d+\.\d{4,5}\b/g);
      if (priceMatches && priceMatches.length > 0) {
        analysis.keyLevels = priceMatches.slice(0, 5).map((price, index) => ({
          level: parseFloat(price),
          type: index % 2 === 0 ? 'support' : 'resistance' as 'support' | 'resistance' | 'order_block'
        }));
      } else {
        analysis.keyLevels = [];
      }
      
      analysis.reasoning = response.substring(0, 200).replace(/\n/g, ' ') + '...';
      
      return analysis as TradingAnalysis;
    } catch (error) {
      console.warn('Failed to extract trading analysis:', error);
      return undefined;
    }
  }

  private shouldGenerateVisual(message: string): boolean {
    const visualKeywords = [
      'chart', 'analysis', 'levels', 'structure', 'breakout', 
      'support', 'resistance', 'trend', 'pattern', 'setup',
      'smc', 'order block', 'liquidity', 'visual', 'show me',
      'explain', 'diagram', 'example', 'illustration'
    ];
    
    return visualKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private determineChartType(message: string): ChartGenerationRequest['chartType'] {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('smc') || lowerMessage.includes('smart money') || 
        lowerMessage.includes('order block') || lowerMessage.includes('liquidity') ||
        lowerMessage.includes('institutional')) {
      return 'smc_analysis';
    }
    
    if (lowerMessage.includes('indicator') || lowerMessage.includes('rsi') || 
        lowerMessage.includes('macd') || lowerMessage.includes('moving average') ||
        lowerMessage.includes('ema') || lowerMessage.includes('sma')) {
      return 'technical_indicator';
    }
    
    if (lowerMessage.includes('strategy') || lowerMessage.includes('entry') || 
        lowerMessage.includes('exit') || lowerMessage.includes('trade setup')) {
      return 'trading_strategy';
    }
    
    return 'price_action';
  }

  async getRemainingCalls(): Promise<{ ai: number; visual: number }> {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    const aiCalls = JSON.parse(localStorage.getItem(this.rateLimitKey) || '[]');
    const recentAICalls = aiCalls.filter((timestamp: number) => timestamp > hourAgo);
    
    const visualCalls = await replicateService.getRemainingCalls();
    
    return {
      ai: Math.max(0, this.maxCallsPerHour - recentAICalls.length),
      visual: visualCalls
    };
  }
}

export const hybridAIService = new HybridAIService();
export type { AIResponse, TradingAnalysis };