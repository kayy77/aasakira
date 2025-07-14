
import React from 'react';
import ImprovedMemeCoinScanner from './ImprovedMemeCoinScanner';

interface MemeCoinScannerProps {
  onFeatureUse?: () => void;
}

export const MemeCoinScanner: React.FC<MemeCoinScannerProps> = ({ onFeatureUse }) => {
  // Track feature usage when component mounts
  React.useEffect(() => {
    onFeatureUse?.();
  }, [onFeatureUse]);

  return <ImprovedMemeCoinScanner />;
};

export default MemeCoinScanner;
