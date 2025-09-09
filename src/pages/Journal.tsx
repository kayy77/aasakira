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

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Trades</p>
                    <p className="text-3xl font-bold">{stats.totalTrades}</p>
                  </div>
                  <Activity className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-3xl font-bold text-green-500">{stats.winRate.toFixed(1)}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pips</p>
                    <p className={`text-3xl font-bold ${stats.totalPips >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stats.totalPips > 0 ? '+' : ''}{stats.totalPips.toFixed(1)}
                    </p>
                  </div>
                  {stats.totalPips >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg R:R</p>
                    <p className="text-3xl font-bold">{stats.avgRR.toFixed(2)}</p>
                  </div>
                  <Brain className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
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
                <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">{entry.pair}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(entry.entry_time).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={entry.direction === 'LONG' ? 'default' : 'secondary'}>
                          {entry.direction}
                        </Badge>
                        <Badge variant="outline">{entry.strategy}</Badge>
                        <Badge variant={
                          entry.status === 'OPEN' ? 'secondary' : 
                          entry.status === 'CLOSED' ? 'default' : 'destructive'
                        }>
                          {entry.status}
                        </Badge>
                      </div>

                      <div className="text-right">
                        {entry.result_pips !== null && (
                          <div className={`text-lg font-bold ${
                            (entry.result_pips || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {entry.result_pips > 0 ? '+' : ''}{entry.result_pips?.toFixed(1)} pips
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          Entry: {entry.entry_price}
                          {entry.exit_price && ` → ${entry.exit_price}`}
                        </div>
                      </div>
                    </div>

                    {entry.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                        <p className="text-sm">{entry.notes}</p>
                      </div>
                    )}

                    {/* AI Feedback Section */}
                    <div className="border-t pt-4">
                      {isPremium ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Brain className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">AI Insights</span>
                              <Crown className="h-4 w-4 text-yellow-500" />
                            </div>
                            {!entry.ai_feedback && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => generateAIFeedback(entry.id)}
                                disabled={generatingAI === entry.id}
                                className="gap-2"
                              >
                                {generatingAI === entry.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-primary" />
                                ) : (
                                  <Brain className="h-3 w-3" />
                                )}
                                {generatingAI === entry.id ? 'Analyzing...' : 'Get AI Feedback'}
                              </Button>
                            )}
                          </div>
                          {entry.ai_feedback ? (
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                              <p className="text-sm">{entry.ai_feedback}</p>
                            </div>
                          ) : generatingAI === entry.id ? (
                            <div className="bg-muted rounded-lg p-3">
                              <div className="animate-pulse text-sm text-muted-foreground">
                                AI is analyzing your trade...
                              </div>
                            </div>
                          ) : (
                            <div className="bg-muted rounded-lg p-3">
                              <p className="text-sm text-muted-foreground">
                                Click "Get AI Feedback" to receive personalized insights about this trade
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium">Premium AI Insights</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => setShowUpgradeDialog(true)}
                              className="gap-2"
                            >
                              <Crown className="h-3 w-3" />
                              Upgrade
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Get personalized AI feedback on your trades, identify patterns, and improve your strategy
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
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