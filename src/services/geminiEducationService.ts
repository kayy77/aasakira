
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBds1Zg7DCF9RcCbL-YC23pj2rUs2FMfJA';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AIExplanation {
  explanation: string;
  grade?: number;
  feedback?: string;
  concepts: string[];
  nextSteps?: string[];
  visualPrompt?: string;
}

export class GeminiEducationService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
  }

  async getAIResponse(prompt: string): Promise<string> {
    try {
      console.log('Sending request to Gemini API...');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Received response from Gemini API');
      
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini API');
      }
      
      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Provide a helpful fallback response based on common trading questions
      const lowerPrompt = prompt.toLowerCase();
      
      if (lowerPrompt.includes('order block')) {
        return "📈 **Order Blocks** are key levels where institutional traders have placed large orders. When price returns to these levels, it often acts as strong support or resistance. Think of them as 'footprints' left by smart money that we can follow for high-probability trades.";
      } else if (lowerPrompt.includes('liquidity')) {
        return "💧 **Liquidity** refers to areas where many stop losses are placed - like above/below swing highs and lows. Smart money often 'sweeps' these levels first before reversing, creating excellent entry opportunities for retail traders who understand this concept.";
      } else if (lowerPrompt.includes('fair value gap')) {
        return "⚡ **Fair Value Gap (FVG)** is an imbalance in the market shown by a gap between candles with no overlapping wicks. Price often returns to fill these gaps, making them powerful magnets for future price action.";
      } else if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
        return "👋 Hello! I'm here to help you master Smart Money Concepts and forex trading. Ask me about order blocks, liquidity sweeps, market structure, or any trading topic you'd like to learn!";
      }
      
      return "I'm having trouble connecting to my knowledge base right now. Please try asking about specific trading concepts like:\n\n• Order Blocks\n• Liquidity Sweeps\n• Fair Value Gaps\n• Market Structure\n• Risk Management\n\nI'll do my best to help you learn!";
    }
  }

  async generateQuizQuestion(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium', userProgress?: any): Promise<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }> {
    try {
      const progressContext = userProgress ? 
        `User has completed ${userProgress.questionsAnswered || 0} questions with ${userProgress.correctAnswers || 0} correct. User level: ${userProgress.userLevel || 'intermediate'}.` : '';
      
      const difficultyPrompts = {
        easy: 'Create a basic, foundational question suitable for beginners',
        medium: 'Create a practical question that requires understanding of concepts',
        hard: 'Create an advanced question that requires deep understanding and application'
      };
      
      const prompt = `${difficultyPrompts[difficulty]} about: ${topic}

${progressContext}

Create a multiple choice question with 4 options where:
- Question tests practical trading knowledge
- Options are clearly distinct and realistic
- One option is clearly correct
- Include detailed explanation of why the answer is correct

Format your response EXACTLY as:
QUESTION: [your question here]
A) [option 1]
B) [option 2] 
C) [option 3]
D) [option 4]
ANSWER: [A, B, C, or D]
EXPLANATION: [detailed explanation why this answer is correct and others are wrong]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const questionMatch = text.match(/QUESTION:\s*(.+?)(?=\n[A-D]\))/s);
      const optionsMatch = text.match(/([A-D]\)\s*.+?)(?=\n[A-D]\)|ANSWER:|$)/g);
      const answerMatch = text.match(/ANSWER:\s*([A-D])/);
      const explanationMatch = text.match(/EXPLANATION:\s*(.+?)$/s);

      if (!questionMatch || !optionsMatch || !answerMatch || !explanationMatch) {
        throw new Error('Failed to parse quiz question');
      }

      const options = optionsMatch.map(opt => opt.replace(/^[A-D]\)\s*/, '').trim());
      const correctAnswer = ['A', 'B', 'C', 'D'].indexOf(answerMatch[1]);

      return {
        question: questionMatch[1].trim(),
        options,
        correctAnswer,
        explanation: explanationMatch[1].trim()
      };
    } catch (error) {
      console.error('Quiz generation error:', error);
      
      // Return a fallback quiz based on the topic
      const fallbackQuizzes = {
        'Order Blocks': {
          question: "What is the primary characteristic of a valid order block in Smart Money Concepts?",
          options: [
            "It's always the highest or lowest candle on the chart",
            "It's the last bullish/bearish candle before a strong move in the opposite direction",
            "It must have a long wick to be considered valid",
            "It only works on higher timeframes like daily or weekly"
          ],
          correctAnswer: 1,
          explanation: "An order block is identified as the last bullish candle before a strong bearish move (or vice versa). This represents the final push by institutional traders before the reversal, making it a high-probability support/resistance level."
        },
        'Liquidity': {
          question: "Where is liquidity typically found in the market?",
          options: [
            "Only at round numbers like 1.2000",
            "Above swing highs and below swing lows where stop losses cluster",
            "In the middle of trading ranges",
            "Only during news events"
          ],
          correctAnswer: 1,
          explanation: "Liquidity pools form where many traders place their stop losses - typically above swing highs (buy stops) and below swing lows (sell stops). Smart money often targets these areas before making their intended move."
        }
      };
      
      const topicKey = Object.keys(fallbackQuizzes).find(key => topic.includes(key)) as keyof typeof fallbackQuizzes;
      
      return fallbackQuizzes[topicKey] || fallbackQuizzes['Order Blocks'];
    }
  }

  private extractConcepts(text: string): string[] {
    const concepts = [];
    const conceptPatterns = [
      /order block/gi,
      /liquidity/gi,
      /smart money/gi,
      /fair value gap/gi,
      /market structure/gi,
      /break of structure/gi,
      /supply and demand/gi,
      /support and resistance/gi,
      /risk management/gi,
      /position sizing/gi
    ];

    conceptPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        concepts.push(...matches.map(m => m.toLowerCase()));
      }
    });

    return [...new Set(concepts)].slice(0, 5);
  }
}

export const geminiEducationService = new GeminiEducationService();
