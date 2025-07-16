
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Download, Target, TrendingUp, Calendar } from 'lucide-react';
import { SignalDNA } from '@/services/multiIntelligenceCore';
import { useToast } from '@/hooks/use-toast';

interface AutoJournalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signals: (SignalDNA & { id: string, livePrice: number })[];
}

interface JournalEntry {
  id: string;
  signalId: string;
  timestamp: string;
  pair: string;
  type: string;
  entry: number;
  sl: number;
  tp: number;
  confidence: number;
  reasoning: string;
  outcome: 'pending' | 'win' | 'loss';
  pips: number;
  lessons: string;
}

const AutoJournalModal: React.FC<AutoJournalModalProps> = ({
  open,
  onOpenChange,
  signals
}) => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<string>('');
  const [reasoning, setReasoning] = useState('');
  const [outcome, setOutcome] = useState<'pending' | 'win' | 'loss'>('pending');
  const [pips, setPips] = useState(0);
  const [lessons, setLessons] = useState('');
  const { toast } = useToast();

  const createJournalEntry = () => {
    if (!selectedSignal) {
      toast({
        title: "Select Signal",
        description: "Please select a signal to journal about",
        variant: "destructive"
      });
      return;
    }

    const signal = signals.find(s => s.id === selectedSignal);
    if (!signal) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      signalId: selectedSignal,
      timestamp: new Date().toISOString(),
      pair: signal.symbol,
      type: signal.type,
      entry: typeof signal.structure.entry === 'number' ? signal.structure.entry : parseFloat(signal.structure.entry.toString()),
      sl: typeof signal.structure.stopLoss === 'number' ? signal.structure.stopLoss : parseFloat(signal.structure.stopLoss.toString()),
      tp: typeof signal.structure.takeProfit === 'number' ? signal.structure.takeProfit : parseFloat(signal.structure.takeProfit.toString()),
      confidence: signal.confidence,
      reasoning,
      outcome,
      pips,
      lessons
    };

    setJournalEntries(prev => [entry, ...prev]);
    
    // Reset form
    setSelectedSignal('');
    setReasoning('');
    setOutcome('pending');
    setPips(0);
    setLessons('');

    toast({
      title: "Journal Entry Created",
      description: `Added entry for ${signal.symbol} ${signal.type}`,
    });
  };

  const exportToPDF = () => {
    // Create a simple text export for now
    const content = journalEntries.map(entry => {
      return `
Signal: ${entry.pair} ${entry.type}
Date: ${new Date(entry.timestamp).toLocaleDateString()}
Entry: ${entry.entry}
Stop Loss: ${entry.sl}
Take Profit: ${entry.tp}
Confidence: ${entry.confidence}%
Reasoning: ${entry.reasoning}
Outcome: ${entry.outcome}
Pips: ${entry.pips}
Lessons: ${entry.lessons}
---
`;
    }).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-journal-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Journal Exported",
      description: "Your trading journal has been downloaded",
    });
  };

  const getPerformanceStats = () => {
    const totalEntries = journalEntries.length;
    const completedEntries = journalEntries.filter(e => e.outcome !== 'pending');
    const wins = journalEntries.filter(e => e.outcome === 'win').length;
    const losses = journalEntries.filter(e => e.outcome === 'loss').length;
    const winRate = completedEntries.length > 0 ? (wins / completedEntries.length) * 100 : 0;
    const totalPips = journalEntries.reduce((sum, entry) => sum + entry.pips, 0);

    return { totalEntries, wins, losses, winRate, totalPips };
  };

  const stats = getPerformanceStats();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-gray-950 border-green-500/30">
        <DialogHeader>
          <DialogTitle className="text-green-400 text-xl flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            🎮 Auto-Journal System
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Performance Dashboard */}
          <Card className="bg-gradient-to-r from-green-950/20 via-blue-950/20 to-green-950/20 border border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400 text-lg">Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.totalEntries}</div>
                  <div className="text-sm text-gray-400">Total Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.wins}</div>
                  <div className="text-sm text-gray-400">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.losses}</div>
                  <div className="text-sm text-gray-400">Losses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{stats.winRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.totalPips > 0 ? '+' : ''}{stats.totalPips}</div>
                  <div className="text-sm text-gray-400">Total Pips</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create New Entry */}
          <Card className="bg-gray-900/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Create Journal Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Select Signal</Label>
                <select
                  value={selectedSignal}
                  onChange={(e) => setSelectedSignal(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                >
                  <option value="">Choose a signal...</option>
                  {signals.map(signal => (
                    <option key={signal.id} value={signal.id}>
                      {signal.symbol} {signal.type} - {signal.confidence}% confidence
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Why did you enter?</Label>
                  <Textarea
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    placeholder="Your reasoning for taking this trade..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300">Outcome</Label>
                    <select
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value as 'pending' | 'win' | 'loss')}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="win">Win</option>
                      <option value="loss">Loss</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Pips Gained/Lost</Label>
                    <Input
                      type="number"
                      value={pips}
                      onChange={(e) => setPips(Number(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Lessons Learned</Label>
                <Textarea
                  value={lessons}
                  onChange={(e) => setLessons(e.target.value)}
                  placeholder="What did you learn from this trade?"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <Button onClick={createJournalEntry} className="w-full bg-blue-600 hover:bg-blue-700">
                <BookOpen className="w-4 h-4 mr-2" />
                Add to Journal
              </Button>
            </CardContent>
          </Card>

          {/* Journal Entries List */}
          <Card className="bg-gray-900/50 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Journal Entries ({journalEntries.length})
              </CardTitle>
              <Button 
                onClick={exportToPDF} 
                variant="outline" 
                size="sm"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-auto">
                {journalEntries.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    No journal entries yet. Create your first entry above!
                  </div>
                ) : (
                  journalEntries.map(entry => (
                    <div key={entry.id} className="p-4 bg-gray-800/50 rounded border border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-semibold">
                            {entry.pair} {entry.type}
                          </h4>
                          <div className="text-sm text-gray-400">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={`${
                            entry.outcome === 'win' ? 'bg-green-500/20 text-green-400' :
                            entry.outcome === 'loss' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {entry.outcome}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-400">
                            {entry.pips > 0 ? '+' : ''}{entry.pips} pips
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-300 mb-2">
                        <strong>Reasoning:</strong> {entry.reasoning || 'No reasoning provided'}
                      </div>
                      
                      {entry.lessons && (
                        <div className="text-sm text-gray-300">
                          <strong>Lessons:</strong> {entry.lessons}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutoJournalModal;
