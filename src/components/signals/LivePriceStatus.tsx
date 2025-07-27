
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { enhancedPriceService } from '@/services/enhancedPriceService';
import { Wifi, WifiOff } from 'lucide-react';

interface LivePriceStatusProps {
  className?: string;
}

const LivePriceStatus: React.FC<LivePriceStatusProps> = ({ className }) => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    const checkConnection = () => {
      const status = enhancedPriceService.getConnectionStatus();
      setConnectionStatus(status);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = connectionStatus === 'connected';

  return (
    <Badge 
      variant={isConnected ? 'default' : 'destructive'}
      className={`${className} flex items-center gap-1`}
    >
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          Live Prices
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          Disconnected
        </>
      )}
    </Badge>
  );
};

export default LivePriceStatus;
