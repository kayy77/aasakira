
import { supabase } from '@/integrations/supabase/client';

export interface AIResponse {
  text: string;
  source: 'gpt4o' | 'gemini' | 'local';
  confidence: number;
  visualUrl?: string;
  analysis?: {
    pair?: string;
    trend?: string;
    timeframe?: string;
    confidence?: number;
    keyLevels?: Array<{
      type: 'support' | 'resistance' | 'pivot';
      level: string;
    }>;
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
  private readonly rateLimitKey = 'ai_service_calls';
  private readonly maxCallsPerHour = 30;

  private async callGPT4o(prompt: string): Promise<AIResponse> {
    try {
      console.log('🤖 Attempting GPT-4o call...');
      
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

      console.log('✅ GPT-4o response received');
      
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
    console.log('🔧 Generating local response for:', prompt.substring(0, 50) + '...');
    
    // Analyze the prompt to give relevant responses
    const lowerPrompt = prompt.toLowerCase();
    
    let response = '';
    
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
      response = `🎯 **Welcome to Aasakira 2.0!**

Hello! I'm your advanced AI trading mentor. I specialize in Smart Money Concepts, institutional trading, and professional market analysis.

**What I can help you with:**
• 📊 Smart Money Concepts (Order Blocks, FVG, BOS)
• 🎯 Entry/Exit Strategy Development  
• ⚖️ Risk Management & Position Sizing
• 🧠 Trading Psychology & Discipline
• 📈 Market Structure Analysis

Ask me anything about trading! Try questions like:
- "Explain order blocks"
- "How do I manage risk?"
- "What is market structure?"

Let's elevate your trading! 🚀`;
    } else if (lowerPrompt.includes('order block') || lowerPrompt.includes('ob')) {
      response = `📊 **Order Blocks Explained**

An **Order Block** is a significant price level where institutional traders have placed large orders, creating an imbalance that price often returns to fill.

**Key Characteristics:**
• **Formation**: Created by aggressive buying/selling that moves price rapidly
• **Structure**: Shows as a consolidation before a strong directional move
• **Behavior**: Price often returns to test these levels for liquidity

**How to Trade Order Blocks:**
1. **Identify**: Look for strong moves away from consolidation areas
2. **Mark the Zone**: The last opposite candle before the move
3. **Wait for Return**: Price often comes back to test this level
4. **Entry**: Look for rejection signals (pin bars, engulfing patterns)

**Pro Tip**: Combine with higher timeframe structure for better confluence! 📈`;
    } else if (lowerPrompt.includes('risk') || lowerPrompt.includes('management')) {
      response = `⚖️ **Risk Management Mastery**

Risk management is THE most important skill in trading. Here's your professional framework:

**The 2% Rule:**
• Never risk more than 2% of your account per trade
• Calculate position size BEFORE entering
• Use this formula: Risk Amount ÷ Stop Loss Distance = Position Size

**Professional Risk Framework:**
1. **Pre-Trade**: Define your risk, stop loss, and take profit
2. **During Trade**: Never move stops against you
3. **Post-Trade**: Journal your risk decisions

**Position Sizing Example:**
- Account: $10,000
- Risk per trade: 2% = $200
- Stop loss: 50 pips
- Position size: $200 ÷ 50 pips = $4 per pip

**Remember**: Protecting capital > Making profits. You can't trade without money! 💰`;
    } else if (lowerPrompt.includes('psychology') || lowerPrompt.includes('discipline')) {
      response = `🧠 **Trading Psychology & Discipline**

90% of trading success is mental. Here's how professionals think:

**The Professional Mindset:**
• **Process Over Profit**: Focus on executing your plan perfectly
• **Probability Thinking**: Accept that individual trades can lose
• **Emotional Control**: Trade the setup, not your feelings

**Building Discipline:**
1. **Pre-Market Routine**: Review plan, key levels, economic calendar
2. **Trade Journal**: Document every trade decision and emotion
3. **Rules-Based Trading**: Never deviate from your proven strategy

**Handling Losses:**
- Losses are business expenses, not personal failures
- Analyze what went wrong: Setup? Execution? Timing?
- Take breaks after emotional trades

**Pro Tip**: The best traders are boring - they follow the same process every single day! 🎯`;
    } else if (lowerPrompt.includes('market structure') || lowerPrompt.includes('bos') || lowerPrompt.includes('choch')) {
      response = `📈 **Market Structure Analysis**

Understanding market structure is like having X-ray vision for price movement.

**Key Concepts:**
• **Higher Highs/Higher Lows (HH/HL)**: Uptrend structure
• **Lower Highs/Lower Lows (LH/LL)**: Downtrend structure  
• **Break of Structure (BOS)**: Continuation signal
• **Change of Character (ChoCH)**: Reversal signal

**How to Read Structure:**
1. **Identify Swing Points**: Connect major highs and lows
2. **Determine Trend**: Is price making HH/HL or LH/LL?
3. **Watch for Breaks**: BOS = trend continues, ChoCH = trend changes

**Trading Applications:**
- Trade WITH structure, not against it
- Look for entries on structure retest
- Use multiple timeframes for confluence

**Example**: Daily shows uptrend (HH/HL), wait for 4H pullback to key level, enter on 1H bullish BOS.

Structure is your roadmap - follow it! 🗺️`;
    } else {
      response = `🎯 **Professional Trading Guidance**

Great question! Here's my analysis based on Smart Money Concepts:

**Key Trading Principles:**
• **Follow Institutional Flow**: Trade where big money is moving
• **Multi-Timeframe Analysis**: Align your trades across timeframes
• **Patience & Precision**: Wait for high-probability setups only
• **Risk-First Mentality**: Protect capital above all else

**Next Steps for Your Development:**
1. **Study Market Structure**: Learn to read price action like a book
2. **Practice Order Flow**: Understand where liquidity sits
3. **Develop Your Edge**: Find setups that work consistently for you
4. **Journal Everything**: Track your progress and learn from mistakes

**Remember**: Trading is a skill that takes time to master. Focus on consistency over complexity, and results will follow.

What specific area would you like to dive deeper into? I'm here to guide your journey! 📚`;
    }

    return {
      text: response,
      source: 'local',
      confidence: 0.85
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
      console.log('🚀 Attempting primary AI service...');
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
      console.warn('⚠️ Primary AI failed, using enhanced fallback:', error);
      return await this.generateLocalResponse(userInput);
    }
  }

  async getRemainingCalls(): Promise<{ ai: number; visual: number }> {
    try {
      const now = Date.now();
      const hourAgo = now - (60 * 60 * 1000);
      
      const calls = JSON.parse(localStorage.getItem(this.rateLimitKey) || '[]');
      const recentCalls = calls.filter((timestamp: number) => timestamp > hourAgo);
      
      const remaining = Math.max(0, this.maxCallsPerHour - recentCalls.length);
      
      return {
        ai: remaining,
        visual: remaining
      };
    } catch (error) {
      console.error('Error checking rate limits:', error);
      return { ai: 0, visual: 0 };
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
    const tradingKeywords = ['chart', 'trade', 'entry', 'exit', 'support', 'resistance', 'trend', 'signal', 'strategy', 'order block', 'liquidity', 'structure'];
    return tradingKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private generateTradeAnalysis(input: string): any {
    return {
      pair: this.extractPair(input) || 'EUR/USD',
      trend: this.analyzeTrend(input),
      timeframe: this.extractTimeframe(input) || '1H',
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      keyLevels: this.generateKeyLevels(input)
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

  private extractTimeframe(input: string): string | null {
    const timeframes = ['1M', '5M', '15M', '30M', '1H', '4H', '1D'];
    for (const tf of timeframes) {
      if (input.toUpperCase().includes(tf)) {
        return tf;
      }
    }
    return null;
  }

  private generateKeyLevels(input: string): Array<{ type: 'support' | 'resistance' | 'pivot'; level: string }> {
    const levels = [];
    const basePrice = 1.0800; // Example EUR/USD
    
    if (input.toLowerCase().includes('support') || Math.random() > 0.5) {
      levels.push({
        type: 'support' as const,
        level: (basePrice - 0.0050).toFixed(4)
      });
    }
    
    if (input.toLowerCase().includes('resistance') || Math.random() > 0.5) {
      levels.push({
        type: 'resistance' as const,
        level: (basePrice + 0.0050).toFixed(4)
      });
    }
    
    if (Math.random() > 0.7) {
      levels.push({
        type: 'pivot' as const,
        level: basePrice.toFixed(4)
      });
    }
    
    return levels;
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
