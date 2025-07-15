
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserTrackingService } from '@/services/userTrackingService';

export type TraderLevel = 'Novice' | 'Intermediate' | 'Smart Money Aware' | 'Advanced Strategist';

interface LevelMetrics {
  quizAccuracy: number;
  avgResponseTime: number;
  conceptsLearned: string[];
  chartUploads: number;
  advancedTermsUsed: string[];
  totalInteractions: number;
}

interface AdaptiveLearningData {
  level: TraderLevel;
  score: number; // 0-100
  metrics: LevelMetrics;
  nextLevelRequirements: string[];
}

const ADVANCED_TERMS = [
  'liquidity grab', 'fair value gap', 'order block', 'break of structure', 
  'change of character', 'breaker block', 'imbalance', 'smart money', 
  'institutional flow', 'supply and demand', 'stop hunt', 'wyckoff'
];

const BASIC_TERMS = [
  'support', 'resistance', 'trend', 'bullish', 'bearish', 
  'entry', 'exit', 'profit', 'loss', 'chart'
];

export const useAdaptiveLearning = () => {
  const { user } = useAuth();
  const [learningData, setLearningData] = useState<AdaptiveLearningData>({
    level: 'Novice',
    score: 10,
    metrics: {
      quizAccuracy: 0,
      avgResponseTime: 0,
      conceptsLearned: [],
      chartUploads: 0,
      advancedTermsUsed: [],
      totalInteractions: 0
    },
    nextLevelRequirements: []
  });

  const calculateLevel = (score: number): TraderLevel => {
    if (score >= 80) return 'Advanced Strategist';
    if (score >= 60) return 'Smart Money Aware';
    if (score >= 30) return 'Intermediate';
    return 'Novice';
  };

  const getNextLevelRequirements = (level: TraderLevel): string[] => {
    switch (level) {
      case 'Novice':
        return [
          'Complete 5 basic trading quizzes',
          'Learn fundamental concepts',
          'Upload your first chart for analysis'
        ];
      case 'Intermediate':
        return [
          'Master Smart Money Concepts',
          'Achieve 70% quiz accuracy',
          'Use advanced trading terminology'
        ];
      case 'Smart Money Aware':
        return [
          'Demonstrate advanced market structure analysis',
          'Maintain 80% quiz accuracy',
          'Upload complex strategy examples'
        ];
      case 'Advanced Strategist':
        return [
          'Mentor other traders',
          'Create advanced trading strategies',
          'Master institutional concepts'
        ];
    }
  };

  const analyzeMessage = (message: string): number => {
    const lowerMessage = message.toLowerCase();
    let points = 0;
    
    // Advanced terminology usage
    ADVANCED_TERMS.forEach(term => {
      if (lowerMessage.includes(term)) points += 3;
    });
    
    // Question complexity
    if (lowerMessage.includes('how') || lowerMessage.includes('why')) points += 1;
    if (lowerMessage.includes('structure') || lowerMessage.includes('institutional')) points += 2;
    
    // Length and detail (longer, detailed questions = higher level)
    if (message.length > 100) points += 1;
    if (message.length > 200) points += 2;
    
    return Math.min(points, 10); // Cap at 10 points per message
  };

  const updateLearningProgress = async (activity: {
    type: 'quiz' | 'message' | 'chart_upload';
    data: any;
  }) => {
    if (!user?.id) return;

    let scoreChange = 0;
    const newMetrics = { ...learningData.metrics };

    switch (activity.type) {
      case 'quiz':
        const accuracy = activity.data.correct / activity.data.total;
        newMetrics.quizAccuracy = (newMetrics.quizAccuracy + accuracy) / 2;
        scoreChange = accuracy > 0.8 ? 5 : accuracy > 0.6 ? 3 : 1;
        break;

      case 'message':
        scoreChange = analyzeMessage(activity.data.message);
        newMetrics.totalInteractions += 1;
        
        // Track advanced terms
        ADVANCED_TERMS.forEach(term => {
          if (activity.data.message.toLowerCase().includes(term) && 
              !newMetrics.advancedTermsUsed.includes(term)) {
            newMetrics.advancedTermsUsed.push(term);
          }
        });
        break;

      case 'chart_upload':
        newMetrics.chartUploads += 1;
        scoreChange = 3; // Chart uploads show engagement
        break;
    }

    const newScore = Math.min(100, Math.max(0, learningData.score + scoreChange));
    const newLevel = calculateLevel(newScore);

    const updatedData: AdaptiveLearningData = {
      level: newLevel,
      score: newScore,
      metrics: newMetrics,
      nextLevelRequirements: getNextLevelRequirements(newLevel)
    };

    setLearningData(updatedData);

    // Store progress
    try {
      await UserTrackingService.storeAIMemory({
        user_id: user.id,
        memory_type: 'preference',
        content: JSON.stringify(updatedData),
        importance_score: 8,
        context: {
          type: 'adaptive_learning_progress',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.warn('Failed to store learning progress:', error);
    }
  };

  const getMentorPersonality = () => {
    switch (learningData.level) {
      case 'Novice':
        return {
          tone: 'encouraging and simple',
          terminology: 'basic trading terms',
          examples: 'simple chart patterns',
          encouragement: 'Great start! Every master was once a beginner.'
        };
      case 'Intermediate':
        return {
          tone: 'supportive with more detail',
          terminology: 'intermediate concepts',
          examples: 'real market scenarios',
          encouragement: 'You\'re building solid foundations. Keep pushing forward!'
        };
      case 'Smart Money Aware':
        return {
          tone: 'tactical and strategic',
          terminology: 'smart money concepts',
          examples: 'institutional trading setups',
          encouragement: 'Your understanding is deepening. Think like the institutions.'
        };
      case 'Advanced Strategist':
        return {
          tone: 'peer-to-peer expert',
          terminology: 'advanced institutional concepts',
          examples: 'complex multi-timeframe analysis',
          encouragement: 'Your mastery shows. Lead others on their journey.'
        };
    }
  };

  const getQuizDifficulty = (): 'easy' | 'medium' | 'hard' => {
    switch (learningData.level) {
      case 'Novice': return 'easy';
      case 'Intermediate': return 'medium';
      case 'Smart Money Aware': return 'hard';
      case 'Advanced Strategist': return 'hard';
    }
  };

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id) return;

      try {
        const memories = await UserTrackingService.getAIMemory(user.id, 10);
        const progressMemory = memories.find(m => 
          m.context?.type === 'adaptive_learning_progress'
        );

        if (progressMemory) {
          const savedData = JSON.parse(progressMemory.content);
          setLearningData(savedData);
        }
      } catch (error) {
        console.warn('Failed to load learning progress:', error);
      }
    };

    loadProgress();
  }, [user?.id]);

  return {
    learningData,
    updateLearningProgress,
    getMentorPersonality,
    getQuizDifficulty,
    analyzeMessage
  };
};
