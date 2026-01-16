import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Eye, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ActivityType = 'trade_opened' | 'trade_closed_win' | 'trade_closed_loss' | 'signal_viewed';

interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  pair?: string;
}

interface RecentActivityFeedProps {
  activities?: Activity[];
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'trade_opened':
      return <TrendingUp className="h-4 w-4 text-blue-400" />;
    case 'trade_closed_win':
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    case 'trade_closed_loss':
      return <XCircle className="h-4 w-4 text-red-400" />;
    case 'signal_viewed':
      return <Eye className="h-4 w-4 text-muted-foreground" />;
    default:
      return <TrendingUp className="h-4 w-4" />;
  }
};

const getActivityLabel = (type: ActivityType) => {
  switch (type) {
    case 'trade_opened':
      return 'Trade Opened';
    case 'trade_closed_win':
      return 'Trade Closed (Win)';
    case 'trade_closed_loss':
      return 'Trade Closed (Loss)';
    case 'signal_viewed':
      return 'Signal Viewed';
    default:
      return 'Activity';
  }
};

// Mock data for placeholder
const mockActivities: Activity[] = [
  { id: '1', type: 'trade_opened', description: 'EUR/USD Long', pair: 'EUR/USD', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { id: '2', type: 'signal_viewed', description: 'GBP/JPY signal', pair: 'GBP/JPY', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: '3', type: 'trade_closed_win', description: 'USD/CAD Short +45 pips', pair: 'USD/CAD', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: '4', type: 'trade_opened', description: 'XAU/USD Long', pair: 'XAU/USD', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) },
  { id: '5', type: 'trade_closed_loss', description: 'AUD/USD Long -20 pips', pair: 'AUD/USD', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: '6', type: 'signal_viewed', description: 'NZD/USD signal', pair: 'NZD/USD', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26) },
];

const RecentActivityFeed = ({ activities = mockActivities }: RecentActivityFeedProps) => {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px] px-6 pb-4">
          <div className="space-y-1">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No recent activity
              </p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0"
                >
                  <div className="p-2 rounded-full bg-muted/50">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getActivityLabel(activity.type)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
