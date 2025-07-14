
import { supabase } from '@/integrations/supabase/client';
import { geminiEducationService } from './geminiEducationService';
import { replicateService } from './replicateService';

export interface UserEducationProfile {
  id: string;
  user_id: string;
  skill_level: 'Beginner' | 'Intermediate' | 'Pro';
  completed_lessons: string[];
  quiz_scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  learning_preferences: {
    visual_learner: boolean;
    practical_examples: boolean;
    quick_quizzes: boolean;
  };
  session_data: {
    current_topic: string;
    lesson_progress: number;
    last_interaction: string;
  };
  total_study_time: number;
  created_at: string;
  updated_at: string;
}

export interface EnhancedLesson {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Pro';
  content: {
    explanation: string;
    visual_prompt?: string;
    visual_url?: string;
    key_points: string[];
    examples: string[];
  };
  quiz?: {
    questions: Array<{
      question: string;
      options: string[];
      correct_answer: number;
      explanation: string;
    }>;
  };
  next_topics: string[];
}

export interface AICoachResponse {
  text: string;
  visual_url?: string;
  follow_up_actions?: Array<{
    type: 'quiz' | 'practice' | 'visual_example';
    description: string;
    action_data: any;
  }>;
  skill_level_adjustment?: {
    current_level: string;
    suggested_level: string;
    reason: string;
  };
}

class EnhancedEducationService {
  private sessionMemory: Map<string, any> = new Map();

