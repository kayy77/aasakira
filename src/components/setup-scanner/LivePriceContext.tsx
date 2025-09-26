import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertCircle,
  DollarSign,
  Clock,
  BarChart3
} from 'lucide-react';
import type { EnhancedAnalysisData } from '@/services/enhancedSetupAnalyzer';

interface LivePriceContextProps {
  analysisData: EnhancedAnalysisData;
  userEntry: number;
  direction: 'BUY' | 'SELL';
}

const LivePriceContext: React.FC<LivePriceContextProps> = ({ 
  analysisData, 
  userEntry, 
  direction 
}) => {
  const { 
    currentPrice, 
    spread, 
    priceAge, 
    priceSource, 
    liveRiskReward, 
    priceDeviation,
    macroContext,
    sentiment 
  } = analysisData;

  const isStalePrice = priceAge > 300; // 5 minutes
  const isSignificantDeviation = priceDeviation > 10; // 10+ pips difference

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600';
      case 'bearish': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="h-4 w-4" />;
      case 'bearish': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Live Price Status */}
      <Card className={`${isStalePrice ? 'border-yellow-500' : 'border-green-500'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Live Market Context
            </span>
            <Badge variant={isStalePrice ? 'destructive' : 'default'}>
              {priceSource}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Price vs User Entry */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Live Price:</span>
              <p className="font-bold text-lg">{currentPrice.toFixed(5)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Your Entry:</span>
              <p className="font-bold text-lg">{userEntry.toFixed(5)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Deviation:</span>
              <p className={`font-bold ${isSignificantDeviation ? 'text-red-600' : 'text-green-600'}`}>
                {priceDeviation.toFixed(1)} pips
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Live R:R:</span>
              <p className={`font-bold ${liveRiskReward >= 1.5 ? 'text-green-600' : 'text-red-600'}`}>
                {liveRiskReward.toFixed(2)}:1
              </p>
            </div>
          </div>

          {/* Price Age Warning */}
          {isStalePrice && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Price data is {Math.floor(priceAge / 60)} minutes old - may not reflect current market
              </span>
            </div>
          )}

          {/* Significant Deviation Warning */}
          {isSignificantDeviation && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">
                Live price has moved {priceDeviation.toFixed(1)} pips from your entry - consider adjusting levels
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Sentiment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSentimentIcon(sentiment.overall)}
              <span className={`font-medium ${getSentimentColor(sentiment.overall)}`}>
                {sentiment.overall.toUpperCase()}
              </span>
              <Badge variant="outline">
                {sentiment.score > 0 ? '+' : ''}{sentiment.score}
              </Badge>
            </div>
            {sentiment.conflictingSignals && (
              <Badge variant="destructive">
                Conflicting Signals
              </Badge>
            )}
          </div>

          {/* Sentiment Sources */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground">Reddit</p>
              <p className={`font-bold ${sentiment.sources.reddit > 0 ? 'text-green-600' : sentiment.sources.reddit < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {sentiment.sources.reddit > 0 ? '+' : ''}{sentiment.sources.reddit}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Social</p>
              <p className={`font-bold ${sentiment.sources.twitter > 0 ? 'text-green-600' : sentiment.sources.twitter < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {sentiment.sources.twitter > 0 ? '+' : ''}{sentiment.sources.twitter}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Retail</p>
              <p className={`font-bold ${sentiment.sources.retail > 0 ? 'text-green-600' : sentiment.sources.retail < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {sentiment.sources.retail > 0 ? '+' : ''}{sentiment.sources.retail}
              </p>
            </div>
          </div>

          {/* Sentiment vs Setup Direction Check */}
          {((direction === 'BUY' && sentiment.overall === 'bearish') || 
            (direction === 'SELL' && sentiment.overall === 'bullish')) && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                Your {direction} setup conflicts with {sentiment.overall} market sentiment
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Macro Economic Context */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Economic Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Economic Trend */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Economic Trend:</span>
            <Badge variant={macroContext.economicTrend === 'bullish' ? 'default' : macroContext.economicTrend === 'bearish' ? 'destructive' : 'secondary'}>
              {macroContext.economicTrend.toUpperCase()}
            </Badge>
          </div>

          {/* Upcoming Events */}
          {macroContext.upcomingEvents.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Upcoming Events:</p>
              {macroContext.upcomingEvents.slice(0, 3).map((event, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.event}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(event.timeToEvent / 3600)}h {Math.floor((event.timeToEvent % 3600) / 60)}m
                    </p>
                  </div>
                  <Badge variant={event.impact === 'High' ? 'destructive' : event.impact === 'Medium' ? 'default' : 'secondary'}>
                    {event.impact}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Interest Rates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(macroContext.interestRates).map(([currency, rate]) => (
              <div key={currency} className="text-center p-2 bg-muted rounded-lg">
                <p className="text-muted-foreground">{currency} Rate</p>
                <p className="font-bold">{rate.toFixed(2)}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LivePriceContext;