
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { enhancedPriceService } from '@/services/enhancedPriceService';
import { Wifi, WifiOff, Clock, Zap } from 'lucide-react';

interface LivePriceStatusProps {
  symbol: string;
  price: number;
  source: string;
  timestamp?: number;
  dataAge?: number;
  quality?: 'real' | 'delayed' | 'stale';
}

const LivePriceStatus: React.FC<LivePriceStatusProps> = ({
  symbol,
  price,
  source,
  timestamp,
  dataAge = 0,
  quality = 'real'
}) => {
  const [connectionStatus, setConnectionStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const checkConnection = () => {
      const status = enhancedPriceService.getConnectionStatus();
      setConnectionStatus(status);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'real': return 'bg-green-500 hover:bg-green-600';
      case 'delayed': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'stale': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'real': return <Zap className="w-3 h-3" />;
      case 'delayed': return <Clock className="w-3 h-3" />;
      case 'stale': return <WifiOff className="w-3 h-3" />;
      default: return <Wifi className="w-3 h-3" />;
    }
  };

  const formatDataAge = (age: number) => {
    if (age < 1000) return 'live';
    if (age < 60000) return `${Math.floor(age / 1000)}s ago`;
    return `${Math.floor(age / 60000)}m ago`;
  };

  const isWebSocketSource = source.includes('WebSocket');
  const isConnected = isWebSocketSource && (connectionStatus.deriv || connectionStatus.binance);

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        <span className="text-gray-400">Live:</span>
        <span className="font-mono text-white">{price}</span>
      </div>
      
      <Badge 
        variant="secondary" 
        className={`${getQualityColor(quality)} text-white border-0 text-xs px-2 py-1`}
      >
        <div className="flex items-center gap-1">
          {getQualityIcon(quality)}
          <span>{quality.toUpperCase()}</span>
        </div>
      </Badge>

      <div className="flex items-center gap-1 text-gray-400">
        <span>{source}</span>
        {dataAge > 0 && (
          <>
            <span>·</span>
            <span>{formatDataAge(dataAge)}</span>
          </>
        )}
      </div>

      {isWebSocketSource && (
        <div className="flex items-center gap-1">
          {isConnected ? (
            <div className="flex items-center gap-1 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>LIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>DISCONNECTED</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LivePriceStatus;
