
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
  Crown
} from 'lucide-react';
import ComprehensiveAvatarSystem from './combat/ComprehensiveAvatarSystem';
import SkillTree from './combat/SkillTree';
import BattlefieldVisualization from './combat/BattlefieldVisualization';
import BluffMechanics from './combat/BluffMechanics';
import CombatMode from './CombatMode';
import PixelDojo from './combat/PixelDojo';

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
              AASAKIRA COMBAT ARENA V2
              <Crown className="w-8 h-8 ml-3 text-yellow-400" />
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              The ultimate pixel trading battle experience with evolving avatars, comprehensive gear systems, and battle companions
            </p>
            <div className="mt-4 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm rounded-full inline-block animate-pulse">
              🔥 NOW WITH PIXEL ART WARRIORS 🔥
            </div>
          </div>
          
          {/* Feature Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-lg border border-red-500/20">
              <User className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <h3 className="font-semibold text-white mb-1">Pixel Warriors</h3>
              <p className="text-xs text-gray-400">Custom pixel art avatars with unique evolutions</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20">
              <Brain className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <h3 className="font-semibold text-white mb-1">Epic Gear System</h3>
              <p className="text-xs text-gray-400">Unlock legendary weapons, armor & mythic items</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg border border-blue-500/20">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <h3 className="font-semibold text-white mb-1">Battle Companions</h3>
              <p className="text-xs text-gray-400">Spirit Fox, Dragon Pup, Trade Tanuki pets</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg border border-green-500/20">
              <Eye className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <h3 className="font-semibold text-white mb-1">Live Battles</h3>
              <p className="text-xs text-gray-400">Real-time trading predictions with AI hints</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pixel-dojo" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800/50">
          <TabsTrigger value="pixel-dojo" className="data-[state=active]:bg-red-600">
            <Crown className="w-4 h-4 mr-2" />
            Pixel Dojo
          </TabsTrigger>
          <TabsTrigger value="avatar" className="data-[state=active]:bg-purple-600">
            <User className="w-4 h-4 mr-2" />
            Avatar
          </TabsTrigger>
          <TabsTrigger value="skills" className="data-[state=active]:bg-blue-600">
            <Brain className="w-4 h-4 mr-2" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="battlefield" className="data-[state=active]:bg-green-600">
            <Target className="w-4 h-4 mr-2" />
            Battlefield
          </TabsTrigger>
          <TabsTrigger value="tactics" className="data-[state=active]:bg-yellow-600">
            <Eye className="w-4 h-4 mr-2" />
            Tactics
          </TabsTrigger>
          <TabsTrigger value="classic" className="data-[state=active]:bg-orange-600">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Classic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pixel-dojo" className="space-y-6">
          <PixelDojo userStats={userStats} onFeatureUse={onFeatureUse} />
        </TabsContent>

        <TabsContent value="avatar" className="space-y-6">
          <ComprehensiveAvatarSystem 
            userStats={userStats}
            selectedClass={selectedClass}
            onClassSelect={setSelectedClass}
          />
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
