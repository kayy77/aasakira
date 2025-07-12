
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Eye,
  Star,
  BookOpen,
  Zap,
  Shield
} from 'lucide-react';

interface LearningData {
  conceptsMastered: string[];
  weaknesses: string[];
  strengths: string[];
  studyTime: number;
  winRate: number;
  avgReactionTime: number;
  preferredPairs: string[];
  tradingStyle: string;
}

interface LearningProgressProps {
  userStats: {
    wins: number;
    losses: number;
    streak: number;
    points: number;
    tradingStyle: string;
  };
  onLearningUpdate?: (data: LearningData) => void;
}

const LearningProgress = ({ userStats, onLearningUpdate }: LearningProgressProps) => {
  const [learningData, setLearningData] = useState<LearningData>({
    conceptsMastered: ['Support/Resistance', 'Candlestick Patterns', 'Trend Analysis'],
    weaknesses: ['News Trading', 'Risk Management'],
    strengths: ['Pattern Recognition', 'Entry Timing'],
    studyTime: 47, // hours
    winRate: (userStats.wins / (userStats.wins + userStats.losses)) * 100,
    avgReactionTime: 2.3, // seconds
    preferredPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
    tradingStyle: userStats.tradingStyle
  });

  const [aiInsights, setAiInsights] = useState([
    {
      type: 'strength',
      message: "Your pattern recognition has improved 34% this week! You're identifying breakouts faster.",
      icon: Star,
      color: 'text-green-400'
    },
    {
      type: 'weakness',
      message: "Consider studying smart money concepts. Your losses often happen at major levels.",
      icon: Target,
      color: 'text-orange-400'
    },
    {
      type: 'opportunity',
      message: "You excel at trend continuation. Try the 'Momentum Master' skill tree next.",
      icon: TrendingUp,
      color: 'text-blue-400'
    }
  ]);

  const getLearningLevel = (): { level: number; title: string; nextTitle: string; progress: number } => {
    const totalConcepts = learningData.conceptsMastered.length;
    if (totalConcepts < 5) return { level: 1, title: 'Apprentice', nextTitle: 'Student', progress: (totalConcepts / 5) * 100 };
    if (totalConcepts < 10) return { level: 2, title: 'Student', nextTitle: 'Practitioner', progress: ((totalConcepts - 5) / 5) * 100 };
    if (totalConcepts < 15) return { level: 3, title: 'Practitioner', nextTitle: 'Expert', progress: ((totalConcepts - 10) / 5) * 100 };
    return { level: 4, title: 'Expert', nextTitle: 'Master', progress: Math.min(((totalConcepts - 15) / 5) * 100, 100) };
  };

  const learningLevel = getLearningLevel();

  useEffect(() => {
    onLearningUpdate?.(learningData);
  }, [learningData, onLearningUpdate]);

  return (
    <div className="space-y-6">
      {/* Learning Level Card */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-400">
            <BookOpen className="w-5 h-5 mr-2" />
            Learning Progress
            <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500">
              Level {learningLevel.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-1">{learningLevel.title}</h3>
            <p className="text-sm text-gray-400">
              {learningData.conceptsMastered.length} concepts mastered • {learningData.studyTime}h study time
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Progress to {learningLevel.nextTitle}</span>
              <span className="text-purple-400">{Math.round(learningLevel.progress)}%</span>
            </div>
            <Progress value={learningLevel.progress} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-400">{Math.round(learningData.winRate)}%</div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-400">{learningData.avgReactionTime}s</div>
              <div className="text-xs text-gray-400">Avg Response</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">{userStats.streak}</div>
              <div className="text-xs text-gray-400">Current Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-400">
            <Brain className="w-5 h-5 mr-2" />
            AI Learning Insights
            <Badge className="ml-2 bg-gradient-to-r from-blue-500 to-cyan-500">
              Personalized
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiInsights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/30 rounded-lg">
                <IconComponent className={`w-5 h-5 mt-0.5 ${insight.color}`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{insight.message}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Concepts Mastered */}
      <Card className="glass-card border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-green-400">
            <Shield className="w-5 h-5 mr-2" />
            Mastered Concepts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {learningData.conceptsMastered.map((concept, index) => (
              <Badge key={index} className="bg-green-900/20 text-green-400 border border-green-500/30">
                <Star className="w-3 h-3 mr-1" />
                {concept}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Areas to Improve */}
      <Card className="glass-card border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-400">
            <Target className="w-5 h-5 mr-2" />
            Focus Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {learningData.weaknesses.map((weakness, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-900/10 rounded-lg border border-orange-500/20">
                <span className="text-orange-400">{weakness}</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                    Priority
                  </Badge>
                  <Zap className="w-4 h-4 text-orange-400" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningProgress;
