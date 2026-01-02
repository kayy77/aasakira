import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from 'date-fns';

export type DateRange = {
  from: Date;
  to: Date;
  label: string;
};

interface DateFilterProps {
  onRangeChange: (range: DateRange) => void;
  currentRange: DateRange;
}

const presets = [
  { label: 'Today', getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: 'This Week', getValue: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) }) },
  { label: 'This Month', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: 'This Year', getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
  { label: 'Last 7 Days', getValue: () => ({ from: startOfDay(subDays(new Date(), 7)), to: endOfDay(new Date()) }) },
  { label: 'Last 30 Days', getValue: () => ({ from: startOfDay(subDays(new Date(), 30)), to: endOfDay(new Date()) }) },
  { label: 'All Time', getValue: () => ({ from: new Date('2020-01-01'), to: endOfDay(new Date()) }) },
];

export default function DateFilter({ onRangeChange, currentRange }: DateFilterProps) {
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetClick = (preset: typeof presets[0]) => {
    const range = preset.getValue();
    onRangeChange({ ...range, label: preset.label });
    setShowCustom(false);
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      onRangeChange({
        from: startOfDay(customFrom),
        to: endOfDay(customTo),
        label: `${format(customFrom, 'MMM d')} - ${format(customTo, 'MMM d, yyyy')}`
      });
      setShowCustom(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Quick presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant={currentRange.label === preset.label ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetClick(preset)}
            className="text-xs"
          >
            {preset.label}
          </Button>
        ))}
        <Button
          variant={showCustom ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowCustom(!showCustom)}
          className="text-xs"
        >
          <CalendarIcon className="w-3 h-3 mr-1" />
          Custom
        </Button>
      </div>

      {/* Custom date picker */}
      {showCustom && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <CalendarIcon className="w-3 h-3 mr-1" />
                {customFrom ? format(customFrom, 'MMM d, yyyy') : 'From'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customFrom}
                onSelect={setCustomFrom}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground text-xs">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <CalendarIcon className="w-3 h-3 mr-1" />
                {customTo ? format(customTo, 'MMM d, yyyy') : 'To'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customTo}
                onSelect={setCustomTo}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            onClick={handleCustomApply}
            disabled={!customFrom || !customTo}
            className="text-xs"
          >
            Apply
          </Button>
        </div>
      )}

      {/* Current selection indicator */}
      <p className="text-xs text-muted-foreground">
        Showing: <span className="font-medium text-foreground">{currentRange.label}</span>
        <span className="ml-2 opacity-70">
          ({format(currentRange.from, 'MMM d')} - {format(currentRange.to, 'MMM d, yyyy')})
        </span>
      </p>
    </div>
  );
}
