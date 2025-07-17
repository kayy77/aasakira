
import { groqService } from './groqService';

export interface PersonalizedResponse {
  response: string;
  confidence: number;
  followUpSuggestions: string[];
}

export interface UserBehaviorContext {
  recentSignals: any[];
  tradingExperience: string;
  preferredPairs: string[];
  riskTolerance: string;
  learningGoals: string[];
  behaviorPatterns: any;
}

class EnhancedGroqService {
  async generatePersonalizedResponse(
    userMessage: string,
    userId: string,
    conversationHistory: Array<{role: string, content: string}>,
    userContext?: UserBehaviorContext
  ): Promise<PersonalizedResponse | null> {
    try {
      // Build enhanced context-aware prompt
      const contextPrompt = this.buildContextualPrompt(userMessage, userContext);
      
      const response = await groqService.generateResponse(contextPrompt, {
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 800
      });

      return {
        response,
        confidence: 8.5,
        followUpSuggestions: this.generateFollowUps(userMessage)
      };
    } catch (error) {
      console.error('Enhanced GROQ service error:', error);
      return null;
    }
  }

  private buildContextualPrompt(userMessage: string, context?: UserBehaviorContext): string {
    let prompt = `You are Aasakira, an elite AI trading mentor. You teach forex trading from absolute basics to advanced institutional concepts.

TEACHING PHILOSOPHY:
- Start with fundamentals for beginners
- Build concepts progressively
- Use clear, practical examples
- Relate everything to real trading situations
- Be encouraging but maintain high standards

USER MESSAGE: "${userMessage}"`;

    if (context) {
      prompt += `

USER CONTEXT:
- Experience Level: ${context.tradingExperience || 'Beginner'}
- Preferred Pairs: ${context.preferredPairs?.join(', ') || 'None set'}
- Risk Tolerance: ${context.riskTolerance || 'Conservative'}
- Learning Goals: ${context.learningGoals?.join(', ') || 'General trading knowledge'}`;
    }

    prompt += `

RESPONSE GUIDELINES:
1. If the user is a complete beginner, start with the absolute basics
2. Explain concepts in simple terms first, then add complexity
3. Always provide practical examples
4. Include actionable next steps
5. Keep responses focused and not overwhelming

Respond as Aasakira would - knowledgeable, patient with beginners, but still maintaining professional standards.`;

    return prompt;
  }

  private generateFollowUps(userMessage: string): string[] {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('what is') || lowerMessage.includes('explain')) {
      return [
        'Can you show me a practical example?',
        'How do I apply this in real trading?',
        'What should I learn next?'
      ];
    }
    
    return [
      'Tell me more about this concept',
      'Show me how to practice this',
      'What are common mistakes to avoid?'
    ];
  }
}

export const enhancedGroqService = new EnhancedGroqService();
