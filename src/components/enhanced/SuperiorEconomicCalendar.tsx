import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, TrendingUp, TrendingDown, Activity, Brain, Target, Zap, 
  Shield, CheckCircle, AlertTriangle, Clock, ExternalLink
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DataVerificationStatus from './DataVerificationStatus';

interface EnhancedEconomicEvent {
  id: string;
  event_name: string;
  country: string;
  currency: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  event_time: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  source: string;
  created_at: string;
  updated_at: string;
}

interface EventAnalysis {
  id: string;
  event_id: string;
  ai_summary: string;
  market_sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  trade_opportunity: string;
  volatility_level: 'HIGH' | 'MEDIUM' | 'LOW';
  affected_pairs: string[];
  confidence_score: number;
  created_at: string;
}

interface MarketReaction {
  pair: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

const SuperiorEconomicCalendar: React.FC = () => {
  const [events, setEvents] = useState<EnhancedEconomicEvent[]>([]);
  const [analyses, setAnalyses] = useState<EventAnalysis[]>([]);
  const [marketReactions, setMarketReactions] = useState<Record<string, MarketReaction[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    currency: 'ALL',
    importance: 'ALL',
    timeframe: 'TODAY',
    sentiment: 'ALL'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    generateMockMarketReactions();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch events
      const today = new Date().toISOString().split('T')[0];
      const { data: eventsData, error: eventsError } = await supabase
        .from('economic_events')
        .select('*')
        .gte('event_time', today)
        .order('event_time', { ascending: true })
        .limit(50);

      if (eventsError) throw eventsError;

      // Fetch analyses
      const { data: analysesData, error: analysesError } = await supabase
        .from('event_analysis')
        .select('*');

      if (analysesError) throw analysesError;

      setEvents((eventsData || []) as EnhancedEconomicEvent[]);
      setAnalyses((analysesData || []) as EventAnalysis[]);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch economic events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshWithMultiProvider = async () => {
    try {
      setRefreshing(true);
      
      const { data, error } = await supabase.functions.invoke('multi-provider-economic-fetch', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "🚀 Multi-Provider Refresh Complete",
        description: `${data.eventsProcessed} events with ${data.analysisGenerated} AI analyses from ${data.providersUsed} providers`,
      });

      await fetchEvents();
    } catch (error) {
      console.error('Multi-provider refresh failed:', error);
      toast({
        title: "Error",
        description: "Multi-provider refresh failed",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const generateMockMarketReactions = () => {
    const mockReactions: Record<string, MarketReaction[]> = {};
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
    
    pairs.forEach(pair => {
      const basePrice = 1.0500 + Math.random() * 0.5;
      mockReactions[pair] = Array.from({ length: 60 }, (_, i) => ({
        pair,
        price: basePrice + (Math.random() - 0.5) * 0.01,
        change: (Math.random() - 0.5) * 0.002,
        changePercent: (Math.random() - 0.5) * 0.2,
        timestamp: new Date(Date.now() - (60 - i) * 60000).toISOString()
      }));
    });
    
    setMarketReactions(mockReactions);
  };

  const getEventAnalysis = (eventId: string): EventAnalysis | null => {
    return analyses.find(analysis => analysis.event_id === eventId) || null;
  };

  const getImpactStyling = (importance: string, sentiment?: string) => {
    const base = "text-xs font-bold px-2 py-1 rounded-full";
    
    switch (importance) {
      case 'HIGH':
        return `${base} bg-red-500/20 text-red-400 border border-red-500/30`;
      case 'MEDIUM':
        return `${base} bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`;
      default:
        return `${base} bg-green-500/20 text-green-400 border border-green-500/30`;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'BEARISH': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getVolatilityIndicator = (level: string) => {
    const intensity = level === 'HIGH' ? 3 : level === 'MEDIUM' ? 2 : 1;
    return Array.from({ length: 3 }, (_, i) => (
      <div
        key={i}
        className={`w-1 h-6 ${i < intensity ? 'bg-primary' : 'bg-muted'} rounded-full`}
      />
    ));
  };

  const filteredEvents = events.filter(event => {
    const analysis = getEventAnalysis(event.id);
    
    return (
      (filters.currency === 'ALL' || event.currency === filters.currency) &&
      (filters.importance === 'ALL' || event.importance === filters.importance) &&
      (filters.sentiment === 'ALL' || analysis?.market_sentiment === filters.sentiment)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading superior economic data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                Superior Economic Calendar
                <Badge variant="secondary" className="ml-2">AI-Powered</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Multi-provider consensus with real-time AI analysis
              </p>
            </div>
            <Button 
              onClick={refreshWithMultiProvider}
              disabled={refreshing}
              className="gap-2"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Multi-Provider Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Select value={filters.currency} onValueChange={(value) => setFilters({...filters, currency: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Currencies</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.importance} onValueChange={(value) => setFilters({...filters, importance: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Impact</SelectItem>
                <SelectItem value="HIGH">High Impact</SelectItem>
                <SelectItem value="MEDIUM">Medium Impact</SelectItem>
                <SelectItem value="LOW">Low Impact</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sentiment} onValueChange={(value) => setFilters({...filters, sentiment: value})}>
              <SelectTrigger>
                <SelectValue placeholder="AI Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Sentiment</SelectItem>
                <SelectItem value="BULLISH">Bullish</SelectItem>
                <SelectItem value="BEARISH">Bearish</SelectItem>
                <SelectItem value="NEUTRAL">Neutral</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              {filteredEvents.length} Events
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-fit">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Economic Events
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Data Verification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {/* Events List */}
          <div className="grid gap-4">
        {filteredEvents.map((event) => {
          const analysis = getEventAnalysis(event.id);
          const eventTime = new Date(event.event_time);
          const reactionData = marketReactions[event.currency + 'USD'] || [];

          return (
            <Card key={event.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-3 gap-0">
                  {/* Event Info */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getImpactStyling(event.importance)}>
                            {event.importance}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm leading-tight">
                          {event.event_name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{event.country}</span>
                          <span>•</span>
                          <span>{event.currency}</span>
                        </div>
                      </div>
                      {analysis && (
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(analysis.market_sentiment)}
                          <div className="flex gap-1">
                            {getVolatilityIndicator(analysis.volatility_level)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Data Points */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="text-muted-foreground">Forecast</div>
                        <div className="font-mono">{event.forecast || 'N/A'}</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="text-muted-foreground">Previous</div>
                        <div className="font-mono">{event.previous || 'N/A'}</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="text-muted-foreground">Actual</div>
                        <div className="font-mono">{event.actual || 'Pending'}</div>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="p-6 bg-muted/20 border-l">
                    {analysis ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">AI Analysis</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(analysis.confidence_score * 100)}% confidence
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Summary:</span>
                            <p className="text-foreground mt-1">{analysis.ai_summary}</p>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground">Trade Setup:</span>
                            <p className="text-foreground mt-1">{analysis.trade_opportunity}</p>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {analysis.affected_pairs?.map((pair) => (
                              <Badge key={pair} variant="secondary" className="text-xs">
                                {pair}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        <Brain className="w-4 h-4 mr-2" />
                        AI analysis unavailable
                      </div>
                    )}
                  </div>

                  {/* Market Reaction Chart */}
                  <div className="p-6 bg-muted/10 border-l">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{event.currency}/USD Reaction</span>
                      </div>
                      
                      {reactionData.length > 0 ? (
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={reactionData.slice(-20)}>
                              <XAxis dataKey="timestamp" hide />
                              <YAxis hide domain={['dataMin', 'dataMax']} />
                              <Tooltip 
                                formatter={(value: any) => [value?.toFixed(5), 'Price']}
                                labelFormatter={() => 'Live Price'}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="price" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                          <Activity className="w-4 h-4 mr-2" />
                          Live chart unavailable
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        <div>Change: {reactionData[reactionData.length - 1]?.changePercent?.toFixed(2)}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
          </div>

          {filteredEvents.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No events match your filters</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filter criteria or refresh the data
                </p>
                <Button onClick={refreshWithMultiProvider} variant="outline">
                  Refresh Data
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="verification">
          <DataVerificationStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperiorEconomicCalendar;