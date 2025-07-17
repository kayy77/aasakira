import { useState, useEffect } from 'react';

export type TraderLevel = 'Novice' | 'Learning' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';

export interface AdaptiveLearningData {
  level: TraderLevel;
  progress: number;
  strengths: string[];
  weaknesses: string[];
  recommendedLessons: string[];
  totalHoursStudied: number;
  conceptsMastered: number;
  currentFocus: string;
}

export const useAdaptiveLearning = (userId?: string) => {
  const [learningData, setLearningData] = useState<AdaptiveLearningData>({
    level: 'Novice',
    progress: 0,
    strengths: [],
    weaknesses: [],
    recommendedLessons: [],
    totalHoursStudied: 0,
    conceptsMastered: 0,
    currentFocus: 'Market Basics'
  });

  const [isLoading, setIsLoading] = useState(false);

  const updateProgress = async (activity: string, performance: number) => {
    setIsLoading(true);
    try {
      // Simulate API call to update learning data
      await new Promise(resolve => setTimeout(resolve, 500));

      // Example logic to update learning data based on activity and performance
      setLearningData(prevData => {
        let newHours = prevData.totalHoursStudied;
        let newConcepts = prevData.conceptsMastered;
        let newProgress = prevData.progress;

        if (activity === 'Lesson') {
          newHours += 1;
          newConcepts += performance > 70 ? 1 : 0;
          newProgress = Math.min(100, prevData.progress + performance / 10);
        }

        const newLevel = calculateLevel(newHours, newConcepts);

        return {
          ...prevData,
          level: newLevel,
          progress: newProgress,
          totalHoursStudied: newHours,
          conceptsMastered: newConcepts,
          strengths: performance > 80 ? [...prevData.strengths, activity] : prevData.strengths,
          weaknesses: performance < 50 ? [...prevData.weaknesses, activity] : prevData.weaknesses
        };
      });
    } catch (error) {
      console.error("Failed to update learning progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateLevel = (hoursStudied: number, conceptsMastered: number): TraderLevel => {
    if (hoursStudied < 10) return 'Novice';
    if (hoursStudied < 25) return 'Learning';
    if (hoursStudied < 50) return 'Intermediate';
    if (hoursStudied < 100) return 'Advanced';
    if (hoursStudied < 200) return 'Expert';
    return 'Master';
  };

  return {
    learningData,
    updateProgress,
    isLoading
  };
};
