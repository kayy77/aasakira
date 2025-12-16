import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface TelegramMessage {
  id: string;
  message_id: number;
  channel_id: number;
  raw_text: string;
  timestamp: string;
  edited: boolean;
}

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
        .limit(5);

      if (fetchError) throw fetchError;
      setMessages(data || []);
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

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (loading && messages.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-900/5 border-purple-500/30">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading latest signals...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-900/5 border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold">Latest Telegram Signals</h3>
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
        <div className="text-sm text-destructive mb-4">
          Failed to load signals. Please try again.
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No signals yet. Join our Telegram for live updates!</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-purple-500/50 hover:border-purple-500"
            onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
          >
            Join Telegram
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-purple-500/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm flex-1 whitespace-pre-wrap line-clamp-3">
                  {msg.raw_text || <span className="text-muted-foreground italic">Media message</span>}
                </p>
                {msg.edited && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    edited
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(msg.timestamp)}</span>
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 border-purple-500/50 hover:border-purple-500 hover:bg-purple-500/10"
            onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
          >
            View All in Telegram
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      )}
    </Card>
  );
};

export default TelegramSignalsFeed;