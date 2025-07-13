import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Swords, 
  User, 
  Target, 
  Brain,
  Eye,
  Trophy,
  Gamepad2,
  Crown,
  TrendingUp
} from 'lucide-react';
import SimplifiedTradingBattle from './combat/SimplifiedTradingBattle';
import DrillMode from './DrillMode';

interface EnhancedCombatModeProps {
  onFeatureUse?: () => void;
}

const EnhancedCombatMode = ({ onFeatureUse }: EnhancedCombatModeProps) => {
  const [userStats, setUserStats] = useState({
    wins: 12,
    losses: 3,
    streak: 5,
    points: 1847,
    xp: 1250,
    tradingStyle: 'Day Trader'
  });
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [skillPoints, setSkillPoints] = useState(25);
  const [unlockedSkills, setUnlockedSkills] = useState(['pattern_recognition', 'quick_strike', 'mental_fortress', 'risk_mastery']);

  const [battlefieldData, setBattlefieldData] = useState({
    currentPrice: 1.2750,
    priceHistory: [
      { price: 1.2745, direction: 'up' as const, strength: 'medium' as const, timestamp: Date.now() - 1000 },
      { price: 1.2750, direction: 'up' as const, strength: 'strong' as const, timestamp: Date.now() }
    ],
    supportLevel: 1.2720,
    resistanceLevel: 1.2780,
    isActive: true
  });

  const handleSkillUnlock = (skillId: string) => {
    setUnlockedSkills(prev => [...prev, skillId]);
    setSkillPoints(prev => prev - 10);
    onFeatureUse?.();
  };

  const handlePerkSelect = (perk: any) => {
    onFeatureUse?.();
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="glass-card border-gradient-to-r from-red-500/20 to-orange-500/20 bg-gradient-to-r from-red-900/10 to-orange-900/10">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold gradient-text mb-2 flex items-center justify-center">
              <Crown className="w-8 h-8 mr-3 text-yellow-400" />
              AASAKIRA TRADING BATTLE ARENA
              <Crown className="w-8 h-8 ml-3 text-yellow-400" />
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Master trading through gamified battles. Analyze real market scenarios, make predictions, and level up your skills.
            </p>
            <div className="mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm rounded-full inline-block animate-pulse">
              🎯 FOCUSED TRADING EDUCATION 🎯
            </div>
          </div>
          
          {/* Feature Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-xl border border-green-500/20">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <h3 className="font-semibold text-white mb-1">Trading Battles</h3>
              <p className="text-xs text-gray-400">Real market scenarios with instant feedback</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/20">
              <Brain className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <h3 className="font-semibold text-white mb-1">Master's Wisdom</h3>
              <p className="text-xs text-gray-400">Learn SMC, liquidity hunts, and advanced concepts</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/20">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <h3 className="font-semibold text-white mb-1">Live Analysis</h3>
              <p className="text-xs text-gray-400">Practice with EUR/USD, GBP/USD, and more</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl border border-yellow-500/20">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <h3 className="font-semibold text-white mb-1">XP & Levels</h3>
              <p className="text-xs text-gray-400">Track accuracy and trading improvement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="battle-arena" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="battle-arena" className="data-[state=active]:bg-green-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            Battle Arena
          </TabsTrigger>
          <TabsTrigger value="drill-mode" className="data-[state=active]:bg-blue-600">
            <Brain className="w-4 h-4 mr-2" />
            Drill Mode
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-purple-600">
            <Trophy className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="battle-arena" className="space-y-6">
          <SimplifiedTradingBattle onFeatureUse={onFeatureUse} />
        </TabsContent>

        <TabsContent value="drill-mode" className="space-y-6">
          <DrillMode onFeatureUse={onFeatureUse} />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Progress tracking will be built next */}
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-xl font-bold text-white mb-2">Progress Tracking</h3>
            <p className="text-gray-400">Coming next - Detailed performance analytics</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCombatMode;
