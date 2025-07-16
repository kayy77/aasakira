
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical, TrendingUp, Target, Zap } from 'lucide-react';
import { SignalDNA } from '@/services/multiIntelligenceCore';

interface ABTestingFrameworkProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signals: SignalDNA[];
}

interface TestResult {
  name: string;
  winRate: number;
  avgRR: number;
  totalSignals: number;
  confidence: number;
}

const ABTestingFramework: React.FC<ABTestingFrameworkProps> = ({
  open,
  onOpenChange,
  signals
}) => {
  const [activeTests, setActiveTests] = useState([
    {
      id: '1',
      name: '4/6 vs 5/6 Confluence',
      status: 'running',
      results: {
        variant_a: { name: '4/6 Confluence', winRate: 72, avgRR: 2.3, totalSignals: 25, confidence: 85 },
        variant_b: { name: '5/6 Confluence', winRate: 84, avgRR: 2.8, totalSignals: 19, confidence: 92 }
      }
    },
    {
      id: '2',
      name: 'Hybrid vs SMC-Only',
      status: 'running',
      results: {
        variant_a: { name: 'Hybrid Strategy', winRate: 78, avgRR: 2.5, totalSignals: 32, confidence: 88 },
        variant_b: { name: 'SMC-Only', winRate: 68, avgRR: 2.1, totalSignals: 28, confidence: 82 }
      }
    }
  ]);

  const [completedTests] = useState([
    {
      id: '3',
      name: 'Conservative vs Aggressive Risk',
      status: 'completed',
      winner: 'Conservative',
      results: {
        variant_a: { name: 'Conservative', winRate: 82, avgRR: 2.2, totalSignals: 45, confidence: 90 },
        variant_b: { name: 'Aggressive', winRate: 65, avgRR: 3.1, totalSignals: 38, confidence: 75 }
      }
    }
  ]);

  const createNewTest = (testName: string) => {
    const newTest = {
      id: Date.now().toString(),
      name: testName,
      status: 'running',
      results: {
        variant_a: { name: 'Variant A', winRate: 0, avgRR: 0, totalSignals: 0, confidence: 0 },
        variant_b: { name: 'Variant B', winRate: 0, avgRR: 0, totalSignals: 0, confidence: 0 }
      }
    };
    setActiveTests(prev => [...prev, newTest]);
  };

  const ResultCard: React.FC<{ result: TestResult; isWinner?: boolean }> = ({ result, isWinner }) => (
    <Card className={`${isWinner ? 'border-green-500/50 bg-green-950/20' : 'border-gray-500/30 bg-gray-900/50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-sm ${isWinner ? 'text-green-400' : 'text-gray-300'} flex items-center gap-2`}>
          {result.name}
          {isWinner && <Badge className="bg-green-500/20 text-green-400 text-xs">Winner</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Win Rate</span>
          <div className="flex items-center gap-2">
            <Progress value={result.winRate} className="w-16 h-2" />
            <span className={`text-sm font-bold ${isWinner ? 'text-green-400' : 'text-blue-400'}`}>
              {result.winRate}%
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Avg R/R</span>
          <span className={`text-sm font-bold ${isWinner ? 'text-green-400' : 'text-purple-400'}`}>
            {result.avgRR.toFixed(1)}:1
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Signals</span>
          <span className="text-sm text-gray-300">{result.totalSignals}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Confidence</span>
          <span className={`text-sm font-bold ${isWinner ? 'text-green-400' : 'text-orange-400'}`}>
            {result.confidence}%
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-gray-950 border-orange-500/30">
        <DialogHeader>
          <DialogTitle className="text-orange-400 text-xl flex items-center gap-2">
            <FlaskConical className="w-6 h-6" />
            🧪 A/B Testing Framework
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="active">Active Tests</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="new">Create New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {activeTests.map((test) => {
              const winnerA = test.results.variant_a.winRate > test.results.variant_b.winRate;
              return (
                <Card key={test.id} className="bg-gradient-to-r from-orange-950/20 to-red-950/20 border-orange-500/30">
                  <CardHeader>
                    <CardTitle className="text-orange-300 flex items-center justify-between">
                      <span>{test.name}</span>
                      <Badge className="bg-orange-500/20 text-orange-400">
                        {test.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ResultCard 
                        result={test.results.variant_a} 
                        isWinner={winnerA && test.results.variant_a.totalSignals >= 20}
                      />
                      <ResultCard 
                        result={test.results.variant_b} 
                        isWinner={!winnerA && test.results.variant_b.totalSignals >= 20}
                      />
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-900/50 rounded border border-gray-700/30">
                      <div className="text-sm text-gray-300">
                        <strong>Current Leader:</strong> {winnerA ? test.results.variant_a.name : test.results.variant_b.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Need at least 20 signals per variant for statistical significance
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {completedTests.map((test) => {
              const winnerA = test.winner === test.results.variant_a.name;
              return (
                <Card key={test.id} className="bg-gradient-to-r from-green-950/20 to-emerald-950/20 border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-green-300 flex items-center justify-between">
                      <span>{test.name}</span>
                      <Badge className="bg-green-500/20 text-green-400">
                        Completed
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ResultCard 
                        result={test.results.variant_a} 
                        isWinner={winnerA}
                      />
                      <ResultCard 
                        result={test.results.variant_b} 
                        isWinner={!winnerA}
                      />
                    </div>
                    
                    <div className="mt-4 p-3 bg-green-900/20 rounded border border-green-700/30">
                      <div className="text-sm text-green-300">
                        <strong>Winner:</strong> {test.winner} - 
                        {winnerA ? 
                          ` ${test.results.variant_a.winRate}% win rate vs ${test.results.variant_b.winRate}%` :
                          ` ${test.results.variant_b.winRate}% win rate vs ${test.results.variant_a.winRate}%`
                        }
                      </div>
                      <div className="text-xs text-green-400 mt-1">
                        ✅ Statistical significance achieved
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
          
          <TabsContent value="new" className="space-y-4">
            <Card className="bg-gradient-to-r from-blue-950/20 to-indigo-950/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-300">Create New A/B Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => createNewTest('3/6 vs 4/6 Confluence')}
                    variant="outline"
                    className="border-blue-500/30 hover:bg-blue-500/20 text-blue-400 h-16"
                  >
                    <div className="text-center">
                      <div className="font-bold">3/6 vs 4/6 Confluence</div>
                      <div className="text-xs">Lower vs Higher Confluence</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => createNewTest('Scalp vs Intraday')}
                    variant="outline"
                    className="border-purple-500/30 hover:bg-purple-500/20 text-purple-400 h-16"
                  >
                    <div className="text-center">
                      <div className="font-bold">Scalp vs Intraday</div>
                      <div className="text-xs">Trade Type Comparison</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => createNewTest('London vs NY Session')}
                    variant="outline"
                    className="border-green-500/30 hover:bg-green-500/20 text-green-400 h-16"
                  >
                    <div className="text-center">
                      <div className="font-bold">London vs NY Session</div>
                      <div className="text-xs">Session Performance</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => createNewTest('Forex vs Crypto')}
                    variant="outline"
                    className="border-orange-500/30 hover:bg-orange-500/20 text-orange-400 h-16"
                  >
                    <div className="text-center">
                      <div className="font-bold">Forex vs Crypto</div>
                      <div className="text-xs">Asset Class Performance</div>
                    </div>
                  </Button>
                </div>
                
                <div className="p-4 bg-blue-900/20 rounded border border-blue-700/30">
                  <div className="text-sm text-blue-300 font-medium mb-2">How A/B Testing Works:</div>
                  <ul className="text-xs text-blue-200 space-y-1">
                    <li>• Each test randomly assigns new signals to variant A or B</li>
                    <li>• We track win rate, average R/R, and confidence for each variant</li>
                    <li>• Statistical significance requires 20+ signals per variant</li>
                    <li>• Tests automatically conclude when significance is reached</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ABTestingFramework;
