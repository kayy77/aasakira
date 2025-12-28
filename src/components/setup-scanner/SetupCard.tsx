import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getGradeColor, 
  getGradeBg, 
  calculateTimeDecay,
  type ScannerResult,
  type SetupGrade 
} from '@/services/setupScannerEngine';

interface SetupCardProps {
  setup: ScannerResult;
  onClick: () => void;
  isSelected?: boolean;
}

const SetupCard: React.FC<SetupCardProps> = ({ setup, onClick, isSelected }) => {
  const timeDecay = calculateTimeDecay(setup.detectedAt);
  const passedLayers = setup.layers.filter(l => l.passed).length;
  const hasHighWarning = setup.warnings.some(w => w.severity === 'high');
  
  // Fade based on time decay
  const cardOpacity = timeDecay >= 80 ? 'opacity-100' : timeDecay >= 50 ? 'opacity-80' : 'opacity-60';
  
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 border-border/50 hover:border-primary/50 hover:shadow-lg',
        isSelected && 'border-primary ring-1 ring-primary/20',
        cardOpacity
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Direction Icon */}
            {setup.direction === 'BUY' ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            
            {/* Pair */}
            <span className="font-bold text-foreground">{setup.pair}</span>
            
            {/* Direction Badge */}
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs',
                setup.direction === 'BUY' 
                  ? 'border-green-500/50 text-green-500' 
                  : 'border-red-500/50 text-red-500'
              )}
            >
              {setup.direction}
            </Badge>
          </div>
          
          {/* Grade Badge */}
          <div className={cn(
            'px-2 py-1 rounded-md border font-bold text-sm',
            getGradeBg(setup.grade)
          )}>
            <span className={getGradeColor(setup.grade)}>{setup.grade}</span>
          </div>
        </div>
        
        {/* Confidence & Layers */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-yellow-500" />
            <span className="text-sm font-medium">{setup.confidenceScore}%</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            <span className="text-sm text-muted-foreground">
              {passedLayers}/{setup.layers.length} layers
            </span>
          </div>
          
          {hasHighWarning && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs text-orange-500">Warning</span>
            </div>
          )}
        </div>
        
        {/* Key Reason */}
        <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
          {setup.keyReason}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(setup.detectedAt)}</span>
          </div>
          
          {/* Time Decay Indicator */}
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full rounded-full transition-all',
                  timeDecay >= 70 ? 'bg-green-500' : timeDecay >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${timeDecay}%` }}
              />
            </div>
            <span className="text-muted-foreground">{timeDecay}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export default SetupCard;
