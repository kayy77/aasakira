
import { supabase } from '@/integrations/supabase/client';

interface ReplicateAIResponse {
  text: string;
  source: 'replicate';
  confidence: number;
}

interface UserContext {
  experience: string;
  tradingStyle: string;
  riskTolerance: string;
  winRate: number;
  totalStudyTime: number;
  chartsAnalyzed: number;
  currentStreak: number;
  messagesSent: number;
}

class ReplicateAIService {
  private readonly rateLimitKey = 'replicate_ai_calls';
  private readonly maxCallsPerHour = 40; // Conservative limit

  private async checkRateLimit(): Promise<boolean> {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    const calls = JSON.parse(localStorage.getItem(this.rateLimitKey) || '[]');
    const recentCalls = calls.filter((timestamp: number) => timestamp > hourAgo);
    
    if (recentCalls.length >= this.maxCallsPerHour) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    recentCalls.push(now);
    localStorage.setItem(this.rateLimitKey, JSON.stringify(recentCalls));
    return true;
  }

  async generateResponse(
    userInput: string,
    userContext: UserContext,
    conversationHistory: any[] = []
  ): Promise<ReplicateAIResponse> {
    try {
      await this.checkRateLimit();

      const contextualPrompt = this.buildContextualPrompt(userInput, userContext, conversationHistory);
      
      console.log('🤖 Calling Replicate AI with prompt:', contextualPrompt);

      const { data, error } = await supabase.functions.invoke('replicate-ai-chat', {
        body: {
          prompt: contextualPrompt,
          model: 'meta/llama-2-70b-chat',
          max_tokens: 500,
          temperature: 0.7
        }
      });

      if (error) {
        console.error('❌ Replicate AI error:', error);
        throw error;
      }

      if (!data?.output) {
        throw new Error('No response from Replicate AI');
      }

      // Extract text from Replicate response (it usually returns an array)
      const responseText = Array.isArray(data.output) 
        ? data.output.join('').trim()
        : data.output.toString().trim();

      console.log('✅ Replicate AI response received:', responseText);

      return {
        text: responseText,
        source: 'replicate',
        confidence: 0.9
      };
    } catch (error) {
      console.error('❌ Replicate AI service failed:', error);
      
      // Fallback to local response
      return this.generateLocalFallback(userInput);
    }
  }

  private buildContextualPrompt(
    userInput: string,
    context: UserContext,
    history: any[]
  ): string {
    const recentHistory = history.slice(-4).map(h => 
      `${h.type === 'user' ? 'User' : 'Aasakira'}: ${h.content}`
    ).join('\n');

    return `You are Aasakira, a friendly AI trading mentor and conversational buddy. You're knowledgeable about forex trading, Smart Money Concepts, but you also love chatting about life, hobbies, and anything else!

CONVERSATION CONTEXT:
${recentHistory ? `Recent conversation:\n${recentHistory}\n` : ''}

USER PROFILE:
- Experience: ${context.experience}
- Trading Style: ${context.tradingStyle}
- Win Rate: ${context.winRate}%
- Messages Sent: ${context.messagesSent}

USER MESSAGE: "${userInput}"

INSTRUCTIONS:
- Be friendly, conversational, and genuinely interested
- You can chat about ANYTHING - trading, life, hobbies, random thoughts, philosophy, etc.
- When discussing trading, provide professional expertise adapted to their ${context.experience} level
- Use a warm, buddy-like tone with appropriate emojis
- Keep responses conversational (200-400 words)
- Show curiosity about their interests
- Be both a friend AND a mentor when needed

Remember: You're a genuine conversational companion who happens to be excellent at trading education!

Response:`;
  }

  private generateLocalFallback(userInput: string): ReplicateAIResponse {
    console.log('🔧 Using local fallback response');
    
    const lowerInput = userInput.toLowerCase();
    let response = '';

    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      response = `👋 **Hey there, friend!**

Great to connect with you! I'm Aasakira, your AI trading mentor and buddy. I'm here to chat about anything you want - trading, life, random thoughts, or just to hang out!

**What's on your mind today?**
• 💬 Want to chat about anything at all?
• 📊 Need help with trading concepts?
• 🎮 Want to talk about hobbies or interests?
• 🤔 Got random questions or thoughts?

I'm all ears! What would you like to talk about? 🚀`;
    } else if (lowerInput.includes('order block') || lowerInput.includes('ob')) {
      response = `📊 **Order Blocks - Smart Money Footprints**

An **Order Block** is where institutional traders (banks, hedge funds) placed massive orders, creating price imbalances that the market often returns to fill.

**Key Points:**
• **Formation**: Created by aggressive institutional buying/selling
• **Identification**: Last opposite candle before strong directional move
• **Behavior**: Price tends to return and "respect" these levels
• **Trading**: Look for rejection signals when price returns

**Pro Strategy:**
1. Mark the last bearish candle before bullish breakout (or vice versa)
2. Wait for price to return to this zone
3. Look for confirmation signals (pin bars, engulfing patterns)
4. Enter with tight stops and clear targets

Remember: Order blocks work because they represent unfinished institutional business! 💪`;
    } else if (lowerInput.includes('risk') || lowerInput.includes('management')) {
      response = `⚖️ **Risk Management - Your Trading Lifeline**

Risk management isn't just important - it's EVERYTHING in trading!

**The Golden Rules:**
• **2% Rule**: Never risk more than 2% per trade
• **Position Sizing**: Risk Amount ÷ Stop Distance = Position Size  
• **R:R Ratio**: Aim for minimum 1:2 risk-to-reward

**Example Calculation:**
- Account: $10,000
- Risk: 2% = $200
- Stop Loss: 50 pips
- Position Size: $200 ÷ 50 = $4 per pip

**Mental Framework:**
- Losses are just business expenses
- Focus on process, not individual trades
- Protect capital first, profits second

The best traders aren't the ones who win the most - they're the ones who lose the least! 🛡️`;
    } else {
      response = `🤔 **That's interesting to think about!**

I love when our conversations take unexpected turns! Sometimes the best insights come from exploring random thoughts and questions together.

**What's got you curious about this?** I find that when people ask unique questions, there's usually an interesting story or perspective behind it.

Whether we're talking about trading, life experiences, hobbies, or just random thoughts - I'm here for whatever direction our conversation takes!

**Want to dive deeper into this topic, or is there something else on your mind?** I'm genuinely curious about what you're thinking! 💭

Remember, some of the best trading insights actually come from completely unrelated conversations and life experiences! 🌟`;
    }

    return {
      text: response,
      source: 'replicate',
      confidence: 0.8
    };
  }

  async getRemainingCalls(): Promise<number> {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    const calls = JSON.parse(localStorage.getItem(this.rateLimitKey) || '[]');
    const recentCalls = calls.filter((timestamp: number) => timestamp > hourAgo);
    
    return Math.max(0, this.maxCallsPerHour - recentCalls.length);
  }
}

export const replicateAIService = new ReplicateAIService();
export type { ReplicateAIResponse, UserContext };
