import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, Activity, Target, Brain, Crown, Lock } from 'lucide-react';
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

    return { totalTrades, winRate, totalPips, avgRR, wins: wins.length, losses: losses.length };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading journal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Trading Journal</h1>
              <p className="text-muted-foreground">Track your trades and improve with AI insights</p>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Trade
                </Button>
              </DialogTrigger>
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
          </div>

          {/* Stats Dashboard - SuperTrader Style */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-[#1a1a1a] border border-zinc-800/50 rounded-lg p-4 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Total Trades</p>
                  <p className="text-3xl font-bold text-white mt-0.5">{stats.totalTrades}</p>
                </div>
                <Activity className="h-4 w-4 text-blue-400/70" />
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-zinc-800/50 rounded-lg p-4 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Win Rate</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-0.5 glow-soft">{stats.winRate.toFixed(0)}%</p>
                </div>
                <Target className="h-4 w-4 text-emerald-400/70" />
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-zinc-800/50 rounded-lg p-4 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Total Pips</p>
                  <p className={`text-3xl font-bold mt-0.5 ${stats.totalPips >= 0 ? 'text-emerald-400 glow-soft' : 'text-red-400'}`}>
                    {stats.totalPips > 0 ? '+' : ''}{stats.totalPips.toFixed(0)}
                  </p>
                </div>
                {stats.totalPips >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-400/70" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400/70" />
                )}
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-zinc-800/50 rounded-lg p-4 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Avg R:R</p>
                  <p className="text-3xl font-bold text-white mt-0.5">{stats.avgRR.toFixed(1)}</p>
                </div>
                <Brain className="h-4 w-4 text-blue-400/70" />
              </div>
            </div>
          </div>

          {/* Journal Entries */}
          <div className="space-y-4">
            {entries.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No trades logged yet</h3>
                  <p className="text-muted-foreground mb-6">Start building your trading journal by adding your first trade</p>
                  <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Trade
                  </Button>
                </CardContent>
              </Card>
            ) : (
              entries.map((entry) => (
                <div 
                  key={entry.id} 
                  className={`bg-[#1a1a1a] border border-zinc-800/50 rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all ${
                    entry.status === 'CLOSED' && entry.result_pips !== null
                      ? entry.result_pips > 0 
                        ? 'border-l-4 border-l-emerald-400 shadow-emerald-400/5' 
                        : 'border-l-4 border-l-red-400 shadow-red-400/5'
                      : 'border-l-4 border-l-zinc-600'
                  }`}
                >
                  <div className="p-5">
                    {/* Compact Horizontal Layout */}
                    <div className="flex items-center justify-between">
                      {/* Left: Pair + Tags */}
                      <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
                        <div>
                          <h3 className="font-bold text-xl text-white">{entry.pair}</h3>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {new Date(entry.entry_time).toLocaleDateString()} • {new Date(entry.entry_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={entry.direction === 'LONG' ? 'default' : 'secondary'}
                            className={`text-xs font-semibold ${
                              entry.direction === 'LONG' 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                                : 'bg-red-500/20 text-red-300 border-red-400/30'
                            }`}
                          >
                            {entry.direction}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-zinc-800/50 text-zinc-300 border-zinc-600/50"
                          >
                            {entry.strategy}
                          </Badge>
                          <Badge 
                            className={`text-xs font-medium ${
                              entry.status === 'OPEN' 
                                ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                                : entry.result_pips && entry.result_pips > 0 
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                                  : 'bg-red-500/20 text-red-300 border-red-400/30'
                            }`}
                          >
                            {entry.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Center: Entry → Exit + Notes */}
                      <div className="flex-1 px-8 text-center min-w-0">
                        <div className="flex items-center justify-center gap-3 text-sm mb-1">
                          <span className="text-zinc-300 font-mono">{entry.entry_price}</span>
                          <span className="text-zinc-500">→</span>
                          {entry.exit_price ? (
                            <span className="text-zinc-300 font-mono">{entry.exit_price}</span>
                          ) : (
                            <span className="text-zinc-500 text-xs">Open</span>
                          )}
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-zinc-400 truncate max-w-xs">
                            {entry.notes.length > 60 ? `${entry.notes.substring(0, 60)}...` : entry.notes}
                          </p>
                        )}
                      </div>
                      
                      {/* Right: Result */}
                      <div className="text-right flex-shrink-0">
                        {entry.status === 'CLOSED' && entry.result_pips !== null ? (
                          <>
                            <p className={`text-3xl font-bold ${
                              entry.result_pips > 0 
                                ? 'text-emerald-400 glow-soft' 
                                : 'text-red-400'
                            }`}>
                              {entry.result_pips > 0 ? '+' : ''}{entry.result_pips.toFixed(1)}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">pips</p>
                          </>
                        ) : (
                          <div className="text-zinc-500">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mx-auto"></div>
                            <p className="text-xs mt-1">Active</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Insights - Blurred Premium Upsell */}
                    <div className="mt-4 pt-4 border-t border-zinc-800/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium text-zinc-300">AI Trade Analysis</span>
                        </div>
                        
                        {!entry.ai_feedback && !isPremium && (
                          <Button
                            size="sm"
                            onClick={() => setShowUpgradeDialog(true)}
                            className="h-7 px-3 text-xs bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Unlock Premium
                          </Button>
                        )}
                        
                        {!entry.ai_feedback && isPremium && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateAIFeedback(entry.id)}
                            disabled={generatingAI === entry.id}
                            className="h-7 px-3 text-xs bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                          >
                            {generatingAI === entry.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border border-blue-400"></div>
                            ) : (
                              <Brain className="h-3 w-3" />
                            )}
                            <span className="ml-1">Analyze</span>
                          </Button>
                        )}
                      </div>
                      
                      {entry.ai_feedback ? (
                        <div className="bg-zinc-800/30 border border-zinc-700/50 p-4 rounded-lg text-sm text-zinc-200 leading-relaxed">
                          {entry.ai_feedback}
                        </div>
                      ) : !isPremium ? (
                        <div 
                          className="relative bg-zinc-800/20 border border-zinc-700/30 p-4 rounded-lg cursor-pointer hover:bg-zinc-800/30 transition-all group"
                          onClick={() => setShowUpgradeDialog(true)}
                        >
                          <div className="blur-sm select-none text-sm text-zinc-300 leading-relaxed">
                            ⚡ Your entry timing shows excellent market structure awareness. The stop loss placement could be optimized for better risk management considering the recent liquidity sweep. This setup aligns with smart money concepts...
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-zinc-900/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-zinc-600 text-blue-400 font-medium text-sm group-hover:scale-105 transition-transform">
                              <Lock className="inline h-3 w-3 mr-1" />
                              Unlock AI Insights
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-zinc-800/20 border border-zinc-700/30 p-4 rounded-lg text-sm text-zinc-400">
                          Click "Analyze" to get professional AI feedback on this trade setup and execution
                        </div>
                      )}
                    </div>
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