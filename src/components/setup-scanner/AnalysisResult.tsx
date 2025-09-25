import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  BookOpen,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { TradeSetup } from '@/pages/SetupScanner';

interface AnalysisResultProps {
  setup: TradeSetup | null;
  onBackToForm: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ setup, onBackToForm }) => {
  const { toast } = useToast();

  if (!setup) {
    return null;
  }

  const { ai_score = 0, ai_feedback = {} } = setup;
  const {
    strengths = [],
    weaknesses = [],
    improvements = [],
    risk_reward = 'N/A',
    probability = 'Medium'
  } = ai_feedback;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const handleSaveToJournal = async () => {
    try {
      const journalEntry = {
        user_id: setup.user_id,
        pair: setup.pair,
        direction: setup.direction.toLowerCase(),
        entry_price: 0, // User will need to fill this when they actually enter
        entry_time: new Date().toISOString(),
        stop_loss: setup.stop_loss,
        take_profit: setup.take_profit,
        strategy: `Setup Scanner - ${setup.entry_reason.substring(0, 50)}...`,
        status: 'PLANNED',
        notes: `AI Score: ${ai_score}/100\n\nEntry Reason: ${setup.entry_reason}\n\nAI Analysis:\n${JSON.stringify(ai_feedback, null, 2)}`,
        ai_feedback: JSON.stringify(ai_feedback)
      };

      const { error } = await supabase
        .from('journal_entries')
        .insert(journalEntry);

      if (error) throw error;

      // Update setup status
      await supabase
        .from('trade_setups')
        .update({ status: 'SAVED_TO_JOURNAL' })
        .eq('id', setup.id);

      toast({
        title: "Saved to Journal!",
        description: "Your setup has been saved to your trading journal"
      });

    } catch (error) {
      console.error('Error saving to journal:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving to your journal",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBackToForm}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Analyze Another Setup
        </Button>
        <Button onClick={handleSaveToJournal} className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Save to Journal
        </Button>
      </div>

      {/* Setup Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{setup.pair} - {setup.direction}</span>
            <Badge variant={setup.direction === 'BUY' ? 'default' : 'secondary'}>
              {setup.direction}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Stop Loss:</span>
              <p className="font-medium">{setup.stop_loss}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Take Profit:</span>
              <p className="font-medium">{setup.take_profit}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Risk/Reward:</span>
              <p className="font-medium">{risk_reward}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Timeframe:</span>
              <p className="font-medium">{setup.timeframe}</p>
            </div>
          </div>
          
          {setup.screenshot_url && (
            <div className="mt-4">
              <img
                src={setup.screenshot_url}
                alt="Trading setup"
                className="w-full max-h-64 object-contain rounded-lg border"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            AI Analysis Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(ai_score)}`}>
                {ai_score}
              </div>
              <div className="text-sm text-muted-foreground">/ 100</div>
            </div>
            <div className="flex-1">
              <Progress value={ai_score} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Setup Quality: <span className={`font-medium ${getScoreColor(ai_score)}`}>
                  {getScoreLabel(ai_score)}
                </span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Probability:</span>
            <Badge variant={probability === 'High' ? 'default' : probability === 'Medium' ? 'secondary' : 'outline'}>
              {probability}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No specific strengths identified.</p>
            )}
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Areas of Concern
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weaknesses.length > 0 ? (
              <ul className="space-y-2">
                {weaknesses.map((weakness: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{weakness}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No major concerns identified.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Improvements */}
      {improvements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Target className="h-5 w-5" />
              Suggested Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {improvements.map((improvement: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Entry Reason */}
      <Card>
        <CardHeader>
          <CardTitle>Your Entry Reason</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{setup.entry_reason}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResult;