
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserProgress {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  completedLessons: string[];
  strengths: string[];
  weaknesses: string[];
  tradingStyle: 'Scalper' | 'Day Trader' | 'Swing Trader' | 'Position Trader' | null;
  goals: string[];
  lastActivity: string;
}

interface MentorMemoryContextType {
  userProgress: UserProgress;
  updateProgress: (updates: Partial<UserProgress>) => void;
  addCompletedLesson: (lessonId: string) => void;
  getPersonalizedContent: () => string[];
}

const MentorMemoryContext = createContext<MentorMemoryContextType | undefined>(undefined);

export const MentorMemoryProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 'Beginner',
    completedLessons: [],
    strengths: [],
    weaknesses: [],
    tradingStyle: null,
    goals: [],
    lastActivity: new Date().toISOString()
  });

  // Load user progress from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`mentor_progress_${user.id}`);
      if (saved) {
        setUserProgress(JSON.parse(saved));
      }
    }
  }, [user]);

  // Save progress to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`mentor_progress_${user.id}`, JSON.stringify(userProgress));
    }
  }, [userProgress, user]);

  const updateProgress = (updates: Partial<UserProgress>) => {
    setUserProgress(prev => ({
      ...prev,
      ...updates,
      lastActivity: new Date().toISOString()
    }));
  };

  const addCompletedLesson = (lessonId: string) => {
    setUserProgress(prev => ({
      ...prev,
      completedLessons: [...prev.completedLessons, lessonId],
      lastActivity: new Date().toISOString()
    }));
  };

  const getPersonalizedContent = (): string[] => {
    const content = [];
    
    if (userProgress.level === 'Beginner') {
      content.push('Start with basic risk management');
      content.push('Learn to read candlestick patterns');
      content.push('Understand support and resistance');
    } else if (userProgress.level === 'Intermediate') {
      content.push('Advanced technical analysis');
      content.push('Multiple timeframe analysis');
      content.push('Psychology and discipline');
    } else {
      content.push('Market structure analysis');
      content.push('Order flow and smart money concepts');
      content.push('Advanced position sizing');
    }

    if (userProgress.weaknesses.includes('Risk Management')) {
      content.push('Focus on position sizing rules');
      content.push('Practice stop loss placement');
    }

    return content;
  };

  return (
    <MentorMemoryContext.Provider value={{
      userProgress,
      updateProgress,
      addCompletedLesson,
      getPersonalizedContent
    }}>
      {children}
    </MentorMemoryContext.Provider>
  );
};

export const useMentorMemory = () => {
  const context = useContext(MentorMemoryContext);
  if (!context) {
    throw new Error('useMentorMemory must be used within MentorMemoryProvider');
  }
  return context;
};
