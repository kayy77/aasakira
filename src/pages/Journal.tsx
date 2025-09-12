import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, Trash2, Brain, Lock } from 'lucide-react';
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
    const totalTrades = entries.length;
    const closedTrades = entries.filter(e => e.status === 'CLOSED');
    const wins = closedTrades.filter(e => (e.result_pips || 0) > 0);
    
    const winRate = closedTrades.length > 0 ? Math.round((wins.length / closedTrades.length) * 100) : 0;
    const netPips = closedTrades.reduce((sum, entry) => sum + (entry.result_pips || 0), 0);
    
    return { 
      totalTrades, 
      winRate, 
      netPips: Math.round(netPips * 10) / 10,
    };
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Trading Journal</h1>
              <p className="text-zinc-400 mt-1">Your battle log of trades</p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 text-black font-semibold" 
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Trade
            </Button>
          </div>

          {/* Simple Stats Row - Only 3 Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{stats.totalTrades}</div>
                  <div className="text-zinc-400 text-sm mt-1">Total Trades</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{stats.winRate}%</div>
                  <div className="text-zinc-400 text-sm mt-1">Win Rate</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${stats.netPips >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stats.netPips >= 0 ? '+' : ''}{stats.netPips}
                  </div>
                  <div className="text-zinc-400 text-sm mt-1">Net P/L (pips)</div>
                </div>
              </CardContent>
            </Card>
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
                      <SelectItem value="Support/Resistance">Support/Resistance</SelectItem>
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
                    placeholder="Trade notes and observations..."
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEntry} className="bg-primary hover:bg-primary/90 text-black">
                  Add Trade
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Trade Feed - Battle Log */}
          <div className="space-y-4">
            {entries.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-8 text-center">
                  <div className="text-zinc-400 mb-4">No trades recorded yet</div>
                  <Button 
                    onClick={() => setShowAddDialog(true)}
                    className="bg-primary hover:bg-primary/90 text-black"
                  >
                    Add Your First Trade
                  </Button>
                </CardContent>
              </Card>
            ) : (
              entries.map((entry) => {
                const isWin = entry.status === 'CLOSED' && (entry.result_pips || 0) > 0;
                const isLoss = entry.status === 'CLOSED' && (entry.result_pips || 0) < 0;
                const resultBadge = entry.status === 'OPEN' ? '⏳ OPEN' : isWin ? '✅ WIN' : isLoss ? '❌ LOSS' : '⚪ BE';
                
                return (
                  <Card 
                    key={entry.id} 
                    className={`bg-zinc-900/30 border-l-4 hover:bg-zinc-800/30 transition-all ${
                      entry.direction === 'LONG' ? 'border-l-emerald-400' : 'border-l-red-400'
                    }`}
                  >
                    <CardContent className="p-5">
                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-white">{entry.pair}</span>
                          <Badge 
                            className={`font-semibold ${
                              entry.direction === 'LONG' 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {entry.direction}
                          </Badge>
                          <Badge 
                            className={`font-semibold ${
                              entry.status === 'OPEN' 
                                ? 'bg-blue-500/20 text-blue-400'
                                : isWin 
                                  ? 'bg-emerald-500/20 text-emerald-400' 
                                  : isLoss
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-zinc-500/20 text-zinc-400'
                            }`}
                          >
                            {resultBadge}
                          </Badge>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Main Price Info */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-lg">Entry → Exit:</span>
                          <span className="text-xl font-mono">
                            {entry.entry_price}
                            {entry.exit_price && (
                              <> → {entry.exit_price}</>
                            )}
                          </span>
                        </div>
                        
                        {entry.result_pips !== undefined && entry.result_pips !== null && (
                          <div className={`text-2xl font-bold mt-1 ${
                            entry.result_pips >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {entry.result_pips >= 0 ? '+' : ''}{entry.result_pips} pips
                          </div>
                        )}
                      </div>

                      {/* Bottom Row - Meta Info */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                            {entry.strategy}
                          </Badge>
                          
                          {entry.notes && (
                            <details className="text-zinc-400 cursor-pointer">
                              <summary className="hover:text-white italic">
                                View notes...
                              </summary>
                              <div className="mt-2 p-2 bg-zinc-800/50 rounded text-xs text-zinc-300">
                                {entry.notes}
                              </div>
                            </details>
                          )}
                        </div>
                        
                        <span className="text-zinc-500 text-xs">
                          {formatDate(entry.created_at)}
                        </span>
                      </div>

                      {/* AI Insights Hook */}
                      {!isPremium && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-blue-400" />
                            <span className="text-blue-400 text-sm font-medium">💡 AI Insight locked</span>
                          </div>
                          <p className="text-zinc-400 text-xs mt-1">
                            Upgrade to Premium to see trade feedback and analysis.
                          </p>
                          <Button
                            size="sm"
                            onClick={() => setShowUpgradeDialog(true)}
                            className="mt-2 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
                            variant="outline"
                          >
                            Upgrade to Premium
                          </Button>
                        </div>
                      )}

                      {isPremium && !entry.ai_feedback && (
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateAIFeedback(entry.id)}
                            disabled={generatingAI === entry.id}
                            className="text-xs border-zinc-700 hover:bg-zinc-800"
                          >
                            {generatingAI === entry.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-zinc-400 mr-2"></div>
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Brain className="h-3 w-3 mr-1" />
                                Get AI Analysis
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {entry.ai_feedback && (
                        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-emerald-400" />
                            <span className="text-emerald-400 text-sm font-medium">AI Analysis</span>
                          </div>
                          <div className="text-zinc-300 text-sm leading-relaxed">
                            {entry.ai_feedback}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Premium Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Upgrade to Premium
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-zinc-300 mb-4">
              Unlock AI trade analysis and advanced features with Premium
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-black">
              Upgrade Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Journal;