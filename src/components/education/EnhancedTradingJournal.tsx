
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarIcon, 
  Plus, 
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Star,
  Eye,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { groqService } from '@/services/groqService';

interface TradeEntry {
  id: string;
  date: Date;
  instrumentType: 'Forex' | 'Crypto' | 'Stocks' | 'Commodities';
  symbol: string;
  side: 'Long' | 'Short';
  entryPrice: number;
  exitPrice?: number;
  lotSize: number;
  fees: number;
  outcome: 'WIN' | 'LOSS' | 'BE' | 'OPEN';
  pnl?: number;
  aiReview?: string;
  aiRating?: number;
}

const EnhancedTradingJournal: React.FC = () => {
  const [entries, setEntries] = useState<TradeEntry[]>([]);
  const [isAddingTrade, setIsAddingTrade] = useState(false);
  const [reviewingTradeId, setReviewingTradeId] = useState<string | null>(null);
  const [newTrade, setNewTrade] = useState({
    instrumentType: 'Forex' as TradeEntry['instrumentType'],
    symbol: '',
    side: 'Long' as TradeEntry['side'],
    date: new Date(),
    entryPrice: '',
    exitPrice: '',
    lotSize: '',
    fees: ''
  });
  const { toast } = useToast();

  const calculatePnL = (entry: number, exit: number, side: string, lotSize: number, fees: number) => {
    const priceDiff = side === 'Long' ? exit - entry : entry - exit;
    const grossPnL = priceDiff * lotSize;
    return grossPnL - fees;
  };

  const determineOutcome = (pnl: number): TradeEntry['outcome'] => {
    if (pnl > 0) return 'WIN';
    if (pnl < 0) return 'LOSS';
    return 'BE';
  };

  const addTrade = () => {
    if (!newTrade.symbol || !newTrade.entryPrice || !newTrade.lotSize) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const entryPrice = parseFloat(newTrade.entryPrice);
    const exitPrice = newTrade.exitPrice ? parseFloat(newTrade.exitPrice) : undefined;
    const lotSize = parseFloat(newTrade.lotSize);
    const fees = parseFloat(newTrade.fees) || 0;

    let pnl: number | undefined;
    let outcome: TradeEntry['outcome'] = 'OPEN';

    if (exitPrice) {
      pnl = calculatePnL(entryPrice, exitPrice, newTrade.side, lotSize, fees);
      outcome = determineOutcome(pnl);
    }

    const trade: TradeEntry = {
      id: Date.now().toString(),
      date: newTrade.date,
      instrumentType: newTrade.instrumentType,
      symbol: newTrade.symbol.toUpperCase(),
      side: newTrade.side,
      entryPrice,
      exitPrice,
      lotSize,
      fees,
      outcome,
      pnl
    };

    setEntries([trade, ...entries]);
    
    // Reset form
    setNewTrade({
      instrumentType: 'Forex',
      symbol: '',
      side: 'Long',
      date: new Date(),
      entryPrice: '',
      exitPrice: '',
      lotSize: '',
      fees: ''
    });
    
    setIsAddingTrade(false);
    
    toast({
      title: "Trade Added",
      description: `${trade.symbol} ${trade.side} trade logged successfully`,
    });
  };

  const getAIReview = async (trade: TradeEntry) => {
    setReviewingTradeId(trade.id);
    
    try {
      const riskReward = trade.exitPrice && trade.pnl ? 
        Math.abs(trade.pnl) / (Math.abs(trade.entryPrice - (trade.side === 'Long' ? trade.entryPrice * 0.98 : trade.entryPrice * 1.02))) : 0;

      const prompt = `As an elite trading mentor, analyze this trade and provide a comprehensive review:

Trade Details:
- Instrument: ${trade.instrumentType} - ${trade.symbol}
- Direction: ${trade.side}
- Entry Price: ${trade.entryPrice}
- Exit Price: ${trade.exitPrice || 'Still Open'}
- Lot Size: ${trade.lotSize}
- Fees: $${trade.fees}
- P&L: ${trade.pnl ? `$${trade.pnl.toFixed(2)}` : 'N/A'}
- Outcome: ${trade.outcome}
- R:R Ratio: ${riskReward.toFixed(2)}

Provide:
1. 📊 Trade Execution Analysis
2. ⚖️ Risk Management Assessment  
3. 🎯 Entry & Exit Quality
4. 💡 Key Lessons & Improvements
5. 🏆 Overall Rating (1-10)

Be direct and tactical. Focus on what went right and what needs improvement.`;

      const response = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 800
      });

      // Extract rating from response
      const ratingMatch = response.match(/(\d+)\/10|rating.*?(\d+)|score.*?(\d+)/i);
      const rating = ratingMatch ? parseInt(ratingMatch[1] || ratingMatch[2] || ratingMatch[3]) : 7;

      // Update the trade with AI review
      setEntries(prevEntries => 
        prevEntries.map(entry => 
          entry.id === trade.id 
            ? { ...entry, aiReview: response, aiRating: rating }
            : entry
        )
      );

      toast({
        title: "AI Review Complete",
        description: `Trade rated ${rating}/10`,
      });

    } catch (error) {
      console.error('Error getting AI review:', error);
      toast({
        title: "Review Failed",
        description: "Unable to get AI review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setReviewingTradeId(null);
    }
  };

  const getOutcomeColor = (outcome: TradeEntry['outcome']) => {
    switch (outcome) {
      case 'WIN': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'LOSS': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'BE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getOutcomeIcon = (outcome: TradeEntry['outcome']) => {
    switch (outcome) {
      case 'WIN': return <TrendingUp className="w-4 h-4" />;
      case 'LOSS': return <TrendingDown className="w-4 h-4" />;
      case 'BE': return <Target className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const totalPnL = entries.reduce((sum, entry) => sum + (entry.pnl || 0), 0);
  const winRate = entries.length > 0 ? 
    (entries.filter(e => e.outcome === 'WIN').length / entries.filter(e => e.outcome !== 'OPEN').length * 100) || 0 : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="glass-card border-purple-500/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${totalPnL.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">TOTAL P&L</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{winRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-400">WIN RATE</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{entries.length}</div>
              <div className="text-xs text-gray-400">TOTAL TRADES</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {entries.filter(e => e.outcome === 'OPEN').length}
              </div>
              <div className="text-xs text-gray-400">OPEN TRADES</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="add" className="data-[state=active]:bg-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Trade
          </TabsTrigger>
          <TabsTrigger value="journal" className="data-[state=active]:bg-purple-600">
            <Target className="w-4 h-4 mr-2" />
            Journal ({entries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card className="glass-card border-purple-500/20 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                Add Manual Trade
              </CardTitle>
              <p className="text-gray-400 text-sm">Easily log trades manually to keep your journal up to date.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Instrument Type</Label>
                  <Select value={newTrade.instrumentType} onValueChange={(value) => setNewTrade({...newTrade, instrumentType: value as TradeEntry['instrumentType']})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="Forex">Forex</SelectItem>
                      <SelectItem value="Crypto">Crypto</SelectItem>
                      <SelectItem value="Stocks">Stocks</SelectItem>
                      <SelectItem value="Commodities">Commodities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Symbol</Label>
                  <Input
                    placeholder="e.g. NOM2"
                    value={newTrade.symbol}
                    onChange={(e) => setNewTrade({...newTrade, symbol: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Date & Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-gray-800 border-gray-600 text-white hover:bg-gray-700",
                          !newTrade.date && "text-gray-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTrade.date ? format(newTrade.date, "PPP") : "Select Date & Time"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newTrade.date}
                        onSelect={(date) => setNewTrade({...newTrade, date: date || new Date()})}
                        initialFocus
                        className="bg-gray-800 border-gray-600"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-gray-300">Side</Label>
                  <Select value={newTrade.side} onValueChange={(value) => setNewTrade({...newTrade, side: value as TradeEntry['side']})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="Long">Long</SelectItem>
                      <SelectItem value="Short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Lot size</Label>
                  <Input
                    placeholder="100"
                    type="number"
                    step="0.01"
                    value={newTrade.lotSize}
                    onChange={(e) => setNewTrade({...newTrade, lotSize: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Entry Price</Label>
                  <Input
                    placeholder="$0.00"
                    type="number"
                    step="0.00001"
                    value={newTrade.entryPrice}
                    onChange={(e) => setNewTrade({...newTrade, entryPrice: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Exit Price</Label>
                  <Input
                    placeholder="$0.00"
                    type="number"
                    step="0.00001"
                    value={newTrade.exitPrice}
                    onChange={(e) => setNewTrade({...newTrade, exitPrice: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Fees & Commissions</Label>
                  <Input
                    placeholder="$5"
                    type="number"
                    step="0.01"
                    value={newTrade.fees}
                    onChange={(e) => setNewTrade({...newTrade, fees: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingTrade(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addTrade}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal">
          <div className="space-y-4">
            {entries.length === 0 ? (
              <Card className="glass-card border-purple-500/20">
                <CardContent className="p-12 text-center">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Trades Yet</h3>
                  <p className="text-gray-500">Add your first trade to start building your journal.</p>
                </CardContent>
              </Card>
            ) : (
              entries.map((trade) => (
                <Card key={trade.id} className="glass-card border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge className={getOutcomeColor(trade.outcome)}>
                          {getOutcomeIcon(trade.outcome)}
                          {trade.outcome}
                        </Badge>
                        <span className="text-white font-medium">{trade.side} {trade.symbol}</span>
                        <span className="text-gray-400 text-sm">
                          {format(trade.date, 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${trade.pnl && trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.pnl ? `$${trade.pnl.toFixed(2)}` : 'Open'}
                        </div>
                        {trade.aiRating && (
                          <div className="flex items-center gap-1 text-yellow-400 text-sm">
                            <Star className="w-3 h-3" />
                            {trade.aiRating}/10
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-400">Entry:</span>
                        <div className="text-white font-medium">${trade.entryPrice}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Exit:</span>
                        <div className="text-white font-medium">{trade.exitPrice ? `$${trade.exitPrice}` : 'Open'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Size:</span>
                        <div className="text-white font-medium">{trade.lotSize}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Fees:</span>
                        <div className="text-white font-medium">${trade.fees}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <div className="text-white font-medium">{trade.instrumentType}</div>
                      </div>
                    </div>

                    {trade.aiReview && (
                      <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-4 mb-4">
                        <h4 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          AI Mentor Review ({trade.aiRating}/10):
                        </h4>
                        <div className="text-gray-300 text-sm whitespace-pre-wrap">{trade.aiReview}</div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        onClick={() => getAIReview(trade)}
                        disabled={reviewingTradeId === trade.id || !!trade.aiReview}
                        variant="outline"
                        size="sm"
                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                      >
                        {reviewingTradeId === trade.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Reviewing...
                          </>
                        ) : trade.aiReview ? (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Reviewed
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            Review with AI
                          </>
                        )}
                      </Button>
                    </div>
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

export default EnhancedTradingJournal;
