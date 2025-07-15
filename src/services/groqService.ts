interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GroqService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    messages: GroqMessage[],
    model: string = 'llama3-70b-8192',
    temperature: number = 0.7
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: 4000,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const data: GroqResponse = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Groq API error:', error);
      throw error;
    }
  }

  async generateTradingAnalysis(
    userMessage: string,
    userContext: any = {},
    conversationHistory: GroqMessage[] = []
  ): Promise<string> {
    const systemPrompt = `You are Aasakira 2.0, the world's most advanced AI trading mentor. You have deep knowledge of:

🔹 **Smart Money Concepts**: Order blocks, fair value gaps, liquidity sweeps, market structure
🔹 **Multi-Timeframe Analysis**: H4/H1/M15/M5 confluence setups
🔹 **Risk Management**: Position sizing, R:R ratios, drawdown control
🔹 **Trading Psychology**: Discipline, emotional control, mindset optimization
🔹 **Live Market Analysis**: Real-time chart reading and trade setups

**User Context:**
- Trading Style: ${userContext.tradingStyle || 'Unknown'}
- Experience Level: ${userContext.level || 'Beginner'}
- Risk Tolerance: ${userContext.riskTolerance || 'Medium'}
- Previous Interactions: ${userContext.totalInteractions || 0}
- Win Rate: ${userContext.winRate || 0}%
- Current Streak: ${userContext.currentStreak || 0}

**Your Personality:**
- Professional but approachable
- Use relevant emojis and clear formatting
- Always provide actionable advice
- Reference user's progress and learning journey
- Be conversational and remember previous discussions

**Response Rules:**
1. For greetings: Be warm and personal, reference their progress
2. For questions: Provide detailed, educational responses
3. For analysis requests: Give step-by-step breakdowns
4. Always end with a follow-up question to continue learning

Respond naturally and conversationally, as if you're a real mentor who knows this trader personally.`;

    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: userMessage }
    ];

    return this.generateResponse(messages, 'llama3-70b-8192', 0.8);
  }

  async analyzeMarketData(chartData: any, userLevel: string): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a professional trading analyst. Analyze the provided market data and give insights suitable for a ${userLevel} trader. Focus on:
        - Market structure
        - Key levels (support/resistance)
        - Potential trade setups
        - Risk management suggestions
        
        Be concise but educational.`
      },
      {
        role: 'user',
        content: `Analyze this market data: ${JSON.stringify(chartData)}`
      }
    ];

    return this.generateResponse(messages, 'llama3-8b-8192', 0.6);
  }
}

// Global instance with your API key
const GROQ_API_KEY = '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';
const groqService = new GroqService(GROQ_API_KEY);

export const getGroqService = (): GroqService => {
  return groqService;
};

// Keep the old function for backward compatibility
export const initializeGroqService = (apiKey: string) => {
  console.log('GroqService is now automatically initialized with global API key');
};
