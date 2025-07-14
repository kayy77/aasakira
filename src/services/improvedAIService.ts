
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  text: string;
  hasChart?: boolean;
  chartUrl?: string;
  followUpActions?: string[];
  lessonCompleted?: boolean;
}

export interface QuizData {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

class ImprovedAIService {
  private readonly GEMINI_API_KEY = 'AIzaSyBds1Zg7DCF9RcCbL-YC23pj2rUs2FMfJA';
  private readonly GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  async generateResponse(
    userMessage: string,
    skillLevel: 'beginner' | 'intermediate' | 'advanced',
    chatHistory: ChatMessage[] = []
  ): Promise<AIResponse> {
    try {
      console.log('🤖 Generating AI response for:', userMessage);
      
      // Build context-aware prompt
      const systemPrompt = this.buildSystemPrompt(skillLevel);
      const contextualPrompt = this.buildContextualPrompt(userMessage, chatHistory, skillLevel);
      
      const response = await fetch(`${this.GEMINI_URL}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\n${contextualPrompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        console.error('Gemini API error:', response.status, await response.text());
        throw new Error(`Gemini API failed: ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I'm having trouble responding right now. Please try again.";

      console.log('✅ AI response generated successfully');

      return {
        text: aiText,
        hasChart: this.shouldIncludeChart(userMessage),
        followUpActions: this.generateFollowUpActions(userMessage, skillLevel),
        lessonCompleted: this.checkLessonCompletion(userMessage, aiText)
      };

    } catch (error) {
      console.error('❌ AI service error:', error);
      
      // Enhanced fallback responses based on user message
      const fallbackResponse = this.getFallbackResponse(userMessage, skillLevel);
      
      return {
        text: fallbackResponse,
        hasChart: false,
        followUpActions: ['Try again', 'Ask a different question', 'Get help'],
        lessonCompleted: false
      };
    }
  }

  async generateQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<QuizData> {
    try {
      const prompt = this.buildQuizPrompt(topic, difficulty);
      
      const response = await fetch(`${this.GEMINI_URL}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Quiz generation failed');
      }

      const data = await response.json();
      const quizText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return this.parseQuizResponse(quizText, topic);

    } catch (error) {
      console.error('Quiz generation error:', error);
      return this.getFallbackQuiz(topic, difficulty);
    }
  }

  private buildSystemPrompt(skillLevel: string): string {
    return `You are Aasakira, an expert AI trading mentor specializing in Smart Money Concepts, institutional trading, and professional market analysis. 

Your personality:
- Professional yet approachable
- Passionate about teaching proper trading psychology
- Expert in SMC, order blocks, liquidity concepts
- Always provide actionable advice
- Encourage continuous learning

Skill level context: ${skillLevel}
- Beginner: Use simple terms, explain basics thoroughly
- Intermediate: Assume some knowledge, dive deeper into concepts  
- Advanced: Use technical terminology, focus on advanced strategies

Always:
- Provide specific, actionable advice
- Use real trading examples when possible
- Encourage good risk management (never risk more than 1-2% per trade)
- Explain the "why" behind concepts
- Be encouraging but realistic about trading challenges`;
  }

  private buildContextualPrompt(userMessage: string, chatHistory: ChatMessage[], skillLevel: string): string {
    let contextPrompt = `User's current question: "${userMessage}"\n\n`;
    
    if (chatHistory.length > 0) {
      contextPrompt += "Recent conversation context:\n";
      chatHistory.slice(-3).forEach(msg => {
        contextPrompt += `${msg.role}: ${msg.content.substring(0, 100)}...\n`;
      });
      contextPrompt += "\n";
    }
    
    contextPrompt += `Please provide a helpful, educational response about trading/forex for a ${skillLevel} level trader. Include specific examples and actionable advice.`;
    
    return contextPrompt;
  }

  private buildQuizPrompt(topic: string, difficulty: string): string {
    return `Create a ${difficulty} level quiz question about ${topic} in trading/forex.

Format your response as JSON:
{
  "question": "Your question here",
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation of why this is correct"
}

Topic: ${topic}
Difficulty: ${difficulty}

Make it practical and educational.`;
  }

  private parseQuizResponse(quizText: string, topic: string): QuizData {
    try {
      // Try to extract JSON from the response
      const jsonMatch = quizText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const quizData = JSON.parse(jsonMatch[0]);
        return {
          question: quizData.question,
          options: quizData.options,
          correctAnswer: quizData.correctAnswer,
          explanation: quizData.explanation
        };
      }
    } catch (error) {
      console.error('Quiz parsing error:', error);
    }
    
    return this.getFallbackQuiz(topic, 'medium');
  }

  private getFallbackResponse(userMessage: string, skillLevel: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('order block')) {
      return `📊 **Order Blocks Explained**\n\nOrder blocks are areas where institutional traders (banks, hedge funds) have placed large orders. These create supply and demand zones that often cause price to react.\n\n**Key Points:**\n• Look for areas where price moved away aggressively\n• Often found before significant moves\n• Price tends to return to test these levels\n• Use them as entry points with proper risk management\n\n**${skillLevel} Tip:** ${skillLevel === 'beginner' ? 'Start by identifying obvious order blocks on higher timeframes (H4, Daily)' : skillLevel === 'intermediate' ? 'Combine order blocks with market structure for better entries' : 'Look for institutional order blocks that align with smart money concepts and liquidity sweeps'}`;
    }
    
    if (message.includes('risk') || message.includes('management')) {
      return `⚠️ **Risk Management Fundamentals**\n\nRisk management is THE most important aspect of trading. Here's what you need to know:\n\n**Golden Rules:**\n• Never risk more than 1-2% of your account per trade\n• Always set stop losses BEFORE entering\n• Position size based on your stop loss distance\n• Keep a trading journal to track performance\n\n**Position Sizing Formula:**\nAccount Size × Risk% ÷ Stop Loss Distance = Position Size\n\nExample: $10,000 account, 1% risk, 50 pip SL = $100 ÷ 50 pips = $2 per pip`;
    }
    
    if (message.includes('smart money') || message.includes('smc')) {
      return `🧠 **Smart Money Concepts (SMC)**\n\nSMC is about understanding how institutional traders move the market:\n\n**Core Concepts:**\n• Market Structure (Higher Highs/Lower Lows)\n• Liquidity Sweeps (taking out stops)\n• Order Blocks (institutional supply/demand)\n• Fair Value Gaps (imbalances)\n• Break of Structure (trend changes)\n\n**The Smart Money Process:**\n1. Accumulate positions quietly\n2. Manipulate price to trigger retail stops\n3. Distribute/Re-accumulate at better prices\n4. Let the real move begin\n\nUnderstanding this helps you trade WITH the institutions, not against them.`;
    }
    
    return `Hi! I'm Aasakira, your AI trading mentor. I specialize in Smart Money Concepts, risk management, and professional trading techniques.\n\n**I can help you with:**\n• Order Blocks & Market Structure\n• Risk Management & Position Sizing\n• Trading Psychology & Discipline\n• Smart Money Concepts (SMC)\n• Chart Analysis & Pattern Recognition\n\n**Quick Tips for ${skillLevel} traders:**\n${skillLevel === 'beginner' ? '• Focus on learning one strategy well\n• Practice risk management religiously\n• Keep a trading journal' : skillLevel === 'intermediate' ? '• Combine multiple confirmations\n• Work on trading psychology\n• Develop your own trading plan' : '• Focus on high-probability setups\n• Refine your edge and backtest\n• Consider advanced concepts like market microstructure'}\n\nWhat specific trading topic would you like to explore?`;
  }

  private getFallbackQuiz(topic: string, difficulty: string): QuizData {
    const quizzes = {
      'order blocks': {
        question: "What is an Order Block in Smart Money Concepts?",
        options: [
          "A) A area where institutions placed large orders",
          "B) A technical indicator",
          "C) A chart pattern",
          "D) A news event"
        ],
        correctAnswer: 0,
        explanation: "Order blocks are areas where institutional traders have placed significant orders, creating supply/demand zones that price often reacts to when retested."
      },
      'risk management': {
        question: "What is the recommended maximum risk per trade?",
        options: [
          "A) 5-10% of account",
          "B) 1-2% of account", 
          "C) 15-20% of account",
          "D) 50% of account"
        ],
        correctAnswer: 1,
        explanation: "Professional traders typically risk only 1-2% of their account per trade to preserve capital and allow for inevitable losing streaks."
      },
      'smart money': {
        question: "What does 'liquidity sweep' mean in Smart Money Concepts?",
        options: [
          "A) Cleaning the trading floor",
          "B) Taking out retail stop losses before reversing",
          "C) Increasing trading volume",
          "D) A type of order"
        ],
        correctAnswer: 1,
        explanation: "A liquidity sweep occurs when smart money pushes price to trigger retail stop losses, creating liquidity for their larger positions before the real move begins."
      }
    };

    return quizzes[topic as keyof typeof quizzes] || quizzes['risk management'];
  }

  private shouldIncludeChart(userMessage: string): boolean {
    const chartKeywords = ['chart', 'pattern', 'structure', 'support', 'resistance', 'order block', 'break', 'trend'];
    return chartKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
  }

  private generateFollowUpActions(userMessage: string, skillLevel: string): string[] {
    const message = userMessage.toLowerCase();
    
    if (message.includes('order block')) {
      return ['Show me examples', 'How to identify them', 'Trading strategies with order blocks'];
    }
    
    if (message.includes('risk')) {
      return ['Position sizing calculator', 'Stop loss strategies', 'Risk/reward ratios'];
    }
    
    if (message.includes('smart money')) {
      return ['Market structure basics', 'Liquidity concepts', 'Institutional trading'];
    }
    
    return ['Ask another question', 'Take a quiz', 'Learn about order blocks', 'Risk management tips'];
  }

  private checkLessonCompletion(userMessage: string, aiResponse: string): boolean {
    // Simple heuristic - could be made more sophisticated
    return aiResponse.length > 500 && userMessage.toLowerCase().includes('explain');
  }
}

export const improvedAIService = new ImprovedAIService();
