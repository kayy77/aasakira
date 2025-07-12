
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Eye, 
  Zap, 
  Shield, 
  Target, 
  Clock,
  TrendingUp,
  BarChart3,
  Crosshair,
  Flame,
  Star,
  Lock
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  cost: number;
  unlocked: boolean;
  level: number;
  maxLevel: number;
  prerequisites: string[];
  category: 'analysis' | 'execution' | 'psychology' | 'risk';
  effect: string;
}

interface SkillTreeProps {
  availablePoints: number;
  unlockedSkills: string[];
  onSkillUnlock: (skillId: string) => void;
}

const SKILLS: Skill[] = [
  // Analysis Branch
  {
    id: 'pattern_recognition',
    name: 'Pattern Recognition',
    description: 'AI explains candlestick patterns with 15% more accuracy',
    icon: Eye,
    cost: 5,
    unlocked: true,
    level: 0,
    maxLevel: 3,
    prerequisites: [],
    category: 'analysis',
    effect: '+15% pattern accuracy per level'
  },
  {
    id: 'multi_timeframe',
    name: 'Multi-Timeframe Vision',
    description: 'See correlations across multiple timeframes',
    icon: BarChart3,
    cost: 10,
    unlocked: false,
    level: 0,
    maxLevel: 2,
    prerequisites: ['pattern_recognition'],
    category: 'analysis',
    effect: 'Unlock higher timeframe analysis'
  },
  {
    id: 'liquidity_hunter',
    name: 'Liquidity Hunter',
    description: 'Identify liquidity zones and smart money moves',
    icon: Target,
    cost: 15,
    unlocked: false,
    level: 0,
    maxLevel: 3,
    prerequisites: ['multi_timeframe'],
    category: 'analysis',
    effect: 'Reveal institutional order blocks'
  },

  // Execution Branch
  {
    id: 'quick_strike',
    name: 'Quick Strike',
    description: 'Reduced prediction cooldown by 2 seconds per level',
    icon: Zap,
    cost: 8,
    unlocked: true,
    level: 0,
    maxLevel: 3,
    prerequisites: [],
    category: 'execution',
    effect: '-2s prediction cooldown'
  },
  {
    id: 'precision_timing',
    name: 'Precision Timing',
    description: 'Get 3-second early warning on major moves',
    icon: Clock,
    cost: 12,
    unlocked: false,
    level: 0,
    maxLevel: 2,
    prerequisites: ['quick_strike'],
    category: 'execution',
    effect: 'Early trend reversal alerts'
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Chain correct predictions for bonus points',
    icon: Flame,
    cost: 20,
    unlocked: false,
    level: 0,
    maxLevel: 3,
    prerequisites: ['precision_timing'],
    category: 'execution',
    effect: '+50% points for 3+ streak'
  },

  // Psychology Branch
  {
    id: 'mental_fortress',
    name: 'Mental Fortress',
    description: 'Immune to opponent bluff tactics',
    icon: Shield,
    cost: 6,
    unlocked: true,
    level: 0,
    maxLevel: 2,
    prerequisites: [],
    category: 'psychology',
    effect: 'Resist mind games'
  },
  {
    id: 'mind_reader',
    name: 'Mind Reader',
    description: 'See opponent\'s historical win rate and tendencies',
    icon: Brain,
    cost: 12,
    unlocked: false,
    level: 0,
    maxLevel: 2,
    prerequisites: ['mental_fortress'],
    category: 'psychology',
    effect: 'Opponent analysis pre-match'
  },

  // Risk Management Branch
  {
    id: 'risk_mastery',
    name: 'Risk Mastery',
    description: 'Better position sizing recommendations',
    icon: TrendingUp,
    cost: 10,
    unlocked: true,
    level: 0,
    maxLevel: 3,
    prerequisites: [],
    category: 'risk',
    effect: 'Optimal trade size calculations'
  },
  {
    id: 'news_slayer',
    name: 'News Slayer',
    description: 'Real-time news impact analysis during combat',
    icon: Crosshair,
    cost: 15,
    unlocked: false,
    level: 0,
    maxLevel: 2,
    prerequisites: ['risk_mastery'],
    category: 'risk',
    effect: 'Live news correlation alerts'
  }
];

