
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { eliteTradeMemory, type TradeRecord } from '@/services/eliteTradeMemory';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

const TradeMemoryPanel: React.FC = () => {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [newTrade, setNewTrade] = useState({
    pair: '',
    type: 'Buy' as 'Buy' | 'Sell',
    entry: '',
    stop: '',
    tp: '',
    result: 'Running' as 'Win' | 'Loss' | 'Breakeven' | 'Running',
    notes: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  const loadTrades = async () => {
    if (!user) return;
    
    try {
      const userTrades = await eliteTradeMemory.getUserTradeHistory(user.id, 20);
      setTrades(userTrades);
    } catch (error) {
      console.error('Failed to load trades:', error);
    }
  };

  const handleAddTrade = async () => {
    if (!user || !newTrade.pair || !newTrade.entry || !newTrade.stop || !newTrade.tp) return;

    const entry = parseFloat(newTrade.entry);
    const stop = parseFloat(newTrade.stop);
    const tp = parseFloat(newTrade.tp);
    
    const riskReward = newTrade.type === 'Buy' 
      ? (tp - entry) / (entry - stop)
      : (entry - tp) / (stop - entry);

    const trade: Omit<TradeRecord, 'id'> = {
      userId: user.id,
      pair: newTrade.pair,
      type: newTrade.type,
      entry,
      stop,
      tp,
      result: newTrade.result,
      violatedFramework: [], // This would be determined by analysis
      notes: newTrade.notes,
      timestamp: new Date(),
      riskReward,
      sessionTime: new Date().toLocaleTimeString(),
      confluence: 0 // This would be determined by signal analysis
    };

    try {
      await eliteTradeMemory.storeTradeRecord(trade);
      await loadTrades();
      setShowAddTrade(false);
      setNewTrade({
        pair: '',
        type: 'Buy',
        entry: '',
        stop: '',
        tp: '',
        result: 'Running',
        notes: ''
      });
    } catch (error) {
      console.error('Failed to add trade:', error);
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'Win': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Loss': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'Breakeven': return <Target className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Win': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'Loss': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'Breakeven': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    }
  };

  return (
    <Card className="glass-card border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span>Trade Memory Bank</span>
          <Button
            onClick={() => setShowAddTrade(!showAddTrade)}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Trade
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showAddTrade && (
          <Card className="mb-4 bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Pair (e.g., EURUSD)"
                  value={newTrade.pair}
                  onChange={(e) => setNewTrade({...newTrade, pair: e.target.value})}
                  className="bg-gray-900 border-gray-600 text-white"
                />
                <Select value={newTrade.type} onValueChange={(value: 'Buy' | 'Sell') => setNewTrade({...newTrade, type: value})}>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buy">Buy</SelectItem>
                    <SelectItem value="Sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <Input
                  placeholder="Entry"
                  value={newTrade.entry}
                  onChange={(e) => setNewTrade({...newTrade, entry: e.target.value})}
                  className="bg-gray-900 border-gray-600 text-white"
                />
                <Input
                  placeholder="Stop Loss"
                  value={newTrade.stop}
                  onChange={(e) => setNewTrade({...newTrade, stop: e.target.value})}
                  className="bg-gray-900 border-gray-600 text-white"
                />
                <Input
                  placeholder="Take Profit"
                  value={newTrade.tp}
                  onChange={(e) => setNewTrade({...newTrade, tp: e.target.value})}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Select value={newTrade.result} onValueChange={(value: any) => setNewTrade({...newTrade, result: value})}>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Running">Running</SelectItem>
                    <SelectItem value="Win">Win</SelectItem>
                    <SelectItem value="Loss">Loss</SelectItem>
                    <SelectItem value="Breakeven">Breakeven</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddTrade} className="bg-green-600 hover:bg-green-700">
                  Save Trade
                </Button>
              </div>
              
              <Input
                placeholder="Notes (optional)"
                value={newTrade.notes}
                onChange={(e) => setNewTrade({...newTrade, notes: e.target.value})}
                className="bg-gray-900 border-gray-600 text-white"
              />
            </CardContent>
          </Card>
        )}

        <ScrollArea className="h-80">
          <div className="space-y-3">
            {trades.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Target className="w-12 h-12 mx-auto mb-2" />
                <p>No trades recorded yet</p>
                <p className="text-sm">Add your first trade to start building memory</p>
              </div>
            ) : (
              trades.map((trade) => (
                <Card key={trade.id} className="bg-gray-800/30 border-gray-700">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getResultColor(trade.result)}>
                          {getResultIcon(trade.result)}
                          <span className="ml-1">{trade.result}</span>
                        </Badge>
                        <span className="text-white font-medium">{trade.pair}</span>
                        <Badge variant="outline" className="text-xs">
                          {trade.type === 'Buy' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {trade.type}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-400">
                        {trade.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Entry:</span>
                        <div className="text-white">{trade.entry}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Stop:</span>
                        <div className="text-white">{trade.stop}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">TP:</span>
                        <div className="text-white">{trade.tp}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">R:R:</span>
                        <div className={`font-medium ${trade.riskReward >= 2 ? 'text-green-400' : trade.riskReward >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {trade.riskReward.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    {trade.violatedFramework.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-red-400">Violations:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {trade.violatedFramework.map((violation, index) => (
                            <Badge key={index} className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                              {violation}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {trade.notes && (
                      <div className="mt-2 text-xs text-gray-300">
                        <span className="text-gray-400">Notes:</span> {trade.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TradeMemoryPanel;
