import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, TrendingUp, TrendingDown, Minus, AlertTriangle, RefreshCw, Zap, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, isToday, isTomorrow, addDays } from 'date-fns';

interface EconomicEvent {
  id: string;
  event_name: string;
  country: string;
  currency: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  event_time: string;
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string | null;
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

const News = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [analyses, setAnalyses] = useState<EventAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [selectedImportance, setSelectedImportance] = useState<string>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('TODAY');

  const fetchEvents = async () => {
    try {
      // Fetch economic events
      const { data: eventsData, error: eventsError } = await supabase
        .from('economic_events')
        .select('*')
        .gte('event_time', new Date().toISOString())
        .order('event_time', { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch analyses
      const { data: analysesData, error: analysesError } = await supabase
        .from('event_analysis')
        .select('*');

      if (analysesError) throw analysesError;

      setEvents((eventsData as EconomicEvent[]) || []);
      setAnalyses((analysesData as EventAnalysis[]) || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error loading events",
        description: "Failed to load economic calendar data",
        variant: "destructive"
      });
    }
  };

  const refreshEvents = async () => {
    setRefreshing(true);
    try {
      // Call edge function to fetch fresh events
      const { error } = await supabase.functions.invoke('fetch-economic-events');
      if (error) throw error;
      
      await fetchEvents();
      toast({
        title: "Events updated",
        description: "Economic calendar refreshed with latest data",
      });
    } catch (error) {
      console.error('Error refreshing events:', error);
      toast({
        title: "Refresh failed",
        description: "Unable to fetch latest events",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchEvents();
      setLoading(false);
    };
    loadData();
  }, []);

  const getEventAnalysis = (eventId: string) => {
    return analyses.find(a => a.event_id === eventId);
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'BEARISH': return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'NEUTRAL': return <Minus className="h-4 w-4 text-yellow-400" />;
      default: return <Minus className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getVolatilityColor = (volatility: string | null) => {
    switch (volatility) {
      case 'HIGH': return 'text-red-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'LOW': return 'text-green-400';
      default: return 'text-zinc-400';
    }
  };

  const getTimeLabel = (eventTime: string) => {
    const date = new Date(eventTime);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🗞️ AI Economic Calendar
              </h1>
              <p className="text-zinc-400">
                AI-powered market events analysis with trading insights
              </p>
            </div>
            <Button 
              onClick={refreshEvents}
              disabled={refreshing}
              variant="outline"
              className="bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-32 bg-zinc-800 border-zinc-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                <SelectItem value="ALL">All Currencies</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedImportance} onValueChange={setSelectedImportance}>
              <SelectTrigger className="w-36 bg-zinc-800 border-zinc-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                <SelectItem value="ALL">All Impact</SelectItem>
                <SelectItem value="HIGH">High Impact</SelectItem>
                <SelectItem value="MEDIUM">Medium Impact</SelectItem>
                <SelectItem value="LOW">Low Impact</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-36 bg-zinc-800 border-zinc-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                <SelectItem value="TODAY">Today</SelectItem>
                <SelectItem value="TOMORROW">Tomorrow</SelectItem>
                <SelectItem value="THIS_WEEK">This Week</SelectItem>
                <SelectItem value="ALL">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-700">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Events Found</h3>
                <p className="text-zinc-400">
                  No economic events match your current filters
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event) => {
              const analysis = getEventAnalysis(event.id);
              
              return (
                <Card key={event.id} className="bg-zinc-900 border-zinc-700">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Event Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`${getImportanceColor(event.importance)} border`}>
                            {event.importance}
                          </Badge>
                          <Badge variant="outline" className="text-primary border-primary/30">
                            {event.currency}
                          </Badge>
                          <span className="text-sm text-zinc-400">{event.country}</span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {event.event_name}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {getTimeLabel(event.event_time)} at {format(new Date(event.event_time), 'HH:mm')}
                          </div>
                          
                          {event.forecast && (
                            <div>
                              Forecast: <span className="text-white">{event.forecast}</span>
                            </div>
                          )}
                          
                          {event.previous && (
                            <div>
                              Previous: <span className="text-white">{event.previous}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* AI Analysis */}
                      {analysis && (
                        <div className="lg:w-96 bg-zinc-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm font-medium text-yellow-400">AI Analysis</span>
                            {getSentimentIcon(analysis.market_sentiment)}
                            <span className={`text-sm font-medium ${getVolatilityColor(analysis.volatility_level)}`}>
                              {analysis.volatility_level} Volatility
                            </span>
                          </div>
                          
                          <p className="text-sm text-zinc-300 mb-3">
                            {analysis.ai_summary}
                          </p>
                          
                          {analysis.trade_opportunity && (
                            <div className="flex items-start gap-2">
                              <Target className="h-4 w-4 text-blue-400 mt-0.5" />
                              <p className="text-sm text-blue-300">
                                {analysis.trade_opportunity}
                              </p>
                            </div>
                          )}
                          
                          {analysis.affected_pairs && analysis.affected_pairs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {analysis.affected_pairs.map((pair) => (
                                <Badge key={pair} variant="outline" className="text-xs text-blue-400 border-blue-400/30">
                                  {pair}
                                </Badge>
                              ))}
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
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-zinc-900 border-zinc-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {events.filter(e => e.importance === 'HIGH').length}
                </div>
                <div className="text-sm text-red-400">High Impact Events</div>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900 border-zinc-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {analyses.filter(a => a.market_sentiment === 'BULLISH').length}
                </div>
                <div className="text-sm text-green-400">Bullish Signals</div>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900 border-zinc-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {Math.round(analyses.reduce((acc, a) => acc + (a.confidence_score || 0), 0) / analyses.length * 100)}%
                </div>
                <div className="text-sm text-blue-400">Avg. Confidence</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;