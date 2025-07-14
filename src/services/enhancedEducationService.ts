
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/integrations/supabase/client';

const genAI = new GoogleGenerativeAI('AIzaSyBvbQ9fTCfE3YBxBTwM5w1VYplHt-pGHpQ');

interface UserEducationProfile {
  id: string;
  user_id: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  completed_lessons: string[];
  quiz_scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  last_active: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  text: string;
  hasChart: boolean;
  chartUrl?: string;
  followUpActions: string[];
  lessonCompleted: boolean;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
}

interface ChartGenerationRequest {
  description: string;
  concept: string;
  skillLevel: string;
}

class EnhancedEducationService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async generateResponse(
    userInput: string,
    skillLevel: 'beginner' | 'intermediate' | 'advanced',
    chatHistory: ChatMessage[] = []
  ): Promise<AIResponse> {
    try {
      // Create skill-level appropriate system prompt
      const systemPrompt = this.createSystemPrompt(skillLevel);
      
      // Build conversation context
      const conversationHistory = chatHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}

Previous conversation:
${conversationHistory}

User: ${userInput}

Please respond as a trading coach, and if the topic would benefit from a visual example, indicate that you want to show a chart by including [CHART_NEEDED] in your response.`;

      const result = await this.model.generateContent(fullPrompt);
      const responseText = result.response.text();

      // Check if chart is needed
      const needsChart = responseText.includes('[CHART_NEEDED]');
      let chartUrl: string | undefined;

      if (needsChart) {
        chartUrl = await this.generateChart({
          description: userInput,
          concept: this.extractTradingConcept(userInput),
          skillLevel
        });
      }

      // Extract follow-up actions
      const followUpActions = this.generateFollowUpActions(userInput, skillLevel);

      // Clean response text
      const cleanText = responseText.replace(/\[CHART_NEEDED\]/g, '').trim();

      return {
        text: cleanText,
        hasChart: needsChart,
        chartUrl,
        followUpActions,
        lessonCompleted: this.checkLessonCompletion(userInput, responseText),
        skillLevel
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        text: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        hasChart: false,
        followUpActions: [],
        lessonCompleted: false
      };
    }
  }

  private createSystemPrompt(skillLevel: 'beginner' | 'intermediate' | 'advanced'): string {
    const basePrompt = `You are an expert trading coach specializing in Smart Money Concepts (SMC), Order Blocks, Fair Value Gaps, and institutional trading strategies.`;

    switch (skillLevel) {
      case 'beginner':
        return `${basePrompt} You're teaching complete beginners. Use simple analogies, avoid jargon, and explain everything step-by-step. Think of concepts like "banks leaving footprints" for order blocks.`;
      
      case 'intermediate':
        return `${basePrompt} You're teaching traders with some experience. Use proper terminology but still explain clearly. Focus on practical application and real market examples.`;
      
      case 'advanced':
        return `${basePrompt} You're teaching experienced traders. Use advanced concepts, complex strategies, and institutional-level insights. Discuss nuanced market structure and advanced SMC concepts.`;
    }
  }

  private async generateChart(request: ChartGenerationRequest): Promise<string> {
    // This would integrate with Replicate or another chart generation service
    // For now, return a placeholder
    const concepts = ['order-block', 'fair-value-gap', 'liquidity-sweep', 'market-structure'];
    const randomConcept = concepts[Math.floor(Math.random() * concepts.length)];
    return `https://via.placeholder.com/600x400/1a1a1a/ffffff?text=${randomConcept.replace('-', '+')}&font=Arial`;
  }

  private extractTradingConcept(input: string): string {
    const concepts = {
      'order block': 'OB',
      'fair value gap': 'FVG', 
      'liquidity': 'LIQ',
      'market structure': 'MS',
      'break of structure': 'BOS',
      'change of character': 'CHoCH'
    };

    const lowerInput = input.toLowerCase();
    for (const [concept, abbreviation] of Object.entries(concepts)) {
      if (lowerInput.includes(concept)) {
        return abbreviation;
      }
    }
    return 'GENERAL';
  }

  private generateFollowUpActions(input: string, skillLevel: string): string[] {
    const actions = [];
    
    if (input.toLowerCase().includes('order block')) {
      actions.push('Show me an example trade', 'Quiz me on Order Blocks', 'What about Fair Value Gaps?');
    } else if (input.toLowerCase().includes('liquidity')) {
      actions.push('How to identify liquidity sweeps', 'Quiz on liquidity concepts', 'Show market structure');
    } else {
      actions.push('Give me a quiz', 'Show me a chart example', 'What should I learn next?');
    }
    
    return actions.slice(0, 3);
  }

  private checkLessonCompletion(input: string, response: string): boolean {
    // Simple heuristic - if response is comprehensive and user asked a good question
    return response.length > 300 && (
      input.toLowerCase().includes('explain') || 
      input.toLowerCase().includes('how') ||
      input.toLowerCase().includes('what')
    );
  }

  async trackProgress(userId: string, concept: string, score?: number): Promise<void> {
    try {
      // Store progress in user_progress table instead
      await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          skills_mastered: [concept],
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking progress:', error);
    }
  }
}

export const enhancedEducationService = new EnhancedEducationService();
