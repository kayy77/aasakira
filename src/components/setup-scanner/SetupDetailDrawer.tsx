import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getGradeColor, 
  getGradeBg,
  type ScannerResult 
} from '@/services/setupScannerEngine';

interface SetupDetailDrawerProps {
  setup: ScannerResult | null;
  onClose: () => void;
  onSaveToJournal: (setup: ScannerResult) => void;
}

const SetupDetailDrawer: React.FC<SetupDetailDrawerProps> = ({ 
  setup, 
  onClose,
  onSaveToJournal 
}) => {
  if (!setup) return null;
  
  const passedLayers = setup.layers.filter(l => l.passed).length;
  
  return (
    <Card className="h-full border-l-0 rounded-l-none bg-card/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {setup.direction === 'BUY' ? (
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-red-500/20">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{setup.pair}</CardTitle>
              <p className="text-sm text-muted-foreground">{setup.direction} Setup</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              'px-3 py-1.5 rounded-lg border font-bold',
              getGradeBg(setup.grade)
            )}>
              <span className={getGradeColor(setup.grade)}>{setup.grade}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1">
        <CardContent className="p-4 space-y-6">
          {/* Confidence Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Confidence
              </span>
              <span className="font-bold">{setup.confidenceScore}%</span>
            </div>
            <Progress value={setup.confidenceScore} className="h-2" />
          </div>
          
          {/* Confirmation Layers */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Confirmation Layers ({passedLayers}/{setup.layers.length})
            </h4>
            <div className="space-y-2">
              {setup.layers.map((layer, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    'p-3 rounded-lg border transition-colors',
                    layer.passed 
                      ? 'bg-green-500/5 border-green-500/30' 
                      : 'bg-red-500/5 border-red-500/30'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {layer.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium text-sm">{layer.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {layer.score}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">{layer.reason}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Trade Plan */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Trade Plan
            </h4>
            
            {/* Entry Zone */}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Entry Zone</span>
                <span className="text-xs font-medium text-blue-500">LIMIT</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span>{setup.tradePlan.entryZone.min.toFixed(5)}</span>
                <span className="text-muted-foreground">→</span>
                <span>{setup.tradePlan.entryZone.max.toFixed(5)}</span>
              </div>
            </div>
            
            {/* SL Zone */}
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Stop Loss Zone</span>
                <Shield className="h-3.5 w-3.5 text-red-500" />
              </div>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span>{setup.tradePlan.stopLossZone.min.toFixed(5)}</span>
                <span className="text-muted-foreground">→</span>
                <span>{setup.tradePlan.stopLossZone.max.toFixed(5)}</span>
              </div>
            </div>
            
            {/* TP Ladder */}
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Take Profit Ladder</span>
              {setup.tradePlan.tpLadder.map((tp, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-green-500/10 border border-green-500/30"
                >
                  <div className="flex items-center gap-2">
                    {setup.direction === 'BUY' ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-green-500" />
                    )}
                    <span className="text-sm font-mono">{tp.price.toFixed(5)}</span>
                  </div>
                  <Badge variant="outline" className="text-xs text-green-600">
                    TP{tp.level} • {tp.probability}
                  </Badge>
                </div>
              ))}
            </div>
            
            {/* Invalidation */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-xs font-medium">Invalidation Rule</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {setup.tradePlan.invalidationRule}
              </p>
            </div>
          </div>
          
          {/* Context Warnings */}
          {setup.warnings.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Context Warnings
              </h4>
              <div className="space-y-2">
                {setup.warnings.map((warning, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      'p-3 rounded-lg border',
                      warning.severity === 'high' 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : warning.severity === 'medium'
                        ? 'bg-orange-500/10 border-orange-500/30'
                        : 'bg-yellow-500/10 border-yellow-500/30'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn(
                        'h-3.5 w-3.5',
                        warning.severity === 'high' ? 'text-red-500' 
                          : warning.severity === 'medium' ? 'text-orange-500' 
                          : 'text-yellow-500'
                      )} />
                      <span className="text-sm">{warning.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </ScrollArea>
      
      {/* Footer Actions */}
      <div className="p-4 border-t border-border/50">
        <Button 
          className="w-full" 
          onClick={() => onSaveToJournal(setup)}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Save to Journal
        </Button>
      </div>
    </Card>
  );
};

export default SetupDetailDrawer;
