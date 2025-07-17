import { supabase } from '@/integrations/supabase/client';

export interface UserActivity {
  user_id: string;
  activity_type: 'signal_view' | 'meme_scan' | 'trade_game' | 'chat_message' | 'chart_analysis' | 'mentor_prompt' | 'education_view' | 'affiliate_click' | 'signal_skip' | 'signal_action';
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
  memory_type: 'conversation' | 'preference' | 'mistake' | 'strength' | 'behavior_pattern';
  content: string;
  importance_score: number;
  context: Record<string, any>;
}

export class UserTrackingService {
  // Universal event tracker
  static async trackUserEvent(userId: string, event: string, data: any): Promise<void> {
    try {
      console.log('🎯 TRACKING EVENT:', { userId, event, data });
      
      const activity: UserActivity = {
        user_id: userId,
        activity_type: event as UserActivity['activity_type'],
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          platform_context: 'aasakira_elite'
        }
      };

      await this.trackActivity(activity);
    } catch (error) {
      console.error('Failed to track user event:', error);
    }
  }

  // Track user activity with enhanced context
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

  // Enhanced behavior analysis for AI context
  static async getUserBehaviorContext(userId: string): Promise<any> {
    try {
      const [activities, progress, memories] = await Promise.all([
        this.getRecentActivities(userId, 20),
        this.getUserProgress(userId),
        this.getAIMemory(userId, 15)
      ]);

      // Analyze patterns
      const signalViews = activities.filter(a => a.activity_type === 'signal_view');
      const signalSkips = activities.filter(a => a.activity_type === 'signal_skip');
      const mentorPrompts = activities.filter(a => a.activity_type === 'mentor_prompt');

      const behaviorPatterns = {
        signalEngagement: {
          totalViewed: signalViews.length,
          totalSkipped: signalSkips.length,
          skipRate: signalSkips.length / (signalViews.length + signalSkips.length) * 100,
          preferredPairs: this.extractMostFrequent(signalViews.map(s => s.data.pair)),
          averageConfidenceThreshold: this.calculateAverageConfidence(signalViews)
        },
        mentorInteraction: {
          totalPrompts: mentorPrompts.length,
          commonTopics: this.extractTopics(mentorPrompts),
          lastInteraction: mentorPrompts[0]?.data?.timestamp || null
        },
        tradingHabits: {
          activeTimeOfDay: this.analyzeActivityTimes(activities),
          frameworkPreference: this.extractFrameworkPreference(activities),
          riskProfile: this.analyzeRiskProfile(activities)
        }
      };

      return {
        activities: activities.slice(0, 10), // Recent 10 for context
        progress,
        memories: memories.slice(0, 10),
        behaviorPatterns,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting user behavior context:', error);
      return null;
    }
  }

  // Specific tracking methods
  static async trackSignalView(userId: string, signal: any): Promise<void> {
    await this.trackUserEvent(userId, 'signal_view', {
      signal_id: signal.id,
      pair: signal.pair,
      signal_type: signal.type,
      confidence: signal.confidence,
      timeframe: signal.timeframe,
      frameworks: signal.frameworks || [],
      entry_price: signal.entry,
      current_price: signal.currentPrice || signal.livePrice
    });
  }

  static async trackSignalSkip(userId: string, signal: any, reason?: string): Promise<void> {
    await this.trackUserEvent(userId, 'signal_skip', {
      signal_id: signal.id,
      pair: signal.pair,
      confidence: signal.confidence,
      skip_reason: reason || 'unknown',
      timeframe: signal.timeframe
    });
  }

  static async trackMentorPrompt(userId: string, prompt: string, context?: any): Promise<void> {
    await this.trackUserEvent(userId, 'mentor_prompt', {
      prompt_text: prompt,
      prompt_length: prompt.length,
      context_signal: context?.signal || null,
      context_page: context?.page || 'mentor',
      session_time: context?.sessionTime || new Date().toISOString()
    });
  }

  static async trackEducationView(userId: string, module: string, timeSpent?: number): Promise<void> {
    await this.trackUserEvent(userId, 'education_view', {
      module_name: module,
      time_spent_minutes: timeSpent || 0,
      completion_status: timeSpent && timeSpent > 5 ? 'engaged' : 'browsed'
    });
  }

  static async trackSignalAction(userId: string, signal: any, action: 'copied' | 'screenshot' | 'shared'): Promise<void> {
    await this.trackUserEvent(userId, 'signal_action', {
      signal_id: signal.id,
      pair: signal.pair,
      action_type: action,
      confidence: signal.confidence,
      signal_type: signal.type
    });
  }

  // Analysis helper methods
  private static extractMostFrequent(items: string[]): string[] {
    const frequency: Record<string, number> = {};
    items.forEach(item => {
      if (item) frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([item]) => item);
  }

  private static calculateAverageConfidence(signalViews: any[]): number {
    const confidences = signalViews
      .map(s => s.data.confidence)
      .filter(c => typeof c === 'number');
    
    return confidences.length > 0 
      ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length 
      : 0;
  }

  private static extractTopics(mentorPrompts: any[]): string[] {
    const topics = mentorPrompts
      .map(p => p.data.prompt_text)
      .join(' ')
      .toLowerCase();
    
    const commonTopics = [
      'risk management', 'stop loss', 'take profit', 'entry', 'confluence',
      'structure', 'liquidity', 'smc', 'bos', 'fvg', 'imbalance'
    ];
    
    return commonTopics.filter(topic => topics.includes(topic));
  }

  private static analyzeActivityTimes(activities: any[]): string {
    const hours = activities.map(a => {
      const date = new Date(a.data.timestamp || a.created_at);
      return date.getHours();
    });
    
    const hourFreq: Record<number, number> = {};
    hours.forEach(h => hourFreq[h] = (hourFreq[h] || 0) + 1);
    
    const mostActiveHour = Object.entries(hourFreq)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    if (!mostActiveHour) return 'Unknown';
    
    const hour = parseInt(mostActiveHour);
    if (hour >= 6 && hour < 12) return 'Morning Trader';
    if (hour >= 12 && hour < 18) return 'Afternoon Trader';
    if (hour >= 18 && hour < 24) return 'Evening Trader';
    return 'Night Trader';
  }

  private static extractFrameworkPreference(activities: any[]): string[] {
    const frameworks = activities
      .filter(a => a.activity_type === 'signal_view')
      .flatMap(a => a.data.frameworks || []);
    
    return this.extractMostFrequent(frameworks);
  }

  private static analyzeRiskProfile(activities: any[]): string {
    const signalViews = activities.filter(a => a.activity_type === 'signal_view');
    const avgConfidence = this.calculateAverageConfidence(signalViews);
    
    if (avgConfidence > 80) return 'Conservative - High Confidence Only';
    if (avgConfidence > 65) return 'Moderate - Balanced Approach';
    if (avgConfidence > 45) return 'Aggressive - Lower Confidence Tolerance';
    return 'High Risk - All Signals Considered';
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
    return this.getUserBehaviorContext(userId);
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
