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
          <div className="grid grid-cols-4 gap-3 mb-8">
            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg p-3 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground/80 uppercase tracking-wide">Total Trades</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.totalTrades}</p>
                </div>
                <Activity className="h-4 w-4 text-primary/60" />
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg p-3 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground/80 uppercase tracking-wide">Win Rate</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.winRate.toFixed(1)}%</p>
                </div>
                <Target className="h-4 w-4 text-emerald-400/60" />
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg p-3 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground/80 uppercase tracking-wide">Total Pips</p>
                  <p className={`text-2xl font-bold mt-1 ${stats.totalPips >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stats.totalPips > 0 ? '+' : ''}{stats.totalPips.toFixed(1)}
                  </p>
                </div>
                {stats.totalPips >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-400/60" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400/60" />
                )}
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg p-3 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground/80 uppercase tracking-wide">Avg R:R</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.avgRR.toFixed(2)}</p>
                </div>
                <Brain className="h-4 w-4 text-primary/60" />
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
                  className={`bg-card/30 backdrop-blur border rounded-lg hover:shadow-sm transition-all ${
                    entry.status === 'CLOSED' && entry.result_pips !== null
                      ? entry.result_pips > 0 
                        ? 'border-l-4 border-l-emerald-400' 
                        : 'border-l-4 border-l-red-400'
                      : 'border-l-4 border-l-muted-foreground/30'
                  }`}
                >
                  <div className="p-4">
                    {/* Compact Horizontal Layout */}
                    <div className="flex items-center justify-between">
                      {/* Left: Pair + Tags */}
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold text-lg">{entry.pair}</h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.entry_time).toLocaleDateString()} {new Date(entry.entry_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={entry.direction === 'LONG' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {entry.direction}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{entry.strategy}</Badge>
                          <Badge 
                            variant={
                              entry.status === 'OPEN' ? 'secondary' : 
                              entry.result_pips && entry.result_pips > 0 ? 'default' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {entry.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Center: Entry → Exit + Notes */}
                      <div className="flex-1 px-6 text-center">
                        <div className="flex items-center justify-center gap-4 text-sm">
                          <span className="text-muted-foreground">{entry.entry_price}</span>
                          <span className="text-muted-foreground/50">→</span>
                          {entry.exit_price ? (
                            <span className="text-muted-foreground">{entry.exit_price}</span>
                          ) : (
                            <span className="text-muted-foreground/50">Open</span>
                          )}
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-muted-foreground/80 mt-1 truncate max-w-md">
                            {entry.notes.length > 50 ? `${entry.notes.substring(0, 50)}...` : entry.notes}
                          </p>
                        )}
                      </div>
                      
                      {/* Right: Result */}
                      <div className="text-right">
                        {entry.status === 'CLOSED' && entry.result_pips !== null ? (
                          <>
                            <p className={`text-xl font-bold ${entry.result_pips > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {entry.result_pips > 0 ? '+' : ''}{entry.result_pips.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">pips</p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground/50">Pending</p>
                        )}
                      </div>
                    </div>

                    {/* AI Insights - Clean Premium Upsell */}
                    <div className="mt-4 pt-3 border-t border-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Brain className="h-3 w-3 text-primary/60" />
                          <span className="text-xs font-medium text-muted-foreground">AI Analysis</span>
                        </div>
                        
                        {!entry.ai_feedback && !isPremium && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowUpgradeDialog(true)}
                            className="h-6 px-2 text-xs gap-1"
                          >
                            <Lock className="h-3 w-3" />
                            Unlock
                          </Button>
                        )}
                        
                        {!entry.ai_feedback && isPremium && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => generateAIFeedback(entry.id)}
                            disabled={generatingAI === entry.id}
                            className="h-6 px-2 text-xs gap-1"
                          >
                            {generatingAI === entry.id ? (
                              <div className="animate-spin rounded-full h-2 w-2 border border-primary"></div>
                            ) : (
                              <Brain className="h-3 w-3" />
                            )}
                            Analyze
                          </Button>
                        )}
                      </div>
                      
                      {entry.ai_feedback ? (
                        <div className="bg-muted/20 p-3 rounded text-xs leading-relaxed">
                          {entry.ai_feedback}
                        </div>
                      ) : !isPremium ? (
                        <div 
                          className="relative bg-muted/10 p-3 rounded text-xs text-muted-foreground/60 cursor-pointer hover:bg-muted/20 transition-colors"
                          onClick={() => setShowUpgradeDialog(true)}
                        >
                          <div className="blur-sm select-none">
                            ⚡ Your entry timing shows good market awareness. Stop loss placement could be optimized for better risk management...
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded border text-primary font-medium">
                              🔓 Unlock AI Insights
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-muted/10 p-3 rounded text-xs text-muted-foreground/60">
                          Click "Analyze" to get AI feedback on this trade
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