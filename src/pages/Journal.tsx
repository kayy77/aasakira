import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, BarChart3, Brain, Filter } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import PremiumUpgrade from '@/components/PremiumUpgrade';
import { JournalAnalyticsService } from '@/services/journalAnalyticsService';

interface JournalEntry {
  id: string;
  pair: string;
  entry_price: number;
  exit_price?: number;
  entry_time: string;
  direction: 'LONG' | 'SHORT';
  strategy: string;
  lot_size?: number;
  fees?: number;
  feelings?: string;
  mistakes?: string;
  risk_reward_ratio?: number;
  result_pips?: number;
  result_percentage?: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  notes?: string;
  ai_feedback?: string;
  created_at: string;
}

const Journal = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { toast } = useToast();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('overview');
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [aiSummary, setAiSummary] = useState<string>('');
  const [generatingAISummary, setGeneratingAISummary] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Display settings - Calculate actual P&L using lot size
  const calculateRealPnL = (pips: number, lotSize: number = 1, fees: number = 0) => {
    // Handle lot size 0 as micro lot (0.01)
    const actualLotSize = lotSize === 0 ? 0.01 : lotSize;
    
    // Standard lot (1.0) = $10 per pip, Mini lot (0.1) = $1 per pip, Micro lot (0.01) = $0.10 per pip
    const pipValue = actualLotSize * 10;
    const grossProfit = pips * pipValue;
    const netProfit = grossProfit - fees;
    return Math.round(netProfit * 100) / 100; // Round to 2 decimal places
  };

  const formatPnLUSD = (pips: number, lotSize: number = 1, fees: number = 0) => {
    const netPnL = calculateRealPnL(pips, lotSize, fees);
    return `${netPnL >= 0 ? '+' : ''}$${Math.abs(netPnL).toLocaleString()}`;
  };

  const analyticsService = new JournalAnalyticsService();

  const [newEntry, setNewEntry] = useState({
    pair: '',
    entry_price: '',
    exit_price: '',
    entry_time: '',
    direction: 'LONG' as 'LONG' | 'SHORT',
    strategy: '',
    lot_size: '',
    fees: '',
    feelings: '',
    mistakes: '',
    notes: '',
    status: 'OPEN' as 'OPEN' | 'CLOSED' | 'CANCELLED'
  });

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries((data || []) as JournalEntry[]);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      toast({
        title: "Error",
        description: "Failed to load journal entries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDailyPnL = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayTrades = entries.filter(entry => {
      const entryDate = new Date(entry.entry_time).toISOString().split('T')[0];
      return entryDate === dateStr && entry.status === 'CLOSED';
    });
    
    return dayTrades.reduce((sum, entry) => {
      const pips = entry.result_pips || 0;
      if (Math.abs(pips) > 1000) return sum; // Skip unrealistic values
      return sum + calculateRealPnL(pips, entry.lot_size, entry.fees || 0);
    }, 0);
  };

  const getDayColor = (date: Date) => {
    const pnl = getDailyPnL(date);
    if (pnl > 0) return 'bg-green-500';
    if (pnl < 0) return 'bg-red-500';
    
    // Check if there are any trades this day
    const dateStr = date.toISOString().split('T')[0];
    const hasTrades = entries.some(entry => {
      const entryDate = new Date(entry.entry_time).toISOString().split('T')[0];
      return entryDate === dateStr;
    });
    
    return hasTrades ? 'bg-gray-500' : 'bg-gray-700';
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddEntry = async () => {
    if (!user) return;

    // Validate required fields
    if (!newEntry.pair || !newEntry.entry_price || !newEntry.entry_time || !newEntry.strategy) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Currency Pair, Entry Price, Entry Time, and Strategy",
        variant: "destructive"
      });
      return;
    }

    // Validate exit price if status is closed
    if (newEntry.status === 'CLOSED' && !newEntry.exit_price) {
      toast({
        title: "Validation Error",
        description: "Exit price is required for closed trades",
        variant: "destructive"
      });
      return;
    }

    console.log('🔄 Adding journal entry...', { newEntry, user: user.id });

    try {
      const entryData: any = {
        user_id: user.id,
        pair: newEntry.pair,
        entry_price: parseFloat(newEntry.entry_price),
        exit_price: newEntry.exit_price ? parseFloat(newEntry.exit_price) : null,
        entry_time: newEntry.entry_time,
        direction: newEntry.direction,
        strategy: newEntry.strategy,
        lot_size: newEntry.lot_size ? parseFloat(newEntry.lot_size) : null,
        fees: newEntry.fees ? parseFloat(newEntry.fees) : 0,
        feelings: newEntry.feelings || null,
        mistakes: newEntry.mistakes || null,
        status: newEntry.status,
        notes: newEntry.notes || null,
      };

      console.log('📤 Sending to database:', entryData);

      // Calculate metrics if trade is closed
      if (newEntry.status === 'CLOSED' && newEntry.exit_price) {
        const entryPrice = parseFloat(newEntry.entry_price);
        const exitPrice = parseFloat(newEntry.exit_price);
        const direction = newEntry.direction;
        
        let pips = 0;
        let percentage = 0;

        // Calculate pips based on instrument type
        let pipMultiplier = 10000; // Default for most forex pairs
        
        if (newEntry.pair.includes('JPY')) {
          pipMultiplier = 100; // JPY pairs
        } else if (newEntry.pair.includes('XAU') || newEntry.pair.includes('GOLD')) {
          pipMultiplier = 10; // Gold: 1 pip = 0.1
        } else if (newEntry.pair.includes('XAG') || newEntry.pair.includes('SILVER')) {
          pipMultiplier = 1000; // Silver: 1 pip = 0.001
        } else if (newEntry.pair.includes('BTC') || newEntry.pair.includes('ETH')) {
          pipMultiplier = 1; // Crypto: 1 pip = 1 point
        }

        if (direction === 'LONG') {
          pips = (exitPrice - entryPrice) * pipMultiplier;
          percentage = ((exitPrice - entryPrice) / entryPrice) * 100;
        } else {
          pips = (entryPrice - exitPrice) * pipMultiplier;
          percentage = ((entryPrice - exitPrice) / entryPrice) * 100;
        }

        entryData.result_pips = Math.round(pips * 10) / 10;
        entryData.result_percentage = Math.round(percentage * 100) / 100;
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .insert(entryData)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Trade saved successfully:', data);
      
      // Force reload entries from database to ensure fresh data
      await loadEntries();
      
      const entryDate = new Date((data as any).entry_time);
      setCurrentDate(entryDate);
      setSelectedDate(entryDate);
      setShowAddDialog(false);
      setNewEntry({
        pair: '',
        entry_price: '',
        exit_price: '',
        entry_time: '',
        direction: 'LONG',
        strategy: '',
        lot_size: '',
        fees: '',
        feelings: '',
        mistakes: '',
        notes: '',
        status: 'OPEN'
      });

      toast({
        title: "Trade Added",
        description: "Journal entry created successfully",
      });
    } catch (error) {
      console.error('Error adding entry:', error);
      toast({
        title: "Error",
        description: "Failed to add journal entry",
        variant: "destructive"
      });
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      pair: entry.pair,
      entry_price: entry.entry_price.toString(),
      exit_price: entry.exit_price?.toString() || '',
      entry_time: entry.entry_time.slice(0, 16), // Format for datetime-local input
      direction: entry.direction,
      strategy: entry.strategy,
      lot_size: entry.lot_size?.toString() || '',
      fees: entry.fees?.toString() || '',
      feelings: entry.feelings || '',
      mistakes: entry.mistakes || '',
      notes: entry.notes || '',
      status: entry.status
    });
    setShowAddDialog(true);
  };

  const handleUpdateEntry = async () => {
    if (!user || !editingEntry) return;

    // Validate required fields
    if (!newEntry.pair || !newEntry.entry_price || !newEntry.entry_time || !newEntry.strategy) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Currency Pair, Entry Price, Entry Time, and Strategy",
        variant: "destructive"
      });
      return;
    }

    // Validate exit price if status is closed
    if (newEntry.status === 'CLOSED' && !newEntry.exit_price) {
      toast({
        title: "Validation Error",
        description: "Exit price is required for closed trades",
        variant: "destructive"
      });
      return;
    }

    try {
      const entryData: any = {
        pair: newEntry.pair,
        entry_price: parseFloat(newEntry.entry_price),
        exit_price: newEntry.exit_price ? parseFloat(newEntry.exit_price) : null,
        entry_time: newEntry.entry_time,
        direction: newEntry.direction,
        strategy: newEntry.strategy,
        lot_size: newEntry.lot_size ? parseFloat(newEntry.lot_size) : null,
        fees: newEntry.fees ? parseFloat(newEntry.fees) : 0,
        feelings: newEntry.feelings || null,
        mistakes: newEntry.mistakes || null,
        status: newEntry.status,
        notes: newEntry.notes || null,
      };

      // Calculate metrics if trade is closed
      if (newEntry.status === 'CLOSED' && newEntry.exit_price) {
        const entryPrice = parseFloat(newEntry.entry_price);
        const exitPrice = parseFloat(newEntry.exit_price);
        const direction = newEntry.direction;
        
        let pips = 0;
        let percentage = 0;

        // Calculate pips based on instrument type
        let pipMultiplier = 10000; // Default for most forex pairs
        
        if (newEntry.pair.includes('JPY')) {
          pipMultiplier = 100; // JPY pairs
        } else if (newEntry.pair.includes('XAU') || newEntry.pair.includes('GOLD')) {
          pipMultiplier = 10; // Gold: 1 pip = 0.1
        } else if (newEntry.pair.includes('XAG') || newEntry.pair.includes('SILVER')) {
          pipMultiplier = 1000; // Silver: 1 pip = 0.001
        } else if (newEntry.pair.includes('BTC') || newEntry.pair.includes('ETH')) {
          pipMultiplier = 1; // Crypto: 1 pip = 1 point
        }

        if (direction === 'LONG') {
          pips = (exitPrice - entryPrice) * pipMultiplier;
          percentage = ((exitPrice - entryPrice) / entryPrice) * 100;
        } else {
          pips = (entryPrice - exitPrice) * pipMultiplier;
          percentage = ((entryPrice - exitPrice) / entryPrice) * 100;
        }

        entryData.result_pips = Math.round(pips * 10) / 10;
        entryData.result_percentage = Math.round(percentage * 100) / 100;
      }

      const { error } = await supabase
        .from('journal_entries')
        .update(entryData)
        .eq('id', editingEntry.id);

      if (error) throw error;

      // Force reload entries from database
      await loadEntries();
      
      setShowAddDialog(false);
      setEditingEntry(null);
      setNewEntry({
        pair: '',
        entry_price: '',
        exit_price: '',
        entry_time: '',
        direction: 'LONG',
        strategy: '',
        lot_size: '',
        fees: '',
        feelings: '',
        mistakes: '',
        notes: '',
        status: 'OPEN'
      });

      toast({
        title: "Trade Updated",
        description: "Journal entry updated successfully",
      });
    } catch (error) {
      console.error('Error updating entry:', error);
      toast({
        title: "Error",
        description: "Failed to update journal entry",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setEntries(entries.filter(e => e.id !== entryId));
      toast({
        title: "Trade Deleted",
        description: "Journal entry removed successfully",
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete journal entry",
        variant: "destructive"
      });
    }
  };

  const generateAIFeedback = async (entryId: string) => {
    if (!isPremium) {
      setShowUpgradeDialog(true);
      return;
    }

    try {
      setGeneratingAI(entryId);
      
      const entry = entries.find(e => e.id === entryId);
      if (!entry) return;

      const { data, error } = await supabase.functions.invoke('generate-ai-feedback', {
        body: { entry }
      });

      if (error) throw error;

      const feedback = data.feedback;

      // Update the entry with AI feedback
      const { error: updateError } = await supabase
        .from('journal_entries')
        .update({ ai_feedback: feedback })
        .eq('id', entryId);

      if (updateError) throw updateError;

      // Update local state
      setEntries(entries.map(e => 
        e.id === entryId ? { ...e, ai_feedback: feedback } : e
      ));

      toast({
        title: "AI Analysis Complete",
        description: "Trade feedback generated successfully",
      });
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI feedback",
        variant: "destructive"
      });
    } finally {
      setGeneratingAI(null);
    }
  };

  const generateProgressSummary = async () => {
    if (!isPremium) {
      setShowUpgradeDialog(true);
      return;
    }

    try {
      setGeneratingAISummary(true);
      
      const timeframeName = timeFilter === 'custom' ? 'selected period' : timeFilter;
      const summary = await analyticsService.generateAISummary(user?.id || '', entries, timeframeName);
      
      setAiSummary(summary);
      toast({
        title: "AI Analysis Complete",
        description: "Progress summary generated successfully",
      });
    } catch (error) {
      console.error('Error generating AI summary:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI summary",
        variant: "destructive"
      });
    } finally {
      setGeneratingAISummary(false);
    }
  };

  const sanitizedEntries = React.useMemo(() =>
    entries.filter(e => !(e.status === 'CLOSED' && Math.abs(e.result_pips || 0) > 1000))
  , [entries]);

  const getFilteredEntries = () => {
    const filter = {
      type: timeFilter,
      startDate: customStartDate ? new Date(customStartDate) : undefined,
      endDate: customEndDate ? new Date(customEndDate) : undefined
    };

    return analyticsService['filterEntriesByTime'](sanitizedEntries, filter);
  };

  const statsData = analyticsService.calculateStats(sanitizedEntries, {
    type: timeFilter,
    startDate: customStartDate ? new Date(customStartDate) : undefined,
    endDate: customEndDate ? new Date(customEndDate) : undefined
  });

  // Convert pip-based stats to USD for display
  const stats = {
    ...statsData,
    totalPnL: calculateRealPnL(statsData.totalPnL, 1, 0), // Convert total pips to USD
    avgWin: calculateRealPnL(statsData.avgWin, 1, 0),
    avgLoss: calculateRealPnL(statsData.avgLoss, 1, 0),
    bestDay: calculateRealPnL(statsData.bestDay, 1, 0),
    worstDay: calculateRealPnL(statsData.worstDay, 1, 0)
  };

  const generateProgressChartData = () => {
    const filtered = getFilteredEntries() as JournalEntry[];
    console.log('🔍 Filtered entries for chart:', filtered.length, filtered);
    const dailyPnL: { [key: string]: number } = {};
    
    // Group entries by date and calculate daily P&L with validation
    filtered.forEach((entry: JournalEntry) => {
      if (entry.status === 'CLOSED' && entry.result_pips) {
        // Filter out unrealistic pip values (should be between -1000 and +1000 pips for most trades)
        const pips = entry.result_pips;
        if (Math.abs(pips) > 1000) {
          console.warn(`Filtering out unrealistic trade: ${pips} pips on ${entry.entry_time}`);
          return;
        }
        
        const date = new Date(entry.entry_time).toISOString().split('T')[0];
        // Convert pips to USD using lot size
        const usdPnL = calculateRealPnL(pips, entry.lot_size, entry.fees || 0);
        console.log(`💰 Trade P&L: ${pips} pips = $${usdPnL} (lot: ${entry.lot_size}, fees: ${entry.fees || 0})`);
        dailyPnL[date] = (dailyPnL[date] || 0) + usdPnL;
      }
    });
    
    // Debug: Log the daily P&L values
    console.log('Daily P&L data (USD):', dailyPnL);
    
    // Convert to chart data format and sort by date
    const chartData = Object.entries(dailyPnL)
      .map(([dateStr, pnl]) => ({
        date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pnl: Math.round(pnl), // Already in USD
        originalDate: dateStr
      }))
      .filter(entry => Math.abs(entry.pnl) <= 50000) // Cap at $50,000 per day
      .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
      .slice(-15); // Show last 15 days for better visibility
    
    console.log('Chart data after processing:', chartData);
    return chartData;
  };

  const progressData = React.useMemo(() => generateProgressChartData(), [entries, timeFilter, customStartDate, customEndDate]);

  const chartConfig = {
    pnl: {
      label: "P&L",
      color: "hsl(var(--chart-1))",
    },
  };

  const selectedDayPnL = getDailyPnL(selectedDate);
  const selectedDayTrades = entries.filter(entry => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const entryDate = new Date(entry.entry_time).toISOString().split('T')[0];
    return entryDate === dateStr;
  });

  const calendarDays = generateCalendarDays();
  const monthYearText = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
            <p className="mt-4 text-zinc-400">Loading journal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <main className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-green-400 mb-1">Stop emotional</h1>
            <h2 className="text-2xl font-bold text-white mb-2">trading</h2>
            <p className="text-zinc-400 text-sm">Eliminate losses on bad days</p>
          </div>

          {/* Overall P/L and Filter Controls */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-zinc-900/50 border-zinc-700">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-zinc-400 mb-1">P/L ({timeFilter})</p>
                   <p className={`text-3xl font-bold ${
                     stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                   }`}>
                     ${stats.totalPnL >= 0 ? '+' : ''}${Math.abs(stats.totalPnL).toLocaleString()}
                   </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {stats.totalTrades} trades • {stats.winRate}% win rate
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-700">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-400" />
                    <Label className="text-sm text-zinc-300">Time Period</Label>
                  </div>
                  <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-600">
                      <SelectItem value="daily">Today</SelectItem>
                      <SelectItem value="weekly">This Week</SelectItem>
                      <SelectItem value="monthly">This Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {timeFilter === 'custom' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="bg-zinc-800 border-zinc-600 text-white text-xs"
                      />
                      <Input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="bg-zinc-800 border-zinc-600 text-white text-xs"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Progress Chart */}
            <div className="lg:col-span-1">
              <Card className="bg-zinc-900/50 border-zinc-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Progress Chart
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {progressData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-xs text-zinc-400">
                      No closed trades in this period.
                    </div>
                  ) : (
                    <ChartContainer config={chartConfig} className="w-full" style={{ aspectRatio: 'auto', height: '192px' }}>
                      <BarChart data={progressData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10, fill: '#9ca3af' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis domain={[ 'auto', 'auto' ]} hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="pnl" barSize={12} radius={[3, 3, 0, 0]}>
                          {progressData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-zinc-900/50 border-zinc-700 mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                   <div className="flex justify-between text-sm">
                     <span className="text-zinc-400">Best Day</span>
                     <span className="text-green-400">+${Math.abs(stats.bestDay).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-zinc-400">Worst Day</span>
                     <span className="text-red-400">-${Math.abs(stats.worstDay).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-zinc-400">Avg Win</span>
                     <span className="text-green-400">+${Math.abs(stats.avgWin).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-zinc-400">Avg Loss</span>
                     <span className="text-red-400">-${Math.abs(stats.avgLoss).toLocaleString()}</span>
                   </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Streak</span>
                    <span className={stats.currentStreak >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {stats.currentStreak >= 0 ? '+' : ''}{stats.currentStreak}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis Button */}
              {isPremium && (
                <Card className="bg-zinc-900/50 border-zinc-700 mt-4">
                  <CardContent className="p-4">
                    <Button
                      onClick={generateProgressSummary}
                      disabled={generatingAISummary}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {generatingAISummary ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Analyzing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          AI Analysis
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Calendar Section */}
              <div className="max-w-md mx-auto">
                <Card className="bg-zinc-900/50 border-zinc-700">
                  <CardContent className="p-4">

                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigateMonth('prev')}
                        className="text-white hover:bg-zinc-800"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h3 className="text-white font-semibold">{monthYearText}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigateMonth('next')}
                        className="text-white hover:bg-zinc-800"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-xs text-zinc-400 text-center p-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((date, index) => {
                        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        const pnl = getDailyPnL(date);
                        const dateStr = date.toISOString().split('T')[0];
                        const hasTrades = entries.some(entry => {
                          const entryDate = new Date(entry.entry_time).toISOString().split('T')[0];
                          return entryDate === dateStr;
                        });
                        
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedDate(date);
                              // If there are trades on this day, show edit dialog for the most recent one
                              const dateStr = date.toISOString().split('T')[0];
                              const dayTrades = entries.filter(entry => {
                                const entryDate = new Date(entry.entry_time).toISOString().split('T')[0];
                                return entryDate === dateStr;
                              });
                              if (dayTrades.length > 0) {
                                // If multiple trades, edit the most recent one
                                const latestTrade = dayTrades.sort((a, b) => 
                                  new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime()
                                )[0];
                                handleEditEntry(latestTrade);
                              } else {
                                // No trades on this day, open add dialog with this date pre-filled
                                const dateTimeStr = date.toISOString().slice(0, 16);
                                setNewEntry({
                                  ...newEntry,
                                  entry_time: dateTimeStr
                                });
                                setShowAddDialog(true);
                              }
                            }}
                            className={`
                              aspect-square rounded-md text-xs font-medium transition-all relative flex flex-col items-center justify-center
                              ${isCurrentMonth ? 'text-white' : 'text-zinc-600'}
                              ${isSelected ? 'ring-2 ring-white' : ''}
                              ${isToday && !isSelected ? 'ring-1 ring-zinc-400' : ''}
                              ${getDayColor(date)}
                              hover:opacity-80
                            `}
                          >
                            <span>{date.getDate()}</span>
                            {pnl !== 0 && isCurrentMonth && (
                              <span className={`text-[8px] font-bold ${
                                pnl > 0 ? 'text-green-200' : 'text-red-200'
                              }`}>
                                {pnl > 0 ? '+' : ''}${Math.abs(pnl).toLocaleString()}
                              </span>
                            )}
                            {pnl === 0 && hasTrades && isCurrentMonth && (
                              <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-zinc-300" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Summary */}
              <Card className="bg-zinc-900/50 border-zinc-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-zinc-400">
                      Today - {formatSelectedDate().split(',')[0]}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddDialog(true)}
                      className="text-white hover:bg-zinc-800"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className={`text-3xl font-bold mb-2 ${
                    selectedDayPnL >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedDayPnL >= 0 ? '+' : ''}${Math.abs(selectedDayPnL).toLocaleString()}
                  </div>
                  
                  {selectedDayTrades.length > 0 && (
                    <div className="text-sm text-zinc-400">
                      {selectedDayTrades.length} trade{selectedDayTrades.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  
                  {selectedDayTrades.length === 0 && (
                    <div className="text-sm text-zinc-500">
                      No trades on this day
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Summary Display */}
              {aiSummary && (
                <Card className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-purple-300 flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI Analysis - {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)} Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-zinc-300 whitespace-pre-line">
                      {aiSummary}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Trade List for Selected Day */}
              {selectedDayTrades.length > 0 && (
                 <div className="space-y-2">
                   <h3 className="text-white font-medium text-sm mb-3">
                     Trades for {formatSelectedDate()}
                   </h3>
                   {selectedDayTrades.map((entry) => {
                     const realPnL = entry.status === 'CLOSED' ? calculateRealPnL(entry.result_pips || 0, entry.lot_size, entry.fees || 0) : 0;
                     const isWin = entry.status === 'CLOSED' && realPnL > 0;
                     const isLoss = entry.status === 'CLOSED' && realPnL < 0;
                    
                     return (
                       <Card key={entry.id} className="bg-zinc-900/30 border-zinc-700">
                         <CardContent className="p-3">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <span className="text-white font-medium">{entry.pair}</span>
                               <Badge className={`text-xs ${
                                 entry.direction === 'LONG' 
                                   ? 'bg-green-500/20 text-green-400' 
                                   : 'bg-red-500/20 text-red-400'
                               }`}>
                                 {entry.direction}
                               </Badge>
                               {entry.status === 'CLOSED' && (
                                 <span className="text-xs">
                                   {isWin ? '✅' : isLoss ? '❌' : '⚪'}
                                 </span>
                               )}
                             </div>
                             
                             <div className="flex items-center gap-2">
                               {entry.status === 'CLOSED' && (
                                 <span className={`text-sm font-bold px-2 py-1 rounded ${
                                   isWin 
                                     ? 'bg-green-500/20 text-green-400' 
                                     : isLoss 
                                       ? 'bg-red-500/20 text-red-400' 
                                       : 'text-zinc-400'
                                 }`}>
                                   {formatPnLUSD(entry.result_pips || 0, entry.lot_size, entry.fees || 0)}
                                 </span>
                               )}
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleEditEntry(entry)}
                                 className="text-zinc-400 hover:text-white"
                               >
                                 Edit
                               </Button>
                             </div>
                           </div>
                          
                           {entry.notes && (
                             <p className="text-xs text-zinc-400 mt-2">{entry.notes}</p>
                           )}
                           
                           {/* Display lot size, fees, feelings, and mistakes */}
                           <div className="mt-3 space-y-1">
                             {entry.lot_size && (
                               <p className="text-xs text-zinc-500">Lot Size: {entry.lot_size}</p>
                             )}
                             {entry.fees && entry.fees > 0 && (
                               <p className="text-xs text-zinc-500">Fees: ${entry.fees}</p>
                             )}
                             {entry.feelings && (
                               <p className="text-xs text-amber-400">Feelings: {entry.feelings}</p>
                             )}
                             {entry.mistakes && (
                               <p className="text-xs text-blue-400">Lessons: {entry.mistakes}</p>
                             )}
                           </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Add Trade Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setEditingEntry(null);
          setNewEntry({
            pair: '',
            entry_price: '',
            exit_price: '',
            entry_time: '',
            direction: 'LONG',
            strategy: '',
            lot_size: '',
            fees: '',
            feelings: '',
            mistakes: '',
            notes: '',
            status: 'OPEN'
          });
        }
      }}>
        <DialogContent className="max-w-md mx-4 max-h-[85vh] overflow-y-auto bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">{editingEntry ? 'Edit Trade' : 'Add New Trade'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pair" className="text-white">Currency Pair *</Label>
                <Input
                  id="pair"
                  placeholder="EURUSD"
                  value={newEntry.pair}
                  onChange={(e) => setNewEntry({...newEntry, pair: e.target.value.toUpperCase()})}
                  className="bg-zinc-800 border-zinc-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="direction" className="text-white">Direction</Label>
                <Select value={newEntry.direction} onValueChange={(value: 'LONG' | 'SHORT') => setNewEntry({...newEntry, direction: value})}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600 z-50">
                    <SelectItem value="LONG">Long (Buy)</SelectItem>
                    <SelectItem value="SHORT">Short (Sell)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entry_price" className="text-white">Entry Price *</Label>
                <Input
                  id="entry_price"
                  type="number"
                  step="0.00001"
                  value={newEntry.entry_price}
                  onChange={(e) => setNewEntry({...newEntry, entry_price: e.target.value})}
                  className="bg-zinc-800 border-zinc-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="exit_price" className="text-white">Exit Price (if closed)</Label>
                <Input
                  id="exit_price"
                  type="number"
                  step="0.00001"
                  value={newEntry.exit_price}
                  onChange={(e) => setNewEntry({...newEntry, exit_price: e.target.value})}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entry_time" className="text-white">Entry Time *</Label>
                <Input
                  id="entry_time"
                  type="datetime-local"
                  value={newEntry.entry_time}
                  onChange={(e) => setNewEntry({...newEntry, entry_time: e.target.value})}
                  className="bg-zinc-800 border-zinc-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lot_size" className="text-white">Lot Size</Label>
                <Input
                  id="lot_size"
                  type="number"
                  step="0.1"
                  placeholder="1.0 = Standard lot"
                  value={newEntry.lot_size}
                  onChange={(e) => setNewEntry({...newEntry, lot_size: e.target.value})}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fees" className="text-white">Fees/Commission ($)</Label>
                <Input
                  id="fees"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newEntry.fees}
                  onChange={(e) => setNewEntry({...newEntry, fees: e.target.value})}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-white">Status</Label>
                <Select value={newEntry.status} onValueChange={(value: 'OPEN' | 'CLOSED') => setNewEntry({...newEntry, status: value})}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600 z-50">
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="strategy" className="text-white">Strategy *</Label>
                <Select value={newEntry.strategy} onValueChange={(value) => setNewEntry({...newEntry, strategy: value})}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                    <SelectValue placeholder="Select strategy *" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600 z-50">
                    <SelectItem value="SMC">Smart Money Concepts</SelectItem>
                    <SelectItem value="ICT">Inner Circle Trader</SelectItem>
                    <SelectItem value="Scalping">Scalping</SelectItem>
                    <SelectItem value="Swing">Swing Trading</SelectItem>
                    <SelectItem value="Breakout">Breakout</SelectItem>
                    <SelectItem value="Support/Resistance">Support/Resistance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="feelings" className="text-white">Feelings During Trade</Label>
              <Textarea
                id="feelings"
                placeholder="How did you feel during this trade? (confident, nervous, FOMO, etc.)"
                value={newEntry.feelings}
                onChange={(e) => setNewEntry({...newEntry, feelings: e.target.value})}
                rows={2}
                className="bg-zinc-800 border-zinc-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="mistakes" className="text-white">Mistakes & Lessons Learned</Label>
              <Textarea
                id="mistakes"
                placeholder="What went wrong? What would you do differently next time?"
                value={newEntry.mistakes}
                onChange={(e) => setNewEntry({...newEntry, mistakes: e.target.value})}
                rows={2}
                className="bg-zinc-800 border-zinc-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-white">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Trade notes and observations..."
                value={newEntry.notes}
                onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                rows={3}
                className="bg-zinc-800 border-zinc-600 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setEditingEntry(null);
              setNewEntry({
                pair: '',
                entry_price: '',
                exit_price: '',
                entry_time: '',
                direction: 'LONG',
                strategy: '',
                lot_size: '',
                fees: '',
                feelings: '',
                mistakes: '',
                notes: '',
                status: 'OPEN'
              });
            }} className="border-zinc-600 text-white hover:bg-zinc-800">
              Cancel
            </Button>
            <Button 
              onClick={editingEntry ? handleUpdateEntry : handleAddEntry} 
              className="bg-primary hover:bg-primary/90 text-black"
              disabled={!newEntry.pair || !newEntry.entry_price || !newEntry.entry_time || !newEntry.strategy}
            >
              {editingEntry ? 'Update Trade' : 'Add Trade'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        
      {/* Upgrade Dialog */}
      <PremiumUpgrade 
        open={showUpgradeDialog} 
        onOpenChange={setShowUpgradeDialog} 
      />
    </div>
  );
};

export default Journal;