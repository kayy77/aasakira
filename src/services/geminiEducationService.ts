
import { GoogleGenerativeAI } from '@google/generative-ai';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
}

interface ChatResponse {
  message: string;
  timestamp: string;
}

class GeminiEducationService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private conversationHistory: { role: string; parts: string }[] = [];

  constructor() {
    const apiKey = 'AIzaSyBTzQ7uCNpGUoGRzEW8_vF-rgE-J6WVDX8';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      console.log('🤖 Sending message to Gemini:', message);
      
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        parts: message
      });

      const chat = this.model.startChat({
        history: this.conversationHistory.slice(0, -1),
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Gemini response received:', text);

      // Add AI response to history
      this.conversationHistory.push({
        role: 'model',
        parts: text
      });

      return {
        message: text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Gemini API error:', error);
      return {
        message: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
    }
  }

  async explainConcept(concept: string): Promise<string> {
    try {
      const prompt = `Explain the trading concept "${concept}" in simple terms that a beginner can understand. Include practical examples and why it's important for traders to know.`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error explaining concept:', error);
      return `I'm having trouble explaining "${concept}" right now. Please try asking again.`;
    }
  }

  async generateQuiz(userLevel: string = 'beginner', topic: string = 'general'): Promise<QuizQuestion[]> {
    try {
      console.log(`🎯 Generating ${userLevel} quiz for topic: ${topic}`);
      
      const prompt = `Generate 5 unique trading quiz questions for ${userLevel} level on topic: ${topic}. 
      Return ONLY a JSON array with this exact format:
      [
        {
          "question": "What is...",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Detailed explanation...",
          "difficulty": "${userLevel}",
          "topic": "${topic}"
        }
      ]
      
      Make questions progressively harder and cover different aspects of trading like:
      - Technical analysis
      - Risk management  
      - Market psychology
      - Chart patterns
      - Trading strategies
      
      Ensure each question is unique and educational.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📝 Raw quiz response:', text);
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        console.log('✅ Generated quiz questions:', questions);
        return questions;
      }
      
      // Fallback questions
      return this.getFallbackQuestions(userLevel, topic);
    } catch (error) {
      console.error('❌ Quiz generation error:', error);
      return this.getFallbackQuestions(userLevel, topic);
    }
  }

  private getFallbackQuestions(level: string, topic: string): QuizQuestion[] {
    const fallbackQuestions = {
      beginner: [
        {
          question: "What does 'Bull Market' mean?",
          options: ["Market going down", "Market going up", "Flat market", "Volatile market"],
          correctAnswer: 1,
          explanation: "A bull market refers to a period of rising prices and investor optimism.",
          difficulty: 'beginner' as const,
          topic: topic
        },
        {
          question: "What is a 'Stop Loss'?",
          options: ["A profit target", "A risk management tool", "A trading indicator", "A market order"],
          correctAnswer: 1,
          explanation: "A stop loss is used to limit potential losses by automatically closing a position.",
          difficulty: 'beginner' as const,
          topic: topic
        }
      ],
      intermediate: [
        {
          question: "What is the Risk-Reward ratio in trading?",
          options: ["Profit vs Loss", "Risk vs Potential Profit", "Win vs Lose rate", "Entry vs Exit"],
          correctAnswer: 1,
          explanation: "Risk-reward ratio compares potential loss to potential profit in a trade.",
          difficulty: 'intermediate' as const,
          topic: topic
        }
      ],
      advanced: [
        {
          question: "What is algorithmic trading?",
          options: ["Manual trading", "Automated trading systems", "Chart analysis", "News trading"],
          correctAnswer: 1,
          explanation: "Algorithmic trading uses computer programs to execute trades automatically.",
          difficulty: 'advanced' as const,
          topic: topic
        }
      ]
    };

    return fallbackQuestions[level as keyof typeof fallbackQuestions] || fallbackQuestions.beginner;
  }
}

export const geminiEducationService = new GeminiEducationService();
