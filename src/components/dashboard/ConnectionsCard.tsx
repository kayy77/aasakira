import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Link2, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  BarChart3,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Connection {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  details?: string;
  action?: () => void;
  actionLabel?: string;
}

interface ConnectionsCardProps {
  ctraderConnected: boolean;
  telegramLinked: boolean;
  onConnectCTrader?: () => void;
  onLinkTelegram?: () => void;
}

const ConnectionsCard: React.FC<ConnectionsCardProps> = ({
  ctraderConnected,
  telegramLinked,
  onConnectCTrader,
  onLinkTelegram
}) => {
  const connections: Connection[] = [
    {
      id: 'ctrader',
      name: 'cTrader Account',
      icon: <BarChart3 className="h-4 w-4" />,
      connected: ctraderConnected,
      details: ctraderConnected ? 'Syncing trades' : 'Connect for verified stats',
      action: onConnectCTrader,
      actionLabel: 'Connect'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: <MessageCircle className="h-4 w-4" />,
      connected: telegramLinked,
      details: telegramLinked ? 'Receiving signals' : 'Get instant alerts',
      action: onLinkTelegram,
      actionLabel: 'Link'
    },
  ];

  const connectedCount = connections.filter(c => c.connected).length;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Link2 className="h-4 w-4 text-primary" />
            Connections
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {connectedCount}/{connections.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {connections.map((conn) => (
          <div
            key={conn.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border transition-colors',
              conn.connected 
                ? 'border-green-500/30 bg-green-500/5' 
                : 'border-border/50 bg-muted/20 hover:bg-muted/40'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                conn.connected ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
              )}>
                {conn.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{conn.name}</span>
                  {conn.connected ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{conn.details}</p>
              </div>
            </div>

            {!conn.connected && conn.action && (
              <Button
                variant="ghost"
                size="sm"
                onClick={conn.action}
                className="h-7 text-xs"
              >
                {conn.actionLabel}
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}

            {conn.connected && (
              <Badge className="bg-green-500/20 text-green-500 border-green-500/50 text-xs">
                Active
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ConnectionsCard;
