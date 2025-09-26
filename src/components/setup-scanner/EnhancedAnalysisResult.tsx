import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  BookOpen,
  Star,
  Activity,
  Eye,
  Brain,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { TradeSetup } from '@/pages/SetupScanner';
import type { EnhancedAnalysisData } from '@/services/enhancedSetupAnalyzer';
import { enhancedSetupAnalyzer } from '@/services/enhancedSetupAnalyzer';
import LivePriceContext from './LivePriceContext';

interface EnhancedAnalysisResultProps {
  setup: TradeSetup | null;
  onBackToForm: () => void;
}

const EnhancedAnalysisResult: React.FC<EnhancedAnalysisResultProps> = ({ 
  setup, 
  onBackToForm 
}) => {
  const { toast } = useToast();
  const [enhancedData, setEnhancedData] = useState<EnhancedAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);

  // Load enhanced analysis data on component mount
  useEffect(() => {
    if (setup) {
      loadEnhancedAnalysis();
    }
  }, [setup]);

  const loadEnhancedAnalysis = async () => {
    if (!setup) return;
    
    setLoading(true);
    try {
      console.log('🔍 Loading enhanced analysis...');
      const data = await enhancedSetupAnalyzer.performEnhancedAnalysis(setup);
      setEnhancedData(data);
      console.log('✅ Enhanced analysis loaded:', data);
    } catch (error) {
      console.error('Failed to load enhanced analysis:', error);
      toast({
        title: "Enhanced Analysis Failed",
        description: "Using basic analysis only",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!setup) {
    return null;
  }

  const { ai_score = 0, ai_feedback = {} } = setup;
  const {
    strengths = [],
    weaknesses = [],
    improvements = [],
    critical_flaws = [],
    tactical_improvements = [],
    verdict = 'CONDITIONAL',
    institutional_grade = 'C',
    risk_assessment = 'MEDIUM',
    execution_advice = 'Review setup carefully before execution'
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

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const handleSaveToJournal = async () => {
    try {
      const journalEntry = {
        user_id: setup.user_id,
        pair: setup.pair,
        direction: setup.direction.toLowerCase(),
        entry_price: enhancedData?.recommendedEntry || setup.entry_price,
        entry_time: new Date().toISOString(),
        stop_loss: setup.stop_loss,
        take_profit: setup.take_profit,
        strategy: `Enhanced Scanner - ${setup.entry_reason.substring(0, 50)}...`,
        status: 'PLANNED',
        notes: `AI Score: ${ai_score}/100 | Verdict: ${verdict} | Grade: ${institutional_grade}\n\nEntry Reason: ${setup.entry_reason}\n\nEnhanced Analysis:\n${JSON.stringify({ ...ai_feedback, enhancedData }, null, 2)}`,
        ai_feedback: JSON.stringify({ ...ai_feedback, enhancedData })
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
        description: "Your enhanced setup analysis has been saved"
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

      {/* Elite Analysis Header */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              {setup.pair} - {setup.direction} Setup Analysis
            </span>
            <div className="flex items-center gap-2">
              <Badge className={`${getVerdictColor(verdict)} font-bold`}>
                {verdict}
              </Badge>
              <Badge variant="outline" className="font-bold">
                Grade: {institutional_grade}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Entry Price:</span>
              <p className="font-medium">{setup.entry_price}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Stop Loss:</span>
              <p className="font-medium">{setup.stop_loss}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Take Profit:</span>
              <p className="font-medium">{setup.take_profit}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Risk Assessment:</span>
              <Badge variant={risk_assessment === 'LOW' ? 'default' : risk_assessment === 'HIGH' ? 'destructive' : 'secondary'}>
                {risk_assessment}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Analysis */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="live-context" className="flex items-center gap-1" disabled={loading}>
            <Activity className="h-4 w-4" />
            Live Context
          </TabsTrigger>
          <TabsTrigger value="execution" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Execution
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            Chart
          </TabsTrigger>
        </TabsList>

        {/* Main Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {/* AI Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Elite AI Analysis Score
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

            {/* Critical Flaws */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Flaws
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(critical_flaws.length > 0 ? critical_flaws : weaknesses).map((flaw: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-red-800">{flaw}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Tactical Improvements */}
          {(tactical_improvements.length > 0 || improvements.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Target className="h-5 w-5" />
                  Tactical Improvements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(tactical_improvements.length > 0 ? tactical_improvements : improvements).map((improvement: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Live Context Tab */}
        <TabsContent value="live-context">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Activity className="h-8 w-8 animate-pulse mx-auto mb-2" />
                  <p>Loading live market context...</p>
                </div>
              </CardContent>
            </Card>
          ) : enhancedData ? (
            <LivePriceContext 
              analysisData={enhancedData}
              userEntry={setup.entry_price}
              direction={setup.direction}
            />
          ) : (
            <Card>
              <CardContent className="text-center p-8">
                <p>Enhanced analysis unavailable</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Execution Tab */}
        <TabsContent value="execution">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Execution Guidance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">AI Recommendation:</h4>
                  <p className="text-sm">{execution_advice}</p>
                </div>
                
                {enhancedData && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Recommended Entry:</p>
                      <p className="font-bold">{enhancedData.recommendedEntry.toFixed(5)}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Live R:R:</p>
                      <p className={`font-bold ${enhancedData.liveRiskReward >= 1.5 ? 'text-green-600' : 'text-red-600'}`}>
                        {enhancedData.liveRiskReward.toFixed(2)}:1
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chart Tab */}
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Chart Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {setup.screenshot_url ? (
                <div className="space-y-4">
                  <img
                    src={setup.screenshot_url}
                    alt="Trading setup chart"
                    className="w-full max-h-96 object-contain rounded-lg border"
                  />
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Your Analysis:</h4>
                    <p className="text-sm">{setup.entry_reason}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No chart uploaded for this setup.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalysisResult;