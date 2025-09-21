import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, TrendingUp, TrendingDown, Minus, AlertTriangle, RefreshCw, Zap, Target, Newspaper, ExternalLink, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, isToday, isTomorrow, addDays, formatDistanceToNow } from 'date-fns';
import AINewsAnalyzer from '@/components/news/AINewsAnalyzer';
import { EnhancedEconomicCalendar } from '@/components/enhanced/EnhancedEconomicCalendar';

interface EconomicEvent {
  id: number;
  event_id: string;
  title: string;
  country: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  date: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  source: string;
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

interface AINews {
  id: number;
  title: string;
  description: string | null;
  source: string | null;
  author: string | null;
  url: string;
  content: string | null;
  published_at: string;
  created_at: string;
}

const News = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [analyses, setAnalyses] = useState<EventAnalysis[]>([]);
  const [aiNews, setAiNews] = useState<AINews[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [selectedImportance, setSelectedImportance] = useState<string>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('TODAY');
  const [activeTab, setActiveTab] = useState('enhanced-events');

  const fetchEvents = async () => {
    try {
      // Fetch news events - try today first
      let { data: eventsData, error: eventsError } = await supabase
        .from('news_events')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;

      // If no events for today, fallback to last 7 days
      if (!eventsData || eventsData.length === 0) {
        console.log('No events for today, fetching last 7 days...');
        const fallback = await supabase
          .from('news_events')
          .select('*')
          .gte('date', new Date(Date.now() - 7*24*60*60*1000).toISOString())
          .order('date', { ascending: true });
          
        eventsData = fallback.data || [];
      }

      // Fetch analyses
      const { data: analysesData, error: analysesError } = await supabase
        .from('event_analysis')
        .select('*');

      if (analysesError) throw analysesError;

      setEvents((eventsData as EconomicEvent[]) || []);
      setAnalyses((analysesData as EventAnalysis[]) || []);
      
      // Fetch AI news
      const { data: newsData, error: newsError } = await supabase
        .from('ai_news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(50);

      if (newsError) {
        console.error('Error fetching AI news:', newsError);
      } else {
        setAiNews((newsData as AINews[]) || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load news and events data",
        variant: "destructive"
      });
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      // Refresh both events and news in parallel
      const [eventsResult, newsResult] = await Promise.allSettled([
        supabase.functions.invoke('fetch-news'),
        supabase.functions.invoke('fetch-ai-news')
      ]);
      
      await fetchEvents();
      toast({
        title: "Data updated",
        description: "News and events refreshed with latest data",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh failed",
        description: "Unable to fetch latest data",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // First fetch fresh data from APIs
      try {
        const [eventsResult, newsResult] = await Promise.allSettled([
          supabase.functions.invoke('fetch-news'),
          supabase.functions.invoke('fetch-ai-news')
        ]);
        console.log('Auto-fetched data - events:', eventsResult, 'news:', newsResult);
      } catch (error) {
        console.log('Auto-fetch failed, loading existing data:', error);
      }
      
      // Then load events from database
      await fetchEvents();
      setLoading(false);
    };
    loadData();
  }, []);

  const getEventAnalysis = (eventId: number) => {
    return analyses.find(a => a.event_id === eventId.toString());
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
    const eventDate = new Date(event.date);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const thisWeek = addDays(today, 7);

    // Currency filter - skip for now since new table doesn't have currency
    // if (selectedCurrency !== 'ALL' && event.currency !== selectedCurrency) {
    //   return false;
    // }

    // Importance filter
    if (selectedImportance !== 'ALL' && event.impact !== selectedImportance) {
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

  // If no filtered events but we have events in database, show upcoming events
  const hasUpcomingEvents = events.length > 0 && filteredEvents.length === 0;
  const displayEvents = filteredEvents.length > 0 ? filteredEvents : 
                       hasUpcomingEvents ? events.slice(0, 10) : [];

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
              onClick={refreshData}
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

        {/* Tabs for Events and AI News */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-zinc-800 border-zinc-600">
            <TabsTrigger value="enhanced-events" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Enhanced Calendar
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Basic Events
            </TabsTrigger>
            <TabsTrigger value="ai-news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              AI Market News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enhanced-events">
            <EnhancedEconomicCalendar />
          </TabsContent>

          <TabsContent value="events">
            {/* Events List */}
            <div className="space-y-4">
              {displayEvents.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-700">
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {events.length === 0 ? 'Loading Economic Events...' : 'No Events Found'}
                    </h3>
                    <p className="text-zinc-400 mb-4">
                      {events.length === 0 
                        ? 'Fetching the latest economic calendar data...' 
                        : hasUpcomingEvents 
                        ? 'No events match your current filters. Showing upcoming events below.'
                        : 'No economic events scheduled for the selected timeframe.'}
                    </p>
                    {events.length === 0 && (
                      <Button 
                        onClick={refreshData} 
                        disabled={refreshing}
                        variant="outline"
                        className="bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700"
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
                  
                  return (
                    <Card key={event.id} className="bg-zinc-900 border-zinc-700">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Event Info */}
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                               <Badge className={`${getImportanceColor(event.impact)} border`}>
                                 {event.impact}
                               </Badge>
                               <span className="text-sm text-zinc-400">{event.country}</span>
                             </div>
                             
                             <h3 className="text-lg font-semibold text-white mb-2">
                               {event.title}
                             </h3>
                             
                             <div className="flex items-center gap-4 text-sm text-zinc-400">
                               <div className="flex items-center gap-1">
                                 <Clock className="h-4 w-4" />
                                 {getTimeLabel(event.date)} at {format(new Date(event.date), 'HH:mm')}
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
          </TabsContent>

          <TabsContent value="ai-news">
            {/* AI News Analysis */}
            <AINewsAnalyzer articles={aiNews} />
            
            {/* AI News List */}
            <div className="space-y-4 mt-6">
              {aiNews.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-700">
                  <CardContent className="p-8 text-center">
                    <Newspaper className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No News Found</h3>
                    <p className="text-zinc-400 mb-4">
                      No AI market news available. Try refreshing to fetch latest articles.
                    </p>
                    <Button 
                      onClick={refreshData}
                      disabled={refreshing}
                      variant="outline"
                      className="bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Fetch News
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                aiNews.map((article) => (
                  <Card key={article.id} className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                              {article.source}
                            </Badge>
                            <span className="text-sm text-zinc-400">
                              {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
                            {article.title}
                          </h3>
                          
                          {article.description && (
                            <p className="text-zinc-300 text-sm mb-3 line-clamp-2">
                              {article.description}
                            </p>
                          )}
                          
                          {article.author && (
                            <p className="text-xs text-zinc-500">
                              By {article.author}
                            </p>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-white"
                          onClick={() => window.open(article.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Stats Summary */}
        {events.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-zinc-900 border-zinc-700">
              <CardContent className="p-4 text-center">
                 <div className="text-2xl font-bold text-white mb-1">
                   {events.filter(e => e.impact === 'HIGH').length}
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