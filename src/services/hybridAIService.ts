import { replicateService, type ChartGenerationRequest } from './replicateService';

interface AIResponse {
  text: string;
  analysis?: TradingAnalysis;
  visualUrl?: string;
  audioUrl?: string;
  confidence: number;
  source: 'gpt4o';
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
    includeVisual: boolean = false,
    includeVoice: boolean = false
  ): Promise<AIResponse> {
    try {
      await this.checkRateLimit();

      // Enhanced prompt for GPT-4o
      const enhancedPrompt = this.createAdvancedTradingPrompt(message, context);
      
      // Use GPT-4o via Supabase edge function
      const response = await this.callGPT4o(enhancedPrompt);

      // Extract trading analysis from response
      const analysis = this.extractTradingAnalysis(response);
      
      // Generate visual if requested and analysis contains chart-worthy data
      let visualUrl: string | undefined;
      if (includeVisual && this.shouldGenerateVisual(message)) {
        try {
          const chartRequest: ChartGenerationRequest = {
            prompt: `Professional trading chart visualization: ${response.substring(0, 500)}. Show key levels, trend analysis, and market structure with professional forex chart styling.`,
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
        }
      }

      // Generate voice narration if requested
      let audioUrl: string | undefined;
      if (includeVoice) {
        try {
          audioUrl = await this.generateVoiceNarration(response);
        } catch (voiceError) {
          console.warn('Voice generation failed:', voiceError);
        }
      }

      return {
        text: response,
        analysis,
        visualUrl,
        audioUrl,
        confidence: analysis?.confidence || 0.9,
        source: 'gpt4o'
      };

    } catch (error) {
      console.error('Hybrid AI service error:', error);
      throw error;
    }
  }

  private async callGPT4o(prompt: string): Promise<string> {
    try {
      const response = await fetch('/api/gpt4o-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('GPT-4o API call failed');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('GPT-4o call error:', error);
      // Fallback to local response if API fails
      return this.getFallbackResponse(prompt);
    }
  }

  private async generateVoiceNarration(text: string): Promise<string> {
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: text.substring(0, 1000), // Limit for voice generation
          voice: 'alloy' // Professional voice
        })
      });

      if (!response.ok) {
        throw new Error('Voice generation failed');
      }

      const data = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Voice generation error:', error);
      throw error;
    }
  }

  private createAdvancedTradingPrompt(message: string, context: any): string {
    return `You are Aasakira 2.0, the world's most advanced AI trading mentor powered by GPT-4o. You have deep expertise in:

🎯 CORE SPECIALIZATIONS:
- Smart Money Concepts (SMC) & Institutional Trading
- Advanced Market Structure Analysis
- Professional Risk Management Systems
- Trading Psychology & Mental Performance
- Multi-timeframe Technical Analysis
- Algorithmic Trading Strategies

📊 USER CONTEXT:
- Experience Level: ${context.experience || 'Intermediate'}
- Trading Style: ${context.tradingStyle || 'Swing Trading'}
- Risk Tolerance: ${context.riskTolerance || 'Moderate'}
- Win Rate: ${context.winRate || 0}%
- Study Hours: ${context.totalStudyTime || 0}
- Charts Analyzed: ${context.chartsAnalyzed || 0}
- Current Streak: ${context.currentStreak || 0}

🎯 USER QUESTION: "${message}"

PROVIDE A COMPREHENSIVE RESPONSE THAT INCLUDES:

1. 📈 DIRECT ANSWER with specific, actionable insights
2. 🧠 INSTITUTIONAL PERSPECTIVE (SMC concepts, liquidity analysis, order flow)
3. ⚡ IMMEDIATE ACTION STEPS they can implement today
4. 🛡️ RISK MANAGEMENT protocol for this specific scenario
5. 📚 PERSONALIZED learning path based on their progress
6. 🎯 SPECIFIC price levels, zones, or market structure if applicable
7. 💡 PRO TIPS that separate retail from institutional thinking

FORMAT: Use clear sections, bullet points, emojis, and professional but engaging tone. Make it visual-friendly for potential chart generation.

REMEMBER: You're mentoring a colleague, not lecturing a student. Be conversational but authoritative.`;
  }

  private getFallbackResponse(prompt: string): string {
    // Intelligent fallback based on prompt analysis
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('hello') || promptLower.includes('hi')) {
      return `🎯 Welcome to Aasakira 2.0 AI Mentor! 

I'm powered by advanced AI and ready to help you master trading with:

📈 **Smart Money Concepts** - Understanding institutional flow
🛡️ **Advanced Risk Management** - Protecting your capital
🧠 **Trading Psychology** - Mastering your mindset
📊 **Market Structure Analysis** - Reading price action like a pro

What specific trading challenge can I help you conquer today?`;
    }

    if (promptLower.includes('trade') || promptLower.includes('strategy')) {
      return `📊 **Professional Trading Approach**

🎯 **Key Principles:**
• Follow institutional money flow (Smart Money Concepts)
• Always define risk BEFORE entering trades
• Use multiple timeframe confirmation
• Focus on high-probability setups only

🛡️ **Risk Management:**
• Never risk more than 1-2% per trade
• Set stop losses at logical market structure levels
• Maintain 1:3 risk-reward minimum
• Keep detailed trading records

💡 **Pro Tip:** The best trades often feel uncomfortable to take. When retail is panicking, institutions are accumulating.

What specific market or setup would you like me to analyze?`;
    }

    return `🧠 **Aasakira AI Analysis**

Based on your question, here's my professional insight:

The key to successful trading lies in understanding market structure and following institutional money flow. Focus on these core principles:

📈 **Market Structure:** Identify trend direction on higher timeframes
🎯 **Entry Timing:** Wait for confirmation on lower timeframes  
🛡️ **Risk Control:** Never risk more than you can afford to lose
📊 **Psychology:** Stay disciplined with your trading plan

Would you like me to dive deeper into any specific aspect of trading?`;
  }

  private extractTradingAnalysis(response: string): TradingAnalysis | undefined {
    try {
      const analysis: Partial<TradingAnalysis> = {};
      
      const pairMatch = response.match(/([A-Z]{3}\/[A-Z]{3}|[A-Z]{6}|EUR\/USD|GBP\/USD|USD\/JPY|AUD\/USD|USD\/CAD|USD\/CHF|NZD\/USD)/i);
      if (pairMatch) analysis.pair = pairMatch[0].toUpperCase();
      
      const timeframeMatch = response.match(/(\d+[HMD]|1H|4H|1D|H1|H4|D1|15M|M15|5M|M5)/i);
      if (timeframeMatch) analysis.timeframe = timeframeMatch[0];
      
      const trendKeywords = response.toLowerCase();
      if (trendKeywords.includes('bullish') || trendKeywords.includes('uptrend') || trendKeywords.includes('buying')) {
        analysis.trend = 'bullish';
      } else if (trendKeywords.includes('bearish') || trendKeywords.includes('downtrend') || trendKeywords.includes('selling')) {
        analysis.trend = 'bearish';
      } else {
        analysis.trend = 'neutral';
      }
      
      const confidenceWords = ['very confident', 'highly likely', 'strong signal', 'clear indication', 'definitely'];
      const uncertainWords = ['maybe', 'possibly', 'might', 'uncertain', 'could be'];
      
      if (confidenceWords.some(word => response.toLowerCase().includes(word))) {
        analysis.confidence = 0.95;
      } else if (uncertainWords.some(word => response.toLowerCase().includes(word))) {
        analysis.confidence = 0.7;
      } else {
        analysis.confidence = 0.85;
      }
      
      const priceMatches = response.match(/\b\d+\.\d{4,5}\b/g);
      if (priceMatches && priceMatches.length > 0) {
        analysis.keyLevels = priceMatches.slice(0, 5).map((price, index) => ({
          level: parseFloat(price),
          type: index % 2 === 0 ? 'support' : 'resistance' as 'support' | 'resistance' | 'order_block'
        }));
      } else {
        analysis.keyLevels = [];
      }
      
      analysis.reasoning = response.substring(0, 300).replace(/\n/g, ' ') + '...';
      
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
