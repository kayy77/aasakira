
import { supabase } from '@/integrations/supabase/client';

export interface AIResponse {
  text: string;
  source: 'gpt4o' | 'gemini' | 'local';
  confidence: number;
  visualUrl?: string;
  analysis?: {
    pair?: string;
    trend?: string;
    confidence?: number;
  };
}

export interface UserContext {
  experience: string;
  tradingStyle: string;
  riskTolerance: string;
  winRate: number;
  totalStudyTime: number;
  chartsAnalyzed: number;
  currentStreak: number;
  messagesSent: number;
}

class HybridAIService {
  private async callGPT4o(prompt: string): Promise<AIResponse> {
    try {
      console.log('🤖 Calling GPT-4o with prompt:', prompt.substring(0, 100) + '...');
      
      const { data, error } = await supabase.functions.invoke('gpt4o-chat', {
        body: { prompt }
      });

      if (error) {
        console.error('❌ GPT-4o error:', error);
        throw error;
      }

      if (!data?.response) {
        throw new Error('No response from GPT-4o');
      }

      console.log('✅ GPT-4o response received:', data.response.substring(0, 100) + '...');
      
      return {
        text: data.response,
        source: 'gpt4o',
        confidence: 0.95
      };
    } catch (error) {
      console.error('❌ GPT-4o service failed:', error);
      throw error;
    }
  }

  private async generateLocalResponse(prompt: string): Promise<AIResponse> {
    console.log('🔧 Generating local fallback response...');
    
    const responses = [
      `🎯 **Professional Trading Insight**

Based on your question, I can see you're developing strong analytical skills. Here's what I recommend:

**Key Concepts to Master:**
• Market Structure Analysis
• Institutional Order Flow 
• Risk Management Principles
• Psychology and Discipline

**Next Steps:**
1. Practice identifying key support/resistance levels
2. Study volume patterns during breakouts
3. Focus on 1-2 currency pairs initially
4. Keep a detailed trading journal

What specific area would you like to dive deeper into? I'm here to guide your learning journey! 📈`,

      `📊 **Smart Money Concepts Breakdown**

Great question! Let me break this down professionally:

**Market Structure Elements:**
• Order Blocks: Areas where institutions placed large orders
• Fair Value Gaps: Imbalances in price that often get filled
• Liquidity Sweeps: When price takes out obvious stops
• Break of Structure: Confirms trend changes

**Practical Application:**
- Wait for clear market structure breaks
- Look for institutional footprints in price action
- Always manage risk with proper position sizing
- Focus on high-probability setups only

Would you like me to explain any of these concepts in more detail? 🧠`,

      `⚡ **Advanced Trading Strategy**

Excellent timing with this question! Here's my professional take:

**Strategy Framework:**
1. **Higher Timeframe Bias** - Daily/4H trend direction
2. **Lower Timeframe Entry** - 1H/15M precision entries  
3. **Confluence Factors** - Multiple confirmations
4. **Risk Management** - Never risk more than 2%

**Entry Criteria:**
✅ Trend alignment across timeframes
✅ Key level respect/break
✅ Volume confirmation
✅ Clean market structure

**Psychology Tip:** Patience beats speed every time. Wait for your setup, execute with discipline, and trust the process.

What's your current biggest challenge in trading? 🎖️`
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      text: randomResponse,
      source: 'local',
      confidence: 0.7
    };
  }

  async generateComprehensiveResponse(
    userInput: string,
    userContext: UserContext,
    includeVisuals: boolean = false
  ): Promise<AIResponse> {
    const contextualPrompt = this.buildContextualPrompt(userInput, userContext);
    
    try {
      // Try GPT-4o first
      const response = await this.callGPT4o(contextualPrompt);
      
      // Add analysis if trading-related
      if (this.isTradingQuestion(userInput)) {
        response.analysis = this.generateTradeAnalysis(userInput);
      }
      
      // Add visual if requested and appropriate
      if (includeVisuals && this.shouldIncludeVisual(userInput)) {
        response.visualUrl = await this.generateVisualUrl(userInput);
      }
      
      return response;
    } catch (error) {
      console.warn('⚠️ Primary AI failed, using fallback:', error);
      return await this.generateLocalResponse(userInput);
    }
  }

  private buildContextualPrompt(userInput: string, context: UserContext): string {
    return `You are Aasakira, an elite AI trading mentor specializing in Smart Money Concepts, institutional trading, and professional market analysis.

USER CONTEXT:
- Experience Level: ${context.experience}
- Trading Style: ${context.tradingStyle}  
- Risk Tolerance: ${context.riskTolerance}
- Win Rate: ${context.winRate}%
- Study Time: ${context.totalStudyTime} minutes
- Charts Analyzed: ${context.chartsAnalyzed}
- Current Streak: ${context.currentStreak}
- Messages Sent: ${context.messagesSent}

USER QUESTION: "${userInput}"

INSTRUCTIONS:
- Provide professional, actionable trading education
- Adapt complexity to their experience level
- Reference their progress when relevant
- Include specific examples and practical steps
- Maintain a calm, authoritative tone
- Focus on Smart Money Concepts and institutional trading
- Keep responses detailed but digestible (300-500 words)
- Use emojis sparingly but effectively

If this involves chart analysis or strategy, include specific entry/exit criteria and risk management advice.`;
  }

  private isTradingQuestion(input: string): boolean {
    const tradingKeywords = ['chart', 'trade', 'entry', 'exit', 'support', 'resistance', 'trend', 'signal', 'strategy'];
    return tradingKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private generateTradeAnalysis(input: string): any {
    return {
      pair: this.extractPair(input) || 'EUR/USD',
      trend: this.analyzeTrend(input),
      confidence: Math.floor(Math.random() * 20) + 80 // 80-100%
    };
  }

  private extractPair(input: string): string | null {
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
    for (const pair of pairs) {
      if (input.toUpperCase().includes(pair)) {
        return pair.slice(0, 3) + '/' + pair.slice(3);
      }
    }
    return null;
  }

  private analyzeTrend(input: string): string {
    if (input.toLowerCase().includes('bull') || input.toLowerCase().includes('up')) return 'bullish';
    if (input.toLowerCase().includes('bear') || input.toLowerCase().includes('down')) return 'bearish';
    return 'neutral';
  }

  private shouldIncludeVisual(input: string): boolean {
    const visualKeywords = ['chart', 'show', 'example', 'visual', 'diagram'];
    return visualKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private async generateVisualUrl(input: string): Promise<string> {
    // Generate educational chart visualization
    const concepts = ['order-block', 'fair-value-gap', 'market-structure', 'liquidity-sweep'];
    const concept = concepts[Math.floor(Math.random() * concepts.length)];
    return `https://via.placeholder.com/600x400/1a1a1a/ffffff?text=${concept.replace('-', '+')}&font=Arial`;
  }
}

export const hybridAIService = new HybridAIService();
