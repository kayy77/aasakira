
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Target, 
  Eye,
  Lightbulb,
  BookOpen,
  Brain
} from 'lucide-react';

interface VisualLessonCardProps {
  title: string;
  description: string;
  keyPoints: string[];
  visualType: 'chart' | 'concept' | 'strategy' | 'psychology';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const VisualLessonCard: React.FC<VisualLessonCardProps> = ({
  title,
  description,
  keyPoints,
  visualType,
  difficulty
}) => {
  const getVisualIcon = () => {
    switch (visualType) {
      case 'chart': return <BarChart3 className="w-8 h-8" />;
      case 'concept': return <Lightbulb className="w-8 h-8" />;
      case 'strategy': return <Target className="w-8 h-8" />;
      case 'psychology': return <Brain className="w-8 h-8" />;
    }
  };

  const getVisualContent = () => {
    switch (visualType) {
      case 'chart':
        return (
          <div className="bg-gradient-to-br from-green-500/20 to-red-500/20 p-6 rounded-xl border border-gray-600">
            <div className="grid grid-cols-3 gap-2 h-24">
              {[...Array(9)].map((_, i) => (
                <div 
                  key={i} 
                  className={`rounded ${i % 3 === 0 ? 'bg-green-400/40' : i % 3 === 1 ? 'bg-red-400/40' : 'bg-gray-400/40'}`}
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-green-400">📈 BUY</span>
              <span className="text-gray-400">Market Movement</span>
              <span className="text-red-400">📉 SELL</span>
            </div>
          </div>
        );
      
      case 'concept':
        return (
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-6 rounded-xl border border-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 bg-blue-400/60 rounded"></div>
                <div className="h-2 bg-blue-400/40 rounded w-3/4"></div>
                <div className="h-2 bg-blue-400/20 rounded w-1/2"></div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'strategy':
        return (
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 rounded-xl border border-gray-600">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-4 h-4 rounded-full bg-green-400"></div>
                <div className="flex-1 h-1 bg-gradient-to-r from-green-400 to-red-400 mx-2"></div>
                <div className="w-4 h-4 rounded-full bg-red-400"></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <span className="text-green-400">Entry</span>
                <span className="text-yellow-400">Management</span>
                <span className="text-red-400">Exit</span>
              </div>
            </div>
          </div>
        );
      
      case 'psychology':
        return (
          <div className="bg-gradient-to-br from-indigo-500/20 to-pink-500/20 p-6 rounded-xl border border-gray-600">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-400/30 flex items-center justify-center mb-2">
                  😰
                </div>
                <span className="text-xs text-red-400">Fear</span>
              </div>
              <div className="text-2xl">→</div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-400/30 flex items-center justify-center mb-2">
                  😌
                </div>
                <span className="text-xs text-green-400">Control</span>
              </div>
            </div>
          </div>
        );
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  return (
    <Card className="glass-card hover:border-purple-400/40 transition-all duration-300 group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:bg-purple-500/30 transition-colors">
              {getVisualIcon()}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg group-hover:text-purple-300 transition-colors">
                {title}
              </h3>
              <p className="text-gray-400 text-sm">{description}</p>
            </div>
          </div>
          <Badge className={getDifficultyColor()}>
            {difficulty}
          </Badge>
        </div>

        {/* Visual Content */}
        <div className="mb-6">
          {getVisualContent()}
        </div>

        {/* Key Points */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
            <Eye className="w-4 h-4" />
            Key Learning Points
          </div>
          <div className="grid gap-2">
            {keyPoints.slice(0, 3).map((point, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Visual Learning Module</span>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>Interactive Content</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisualLessonCard;
