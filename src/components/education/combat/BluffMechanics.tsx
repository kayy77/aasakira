
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Clock, 
  Zap, 
  Shield, 
  Target,
  Brain,
  Flame,
  Star,
  AlertTriangle
} from 'lucide-react';

interface BluffPerk {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  effect: string;
  cooldown: number;
  rarity: 'common' | 'rare' | 'legendary';
}

interface BluffMechanicsProps {
  availablePerks: BluffPerk[];
  selectedPerk: BluffPerk | null;
  onPerkSelect: (perk: BluffPerk) => void;
  isSelectionPhase: boolean;
  opponentPerk?: BluffPerk | null;
  showOpponentPerk: boolean;
}

const BLUFF_PERKS: BluffPerk[] = [
  {
    id: 'decoy',
    name: 'Shadow Decoy',
    description: 'Show fake direction to confuse opponent',
    icon: Eye,
    effect: 'Display opposite prediction for 3 seconds',
    cooldown: 30,
    rarity: 'common'
  },
  {
    id: 'delay',
    name: 'Time Warp',
    description: 'Delay opponent\'s signal transmission',
    icon: Clock,
    effect: 'Opponent prediction delayed by 2 seconds',
    cooldown: 45,
    rarity: 'rare'
  },
  {
    id: 'clarity',
    name: 'News Oracle',
    description: 'Receive early warning of news spikes',
    icon: Zap,
    effect: 'Get 5-second heads up on major market moves',
    cooldown: 60,
    rarity: 'rare'
  },
  {
    id: 'shield',
    name: 'Mental Fortress',
    description: 'Immunity to opponent\'s mind games',
    icon: Shield,
    effect: 'Block all opponent perk effects this round',
    cooldown: 90,
    rarity: 'legendary'
  },
  {
    id: 'insight',
    name: 'Mind Reader',
    description: 'See opponent\'s trading pattern hints',
    icon: Brain,
    effect: 'Reveal opponent\'s last 3 predictions',
    cooldown: 75,
    rarity: 'legendary'
  },
  {
    id: 'double_strike',
    name: 'Double Edge',
    description: 'Make two predictions, opponent sees both',
    icon: Target,
    effect: 'Submit two predictions, higher one counts',
    cooldown: 50,
    rarity: 'rare'
  }
];

const BluffMechanics = ({
  availablePerks,
  selectedPerk,
  onPerkSelect,
  isSelectionPhase,
  opponentPerk,
  showOpponentPerk
}: BluffMechanicsProps) => {
  const [revealTimer, setRevealTimer] = useState<number | null>(null);

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-700';
      case 'rare': return 'from-blue-500 to-purple-500';
      case 'legendary': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getRarityBorder = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'border-gray-500/30';
      case 'rare': return 'border-blue-500/30';
      case 'legendary': return 'border-yellow-500/30';
      default: return 'border-gray-500/30';
    }
  };

  const startRevealCountdown = () => {
    if (revealTimer) return;
    
    let timeLeft = 5;
    setRevealTimer(timeLeft);
    
    const countdown = setInterval(() => {
      timeLeft--;
      setRevealTimer(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(countdown);
        setRevealTimer(null);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Selection Phase */}
      {isSelectionPhase && (
        <Card className="glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-400">
              <Brain className="w-5 h-5 mr-2" />
              Choose Your Combat Perk
              <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Mind Games
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BLUFF_PERKS.slice(0, 3).map(perk => {
                const PerkIcon = perk.icon;
                const isSelected = selectedPerk?.id === perk.id;
                
                return (
                  <Card
                    key={perk.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? `border-2 ${getRarityBorder(perk.rarity)} bg-gradient-to-br ${getRarityColor(perk.rarity)}/10` 
                        : 'border-gray-600 hover:border-purple-500/50'
                    }`}
                    onClick={() => onPerkSelect(perk)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br ${getRarityColor(perk.rarity)} flex items-center justify-center`}>
                        <PerkIcon className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="font-semibold text-white mb-1">{perk.name}</h3>
                      <Badge 
                        variant="outline" 
                        className={`mb-2 ${getRarityBorder(perk.rarity)} text-xs`}
                      >
                        {perk.rarity.toUpperCase()}
                      </Badge>
                      
                      <p className="text-xs text-gray-400 mb-2">{perk.description}</p>
                      
                      <div className="text-xs text-purple-300 bg-purple-900/20 p-2 rounded">
                        {perk.effect}
                      </div>
                      
                      <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {perk.cooldown}s cooldown
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {selectedPerk && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <selectedPerk.icon className="w-6 h-6 text-purple-400" />
                    <div>
                      <h4 className="font-semibold text-white">{selectedPerk.name} Selected</h4>
                      <p className="text-sm text-gray-400">Ready to deploy in combat</p>
                    </div>
                  </div>
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Combat Phase */}
      {!isSelectionPhase && (selectedPerk || opponentPerk) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Your Active Perk */}
          {selectedPerk && (
            <Card className="glass-card border-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center text-green-400">
                  <Shield className="w-5 h-5 mr-2" />
                  Your Active Perk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRarityColor(selectedPerk.rarity)} flex items-center justify-center`}>
                    <selectedPerk.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{selectedPerk.name}</h4>
                    <Badge className={`${getRarityBorder(selectedPerk.rarity)} text-xs`}>
                      {selectedPerk.rarity}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-sm text-gray-300 mb-2">{selectedPerk.description}</div>
                <div className="text-xs text-green-300 bg-green-900/20 p-2 rounded">
                  Effect: {selectedPerk.effect}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Opponent's Perk */}
          <Card className="glass-card border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center text-red-400">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Opponent's Perk
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showOpponentPerk && opponentPerk ? (
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRarityColor(opponentPerk.rarity)} flex items-center justify-center`}>
                    <opponentPerk.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{opponentPerk.name}</h4>
                    <Badge className={`${getRarityBorder(opponentPerk.rarity)} text-xs`}>
                      {opponentPerk.rarity}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-gray-400 mb-2">Hidden Perk</div>
                  {revealTimer ? (
                    <div className="text-yellow-400">
                      Revealing in {revealTimer}s...
                    </div>
                  ) : (
                    <Button
                      onClick={startRevealCountdown}
                      size="sm"
                      variant="outline"
                      className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Reveal (Cost: 1 Insight Point)
                    </Button>
                  )}
                </div>
              )}
              
              {showOpponentPerk && opponentPerk && (
                <>
                  <div className="text-sm text-gray-300 mb-2">{opponentPerk.description}</div>
                  <div className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
                    Threat: {opponentPerk.effect}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Combat Tips */}
      <Card className="glass-card border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Flame className="w-5 h-5 text-blue-400" />
            <h4 className="font-semibold text-blue-400">Combat Strategy Tips</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-blue-900/20 p-3 rounded">
              <h5 className="text-blue-300 font-semibold mb-1">Mind Games</h5>
              <p className="text-gray-400">Use perks to confuse opponents and gain psychological advantage</p>
            </div>
            <div className="bg-purple-900/20 p-3 rounded">
              <h5 className="text-purple-300 font-semibold mb-1">Timing</h5>
              <p className="text-gray-400">Save legendary perks for crucial moments in close matches</p>
            </div>
            <div className="bg-green-900/20 p-3 rounded">
              <h5 className="text-green-300 font-semibold mb-1">Adaptation</h5>
              <p className="text-gray-400">Study opponent patterns to counter their favorite strategies</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BluffMechanics;