  async getUserProfile(userId: string): Promise<UserEducationProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_education_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  async createOrUpdateProfile(userId: string, updates: Partial<UserEducationProfile>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_education_profiles')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating profile:', error);
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
    }
  }

  private generatePersonalizedPrompt(
    userMessage: string, 
    profile: UserEducationProfile, 
    sessionContext?: any
  ): string {
    const levelInstructions = {
      'Beginner': `
        - Use simple, clear explanations with analogies
        - Avoid jargon, explain technical terms
        - Focus on fundamental concepts first
        - Use encouraging, patient tone
        - Provide step-by-step breakdowns
      `,
      'Intermediate': `
        - Balance theory with practical application
        - Introduce moderate technical concepts
        - Connect new concepts to basics they know
        - Encourage critical thinking
        - Provide real trading scenarios
      `,
      'Pro': `
        - Use advanced technical language appropriately
        - Focus on nuanced market dynamics
        - Discuss institutional perspectives
        - Challenge with complex scenarios
        - Integrate multiple concepts simultaneously
      `
    };

    return `You are Aasakira 2.0, an elite AI trading coach specializing in Smart Money Concepts and institutional trading.

USER PROFILE:
- Skill Level: ${profile.skill_level}
- Completed Lessons: ${profile.completed_lessons.length}
- Strengths: ${profile.strengths.join(', ') || 'Still assessing'}
- Weaknesses: ${profile.weaknesses.join(', ') || 'Still assessing'}
- Learning Style: ${profile.learning_preferences.visual_learner ? 'Visual' : 'Text'} learner
- Current Topic: ${profile.session_data.current_topic || 'General'}

COACHING STYLE FOR ${profile.skill_level}:
${levelInstructions[profile.skill_level]}

SESSION CONTEXT:
${sessionContext ? JSON.stringify(sessionContext) : 'New conversation'}

USER MESSAGE: "${userMessage}"

RESPONSE REQUIREMENTS:
1. Adapt complexity to their ${profile.skill_level} level
2. Reference their progress and previous topics when relevant
3. If they ask for examples, suggest generating a visual chart
4. End with engaging follow-up questions or actions
5. Be conversational like a personal mentor, not robotic
6. If appropriate, offer a quick quiz to test understanding
7. Keep responses focused but comprehensive

Remember: You're their personal trading coach who knows their journey and adapts to their needs.`;
  }

  async generateAICoachResponse(
    userMessage: string, 
    userId: string
  ): Promise<AICoachResponse> {
    try {
      // Get user profile
      let profile = await this.getUserProfile(userId);
      
      if (!profile) {
        // Create default profile
        profile = {
          id: userId,
          user_id: userId,
          skill_level: 'Beginner',
          completed_lessons: [],
          quiz_scores: {},
          strengths: [],
          weaknesses: [],
          learning_preferences: {
            visual_learner: true,
            practical_examples: true,
            quick_quizzes: true
          },
          session_data: {
            current_topic: '',
            lesson_progress: 0,
            last_interaction: new Date().toISOString()
          },
          total_study_time: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await this.createOrUpdateProfile(userId, profile);
      }

      // Get session context
      const sessionContext = this.sessionMemory.get(userId) || {};

      // Generate personalized prompt
      const prompt = this.generatePersonalizedPrompt(userMessage, profile, sessionContext);

      // Get AI response
      const aiText = await geminiEducationService.getAIResponse(prompt);

      // Analyze if user needs visual example
      const needsVisual = this.shouldGenerateVisual(userMessage, aiText);
      let visualUrl: string | undefined;

      if (needsVisual && profile.learning_preferences.visual_learner) {
        try {
          const visualPrompt = this.createVisualPrompt(userMessage, aiText);
          const visualResult = await replicateService.generateTradingChart({
            prompt: visualPrompt,
            chartType: this.detectChartType(userMessage),
            pair: this.extractTradingPair(userMessage) || 'EURUSD'
          });
          
          if (visualResult.status === 'success') {
            visualUrl = visualResult.imageUrl;
          }
        } catch (error) {
          console.log('Visual generation failed, continuing without visual');
        }
      }

      // Generate follow-up actions
      const followUpActions = this.generateFollowUpActions(userMessage, aiText, profile);

      // Update session memory
      this.updateSessionMemory(userId, userMessage, aiText);

      // Check if skill level should be adjusted
      const skillLevelAdjustment = this.assessSkillLevelAdjustment(userMessage, profile);

      return {
        text: aiText,
        visual_url: visualUrl,
        follow_up_actions: followUpActions,
        skill_level_adjustment: skillLevelAdjustment
      };

    } catch (error) {
      console.error('Error generating AI coach response:', error);
      return {
        text: "I'm experiencing some technical difficulties right now. Let me help you with a fundamental trading concept instead. What specific area of trading would you like to focus on?"
      };
    }
  }

  private shouldGenerateVisual(userMessage: string, aiResponse: string): boolean {
    const visualKeywords = [
      'show me', 'example', 'chart', 'diagram', 'visual', 'see',
      'order block', 'support', 'resistance', 'trend', 'pattern',
      'break of structure', 'fair value gap', 'liquidity'
    ];

    const message = userMessage.toLowerCase();
    const response = aiResponse.toLowerCase();

    return visualKeywords.some(keyword => 
      message.includes(keyword) || response.includes(keyword)
    );
  }

  private createVisualPrompt(userMessage: string, aiResponse: string): string {
    const topic = this.extractTopic(userMessage);
    
    const prompts = {
      'order block': 'Professional forex chart showing a clear order block formation with price reaction, institutional levels marked, clean price action on dark background',
      'support resistance': 'Clean support and resistance levels on a forex chart with multiple touches and price reactions, professional trading view style',
      'trend': 'Clear trend analysis chart showing higher highs and higher lows with trend lines, professional forex chart style',
      'break of structure': 'Chart showing break of structure (BOS) with clear swing highs/lows being broken, institutional trading style',
      'fair value gap': 'Fair value gap (FVG) highlighted on forex chart with price imbalance clearly marked, smart money concepts style',
      'liquidity': 'Liquidity zones and sweeps on forex chart, showing institutional order flow, professional dark theme'
    };

    return prompts[topic] || `Professional forex trading chart illustrating ${topic || 'price action concepts'}, institutional trading style, clean dark background, educational trading analysis`;
  }

  private extractTopic(message: string): string {
    const topics = {
      'order block': ['order block', 'ob', 'institutional level'],
      'support resistance': ['support', 'resistance', 'level'],
      'trend': ['trend', 'direction', 'momentum'],
      'break of structure': ['bos', 'break of structure', 'structure break'],
      'fair value gap': ['fvg', 'fair value gap', 'imbalance'],
      'liquidity': ['liquidity', 'sweep', 'grab']
    };

    const lowerMessage = message.toLowerCase();
    
    for (const [key, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return key;
      }
    }

    return 'price action';
  }

  private detectChartType(message: string): 'smc_analysis' | 'price_action' | 'technical_indicator' | 'trading_strategy' {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('smc') || lowerMessage.includes('smart money') || 
        lowerMessage.includes('order block') || lowerMessage.includes('liquidity')) {
      return 'smc_analysis';
    }
    
    if (lowerMessage.includes('indicator') || lowerMessage.includes('rsi') || 
        lowerMessage.includes('moving average')) {
      return 'technical_indicator';
    }
    
    if (lowerMessage.includes('strategy') || lowerMessage.includes('setup')) {
      return 'trading_strategy';
    }
    
    return 'price_action';
  }

  private extractTradingPair(message: string): string | null {
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCHF', 'XAUUSD', 'BTCUSD', 'ETHUSD'];
    const upperMessage = message.toUpperCase();
    
    return pairs.find(pair => upperMessage.includes(pair)) || null;
  }

  private generateFollowUpActions(
    userMessage: string, 
    aiResponse: string, 
    profile: UserEducationProfile
  ): Array<{type: 'quiz' | 'practice' | 'visual_example'; description: string; action_data: any}> {
    const actions = [];

    // Suggest quiz if user seems ready
    if (profile.learning_preferences.quick_quizzes && 
        (aiResponse.includes('understand') || aiResponse.includes('concept'))) {
      actions.push({
        type: 'quiz' as const,
        description: `Test your understanding with a quick ${profile.skill_level.toLowerCase()} level quiz`,
        action_data: { topic: this.extractTopic(userMessage), difficulty: profile.skill_level.toLowerCase() }
      });
    }

    // Suggest practice if discussing strategy
    if (userMessage.toLowerCase().includes('strategy') || 
        userMessage.toLowerCase().includes('trade')) {
      actions.push({
        type: 'practice' as const,
        description: 'Practice this concept in our trading simulator',
        action_data: { type: 'simulator', topic: this.extractTopic(userMessage) }
      });
    }

    return actions;
  }

  private updateSessionMemory(userId: string, userMessage: string, aiResponse: string): void {
    const existing = this.sessionMemory.get(userId) || {};
    
    this.sessionMemory.set(userId, {
      ...existing,
      last_messages: [
        ...(existing.last_messages || []).slice(-4), // Keep last 5 messages
        { user: userMessage, ai: aiResponse, timestamp: Date.now() }
      ],
      topic_mentions: {
        ...existing.topic_mentions,
        [this.extractTopic(userMessage)]: (existing.topic_mentions?.[this.extractTopic(userMessage)] || 0) + 1
      }
    });
  }

  private assessSkillLevelAdjustment(
    userMessage: string, 
    profile: UserEducationProfile
  ): {current_level: string; suggested_level: string; reason: string} | undefined {
    // Simple heuristics for skill level assessment
    const complexTerms = ['institutional', 'liquidity sweep', 'order flow', 'market structure'];
    const basicTerms = ['support', 'resistance', 'trend', 'price'];
    
    const hasComplexTerms = complexTerms.some(term => 
      userMessage.toLowerCase().includes(term)
    );
    const hasBasicTerms = basicTerms.some(term => 
      userMessage.toLowerCase().includes(term)
    );

    if (profile.skill_level === 'Beginner' && hasComplexTerms && profile.completed_lessons.length > 10) {
      return {
        current_level: 'Beginner',
        suggested_level: 'Intermediate',
        reason: 'You\'re asking about advanced concepts and have completed several lessons'
      };
    }

    if (profile.skill_level === 'Intermediate' && hasComplexTerms && profile.completed_lessons.length > 25) {
      return {
        current_level: 'Intermediate',
        suggested_level: 'Pro',
        reason: 'Your questions show deep understanding of institutional concepts'
      };
    }

    return undefined;
  }

  async generateSmartQuiz(topic: string, difficulty: string, userId: string): Promise<any> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return null;

    const contextualPrompt = `Generate a ${difficulty} level quiz on ${topic} for a trader with this background:
    - Completed ${profile.completed_lessons.length} lessons
    - Strengths: ${profile.strengths.join(', ')}
    - Previous quiz performance: ${Object.keys(profile.quiz_scores).length} quizzes taken
    
    Make the quiz challenging but fair for their level, with practical trading scenarios.`;

    return await geminiEducationService.generateQuizQuestion(topic, difficulty as any, {
      user_context: contextualPrompt,
      user_level: profile.skill_level
    });
  }
}

export const enhancedEducationService = new EnhancedEducationService();
