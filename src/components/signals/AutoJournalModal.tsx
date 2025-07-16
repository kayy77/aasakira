
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, FileText, Save } from 'lucide-react';
import { SignalDNA } from '@/services/multiIntelligenceCore';
import { useToast } from '@/hooks/use-toast';

interface AutoJournalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signals: SignalDNA[];
}

interface JournalEntry {
  id: string;
  signal: SignalDNA;
  whyEntered: string;
  lessonsLearned: string;
  outcome: 'pending' | 'win' | 'loss';
  pips: number;
  date: string;
}

const AutoJournalModal: React.FC<AutoJournalModalProps> = ({
  open,
  onOpenChange,
  signals
}) => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<SignalDNA | null>(null);
  const [whyEntered, setWhyEntered] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const { toast } = useToast();

  const createJournalEntry = () => {
    if (!selectedSignal) return;
    
    const entry: JournalEntry = {
      id: Date.now().toString(),
      signal: selectedSignal,
      whyEntered,
      lessonsLearned,
      outcome: 'pending',
      pips: 0,
      date: new Date().toLocaleDateString()
    };
    
    setJournalEntries(prev => [entry, ...prev]);
    setWhyEntered('');
    setLessonsLearned('');
    setSelectedSignal(null);
    
    toast({
      title: "Journal Entry Created",
      description: `${selectedSignal.symbol} trade journaled successfully`,
    });
  };

  const exportToPDF = () => {
    const content = journalEntries.map(entry => `
      Trade: ${entry.signal.symbol} ${entry.signal.type}
      Date: ${entry.date}
      Entry: ${entry.signal.structure.entry}
      
      Why I Entered:
      ${entry.whyEntered}
      
      Lessons Learned:
      ${entry.lessonsLearned}
      
      Outcome: ${entry.outcome}
      ${entry.outcome !== 'pending' ? `Pips: ${entry.pips}` : ''}
      
      ---
    `).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-journal-${new Date().toLocaleDateString()}.txt`;
    a.click();
    
    toast({
      title: "Journal Exported",
      description: "Your trading journal has been downloaded",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-gray-950 border-green-500/30">
        <DialogHeader>
          <DialogTitle className="text-green-400 text-xl flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            📈 Auto-Journal Linkage
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Quick Journal Entry */}
          <Card className="bg-gradient-to-r from-green-950/20 to-emerald-950/20 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-300">Create Journal Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Select Signal</label>
                <div className="flex flex-wrap gap-2">
                  {signals.slice(0, 5).map((signal) => (
                    <Button
                      key={signal.id || Math.random()}
                      variant={selectedSignal === signal ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSignal(signal)}
                      className="border-green-500/30"
                    >
                      {signal.symbol} {signal.type}
                    </Button>
                  ))}
                </div>
              </div>
              
              {selectedSignal && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Why did you enter this trade?</label>
                    <Textarea
                      value={whyEntered}
                      onChange={(e) => setWhyEntered(e.target.value)}
                      placeholder="I entered because the setup showed strong confluence with..."
                      className="bg-gray-900/50 border-green-500/30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">What did you learn?</label>
                    <Textarea
                      value={lessonsLearned}
                      onChange={(e) => setLessonsLearned(e.target.value)}
                      placeholder="Key lessons and observations from this trade..."
                      className="bg-gray-900/50 border-green-500/30"
                    />
                  </div>
                  
                  <Button onClick={createJournalEntry} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Journal Entry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Journal Entries */}
          <Card className="bg-gradient-to-r from-gray-950/20 to-gray-900/20 border-gray-500/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-300 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Journal Entries ({journalEntries.length})
              </CardTitle>
              <Button onClick={exportToPDF} variant="outline" size="sm" className="border-blue-500/30">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {journalEntries.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No journal entries yet. Create your first entry above!</p>
                ) : (
                  journalEntries.map((entry) => (
                    <div key={entry.id} className="p-4 bg-gray-900/50 rounded border border-gray-700/30">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500/20 text-blue-400">
                            {entry.signal.symbol} {entry.signal.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{entry.date}</span>
                        </div>
                        <Badge className={
                          entry.outcome === 'win' ? 'bg-green-500/20 text-green-400' :
                          entry.outcome === 'loss' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }>
                          {entry.outcome}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400 font-medium">Why Entered:</span>
                          <p className="text-gray-300 mt-1">{entry.whyEntered}</p>
                        </div>
                        
                        <div>
                          <span className="text-gray-400 font-medium">Lessons Learned:</span>
                          <p className="text-gray-300 mt-1">{entry.lessonsLearned}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                          <span>Entry: {entry.signal.structure.entry}</span>
                          <span>SL: {entry.signal.structure.stopLoss}</span>
                          <span>TP: {entry.signal.structure.takeProfit}</span>
                          <span>R/R: {entry.signal.structure.rr.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Dashboard Preview */}
          <Card className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">Performance Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-green-400">
                    {journalEntries.filter(e => e.outcome === 'win').length}
                  </div>
                  <div className="text-sm text-gray-400">Wins</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-red-400">
                    {journalEntries.filter(e => e.outcome === 'loss').length}
                  </div>
                  <div className="text-sm text-gray-400">Losses</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-400">
                    {journalEntries.filter(e => e.outcome === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-400">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutoJournalModal;
