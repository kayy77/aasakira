
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
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async getAIResponse(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  }

  async explainConcept(concept: string, userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<AIExplanation> {
    try {
      const prompt = `You are Aasakira, an expert forex trading mentor specializing in Smart Money Concepts. 

A ${userLevel} trader wants to understand: "${concept}"

Provide a clear, practical explanation that includes:
1. Simple definition in plain English
2. How it works in real trading
3. Visual example or scenario
4. Common mistakes to avoid
5. How professional traders use this

Keep it engaging and practical. Use emojis where appropriate.

Also suggest a visual prompt for chart generation at the end starting with "VISUAL:"`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const visualMatch = text.match(/VISUAL:\s*(.+?)(?:\n|$)/i);
      const visualPrompt = visualMatch ? visualMatch[1].trim() : null;
      const cleanText = text.replace(/VISUAL:\s*.+/i, '').trim();

      return {
        explanation: cleanText,
        concepts: this.extractConcepts(text),
        visualPrompt: visualPrompt || undefined
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        explanation: "I'm having trouble connecting to my knowledge base right now. Please try asking about specific trading concepts like order blocks, liquidity sweeps, or market structure.",
        concepts: []
      };
    }
  }

  async gradeTradeAnalysis(
    entry: number, 
    stopLoss: number, 
    takeProfit: number, 
    reasoning: string,
    chartContext?: string
  ): Promise<AIExplanation> {
    try {
      const riskReward = Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss);
      
      const prompt = `You are Aasakira, a professional forex trading mentor. Grade this trade analysis:

TRADE SETUP:
- Entry: ${entry}
- Stop Loss: ${stopLoss}
- Take Profit: ${takeProfit}
- Risk/Reward Ratio: ${riskReward.toFixed(2)}:1
- Trader's Reasoning: "${reasoning}"
${chartContext ? `- Chart Context: ${chartContext}` : ''}

Provide:
1. Grade (1-10) with explanation
2. What they did well
3. What could be improved
4. Smart Money Concepts analysis
5. Risk management assessment

Be encouraging but honest. Focus on education.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const gradeMatch = text.match(/(?:grade|score).*?(\d+(?:\.\d+)?)/i);
      const grade = gradeMatch ? parseFloat(gradeMatch[1]) : undefined;

      return {
        explanation: text,
        grade,
        concepts: this.extractConcepts(text)
      };
    } catch (error) {
      console.error('Gemini grading error:', error);
      return {
        explanation: "Unable to analyze your trade right now. Make sure your entry, stop loss, and take profit levels make sense with current market structure.",
        concepts: []
      };
    }
  }

  async generateQuizQuestion(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium', userProgress?: any): Promise<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    visualPrompt?: string;
  }> {
    try {
      const progressContext = userProgress ? `User has completed ${userProgress.questionsAnswered || 0} questions with ${userProgress.correctAnswers || 0} correct.` : '';
      
      const prompt = `Create a ${difficulty} forex trading quiz question about: ${topic}

${progressContext}

Make it practical and relevant to real trading. Avoid repetitive questions.

Format your response as:
QUESTION: [the question]
A) [option 1]
B) [option 2] 
C) [option 3]
D) [option 4]
ANSWER: [A, B, C, or D]
EXPLANATION: [detailed explanation]
VISUAL: [chart scenario description for image generation]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const questionMatch = text.match(/QUESTION:\s*(.+?)(?=\n[A-D]\))/s);
      const optionsMatch = text.match(/([A-D]\)\s*.+?)(?=\n[A-D]\)|ANSWER:|$)/g);
      const answerMatch = text.match(/ANSWER:\s*([A-D])/);
      const explanationMatch = text.match(/EXPLANATION:\s*(.+?)(?=VISUAL:|$)/s);
      const visualMatch = text.match(/VISUAL:\s*(.+?)$/s);

      if (!questionMatch || !optionsMatch || !answerMatch || !explanationMatch) {
        throw new Error('Failed to parse quiz question');
      }

      const options = optionsMatch.map(opt => opt.replace(/^[A-D]\)\s*/, '').trim());
      const correctAnswer = ['A', 'B', 'C', 'D'].indexOf(answerMatch[1]);

      return {
        question: questionMatch[1].trim(),
        options,
        correctAnswer,
        explanation: explanationMatch[1].trim(),
        visualPrompt: visualMatch ? visualMatch[1].trim() : undefined
      };
    } catch (error) {
      console.error('Quiz generation error:', error);
      return {
        question: "What is the primary purpose of a stop loss in trading?",
        options: [
          "To guarantee profits",
          "To limit potential losses", 
          "To increase position size",
          "To predict market direction"
        ],
        correctAnswer: 1,
        explanation: "A stop loss is a risk management tool designed to limit potential losses by automatically closing a position when price moves against you."
      };
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
