
import { supabase } from '@/integrations/supabase/client';
import { UserTrackingService } from './userTrackingService';

export interface UserPersonality {
  communicationStyle: 'casual' | 'professional' | 'technical' | 'friendly';
  learningPreference: 'visual' | 'text' | 'interactive' | 'examples';
  tradingExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredTopics: string[];
  weakAreas: string[];
  strengths: string[];
  conversationTone: 'serious' | 'humorous' | 'encouraging' | 'challenging';
}

export interface UserConversationHistory {
  messageCount: number;
  lastTopics: string[];
  commonQuestions: string[];
  learningProgress: Record<string, number>;
  personalDetails: Record<string, any>;
  tradingGoals: string[];
  currentChallenges: string[];
}

export interface UserActivitySummary {
  signalsViewed: number;
  memeCoinsScanned: number;
  tradingIdeasGenerated: number;
  educationTopicsExplored: string[];
  averageSessionTime: number;
  preferredTimeframes: string[];
  mostActiveFeatures: string[];
  recentPerformance: number;
}

export interface ComprehensiveUserContext {
  userId: string;
  personality: UserPersonality;
  conversationHistory: UserConversationHistory;
  activitySummary: UserActivitySummary;
  currentLevel: string;
  nextGoals: string[];
  lastUpdated: string;
}

