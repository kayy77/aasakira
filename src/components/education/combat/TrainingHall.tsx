
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Lock,
  CheckCircle,
  Star,
  Brain,
  Zap,
  Eye
} from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'education' | 'battle' | 'mastery';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  xpReward: number;
  statBonus: {
    wisdom?: number;
    aggression?: number;
    stealth?: number;
  };
  requirements: string[];
  progress: number;
  maxProgress: number;
  completed: boolean;
  locked: boolean;
}

interface TrainingHallProps {
  quests: Quest[];
  onStartQuest: (questId: string) => void;
  onClaimReward: (questId: string) => void;
}

const TrainingHall = ({ quests, onStartQuest, onClaimReward }: TrainingHallProps) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'education' | 'battle' | 'mastery'>('all');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-600';
      case 'Intermediate': return 'bg-yellow-600';
      case 'Advanced': return 'bg-orange-600';
      case 'Master': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'education': return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'battle': return <Target className="w-5 h-5 text-red-400" />;
      case 'mastery': return <Trophy className="w-5 h-5 text-yellow-400" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const filteredQuests = selectedCategory === 'all' 
    ? quests 
    : quests.filter(quest => quest.type === selectedCategory);

  const getStatIcon = (stat: string) => {
    switch (stat) {
      case 'wisdom': return <Brain className="w-4 h-4 text-cyan-400" />;
      case 'aggression': return <Zap className="w-4 h-4 text-red-400" />;
      case 'stealth': return <Eye className="w-4 h-4 text-purple-400" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl gradient-text">
            <Trophy className="w-8 h-8 mr-3 text-yellow-400" />
            Training Hall - Path of the Trader
          </CardTitle>
          <p className="text-gray-300">
            Complete quests to master trading concepts and unlock your warrior's potential
          </p>
        </CardHeader>
      </Card>

      {/* Category Filters */}
      <div className="flex space-x-2">
        {[
          { id: 'all', label: 'All Quests', icon: Star },
          { id: 'education', label: 'Education', icon: BookOpen },
          { id: 'battle', label: 'Battle', icon: Target },
          { id: 'mastery', label: 'Mastery', icon: Trophy }
        ].map(category => (
          <Button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            className={`flex items-center space-x-2 ${
              selectedCategory === category.id 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                : 'border-purple-500/30'
            }`}
          >
            <category.icon className="w-4 h-4" />
            <span>{category.label}</span>
          </Button>
        ))}
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuests.map((quest) => (
          <Card 
            key={quest.id} 
            className={`glass-card transition-all hover:scale-105 ${
              quest.locked 
                ? 'border-gray-500/20 opacity-60' 
                : quest.completed 
                  ? 'border-green-500/30 bg-green-900/10'
                  : 'border-purple-500/20'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {quest.locked ? (
                    <Lock className="w-5 h-5 text-gray-400" />
                  ) : quest.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    getTypeIcon(quest.type)
                  )}
                  <CardTitle className="text-lg text-white">{quest.title}</CardTitle>
                </div>
                <Badge className={`${getDifficultyColor(quest.difficulty)} text-white text-xs`}>
                  {quest.difficulty}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">{quest.description}</p>
              
              {/* Progress Bar */}
              {!quest.locked && (
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{quest.progress} / {quest.maxProgress}</span>
                  </div>
                  <Progress 
                    value={(quest.progress / quest.maxProgress) * 100} 
                    className="h-2 bg-gray-800"
                  />
                </div>
              )}
              
              {/* Requirements */}
              {quest.requirements.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 font-semibold">Requirements:</span>
                  {quest.requirements.map((req, index) => (
                    <div key={index} className="text-xs text-gray-300 flex items-center">
                      <span className="w-1 h-1 bg-purple-400 rounded-full mr-2" />
                      {req}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Rewards */}
              <div className="p-3 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded border border-purple-500/20">
                <div className="text-xs text-purple-400 font-semibold mb-2">Rewards:</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-bold">+{quest.xpReward} XP</span>
                  </div>
                  {Object.entries(quest.statBonus).length > 0 && (
                    <div className="flex space-x-2">
                      {Object.entries(quest.statBonus).map(([stat, value]) => (
                        <div key={stat} className="flex items-center space-x-1">
                          {getStatIcon(stat)}
                          <span className="text-xs text-white">+{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Button */}
              <Button
                onClick={() => quest.completed ? onClaimReward(quest.id) : onStartQuest(quest.id)}
                disabled={quest.locked}
                className={`w-full ${
                  quest.locked 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : quest.completed 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }`}
              >
                {quest.locked 
                  ? 'Locked' 
                  : quest.completed 
                    ? 'Claim Reward' 
                    : quest.progress > 0 
                      ? 'Continue Quest' 
                      : 'Start Quest'
                }
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrainingHall;
