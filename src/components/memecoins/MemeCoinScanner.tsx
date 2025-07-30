
import React from 'react';
import EliteMemeCoinScanner from './EliteMemeCoinScanner';

interface MemeCoinScannerProps {
  onFeatureUse?: () => void;
}

export const MemeCoinScanner: React.FC<MemeCoinScannerProps> = ({ onFeatureUse }) => {
  // Track feature usage when component mounts
  React.useEffect(() => {
    onFeatureUse?.();
  }, [onFeatureUse]);

  return <EliteMemeCoinScanner />;
};

export default MemeCoinScanner;
