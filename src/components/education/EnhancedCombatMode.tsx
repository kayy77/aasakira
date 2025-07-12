
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
  Gamepad2
} from 'lucide-react';
import AvatarSystem from './combat/AvatarSystem';
import SkillTree from './combat/SkillTree';
import BattlefieldVisualization from './combat/BattlefieldVisualization';
import BluffMechanics from './combat/BluffMechanics';
import CombatMode from './CombatMode';

interface EnhancedCombatModeProps {
  onFeatureUse?: () => void;
}

const EnhancedCombatMode = ({ onFeatureUse }: EnhancedCombatModeProps) => {
  const [userStats, setUserStats] = useState({
    wins: 12,
    losses: 3,
    streak: 5,
    points: 1847,
    tradingStyle: 'Day Trader'
  });

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
    // Simulate skill unlocking
    setUnlockedSkills(prev => [...prev, skillId]);
    setSkillPoints(prev => prev - 10); // Deduct skill points
    onFeatureUse?.();
  };

  const handlePerkSelect = (perk: any) => {
    // Handle perk selection logic
    onFeatureUse?.();
  };

  return (
    <div className="space-y-6">
      {/* Avatar & Stats Header */}
      <AvatarSystem userStats={userStats} />

      <Tabs defaultValue="arena" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          <TabsTrigger value="arena" className="data-[state=active]:bg-red-600">
            <Swords className="w-4 h-4 mr-2" />
            Arena
          </TabsTrigger>
          <TabsTrigger value="skills" className="data-[state=active]:bg-purple-600">
            <Brain className="w-4 h-4 mr-2" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="battlefield" className="data-[state=active]:bg-blue-600">
            <Target className="w-4 h-4 mr-2" />
            Battlefield
          </TabsTrigger>
          <TabsTrigger value="tactics" className="data-[state=active]:bg-green-600">
            <Eye className="w-4 h-4 mr-2" />
            Tactics
          </TabsTrigger>
          <TabsTrigger value="classic" className="data-[state=active]:bg-orange-600">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Classic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arena" className="space-y-6">
          <Card className="glass-card border-red-500/20">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold gradient-text mb-2">
                  🏛️ AASAKIRA COMBAT ARENA V2
                </h2>
                <p className="text-gray-400">
                  The ultimate AI trading battle experience with avatars, skill trees, and cinematic combat
                </p>
              </div>
              
              {/* Feature Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-lg border border-red-500/20">
                  <User className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <h3 className="font-semibold text-white mb-1">Avatar Evolution</h3>
                  <p className="text-xs text-gray-400">Ronin → Shinobi → Strategist → Shogun AI</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20">
                  <Brain className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <h3 className="font-semibold text-white mb-1">Skill Tree RPG</h3>
                  <p className="text-xs text-gray-400">Unlock passive abilities & trading perks</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg border border-blue-500/20">
                  <Target className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <h3 className="font-semibold text-white mb-1">Battle Simulation</h3>
                  <p className="text-xs text-gray-400">Cinematic price action combat</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg border border-green-500/20">
                  <Eye className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <h3 className="font-semibold text-white mb-1">Mind Games</h3>
                  <p className="text-xs text-gray-400">Bluff mechanics & strategy perks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <SkillTree 
            availablePoints={skillPoints}
            unlockedSkills={unlockedSkills}
            onSkillUnlock={handleSkillUnlock}
          />
        </TabsContent>

        <TabsContent value="battlefield" className="space-y-6">
          <BattlefieldVisualization 
            currentPrice={battlefieldData.currentPrice}
            priceHistory={battlefieldData.priceHistory}
            supportLevel={battlefieldData.supportLevel}
            resistanceLevel={battlefieldData.resistanceLevel}
            isActive={battlefieldData.isActive}
            playerPrediction="up"
            opponentPrediction="down"
          />
        </TabsContent>

        <TabsContent value="tactics" className="space-y-6">
          <BluffMechanics
            availablePerks={[]}
            selectedPerk={null}
            onPerkSelect={handlePerkSelect}
            isSelectionPhase={true}
            showOpponentPerk={false}
          />
        </TabsContent>

        <TabsContent value="classic" className="space-y-6">
          <CombatMode />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCombatMode;
