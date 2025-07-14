interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class EnhancedOpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    messages: OpenAIMessage[],
    model: string = 'gpt-4o-mini',
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
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async generateAdvancedAnalysis(
    prompt: string,
    userContext: any = {},
    conversationHistory: OpenAIMessage[] = []
  ): Promise<string> {
    const systemPrompt = `You are Aasakira 2.0, an elite AI trading mentor with institutional-level knowledge. You specialize in:

🧠 **Advanced Trading Concepts:**
- Smart Money Theory & Order Flow
- Market Maker Models (SMT)
- Liquidity Engineering
- Institutional Trading Strategies
- High-Frequency Trading Insights

📊 **Technical Mastery:**
- Advanced Chart Patterns
- Volume Profile Analysis
- Options Flow Interpretation
- Correlation Analysis
- Sentiment Indicators

🎯 **Personalized Teaching:**
- User Level: ${userContext.level || 'Intermediate'}
- Win Rate: ${userContext.winRate || 0}%
- Study Time: ${userContext.studyTime || 0} hours
- Strengths: ${userContext.strengths?.join(', ') || 'None identified'}
- Weaknesses: ${userContext.weaknesses?.join(', ') || 'None identified'}

You remember every conversation and adapt your teaching style to the user's progress. Provide highly detailed, actionable insights that justify your premium AI capabilities.`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-15), // Keep more context for OpenAI
      { role: 'user', content: prompt }
    ];

    return this.generateResponse(messages, 'gpt-4o-mini', 0.8);
  }

  async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `As Aasakira 2.0, analyze this trading chart image. Focus on: ${prompt}. Provide detailed technical analysis with specific entry/exit points, risk management, and educational insights.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI Vision API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not analyze the image.';
    } catch (error) {
      console.error('OpenAI Vision API error:', error);
      throw error;
    }
  }
}

// Create singleton instance
let openaiService: EnhancedOpenAIService | null = null;

export const initializeOpenAIService = (apiKey: string) => {
  openaiService = new EnhancedOpenAIService(apiKey);
};

export const getOpenAIService = (): EnhancedOpenAIService => {
  if (!openaiService) {
    throw new Error('OpenAIService not initialized. Please set API key first.');
  }
  return openaiService;
};