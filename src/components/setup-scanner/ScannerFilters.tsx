import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Filter, Zap } from 'lucide-react';
import type { SetupGrade } from '@/services/setupScannerEngine';

interface ScannerFiltersProps {
  filters: {
    asset: string;
    session: string;
    setupType: string;
    minGrade: SetupGrade;
    minConfidence: number;
  };
  onFiltersChange: (filters: ScannerFiltersProps['filters']) => void;
}

const assets = [
  { value: 'all', label: 'All Assets' },
  { value: 'forex', label: 'Forex Majors' },
  { value: 'gold', label: 'Gold (XAUUSD)' },
  { value: 'crypto', label: 'Crypto' },
];

const sessions = [
  { value: 'all', label: 'All Sessions' },
  { value: 'london', label: 'London' },
  { value: 'newyork', label: 'New York' },
  { value: 'asia', label: 'Asia' },
  { value: 'london_ny_overlap', label: 'LDN/NY Overlap' },
];

const setupTypes = [
  { value: 'all', label: 'All Setups' },
  { value: 'breakout', label: 'Break & Retest' },
  { value: 'sweep', label: 'Liquidity Sweep' },
  { value: 'fvg', label: 'FVG Entry' },
  { value: 'ob', label: 'Order Block' },
];

const grades: SetupGrade[] = ['A+', 'A', 'B', 'C', 'D'];

const ScannerFilters: React.FC<ScannerFiltersProps> = ({ filters, onFiltersChange }) => {
  const updateFilter = (key: keyof typeof filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="h-fit sticky top-4 border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="h-4 w-4 text-primary" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Asset Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Asset</Label>
          <Select value={filters.asset} onValueChange={(v) => updateFilter('asset', v)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assets.map((a) => (
                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Session Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Session</Label>
          <Select value={filters.session} onValueChange={(v) => updateFilter('session', v)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Setup Type Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Setup Type</Label>
          <Select value={filters.setupType} onValueChange={(v) => updateFilter('setupType', v)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setupTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grade Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Minimum Grade</Label>
          <div className="flex gap-1">
            {grades.map((g) => (
              <Badge
                key={g}
                variant={filters.minGrade === g ? 'default' : 'outline'}
                className={`cursor-pointer text-xs px-2 py-1 transition-all ${
                  filters.minGrade === g 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => updateFilter('minGrade', g)}
              >
                {g}
              </Badge>
            ))}
          </div>
        </div>

        {/* Confidence Threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Min Confidence</Label>
            <span className="text-xs font-medium text-primary">{filters.minConfidence}%</span>
          </div>
          <Slider
            value={[filters.minConfidence]}
            onValueChange={([v]) => updateFilter('minConfidence', v)}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Quick Stats */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-yellow-500" />
            <span>Filters update live</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScannerFilters;