export class UserContextService {
  static async getComprehensiveUserContext(userId: string): Promise<ComprehensiveUserContext> {
    try {
      // Get basic user progress
      const progress = await UserTrackingService.getUserProgress(userId);
      
      // Get conversation history and AI memory
      const memories = await UserTrackingService.getAIMemory(userId, 100);
      const recentActivities = await UserTrackingService.getRecentActivities(userId, 50);
      
      // Get learning sessions
      const { data: sessions } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Analyze conversation patterns
      const conversationMemories = memories.filter(m => m.memory_type === 'conversation');
      const personalityMemories = memories.filter(m => m.memory_type === 'preference');
      
      // Extract personality traits from conversations
      const personality = this.analyzePersonality(conversationMemories, personalityMemories);
      
      // Build conversation history summary
      const conversationHistory = this.buildConversationHistory(conversationMemories, sessions || []);
      
      // Summarize user activity
      const activitySummary = this.summarizeActivity(progress, recentActivities, sessions || []);
      
      // Determine current level and next goals
      const currentLevel = this.determineUserLevel(progress, conversationHistory, activitySummary);
      const nextGoals = this.generateNextGoals(currentLevel, activitySummary, conversationHistory);

      return {
        userId,
        personality,
        conversationHistory,
        activitySummary,
        currentLevel,
        nextGoals,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return this.getDefaultUserContext(userId);
    }
  }

  private static analyzePersonality(conversationMemories: any[], personalityMemories: any[]): UserPersonality {
    // Analyze communication patterns
    let casualWords = 0;
    let technicalWords = 0;
    let totalWords = 0;

    const technicalTerms = ['leverage', 'fibonacci', 'rsi', 'macd', 'bollinger', 'ichimoku', 'elliott wave'];
    const casualTerms = ['cool', 'awesome', 'thanks', 'hey', 'lol', 'yeah', 'nice'];

    conversationMemories.forEach(memory => {
      const content = memory.content.toLowerCase();
      totalWords += content.split(' ').length;
      
      technicalTerms.forEach(term => {
        if (content.includes(term)) technicalWords++;
      });
      
      casualTerms.forEach(term => {
        if (content.includes(term)) casualWords++;
      });
    });

    // Determine communication style
    let communicationStyle: UserPersonality['communicationStyle'] = 'friendly';
    if (technicalWords > casualWords && totalWords > 100) {
      communicationStyle = technicalWords > totalWords * 0.1 ? 'technical' : 'professional';
    } else if (casualWords > technicalWords) {
      communicationStyle = 'casual';
    }

    // Extract other preferences from memory
    const preferences = personalityMemories.reduce((acc, memory) => {
      try {
        const context = memory.context || {};
        return { ...acc, ...context };
      } catch {
        return acc;
      }
    }, {});

    return {
      communicationStyle,
      learningPreference: preferences.learningPreference || 'interactive',
      tradingExperience: preferences.tradingExperience || 'intermediate',
      riskTolerance: preferences.riskTolerance || 'moderate',
      preferredTopics: preferences.preferredTopics || ['smart money concepts'],
      weakAreas: preferences.weakAreas || [],
      strengths: preferences.strengths || [],
      conversationTone: preferences.conversationTone || 'encouraging'
    };
  }

  private static buildConversationHistory(conversationMemories: any[], sessions: any[]): UserConversationHistory {
    const messageCount = conversationMemories.length;
    const lastTopics = conversationMemories
      .slice(0, 10)
      .map(m => this.extractTopics(m.content))
      .flat()
      .filter((topic, index, arr) => arr.indexOf(topic) === index)
      .slice(0, 5);

    const commonQuestions = conversationMemories
      .filter(m => m.content.includes('?'))
      .map(m => m.content.split('\n')[0])
      .slice(0, 5);

    const learningProgress = sessions.reduce((acc, session) => {
      session.topics_covered?.forEach((topic: string) => {
        acc[topic] = (acc[topic] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Extract personal details from conversations
    const personalDetails = this.extractPersonalDetails(conversationMemories);

    return {
      messageCount,
      lastTopics,
      commonQuestions,
      learningProgress,
      personalDetails,
      tradingGoals: personalDetails.goals || [],
      currentChallenges: personalDetails.challenges || []
    };
  }

  private static summarizeActivity(progress: any, activities: any[], sessions: any[]): UserActivitySummary {
    const sessionTimes = sessions
      .filter(s => s.duration_minutes)
      .map(s => s.duration_minutes);
    
    const averageSessionTime = sessionTimes.length > 0 
      ? sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length 
      : 0;

    const activityCounts = activities.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActiveFeatures = Object.entries(activityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([feature]) => feature);

    return {
      signalsViewed: progress?.signals_viewed || 0,
      memeCoinsScanned: progress?.meme_coins_scanned || 0,
      tradingIdeasGenerated: progress?.trading_games_played || 0,
      educationTopicsExplored: Object.keys(progress?.skills_mastered || []),
      averageSessionTime,
      preferredTimeframes: progress?.preferred_timeframes || ['H1', 'H4'],
      mostActiveFeatures,
      recentPerformance: progress?.win_rate || 0
    };
  }

  private static determineUserLevel(progress: any, conversation: UserConversationHistory, activity: UserActivitySummary): string {
    let score = 0;
    
    // Experience indicators
    if (activity.signalsViewed > 50) score += 20;
    if (activity.averageSessionTime > 15) score += 15;
    if (conversation.messageCount > 100) score += 25;
    if (activity.recentPerformance > 60) score += 20;
    if (Object.keys(conversation.learningProgress).length > 10) score += 20;

    if (score >= 80) return 'Expert Trader & Mentor';
    if (score >= 60) return 'Advanced Smart Money Practitioner';
    if (score >= 40) return 'Developing Institutional Trader';
    if (score >= 20) return 'Learning Technical Analyst';
    return 'Trading Beginner';
  }

  private static generateNextGoals(level: string, activity: UserActivitySummary, conversation: UserConversationHistory): string[] {
    const goals = [];
    
    switch (level) {
      case 'Trading Beginner':
        goals.push('Master basic candlestick patterns', 'Learn risk management fundamentals', 'Understand market structure');
        break;
      case 'Learning Technical Analyst':
        goals.push('Study Smart Money Concepts', 'Practice order block identification', 'Develop trading psychology');
        break;
      case 'Developing Institutional Trader':
        goals.push('Master liquidity concepts', 'Develop consistent strategy', 'Learn advanced position sizing');
        break;
      case 'Advanced Smart Money Practitioner':
        goals.push('Perfect execution timing', 'Develop teaching abilities', 'Master multi-timeframe analysis');
        break;
      default:
        goals.push('Share knowledge with community', 'Develop advanced strategies', 'Mentor other traders');
    }

    // Add personalized goals based on weak areas
    if (activity.recentPerformance < 50) {
      goals.push('Improve trade management skills');
    }
    
    if (conversation.currentChallenges.length > 0) {
      goals.push(`Address current challenge: ${conversation.currentChallenges[0]}`);
    }

    return goals.slice(0, 3);
  }

  private static extractTopics(content: string): string[] {
    const tradingTopics = [
      'order blocks', 'fair value gap', 'liquidity', 'market structure', 'break of structure',
      'smart money', 'institutional trading', 'risk management', 'position sizing', 'psychology',
      'candlesticks', 'support resistance', 'fibonacci', 'elliott wave', 'technical analysis'
    ];

    return tradingTopics.filter(topic => 
      content.toLowerCase().includes(topic.toLowerCase())
    );
  }

  private static extractPersonalDetails(conversationMemories: any[]): Record<string, any> {
    const details: Record<string, any> = {
      goals: [],
      challenges: [],
      interests: [],
      lifestyle: {}
    };

    conversationMemories.forEach(memory => {
      const content = memory.content.toLowerCase();
      
      // Extract goals
      if (content.includes('goal') || content.includes('want to') || content.includes('hoping to')) {
        const goalMatch = content.match(/(?:goal|want to|hoping to)([^.!?]*)/i);
        if (goalMatch && goalMatch[1]) {
          details.goals.push(goalMatch[1].trim());
        }
      }

      // Extract challenges
      if (content.includes('struggle') || content.includes('difficult') || content.includes('problem')) {
        const challengeMatch = content.match(/(?:struggle|difficult|problem)([^.!?]*)/i);
        if (challengeMatch && challengeMatch[1]) {
          details.challenges.push(challengeMatch[1].trim());
        }
      }

      // Extract personal interests
      if (content.includes('hobby') || content.includes('enjoy') || content.includes('love')) {
        const interestMatch = content.match(/(?:hobby|enjoy|love)([^.!?]*)/i);
        if (interestMatch && interestMatch[1]) {
          details.interests.push(interestMatch[1].trim());
        }
      }
    });

    return details;
  }

  private static getDefaultUserContext(userId: string): ComprehensiveUserContext {
    return {
      userId,
      personality: {
        communicationStyle: 'friendly',
        learningPreference: 'interactive',
        tradingExperience: 'beginner',
        riskTolerance: 'moderate',
        preferredTopics: ['basics'],
        weakAreas: [],
        strengths: [],
        conversationTone: 'encouraging'
      },
      conversationHistory: {
        messageCount: 0,
        lastTopics: [],
        commonQuestions: [],
        learningProgress: {},
        personalDetails: {},
        tradingGoals: [],
        currentChallenges: []
      },
      activitySummary: {
        signalsViewed: 0,
        memeCoinsScanned: 0,
        tradingIdeasGenerated: 0,
        educationTopicsExplored: [],
        averageSessionTime: 0,
        preferredTimeframes: ['H1'],
        mostActiveFeatures: [],
        recentPerformance: 0
      },
      currentLevel: 'Trading Beginner',
      nextGoals: ['Learn basic concepts', 'Start with risk management', 'Understand market basics'],
      lastUpdated: new Date().toISOString()
    };
  }

  // Store user context updates
  static async updateUserContext(userId: string, updates: Partial<ComprehensiveUserContext>): Promise<void> {
    try {
      await UserTrackingService.storeAIMemory({
        user_id: userId,
        memory_type: 'preference',
        content: `User context updated: ${JSON.stringify(updates)}`,
        importance_score: 8,
        context: updates
      });
    } catch (error) {
      console.error('Error updating user context:', error);
    }
  }
}
