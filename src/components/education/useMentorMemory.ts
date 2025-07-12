
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface MentorInteraction {
  type: 'message' | 'image' | 'lesson';
  content: string;
  response: string;
  timestamp: Date;
}

export interface MentorGoal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  progress: number;
}

export interface MentorState {
  userLevel: number;
  interactions: MentorInteraction[];
  goals: MentorGoal[];
  progress: {
    messages?: number;
    screenshots?: number;
    concepts?: number;
    risk?: number;
    psychology?: number;
  };
}

export const useMentorMemory = () => {
  const { user } = useAuth();
  const [state, setState] = useState<MentorState>({
    userLevel: 1,
    interactions: [],
    goals: [],
    progress: {
      messages: 0,
      screenshots: 0,
      concepts: 0,
      risk: 0,
      psychology: 0,
    }
  });

  // Load state from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`mentor_state_${user.id}`);
      if (saved) {
        try {
          const parsedState = JSON.parse(saved);
          // Convert timestamp strings back to Date objects
          parsedState.interactions = parsedState.interactions.map((interaction: any) => ({
            ...interaction,
            timestamp: new Date(interaction.timestamp)
          }));
          setState(parsedState);
        } catch (error) {
          console.error('Failed to parse mentor state:', error);
        }
      }
    }
  }, [user]);

  // Save state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`mentor_state_${user.id}`, JSON.stringify(state));
    }
  }, [state, user]);

  const addInteraction = (interaction: MentorInteraction) => {
    setState(prev => ({
      ...prev,
      interactions: [interaction, ...prev.interactions].slice(0, 50) // Keep last 50
    }));
  };

  const updateProgress = (key: keyof MentorState['progress'], increment: number) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [key]: (prev.progress[key] || 0) + increment
      }
    }));
  };

  const addGoal = (goal: Omit<MentorGoal, 'id'>) => {
    const newGoal: MentorGoal = {
      ...goal,
      id: Date.now().toString()
    };
    setState(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
  };

  const markGoalComplete = (goalId: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(goal =>
        goal.id === goalId ? { ...goal, completed: true, progress: 100 } : goal
      )
    }));
  };

  return {
    state,
    addInteraction,
    updateProgress,
    addGoal,
    markGoalComplete
  };
};
