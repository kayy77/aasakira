
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Star, 
  Zap, 
  Brain, 
  Crown,
  TrendingUp
} from 'lucide-react';
import { TraderLevel } from '@/hooks/useAdaptiveLearning';

interface LevelBadgeProps {
  level: TraderLevel;
  score: number;
  nextRequirements?: string[];
  compact?: boolean;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ 
  level, 
  score, 
  nextRequirements = [], 
  compact = false 
}) => {
  const getLevelConfig = (level: TraderLevel) => {
    switch (level) {
      case 'Novice':
        return {
          icon: Star,
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          gradient: 'from-green-600 to-emerald-600',
          description: 'Learning the basics'
        };
      case 'Intermediate':
        return {
          icon: TrendingUp,
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          gradient: 'from-blue-600 to-cyan-600',
          description: 'Building strong foundations'
        };
      case 'Smart Money Aware':
        return {
          icon: Brain,
          color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          gradient: 'from-purple-600 to-pink-600',
          description: 'Understanding institutional flow'
        };
      case 'Advanced Strategist':
        return {
          icon: Crown,
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          gradient: 'from-yellow-600 to-orange-600',
          description: 'Master trader mindset'
        };
    }
  };

  const config = getLevelConfig(level);
  const IconComponent = config.icon;

  if (compact) {
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {level}
      </Badge>
    );
  }

  return (
    <Card className="border-gray-700/50 bg-gray-800/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${config.gradient}`}>
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">{level}</div>
              <div className="text-xs text-gray-400">{config.description}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{score}</div>
            <div className="text-xs text-gray-400">Level Score</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress to next level</span>
            <span className="text-gray-300">{score}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        {nextRequirements.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-white mb-2">Next Level Goals:</div>
            <div className="space-y-1">
              {nextRequirements.slice(0, 3).map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-300">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  {req}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LevelBadge;
