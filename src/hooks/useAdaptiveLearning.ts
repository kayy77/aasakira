
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LearningMetrics {
  correctAnswers: number;
  totalAttempts: number;
  averageResponseTime: number;
  strugglingTopics: string[];
  strengths: string[];
  lastActivity: Date;
}

interface AdaptiveRecommendation {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reason: string;
  estimatedTime: number;
}

export const useAdaptiveLearning = (userId: string) => {
  const [metrics, setMetrics] = useState<LearningMetrics>({
    correctAnswers: 0,
    totalAttempts: 0,
    averageResponseTime: 0,
    strugglingTopics: [],
    strengths: [],
    lastActivity: new Date()
  });
  
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserMetrics();
    }
  }, [userId]);

  const loadUserMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Load user progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (progress) {
        setMetrics({
          correctAnswers: progress.charts_analyzed || 0,
          totalAttempts: progress.signals_viewed || 0,
          averageResponseTime: progress.total_study_time_minutes || 0,
          strugglingTopics: Array.isArray(progress.weaknesses) ? progress.weaknesses : [],
          strengths: Array.isArray(progress.skills_mastered) ? progress.skills_mastered : [],
          lastActivity: new Date(progress.updated_at)
        });
      }

      // Load recent activities for adaptive recommendations
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      generateRecommendations(activities || []);
    } catch (error) {
      console.error('Error loading user metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = (activities: any[]) => {
    const recs: AdaptiveRecommendation[] = [];
    
    // Analyze user activity patterns
    const recentTopics = activities.map(activity => {
      if (activity.data && typeof activity.data === 'object' && 'topic' in activity.data) {
        return activity.data.topic as string;
      }
      return activity.activity_type;
    });

    // Generate personalized recommendations
    if (metrics.strugglingTopics.includes('risk-management')) {
      recs.push({
        topic: 'Advanced Risk Management',
        difficulty: 'intermediate',
        reason: 'Identified as struggling topic',
        estimatedTime: 45
      });
    }

    if (metrics.correctAnswers < 5) {
      recs.push({
        topic: 'Trading Fundamentals Review',
        difficulty: 'beginner',
        reason: 'Build foundation knowledge',
        estimatedTime: 30
      });
    }

    if (metrics.strengths.includes('chart-analysis')) {
      recs.push({
        topic: 'Advanced Chart Patterns',
        difficulty: 'advanced',
        reason: 'Leverage existing strength',
        estimatedTime: 60
      });
    }

    setRecommendations(recs);
  };

  const recordActivity = async (activityType: string, data: any = {}) => {
    try {
      await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          data: data
        });

      // Update metrics
      await loadUserMetrics();
    } catch (error) {
      console.error('Error recording activity:', error);
    }
  };

  const updateProgress = async (topic: string, correct: boolean, responseTime: number) => {
    try {
      const newCorrectAnswers = correct ? metrics.correctAnswers + 1 : metrics.correctAnswers;
      const newTotalAttempts = metrics.totalAttempts + 1;
      
      let newStrugglingTopics = [...metrics.strugglingTopics];
      let newStrengths = [...metrics.strengths];

      if (!correct && !newStrugglingTopics.includes(topic)) {
        newStrugglingTopics.push(topic);
      } else if (correct && newStrugglingTopics.includes(topic)) {
        newStrugglingTopics = newStrugglingTopics.filter(t => t !== topic);
        if (!newStrengths.includes(topic)) {
          newStrengths.push(topic);
        }
      }

      await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          charts_analyzed: newCorrectAnswers,
          signals_viewed: newTotalAttempts,
          total_study_time_minutes: Math.round((metrics.averageResponseTime + responseTime) / 2),
          weaknesses: newStrugglingTopics,
          skills_mastered: newStrengths,
          updated_at: new Date().toISOString()
        });

      setMetrics(prev => ({
        ...prev,
        correctAnswers: newCorrectAnswers,
        totalAttempts: newTotalAttempts,
        averageResponseTime: Math.round((prev.averageResponseTime + responseTime) / 2),
        strugglingTopics: newStrugglingTopics,
        strengths: newStrengths,
        lastActivity: new Date()
      }));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return {
    metrics,
    recommendations,
    isLoading,
    recordActivity,
    updateProgress,
    loadUserMetrics
  };
};
