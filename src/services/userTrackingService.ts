
import { supabase } from '@/integrations/supabase/client';

export interface UserBehaviorContext {
  recentSignals: any[];
  tradingExperience: string;
  preferredPairs: string[];
  riskTolerance: string;
  learningGoals: string[];
  behaviorPatterns: any;
}

export class UserTrackingService {
  static async trackUserEvent(userId: string, event: string, data: any) {
    try {
      await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: event,
          data: {
            ...data,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error tracking user event:', error);
    }
  }

  static async trackSignalView(userId: string, signal: any) {
    return this.trackUserEvent(userId, 'signal_view', {
      pair: signal.pair,
      confidence: signal.confidence,
      frameworks: signal.frameworks
    });
  }

  static async trackSignalSkip(userId: string, signal: any) {
    return this.trackUserEvent(userId, 'signal_skip', {
      pair: signal.pair,
      confidence: signal.confidence,
      reason: 'skipped'
    });
  }

  static async trackSignalAction(userId: string, signal: any, action: string) {
    return this.trackUserEvent(userId, 'signal_action', {
      pair: signal.pair,
      action,
      confidence: signal.confidence
    });
  }

  static async trackMentorPrompt(userId: string, prompt: string, context?: any) {
    return this.trackUserEvent(userId, 'mentor_prompt', {
      prompt,
      context
    });
  }

  static async trackEducationView(userId: string, module: string, timeSpent?: number) {
    return this.trackUserEvent(userId, 'education_view', {
      module,
      timeSpent
    });
  }

  static async getUserProgress(userId: string) {
    try {
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      return data || {
        charts_analyzed: 0,
        signals_viewed: 0,
        messages_sent: 0,
        trading_games_played: 0,
        skills_mastered: [],
        weaknesses: []
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  static async getUserBehaviorContext(userId: string): Promise<UserBehaviorContext> {
    try {
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      const signalViews = activities?.filter(a => a.activity_type === 'signal_view') || [];
      const pairs = signalViews
        .map(s => s.data && typeof s.data === 'object' && 'pair' in s.data ? (s.data as any).pair : null)
        .filter(Boolean);
      const confidences = signalViews
        .map(s => s.data && typeof s.data === 'object' && 'confidence' in s.data ? (s.data as any).confidence : null)
        .filter(Boolean);

      return {
        recentSignals: signalViews.slice(0, 10),
        tradingExperience: 'beginner',
        preferredPairs: [...new Set(pairs)].slice(0, 5),
        riskTolerance: 'conservative',
        learningGoals: ['basic-trading', 'risk-management'],
        behaviorPatterns: {
          averageConfidenceThreshold: confidences.length > 0 ? 
            confidences.reduce((a, b) => a + b, 0) / confidences.length : 70,
          tradingStyle: 'conservative',
          weaknesses: ['risk-management', 'patience'],
          strengths: ['technical-analysis'],
          lastActive: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error getting behavior context:', error);
      return {
        recentSignals: [],
        tradingExperience: 'beginner',
        preferredPairs: [],
        riskTolerance: 'conservative',
        learningGoals: ['basic-trading'],
        behaviorPatterns: {
          averageConfidenceThreshold: 70,
          tradingStyle: 'beginner',
          weaknesses: [],
          strengths: [],
          lastActive: new Date().toISOString()
        }
      };
    }
  }

  static async storeAIMemory(data: {
    user_id: string;
    content: string;
    memory_type: string;
    context?: any;
    importance_score?: number;
  }) {
    try {
      await supabase
        .from('ai_memory')
        .insert({
          user_id: data.user_id,
          content: data.content,
          memory_type: data.memory_type,
          context: data.context,
          importance_score: data.importance_score || 5
        });
    } catch (error) {
      console.error('Error storing AI memory:', error);
    }
  }

  static async getAIMemory(userId: string, memoryType?: string) {
    try {
      let query = supabase
        .from('ai_memory')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (memoryType) {
        query = query.eq('memory_type', memoryType);
      }

      const { data } = await query.limit(20);
      return data || [];
    } catch (error) {
      console.error('Error getting AI memory:', error);
      return [];
    }
  }
}