const SkillTree = ({ availablePoints, unlockedSkills, onSkillUnlock }: SkillTreeProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Skills', color: 'from-purple-500 to-pink-500' },
    { id: 'analysis', name: 'Analysis', color: 'from-blue-500 to-cyan-500' },
    { id: 'execution', name: 'Execution', color: 'from-red-500 to-orange-500' },
    { id: 'psychology', name: 'Psychology', color: 'from-green-500 to-emerald-500' },
    { id: 'risk', name: 'Risk Management', color: 'from-yellow-500 to-amber-500' }
  ];

  const getSkillsToShow = () => {
    if (selectedCategory === 'all') return SKILLS;
    return SKILLS.filter(skill => skill.category === selectedCategory);
  };

  const canUnlockSkill = (skill: Skill): boolean => {
    if (skill.cost > availablePoints) return false;
    if (skill.prerequisites.length === 0) return true;
    return skill.prerequisites.every(prereq => unlockedSkills.includes(prereq));
  };

  const getCategoryColor = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'analysis': 'from-blue-500 to-cyan-500',
      'execution': 'from-red-500 to-orange-500',
      'psychology': 'from-green-500 to-emerald-500',
      'risk': 'from-yellow-500 to-amber-500'
    };
    return categoryMap[category] || 'from-gray-500 to-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Skill Points Display */}
      <Card className="glass-card border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Available Skill Points</h3>
              <p className="text-sm text-gray-400">Earn points by winning battles and completing challenges</p>
            </div>
            <div className="text-3xl font-bold text-purple-400">{availablePoints}</div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className={selectedCategory === category.id 
              ? `bg-gradient-to-r ${category.color} text-white border-0` 
              : "border-gray-600 text-gray-400 hover:text-white"
            }
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getSkillsToShow().map(skill => {
          const isUnlocked = unlockedSkills.includes(skill.id);
          const canUnlock = canUnlockSkill(skill);
          const SkillIcon = skill.icon;

          return (
            <Card 
              key={skill.id} 
              className={`glass-card transition-all duration-300 ${
                isUnlocked 
                  ? `border-gradient-to-r ${getCategoryColor(skill.category)} shadow-lg` 
                  : canUnlock 
                    ? 'border-gray-600 hover:border-purple-500/50' 
                    : 'border-gray-800 opacity-60'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isUnlocked 
                        ? `bg-gradient-to-r ${getCategoryColor(skill.category)}` 
                        : 'bg-gray-800'
                    }`}>
                      {isUnlocked ? (
                        <SkillIcon className="w-5 h-5 text-white" />
                      ) : (
                        canUnlock ? (
                          <SkillIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-600" />
                        )
                      )}
                    </div>
                    <div>
                      <CardTitle className={`text-sm ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                        {skill.name}
                      </CardTitle>
                      <Badge variant="outline" className={`text-xs border-${skill.category === 'analysis' ? 'blue' : skill.category === 'execution' ? 'red' : skill.category === 'psychology' ? 'green' : 'yellow'}-500/30`}>
                        {skill.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${isUnlocked ? 'text-purple-400' : 'text-gray-500'}`}>
                      {skill.cost} SP
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className={`text-xs ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                  {skill.description}
                </p>
                
                {/* Skill Effect */}
                <div className={`text-xs p-2 rounded ${isUnlocked ? 'bg-purple-900/30 text-purple-300' : 'bg-gray-800/30 text-gray-500'}`}>
                  Effect: {skill.effect}
                </div>

                {/* Level Progress */}
                {isUnlocked && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Level</span>
                      <span className="text-purple-400">{skill.level}/{skill.maxLevel}</span>
                    </div>
                    <Progress value={(skill.level / skill.maxLevel) * 100} className="h-1" />
                  </div>
                )}

                {/* Prerequisites */}
                {skill.prerequisites.length > 0 && !isUnlocked && (
                  <div className="text-xs text-gray-500">
                    Requires: {skill.prerequisites.join(', ')}
                  </div>
                )}

                {/* Action Button */}
                {!isUnlocked && (
                  <Button
                    onClick={() => onSkillUnlock(skill.id)}
                    disabled={!canUnlock}
                    size="sm"
                    className={canUnlock 
                      ? `w-full bg-gradient-to-r ${getCategoryColor(skill.category)} text-white` 
                      : "w-full bg-gray-800 text-gray-500 cursor-not-allowed"
                    }
                  >
                    {canUnlock ? `Unlock (${skill.cost} SP)` : 'Locked'}
                  </Button>
                )}

                {isUnlocked && skill.level < skill.maxLevel && (
                  <Button
                    onClick={() => {/* Handle upgrade */}}
                    size="sm"
                    variant="outline"
                    className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  >
                    Upgrade ({skill.cost * (skill.level + 1)} SP)
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SkillTree;
