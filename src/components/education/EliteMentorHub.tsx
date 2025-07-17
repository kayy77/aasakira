
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Target, 
  BookOpen, 
  MessageSquare, 
  Trophy,
  Zap,
  Crown
} from 'lucide-react';
import ManualTradeAnalyzer from './ManualTradeAnalyzer';
import FrameworkTraining from './FrameworkTraining';
import TradingJournalSystem from './TradingJournalSystem';
import UltimateEliteAIMentor from './UltimateEliteAIMentor';

const EliteMentorHub: React.FC = () => {
  const [totalXP, setTotalXP] = useState(0);

  return (
    <div className="space-y-6">
      {/* Elite Header */}
      <Card className="glass-card border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-black/60">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-gold-400" />
              <div>
                <h1 className="text-2xl font-bold">Aasakira Elite Training Center</h1>
                <p className="text-gray-400 text-sm">Advanced AI-Powered Trading Education</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-lg px-4 py-2">
                <Trophy className="w-5 h-5 mr-2" />
                {totalXP} XP
              </Badge>
              <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30 text-sm">
                ELITE MEMBER
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Main Training Interface */}
      <Tabs defaultValue="mentor" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-purple-500/20">
          <TabsTrigger 
            value="mentor" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Mentor
          </TabsTrigger>
          <TabsTrigger 
            value="analyzer" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <Target className="w-4 h-4 mr-2" />
            Trade Analyzer
          </TabsTrigger>
          <TabsTrigger 
            value="training" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <Brain className="w-4 h-4 mr-2" />
            Framework Training
          </TabsTrigger>
          <TabsTrigger 
            value="journal" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Trading Journal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mentor" className="mt-6">
          <UltimateEliteAIMentor />
        </TabsContent>

        <TabsContent value="analyzer" className="mt-6">
          <ManualTradeAnalyzer />
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <FrameworkTraining />
        </TabsContent>

        <TabsContent value="journal" className="mt-6">
          <TradingJournalSystem />
        </TabsContent>
      </Tabs>

      {/* Quick Stats Footer */}
      <Card className="glass-card border-purple-500/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
              <div className="text-sm text-gray-400">Today's Progress</div>
              <div className="text-lg font-bold text-white">85%</div>
            </div>
            <div>
              <Target className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <div className="text-sm text-gray-400">Trades Analyzed</div>
              <div className="text-lg font-bold text-white">12</div>
            </div>
            <div>
              <Brain className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <div className="text-sm text-gray-400">Skills Mastered</div>
              <div className="text-lg font-bold text-white">7/15</div>
            </div>
            <div>
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <div className="text-sm text-gray-400">Journal Entries</div>
              <div className="text-lg font-bold text-white">23</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EliteMentorHub;
