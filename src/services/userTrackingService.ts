
import { supabase } from '@/integrations/supabase/client';

export interface UserEvent {
  user_id: string;
  event_type: string;
  event_data: any;
  timestamp: string;
  session_id?: string;
}

export interface UserBehaviorContext {
  recentSignals: any[];
  tradingExperience: string;
  preferredPairs: string[];
  riskTolerance: string;
  learningGoals: string[];
  behaviorPatterns: any;
}

class UserTrackingService {
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async trackEvent(userId: string, eventType: string, eventData: any): Promise<void> {
    try {
      console.log('📊 Tracking event:', { userId, eventType, eventData });
      
      const event: UserEvent = {
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        timestamp: new Date().toISOString(),
        session_id: this.sessionId
      };

      // In a real implementation, this would go to your tracking database
      // For now, we'll store in localStorage and console log
      const existingEvents = JSON.parse(localStorage.getItem('user_events') || '[]');
      existingEvents.push(event);
      localStorage.setItem('user_events', JSON.stringify(existingEvents.slice(-100))); // Keep last 100 events

    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  async getUserBehaviorContext(userId: string): Promise<UserBehaviorContext | null> {
    try {
      const events = JSON.parse(localStorage.getItem('user_events') || '[]');
      const userEvents = events.filter((e: UserEvent) => e.user_id === userId);

      return {
        recentSignals: userEvents.filter(e => e.event_type === 'signal_view').slice(-5),
        tradingExperience: this.inferExperience(userEvents),
        preferredPairs: this.extractPreferredPairs(userEvents),
        riskTolerance: 'Conservative',
        learningGoals: ['Basic Trading Concepts'],
        behaviorPatterns: this.analyzeBehaviorPatterns(userEvents)
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  }

  async trackMentorPrompt(userId: string, prompt: string, context?: any): Promise<void> {
    await this.trackEvent(userId, 'mentor_prompt', {
      prompt,
      context,
      length: prompt.length
    });
  }

  async storeAIMemory(memory: any): Promise<void> {
    try {
      console.log('🧠 Storing AI memory:', memory);
      // Store in localStorage for now
      const existingMemory = JSON.parse(localStorage.getItem('ai_memory') || '[]');
      existingMemory.push({ ...memory, timestamp: new Date().toISOString() });
      localStorage.setItem('ai_memory', JSON.stringify(existingMemory.slice(-50)));
    } catch (error) {
      console.error('Error storing AI memory:', error);
    }
  }

  private inferExperience(events: UserEvent[]): string {
    const totalEvents = events.length;
    if (totalEvents < 10) return 'Complete Beginner';
    if (totalEvents < 50) return 'Beginner';
    if (totalEvents < 200) return 'Intermediate';
    return 'Advanced';
  }

  private extractPreferredPairs(events: UserEvent[]): string[] {
    const signalEvents = events.filter(e => e.event_type === 'signal_view');
    const pairCounts: { [key: string]: number } = {};
    
    signalEvents.forEach(event => {
      const pair = event.event_data?.pair;
      if (pair) {
        pairCounts[pair] = (pairCounts[pair] || 0) + 1;
      }
    });

    return Object.entries(pairCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([pair]) => pair);
  }

  private analyzeBehaviorPatterns(events: UserEvent[]): any {
    return {
      totalInteractions: events.length,
      averageSessionLength: '5 minutes',
      mostActiveHours: ['14:00', '20:00'],
      learningStyle: 'Visual'
    };
  }
}

export { UserTrackingService };
export const userTrackingService = new UserTrackingService();
