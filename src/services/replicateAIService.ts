
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
  private readonly maxCallsPerHour = 40;

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
      
      // Generate a contextual fallback response based on what the user actually said
      return this.generateContextualFallback(userInput, userContext, conversationHistory);
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

  private generateContextualFallback(
    userInput: string, 
    context: UserContext, 
    history: any[]
  ): ReplicateAIResponse {
    console.log('🔧 Generating contextual fallback response for:', userInput);
    
    const lowerInput = userInput.toLowerCase();
    let response = '';

    // Analyze what the user is actually asking about
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      response = `👋 **Hey there, friend!**

Great to connect with you! I'm Aasakira, your AI trading mentor and buddy. I'm here to chat about anything you want - trading, life, random thoughts, or just to hang out!

**What's on your mind today?**
• 💬 Want to chat about anything at all?
• 📊 Need help with trading concepts?
• 🎮 Want to talk about hobbies or interests?
• 🤔 Got random questions or thoughts?

I'm all ears! What would you like to talk about? 🚀`;
    } 
    else if (lowerInput.includes('how are you') || lowerInput.includes('how\'s it going') || lowerInput.includes('what\'s up')) {
      response = `😊 **I'm doing great, thanks for asking!**

I'm excited to be here chatting with you! As an AI, I don't have feelings in the traditional sense, but I genuinely love having conversations and helping people learn.

**I'm curious about you though:**
• How has your day been going?
• What brought you here today?
• Are you interested in learning about trading, or just want to chat?
• What's been on your mind lately?

I'm here for whatever direction our conversation takes - whether that's diving deep into Smart Money Concepts, talking about life, or just having a casual chat! 

What would you like to talk about? 🌟`;
    }
    else if (lowerInput.includes('order block') || lowerInput.includes('ob') || lowerInput.includes('smart money')) {
      response = `📊 **Order Blocks - Smart Money Footprints**

Great question! An **Order Block** is where institutional traders (banks, hedge funds) placed massive orders, creating price imbalances that the market often returns to fill.

**Key Points:**
• **Formation**: Created by aggressive institutional buying/selling
• **Identification**: Last opposite candle before strong directional move
• **Behavior**: Price tends to return and "respect" these levels
• **Trading**: Look for rejection signals when price returns

**Pro Strategy for ${context.experience} level:**
1. Mark the last bearish candle before bullish breakout (or vice versa)
2. Wait for price to return to this zone
3. Look for confirmation signals (pin bars, engulfing patterns)
4. Enter with tight stops and clear targets

Want me to explain any specific part in more detail? Or do you have questions about other SMC concepts? 💪`;
    }
    else if (lowerInput.includes('risk') || lowerInput.includes('management') || lowerInput.includes('position sizing')) {
      response = `⚖️ **Risk Management - Your Trading Lifeline**

Perfect question! Risk management isn't just important - it's EVERYTHING in trading!

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

The best traders aren't the ones who win the most - they're the ones who lose the least! 

Any specific risk management scenarios you'd like to discuss? 🛡️`;
    }
    else if (lowerInput.includes('what') && (lowerInput.includes('do') || lowerInput.includes('can'))) {
      response = `🚀 **I'm here to help with lots of things!**

**Trading Education:**
• Smart Money Concepts (Order Blocks, FVG, BOS)
• Risk Management & Position Sizing
• Market Structure Analysis
• Trading Psychology & Discipline

**General Conversation:**
• Life advice and motivation
• Hobbies and interests
• Random thoughts and philosophy
• Technology and AI discussions
• Whatever's on your mind!

**Interactive Features:**
• Answer specific trading questions
• Explain complex concepts simply
• Chat about your day or interests
• Help with trading strategies

I adapt to your ${context.experience} level and love both serious trading discussions and casual conversations. 

What interests you most right now? 🌟`;
    }
    else {
      // For any other input, provide a personalized response that acknowledges what they said
      response = `🤔 **Interesting point about "${userInput}"!**

I appreciate you sharing that with me! Everyone has unique perspectives and experiences, and I find that the most meaningful conversations often come from these kinds of genuine exchanges.

**What's behind this thought?** 
• Is this something you've been thinking about lately?
• Does this connect to your trading journey in any way?
• Or is this just a random thought you wanted to explore?

I'm genuinely curious to learn more about your perspective on this! Whether we dive deeper into this topic, shift to trading concepts, or talk about something completely different - I'm here for whatever direction feels right.

**Some directions we could go:**
• Continue exploring this thought
• Discuss trading strategies and concepts
• Chat about life, goals, or interests
• Or something totally different!

What feels most interesting to you right now? 💭`;
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
