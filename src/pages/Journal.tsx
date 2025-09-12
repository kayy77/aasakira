import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, Activity, Target, Brain, Crown, Lock, Calendar, Filter, Users, Settings, BarChart3 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import PremiumUpgrade from '@/components/PremiumUpgrade';

interface JournalEntry {
  id: string;
  pair: string;
  entry_price: number;
  exit_price?: number;
  entry_time: string;
  exit_time?: string;
  direction: 'LONG' | 'SHORT';
  strategy: string;
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
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'pips' | 'pair'>('date');

  const [newEntry, setNewEntry] = useState({
    pair: '',
    entry_price: '',
    exit_price: '',
    entry_time: '',
    exit_time: '',
    direction: 'LONG' as 'LONG' | 'SHORT',
    strategy: '',
    notes: '',
    status: 'OPEN' as 'OPEN' | 'CLOSED'
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

  const calculateStats = () => {
    const closedTrades = entries.filter(e => e.status === 'CLOSED' && e.result_pips !== null);
    const wins = closedTrades.filter(e => (e.result_pips || 0) > 0);
    const losses = closedTrades.filter(e => (e.result_pips || 0) < 0);
    
    const totalTrades = closedTrades.length;
    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
    const totalPips = closedTrades.reduce((sum, e) => sum + (e.result_pips || 0), 0);
    const avgRR = closedTrades.reduce((sum, e) => sum + (e.risk_reward_ratio || 0), 0) / (totalTrades || 1);
    
    // Calculate monetary values (assuming 1 pip = $10 for demo)
    const totalPnL = totalPips * 10;
    const avgWin = wins.length > 0 ? wins.reduce((sum, e) => sum + (e.result_pips || 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, e) => sum + (e.result_pips || 0), 0) / losses.length) : 0;
    const profitFactor = avgLoss > 0 ? (avgWin / avgLoss) : 0;

    return { 
      totalTrades, 
      winRate, 
      totalPips, 
      avgRR, 
      wins: wins.length, 
      losses: losses.length,
      totalPnL,
      avgWin,
      avgLoss,
      profitFactor
    };
  };

  const generateChartData = () => {
    const dailyPnL: { [key: string]: number } = {};
    const cumulativeData: { date: string; pnl: number; winRate: number }[] = [];
    
    let runningPnL = 0;
    let runningWins = 0;
    let runningTrades = 0;

    entries
      .filter(e => e.status === 'CLOSED' && e.result_pips !== null)
      .sort((a, b) => new Date(a.exit_time || a.created_at).getTime() - new Date(b.exit_time || b.created_at).getTime())
      .forEach((entry) => {
        const date = new Date(entry.exit_time || entry.created_at).toLocaleDateString();
        const pips = entry.result_pips || 0;
        
        dailyPnL[date] = (dailyPnL[date] || 0) + pips;
        
        runningPnL += pips;
        runningTrades += 1;
        if (pips > 0) runningWins += 1;
        
        cumulativeData.push({
          date: date.split('/').slice(0, 2).join('/'),
          pnl: runningPnL,
          winRate: (runningWins / runningTrades) * 100
        });
      });

    const barChartData = Object.entries(dailyPnL).map(([date, pnl]) => ({
      date: date.split('/').slice(0, 2).join('/'),
      pnl: Math.round(pnl * 10) / 10
    }));

    return { barChartData, cumulativeData };
  };

  const handleAddEntry = async () => {
    if (!user) return;

    try {
      const entryData: any = {
        user_id: user.id,
        pair: newEntry.pair,
        entry_price: parseFloat(newEntry.entry_price),
        exit_price: newEntry.exit_price ? parseFloat(newEntry.exit_price) : null,
        entry_time: newEntry.entry_time,
        exit_time: newEntry.exit_time || null,
        direction: newEntry.direction,
        strategy: newEntry.strategy,
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

        if (direction === 'LONG') {
          pips = (exitPrice - entryPrice) * (newEntry.pair.includes('JPY') ? 100 : 10000);
          percentage = ((exitPrice - entryPrice) / entryPrice) * 100;
        } else {
          pips = (entryPrice - exitPrice) * (newEntry.pair.includes('JPY') ? 100 : 10000);
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

      if (error) throw error;

      setEntries([data as JournalEntry, ...entries]);
      setShowAddDialog(false);
      setNewEntry({
        pair: '',
        entry_price: '',
        exit_price: '',
        entry_time: '',
        exit_time: '',
        direction: 'LONG',
        strategy: '',
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

  const filteredAndSortedEntries = () => {
    let filtered = entries;
    
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(e => e.status === filterStatus);
    }
    
    if (filterDirection !== 'ALL') {
      filtered = filtered.filter(e => e.direction === filterDirection);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'pips':
          return (b.result_pips || 0) - (a.result_pips || 0);
        case 'pair':
          return a.pair.localeCompare(b.pair);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
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

  const stats = calculateStats();
  const { barChartData, cumulativeData } = generateChartData();

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
        <div className="max-w-7xl mx-auto px-6">
          {/* Top Navigation Bar - Clean Style */}
          <div className="flex items-center justify-between mb-8 bg-zinc-900/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-zinc-800/50 shadow-xl">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Trading Journal</h1>
              <div className="h-6 w-px bg-zinc-700"></div>
              <p className="text-sm text-zinc-400">Track & analyze your trading performance</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={filterStatus} onValueChange={(value: 'ALL' | 'OPEN' | 'CLOSED') => setFilterStatus(value)}>
                <SelectTrigger className="w-32 h-9 bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="OPEN">Open Only</SelectItem>
                  <SelectItem value="CLOSED">Closed Only</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterDirection} onValueChange={(value: 'ALL' | 'LONG' | 'SHORT') => setFilterDirection(value)}>
                <SelectTrigger className="w-32 h-9 bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="LONG">Long Only</SelectItem>
                  <SelectItem value="SHORT">Short Only</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: 'date' | 'pips' | 'pair') => setSortBy(value)}>
                <SelectTrigger className="w-32 h-9 bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">By Date</SelectItem>
                  <SelectItem value="pips">By Pips</SelectItem>
                  <SelectItem value="pair">By Pair</SelectItem>
                </SelectContent>
              </Select>
              
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Trade
              </Button>
            </div>
          </div>

          {/* Demo Data Notice */}
          <div className="mb-6 text-center bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              📊 Demo mode active - <span className="text-blue-200 font-medium cursor-pointer hover:underline">Switch to live trading data</span>
            </p>
          </div>

          {/* Add Trade Dialog */}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Trade</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pair">Currency Pair</Label>
                  <Input
                    id="pair"
                    placeholder="EURUSD"
                    value={newEntry.pair}
                    onChange={(e) => setNewEntry({...newEntry, pair: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <Label htmlFor="direction">Direction</Label>
                  <Select value={newEntry.direction} onValueChange={(value: 'LONG' | 'SHORT') => setNewEntry({...newEntry, direction: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LONG">Long (Buy)</SelectItem>
                      <SelectItem value="SHORT">Short (Sell)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="entry_price">Entry Price</Label>
                  <Input
                    id="entry_price"
                    type="number"
                    step="0.00001"
                    value={newEntry.entry_price}
                    onChange={(e) => setNewEntry({...newEntry, entry_price: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="exit_price">Exit Price (if closed)</Label>
                  <Input
                    id="exit_price"
                    type="number"
                    step="0.00001"
                    value={newEntry.exit_price}
                    onChange={(e) => setNewEntry({...newEntry, exit_price: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="entry_time">Entry Time</Label>
                  <Input
                    id="entry_time"
                    type="datetime-local"
                    value={newEntry.entry_time}
                    onChange={(e) => setNewEntry({...newEntry, entry_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="exit_time">Exit Time (if closed)</Label>
                  <Input
                    id="exit_time"
                    type="datetime-local"
                    value={newEntry.exit_time}
                    onChange={(e) => setNewEntry({...newEntry, exit_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="strategy">Strategy</Label>
                  <Select value={newEntry.strategy} onValueChange={(value) => setNewEntry({...newEntry, strategy: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMC">Smart Money Concepts</SelectItem>
                      <SelectItem value="ICT">Inner Circle Trader</SelectItem>
                      <SelectItem value="Scalping">Scalping</SelectItem>
                      <SelectItem value="Swing">Swing Trading</SelectItem>
                      <SelectItem value="Breakout">Breakout</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newEntry.status} onValueChange={(value: 'OPEN' | 'CLOSED') => setNewEntry({...newEntry, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Trade reasoning, setup, emotions, lessons..."
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={handleAddEntry}>Add Trade</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Main Stats - SuperTrader Style */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {/* Total PnL */}
            <div className="bg-zinc-900/80 rounded-xl p-6 border border-zinc-800/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Total PnL</span>
                <span className="text-xs text-emerald-400">+{(stats.totalPnL / 8 * 100).toFixed(1)}%</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                ${stats.totalPnL >= 0 ? '+' : ''}{Math.abs(stats.totalPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-zinc-500">from $800.00</div>
            </div>

            {/* Win Rate */}
            <div className="bg-zinc-900/80 rounded-xl p-6 border border-zinc-800/50 relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Win Rate</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.winRate.toFixed(0)}%</div>
              <div className="absolute top-6 right-6">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2a2a2a" strokeWidth="2" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray={`${stats.winRate}, 100`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-400">
                    {stats.winRate.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Loss Rate */}
            <div className="bg-zinc-900/80 rounded-xl p-6 border border-zinc-800/50 relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Loss Rate</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{(100 - stats.winRate).toFixed(0)}%</div>
              <div className="absolute top-6 right-6">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2a2a2a" strokeWidth="2" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray={`${100 - stats.winRate}, 100`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-red-400">
                    {(100 - stats.winRate).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Factor */}
            <div className="bg-zinc-900/80 rounded-xl p-6 border border-zinc-800/50 relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Profit Factor</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.profitFactor.toFixed(2)}</div>
              <div className="absolute top-6 right-6">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2a2a2a" strokeWidth="2" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={stats.profitFactor > 2 ? "#10b981" : stats.profitFactor > 1 ? "#f59e0b" : "#ef4444"} strokeWidth="2" strokeDasharray={`${Math.min(stats.profitFactor * 20, 100)}, 100`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-400">
                    {stats.profitFactor.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Daily PnL Chart */}
            <div className="bg-zinc-900/80 rounded-xl p-6 border border-zinc-800/50">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-white">Daily PnL Performance</h3>
              </div>
              <div className="text-xs text-zinc-500 mb-4 uppercase tracking-wide">Pips per day</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="pnl" radius={4}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cumulative Win Rate */}
            <div className="bg-zinc-900/80 rounded-xl p-6 border border-zinc-800/50">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-white">Win Rate Progression</h3>
              </div>
              <div className="text-xs text-zinc-500 mb-4 uppercase tracking-wide">Cumulative percentage</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cumulativeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="winRate" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Trades List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Trading History ({filteredAndSortedEntries().length})
              </h2>
            </div>

            {filteredAndSortedEntries().length === 0 ? (
              <div className="bg-zinc-900/60 rounded-xl p-12 text-center border border-zinc-800/50">
                <Activity className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No trades found</h3>
                <p className="text-zinc-400 mb-6">
                  {filterStatus !== 'ALL' || filterDirection !== 'ALL' 
                    ? 'Try adjusting your filters or add new trades' 
                    : 'Start building your trading journal by adding your first trade'
                  }
                </p>
                <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Trade
                </Button>
              </div>
            ) : (
              filteredAndSortedEntries().map((entry) => (
                <div 
                  key={entry.id} 
                  className="group bg-zinc-900/70 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6 hover:bg-zinc-800/70 hover:border-zinc-700/50 transition-all duration-200"
                >
                  {/* Trade Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-white">{entry.pair}</h3>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            className={`px-3 py-1 font-semibold ${
                              entry.direction === 'LONG' 
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                : 'bg-red-500/15 text-red-400 border-red-500/30'
                            }`}
                          >
                            {entry.direction}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="px-3 py-1 bg-blue-500/15 text-blue-400 border-blue-500/30"
                          >
                            {entry.strategy}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={`px-3 py-1 font-medium ${
                              entry.status === 'OPEN' 
                                ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                                : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
                            }`}
                          >
                            {entry.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 w-9 p-0"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>

                  {/* Trade Details Grid */}
                  <div className="grid grid-cols-4 gap-6 mb-6">
                    {/* Entry Details */}
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Entry</p>
                      <p className="text-lg font-bold text-white">{entry.entry_price}</p>
                      <p className="text-xs text-zinc-400">
                        {new Date(entry.entry_time).toLocaleString()}
                      </p>
                    </div>

                    {/* Exit Details */}
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Exit</p>
                      <p className="text-lg font-bold text-white">
                        {entry.exit_price || 'Pending'}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {entry.exit_time ? new Date(entry.exit_time).toLocaleString() : 'Still running'}
                      </p>
                    </div>

                    {/* Result */}
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Result</p>
                      {entry.result_pips !== null && entry.result_pips !== undefined ? (
                        <>
                          <p className={`text-2xl font-bold ${
                            entry.result_pips >= 0 
                              ? 'text-emerald-400' 
                              : 'text-red-400'
                          }`}>
                            {entry.result_pips >= 0 ? '+' : ''}{entry.result_pips.toFixed(1)}
                          </p>
                          <p className="text-xs text-zinc-400">pips</p>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                          <p className="text-sm text-orange-400">Active</p>
                        </div>
                      )}
                    </div>

                    {/* Risk/Reward */}
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">R:R Ratio</p>
                      <p className="text-lg font-bold text-white">
                        {entry.risk_reward_ratio?.toFixed(1) || 'N/A'}:1
                      </p>
                      <p className="text-xs text-zinc-400">Target ratio</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {entry.notes && (
                    <div className="mb-6 p-4 bg-zinc-800/40 rounded-lg border border-zinc-700/30">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium mb-2">Notes</p>
                      <p className="text-sm text-zinc-300 leading-relaxed">{entry.notes}</p>
                    </div>
                  )}

                  {/* AI Insights */}
                  <div className="pt-4 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">AI Trade Analysis</span>
                      </div>
                      
                      {!entry.ai_feedback && !isPremium && (
                        <Button
                          size="sm"
                          onClick={() => setShowUpgradeDialog(true)}
                          className="h-8 px-4 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          <Crown className="h-3 w-3 mr-2" />
                          Unlock Analysis
                        </Button>
                      )}
                      
                      {!entry.ai_feedback && isPremium && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateAIFeedback(entry.id)}
                          disabled={generatingAI === entry.id}
                          className="h-8 px-4 text-xs bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        >
                          {generatingAI === entry.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border border-blue-400 mr-2"></div>
                          ) : (
                            <Brain className="h-3 w-3 mr-2" />
                          )}
                          Generate Analysis
                        </Button>
                      )}
                    </div>
                    
                    {entry.ai_feedback ? (
                      <div className="bg-zinc-800/50 border border-zinc-700/30 p-4 rounded-lg">
                        <p className="text-sm text-zinc-200 leading-relaxed">{entry.ai_feedback}</p>
                      </div>
                    ) : !isPremium ? (
                      <div 
                        className="relative bg-zinc-800/30 border border-zinc-700/30 p-4 rounded-lg cursor-pointer hover:bg-zinc-800/40 transition-all"
                        onClick={() => setShowUpgradeDialog(true)}
                      >
                        <div className="blur-sm select-none text-sm text-zinc-400 leading-relaxed">
                          ⚡ Excellent entry timing on this setup. Your risk management shows discipline with proper stop placement. The market structure suggests this was a high-probability trade based on institutional order flow patterns...
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-zinc-900/95 backdrop-blur-sm px-4 py-2 rounded-lg border border-zinc-600 text-blue-400 font-medium text-sm">
                            <Lock className="inline h-3 w-3 mr-2" />
                            Upgrade to unlock AI insights
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-zinc-800/30 border border-zinc-700/30 p-4 rounded-lg text-center text-zinc-500">
                        Click "Generate Analysis" to get AI feedback on this trade
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <PremiumUpgrade open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog} />
    </div>
  );
};

export default Journal;