import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Lightbulb,
  PlayCircle,
  Download,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface WeeklySummaryProps {
  entries: any[];
  weekStart?: Date;
}

interface WeeklyStats {
  totalTrades: number;
  wins: number;
  losses: number;
  breakeven: number;
  totalPnL: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
  avgWin: number;
  avgLoss: number;
}

interface AIImprovements {
  weaknesses: string[];
  strengths: string[];
  actionItems: string[];
  rating: number;
}

const WeeklySummary: React.FC<WeeklySummaryProps> = ({ entries, weekStart }) => {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [improvements, setImprovements] = useState<AIImprovements | null>(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [generatingImprovements, setGeneratingImprovements] = useState(false);
  const { toast } = useToast();

  const currentWeekStart = weekStart || startOfWeek(new Date());
  const currentWeekEnd = endOfWeek(currentWeekStart);

  useEffect(() => {
    calculateWeeklyStats();
  }, [entries, currentWeekStart]);

  const calculateWeeklyStats = () => {
    const weekTrades = entries.filter(entry => {
      const entryDate = new Date(entry.entry_time);
      return entryDate >= currentWeekStart && entryDate <= currentWeekEnd && entry.status === 'CLOSED';
    });

    if (weekTrades.length === 0) {
      setStats(null);
      return;
    }

    const wins = weekTrades.filter(t => (t.result_pips || 0) > 0);
    const losses = weekTrades.filter(t => (t.result_pips || 0) < 0);
    const breakeven = weekTrades.filter(t => (t.result_pips || 0) === 0);

    const calculateUSDPnL = (entry: any): number => {
      const pips = entry.result_pips || 0;
      const lotSize = entry.lot_size || 1;
      const fees = entry.fees || 0;
      const actualLotSize = lotSize === 0 ? 0.01 : lotSize;
      const pipValue = actualLotSize * 10;
      return (pips * pipValue) - fees;
    };

    const totalPnL = weekTrades.reduce((sum, t) => sum + calculateUSDPnL(t), 0);
    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + calculateUSDPnL(t), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + calculateUSDPnL(t), 0) / losses.length) : 0;
    const bestTrade = Math.max(...weekTrades.map(t => calculateUSDPnL(t)));
    const worstTrade = Math.min(...weekTrades.map(t => calculateUSDPnL(t)));

    setStats({
      totalTrades: weekTrades.length,
      wins: wins.length,
      losses: losses.length,
      breakeven: breakeven.length,
      totalPnL: Math.round(totalPnL * 100) / 100,
      winRate: Math.round((wins.length / weekTrades.length) * 100),
      bestTrade: Math.round(bestTrade * 100) / 100,
      worstTrade: Math.round(worstTrade * 100) / 100,
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
    });
  };

  const generateAIImprovements = async () => {
    if (!stats) return;

    setGeneratingImprovements(true);

    try {
      const weekTrades = entries.filter(entry => {
        const entryDate = new Date(entry.entry_time);
        return entryDate >= currentWeekStart && entryDate <= currentWeekEnd;
      });

      const { data, error } = await supabase.functions.invoke('generate-ai-feedback', {
        body: {
          stats,
          trades: weekTrades.slice(0, 10).map(t => ({
            pair: t.pair,
            direction: t.direction,
            strategy: t.strategy,
            result_pips: t.result_pips,
            notes: t.notes
          })),
          timeframe: 'weekly'
        }
      });

      if (error) throw error;

      setImprovements(data.improvements);
      
      toast({
        title: "AI Analysis Complete",
        description: "Your weekly improvements have been generated",
      });
    } catch (error) {
      console.error("Error generating improvements:", error);
      toast({
        title: "Analysis Failed",
        description: "Unable to generate AI improvements",
        variant: "destructive"
      });
    } finally {
      setGeneratingImprovements(false);
    }
  };

  const generateSummaryVideo = async () => {
    if (!stats) return;

    setGeneratingVideo(true);
    
    toast({
      title: "Video Generation Coming Soon",
      description: "AI-generated video summaries will be available in the next update",
    });

    setTimeout(() => {
      setGeneratingVideo(false);
    }, 2000);
  };

  if (!stats) {
    return (
      <Card className="glass-card border-purple-500/20">
        <CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Trades This Week</h3>
          <p className="text-gray-500">Complete some trades to see your weekly summary</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Stats Overview */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Week of {format(currentWeekStart, 'MMM dd')} - {format(currentWeekEnd, 'MMM dd, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-3xl font-bold text-white">{stats.totalTrades}</div>
              <div className="text-xs text-gray-400 mt-1">Total Trades</div>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-3xl font-bold text-green-400">{stats.wins}</div>
              <div className="text-xs text-gray-400 mt-1">Wins</div>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="text-3xl font-bold text-red-400">{stats.losses}</div>
              <div className="text-xs text-gray-400 mt-1">Losses</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="text-3xl font-bold text-purple-400">{stats.winRate}%</div>
              <div className="text-xs text-gray-400 mt-1">Win Rate</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Total P&L</div>
              <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${Math.abs(stats.totalPnL).toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Best Trade</div>
              <div className="text-2xl font-bold text-green-400">
                ${stats.bestTrade.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Avg Win</div>
              <div className="text-xl font-semibold text-green-400">
                ${stats.avgWin.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Avg Loss</div>
              <div className="text-xl font-semibold text-red-400">
                ${stats.avgLoss.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={generateSummaryVideo}
              disabled={generatingVideo}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {generatingVideo ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Generate Video Summary
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="border-purple-500/50 hover:bg-purple-500/10"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Improvements */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              AI Suggested Improvements
            </div>
            {!improvements && (
              <Button
                onClick={generateAIImprovements}
                disabled={generatingImprovements}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {generatingImprovements ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Generate Analysis'
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {improvements ? (
            <div className="space-y-6">
              {/* Performance Rating */}
              <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                <div className="text-sm text-gray-400 mb-2">Weekly Performance Rating</div>
                <div className="text-5xl font-bold text-purple-400">{improvements.rating}/10</div>
              </div>

              {/* Strengths */}
              {improvements.strengths.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Strengths
                  </h4>
                  <div className="space-y-2">
                    {improvements.strengths.map((strength, i) => (
                      <div key={i} className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <p className="text-gray-300">{strength}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {improvements.weaknesses.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    Areas for Improvement
                  </h4>
                  <div className="space-y-2">
                    {improvements.weaknesses.map((weakness, i) => (
                      <div key={i} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <p className="text-gray-300">{weakness}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {improvements.actionItems.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Action Items for Next Week
                  </h4>
                  <div className="space-y-2">
                    {improvements.actionItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <Badge className="mt-0.5 bg-purple-600">{i + 1}</Badge>
                        <p className="text-gray-300 flex-1">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Click "Generate Analysis" to get AI-powered insights on your weekly performance</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklySummary;
