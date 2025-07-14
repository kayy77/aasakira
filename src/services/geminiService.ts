
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBds1Zg7DCF9RcCbL-YC23pj2rUs2FMfJA';
const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateTradingResponse(userMessage: string): Promise<string> {
    try {
      // Enhanced system prompt for better personality
      const systemPrompt = `You are Aasakira, a highly experienced Smart Money Concept forex coach and trading mentor. 

You have years of experience in institutional trading and specialize in:
- Smart Money Concepts (SMC)
- Order blocks and breaker blocks
- Liquidity sweeps and market structure
- Risk management and position sizing
- Trading psychology and discipline

Always respond in a conversational, educational tone like a real trading mentor would. Give clear, practical examples and break down complex concepts into digestible pieces. Use emojis sparingly but effectively to make your responses engaging.

If someone just says "hi" or "hello", greet them warmly and ask what specific trading topic they'd like help with today.

User message: ${userMessage}`;

      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Check if we got a valid response
      if (!text || text.trim().length === 0) {
        return this.getFallbackResponse(userMessage);
      }
      
      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Handle common greetings
    if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
      return "👋 Hello! I'm Aasakira, your AI trading mentor. I'm here to help you master forex trading with Smart Money Concepts. What would you like to learn about today?\n\n📚 Popular topics:\n• Order Blocks & Breaker Blocks\n• Liquidity Sweeps\n• Market Structure\n• Risk Management\n• Trading Psychology\n\nWhat interests you most?";
    }
    
    // Handle trading-related keywords
    if (message.includes('order block') || message.includes('orderblock')) {
      return "📊 Order Blocks are key institutional levels where banks and large traders have placed significant orders. They act as strong support/resistance zones.\n\n🔍 Key characteristics:\n• Created by sharp price moves\n• Often tested multiple times\n• Break with high volume when violated\n\nWould you like me to explain how to identify and trade them?";
    }
    
    if (message.includes('liquidity') || message.includes('sweep')) {
      return "💧 Liquidity sweeps are when smart money deliberately takes out retail stop losses to grab liquidity before making their real move.\n\n🎯 What to watch for:\n• Price spikes above/below key levels\n• Quick reversal after the sweep\n• Volume confirmation\n\nThis creates excellent entry opportunities! Want to learn the specific strategy?";
    }
    
    if (message.includes('risk') || message.includes('management')) {
      return "⚠️ Risk management is THE most important aspect of trading! Even the best strategy fails without proper risk control.\n\n🛡️ Golden rules:\n• Never risk more than 1-2% per trade\n• Always set stop losses\n• Plan your exit before entering\n• Keep a trading journal\n\nWant me to help you calculate proper position sizes?";
    }
    
    // Generic fallback
    return "🤖 I'm temporarily having trouble with my AI processing, but I'm still here to help! \n\n📖 I can assist with:\n• Smart Money Concepts\n• Technical Analysis\n• Risk Management\n• Trading Psychology\n• Market Structure\n\nTry asking me about any of these topics, or be more specific about what you'd like to learn. I'm designed to be your personal trading mentor!";
  }

  async generatePersonalizedLearningPath(userLevel: string, interests: string[]): Promise<string> {
    try {
      const prompt = `Create a personalized trading learning path for a ${userLevel} trader interested in: ${interests.join(', ')}.

As Aasakira, their AI trading mentor, provide a structured learning plan with:
1. Foundation concepts they should master first
2. Intermediate topics to explore next  
3. Advanced concepts for later study
4. Recommended practice exercises
5. Key resources and tools

Format the response with clear sections and actionable steps. Be encouraging and specific.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return "I'm having trouble generating your personalized learning path right now, but here's what I recommend:\n\n📚 **Start with fundamentals:**\n• Understanding market structure\n• Basic support and resistance\n• Risk management principles\n\n🎯 **Then progress to:**\n• Smart Money Concepts\n• Order block identification\n• Liquidity analysis\n\nWould you like me to dive deeper into any of these areas?";
    }
  }

  async analyzeMarketScenario(scenario: string): Promise<string> {
    try {
      const prompt = `As Aasakira, an expert trading mentor, analyze this market scenario and provide educational insights:

Scenario: ${scenario}

Provide:
1. Technical analysis of the situation
2. Potential trading opportunities and risks
3. Risk management considerations
4. What a professional trader would consider
5. Learning points for educational purposes

Focus on education rather than specific trading advice. Be practical and actionable.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return "I'm having trouble analyzing that scenario right now, but I can still help! Try breaking down your question into specific aspects:\n\n🔍 **Technical Analysis**\n🎯 **Risk Assessment**\n📊 **Market Structure**\n💡 **Entry/Exit Strategy**\n\nWhich area would you like to focus on first?";
    }
  }
}

export const geminiService = new GeminiService();
