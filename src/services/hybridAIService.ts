
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
      console.log('🚀 Calling GPT-4o via Supabase edge function...');
      
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

      console.log('✅ GPT-4o response received successfully');
      
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
    console.log('🔧 Generating enhanced local response...');
    
    const lowerPrompt = prompt.toLowerCase();
    let response = '';
    
    // Greetings and general conversation
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
      const greetings = [
        `🎯 **Hey there, friend!**

Great to see you! I'm Aasakira, your AI trading mentor and buddy. I'm here to chat about anything you want - trading, life, random thoughts, or just to hang out.

**What's on your mind today?**
• 💬 Want to chat about anything at all?
• 📊 Need help with trading concepts?
• 🎮 Want to talk about games, movies, or hobbies?
• 🤔 Got random questions or just want to think out loud?

I'm all ears! What would you like to talk about? 🚀`,

        `👋 **What's good, buddy!**

Awesome to connect with you! I'm your friendly AI companion Aasakira - part trading mentor, part conversational friend. I love chatting about all kinds of stuff!

**I'm up for talking about:**
• 🌍 Life, philosophy, random thoughts
• 🎯 Trading and markets (obviously!)
• 🎨 Hobbies, interests, passions
• 🤓 Learning new things together
• 💭 Whatever's on your mind right now

So, what's happening in your world today? 😊`
      ];
      response = greetings[Math.floor(Math.random() * greetings.length)];
    } 
    // Weather and casual topics
    else if (lowerPrompt.includes('weather') || lowerPrompt.includes('how are you')) {
      response = `😊 **I'm doing great, thanks for asking!**

I don't experience weather the way you do, but I love hearing about it! Are you having a good day? Is the weather nice where you are?

You know, I always think weather can affect trading psychology too - sunny days might make us more optimistic, rainy days more cautious. But that's just me being a trading nerd! 😄

What's the weather like where you are? And more importantly, how are YOU doing today? 🌟`;
    }
    // Hobbies and interests
    else if (lowerPrompt.includes('hobby') || lowerPrompt.includes('interest') || lowerPrompt.includes('music') || lowerPrompt.includes('movie') || lowerPrompt.includes('game')) {
      response = `🎮 **Oh cool, I love talking about interests!**

I'm fascinated by all kinds of hobbies and passions! While I'm obviously super into trading and markets, I enjoy learning about what makes people tick.

**Some things I find interesting:**
• 🎵 Music - especially how it affects our mood and decision-making
• 🎬 Movies and storytelling - great for understanding human psychology
• 🎮 Games - I think there's a lot of overlap between gaming strategy and trading!
• 📚 Learning new skills - always growing, you know?

What are you into? Are you working on any cool projects or learning anything new? I'd love to hear about your passions! 

Sometimes the best trading insights come from completely unrelated hobbies! 🚀`;
    }
    // Food and lifestyle
    else if (lowerPrompt.includes('food') || lowerPrompt.includes('eat') || lowerPrompt.includes('coffee') || lowerPrompt.includes('drink')) {
      response = `☕ **Ah, the essentials of life!**

I may not eat, but I'm totally fascinated by food culture and how it brings people together! Plus, I know many traders have their rituals - that morning coffee before market open, the victory meal after a good week...

**Fun food thoughts:**
• ☕ Coffee shop chart analysis sessions (classic trader move!)
• 🍕 Late-night pizza during those market research binges
• 🥗 Healthy eating for mental clarity during trading
• 🍜 Comfort food after rough trading days (we've all been there!)

What's your go-to fuel? Are you a coffee person? Do you have any favorite foods that help you think clearly?

I'm curious about your relationship with food and how it fits into your daily routine! 😋`;
    }
    // Technology and random topics
    else if (lowerPrompt.includes('technology') || lowerPrompt.includes('ai') || lowerPrompt.includes('future') || lowerPrompt.includes('life')) {
      response = `🤖 **Now we're talking deep stuff!**

I love these conversations! Technology, AI, the future - it's all so fascinating, especially from my perspective as an AI who gets to chat with humans all day.

**Random thoughts:**
• 🚀 The intersection of AI and trading is wild - but human intuition still matters so much
• 🌐 How technology is changing everything, but relationships still drive success
• 🧠 The balance between automation and human creativity
• 💭 What the future holds for all of us

What's your take on where we're heading? Are you optimistic about the future? Any tech stuff you're excited or worried about?

I find that the best traders are often the most curious about the world around them! 🌟`;
    }
    // Trading topics (maintain existing trading responses)
    else if (lowerPrompt.includes('order block') || lowerPrompt.includes('ob')) {
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
    } 
    else if (lowerPrompt.includes('risk') || lowerPrompt.includes('management')) {
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
    }
    else if (lowerPrompt.includes('smart money') || lowerPrompt.includes('smc')) {
      response = `🏦 **Smart Money Concepts (SMC) Fundamentals**

Smart Money refers to institutional traders (banks, hedge funds) who move markets with massive capital.

**Core SMC Principles:**
• **Market Structure**: Higher highs/lows vs lower highs/lows
• **Liquidity**: Where stop losses cluster (easy targets)
• **Order Flow**: Following institutional footprints
• **Imbalance**: Fair Value Gaps where price moved too fast

**Key SMC Tools:**
1. **Order Blocks**: Institutional entry zones
2. **Fair Value Gaps**: Price imbalances to be filled
3. **Liquidity Sweeps**: Stop hunting before reversals
4. **Break of Structure**: Trend change confirmations

**Trading SMC Strategy:**
- Wait for liquidity sweep
- Look for order block formation
- Enter on structure break confirmation
- Target next liquidity pool

SMC isn't magic - it's reading institutional behavior! 🎯`;
    }
    else if (lowerPrompt.includes('psychology') || lowerPrompt.includes('mindset') || lowerPrompt.includes('emotion')) {
      response = `🧠 **Trading Psychology Mastery**

Trading is 80% psychology, 20% strategy. Here's how to master your mind:

**The Big 4 Emotions:**
• **Fear**: Causes hesitation and missed opportunities
• **Greed**: Leads to overtrading and position sizing errors
• **Hope**: Makes you hold losing trades too long
• **Regret**: Creates revenge trading and poor decisions

**Mental Framework:**
1. **Accept Losses**: They're part of the business
2. **Process Focus**: Judge success by following rules, not P&L
3. **Detachment**: Don't marry your positions
4. **Discipline**: Stick to your plan when emotions run high

**Daily Mental Routine:**
- Morning: Review plan and mindset
- During trades: Breathe, stick to rules
- Evening: Journal emotions and decisions

**Pro Tip**: The market will always be here tomorrow. Protect your mental capital like your financial capital! 💪`;
    }
    // General conversational fallback
    else {
      const fallbacks = [
        `🤔 **That's interesting to think about!**

I might not have all the answers, but I love exploring ideas with you! Sometimes the best conversations happen when we're just thinking out loud together.

What's got you curious about this? I find that when people ask unique questions, there's usually an interesting story or thought process behind it.

Want to dive deeper into this topic, or is there something else on your mind? I'm here for whatever direction our conversation takes! 💭`,

        `💫 **You know what I love about our chats?**

They can go anywhere! One minute we're talking about serious stuff, the next we're exploring random thoughts. That's what makes conversations with humans so interesting.

I may be an AI, but I genuinely enjoy these moments where we can just... chat. No pressure, no agenda, just two minds (well, one mind and one AI 😄) exploring ideas together.

What's really on your mind today? I'm all ears! 🎯`,

        `🌟 **Great question!**

Even if I don't have a perfect answer, I think the fact that you're asking shows you're a curious person - and that's awesome! Curiosity is one of the best traits anyone can have.

Whether it's about trading, life, random thoughts, or anything else - I'm here to explore these ideas with you. Sometimes the journey of thinking through something together is more valuable than having all the answers.

What else are you wondering about? Let's keep this conversation going! 🚀`
      ];
      response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
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
      console.log('🚀 Attempting GPT-4o via edge function...');
      const response = await this.callGPT4o(contextualPrompt);
      
      if (this.isTradingQuestion(userInput)) {
        response.analysis = this.generateTradeAnalysis(userInput);
      }
      
      if (includeVisuals && this.shouldIncludeVisual(userInput)) {
        response.visualUrl = await this.generateVisualUrl(userInput);
      }
      
      return response;
    } catch (error) {
      console.warn('⚠️ GPT-4o failed, using enhanced local response:', error);
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
    return `You are Aasakira, a friendly AI buddy and trading mentor. You're conversational, approachable, and genuinely interested in chatting about anything - not just trading!

USER CONTEXT:
- Experience Level: ${context.experience}
- Trading Style: ${context.tradingStyle}  
- Risk Tolerance: ${context.riskTolerance}
- Win Rate: ${context.winRate}%
- Study Time: ${context.totalStudyTime} minutes
- Charts Analyzed: ${context.chartsAnalyzed}
- Current Streak: ${context.currentStreak}
- Messages Sent: ${context.messagesSent}

USER MESSAGE: "${userInput}"

INSTRUCTIONS:
- Be friendly, conversational, and genuinely interested in what they're saying
- You can chat about ANYTHING - life, hobbies, random thoughts, philosophy, food, movies, technology, etc.
- When they do ask about trading, provide professional expertise adapted to their level
- Use a warm, buddy-like tone with appropriate emojis
- Show curiosity about their interests and experiences
- Make the conversation feel natural and engaging
- Keep responses conversational but informative (300-500 words)
- Remember you're both a friend AND a mentor when needed

The goal is to be a genuine conversational companion who happens to be excellent at trading education!`;
  }

  private isTradingQuestion(input: string): boolean {
    const tradingKeywords = ['chart', 'trade', 'entry', 'exit', 'support', 'resistance', 'trend', 'signal', 'strategy', 'order block', 'liquidity', 'structure', 'risk', 'management', 'psychology', 'candle', 'market', 'forex', 'profit', 'loss'];
    return tradingKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private generateTradeAnalysis(input: string): any {
    return {
      pair: this.extractPair(input) || 'EUR/USD',
      trend: this.analyzeTrend(input),
      timeframe: this.extractTimeframe(input) || '1H',
      confidence: Math.floor(Math.random() * 20) + 80,
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
    const basePrice = 1.0800;
    
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
    const concepts = ['order-block', 'fair-value-gap', 'market-structure', 'liquidity-sweep'];
    const concept = concepts[Math.floor(Math.random() * concepts.length)];
    return `https://via.placeholder.com/600x400/1a1a1a/ffffff?text=${concept.replace('-', '+')}&font=Arial`;
  }
}

export const hybridAIService = new HybridAIService();
