
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
  Flame
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
  };
  equipment: {
    weapon: string;
    armor: string;
    mask: string;
    cape: string;
    accessory: string;
  };
  aura: {
    color: string;
    intensity: number;
    pattern: string;
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
}

const PixelAvatarDesigner = ({ userStats, selectedClass, onCharacterCreate }: PixelAvatarDesignerProps) => {
  const [character, setCharacter] = useState<PixelCharacter>({
    id: '',
    name: '',
    class: 'monk',
    appearance: {
      skinTone: 'light',
      hairStyle: 'bald',
      hairColor: 'black',
      eyeColor: 'brown',
      faceExpression: 'focused'
    },
    equipment: {
      weapon: 'none',
      armor: 'basic_robe',
      mask: 'none',
      cape: 'none',
      accessory: 'none'
    },
    aura: {
      color: 'blue',
      intensity: 30,
      pattern: 'steady'
    },
    stats: {
      wisdom: 50,
      stealth: 50,
      aggression: 50
    },
    xp: userStats.xp,
    level: Math.floor(userStats.xp / 100) + 1
  });

  const [activeTab, setActiveTab] = useState<'class' | 'appearance' | 'equipment' | 'aura'>('class');

  // Character class presets
  const classPresets = {
    monk: {
      name: 'Wandering Monk',
      lore: 'A peaceful mind, a deadly precision. Studies the flow, waits for imbalance.',
      stats: { wisdom: 85, stealth: 60, aggression: 35 },
      defaultAppearance: {
        skinTone: 'tan',
        hairStyle: 'bald',
        hairColor: 'black',
        eyeColor: 'brown',
        faceExpression: 'serene'
      },
      defaultEquipment: {
        weapon: 'none',
        armor: 'brown_robe',
        mask: 'none',
        cape: 'none',
        accessory: 'prayer_beads'
      },
      aura: { color: 'gold', intensity: 25, pattern: 'gentle' },
      icon: Mountain,
      bgColor: 'from-amber-700 to-orange-800'
    },
    samurai: {
      name: 'Rising Samurai',
      lore: 'An aggressive warrior who conquers market direction with bold strikes.',
      stats: { wisdom: 60, stealth: 35, aggression: 85 },
      defaultAppearance: {
        skinTone: 'light',
        hairStyle: 'topknot',
        hairColor: 'black',
        eyeColor: 'dark',
        faceExpression: 'determined'
      },
      defaultEquipment: {
        weapon: 'wooden_sword',
        armor: 'red_robe',
        mask: 'none',
        cape: 'none',
        accessory: 'red_belt'
      },
      aura: { color: 'red', intensity: 45, pattern: 'flame' },
      icon: Sword,
      bgColor: 'from-red-700 to-red-900'
    },
    phantom: {
      name: 'Market Phantom',
      lore: 'A shadow from market edges. Master of range traps and misdirection.',
      stats: { wisdom: 50, stealth: 90, aggression: 60 },
      defaultAppearance: {
        skinTone: 'pale',
        hairStyle: 'hidden',
        hairColor: 'black',
        eyeColor: 'purple',
        faceExpression: 'mysterious'
      },
      defaultEquipment: {
        weapon: 'kunai',
        armor: 'black_cloak',
        mask: 'shadow_mask',
        cape: 'dark_cape',
        accessory: 'throwing_stars'
      },
      aura: { color: 'purple', intensity: 35, pattern: 'shadow' },
      icon: Ghost,
      bgColor: 'from-purple-800 to-gray-900'
    }
  };

  // Customization options
  const customizationOptions = {
    skinTones: [
      { id: 'pale', name: 'Pale', color: '#F5E6D3' },
      { id: 'light', name: 'Light', color: '#E8C4A0' },
      { id: 'tan', name: 'Tan', color: '#D4A574' },
      { id: 'dark', name: 'Dark', color: '#8B4513' }
    ],
    hairStyles: {
      monk: [
        { id: 'bald', name: 'Bald', unlocked: true },
        { id: 'short', name: 'Short Stubble', unlocked: userStats.xp >= 100 }
      ],
      samurai: [
        { id: 'topknot', name: 'Traditional Topknot', unlocked: true },
        { id: 'long', name: 'Long Hair', unlocked: userStats.xp >= 250 },
        { id: 'braided', name: 'Warrior Braids', unlocked: userStats.xp >= 500 }
      ],
      phantom: [
        { id: 'hidden', name: 'Hidden', unlocked: true },
        { id: 'mysterious', name: 'Shadowed', unlocked: userStats.xp >= 100 }
      ]
    },
    equipment: {
      weapons: [
        { id: 'none', name: 'Empty Hands', xp: 0, rarity: 'common' },
        { id: 'wooden_sword', name: 'Wooden Sword', xp: 0, rarity: 'common' },
        { id: 'kunai', name: 'Kunai', xp: 0, rarity: 'common' },
        { id: 'obsidian_blade', name: 'Obsidian Blade', xp: 250, rarity: 'rare' },
        { id: 'white_katana', name: 'White Katana', xp: 500, rarity: 'epic' },
        { id: 'soulpiercer', name: 'Soulpiercer Naginata', xp: 2000, rarity: 'legendary' },
        { id: 'galaxy_katana', name: 'Galaxy Katana', xp: 5000, rarity: 'mythic' }
      ],
      armor: [
        { id: 'brown_robe', name: 'Brown Monk Robe', xp: 0, rarity: 'common' },
        { id: 'red_robe', name: 'Red Samurai Robe', xp: 0, rarity: 'common' },
        { id: 'black_cloak', name: 'Black Cloak', xp: 0, rarity: 'common' },
        { id: 'tiger_cloak', name: 'Tiger Cloak', xp: 250, rarity: 'rare' },
        { id: 'celestial_armor', name: 'Celestial Armor', xp: 1000, rarity: 'epic' },
        { id: 'void_cloak', name: 'Mythic Void Cloak', xp: 5000, rarity: 'mythic' }
      ],
      masks: [
        { id: 'none', name: 'No Mask', xp: 0, rarity: 'common' },
        { id: 'shinobi_mask', name: 'Shinobi Mask', xp: 100, rarity: 'common' },
        { id: 'shadow_mask', name: 'Shadow Mask', xp: 100, rarity: 'common' },
        { id: 'oni_mask', name: 'Oni Mask', xp: 1000, rarity: 'epic' },
        { id: 'dragon_helm', name: 'Dragon Helm', xp: 2000, rarity: 'legendary' }
      ]
    },
    auraColors: [
      { id: 'blue', name: 'Mystic Blue', color: '#3B82F6' },
      { id: 'red', name: 'Flame Red', color: '#EF4444' },
      { id: 'purple', name: 'Shadow Purple', color: '#8B5CF6' },
      { id: 'gold', name: 'Sacred Gold', color: '#F59E0B' },
      { id: 'green', name: 'Nature Green', color: '#10B981' },
      { id: 'white', name: 'Pure White', color: '#F8FAFC' }
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
      aura: preset.aura
    }));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      case 'mythic': return 'text-pink-400 border-pink-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const PixelCharacterPreview = () => {
    const currentClass = classPresets[character.class];
    const IconComponent = currentClass.icon;

    return (
      <div className="relative">
        {/* Character Avatar */}
        <div className={`w-32 h-32 rounded-lg bg-gradient-to-br ${currentClass.bgColor} flex items-center justify-center border-4 border-white/20 shadow-2xl relative overflow-hidden`}>
          {/* Aura Effect */}
          <div 
            className="absolute inset-0 opacity-30 animate-pulse"
            style={{ 
              background: `radial-gradient(circle, ${customizationOptions.auraColors.find(c => c.id === character.aura.color)?.color}40 0%, transparent 70%)` 
            }}
          />
          
          {/* Character Icon */}
          <IconComponent className="w-16 h-16 text-white z-10" />
          
          {/* Equipment Overlays */}
          {character.equipment.mask !== 'none' && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
          )}
          
          {character.equipment.cape !== 'none' && (
            <div className="absolute -top-2 -left-2 w-4 h-8 bg-gradient-to-b from-red-600 to-red-800 transform rotate-12 opacity-60" />
          )}
        </div>

        {/* Character Info */}
        <div className="mt-4 text-center">
          <h3 className="text-lg font-bold text-white">{currentClass.name}</h3>
          <Badge className={`bg-gradient-to-r ${currentClass.bgColor} text-white border-0 mb-2`}>
            Level {character.level}
          </Badge>
          
          {/* Stats Preview */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-blue-400">WIS</div>
              <div className="text-white font-bold">{character.stats.wisdom}</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400">STL</div>
              <div className="text-white font-bold">{character.stats.stealth}</div>
            </div>
            <div className="text-center">
              <div className="text-red-400">AGG</div>
              <div className="text-white font-bold">{character.stats.aggression}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="glass-card border-gradient-to-r from-purple-500/20 to-pink-500/20">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Character Preview */}
          <div className="text-center">
            <h2 className="text-2xl font-bold gradient-text mb-6">Pixel Avatar Designer</h2>
            <PixelCharacterPreview />
            
            {/* XP Progress */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">XP Progress</span>
                <span className="text-yellow-400">{character.xp} / {(character.level * 100)}</span>
              </div>
              <Progress value={(character.xp % 100)} className="h-2 bg-gray-800" />
            </div>
          </div>

          {/* Customization Panel */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-2 bg-gray-800/50 p-1 rounded-lg">
              {[
                { id: 'class' as const, name: 'Class', icon: Crown },
                { id: 'appearance' as const, name: 'Look', icon: Eye },
                { id: 'equipment' as const, name: 'Gear', icon: Sword },
                { id: 'aura' as const, name: 'Aura', icon: Sparkles }
              ].map(tab => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all ${
                      activeTab === tab.id 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span className="text-sm">{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Class Selection */}
            {activeTab === 'class' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Choose Your Path</h3>
                {Object.entries(classPresets).map(([key, preset]) => {
                  const IconComponent = preset.icon;
                  return (
                    <div
                      key={key}
                      onClick={() => handleClassSelect(key as keyof typeof classPresets)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        character.class === key 
                          ? 'border-purple-400 bg-purple-900/20' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${preset.bgColor} flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{preset.name}</h4>
                          <p className="text-sm text-gray-400">{preset.lore}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Appearance Customization */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Customize Appearance</h3>
                
                {/* Skin Tone */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Skin Tone</label>
                  <div className="grid grid-cols-4 gap-2">
                    {customizationOptions.skinTones.map(tone => (
                      <button
                        key={tone.id}
                        onClick={() => setCharacter(prev => ({ 
                          ...prev, 
                          appearance: { ...prev.appearance, skinTone: tone.id } 
                        }))}
                        className={`w-full h-8 rounded border-2 transition-all ${
                          character.appearance.skinTone === tone.id 
                            ? 'border-white scale-110' 
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: tone.color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair Style */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Hair Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {customizationOptions.hairStyles[character.class]?.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setCharacter(prev => ({ 
                          ...prev, 
                          appearance: { ...prev.appearance, hairStyle: style.id } 
                        }))}
                        disabled={!style.unlocked}
                        className={`p-2 rounded border text-sm transition-all ${
                          character.appearance.hairStyle === style.id 
                            ? 'border-purple-400 bg-purple-900/20 text-white' 
                            : style.unlocked
                            ? 'border-gray-600 text-gray-300 hover:border-gray-400'
                            : 'border-gray-700 text-gray-600 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {style.name}
                        {!style.unlocked && <div className="text-xs text-yellow-400">Locked</div>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Equipment */}
            {activeTab === 'equipment' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Equipment & Gear</h3>
                
                {/* Weapons */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Weapon</label>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {customizationOptions.equipment.weapons
                      .filter(weapon => weapon.xp <= userStats.xp)
                      .map(weapon => (
                        <button
                          key={weapon.id}
                          onClick={() => setCharacter(prev => ({ 
                            ...prev, 
                            equipment: { ...prev.equipment, weapon: weapon.id } 
                          }))}
                          className={`p-2 rounded border text-left transition-all ${
                            character.equipment.weapon === weapon.id 
                              ? 'border-purple-400 bg-purple-900/20' 
                              : 'border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-white text-sm">{weapon.name}</span>
                            <Badge className={`text-xs ${getRarityColor(weapon.rarity)}`} variant="outline">
                              {weapon.rarity}
                            </Badge>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Armor */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Armor</label>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {customizationOptions.equipment.armor
                      .filter(armor => armor.xp <= userStats.xp)
                      .map(armor => (
                        <button
                          key={armor.id}
                          onClick={() => setCharacter(prev => ({ 
                            ...prev, 
                            equipment: { ...prev.equipment, armor: armor.id } 
                          }))}
                          className={`p-2 rounded border text-left transition-all ${
                            character.equipment.armor === armor.id 
                              ? 'border-purple-400 bg-purple-900/20' 
                              : 'border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-white text-sm">{armor.name}</span>
                            <Badge className={`text-xs ${getRarityColor(armor.rarity)}`} variant="outline">
                              {armor.rarity}
                            </Badge>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Aura Customization */}
            {activeTab === 'aura' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Battle Aura</h3>
                
                {/* Aura Color */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Aura Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {customizationOptions.auraColors.map(aura => (
                      <button
                        key={aura.id}
                        onClick={() => setCharacter(prev => ({ 
                          ...prev, 
                          aura: { ...prev.aura, color: aura.id } 
                        }))}
                        className={`p-3 rounded border-2 transition-all ${
                          character.aura.color === aura.id 
                            ? 'border-white scale-105' 
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: aura.color + '20' }}
                      >
                        <div 
                          className="w-full h-4 rounded mb-1"
                          style={{ backgroundColor: aura.color }}
                        />
                        <div className="text-xs text-white">{aura.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aura Intensity */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Intensity: {character.aura.intensity}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={character.aura.intensity}
                    onChange={(e) => setCharacter(prev => ({ 
                      ...prev, 
                      aura: { ...prev.aura, intensity: parseInt(e.target.value) } 
                    }))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Create Character Button */}
            <Button
              onClick={() => onCharacterCreate(character)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
            >
              <Star className="w-4 h-4 mr-2" />
              Create My Pixel Warrior
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PixelAvatarDesigner;
