
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Sword, 
  Shield, 
  Zap, 
  Star,
  Palette,
  Eye,
  Mountain,
  Ghost,
  Sparkles,
  Flame,
  Save,
  Shuffle
} from 'lucide-react';

interface PixelCharacter {
  id: string;
  name: string;
  class: 'monk' | 'samurai' | 'phantom';
  appearance: {
    skinTone: string;
    hairStyle: string;
    hairColor: string;
    eyeColor: string;
    faceExpression: string;
    facialHair: string;
  };
  equipment: {
    weapon: string;
    armor: string;
    helmet: string;
    cape: string;
    accessory: string;
    pet: string;
  };
  aura: {
    color: string;
    intensity: number;
    pattern: string;
    particles: boolean;
  };
  stats: {
    wisdom: number;
    stealth: number;
    aggression: number;
  };
  xp: number;
  level: number;
}

interface PixelAvatarDesignerProps {
  userStats: {
    xp: number;
    wins: number;
    losses: number;
  };
  selectedClass?: string;
  onCharacterCreate: (character: PixelCharacter) => void;
  onClose?: () => void;
}

const PixelAvatarDesigner = ({ userStats, selectedClass, onCharacterCreate, onClose }: PixelAvatarDesignerProps) => {
  const [character, setCharacter] = useState<PixelCharacter>({
    id: '',
    name: '',
    class: 'monk',
    appearance: {
      skinTone: 'light',
      hairStyle: 'bald',
      hairColor: 'black',
      eyeColor: 'brown',
      faceExpression: 'focused',
      facialHair: 'none'
    },
    equipment: {
      weapon: 'none',
      armor: 'basic_robe',
      helmet: 'none',
      cape: 'none',
      accessory: 'none',
      pet: 'none'
    },
    aura: {
      color: 'blue',
      intensity: 30,
      pattern: 'steady',
      particles: false
    },
    stats: {
      wisdom: 50,
      stealth: 50,
      aggression: 50
    },
    xp: userStats.xp,
    level: Math.floor(userStats.xp / 100) + 1
  });

  const [activeTab, setActiveTab] = useState<'class' | 'appearance' | 'equipment' | 'aura' | 'preview'>('class');
  const [animationFrame, setAnimationFrame] = useState(0);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Character class presets with enhanced details
  const classPresets = {
    monk: {
      name: 'Wandering Monk',
      title: 'Master of Flow',
      lore: 'A peaceful mind sees market patterns like ripples in still water. Patience is the ultimate weapon.',
      stats: { wisdom: 85, stealth: 60, aggression: 35 },
      defaultAppearance: {
        skinTone: 'tan',
        hairStyle: 'bald',
        hairColor: 'black',
        eyeColor: 'brown',
        faceExpression: 'serene',
        facialHair: 'beard'
      },
      defaultEquipment: {
        weapon: 'mystic_staff',
        armor: 'silk_robe',
        helmet: 'prayer_beads',
        cape: 'none',
        accessory: 'meditation_beads',
        pet: 'spirit_fox'
      },
      aura: { color: 'gold', intensity: 35, pattern: 'gentle', particles: true },
      icon: Mountain,
      bgColor: 'from-amber-700 to-orange-800',
      specialAbilities: ['Market Meditation', 'Flow State', 'Inner Balance']
    },
    samurai: {
      name: 'Rising Samurai',
      title: 'Blade of Honor',
      lore: 'Honor demands decisive action. Strike swiftly when opportunity presents itself.',
      stats: { wisdom: 60, stealth: 35, aggression: 85 },
      defaultAppearance: {
        skinTone: 'light',
        hairStyle: 'topknot',
        hairColor: 'black',
        eyeColor: 'dark',
        faceExpression: 'determined',
        facialHair: 'none'
      },
      defaultEquipment: {
        weapon: 'katana',
        armor: 'battle_gi',
        helmet: 'war_mask',
        cape: 'battle_cloak',
        accessory: 'honor_sash',
        pet: 'steel_dragon'
      },
      aura: { color: 'red', intensity: 50, pattern: 'flame', particles: true },
      icon: Sword,
      bgColor: 'from-red-700 to-red-900',
      specialAbilities: ['Lightning Strike', 'Bushido Code', 'Honor Guard']
    },
    phantom: {
      name: 'Market Phantom',
      title: 'Shadow Trader',
      lore: 'From the shadows, all market movements are revealed. Deception is the art of survival.',
      stats: { wisdom: 50, stealth: 90, aggression: 60 },
      defaultAppearance: {
        skinTone: 'pale',
        hairStyle: 'hidden',
        hairColor: 'silver',
        eyeColor: 'violet',
        faceExpression: 'mysterious',
        facialHair: 'none'
      },
      defaultEquipment: {
        weapon: 'shadow_blade',
        armor: 'void_cloak',
        helmet: 'shadow_hood',
        cape: 'mist_cape',
        accessory: 'shadow_orb',
        pet: 'void_raven'
      },
      aura: { color: 'purple', intensity: 40, pattern: 'shadow', particles: true },
      icon: Ghost,
      bgColor: 'from-purple-800 to-gray-900',
      specialAbilities: ['Phase Walk', 'Market Mirage', 'Shadow Clone']
    }
  };

  // Enhanced customization options
  const customizationOptions = {
    skinTones: [
      { id: 'pale', name: 'Moonlight', color: '#F5E6D3', rarity: 'common' },
      { id: 'light', name: 'Dawn', color: '#E8C4A0', rarity: 'common' },
      { id: 'tan', name: 'Sunset', color: '#D4A574', rarity: 'common' },
      { id: 'dark', name: 'Midnight', color: '#8B4513', rarity: 'common' },
      { id: 'golden', name: 'Golden Spirit', color: '#FFD700', rarity: 'legendary', xp: 1000 },
      { id: 'silver', name: 'Silver Soul', color: '#C0C0C0', rarity: 'epic', xp: 500 }
    ],
    
    expressions: [
      { id: 'focused', name: 'Focused', emoji: '😤', rarity: 'common' },
      { id: 'serene', name: 'Serene', emoji: '😌', rarity: 'common' },
      { id: 'determined', name: 'Determined', emoji: '😠', rarity: 'common' },
      { id: 'mysterious', name: 'Mysterious', emoji: '😏', rarity: 'common' },
      { id: 'wise', name: 'Ancient Wisdom', emoji: '🧙', rarity: 'rare', xp: 200 },
      { id: 'fierce', name: 'Battle Fury', emoji: '😡', rarity: 'rare', xp: 200 },
      { id: 'enlightened', name: 'Enlightened', emoji: '✨', rarity: 'epic', xp: 750 }
    ],

    equipment: {
      weapons: [
        { id: 'none', name: 'Empty Hands', rarity: 'common', xp: 0, power: 0 },
        { id: 'wooden_staff', name: 'Training Staff', rarity: 'common', xp: 0, power: 10 },
        { id: 'mystic_staff', name: 'Mystic Staff', rarity: 'rare', xp: 100, power: 25 },
        { id: 'katana', name: 'Honor Katana', rarity: 'rare', xp: 150, power: 30 },
        { id: 'shadow_blade', name: 'Shadow Kunai', rarity: 'rare', xp: 120, power: 28 },
        { id: 'dragon_katana', name: 'Dragon\'s Fang', rarity: 'epic', xp: 500, power: 45 },
        { id: 'void_scythe', name: 'Void Scythe', rarity: 'epic', xp: 600, power: 50 },
        { id: 'aasakira_blade', name: 'Aasakira\'s Edge', rarity: 'legendary', xp: 2000, power: 75 },
        { id: 'market_god_weapon', name: 'Market God\'s Weapon', rarity: 'mythic', xp: 5000, power: 100 }
      ],
      
      pets: [
        { id: 'none', name: 'No Companion', rarity: 'common', xp: 0, bonus: 'None' },
        { id: 'spirit_fox', name: 'Spirit Fox', rarity: 'common', xp: 50, bonus: '+5 WIS' },
        { id: 'steel_dragon', name: 'Steel Dragon', rarity: 'rare', xp: 200, bonus: '+10 AGG' },
        { id: 'void_raven', name: 'Void Raven', rarity: 'rare', xp: 180, bonus: '+8 STL' },
        { id: 'golden_phoenix', name: 'Golden Phoenix', rarity: 'epic', xp: 800, bonus: '+15 All Stats' },
        { id: 'market_spirit', name: 'Market Spirit', rarity: 'legendary', xp: 1500, bonus: '+20% XP Gain' }
      ],

      armor: [
        { id: 'basic_robe', name: 'Novice Robes', rarity: 'common', xp: 0, defense: 5 },
        { id: 'silk_robe', name: 'Silk Meditation Robe', rarity: 'common', xp: 0, defense: 8 },
        { id: 'battle_gi', name: 'Battle Gi', rarity: 'rare', xp: 100, defense: 15 },
        { id: 'void_cloak', name: 'Void Cloak', rarity: 'rare', xp: 120, defense: 18 },
        { id: 'dragon_armor', name: 'Dragon Scale Armor', rarity: 'epic', xp: 600, defense: 30 },
        { id: 'celestial_robes', name: 'Celestial Robes', rarity: 'legendary', xp: 1200, defense: 45 },
        { id: 'market_master_attire', name: 'Market Master\'s Attire', rarity: 'mythic', xp: 4000, defense: 60 }
      ]
    },

    auraColors: [
      { id: 'blue', name: 'Mystic Blue', color: '#3B82F6', rarity: 'common' },
      { id: 'red', name: 'Flame Red', color: '#EF4444', rarity: 'common' },
      { id: 'purple', name: 'Shadow Purple', color: '#8B5CF6', rarity: 'common' },
      { id: 'gold', name: 'Sacred Gold', color: '#F59E0B', rarity: 'rare', xp: 150 },
      { id: 'green', name: 'Nature Green', color: '#10B981', rarity: 'common' },
      { id: 'white', name: 'Pure Light', color: '#F8FAFC', rarity: 'epic', xp: 400 },
      { id: 'rainbow', name: 'Prismatic Aura', color: 'linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080)', rarity: 'mythic', xp: 3000 }
    ],

    auraPatterns: [
      { id: 'steady', name: 'Steady Glow', rarity: 'common' },
      { id: 'pulse', name: 'Pulsing Energy', rarity: 'common' },
      { id: 'flame', name: 'Flickering Flame', rarity: 'rare', xp: 100 },
      { id: 'shadow', name: 'Shadow Wisps', rarity: 'rare', xp: 120 },
      { id: 'lightning', name: 'Lightning Crackle', rarity: 'epic', xp: 300 },
      { id: 'galaxy', name: 'Cosmic Swirl', rarity: 'legendary', xp: 800 }
    ]
  };

  const handleClassSelect = (classType: keyof typeof classPresets) => {
    const preset = classPresets[classType];
    setCharacter(prev => ({
      ...prev,
      class: classType,
      stats: preset.stats,
      appearance: { ...prev.appearance, ...preset.defaultAppearance },
      equipment: { ...prev.equipment, ...preset.defaultEquipment },
      aura: { ...prev.aura, ...preset.aura }
    }));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-300 border-gray-400 bg-gray-900/20';
      case 'rare': return 'text-blue-300 border-blue-400 bg-blue-900/20';
      case 'epic': return 'text-purple-300 border-purple-400 bg-purple-900/20';
      case 'legendary': return 'text-yellow-300 border-yellow-400 bg-yellow-900/20';
      case 'mythic': return 'text-pink-300 border-pink-400 bg-pink-900/20';
      default: return 'text-gray-300 border-gray-400 bg-gray-900/20';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'rare': return 'shadow-lg shadow-blue-500/20';
      case 'epic': return 'shadow-lg shadow-purple-500/20';
      case 'legendary': return 'shadow-lg shadow-yellow-500/20';
      case 'mythic': return 'shadow-lg shadow-pink-500/20';
      default: return '';
    }
  };

  const randomizeCharacter = () => {
    const availableOptions = {
      skinTones: customizationOptions.skinTones.filter(t => t.xp <= userStats.xp),
      expressions: customizationOptions.expressions.filter(e => e.xp <= userStats.xp),
      weapons: customizationOptions.equipment.weapons.filter(w => w.xp <= userStats.xp),
      pets: customizationOptions.equipment.pets.filter(p => p.xp <= userStats.xp),
      auras: customizationOptions.auraColors.filter(a => a.xp <= userStats.xp)
    };

    const randomSkinTone = availableOptions.skinTones[Math.floor(Math.random() * availableOptions.skinTones.length)];
    const randomExpression = availableOptions.expressions[Math.floor(Math.random() * availableOptions.expressions.length)];
    const randomWeapon = availableOptions.weapons[Math.floor(Math.random() * availableOptions.weapons.length)];
    const randomPet = availableOptions.pets[Math.floor(Math.random() * availableOptions.pets.length)];
    const randomAura = availableOptions.auras[Math.floor(Math.random() * availableOptions.auras.length)];

    setCharacter(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        skinTone: randomSkinTone.id,
        faceExpression: randomExpression.id
      },
      equipment: {
        ...prev.equipment,
        weapon: randomWeapon.id,
        pet: randomPet.id
      },
      aura: {
        ...prev.aura,
        color: randomAura.id,
        intensity: 30 + Math.random() * 50
      }
    }));
  };

  const PixelCharacterPreview = () => {
    const currentClass = classPresets[character.class];
    const IconComponent = currentClass.icon;
    const breatheOffset = Math.sin(animationFrame * 0.2) * 3;

    return (
      <div className="relative">
        {/* Enhanced Character Avatar */}
        <div 
          className={`w-48 h-48 rounded-lg bg-gradient-to-br ${currentClass.bgColor} flex items-center justify-center border-4 border-white/20 shadow-2xl relative overflow-hidden ${getRarityGlow(character.equipment.weapon)}`}
          style={{ transform: `translateY(${breatheOffset}px)` }}
        >
          {/* Dynamic Aura Effect */}
          <div 
            className="absolute inset-0 opacity-40 animate-pulse rounded-lg"
            style={{ 
              background: character.aura.color.includes('gradient') ? 
                character.aura.color : 
                `radial-gradient(circle, ${customizationOptions.auraColors.find(c => c.id === character.aura.color)?.color}${Math.round(character.aura.intensity)}%, transparent 70%)` 
            }}
          />
          
          {/* Aura Particles */}
          {character.aura.particles && (
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-float opacity-60"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 3) * 20}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${2 + Math.random()}s`
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Main Character Icon with class-specific styling */}
          <div className="relative z-10 flex flex-col items-center">
            <IconComponent className="w-20 h-20 text-white mb-2 drop-shadow-lg" />
            
            {/* Weapon overlay */}
            {character.equipment.weapon !== 'none' && (
              <div className="absolute top-2 -right-6">
                <Sword className="w-8 h-8 text-yellow-400 drop-shadow-lg animate-pulse" />
              </div>
            )}
            
            {/* Pet companion */}
            {character.equipment.pet !== 'none' && (
              <div className="absolute -bottom-4 -right-8 text-2xl animate-bounce">
                {character.equipment.pet === 'spirit_fox' ? '🦊' :
                 character.equipment.pet === 'steel_dragon' ? '🐉' :
                 character.equipment.pet === 'void_raven' ? '🐦‍⬛' :
                 character.equipment.pet === 'golden_phoenix' ? '🔥' :
                 character.equipment.pet === 'market_spirit' ? '👻' : '✨'}
              </div>
            )}
          </div>
          
          {/* Equipment Overlays */}
          {character.equipment.helmet !== 'none' && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-gradient-to-b from-gray-600 to-gray-800 rounded-t-lg opacity-80" />
          )}
          
          {character.equipment.cape !== 'none' && (
            <div className="absolute top-8 -left-2 w-6 h-12 bg-gradient-to-b from-red-600 to-red-800 transform -rotate-12 opacity-70 rounded" />
          )}
        </div>

        {/* Enhanced Character Info */}
        <div className="mt-6 text-center space-y-3">
          <div className={`text-2xl font-bold pixel-font bg-gradient-to-r ${currentClass.bgColor} bg-clip-text text-transparent`}>
            {currentClass.name}
          </div>
          <div className="text-gray-300 text-sm">{currentClass.title}</div>
          
          <div className="flex justify-center space-x-2">
            <Badge className={`bg-gradient-to-r ${currentClass.bgColor} text-white border-0`}>
              Level {character.level}
            </Badge>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              {character.xp} XP
            </Badge>
          </div>
          
          {/* Enhanced Stats Preview */}
          <div className="grid grid-cols-3 gap-3 text-sm bg-black/40 rounded-lg p-3 border border-purple-500/20">
            <div className="text-center">
              <div className="text-blue-400 font-semibold">WIS</div>
              <div className="text-white text-lg font-bold">{character.stats.wisdom}</div>
              <Progress value={character.stats.wisdom} className="h-1 mt-1" />
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-semibold">STL</div>
              <div className="text-white text-lg font-bold">{character.stats.stealth}</div>
              <Progress value={character.stats.stealth} className="h-1 mt-1" />
            </div>
            <div className="text-center">
              <div className="text-red-400 font-semibold">AGG</div>
              <div className="text-white text-lg font-bold">{character.stats.aggression}</div>
              <Progress value={character.stats.aggression} className="h-1 mt-1" />
            </div>
          </div>

          {/* Special Abilities */}
          <div className="text-xs text-gray-400 space-y-1">
            <div className="font-semibold text-purple-400">Special Abilities:</div>
            {currentClass.specialAbilities.map((ability, index) => (
              <div key={index} className="flex items-center justify-center space-x-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span>{ability}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden glass-card border-gradient-to-r from-purple-500/20 to-pink-500/20">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Character Preview */}
            <div className="p-8 bg-gradient-to-br from-purple-900/20 to-black border-r border-purple-500/20">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold gradient-text mb-2 flex items-center justify-center">
                  <Crown className="w-8 h-8 mr-3 text-yellow-400" />
                  Pixel Avatar Designer
                  <Crown className="w-8 h-8 ml-3 text-yellow-400" />
                </h2>
                <p className="text-gray-400">Forge your legendary warrior</p>
              </div>
              
              <div className="flex justify-center mb-6">
                <PixelCharacterPreview />
              </div>
              
              {/* Quick Actions */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={randomizeCharacter}
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Randomize
                </Button>
              </div>
            </div>

            {/* Customization Panel */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2 bg-gray-800/50 p-2 rounded-lg">
                {[
                  { id: 'class' as const, name: 'Class', icon: Crown },
                  { id: 'appearance' as const, name: 'Face', icon: Eye },
                  { id: 'equipment' as const, name: 'Gear', icon: Sword },
                  { id: 'aura' as const, name: 'Aura', icon: Sparkles },
                  { id: 'preview' as const, name: 'Story', icon: Star }
                ].map(tab => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-2 px-4 rounded-md transition-all ${
                        activeTab === tab.id 
                          ? 'bg-purple-600 text-white shadow-lg' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <TabIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Class Selection */}
              {activeTab === 'class' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4">Choose Your Path</h3>
                  {Object.entries(classPresets).map(([key, preset]) => {
                    const IconComponent = preset.icon;
                    return (
                      <div
                        key={key}
                        onClick={() => handleClassSelect(key as keyof typeof classPresets)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          character.class === key 
                            ? 'border-purple-400 bg-purple-900/30 shadow-lg shadow-purple-500/20' 
                            : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/30'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${preset.bgColor} flex items-center justify-center shadow-lg`}>
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white text-lg">{preset.name}</h4>
                            <p className="text-purple-400 text-sm font-medium mb-2">{preset.title}</p>
                            <p className="text-gray-400 text-sm mb-3">{preset.lore}</p>
                            
                            {/* Stats Preview */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center bg-blue-900/30 rounded p-1">
                                <div className="text-blue-400">WIS</div>
                                <div className="text-white font-bold">{preset.stats.wisdom}</div>
                              </div>
                              <div className="text-center bg-purple-900/30 rounded p-1">
                                <div className="text-purple-400">STL</div>
                                <div className="text-white font-bold">{preset.stats.stealth}</div>
                              </div>
                              <div className="text-center bg-red-900/30 rounded p-1">
                                <div className="text-red-400">AGG</div>
                                <div className="text-white font-bold">{preset.stats.aggression}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Appearance Customization */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">Customize Appearance</h3>
                  
                  {/* Skin Tone */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 block">Skin Tone</label>
                    <div className="grid grid-cols-3 gap-2">
                      {customizationOptions.skinTones
                        .filter(tone => !tone.xp || tone.xp <= userStats.xp)
                        .map(tone => (
                          <button
                            key={tone.id}
                            onClick={() => setCharacter(prev => ({ 
                              ...prev, 
                              appearance: { ...prev.appearance, skinTone: tone.id } 
                            }))}
                            className={`p-3 rounded-lg border-2 transition-all ${getRarityColor(tone.rarity)} ${
                              character.appearance.skinTone === tone.id 
                                ? 'border-white scale-105 shadow-lg' 
                                : 'border-current hover:scale-105'
                            }`}
                          >
                            <div 
                              className="w-full h-6 rounded mb-2"
                              style={{ backgroundColor: tone.color }}
                            />
                            <div className="text-xs font-medium">{tone.name}</div>
                            {tone.rarity !== 'common' && (
                              <Badge className={`text-xs mt-1 ${getRarityColor(tone.rarity)}`} variant="outline">
                                {tone.rarity}
                              </Badge>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Face Expression */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 block">Expression</label>
                    <div className="grid grid-cols-2 gap-2">
                      {customizationOptions.expressions
                        .filter(expr => !expr.xp || expr.xp <= userStats.xp)
                        .map(expression => (
                          <button
                            key={expression.id}
                            onClick={() => setCharacter(prev => ({ 
                              ...prev, 
                              appearance: { ...prev.appearance, faceExpression: expression.id } 
                            }))}
                            className={`p-3 rounded-lg border transition-all ${getRarityColor(expression.rarity)} ${
                              character.appearance.faceExpression === expression.id 
                                ? 'border-white bg-current/20' 
                                : 'border-current hover:bg-current/10'
                            }`}
                          >
                            <div className="text-2xl mb-1">{expression.emoji}</div>
                            <div className="text-sm font-medium">{expression.name}</div>
                            {expression.rarity !== 'common' && (
                              <Badge className={`text-xs mt-1 ${getRarityColor(expression.rarity)}`} variant="outline">
                                {expression.rarity}
                              </Badge>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Equipment */}
              {activeTab === 'equipment' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">Equipment & Companions</h3>
                  
                  {/* Weapons */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 block">Weapon</label>
                    <div className="grid grid-cols-1 gap-2">
                      {customizationOptions.equipment.weapons
                        .filter(weapon => weapon.xp <= userStats.xp)
                        .map(weapon => (
                          <button
                            key={weapon.id}
                            onClick={() => setCharacter(prev => ({ 
                              ...prev, 
                              equipment: { ...prev.equipment, weapon: weapon.id } 
                            }))}
                            className={`p-3 rounded-lg border text-left transition-all ${getRarityColor(weapon.rarity)} ${
                              character.equipment.weapon === weapon.id 
                                ? 'border-white bg-current/20 shadow-lg' 
                                : 'border-current hover:bg-current/10'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-white font-medium">{weapon.name}</div>
                                <div className="text-xs text-gray-400">Power: {weapon.power}</div>
                              </div>
                              <div className="text-right">
                                <Badge className={`text-xs ${getRarityColor(weapon.rarity)}`} variant="outline">
                                  {weapon.rarity}
                                </Badge>
                                {weapon.xp > 0 && (
                                  <div className="text-xs text-yellow-400 mt-1">{weapon.xp} XP</div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Pets */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 block">Battle Companion</label>
                    <div className="grid grid-cols-1 gap-2">
                      {customizationOptions.equipment.pets
                        .filter(pet => pet.xp <= userStats.xp)
                        .map(pet => (
                          <button
                            key={pet.id}
                            onClick={() => setCharacter(prev => ({ 
                              ...prev, 
                              equipment: { ...prev.equipment, pet: pet.id } 
                            }))}
                            className={`p-3 rounded-lg border text-left transition-all ${getRarityColor(pet.rarity)} ${
                              character.equipment.pet === pet.id 
                                ? 'border-white bg-current/20 shadow-lg' 
                                : 'border-current hover:bg-current/10'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-white font-medium">{pet.name}</div>
                                <div className="text-xs text-gray-400">Bonus: {pet.bonus}</div>
                              </div>
                              <div className="text-right">
                                <Badge className={`text-xs ${getRarityColor(pet.rarity)}`} variant="outline">
                                  {pet.rarity}
                                </Badge>
                                {pet.xp > 0 && (
                                  <div className="text-xs text-yellow-400 mt-1">{pet.xp} XP</div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Aura Customization */}
              {activeTab === 'aura' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">Battle Aura</h3>
                  
                  {/* Aura Color */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 block">Aura Color</label>
                    <div className="grid grid-cols-2 gap-2">
                      {customizationOptions.auraColors
                        .filter(aura => !aura.xp || aura.xp <= userStats.xp)
                        .map(aura => (
                          <button
                            key={aura.id}
                            onClick={() => setCharacter(prev => ({ 
                              ...prev, 
                              aura: { ...prev.aura, color: aura.id } 
                            }))}
                            className={`p-3 rounded-lg border-2 transition-all ${getRarityColor(aura.rarity)} ${
                              character.aura.color === aura.id 
                                ? 'border-white scale-105 shadow-lg' 
                                : 'border-current hover:scale-105'
                            }`}
                          >
                            <div 
                              className="w-full h-6 rounded mb-2"
                              style={{ 
                                background: aura.color.includes('gradient') ? aura.color : aura.color 
                              }}
                            />
                            <div className="text-xs font-medium">{aura.name}</div>
                            {aura.rarity !== 'common' && (
                              <Badge className={`text-xs mt-1 ${getRarityColor(aura.rarity)}`} variant="outline">
                                {aura.rarity}
                              </Badge>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Aura Intensity */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Intensity: {Math.round(character.aura.intensity)}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={character.aura.intensity}
                      onChange={(e) => setCharacter(prev => ({ 
                        ...prev, 
                        aura: { ...prev.aura, intensity: parseInt(e.target.value) } 
                      }))}
                      className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Aura Pattern */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 block">Aura Pattern</label>
                    <div className="grid grid-cols-2 gap-2">
                      {customizationOptions.auraPatterns
                        .filter(pattern => !pattern.xp || pattern.xp <= userStats.xp)
                        .map(pattern => (
                          <button
                            key={pattern.id}
                            onClick={() => setCharacter(prev => ({ 
                              ...prev, 
                              aura: { ...prev.aura, pattern: pattern.id } 
                            }))}
                            className={`p-3 rounded-lg border transition-all ${getRarityColor(pattern.rarity)} ${
                              character.aura.pattern === pattern.id 
                                ? 'border-white bg-current/20' 
                                : 'border-current hover:bg-current/10'
                            }`}
                          >
                            <div className="text-sm font-medium">{pattern.name}</div>
                            {pattern.rarity !== 'common' && (
                              <Badge className={`text-xs mt-1 ${getRarityColor(pattern.rarity)}`} variant="outline">
                                {pattern.rarity}
                              </Badge>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Particle Effects */}
                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={character.aura.particles}
                        onChange={(e) => setCharacter(prev => ({ 
                          ...prev, 
                          aura: { ...prev.aura, particles: e.target.checked } 
                        }))}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-300">Enable Particle Effects</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Character Story & Lore */}
              {activeTab === 'preview' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">Your Legend</h3>
                  
                  <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-lg p-6 border border-purple-500/20">
                    <div className="space-y-4">
                      <div className="text-center">
                        <h4 className="text-2xl font-bold text-yellow-400 mb-2">
                          {classPresets[character.class].name}
                        </h4>
                        <p className="text-purple-400 font-medium">
                          {classPresets[character.class].title}
                        </p>
                      </div>
                      
                      <div className="text-center text-gray-300 italic">
                        "{classPresets[character.class].lore}"
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-black/40 rounded-lg p-3">
                          <h5 className="text-yellow-400 font-semibold mb-2">Combat Stats</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-blue-400">Wisdom</span>
                              <span className="text-white">{character.stats.wisdom}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-purple-400">Stealth</span>
                              <span className="text-white">{character.stats.stealth}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-400">Aggression</span>
                              <span className="text-white">{character.stats.aggression}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-black/40 rounded-lg p-3">
                          <h5 className="text-yellow-400 font-semibold mb-2">Equipment</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Weapon</span>
                              <span className="text-white">
                                {customizationOptions.equipment.weapons.find(w => w.id === character.equipment.weapon)?.name || 'None'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Companion</span>
                              <span className="text-white">
                                {customizationOptions.equipment.pets.find(p => p.id === character.equipment.pet)?.name || 'None'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center mt-6">
                        <p className="text-sm text-gray-400 mb-4">
                          "In the ancient dojo of Aasakira, where cherry blossoms fall like memories of forgotten trades, 
                          your legend begins. Each battle won, each market mastered, each prediction proven true - 
                          all these shape the warrior you become."
                        </p>
                        <div className="text-xs text-purple-400">
                          Ready to enter the arena and prove your worth?
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4 border-t border-purple-500/20">
                {onClose && (
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-400 hover:bg-gray-800/50"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={() => onCharacterCreate(character)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Character
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PixelAvatarDesigner;
