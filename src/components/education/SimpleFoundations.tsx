
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle, 
  ArrowRight,
  Target,
  Brain,
  Trophy,
  Zap
} from 'lucide-react';

interface SimpleFoundationsProps {
  onStartAIMentor: () => void;
}

const SimpleFoundations: React.FC<SimpleFoundationsProps> = ({ onStartAIMentor }) => {
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);

  const learningPath = [
    {
      id: 'basics',
      title: 'Trading Basics',
      description: 'What is forex? Currency pairs, market hours, and basic terminology',
      duration: '15 min chat with AI'
    },
    {
      id: 'charts',
      title: 'Reading Charts',
      description: 'Candlesticks, trends, and basic price action',
      duration: '20 min guided practice'
    },
    {
      id: 'risk',
      title: 'Risk Management',
      description: 'Position sizing, stop losses, and capital protection',
      duration: '25 min interactive session'
    },
    {
      id: 'strategy',
      title: 'First Strategy',
      description: 'Simple, proven approach to finding trades',
      duration: '30 min step-by-step'
    }
  ];

  const progressPercentage = (completedTopics.length / learningPath.length) * 100;

  const markComplete = (topicId: string) => {
    setCompletedTopics(prev => [...prev, topicId]);
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="glass-card border-blue-500/20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center text-xl">
            <BookOpen className="w-6 h-6 mr-3" />
            Your Trading Journey
          </CardTitle>
          <p className="text-gray-300">
            Learn trading step-by-step with AI guidance. Start with the basics and build up to real strategies.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Progress</span>
              <span className="text-white font-bold">{completedTopics.length}/{learningPath.length} Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{Math.round(progressPercentage)}%</div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{completedTopics.length * 20}</div>
                <div className="text-xs text-gray-400">XP Earned</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-2xl">🎯</div>
                <div className="text-xs text-gray-400">Level {Math.floor(completedTopics.length / 2) + 1}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Mentor CTA */}
      <Card className="glass-card border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="text-4xl">🧠</div>
            <h3 className="text-xl font-bold text-white">Start Learning with AI Mentor</h3>
            <p className="text-gray-300">
              Skip the boring theory. Chat with Aasakira, your AI trading mentor, and learn as you go. 
              Ask questions, get personalized guidance, and build real trading skills through conversation.
            </p>
            <Button
              onClick={onStartAIMentor}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-3"
            >
              <Brain className="w-5 h-5 mr-2" />
              Start AI Learning Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Learning Path */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Recommended Learning Path</h3>
        <p className="text-gray-400 text-sm">
          While the AI mentor can teach you anything, here's a proven path that works for beginners:
        </p>
        
        <div className="grid gap-4">
          {learningPath.map((topic, index) => {
            const isCompleted = completedTopics.includes(topic.id);
            const isNext = index === 0 || completedTopics.includes(learningPath[index - 1].id);
            
            return (
              <Card 
                key={topic.id}
                className={`glass-card transition-all duration-300 ${
                  isCompleted ? 'border-green-500/50 bg-green-500/5' :
                  isNext ? 'border-blue-500/30 hover:border-blue-500/50' :
                  'border-gray-600/30 bg-gray-800/30'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        isCompleted ? 'bg-green-500/20 ring-2 ring-green-500/30' :
                        isNext ? 'bg-blue-500/20 ring-2 ring-blue-500/30' :
                        'bg-gray-600/20'
                      }`}>
                        {isCompleted ? (
                          <Trophy className="w-6 h-6 text-green-400" />
                        ) : (
                          <Target className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                      
                      <div>
                        <h4 className={`font-semibold ${isNext || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                          {topic.title}
                        </h4>
                        <p className={`text-sm ${isNext || isCompleted ? 'text-gray-300' : 'text-gray-600'}`}>
                          {topic.description}
                        </p>
                        <div className={`text-xs mt-1 ${isNext || isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                          {topic.duration}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {isCompleted ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Done
                        </Badge>
                      ) : isNext ? (
                        <Button
                          onClick={onStartAIMentor}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      ) : (
                        <Badge className="bg-gray-600/20 text-gray-500 border-gray-600/30">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="glass-card border-yellow-500/20 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Zap className="w-6 h-6 text-yellow-400 mt-1" />
            <div>
              <h4 className="font-semibold text-white mb-2">Pro Tips for Learning</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Ask the AI mentor specific questions about what you don't understand</li>
                <li>• Practice with demo trades as you learn new concepts</li>
                <li>• Take notes on key insights from your AI conversations</li>
                <li>• Don't rush - understanding beats memorizing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleFoundations;
