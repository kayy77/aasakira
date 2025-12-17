import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';

interface TelegramMessage {
  id: string;
  message_id: number;
  channel_id: number;
  raw_text: string | null;
  timestamp: string;
  edited: boolean;
}

interface ParsedTrade {
  symbol: string;
  direction: 'BUY' | 'SELL';
  entry: string | null;
  stopLoss: string | null;
  takeProfits: string[];
}

// Check if message looks like a trade setup
const isTradeMessage = (text: string | null): boolean => {
  if (!text) return false;
  const upperText = text.toUpperCase();
  
  // Must have a symbol pattern
  const hasSymbol = /\b(XAU|EUR|GBP|USD|JPY|AUD|NZD|CAD|CHF|BTC|ETH|NAS|US30|SPX)/i.test(text);
  
  // Must have BUY or SELL
  const hasDirection = /\b(BUY|SELL|LONG|SHORT)\b/i.test(text);
  
  // Must have at least one price number
  const hasPrice = /\d{1,5}\.?\d{0,5}/g.test(text);
  
  return hasSymbol && hasDirection && hasPrice;
};

// Parse trade details from message
const parseTrade = (text: string | null): ParsedTrade | null => {
  if (!text) return null;
  
  // Extract symbol
  const symbolMatch = text.match(/\b(XAUUSD|XAU\/USD|EURUSD|EUR\/USD|GBPUSD|GBP\/USD|USDJPY|USD\/JPY|BTCUSD|BTC\/USD|ETHUSD|ETH\/USD|NAS100|US30|AUDUSD|AUD\/USD|NZDUSD|NZD\/USD|USDCAD|USD\/CAD|USDCHF|USD\/CHF|GBPJPY|GBP\/JPY|EURJPY|EUR\/JPY)/i);
  if (!symbolMatch) return null;
  
  // Normalize symbol (remove slash)
  const symbol = symbolMatch[1].replace('/', '').toUpperCase();
  
  // Extract direction
  const directionMatch = text.match(/\b(BUY|SELL|LONG|SHORT)\b/i);
  if (!directionMatch) return null;
  const direction = ['BUY', 'LONG'].includes(directionMatch[1].toUpperCase()) ? 'BUY' : 'SELL';
  
  // Extract prices
  const prices = text.match(/\d{1,5}\.?\d{0,5}/g) || [];
  
  // Try to identify entry, SL, TP from context
  let entry: string | null = null;
  let stopLoss: string | null = null;
  const takeProfits: string[] = [];
  
  // Look for labeled prices
  const entryMatch = text.match(/(?:entry|price|@)\s*:?\s*(\d{1,5}\.?\d{0,5})/i);
  const slMatch = text.match(/(?:sl|stop\s*loss|stoploss)\s*:?\s*(\d{1,5}\.?\d{0,5})/i);
  const tpMatches = text.matchAll(/(?:tp\d?|take\s*profit\s*\d?)\s*:?\s*(\d{1,5}\.?\d{0,5})/gi);
  
  if (entryMatch) entry = entryMatch[1];
  if (slMatch) stopLoss = slMatch[1];
  for (const match of tpMatches) {
    takeProfits.push(match[1]);
  }
  
  // If no labeled entry, use first price
  if (!entry && prices.length > 0) {
    entry = prices[0];
  }
  
  return { symbol, direction, entry, stopLoss, takeProfits };
};

const TradeCard = ({ message }: { message: TelegramMessage }) => {
  const trade = parseTrade(message.raw_text);
  
  if (!trade) return null;
  
  return (
    <Card className="p-4 bg-card border-border hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{trade.symbol}</span>
          <Badge 
            variant="outline" 
            className={trade.direction === 'BUY' 
              ? 'text-green-400 border-green-500/50 bg-green-500/10' 
              : 'text-red-400 border-red-500/50 bg-red-500/10'
            }
          >
            {trade.direction}
          </Badge>
        </div>
        {message.edited && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            edited
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <Clock className="w-3 h-3" />
        <span>{format(new Date(message.timestamp), 'dd MMM yyyy HH:mm')} UTC</span>
      </div>
      
      <div className="space-y-1 text-sm">
        {trade.entry && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entry Price:</span>
            <span className="font-mono">{trade.entry}</span>
          </div>
        )}
        {trade.takeProfits.map((tp, i) => (
          <div key={i} className="flex justify-between">
            <span className="text-muted-foreground">TP{i + 1}:</span>
            <span className="font-mono text-green-400">{tp}</span>
          </div>
        ))}
        {trade.stopLoss && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">SL:</span>
            <span className="font-mono text-red-400">{trade.stopLoss}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

const TelegramSignalsFeed = () => {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('telegram_messages')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      
      // Filter to trade-like messages only
      const tradeMessages = (data || []).filter(msg => isTradeMessage(msg.raw_text));
      setMessages(tradeMessages);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('telegram_messages_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'telegram_messages' },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading && messages.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading trades...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Live Trade Signals</h3>
          <Badge variant="outline" className="text-green-400 border-green-500/30 text-xs">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
            LIVE
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchMessages}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive">
          Failed to load signals. Please try again.
        </div>
      )}

      {messages.length === 0 ? (
        <Card className="p-8 bg-card border-border">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-4">No trade signals yet. Join our Telegram for live updates!</p>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/50 hover:border-primary"
              onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
            >
              Join Telegram
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {messages.map((msg) => (
            <TradeCard key={msg.id} message={msg} />
          ))}
        </div>
      )}
      
      <Button
        variant="outline"
        size="sm"
        className="w-full border-primary/50 hover:border-primary hover:bg-primary/10"
        onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
      >
        View All in Telegram
        <ExternalLink className="w-3 h-3 ml-1" />
      </Button>
    </div>
  );
};

export default TelegramSignalsFeed;
