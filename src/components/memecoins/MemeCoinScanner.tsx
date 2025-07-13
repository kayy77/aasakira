
import React from 'react';
import EnhancedMemeCoinScanner from './EnhancedMemeCoinScanner';

interface MemeCoinScannerProps {
  onFeatureUse?: () => void;
}

export const MemeCoinScanner: React.FC<MemeCoinScannerProps> = ({ onFeatureUse }) => {
  // Track feature usage when component mounts
  React.useEffect(() => {
    onFeatureUse?.();
  }, [onFeatureUse]);

  return <EnhancedMemeCoinScanner />;
};

export default MemeCoinScanner;
