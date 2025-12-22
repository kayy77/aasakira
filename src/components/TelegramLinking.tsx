import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Copy, 
  Check, 
  RefreshCw,
  Unlink,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TelegramLinking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null);
  const [isLinked, setIsLinked] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load current linking status
  useEffect(() => {
    if (user?.id) {
      loadLinkingStatus();
    }
  }, [user?.id]);

  const loadLinkingStatus = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('telegram_id, telegram_username, telegram_link_code, telegram_link_expires')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      if (data.telegram_id) {
        setIsLinked(true);
        setTelegramUsername(data.telegram_username);
      } else if (data.telegram_link_code && data.telegram_link_expires) {
        const expiry = new Date(data.telegram_link_expires);
        if (expiry > new Date()) {
          setLinkCode(data.telegram_link_code);
          setCodeExpiry(expiry);
        }
      }
    }
  };

  const generateLinkCode = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    // Generate a random 6-character code
    const code = `AAS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const { error } = await supabase
      .from('user_profiles')
      .update({
        telegram_link_code: code,
        telegram_link_expires: expiresAt.toISOString()
      })
      .eq('user_id', user.id);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to generate link code. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setLinkCode(code);
    setCodeExpiry(expiresAt);
    
    toast({
      title: "Link Code Generated",
      description: "Send this code to @AasakiraBot on Telegram within 15 minutes.",
    });
  };

  const copyCommand = () => {
    if (linkCode) {
      navigator.clipboard.writeText(`/link ${linkCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Copied!",
        description: "Command copied to clipboard. Paste it in Telegram.",
      });
    }
  };

  const unlinkTelegram = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    const { error } = await supabase
      .from('user_profiles')
      .update({
        telegram_id: null,
        telegram_username: null,
        telegram_link_code: null,
        telegram_link_expires: null
      })
      .eq('user_id', user.id);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to unlink Telegram. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsLinked(false);
    setTelegramUsername(null);
    setLinkCode(null);
    setCodeExpiry(null);
    
    toast({
      title: "Telegram Unlinked",
      description: "Your Telegram account has been disconnected.",
    });
  };

  const isCodeExpired = codeExpiry && codeExpiry < new Date();

  if (!user) return null;

  return (
    <Card className="glass-card hover-glow border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground flex items-center justify-between">
          <span className="flex items-center">
            <MessageCircle className="w-6 h-6 mr-2 text-[#0088cc]" />
            Telegram Connection
          </span>
          {isLinked && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Check className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLinked ? (
          // Already linked state
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-emerald-400 font-medium">
                Connected to @{telegramUsername || 'Telegram User'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Your Telegram is linked. You can now journal, get AI coaching, and receive signals via Telegram.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => window.open('https://t.me/AasakiraBot', '_blank')}
                className="bg-[#0088cc] hover:bg-[#0077b5]"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Open @AasakiraBot
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
              <Button
                onClick={unlinkTelegram}
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                disabled={isLoading}
              >
                <Unlink className="w-4 h-4 mr-2" />
                Unlink
              </Button>
            </div>
          </div>
        ) : linkCode && !isCodeExpired ? (
          // Show generated code
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Send this command to <strong className="text-[#0088cc]">@AasakiraBot</strong> on Telegram:
            </p>
            
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-background/50 border border-border rounded-lg text-lg font-mono text-primary">
                /link {linkCode}
              </code>
              <Button
                onClick={copyCommand}
                variant="outline"
                className="border-primary/30"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Code expires in {Math.max(0, Math.round((codeExpiry!.getTime() - Date.now()) / 60000))} minutes
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => window.open('https://t.me/AasakiraBot', '_blank')}
                className="bg-[#0088cc] hover:bg-[#0077b5]"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Open Telegram
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
              <Button
                onClick={generateLinkCode}
                variant="outline"
                className="border-primary/30"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                New Code
              </Button>
            </div>
          </div>
        ) : (
          // Initial state - prompt to link
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Link your Telegram account to unlock AI coaching, journaling via chat, and personalized signals directly in Telegram.
            </p>
            
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-emerald-400" />
                Journal trades via Telegram messages
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-emerald-400" />
                AI mentor with full memory of your history
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-emerald-400" />
                Weekly performance summaries
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-emerald-400" />
                Personalized trade alerts
              </li>
            </ul>
            
            <Button
              onClick={generateLinkCode}
              className="w-full bg-gradient-to-r from-[#0088cc] to-primary hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4 mr-2" />
              )}
              Link Telegram Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TelegramLinking;
