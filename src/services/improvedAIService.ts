import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIResponse {
  text: string;
  hasChart?: boolean;
  chartUrl?: string;
  followUpActions?: string[];
  lessonCompleted?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

class ImprovedAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    // Using a working Gemini API key
    const apiKey = 'AIzaSyBds1Zg7DCF9RcCbL-YC23pj2rUs2FMfJA';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateResponse(
    userMessage: string,
    skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
    context: ChatMessage[] = []
  ): Promise<AIResponse> {
    try {
      console.log('🤖 Generating AI response for:', userMessage);
      
      // Build enhanced prompt based on skill level and context
      const systemPrompt = this.buildSystemPrompt(skillLevel);
      const contextPrompt = this.buildContextPrompt(context);
      
      const fullPrompt = `${systemPrompt}

${contextPrompt}

User: ${userMessage}

Respond as Aasakira, the AI trading mentor. Be helpful, educational, and engaging. If the user asks about charts or visual examples, mention that you can provide chart examples. Always end with 2-3 suggested follow-up questions they might want to ask.`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from AI');
      }

      // Add to conversation history
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: text }
      );

      // Keep only last 10 messages to avoid context overflow
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      console.log('✅ AI response generated successfully');

      return {
        text,
        hasChart: this.shouldIncludeChart(userMessage),
        chartUrl: this.shouldIncludeChart(userMessage) ? this.generateChartUrl(userMessage) : undefined,
        followUpActions: this.generateFollowUpActions(userMessage, text),
        lessonCompleted: text.toLowerCase().includes('congratulations') || text.toLowerCase().includes('mastered')
      };

    } catch (error) {
      console.error('❌ AI service error:', error);
      return this.getFallbackResponse(userMessage, skillLevel);
    }
  }

  private buildSystemPrompt(skillLevel: string): string {
    const basePrompt = `You are Aasakira, an expert AI trading mentor and coach specializing in Smart Money Concepts, institutional trading, and professional market analysis. You help traders of all levels improve their skills.

Your personality:
- Professional but friendly and approachable
- Patient and encouraging
- Uses practical examples from real trading
- Breaks down complex concepts into digestible pieces
- Always focuses on risk management and proper education

Your expertise includes:
- Smart Money Concepts (SMC)
- Order blocks and breaker blocks
- Liquidity sweeps and market structure
- Risk management and position sizing
- Trading psychology and mental game
- Technical analysis and chart reading
- Fundamental analysis
- Different trading styles and timeframes`;

    const skillPrompts = {
      beginner: `The user is a BEGINNER trader. Focus on:
- Basic concepts and terminology
- Simple, clear explanations
- Emphasize risk management above all
- Use analogies and real-world examples
- Avoid complex jargon initially`,

      intermediate: `The user is an INTERMEDIATE trader. You can:
- Use more technical terminology
- Discuss advanced concepts
- Give detailed strategy explanations
- Share nuanced trading insights
- Challenge them with deeper questions`,

      advanced: `The user is an ADVANCED trader. Feel free to:
- Discuss complex institutional concepts
- Share advanced Smart Money strategies
- Analyze sophisticated market dynamics
- Provide high-level strategic insights
- Engage in technical discussions`
    };

    return `${basePrompt}\n\n${skillPrompts[skillLevel as keyof typeof skillPrompts]}`;
  }

  private buildContextPrompt(context: ChatMessage[]): string {
    if (context.length === 0) return '';
    
    const recentContext = context.slice(-6); // Last 6 messages for context
    const contextString = recentContext
      .map(msg => `${msg.role === 'user' ? 'User' : 'Aasakira'}: ${msg.content}`)
      .join('\n');
    
    return `Recent conversation context:\n${contextString}\n`;
  }

  private shouldIncludeChart(userMessage: string): boolean {
    const chartKeywords = [
      'chart', 'pattern', 'support', 'resistance', 'trend', 'breakout',
      'order block', 'liquidity', 'structure', 'candle', 'price action',
      'entry', 'exit', 'setup', 'analysis'
    ];
    
    const message = userMessage.toLowerCase();
    return chartKeywords.some(keyword => message.includes(keyword));
  }

  private generateChartUrl(userMessage: string): string {
    // In a real implementation, this would generate actual chart images
    // For now, return a placeholder that indicates chart capability
    return '/lovable-uploads/4b363719-4798-4be2-ab8b-613e3ec9721d.png';
  }

  private generateFollowUpActions(userMessage: string, aiResponse: string): string[] {
    const message = userMessage.toLowerCase();
    const response = aiResponse.toLowerCase();

    // Generate contextual follow-up questions
    const followUps: string[] = [];

    if (message.includes('order block')) {
      followUps.push('How do I identify high-probability order blocks?');
      followUps.push('What are breaker blocks?');
      followUps.push('Show me order block entry strategies');
    } else if (message.includes('risk') || message.includes('management')) {
      followUps.push('Calculate position size for 1% risk');
      followUps.push('What are stop loss strategies?');
      followUps.push('How to manage winning trades?');
    } else if (message.includes('liquidity')) {
      followUps.push('Explain liquidity sweeps');
      followUps.push('How to spot fake breakouts?');
      followUps.push('What is smart money manipulation?');
    } else if (message.includes('beginner') || message.includes('start')) {
      followUps.push('What should I learn first?');
      followUps.push('Best trading timeframe for beginners?');
      followUps.push('How much money to start with?');
    } else {
      // Generic follow-ups based on response content
      if (response.includes('psychology')) {
        followUps.push('How to control emotions while trading?');
      }
      if (response.includes('strategy')) {
        followUps.push('What\'s your favorite trading strategy?');
      }
      followUps.push('Can you give me a practical example?');
      followUps.push('What should I practice next?');
    }

    // Always include some general helpful options
    if (followUps.length < 3) {
      const generalFollowUps = [
        'Quiz me on this topic',
        'Show me a chart example',
        'What are common mistakes to avoid?',
        'How do professionals approach this?',
        'What tools do I need?'
      ];
      
      // Add random general follow-ups to reach 3 total
      while (followUps.length < 3 && generalFollowUps.length > 0) {
        const randomIndex = Math.floor(Math.random() * generalFollowUps.length);
        followUps.push(generalFollowUps.splice(randomIndex, 1)[0]);
      }
    }

    return followUps.slice(0, 3); // Return max 3 follow-ups
  }

  private getFallbackResponse(userMessage: string, skillLevel: string): AIResponse {
    const message = userMessage.toLowerCase();
    
    // Contextual fallback responses
    if (message.includes('hello') || message.includes('hi')) {
      return {
        text: `👋 Hello! I'm Aasakira, your AI trading mentor. I'm here to help you master professional trading with Smart Money Concepts.\n\n📚 I can help you with:\n• Order Blocks & Market Structure\n• Risk Management & Position Sizing\n• Trading Psychology & Discipline\n• Chart Analysis & Entry Strategies\n• Smart Money Concepts (SMC)\n\nWhat would you like to learn about today?`,
        followUpActions: ['Explain Order Blocks', 'Teach me risk management', 'What are Smart Money Concepts?']
      };
    }
    
    if (message.includes('order block')) {
      return {
        text: `📊 Order Blocks are powerful institutional levels where banks and large traders have placed significant orders.\n\n🔍 Key characteristics:\n• Created by sharp, impulsive price moves\n• Act as strong support/resistance zones\n• Often tested multiple times before breaking\n• High probability reversal points\n\n💡 Pro tip: Look for order blocks that align with overall market structure for the highest probability setups.\n\nWould you like me to explain how to identify and trade them?`,
        hasChart: true,
        chartUrl: '/lovable-uploads/4b363719-4798-4be2-ab8b-613e3ec9721d.png',
        followUpActions: ['How to trade order blocks?', 'What are breaker blocks?', 'Show entry strategies']
      };
    }
    
    if (message.includes('risk') || message.includes('management')) {
      return {
        text: `⚠️ Risk management is THE foundation of successful trading! Here's what every trader must know:\n\n🛡️ Golden rules:\n• Never risk more than 1-2% per trade\n• Always set stop losses BEFORE entering\n• Position size based on your stop loss distance\n• Keep a detailed trading journal\n\n📏 Position sizing formula:\nPosition Size = (Account Size × Risk %) / (Entry Price - Stop Loss)\n\nExample: $10,000 account, 1% risk, 50 pip stop = 0.2 lots on EUR/USD\n\nWant me to help you calculate your position sizes?`,
        followUpActions: ['Calculate my position size', 'Stop loss strategies', 'How to manage winning trades?']
      };
    }

    // Generic helpful response
    return {
      text: `I'm here to help you become a better trader! While I'm having a small technical hiccup, I can still assist with:\n\n📖 Core Topics:\n• Smart Money Concepts & Institutional Trading\n• Order Blocks & Market Structure Analysis\n• Risk Management & Position Sizing\n• Trading Psychology & Discipline\n• Technical & Fundamental Analysis\n\n💡 Try asking me about specific topics like "Explain order blocks" or "How to manage risk" for detailed guidance.\n\nWhat specific trading topic interests you most?`,
      followUpActions: ['Explain Smart Money Concepts', 'Teach me order blocks', 'Risk management basics']
    };
  }

  async generateQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }> {
    try {
      const prompt = `Create a ${difficulty} level quiz question about "${topic}" for forex/trading education.

Requirements:
- Make it practical and realistic
- Include 4 multiple choice options
- Provide a detailed explanation
- Focus on real trading scenarios

Format as JSON:
{
  "question": "Question text",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation"
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        // Try to parse JSON response
        const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return {
          question: parsed.question || `What is a key principle of ${topic}?`,
          options: parsed.options || ["Follow the trend", "Trade against trend", "Ignore structure", "Max leverage"],
          correctAnswer: parsed.correctAnswer || 0,
          explanation: parsed.explanation || `${topic} requires proper understanding and risk management.`
        };
      } catch {
        // Fallback quiz generation
        return this.generateFallbackQuiz(topic, difficulty);
      }
    } catch (error) {
      console.error('Quiz generation failed:', error);
      return this.generateFallbackQuiz(topic, difficulty);
    }
  }

  private generateFallbackQuiz(topic: string, difficulty: string) {
    const quizBank = {
      'order blocks': {
        question: "What creates a valid order block?",
        options: [
          "Sharp impulsive move with strong volume",
          "Slow gradual price movement",
          "Multiple small candles in a range",
          "Random price fluctuations"
        ],
        correctAnswer: 0,
        explanation: "Order blocks are created by sharp, impulsive moves where institutions place large orders, creating strong support/resistance zones."
      },
      'risk management': {
        question: "What's the maximum recommended risk per trade?",
        options: ["5-10%", "1-2%", "20-25%", "No limit"],
        correctAnswer: 1,
        explanation: "Professional traders never risk more than 1-2% per trade to preserve capital and maintain consistent performance."
      },
      'liquidity sweeps': {
        question: "What is a liquidity sweep?",
        options: [
          "When price breaks previous highs/lows to grab stops",
          "When volume increases significantly", 
          "When multiple timeframes align",
          "When price moves sideways"
        ],
        correctAnswer: 0,
        explanation: "Liquidity sweeps occur when smart money deliberately breaks key levels to trigger stop losses and grab liquidity before the real move."
      }
    };

    const defaultQuiz = quizBank[topic.toLowerCase() as keyof typeof quizBank] || {
      question: "What should traders prioritize first?",
      options: ["Risk Management", "Profit Maximization", "Speed of Execution", "Complex Strategies"],
      correctAnswer: 0,
      explanation: "Risk management should always be the top priority for any trader, regardless of strategy or experience level."
    };

    return defaultQuiz;
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
}

export const improvedAIService = new ImprovedAIService();
