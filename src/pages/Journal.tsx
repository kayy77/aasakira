import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { eachDayOfInterval, format, startOfMonth, startOfWeek, startOfDay, endOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, BarChart3, Brain, Filter, MoreVertical, Edit, Trash2, Loader2, Camera, X } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import PremiumUpgrade from '@/components/PremiumUpgrade';
import { JournalAnalyticsService } from '@/services/journalAnalyticsService';
import { TradeAnalyticsService } from '@/services/tradeAnalyticsService';
import { PairHeatmap } from '@/components/journal/PairHeatmap';
import { PositionSizeAnalysis } from '@/components/journal/PositionSizeAnalysis';
import { RiskRewardConsistency } from '@/components/journal/RiskRewardConsistency';
import { SetupClustering } from '@/components/journal/SetupClustering';
import SmartScreenshotJournal from '@/components/journal/SmartScreenshotJournal';
import ChartVisualizer from '@/components/journal/ChartVisualizer';
import WeeklySummary from '@/components/journal/WeeklySummary';
import CTraderConnect from '@/components/journal/CTraderConnect';

interface JournalEntry {
  id: string;
  pair: string;
  entry_price: number;
  exit_price?: number;
  entry_time: string;
  exit_time?: string;
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
  const [selectedTrades, setSelectedTrades] = useState<JournalEntry[]>([]);
  const [showScreenshotUpload, setShowScreenshotUpload] = useState(false);
  const [showChartVisualizer, setShowChartVisualizer] = useState(false);
  const [visualizingTrade, setVisualizingTrade] = useState<JournalEntry | null>(null);

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
  const tradeAnalyticsService = new TradeAnalyticsService();

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

