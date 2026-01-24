import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Scan, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  RefreshCw,
  Zap,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  evaluateConfirmationLayers, 
  calculateGrade, 
  calculateTimeDecay,
  getGradeColor,
  getGradeBg,
  type ScannerResult 
} from '@/services/setupScannerEngine';

const ScannerWidget: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [setups, setSetups] = useState<ScannerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (user) {
      loadRecentSetups();
    }
  }, [user]);

  const loadRecentSetups = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('trade_setups')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'ANALYZED')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const scannerResults: ScannerResult[] = (data || []).map(setup => {
        const feedback = setup.ai_feedback as Record<string, any> | null;
        const v1Context = feedback?.v1_context || {};

        const layers = evaluateConfirmationLayers({
          direction: setup.direction as 'BUY' | 'SELL',
          market_structure: v1Context.market_structure || 'bullish',
          liquidity_sweep: v1Context.liquidity_sweep || 'none',
          session_context: v1Context.session_context || 'london',
          entry_price: setup.entry_price || 0,
          stop_loss: setup.stop_loss,
          take_profit: setup.take_profit,
          timeframe: setup.timeframe || '1H'
        });

        const { grade, score } = calculateGrade(layers);
        const detectedAt = new Date(setup.created_at);

        return {
          id: setup.id,
          pair: setup.pair,
          direction: setup.direction as 'BUY' | 'SELL',
          grade,
          confidenceScore: setup.ai_score || score,
          layers,
          tradePlan: { entryZone: { min: 0, max: 0 }, stopLossZone: { min: 0, max: 0 }, tpLadder: [], invalidationRule: '' },
          warnings: [],
          keyReason: layers.find(l => l.passed)?.reason || 'Review setup',
          detectedAt,
          timeDecay: calculateTimeDecay(detectedAt)
        };
      });

      // Filter to only show A/B grade setups
      const qualitySetups = scannerResults.filter(s => ['A+', 'A', 'B'].includes(s.grade));
      setSetups(qualitySetups);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to load setups:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getFreshnessColor = (decay: number) => {
    if (decay >= 70) return 'bg-green-500';
    if (decay >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Scan className="h-4 w-4 text-primary" />
            Best Setups Now
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadRecentSetups}
              disabled={loading}
              className="h-7 px-2"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            </Button>
            <Badge variant="outline" className="text-xs">
              <Filter className="h-3 w-3 mr-1" />
              A/B Only
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading setups...</p>
          </div>
        ) : setups.length === 0 ? (
          <div className="py-8 text-center">
            <Scan className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No A/B Setups</p>
            <p className="text-xs text-muted-foreground mb-4">
              Add setups to see quality trades here
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/setup-scanner')}
            >
              Open Scanner
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="space-y-2 pr-2">
              {setups.map((setup) => (
                <div
                  key={setup.id}
                  className="p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => navigate('/setup-scanner')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {setup.direction === 'BUY' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-semibold text-sm">{setup.pair}</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs h-5',
                          setup.direction === 'BUY' 
                            ? 'border-green-500/50 text-green-500' 
                            : 'border-red-500/50 text-red-500'
                        )}
                      >
                        {setup.direction}
                      </Badge>
                    </div>

                    <div className={cn(
                      'px-2 py-0.5 rounded text-xs font-bold',
                      getGradeBg(setup.grade)
                    )}>
                      <span className={getGradeColor(setup.grade)}>{setup.grade}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        {setup.confidenceScore}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(setup.detectedAt)}
                      </span>
                    </div>

                    {/* Freshness indicator */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn('h-full rounded-full', getFreshnessColor(setup.timeDecay))}
                          style={{ width: `${setup.timeDecay}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-border/50">
          <Button 
            variant="ghost" 
            className="w-full h-8 text-xs justify-between hover:bg-muted/50"
            onClick={() => navigate('/setup-scanner')}
          >
            <span className="flex items-center gap-1.5">
              <Scan className="h-3.5 w-3.5" />
              View All Setups
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Last refresh indicator */}
        <p className="text-[10px] text-muted-foreground text-center">
          Last updated: {formatTimeAgo(lastRefresh)}
        </p>
      </CardContent>
    </Card>
  );
};

export default ScannerWidget;
