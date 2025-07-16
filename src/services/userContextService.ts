
import { supabase } from '@/integrations/supabase/client';

export interface UserPersonality {
  tradingExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  interests: string[];
  communicationStyle: 'formal' | 'casual' | 'technical';
  learningPreferences: string[];
  goals: string[];
}

export interface ConversationContext {
  recentTopics: string[];
  questionPatterns: string[];
  responseStyle: string;
  lastInteraction: Date;
  sessionCount: number;
  avgSessionLength: number;
}

export interface UserActivity {
  signalsViewed: number;
  educationModulesCompleted: string[];
  tradingGamesPlayed: number;
  memeCoinsScanned: number;
  totalMessages: number;
  lastActiveSection: string;
}

export interface UserContext {
  userId: string;
  personality: UserPersonality;
  conversation: ConversationContext;
  activity: UserActivity;
  lastUpdated: Date;
}

class UserContextService {
  private contexts: Map<string, UserContext> = new Map();

  async getUserContext(userId: string): Promise<UserContext> {
    // Check if we have cached context
    if (this.contexts.has(userId)) {
      const context = this.contexts.get(userId)!;
      // Refresh if older than 1 hour
      if (Date.now() - context.lastUpdated.getTime() < 3600000) {
        return context;
      }
    }

    // Load from database
    const context = await this.loadUserContext(userId);
    this.contexts.set(userId, context);
    return context;
  }

  private async loadUserContext(userId: string): Promise<UserContext> {
    try {
      // Get user progress and activities
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: memory } = await supabase
        .from('ai_memory')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(20);

      // Analyze user behavior and build context
      const personality = this.analyzePersonality(progress, activities || []);
      const conversation = this.analyzeConversation(memory || []);
      const activity = this.analyzeActivity(progress, activities || []);

      return {
        userId,
        personality,
        conversation,
        activity,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error loading user context:', error);
      return this.getDefaultContext(userId);
    }
  }

  private analyzePersonality(progress: any, activities: any[]): UserPersonality {
    if (!progress) {
      return {
        tradingExperience: 'beginner',
        riskTolerance: 'moderate',
        interests: [],
        communicationStyle: 'casual',
        learningPreferences: [],
        goals: []
      };
    }

    const signalsViewed = progress.signals_viewed || 0;
    const chartsAnalyzed = progress.charts_analyzed || 0;
    const gamesPlayed = progress.trading_games_played || 0;

    let experience: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner';
    if (signalsViewed > 50 && chartsAnalyzed > 20 && gamesPlayed > 10) experience = 'expert';
    else if (signalsViewed > 25 && chartsAnalyzed > 10) experience = 'advanced';
    else if (signalsViewed > 10 && chartsAnalyzed > 5) experience = 'intermediate';

    const interests = [];
    if (progress.signals_viewed > 10) interests.push('technical_analysis');
    if (progress.meme_coins_scanned > 5) interests.push('crypto');
    if (progress.trading_games_played > 3) interests.push('practice_trading');

    return {
      tradingExperience: experience,
      riskTolerance: progress.risk_tolerance || 'moderate',
      interests,
      communicationStyle: 'casual',
      learningPreferences: progress.skills_mastered || [],
      goals: []
    };
  }

  private analyzeConversation(memory: any[]): ConversationContext {
    if (!memory || memory.length === 0) {
      return {
        recentTopics: [],
        questionPatterns: [],
        responseStyle: 'helpful',
        lastInteraction: new Date(),
        sessionCount: 0,
        avgSessionLength: 0
      };
    }

    const recentTopics = memory
      .slice(0, 10)
      .map(m => this.extractTopic(m.content))
      .filter(Boolean);

    const questionPatterns = memory
      .filter(m => m.content.includes('?'))
      .slice(0, 5)
      .map(m => this.extractQuestionPattern(m.content));

    return {
      recentTopics,
      questionPatterns,
      responseStyle: 'helpful',
      lastInteraction: new Date(memory[0]?.updated_at || Date.now()),
      sessionCount: memory.length,
      avgSessionLength: 5
    };
  }

