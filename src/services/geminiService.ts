
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
      const prompt = `You are Aasakira 2.0, an expert AI trading mentor. You specialize in forex trading, technical analysis, risk management, and trading psychology. 

User question: ${userMessage}

Provide a comprehensive, educational response that helps the user learn and improve their trading skills. Use emojis and clear formatting to make the response engaging and easy to read. Focus on practical, actionable advice.

If the user asks about:
- Forex basics: Explain currency pairs, spreads, market sessions
- Technical analysis: Discuss chart patterns, indicators, price action
- Risk management: Cover position sizing, stop losses, risk-reward ratios
- Trading psychology: Address emotions, discipline, mindset
- Market structure: Explain smart money concepts, liquidity, order flow
- Strategy development: Help with backtesting, optimization, journaling

Always emphasize the importance of education, practice, and risk management.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return "I apologize, but I'm experiencing technical difficulties. Please try again in a moment, or ask me about specific trading topics like forex basics, risk management, or technical analysis.";
    }
  }

  async generatePersonalizedLearningPath(userLevel: string, interests: string[]): Promise<string> {
    try {
      const prompt = `Create a personalized trading learning path for a ${userLevel} trader interested in: ${interests.join(', ')}.

Provide a structured learning plan with:
1. Foundation concepts they should master first
2. Intermediate topics to explore next
3. Advanced concepts for later study
4. Recommended practice exercises
5. Key resources and tools

Format the response with clear sections and actionable steps.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return "I'm having trouble generating your personalized learning path right now. Please try again, or ask me specific questions about trading topics you'd like to learn.";
    }
  }

  async analyzeMarketScenario(scenario: string): Promise<string> {
    try {
      const prompt = `As an expert trading mentor, analyze this market scenario and provide educational insights:

Scenario: ${scenario}

Provide:
1. Technical analysis of the situation
2. Potential trading opportunities and risks
3. Risk management considerations
4. What a professional trader would consider
5. Learning points for educational purposes

Focus on education rather than specific trading advice.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return "I'm having trouble analyzing that scenario right now. Please try rephrasing your question or ask about specific trading concepts.";
    }
  }
}

export const geminiService = new GeminiService();
