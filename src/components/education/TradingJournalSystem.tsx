
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertCircle,
  Eye,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { groqService } from '@/services/groqService';

interface JournalEntry {
  id: string;
  date: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  exit?: number;
  stop: number;
  tp: number;
  outcome: 'WIN' | 'LOSS' | 'BE' | 'OPEN';
  reasoning: string;
  screenshot?: File;
  mentorReview?: string;
  tags: string[];
  xpEarned: number;
}

const TradingJournalSystem: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    pair: '',
    direction: 'BUY' as 'BUY' | 'SELL',
    entry: '',
    exit: '',
    stop: '',
    tp: '',
    outcome: 'OPEN' as JournalEntry['outcome'],
    reasoning: '',
    tags: [] as string[]
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const { toast } = useToast();

  const addJournalEntry = async () => {
    if (!newEntry.pair || !newEntry.entry || !newEntry.stop || !newEntry.tp || !newEntry.reasoning) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Get AI mentor review
      const riskReward = Math.abs(Number(newEntry.tp) - Number(newEntry.entry)) / 
                         Math.abs(Number(newEntry.entry) - Number(newEntry.stop));

      const prompt = `Review this trade journal entry as an elite trading mentor:

Trade: ${newEntry.direction} ${newEntry.pair}
Entry: ${newEntry.entry}
Stop: ${newEntry.stop}
TP: ${newEntry.tp}
R:R: ${riskReward.toFixed(2)}
Outcome: ${newEntry.outcome}
Reasoning: ${newEntry.reasoning}

Provide:
1. 🔍 Trade Review (setup quality, timing, execution)
2. ⚠️ Risk Analysis (position sizing, R:R, stop placement)
3. 📊 Pattern Recognition (does this fit their usual behavior?)
4. 💡 Key Improvement Areas

Be direct and tactical. Focus on institutional-level analysis.`;

      const mentorReview = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 800
      });

      // Calculate XP based on trade quality and outcome
      let xpEarned = 0;
      if (newEntry.outcome === 'WIN') xpEarned = riskReward >= 2 ? 20 : 15;
      else if (newEntry.outcome === 'LOSS') xpEarned = riskReward >= 2 ? 5 : 2;
      else if (newEntry.outcome === 'BE') xpEarned = 8;
      else xpEarned = 3; // For open trades

      const entry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        pair: newEntry.pair.toUpperCase(),
        direction: newEntry.direction,
        entry: Number(newEntry.entry),
        exit: newEntry.exit ? Number(newEntry.exit) : undefined,
        stop: Number(newEntry.stop),
        tp: Number(newEntry.tp),
        outcome: newEntry.outcome,
        reasoning: newEntry.reasoning,
        mentorReview,
        tags: newEntry.tags,
        xpEarned
      };

      setEntries([entry, ...entries]);
      
      // Reset form
      setNewEntry({
        pair: '',
        direction: 'BUY',
        entry: '',
        exit: '',
        stop: '',
        tp: '',
        outcome: 'OPEN',
        reasoning: '',
        tags: []
      });

      toast({
        title: "Journal Entry Added",
        description: `+${xpEarned} XP earned`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error adding journal entry:', error);
      toast({
        title: "Error",
        description: "Failed to analyze trade. Entry saved without review.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getOutcomeIcon = (outcome: JournalEntry['outcome']) => {
    switch (outcome) {
      case 'WIN': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'LOSS': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'BE': return <Target className="w-4 h-4 text-yellow-400" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  const getOutcomeColor = (outcome: JournalEntry['outcome']) => {
    switch (outcome) {
      case 'WIN': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'LOSS': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'BE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const totalXP = entries.reduce((sum, entry) => sum + entry.xpEarned, 0);
  const winRate = entries.length > 0 ? 
    (entries.filter(e => e.outcome === 'WIN').length / entries.filter(e => e.outcome !== 'OPEN').length * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="glass-card border-purple-500/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{totalXP}</div>
              <div className="text-xs text-gray-400">TOTAL XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{winRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-400">WIN RATE</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{entries.length}</div>
              <div className="text-xs text-gray-400">ENTRIES</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {entries.filter(e => e.outcome === 'OPEN').length}
              </div>
              <div className="text-xs text-gray-400">OPEN</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="add" className="data-[state=active]:bg-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </TabsTrigger>
          <TabsTrigger value="journal" className="data-[state=active]:bg-purple-600">
            <BookOpen className="w-4 h-4 mr-2" />
            Journal ({entries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card className="glass-card border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                New Trade Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pair" className="text-gray-300">Pair</Label>
                  <Input
                    id="pair"
                    placeholder="EURUSD"
                    value={newEntry.pair}
                    onChange={(e) => setNewEntry({...newEntry, pair: e.target.value.toUpperCase()})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="direction" className="text-gray-300">Direction</Label>
                  <Select value={newEntry.direction} onValueChange={(value: 'BUY' | 'SELL') => setNewEntry({...newEntry, direction: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">BUY</SelectItem>
                      <SelectItem value="SELL">SELL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="outcome" className="text-gray-300">Outcome</Label>
                  <Select value={newEntry.outcome} onValueChange={(value: JournalEntry['outcome']) => setNewEntry({...newEntry, outcome: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">OPEN</SelectItem>
                      <SelectItem value="WIN">WIN</SelectItem>
                      <SelectItem value="LOSS">LOSS</SelectItem>
                      <SelectItem value="BE">BREAK EVEN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="entry" className="text-gray-300">Entry</Label>
                  <Input
                    id="entry"
                    type="number"
                    step="0.00001"
                    value={newEntry.entry}
                    onChange={(e) => setNewEntry({...newEntry, entry: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="exit" className="text-gray-300">Exit (if closed)</Label>
                  <Input
                    id="exit"
                    type="number"
                    step="0.00001"
                    value={newEntry.exit}
                    onChange={(e) => setNewEntry({...newEntry, exit: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="stop" className="text-gray-300">Stop Loss</Label>
                  <Input
                    id="stop"
                    type="number"
                    step="0.00001"
                    value={newEntry.stop}
                    onChange={(e) => setNewEntry({...newEntry, stop: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="tp" className="text-gray-300">Take Profit</Label>
                  <Input
                    id="tp"
                    type="number"
                    step="0.00001"
                    value={newEntry.tp}
                    onChange={(e) => setNewEntry({...newEntry, tp: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reasoning" className="text-gray-300">Trade Reasoning & Analysis</Label>
                <Textarea
                  id="reasoning"
                  placeholder="Explain your trade setup, confluence factors, session timing, and decision-making process..."
                  value={newEntry.reasoning}
                  onChange={(e) => setNewEntry({...newEntry, reasoning: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
                />
              </div>

              <Button
                onClick={addJournalEntry}
                disabled={isAnalyzing}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <Target className="w-4 h-4 mr-2 animate-pulse" />
                    Getting Mentor Review...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Journal
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal">
          <div className="space-y-4">
            {entries.length === 0 ? (
              <Card className="glass-card border-purple-500/20">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Journal Entries</h3>
                  <p className="text-gray-500">Add your first trade to start building your trading journal.</p>
                </CardContent>
              </Card>
            ) : (
              entries.map((entry) => (
                <Card key={entry.id} className="glass-card border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge className={getOutcomeColor(entry.outcome)}>
                          {getOutcomeIcon(entry.outcome)}
                          {entry.outcome}
                        </Badge>
                        <span className="text-white font-medium">{entry.direction} {entry.pair}</span>
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {entry.date}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-purple-400 font-semibold">+{entry.xpEarned} XP</div>
                        <div className="text-gray-400 text-sm">
                          R:R {((entry.tp - entry.entry) / (entry.entry - entry.stop)).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-400">Entry:</span>
                        <div className="text-white font-medium">{entry.entry}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Exit:</span>
                        <div className="text-white font-medium">{entry.exit || 'Open'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Stop:</span>
                        <div className="text-white font-medium">{entry.stop}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">TP:</span>
                        <div className="text-white font-medium">{entry.tp}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-gray-300 font-medium mb-2">Reasoning:</h4>
                      <p className="text-gray-400 text-sm">{entry.reasoning}</p>
                    </div>

                    {entry.mentorReview && (
                      <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-4">
                        <h4 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Mentor Review:
                        </h4>
                        <div className="text-gray-300 text-sm whitespace-pre-wrap">{entry.mentorReview}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingJournalSystem;
