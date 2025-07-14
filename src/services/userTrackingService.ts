import { supabase } from '@/integrations/supabase/client';

export interface UserActivity {
  user_id: string;
  activity_type: 'signal_view' | 'meme_scan' | 'trade_game' | 'chat_message' | 'chart_analysis';
  data: Record<string, any>;
}

export interface UserProgress {
  user_id: string;
  total_study_time_minutes: number;
  messages_sent: number;
  charts_analyzed: number;
  signals_viewed: number;
  meme_coins_scanned: number;
  trading_games_played: number;
  win_rate: number;
  current_streak: number;
  max_streak: number;
  skills_mastered: string[];
  weaknesses: string[];
  trading_style?: string;
  risk_tolerance?: string;
  preferred_timeframes: string[];
}

export interface LearningSession {
  user_id: string;
  session_type: 'chat' | 'chart_analysis' | 'course' | 'trading_game';
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  interactions_count: number;
  performance_score?: number;
  topics_covered: string[];
}

export interface AIMemory {
  user_id: string;
  memory_type: 'conversation' | 'preference' | 'mistake' | 'strength';
  content: string;
  importance_score: number;
  context: Record<string, any>;
}

export class UserTrackingService {
  // Track user activity
  static async trackActivity(activity: UserActivity): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert([activity]);

      if (error) throw error;

      // Update progress using the database function
      await supabase.rpc('update_user_progress', {
        p_user_id: activity.user_id,
        p_activity_type: activity.activity_type,
        p_duration_minutes: activity.data.duration_minutes || null,
        p_performance_score: activity.data.performance_score || null
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  // Get user progress
  static async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  // Start learning session
  static async startLearningSession(session: Omit<LearningSession, 'interactions_count'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .insert([{ ...session, interactions_count: 0 }])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error starting learning session:', error);
      return null;
    }
  }

  // End learning session
  static async endLearningSession(
    sessionId: string, 
    endTime: string, 
    performanceScore?: number
  ): Promise<void> {
    try {
      // Calculate duration manually
      const { data: session } = await supabase
        .from('learning_sessions')
        .select('start_time')
        .eq('id', sessionId)
        .single();

      let duration_minutes = null;
      if (session) {
        const start = new Date(session.start_time);
        const end = new Date(endTime);
        duration_minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      }

      const { error } = await supabase
        .from('learning_sessions')
        .update({
          end_time: endTime,
          performance_score: performanceScore,
          duration_minutes
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error ending learning session:', error);
    }
  }

  // Update session interactions
  static async updateSessionInteractions(sessionId: string, increment: number = 1): Promise<void> {
    try {
      // Get current count and increment
      const { data: session } = await supabase
        .from('learning_sessions')
        .select('interactions_count')
        .eq('id', sessionId)
        .single();

      if (session) {
        const { error } = await supabase
          .from('learning_sessions')
          .update({
            interactions_count: session.interactions_count + increment
          })
          .eq('id', sessionId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating session interactions:', error);
    }
  }

  // Store AI memory
  static async storeAIMemory(memory: AIMemory): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_memory')
        .insert([memory]);

      if (error) throw error;
    } catch (error) {
      console.error('Error storing AI memory:', error);
    }
  }

  // Get AI memory for user
  static async getAIMemory(userId: string, limit: number = 50): Promise<AIMemory[]> {
    try {
      const { data, error } = await supabase
        .from('ai_memory')
        .select('*')
        .eq('user_id', userId)
        .order('importance_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as AIMemory[];
    } catch (error) {
      console.error('Error getting AI memory:', error);
      return [];
    }
  }

  // Get user's recent activities
  static async getRecentActivities(userId: string, limit: number = 20): Promise<UserActivity[]> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(item => ({
        user_id: item.user_id,
        activity_type: item.activity_type as UserActivity['activity_type'],
        data: item.data as Record<string, any>
      }));
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  // Get comprehensive user context for AI
  static async getUserContextForAI(userId: string): Promise<any> {
    try {
      const [progress, activities, memories, sessions] = await Promise.all([
        this.getUserProgress(userId),
        this.getRecentActivities(userId, 10),
        this.getAIMemory(userId, 20),
        supabase
          .from('learning_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      return {
        progress,
        recentActivities: activities,
        memories: memories,
        recentSessions: sessions.data || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting user context for AI:', error);
      return null;
    }
  }

  // Track chart analysis specifically
  static async trackChartAnalysis(userId: string, analysis: any): Promise<void> {
    await this.trackActivity({
      user_id: userId,
      activity_type: 'chart_analysis',
      data: {
        analysis_type: analysis.type || 'general',
        duration_minutes: analysis.duration || 1,
        performance_score: analysis.confidence || 75,
        symbols: analysis.symbols || [],
        timeframes: analysis.timeframes || []
      }
    });
  }

  // Track signal viewing
  static async trackSignalView(userId: string, signal: any): Promise<void> {
    await this.trackActivity({
      user_id: userId,
      activity_type: 'signal_view',
      data: {
        signal_id: signal.id,
        symbol: signal.symbol,
        signal_type: signal.type,
        confidence: signal.confidence,
        timeframe: signal.timeframe
      }
    });
  }

  // Track meme coin scanning
  static async trackMemeCoinScan(userId: string, scan: any): Promise<void> {
    await this.trackActivity({
      user_id: userId,
      activity_type: 'meme_scan',
      data: {
        coins_scanned: scan.count || 1,
        filters_used: scan.filters || [],
        duration_minutes: scan.duration || 1
      }
    });
  }
}