  private analyzeActivity(progress: any, activities: any[]): UserActivity {
    if (!progress) {
      return {
        signalsViewed: 0,
        educationModulesCompleted: [],
        tradingGamesPlayed: 0,
        memeCoinsScanned: 0,
        totalMessages: 0,
        lastActiveSection: 'signals'
      };
    }

    const lastActivity = activities[0];
    const lastSection = lastActivity?.activity_type || 'signals';

    return {
      signalsViewed: progress.signals_viewed || 0,
      educationModulesCompleted: progress.skills_mastered || [],
      tradingGamesPlayed: progress.trading_games_played || 0,
      memeCoinsScanned: progress.meme_coins_scanned || 0,
      totalMessages: progress.messages_sent || 0,
      lastActiveSection: lastSection
    };
  }

  private extractTopic(content: string): string {
    const topics = [
      'signals', 'trading', 'charts', 'risk management', 'strategies',
      'forex', 'crypto', 'technical analysis', 'fundamentals'
    ];
    
    return topics.find(topic => 
      content.toLowerCase().includes(topic)
    ) || 'general';
  }

  private extractQuestionPattern(content: string): string {
    if (content.includes('how')) return 'how-to';
    if (content.includes('what')) return 'definition';
    if (content.includes('why')) return 'explanation';
    if (content.includes('when')) return 'timing';
    return 'general';
  }

  private getDefaultContext(userId: string): UserContext {
    return {
      userId,
      personality: {
        tradingExperience: 'beginner',
        riskTolerance: 'moderate',
        interests: [],
        communicationStyle: 'casual',
        learningPreferences: [],
        goals: []
      },
      conversation: {
        recentTopics: [],
        questionPatterns: [],
        responseStyle: 'helpful',
        lastInteraction: new Date(),
        sessionCount: 0,
        avgSessionLength: 0
      },
      activity: {
        signalsViewed: 0,
        educationModulesCompleted: [],
        tradingGamesPlayed: 0,
        memeCoinsScanned: 0,
        totalMessages: 0,
        lastActiveSection: 'signals'
      },
      lastUpdated: new Date()
    };
  }

  async updateUserActivity(userId: string, activityType: string, data: any = {}) {
    try {
      // Store in database
      await supabase.from('user_activities').insert({
        user_id: userId,
        activity_type: activityType,
        data
      });

      // Update cached context
      const context = await this.getUserContext(userId);
      
      if (activityType === 'signal_view') {
        context.activity.signalsViewed += 1;
      } else if (activityType === 'meme_scan') {
        context.activity.memeCoinsScanned += 1;
      } else if (activityType === 'trade_game') {
        context.activity.tradingGamesPlayed += 1;
      } else if (activityType === 'ai_message') {
        context.activity.totalMessages += 1;
      }

      context.activity.lastActiveSection = activityType;
      context.lastUpdated = new Date();
      
      this.contexts.set(userId, context);
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  }

  async storeConversationMemory(userId: string, content: string, importance: number = 5) {
    try {
      await supabase.from('ai_memory').insert({
        user_id: userId,
        content,
        memory_type: 'conversation',
        importance_score: importance,
        context: {
          timestamp: new Date().toISOString(),
          source: 'ai_mentor'
        }
      });

      // Update cached context
      const context = await this.getUserContext(userId);
      context.conversation.sessionCount += 1;
      context.conversation.lastInteraction = new Date();
      context.lastUpdated = new Date();
      
      this.contexts.set(userId, context);
    } catch (error) {
      console.error('Error storing conversation memory:', error);
    }
  }

  generatePersonalizedPrompt(context: UserContext, message: string): string {
    const { personality, conversation, activity } = context;
    
    let prompt = `You are a friendly AI trading mentor. 

User Profile:
- Trading Experience: ${personality.tradingExperience}
- Risk Tolerance: ${personality.riskTolerance}
- Interests: ${personality.interests.join(', ') || 'Getting started'}
- Messages Sent: ${activity.totalMessages}
- Signals Viewed: ${activity.signalsViewed}
- Trading Games Played: ${activity.tradingGamesPlayed}

Communication Style: Be ${personality.communicationStyle} and adapt to their ${personality.tradingExperience} level.

Recent Context: ${conversation.recentTopics.slice(0, 3).join(', ')}

User Message: "${message}"

Respond as a knowledgeable but friendly trading mentor who remembers this user's journey and adapts to their experience level. Keep responses conversational and helpful.`;

    return prompt;
  }
}

export const userContextService = new UserContextService();
