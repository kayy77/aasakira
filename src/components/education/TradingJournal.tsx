
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  Target,
  Brain,
  Star,
  Filter,
  Search
} from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  exit: number;
  result: 'Win' | 'Loss' | 'Breakeven';
  pips: number;
  setup: string;
  emotions: string;
  lessons: string;
  rating: number; // 1-5 stars
  tags: string[];
}

const TradingJournal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Win' | 'Loss' | 'Breakeven'>('All');
  
  const [newEntry, setNewEntry] = useState<Partial<JournalEntry>>({
    pair: '',
    type: 'BUY',
    entry: 0,
    exit: 0,
    setup: '',
    emotions: '',
    lessons: '',
    rating: 3,
    tags: []
  });

  // Load sample data
  useEffect(() => {
    const sampleEntries: JournalEntry[] = [
      {
        id: '1',
        date: '2024-01-15',
        pair: 'EURUSD',
        type: 'BUY',
        entry: 1.0850,
        exit: 1.0920,
        result: 'Win',
        pips: 70,
        setup: 'SMC Break of Structure + Order Block retest',
        emotions: 'Confident entry, patient with the setup',
        lessons: 'Waiting for proper retest paid off',
        rating: 5,
        tags: ['SMC', 'Order Block', 'Patience']
      },
      {
        id: '2',
        date: '2024-01-14',
        pair: 'GBPUSD',
        type: 'SELL',
        entry: 1.2680,
        exit: 1.2650,
        result: 'Loss',
        pips: -30,
        setup: 'False breakout - caught the wrong side',
        emotions: 'FOMO entry, rushed decision',
        lessons: 'Need to wait for confirmation before entry',
        rating: 2,
        tags: ['FOMO', 'False Breakout', 'Lesson']
      }
    ];
    setEntries(sampleEntries);
  }, []);

  const addEntry = () => {
    if (!newEntry.pair || !newEntry.setup) return;
    
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      pair: newEntry.pair!,
      type: newEntry.type!,
      entry: newEntry.entry!,
      exit: newEntry.exit!,
      result: newEntry.exit! > newEntry.entry! ? 
        (newEntry.type === 'BUY' ? 'Win' : 'Loss') : 
        (newEntry.type === 'BUY' ? 'Loss' : 'Win'),
      pips: Math.abs((newEntry.exit! - newEntry.entry!) * (newEntry.pair!.includes('JPY') ? 100 : 10000)),
      setup: newEntry.setup!,
      emotions: newEntry.emotions || '',
      lessons: newEntry.lessons || '',
      rating: newEntry.rating!,
      tags: newEntry.tags || []
    };
    
    setEntries([entry, ...entries]);
    setNewEntry({
      pair: '',
      type: 'BUY',
      entry: 0,
      exit: 0,
      setup: '',
      emotions: '',
      lessons: '',
      rating: 3,
      tags: []
    });
    setShowAddForm(false);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.setup.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || entry.result === filterType;
    return matchesSearch && matchesFilter;
  });

  const getStats = () => {
    const totalTrades = entries.length;
    const wins = entries.filter(e => e.result === 'Win').length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const totalPips = entries.reduce((sum, e) => {
      return sum + (e.result === 'Win' ? e.pips : -e.pips);
    }, 0);
    const avgRating = entries.length > 0 ? 
      entries.reduce((sum, e) => sum + e.rating, 0) / entries.length : 0;
    
    return { totalTrades, winRate, totalPips, avgRating };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Journal</h1>
            <p className="text-gray-400">Track, analyze, and improve your trading performance</p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Trade
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.totalTrades}</div>
            <div className="text-sm text-gray-400">Total Trades</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.winRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${stats.totalPips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.totalPips > 0 ? '+' : ''}{stats.totalPips.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">Total Pips</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.avgRating.toFixed(1)}⭐</div>
            <div className="text-sm text-gray-400">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Trade Form */}
      {showAddForm && (
        <Card className="glass-card border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white">Add New Trade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Pair</label>
                <Input
                  value={newEntry.pair}
                  onChange={(e) => setNewEntry({...newEntry, pair: e.target.value})}
                  placeholder="EURUSD"
                  className="bg-gray-800/50 border-gray-600"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Type</label>
                <select
                  value={newEntry.type}
                  onChange={(e) => setNewEntry({...newEntry, type: e.target.value as 'BUY' | 'SELL'})}
                  className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded text-white"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setNewEntry({...newEntry, rating: star})}
                      className={`w-5 h-5 ${star <= (newEntry.rating || 3) ? 'text-yellow-400' : 'text-gray-600'}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Entry Price</label>
                <Input
                  type="number"
                  step="0.00001"
                  value={newEntry.entry}
                  onChange={(e) => setNewEntry({...newEntry, entry: parseFloat(e.target.value)})}
                  className="bg-gray-800/50 border-gray-600"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Exit Price</label>
                <Input
                  type="number"
                  step="0.00001"
                  value={newEntry.exit}
                  onChange={(e) => setNewEntry({...newEntry, exit: parseFloat(e.target.value)})}
                  className="bg-gray-800/50 border-gray-600"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Setup Description</label>
              <Input
                value={newEntry.setup}
                onChange={(e) => setNewEntry({...newEntry, setup: e.target.value})}
                placeholder="SMC Break of Structure + Order Block retest"
                className="bg-gray-800/50 border-gray-600"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Emotions</label>
                <Textarea
                  value={newEntry.emotions}
                  onChange={(e) => setNewEntry({...newEntry, emotions: e.target.value})}
                  placeholder="How did you feel during this trade?"
                  className="bg-gray-800/50 border-gray-600"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Lessons Learned</label>
                <Textarea
                  value={newEntry.lessons}
                  onChange={(e) => setNewEntry({...newEntry, lessons: e.target.value})}
                  placeholder="What did you learn from this trade?"
                  className="bg-gray-800/50 border-gray-600"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={addEntry} className="bg-green-600 hover:bg-green-700">
                Add Trade
              </Button>
              <Button 
                onClick={() => setShowAddForm(false)} 
                variant="outline" 
                className="border-gray-600"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search trades..."
            className="w-64 bg-gray-800/50 border-gray-600"
          />
        </div>
        
        <div className="flex gap-2">
          {(['All', 'Win', 'Loss', 'Breakeven'] as const).map(filter => (
            <Button
              key={filter}
              onClick={() => setFilterType(filter)}
              variant={filterType === filter ? 'default' : 'outline'}
              size="sm"
              className={filterType === filter ? 'bg-blue-600' : 'border-gray-600'}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {filteredEntries.map(entry => (
          <Card key={entry.id} className="glass-card hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {entry.type === 'BUY' ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    <span className="font-bold text-white text-lg">{entry.pair}</span>
                    <Badge className={entry.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {entry.type}
                    </Badge>
                  </div>
                  
                  <Badge className={
                    entry.result === 'Win' ? 'bg-green-500/20 text-green-400' :
                    entry.result === 'Loss' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }>
                    {entry.result}
                  </Badge>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({length: entry.rating}).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    {entry.date}
                  </div>
                  <div className={`text-lg font-bold ${entry.result === 'Win' ? 'text-green-400' : entry.result === 'Loss' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {entry.result === 'Win' ? '+' : entry.result === 'Loss' ? '-' : ''}
                    {entry.pips} pips
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Entry: <span className="text-white font-mono">{entry.entry}</span></p>
                  <p className="text-gray-400 mb-1">Exit: <span className="text-white font-mono">{entry.exit}</span></p>
                  <p className="text-gray-400 mb-2">Setup: <span className="text-blue-300">{entry.setup}</span></p>
                </div>
                
                <div>
                  {entry.emotions && (
                    <p className="text-gray-400 mb-1">
                      💭 Emotions: <span className="text-yellow-300">{entry.emotions}</span>
                    </p>
                  )}
                  {entry.lessons && (
                    <p className="text-gray-400">
                      📚 Lessons: <span className="text-green-300">{entry.lessons}</span>
                    </p>
                  )}
                </div>
              </div>
              
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {entry.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredEntries.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Journal Entries</h3>
            <p className="text-gray-400 mb-4">Start documenting your trades to track your progress</p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Trade
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TradingJournal;
