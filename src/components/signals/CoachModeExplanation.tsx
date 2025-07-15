
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  MessageCircle, 
  BookOpen, 
  TrendingUp,
  Target,
  Award,
  Clock
} from 'lucide-react';

interface CoachModeExplanationProps {
  signal: any;
  onClose: () => void;
  onJournalLog: () => void;
}

const CoachModeExplanation: React.FC<CoachModeExplanationProps> = ({ 
  signal, 
  onClose, 
  onJournalLog 
}) => {
  const generateCoachResponse = (signal: any) => {
    const isLong = signal.type === 'BUY';
    const pair = signal.pair;
    const confidence = signal.confidence;
    
    return {
      voiceStyle: `Alright, let's break down this ${pair} setup for you...`,
      
      analysis: `We're looking at a ${isLong ? 'bullish' : 'bearish'} setup on ${pair} here. 
      The ${confidence}% confidence tells me the algorithms have aligned multiple confluences. 
      
      What caught my eye is the way smart money has positioned itself - you can see the 
      institutional footprints in the volume patterns and the way liquidity was swept 
      before this entry formed.`,
      
      progress: `You've analyzed 8 hybrid signals this week, and this one actually 
      matches the profile of your best-performing setups. Remember that EURUSD signal 
      from Tuesday? Same institutional characteristics.`,
      
      samuraiTip: `Samurai Tip: Notice how the imbalance lines up with the break of structure 
      here. This is textbook institutional entry - they've created the setup, swept the 
      liquidity, and now we're riding their wave. The patience you've been developing 
      is paying off.`,
      
      comparison: `Compared to the signals you've studied this week, this one has 
      stronger confluence but similar time decay patterns. Your accuracy on these 
      setups has improved 23% since last month.`
    };
  };

  const coachResponse = generateCoachResponse(signal);

  return (
    <Card className="glass-card border-2 border-purple-500/50 max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-400" />
          🧠 Coach Mode Analysis
          <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30">
            Personal Mentor
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Voice-Style Opening */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">Coach Speaking</span>
          </div>
          <p className="text-blue-100 text-lg italic leading-relaxed">
            "{coachResponse.voiceStyle}"
          </p>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-gray-800/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Technical Breakdown</span>
          </div>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {coachResponse.analysis}
          </p>
        </div>

        {/* Progress Integration */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold">Your Progress</span>
          </div>
          <p className="text-purple-100 leading-relaxed">
            {coachResponse.progress}
          </p>
        </div>

        {/* Samurai Wisdom */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">Mentorship Insight</span>
          </div>
          <p className="text-yellow-100 leading-relaxed italic">
            {coachResponse.samuraiTip}
          </p>
        </div>

        {/* Comparison to Past Learning */}
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-semibold">Learning Integration</span>
          </div>
          <p className="text-cyan-100 leading-relaxed">
            {coachResponse.comparison}
          </p>
        </div>

        {/* Signal Stats in Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{signal.confidence}%</div>
            <div className="text-sm text-gray-400">AI Confidence</div>
            <div className="text-xs text-green-300 mt-1">Above your 72% average</div>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {signal.riskReward || '2.5'}:1
            </div>
            <div className="text-sm text-gray-400">Risk:Reward</div>
            <div className="text-xs text-blue-300 mt-1">Matches your preference</div>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">8/10</div>
            <div className="text-sm text-gray-400">Signals This Week</div>
            <div className="text-xs text-purple-300 mt-1">Learning accelerating</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onJournalLog}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Log to Journal & Review Tomorrow
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
          >
            Got It!
          </Button>
        </div>

        {/* Coach Signature */}
        <div className="text-center pt-4 border-t border-gray-700/50">
          <p className="text-gray-400 text-sm italic">
            "Remember, every master was once a disaster. Keep learning, keep growing." 
            <br />
            <span className="text-purple-400">- Your AI Trading Coach</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoachModeExplanation;
