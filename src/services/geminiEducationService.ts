
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIExplanation {
  explanation: string;
  visualPrompt: string;
  concepts: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

class GeminiEducationService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    // Using a public demo key - in production, this should be handled via Supabase Edge Functions
    const apiKey = 'AIzaSyDdI0hCZtE6vIWnG02_-3StdDOHiE4iUuY';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async getAIResponse(prompt: string): Promise<string> {
    try {
      console.log('🤖 Sending prompt to Gemini:', prompt);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini response received:', text.substring(0, 100) + '...');
      return text;
    } catch (error) {
      console.error('❌ Gemini API error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  async explainConcept(concept: string, userLevel: string = 'intermediate'): Promise<AIExplanation> {
    const prompt = `Explain the trading concept "${concept}" for a ${userLevel} trader. 
    
    Provide:
    1. A clear, practical explanation
    2. Real trading examples
    3. Key concepts to remember
    
    Format your response as a JSON object with:
    - explanation: detailed explanation
    - visualPrompt: description for a chart visualization
    - concepts: array of key concepts
    
    Keep it practical and actionable.`;

    try {
      const response = await this.getAIResponse(prompt);
      
      // Try to parse as JSON, fallback to structured response
      try {
        return JSON.parse(response);
      } catch {
        return {
          explanation: response,
          visualPrompt: `Chart showing ${concept} in action`,
          concepts: [concept, 'Risk Management', 'Entry Strategy']
        };
      }
    } catch (error) {
      console.error('Failed to explain concept:', error);
      return {
        explanation: `${concept} is an important trading concept that requires proper understanding and practice.`,
        visualPrompt: `Basic chart example of ${concept}`,
        concepts: [concept]
      };
    }
  }

  async generateQuizQuestion(
    topic: string, 
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    context?: any
  ): Promise<QuizQuestion> {
    const prompt = `Create a ${difficulty} level quiz question about "${topic}" for forex traders.

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

    try {
      const response = await this.getAIResponse(prompt);
      
      try {
        const parsed = JSON.parse(response);
        return {
          question: parsed.question || "What is the most important factor in forex trading?",
          options: parsed.options || ["Risk Management", "Indicators", "Leverage", "News"],
          correctAnswer: parsed.correctAnswer || 0,
          explanation: parsed.explanation || "Risk management is fundamental to long-term trading success."
        };
      } catch {
        // Fallback question
        return {
          question: `What is a key principle of ${topic}?`,
          options: [
            "Follow the trend",
            "Trade against the trend", 
            "Ignore market structure",
            "Use maximum leverage"
          ],
          correctAnswer: 0,
          explanation: "Following the trend is a fundamental principle in trading that aligns with market momentum."
        };
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      return {
        question: "What should traders prioritize first?",
        options: ["Risk Management", "Profit", "Speed", "Complexity"],
        correctAnswer: 0,
        explanation: "Risk management should always be the top priority for any trader."
      };
    }
  }
}

export const geminiEducationService = new GeminiEducationService();
