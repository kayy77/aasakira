import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Clock, TrendingUp, TrendingDown, Zap, Target, AlertTriangle,
  RefreshCw, Brain, BarChart3, Layers, Gauge, Settings2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, isToday, isTomorrow, addDays } from 'date-fns';

interface EnhancedEconomicEvent {
  id: string;
  event_name: string;
  country: string;
  currency: string;
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
  event_time: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  source: string;
  category: string;
}

interface EventAnalysis {
  id: string;
  event_id: string;
  ai_summary: string;
  market_sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  trade_opportunity: string | null;
  volatility_level: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  affected_pairs: string[] | null;
  confidence_score: number | null;
}

export const EnhancedEconomicCalendar = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<EnhancedEconomicEvent[]>([]);
  const [analyses, setAnalyses] = useState<EventAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [selectedImportance, setSelectedImportance] = useState<string>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('TODAY');
  const [qualityFilter, setQualityFilter] = useState<boolean>(false);

  const fetchEvents = async () => {
    try {
      // Fetch enhanced economic events
      let { data: eventsData, error: eventsError } = await supabase
        .from('economic_events')
        .select('*')
        .gte('event_time', new Date().toISOString().split('T')[0])
        .order('event_time', { ascending: true })
        .limit(50);

      if (eventsError) throw eventsError;

      // If no events for today, fetch recent events
      if (!eventsData || eventsData.length === 0) {
        const fallback = await supabase
          .from('economic_events')
          .select('*')
          .gte('event_time', new Date(Date.now() - 7*24*60*60*1000).toISOString())
          .order('event_time', { ascending: false })
          .limit(30);
          
        eventsData = fallback.data || [];
      }

      // Fetch analyses
      const { data: analysesData, error: analysesError } = await supabase
        .from('event_analysis')
        .select('*');

      if (analysesError) throw analysesError;

      setEvents((eventsData as EnhancedEconomicEvent[]) || []);
      setAnalyses((analysesData as EventAnalysis[]) || []);
      
    } catch (error) {
      console.error('Error fetching enhanced data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load enhanced economic calendar",
        variant: "destructive"
      });
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      // First verify real data sources
      console.log('🔍 Verifying real data sources...');
      const verifyResult = await supabase.functions.invoke('verify-real-data');
      console.log('Verification result:', verifyResult);

      // Use enhanced fetch function with improved real data handling
      const result = await supabase.functions.invoke('enhanced-economic-fetch');
      
      if (result.error) {
        throw result.error;
      }

      await fetchEvents();
      
      const stats = result.data;
      const isRealData = stats?.dataProviders?.some((provider: string) => 
        provider.includes('FCS_Live') || provider.includes('Official')
      );
      
      toast({
        title: isRealData ? "✅ Real market data updated" : "⚠️ Using curated data",
        description: `${stats?.eventsProcessed || 0} events processed with ${stats?.analysisGenerated || 0} AI analyses. ${isRealData ? 'Live data sources connected.' : 'Real APIs may be temporarily unavailable.'}`,
        variant: isRealData ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Enhanced refresh failed:', error);
      toast({
        title: "Refresh failed",
        description: "Unable to fetch enhanced data - check your network connection",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Auto-fetch enhanced data
      try {
        await supabase.functions.invoke('enhanced-economic-fetch');
      } catch (error) {
        console.log('Auto-enhanced-fetch failed, loading existing data:', error);
      }
      
      await fetchEvents();
      setLoading(false);
    };
    loadData();
  }, []);

  const getEventAnalysis = (eventId: string) => {
    return analyses.find(a => a.event_id === eventId);
  };

  const getEnhancedImpactStyling = (importance: string, hasAnalysis: boolean) => {
    const baseClasses = 'border transition-all duration-200';
    const glowEffect = hasAnalysis ? 'shadow-lg' : '';
    
    switch (importance) {
      case 'HIGH': 
        return `${baseClasses} ${glowEffect} bg-red-500/20 text-red-300 border-red-400/50 ${hasAnalysis ? 'shadow-red-500/30' : ''}`;
      case 'MEDIUM': 
        return `${baseClasses} ${glowEffect} bg-yellow-500/20 text-yellow-300 border-yellow-400/50 ${hasAnalysis ? 'shadow-yellow-500/30' : ''}`;
      case 'LOW': 
        return `${baseClasses} ${glowEffect} bg-green-500/20 text-green-300 border-green-400/50 ${hasAnalysis ? 'shadow-green-500/30' : ''}`;
      default: 
        return `${baseClasses} bg-zinc-500/20 text-zinc-300 border-zinc-400/50`;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case 'BEARISH': return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'NEUTRAL': return <BarChart3 className="h-4 w-4 text-blue-400" />;
      default: return <BarChart3 className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getVolatilityIndicator = (volatility: string | null) => {
    if (!volatility) return null;
    
    const intensity = volatility === 'HIGH' ? 90 : volatility === 'MEDIUM' ? 60 : 30;
    const color = volatility === 'HIGH' ? 'bg-red-400' : volatility === 'MEDIUM' ? 'bg-yellow-400' : 'bg-green-400';
    
    return (
      <div className="flex items-center gap-2">
        <Gauge className="h-4 w-4 text-zinc-400" />
        <div className="w-16 h-2 bg-zinc-700 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${intensity}%` }} />
        </div>
        <span className="text-xs text-zinc-400">{intensity}%</span>
      </div>
    );
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.event_time);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const thisWeek = addDays(today, 7);

    // Currency filter
    if (selectedCurrency !== 'ALL' && event.currency !== selectedCurrency) {
      return false;
    }

    // Importance filter
    if (selectedImportance !== 'ALL' && event.importance !== selectedImportance) {
      return false;
    }

    // Quality filter - only show events with AI analysis
    if (qualityFilter && !getEventAnalysis(event.id)) {
      return false;
    }

    // Timeframe filter
    switch (selectedTimeframe) {
      case 'TODAY':
        return isToday(eventDate);
      case 'TOMORROW':
        return isTomorrow(eventDate);
      case 'THIS_WEEK':
        return eventDate >= today && eventDate <= thisWeek;
      default:
        return true;
    }
  });

  const displayEvents = filteredEvents.length > 0 ? filteredEvents : 
                      events.slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Brain className="h-8 w-8 text-primary" />
                Elite Economic Calendar
              </h1>
              <p className="text-muted-foreground text-lg">
                Multi-provider data with AI-powered market intelligence
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Data Quality Indicator */}
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Real-Time Data</span>
              </div>
              
              <Button 
                onClick={refreshData}
                disabled={refreshing}
                variant="outline"
                className="bg-secondary border-border hover:bg-secondary/80"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Fetching Live Data...' : 'Refresh Real Data'}
              </Button>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-40 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-border">
                <SelectItem value="ALL">All Currencies</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
                <SelectItem value="CHF">CHF</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedImportance} onValueChange={setSelectedImportance}>
              <SelectTrigger className="w-40 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-border">
                <SelectItem value="ALL">All Impact</SelectItem>
                <SelectItem value="HIGH">High Impact</SelectItem>
                <SelectItem value="MEDIUM">Medium Impact</SelectItem>
                <SelectItem value="LOW">Low Impact</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-40 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-border">
                <SelectItem value="TODAY">Today</SelectItem>
                <SelectItem value="TOMORROW">Tomorrow</SelectItem>
                <SelectItem value="THIS_WEEK">This Week</SelectItem>
                <SelectItem value="ALL">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={qualityFilter ? "default" : "outline"}
              onClick={() => setQualityFilter(!qualityFilter)}
              className="bg-secondary border-border hover:bg-secondary/80"
            >
              <Settings2 className="h-4 w-4 mr-2" />
              AI Enhanced Only
            </Button>
          </div>
        </div>

        {/* Enhanced Events List */}
        <div className="space-y-4">
          {displayEvents.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {events.length === 0 ? 'Loading Enhanced Events...' : 'No Events Found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {events.length === 0 
                    ? 'Fetching multi-provider economic data with AI analysis...' 
                    : 'No events match your current filters.'}
                </p>
                {events.length === 0 && (
                  <Button 
                    onClick={refreshData} 
                    disabled={refreshing}
                    variant="outline"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            displayEvents.map((event) => {
              const analysis = getEventAnalysis(event.id);
              const hasAnalysis = !!analysis;
              
              return (
                <Card key={event.id} className={`bg-card border-border transition-all duration-200 hover:shadow-lg ${hasAnalysis ? 'ring-1 ring-primary/20' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      
                      {/* Event Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getEnhancedImpactStyling(event.importance, hasAnalysis)}>
                            {event.importance}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{event.country}</span>
                          <Badge variant="outline" className="text-xs">
                            {event.currency}
                          </Badge>
                          {hasAnalysis && (
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              <Brain className="h-3 w-3 mr-1" />
                              AI Enhanced
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-semibold text-foreground leading-tight">
                          {event.event_name}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {format(new Date(event.event_time), 'MMM dd, HH:mm')}
                          </div>
                          
                          {event.forecast && (
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-blue-400" />
                              <span>Forecast: <span className="text-foreground font-medium">{event.forecast}</span></span>
                            </div>
                          )}
                          
                          {event.previous && (
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-zinc-400" />
                              <span>Previous: <span className="text-foreground font-medium">{event.previous}</span></span>
                            </div>
                          )}

                          {event.actual && (
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-green-400" />
                              <span>Actual: <span className="text-foreground font-bold">{event.actual}</span></span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Enhanced AI Analysis Panel */}
                      {analysis && (
                        <div className="lg:w-96 bg-secondary/50 rounded-xl p-5 border border-border">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-primary" />
                              <span className="text-sm font-semibold text-primary">AI Market Intelligence</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getSentimentIcon(analysis.market_sentiment)}
                              <span className="text-xs font-medium text-muted-foreground">
                                {analysis.market_sentiment}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-foreground mb-4 leading-relaxed">
                            {analysis.ai_summary}
                          </p>
                          
                          {analysis.volatility_level && (
                            <div className="mb-4">
                              <label className="text-xs text-muted-foreground mb-2 block">Volatility Expectation</label>
                              {getVolatilityIndicator(analysis.volatility_level)}
                            </div>
                          )}
                          
                          {analysis.trade_opportunity && (
                            <div className="bg-primary/10 rounded-lg p-3 mb-4">
                              <div className="flex items-start gap-2">
                                <Target className="h-4 w-4 text-primary mt-0.5" />
                                <div>
                                  <label className="text-xs font-medium text-primary mb-1 block">Trading Opportunity</label>
                                  <p className="text-sm text-foreground">
                                    {analysis.trade_opportunity}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {analysis.affected_pairs && analysis.affected_pairs.length > 0 && (
                            <div>
                              <label className="text-xs text-muted-foreground mb-2 block">Affected Pairs</label>
                              <div className="flex flex-wrap gap-1">
                                {analysis.affected_pairs.map((pair) => (
                                  <Badge key={pair} variant="outline" className="text-xs bg-background/50">
                                    {pair}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {analysis.confidence_score && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Analysis Confidence</span>
                                <span className="font-medium text-foreground">
                                  {Math.round(analysis.confidence_score * 100)}%
                                </span>
                              </div>
                              <Progress 
                                value={analysis.confidence_score * 100} 
                                className="h-2 mt-2"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Stats Summary */}
        {events.length > 0 && (
          <Card className="mt-8 bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Calendar Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{events.length}</div>
                  <div className="text-sm text-muted-foreground">Total Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {events.filter(e => e.importance === 'HIGH').length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Impact</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {analyses.length}
                  </div>
                  <div className="text-sm text-muted-foreground">AI Analyses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {analyses.filter(a => a.confidence_score && a.confidence_score > 0.8).length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Confidence</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};