  const revertDateShift = async () => {
    try {
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      // Subtract 1 day from all entries to revert back
      for (const entry of entries || []) {
        const currentDate = new Date(entry.entry_time);
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);

        const { error: updateError } = await supabase
          .from('journal_entries')
          .update({ 
            entry_time: newDate.toISOString(),
            exit_time: entry.exit_time ? new Date(new Date(entry.exit_time).getTime() - 24 * 60 * 60 * 1000).toISOString() : entry.exit_time 
          })
          .eq('id', entry.id);
        
        if (updateError) throw updateError;
      }

      console.log(`✅ Reverted ${entries?.length || 0} entries back by 1 day`);
      
      toast({
        title: "Success",
        description: `Reverted ${entries?.length || 0} trade dates back to original`,
      });

      // Reload entries
      loadEntries();
    } catch (error) {
      console.error('Error reverting date shift:', error);
      toast({
        title: "Error",
        description: "Failed to revert date shift",
        variant: "destructive"
      });
    }
  };

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out any remaining entries with unrealistic values
      const validEntries = (data || []).filter(entry => {
        const isValid = entry.pair && entry.pair.trim() !== '' && 
                       entry.entry_price > 0 && 
                       (entry.result_pips === null || Math.abs(entry.result_pips) <= 500);
        
        if (!isValid) {
          console.warn('⚠️ Filtering out invalid entry:', entry);
        }
        return isValid;
      });
      
      setEntries(validEntries as JournalEntry[]);
      console.log(`✅ Loaded ${validEntries.length} valid journal entries`);
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
    // Use local date string to avoid timezone issues
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayTrades = entries.filter(entry => {
      const entryDate = new Date(entry.entry_time);
      const entryDateStr = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;
      return entryDateStr === dateStr && entry.status === 'CLOSED' && entry.result_pips !== null;
    });
    
    return dayTrades.reduce((sum, entry) => {
      const pips = entry.result_pips || 0;
      // Skip unrealistic values (over 1000 pips to match chart filtering)
      if (Math.abs(pips) > 1000) {
        console.warn(`⚠️ Skipping unrealistic pip value: ${pips} for ${entry.pair}`);
        return sum;
      }
      const pnl = calculateRealPnL(pips, entry.lot_size, entry.fees || 0);
      return sum + pnl;
    }, 0);
  };

  const getDayColor = (date: Date) => {
    const pnl = getDailyPnL(date);
    if (pnl > 0) return 'bg-green-500';
    if (pnl < 0) return 'bg-red-500';
    
    // Check if there are any trades this day
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const hasTrades = entries.some(entry => {
      const entryDate = new Date(entry.entry_time);
      const entryDateStr = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;
      return entryDateStr === dateStr;
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
    if (!user) {
      console.error('❌ No user found');
      toast({
        title: "Authentication Error",
        description: "Please log in to add trades",
        variant: "destructive"
      });
      return;
    }

    // Check if user is actually authenticated in Supabase
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (!supabaseUser) {
      console.error('❌ User not authenticated in Supabase');
      toast({
        title: "Authentication Error",
        description: "Please log in again to continue",
        variant: "destructive"
      });
      return;
    }

    // More detailed validation with specific field checks
    const requiredFields = [];
    if (!newEntry.pair.trim()) requiredFields.push("Currency Pair");
    if (!newEntry.entry_price.trim()) requiredFields.push("Entry Price");
    if (!newEntry.strategy.trim()) requiredFields.push("Strategy");

    if (requiredFields.length > 0) {
      console.error('❌ Validation failed:', { requiredFields, newEntry });
      toast({
        title: "Validation Error", 
        description: `Please fill in: ${requiredFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Validate exit price if status is closed
    if (newEntry.status === 'CLOSED' && !newEntry.exit_price.trim()) {
      console.error('❌ Exit price required for closed trade');
      toast({
        title: "Validation Error",
        description: "Exit price is required for closed trades",
        variant: "destructive"
      });
      return;
    }

    // Validate numeric fields
    if (isNaN(parseFloat(newEntry.entry_price))) {
      toast({
        title: "Validation Error",
        description: "Entry price must be a valid number",
        variant: "destructive"
      });
      return;
    }

    console.log('🔄 Adding journal entry...', { 
      newEntry, 
      user: user.id,
      timestamp: new Date().toISOString()
    });

    try {
      const entryData: any = {
        user_id: user.id,
        pair: newEntry.pair.trim().toUpperCase(),
        entry_price: parseFloat(newEntry.entry_price),
        exit_price: newEntry.exit_price ? parseFloat(newEntry.exit_price) : null,
        entry_time: new Date().toISOString(), // Always use current time
        exit_time: newEntry.status === 'CLOSED' ? new Date().toISOString() : null,
        direction: newEntry.direction,
        strategy: newEntry.strategy.trim(),
        lot_size: newEntry.lot_size ? parseFloat(newEntry.lot_size) : null,
        fees: newEntry.fees ? parseFloat(newEntry.fees) : 0,
        feelings: newEntry.feelings?.trim() || null,
        mistakes: newEntry.mistakes?.trim() || null,
        status: newEntry.status,
        notes: newEntry.notes?.trim() || null,
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

        // Validate calculated pips to prevent unrealistic values
        if (Math.abs(pips) > 500) {
          console.warn(`⚠️ Calculated pips seem unrealistic: ${pips} for ${newEntry.pair}`);
          toast({
            title: "Warning",
            description: `Calculated pips (${Math.round(pips)}) seem high. Please verify your entry and exit prices.`,
            variant: "destructive"
          });
        }

        entryData.result_pips = Math.round(pips * 10) / 10;
        entryData.result_percentage = Math.round(percentage * 100) / 100;

        console.log('📊 Calculated metrics:', {
          pips: entryData.result_pips,
          percentage: entryData.result_percentage,
          pipMultiplier,
          entryPrice,
          exitPrice,
          direction
        });
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .insert(entryData)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        toast({
          title: "Database Error",
          description: error.message || "Failed to save trade to database",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Trade saved successfully:', data);
      
      // Force reload entries from database to ensure fresh data
      await loadEntries();
      
      const entryDate = new Date((data as any).entry_time);
      setCurrentDate(entryDate);
      setSelectedDate(entryDate);
      
      // Reset form for next trade (keep dialog open)
      setNewEntry({
        pair: '',
        entry_price: '',
        exit_price: '',
        entry_time: '', // Will be auto-set to current time on save
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
        title: "Trade Added Successfully!",
        description: `${entryData.pair} ${entryData.direction} trade added. Add another or close to finish.`,
      });

    } catch (error: any) {
      console.error('❌ Unexpected error adding entry:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleScreenshotExtraction = (extractedData: any) => {
    // Auto-populate form with extracted data
    setNewEntry({
      pair: extractedData.pair || '',
      entry_price: extractedData.entry_price?.toString() || '',
      exit_price: extractedData.exit_price?.toString() || '',
      entry_time: '',
      direction: extractedData.direction || 'LONG',
      strategy: extractedData.strategy || '',
      lot_size: extractedData.lot_size?.toString() || '',
      fees: '',
      feelings: '',
      mistakes: '',
      notes: '',
      status: extractedData.exit_price ? 'CLOSED' : 'OPEN'
    });

    setShowScreenshotUpload(false);
    setShowAddDialog(true);

    toast({
      title: "Trade Data Extracted!",
      description: "Review and confirm the details before saving",
    });
  };

  const handleVisualizeChart = (entry: JournalEntry) => {
    setVisualizingTrade(entry);
    setShowChartVisualizer(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    console.log('🔄 Editing entry:', entry);
    
    setEditingEntry(entry);
    
    // Better date handling - preserve the original date without timezone conversion
    const entryDate = new Date(entry.entry_time);
    const localDateStr = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}T12:00`;
    
    setNewEntry({
      pair: entry.pair,
      entry_price: entry.entry_price.toString(),
      exit_price: entry.exit_price?.toString() || '',
      entry_time: localDateStr,
      direction: entry.direction,
      strategy: entry.strategy,
      lot_size: entry.lot_size?.toString() || '',
      fees: entry.fees?.toString() || '',
      feelings: entry.feelings || '',
      mistakes: entry.mistakes || '',
      notes: entry.notes || '',
      status: entry.status
    });
    
    console.log('📝 Form populated with:', {
      original_time: entry.entry_time,
      formatted_time: localDateStr,
      pair: entry.pair,
      entry_price: entry.entry_price,
      exit_price: entry.exit_price
    });
    
    setShowAddDialog(true);
  };

  const handleUpdateEntry = async () => {
    if (!user || !editingEntry) {
      console.error('❌ No user or editing entry found');
      return;
    }

    // More detailed validation with specific field checks
    const requiredFields = [];
    if (!newEntry.pair.trim()) requiredFields.push("Currency Pair");
    if (!newEntry.entry_price.trim()) requiredFields.push("Entry Price");
    if (!newEntry.entry_time.trim()) requiredFields.push("Entry Time");
    if (!newEntry.strategy.trim()) requiredFields.push("Strategy");

    if (requiredFields.length > 0) {
      console.error('❌ Validation failed:', { requiredFields, newEntry });
      toast({
        title: "Validation Error", 
        description: `Please fill in: ${requiredFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Validate exit price if status is closed
    if (newEntry.status === 'CLOSED' && !newEntry.exit_price.trim()) {
      console.error('❌ Exit price required for closed trade');
      toast({
        title: "Validation Error",
        description: "Exit price is required for closed trades",
        variant: "destructive"
      });
      return;
    }

    // Validate numeric fields
    if (isNaN(parseFloat(newEntry.entry_price))) {
      toast({
        title: "Validation Error",
        description: "Entry price must be a valid number",
        variant: "destructive"
      });
      return;
    }

    if (newEntry.exit_price && isNaN(parseFloat(newEntry.exit_price))) {
      toast({
        title: "Validation Error",
        description: "Exit price must be a valid number",
        variant: "destructive"
      });
      return;
    }

    console.log('🔄 Updating journal entry...', { 
      editingEntry: editingEntry.id,
      newEntry, 
      user: user.id,
      timestamp: new Date().toISOString()
    });

    try {
      const entryData: any = {
        pair: newEntry.pair.trim().toUpperCase(),
        entry_price: parseFloat(newEntry.entry_price),
        exit_price: newEntry.exit_price ? parseFloat(newEntry.exit_price) : null,
        entry_time: newEntry.entry_time,
        exit_time: newEntry.status === 'CLOSED' && editingEntry.status !== 'CLOSED' ? new Date().toISOString() : editingEntry.exit_time,
        direction: newEntry.direction,
        strategy: newEntry.strategy.trim(),
        lot_size: newEntry.lot_size ? parseFloat(newEntry.lot_size) : null,
        fees: newEntry.fees ? parseFloat(newEntry.fees) : 0,
        feelings: newEntry.feelings?.trim() || null,
        mistakes: newEntry.mistakes?.trim() || null,
        status: newEntry.status,
        notes: newEntry.notes?.trim() || null,
        updated_at: new Date().toISOString()
      };

      console.log('📤 Sending update to database:', entryData);

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

        console.log('📊 Calculated metrics:', {
          pips: entryData.result_pips,
          percentage: entryData.result_percentage,
          pipMultiplier,
          entryPrice,
          exitPrice,
          direction
        });
      }

      const { error } = await supabase
        .from('journal_entries')
        .update(entryData)
        .eq('id', editingEntry.id);

      if (error) {
        console.error('❌ Database error:', error);
        toast({
          title: "Database Error",
          description: error.message || "Failed to update trade in database",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Trade updated successfully');

      // Force reload entries from database
      await loadEntries();
      
      setShowAddDialog(false);
      setEditingEntry(null);
      
      // Reset form
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
        title: "Trade Updated Successfully!",
        description: `${entryData.pair} ${entryData.direction} trade has been updated`,
      });

    } catch (error: any) {
      console.error('❌ Unexpected error updating entry:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred while updating",
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

  // Stats are now already in USD from analytics service
  const stats = statsData;

  const generateProgressChartData = () => {
    const filtered = getFilteredEntries() as JournalEntry[];
    console.log('🔍 Filtered entries for chart:', filtered.length, filtered);
    
    // Determine the date range based on the current filter
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (timeFilter) {
      case 'daily':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'weekly':
        startDate = startOfWeek(now);
        break;
      case 'monthly':
        startDate = startOfMonth(now);
        break;
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : startOfMonth(now);
        endDate = customEndDate ? new Date(customEndDate) : now;
        break;
      default:
        startDate = startOfMonth(now);
    }

    // Generate complete date range
    const allDays = eachDayOfInterval({ start: startDate, end: endDate }).map(date => ({
      date: format(date, 'yyyy-MM-dd'),
      dailyPL: 0,
      hasTradesForDay: false
    }));

    // Calculate daily P&L for days with trades
    const dailyPnL: { [key: string]: { pnl: number; hasTrades: boolean } } = {};
    
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
        
        if (!dailyPnL[date]) {
          dailyPnL[date] = { pnl: 0, hasTrades: false };
        }
        dailyPnL[date].pnl += usdPnL;
        dailyPnL[date].hasTrades = true;
      }
    });
    
    // Debug: Log the daily P&L values
    console.log('Daily P&L data (USD):', dailyPnL);
    
    // Merge trade results into complete date range
    const merged = allDays.map(d => ({
      ...d,
      dailyPL: dailyPnL[d.date]?.pnl ?? 0,
      hasTradesForDay: dailyPnL[d.date]?.hasTrades ?? false
    }));

    // Convert to chart data format with cumulative calculation
    const sortedData = merged
      .map(({ date: dateStr, dailyPL, hasTradesForDay }) => ({
        date: format(new Date(dateStr), 'MMM d'),
        dailyPnl: Math.round(dailyPL), // Daily P&L
        originalDate: dateStr,
        hasTradesForDay,
        isNoTradeDay: !hasTradesForDay
      }))
      .filter(entry => Math.abs(entry.dailyPnl) <= 50000) // Cap at $50,000 per day
      .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
      .slice(-30); // Show last 30 days for better visibility

    // Calculate cumulative P&L for the squirt chart effect
    let cumulativePL = 0;
    const chartData = sortedData.map((entry, index) => {
      cumulativePL += entry.dailyPnl;
      return {
        ...entry,
        cumulativePL: Math.round(cumulativePL),
        percentage: index === 0 ? 0 : Math.round(((cumulativePL / Math.abs(sortedData[0].dailyPnl || 1)) * 100) * 100) / 100
      };
    });
    
    console.log('Chart data after processing:', chartData);
    return chartData;
  };

  const progressData = React.useMemo(() => generateProgressChartData(), [entries, timeFilter, customStartDate, customEndDate]);

  const chartConfig = {
    cumulativePL: {
      label: "Cumulative P&L",
      color: "hsl(142 76% 36%)",
    },
  };

  const selectedDayPnL = getDailyPnL(selectedDate);
  const selectedDayTrades = entries.filter(entry => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const entryDate = new Date(entry.entry_time);
    const entryDateStr = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;
    return entryDateStr === dateStr;
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold gradient-text mb-2">Trading Journal</h1>
            <h2 className="text-xl font-zen-maru text-muted-foreground mb-2">Master Your Trading Psychology</h2>
            <p className="text-muted-foreground text-sm">Track performance • Analyze patterns • Eliminate emotional trading</p>
          </div>

          {/* Performance Overview */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            <Card className="glass-card hover-lift overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple-500/10 to-cyber-blue-500/10 pointer-events-none" />
              <CardContent className="p-6 relative">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground font-medium">Total P/L ({timeFilter})</p>
                  </div>
                  <p className={`text-4xl font-bold font-zen-maru mb-2 ${
                    stats.totalPnL >= 0 
                      ? 'text-neon-green-400 neon-text' 
                      : 'text-red-400 neon-text'
                  }`}>
                    ${stats.totalPnL >= 0 ? '+' : ''}${Math.abs(stats.totalPnL).toLocaleString()}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>{stats.totalTrades} trades</span>
                    <div className="h-4 w-px bg-border" />
                    <span className={stats.winRate >= 50 ? 'text-neon-green-400' : 'text-amber-400'}>
                      {stats.winRate}% win rate
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-pink-500/10 to-cyber-purple-500/10 pointer-events-none" />
              <CardContent className="p-6 relative">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    <Label className="text-base font-medium">Time Period</Label>
                  </div>
                  <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
                    <SelectTrigger className="bg-card/50 border-border backdrop-blur text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover/90 backdrop-blur border-border">
                      <SelectItem value="daily">Today</SelectItem>
                      <SelectItem value="weekly">This Week</SelectItem>
                      <SelectItem value="monthly">This Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {timeFilter === 'custom' && (
                    <div className="grid grid-cols-2 gap-3 animate-fade-in">
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="bg-card/50 border-border backdrop-blur text-foreground text-sm"
                      />
                      <Input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="bg-card/50 border-border backdrop-blur text-foreground text-sm"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Analytics */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="glass-card hover-lift overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue-500/5 to-cyber-purple-500/5 pointer-events-none" />
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Performance Chart
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {progressData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                      No closed trades in this period.
                    </div>
                  ) : (
                    <ChartContainer config={chartConfig} className="w-full" style={{ aspectRatio: 'auto', height: '192px' }}>
                      <AreaChart data={progressData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                        <defs>
                          <linearGradient id="positivePLGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0.05}/>
                          </linearGradient>
                          <linearGradient id="negativePLGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis domain={[ 'dataMin - 100', 'dataMax + 100' ]} hide />
                        <ChartTooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const currentValue = data.cumulativePL;
                              const isPositive = currentValue >= 0;
                              
                              return (
                                <div className="bg-popover/90 backdrop-blur border border-border rounded-lg p-3 shadow-lg">
                                  <p className="text-foreground font-medium">{label}</p>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className={`font-bold text-lg ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                      {Math.abs(currentValue) > 0 ? `${currentValue >= 0 ? '+' : ''}$${Math.abs(currentValue).toLocaleString()}` : '$0'}
                                    </span>
                                  </div>
                                  {data.isNoTradeDay ? (
                                    <p className="text-muted-foreground text-sm mt-1">No trades this day</p>
                                  ) : (
                                    <p className="text-muted-foreground text-sm mt-1">
                                      Daily: {data.dailyPnl >= 0 ? '+' : ''}${Math.abs(data.dailyPnl).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="cumulativePL" 
                          stroke={(() => {
                            const latestValue = progressData[progressData.length - 1]?.cumulativePL || 0;
                            return latestValue >= 0 ? "hsl(142 76% 36%)" : "hsl(0 84% 60%)";
                          })()}
                          strokeWidth={2.5}
                          fill={(() => {
                            const latestValue = progressData[progressData.length - 1]?.cumulativePL || 0;
                            return latestValue >= 0 ? "url(#positivePLGradient)" : "url(#negativePLGradient)";
                          })()}
                          dot={(() => {
                            const latestValue = progressData[progressData.length - 1]?.cumulativePL || 0;
                            return { 
                              fill: latestValue >= 0 ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)', 
                              strokeWidth: 2, 
                              r: 3 
                            };
                          })()}
                          activeDot={(() => {
                            const latestValue = progressData[progressData.length - 1]?.cumulativePL || 0;
                            return { 
                              r: 5, 
                              fill: latestValue >= 0 ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)', 
                              strokeWidth: 2, 
                              stroke: '#fff' 
                            };
                          })()}
                        />
                      </AreaChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* Advanced Stats */}
              <Card className="glass-card hover-lift overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-green-400/5 to-cyber-purple-500/5 pointer-events-none" />
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Trading Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Best Day</span>
                     <span className="text-neon-green-400 font-semibold">+${Math.abs(stats.bestDay).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Worst Day</span>
                     <span className="text-red-400 font-semibold">-${Math.abs(stats.worstDay).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Avg Win</span>
                     <span className="text-neon-green-400 font-semibold">+${Math.abs(stats.avgWin).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Avg Loss</span>
                     <span className="text-red-400 font-semibold">-${Math.abs(stats.avgLoss).toLocaleString()}</span>
                   </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Current Streak</span>
                    <Badge variant={stats.currentStreak >= 0 ? "default" : "destructive"} className="font-semibold">
                      {stats.currentStreak >= 0 ? '+' : ''}{stats.currentStreak}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis Button */}
              {isPremium && (
                <Card className="glass-card hover-lift overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple-500/10 to-cyber-pink-500/10 pointer-events-none" />
                  <CardContent className="p-4">
                    <Button
                      onClick={generateProgressSummary}
                      disabled={generatingAISummary}
                      className="w-full bg-gradient-to-r from-cyber-purple-600 to-cyber-pink-600 hover:from-cyber-purple-700 hover:to-cyber-pink-700 text-white font-medium cyber-glow mb-3"
                    >
                      {generatingAISummary ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Generating Analysis...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          <span>AI Deep Analysis</span>
                        </div>
                      )}
                    </Button>
                    <Button
                      onClick={() => setActiveCategory('patterns')}
                      variant="outline"
                      className="w-full"
                    >
                      🧠 Pattern Discovery
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* cTrader Integration */}
              <CTraderConnect />

              {/* Pattern Analysis Section */}
              {activeCategory === 'patterns' && isPremium && (
                <div className="lg:col-span-5 space-y-6">
                  <PairHeatmap analytics={tradeAnalyticsService.analyzePairPerformance(entries)} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PositionSizeAnalysis analytics={tradeAnalyticsService.analyzePositionSizing(entries)} />
                    <RiskRewardConsistency analysis={tradeAnalyticsService.analyzeRiskRewardConsistency(entries)} />
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Advanced Trading Calendar */}
              <div className="max-w-lg mx-auto">
                <Card className="glass-card hover-lift overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-sakura-500/5 to-cyber-blue-500/5 pointer-events-none" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <CardTitle className="text-foreground text-lg font-zen-maru">Trading Calendar</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {entries.filter(e => e.status === 'CLOSED').length} closed trades
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">

                    {/* Enhanced Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigateMonth('prev')}
                        className="hover-lift text-foreground hover:bg-accent/50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <h3 className="text-foreground font-zen-maru font-bold text-xl neon-text">{monthYearText}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigateMonth('next')}
                        className="hover-lift text-foreground hover:bg-accent/50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Styled Weekday Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-sm text-muted-foreground text-center py-2 font-medium">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Enhanced Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((date, index) => {
                        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        const pnl = getDailyPnL(date);
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        const hasTrades = entries.some(entry => {
                          const entryDate = new Date(entry.entry_time);
                          const entryDateStr = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;
                          return entryDateStr === dateStr;
                        });
                        
                        let dayBgClass = 'bg-card/30 hover:bg-accent/50';
                        let dayTextClass = isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50';
                        
                        if (hasTrades && isCurrentMonth) {
                          if (pnl > 0) {
                            dayBgClass = 'bg-gradient-to-br from-neon-green-400/20 to-neon-green-500/10 hover:from-neon-green-400/30 hover:to-neon-green-500/20 border border-neon-green-400/30';
                            dayTextClass = 'text-neon-green-400 font-bold';
                          } else if (pnl < 0) {
                            dayBgClass = 'bg-gradient-to-br from-red-400/20 to-red-500/10 hover:from-red-400/30 hover:to-red-500/20 border border-red-400/30';
                            dayTextClass = 'text-red-400 font-bold';
                          } else {
                            dayBgClass = 'bg-gradient-to-br from-amber-400/20 to-amber-500/10 hover:from-amber-400/30 hover:to-amber-500/20 border border-amber-400/30';
                            dayTextClass = 'text-amber-400 font-bold';
                          }
                        }
                        
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedDate(date);
                              // If there are trades on this day, show edit dialog for the most recent one
                              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                              const dayTrades = entries.filter(entry => {
                                const entryDate = new Date(entry.entry_time);
                                const entryDateStr = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;
                                return entryDateStr === dateStr;
                              });
                              if (dayTrades.length > 0) {
                                // If multiple trades, edit the most recent one
                                const latestTrade = dayTrades.sort((a, b) => 
                                  new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime()
                                )[0];
                                handleEditEntry(latestTrade);
                               } else {
                                 // No trades on this day, open add dialog with this date pre-filled
                                 const dateStr = date.toISOString().split('T')[0];
                                 setNewEntry({
                                   ...newEntry,
                                   entry_time: dateStr + 'T12:00'
                                 });
                                 setShowAddDialog(true);
                               }
                            }}
                            className={`
                              aspect-square rounded-xl text-sm font-medium transition-all duration-300 relative flex flex-col items-center justify-center gap-1 hover-lift
                              ${dayBgClass}
                              ${dayTextClass}
                              ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg' : ''}
                              ${isToday && !isSelected ? 'ring-1 ring-accent shadow-md' : ''}
                            `}
                          >
                            <span className="text-base">{date.getDate()}</span>
                            {pnl !== 0 && isCurrentMonth && (
                              <span className={`text-[10px] font-bold ${
                                pnl > 0 ? 'text-neon-green-300' : 'text-red-300'
                              }`}>
                                {pnl > 0 ? '+' : ''}${Math.abs(pnl) > 999 ? 
                                  `${(Math.abs(pnl)/1000).toFixed(1)}k` : 
                                  Math.abs(pnl).toLocaleString()
                                }
                              </span>
                            )}
                            {pnl === 0 && hasTrades && isCurrentMonth && (
                              <div className="absolute bottom-2 h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                            )}
                            {isToday && (
                              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Calendar Legend */}
                    <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded bg-gradient-to-br from-neon-green-400/30 to-neon-green-500/20 border border-neon-green-400/50"></div>
                        <span>Profit</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded bg-gradient-to-br from-red-400/30 to-red-500/20 border border-red-400/50"></div>
                        <span>Loss</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded bg-gradient-to-br from-amber-400/30 to-amber-500/20 border border-amber-400/50"></div>
                        <span>Breakeven</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Daily Summary */}
              <Card className="glass-card hover-lift overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue-500/5 to-cyber-purple-500/5 pointer-events-none" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-zen-maru font-semibold text-foreground">{formatSelectedDate()}</h3>
                      <p className="text-sm text-muted-foreground">Daily Performance</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={revertDateShift}
                        variant="outline"
                        size="sm"
                        className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20"
                      >
                        Revert Dates Back
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddDialog(true)}
                        className="hover-lift bg-primary/10 border-primary/20 hover:bg-primary/20"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Trade
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowScreenshotUpload(true)}
                        className="hover-lift bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30"
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        📸 Smart Screenshot
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveCategory('weekly')}
                        className="hover-lift bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Weekly Summary
                      </Button>
                    </div>
                  </div>
                  
                  <div className={`text-4xl font-bold font-zen-maru mb-3 ${
                    selectedDayPnL >= 0 ? 'text-neon-green-400 neon-text' : 'text-red-400 neon-text'
                  }`}>
                    {selectedDayPnL >= 0 ? '+' : ''}${Math.abs(selectedDayPnL).toLocaleString()}
                  </div>
                  
                  {selectedDayTrades.length > 0 ? (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>{selectedDayTrades.length} trade{selectedDayTrades.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>
                          {selectedDayTrades.filter(t => (t.result_pips || 0) > 0).length} wins
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>No trades recorded for this day</span>
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

              {/* Enhanced Trade List for Selected Day */}
              {selectedDayTrades.length > 0 && (
                <Card className="bg-zinc-900/50 border-zinc-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        Trades on {formatSelectedDate()}
                        <Badge variant="secondary" className="bg-zinc-800 text-white ml-2">
                          {selectedDayTrades.length} trade{selectedDayTrades.length !== 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                      <Button
                       onClick={() => {
                         const dateStr = selectedDate.toISOString().split('T')[0];
                         setNewEntry({
                           ...newEntry,
                           entry_time: dateStr + 'T12:00'
                         });
                         setShowAddDialog(true);
                       }}
                        className="bg-primary hover:bg-primary/90 text-black"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Trade
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedDayTrades.map((entry) => {
                      const realPnL = entry.status === 'CLOSED' ? calculateRealPnL(entry.result_pips || 0, entry.lot_size, entry.fees || 0) : 0;
                      const isWin = entry.status === 'CLOSED' && realPnL > 0;
                      const isLoss = entry.status === 'CLOSED' && realPnL < 0;
                     
                      return (
                        <div key={entry.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={entry.direction === 'LONG' ? 'default' : 'secondary'}
                                className={entry.direction === 'LONG' 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-red-600 hover:bg-red-700 text-white'
                                }
                              >
                                {entry.pair} {entry.direction}
                              </Badge>
                              <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                                {entry.strategy}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`border-zinc-600 ${
                                  entry.status === 'OPEN' ? 'text-blue-400' : 
                                  entry.status === 'CLOSED' ? 'text-green-400' : 'text-gray-400'
                                }`}
                              >
                                {entry.status}
                              </Badge>
                              {entry.status === 'CLOSED' && (
                                <span className="text-lg">
                                  {isWin ? '✅' : isLoss ? '❌' : '⚪'}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {entry.status === 'CLOSED' && (
                                <div className={`font-mono text-base font-bold px-3 py-1 rounded ${
                                  isWin 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : isLoss 
                                      ? 'bg-red-500/20 text-red-400' 
                                      : 'bg-zinc-600/20 text-zinc-400'
                                }`}>
                                  {formatPnLUSD(entry.result_pips || 0, entry.lot_size, entry.fees || 0)}
                                </div>
                              )}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                                  <DropdownMenuItem 
                                    onClick={() => handleEditEntry(entry)}
                                    className="text-white hover:bg-zinc-700"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleVisualizeChart(entry)}
                                    className="text-white hover:bg-zinc-700"
                                  >
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Visualize Chart
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => generateAIFeedback(entry.id)}
                                    disabled={generatingAI === entry.id || !isPremium}
                                    className="text-white hover:bg-zinc-700"
                                  >
                                    {generatingAI === entry.id ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Brain className="h-4 w-4 mr-2" />
                                    )}
                                    {!isPremium ? 'AI Analysis (Premium)' : 'AI Analysis'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="text-red-400 hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-zinc-500">Entry:</span>
                              <div className="text-white font-mono">{entry.entry_price}</div>
                            </div>
                            {entry.exit_price && (
                              <div>
                                <span className="text-zinc-500">Exit:</span>
                                <div className="text-white font-mono">{entry.exit_price}</div>
                              </div>
                            )}
                            <div>
                              <span className="text-zinc-500">Size:</span>
                              <div className="text-white">{entry.lot_size || 'N/A'}</div>
                            </div>
                            {entry.result_pips && (
                              <div>
                                <span className="text-zinc-500">Pips:</span>
                                <div className={`font-mono font-bold ${entry.result_pips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {entry.result_pips >= 0 ? '+' : ''}{entry.result_pips}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {(entry.notes || entry.feelings || entry.mistakes) && (
                            <div className="mt-3 space-y-1 text-sm">
                              {entry.notes && (
                                <div>
                                  <span className="text-zinc-500">Notes:</span>
                                  <div className="text-zinc-300 mt-1">{entry.notes}</div>
                                </div>
                              )}
                              {entry.feelings && (
                                <div>
                                  <span className="text-zinc-500">Feelings:</span>
                                  <div className="text-zinc-300 mt-1">{entry.feelings}</div>
                                </div>
                              )}
                              {entry.mistakes && (
                                <div>
                                  <span className="text-zinc-500">Mistakes:</span>
                                  <div className="text-red-300 mt-1">{entry.mistakes}</div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {entry.ai_feedback && (
                            <div className="mt-3 p-3 bg-zinc-900/50 rounded border border-purple-500/30">
                              <div className="flex items-center gap-2 mb-2">
                                <Brain className="h-4 w-4 text-purple-400" />
                                <span className="text-sm font-medium text-purple-400">AI Analysis</span>
                              </div>
                              <p className="text-sm text-zinc-300 whitespace-pre-line">{entry.ai_feedback}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Daily Summary Stats */}
                    <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700 mt-4">
                      <div className="text-center">
                        <div className="text-sm text-zinc-400 mb-3">Daily Summary</div>
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <div className="text-xl font-mono font-bold text-white">
                              {selectedDayTrades.filter(e => e.status === 'CLOSED').length}
                            </div>
                            <div className="text-xs text-zinc-500">Closed Trades</div>
                          </div>
                          <div>
                            <div className={`text-xl font-mono font-bold ${
                              selectedDayPnL >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {selectedDayPnL >= 0 ? '+' : ''}${Math.abs(selectedDayPnL).toLocaleString()}
                            </div>
                            <div className="text-xs text-zinc-500">Day P&L</div>
                          </div>
                          <div>
                            <div className="text-xl font-mono font-bold text-blue-400">
                              {selectedDayTrades.filter(e => e.status === 'OPEN').length}
                            </div>
                            <div className="text-xs text-zinc-500">Open Trades</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
            entry_time: '', // Will be auto-set to current time on save
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
                <Label htmlFor="entry_time" className="text-white">Entry Date *</Label>
                <Input
                  id="entry_time"
                  type="date"
                  value={newEntry.entry_time ? newEntry.entry_time.split('T')[0] : ''}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    const isoDateTime = selectedDate + 'T12:00:00.000Z'; // Add explicit timezone
                    console.log('📅 Date input changed:', { selectedDate, isoDateTime });
                    setNewEntry({...newEntry, entry_time: isoDateTime});
                  }}
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
              {editingEntry ? 'Cancel' : 'Close'}
            </Button>
            {editingEntry ? (
              <Button 
                onClick={handleUpdateEntry} 
                className="bg-primary hover:bg-primary/90 text-black"
                disabled={!newEntry.pair || !newEntry.entry_price || !newEntry.entry_time || !newEntry.strategy}
              >
                Update Trade
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleAddEntry} 
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                  disabled={!newEntry.pair || !newEntry.entry_price || !newEntry.entry_time || !newEntry.strategy}
                >
                  Add & Continue
                </Button>
                <Button 
                  onClick={async () => {
                    await handleAddEntry();
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
                  }}
                  className="bg-primary hover:bg-primary/90 text-black"
                  disabled={!newEntry.pair || !newEntry.entry_price || !newEntry.entry_time || !newEntry.strategy}
                >
                  Add & Close
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
        
      {/* Upgrade Dialog */}
      <PremiumUpgrade 
        open={showUpgradeDialog} 
        onOpenChange={setShowUpgradeDialog} 
      />

      {/* Smart Screenshot Journal Dialog */}
      <Dialog open={showScreenshotUpload} onOpenChange={setShowScreenshotUpload}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Smart Screenshot Journal</DialogTitle>
          </DialogHeader>
          <SmartScreenshotJournal 
            onTradesSaved={() => {
              setShowScreenshotUpload(false);
              loadEntries();
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Chart Visualizer Dialog */}
      <Dialog open={showChartVisualizer} onOpenChange={setShowChartVisualizer}>
        <DialogContent className="max-w-4xl bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">Trade Setup Visualization</DialogTitle>
          </DialogHeader>
          {visualizingTrade && (
            <ChartVisualizer 
              tradeData={{
                pair: visualizingTrade.pair,
                direction: visualizingTrade.direction,
                entry_price: visualizingTrade.entry_price,
                exit_price: visualizingTrade.exit_price,
                notes: visualizingTrade.notes
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Weekly Summary Section */}
      {activeCategory === 'weekly' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-lg border border-zinc-700 p-6">
            <Button
              onClick={() => setActiveCategory('overview')}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
            <WeeklySummary entries={entries} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;