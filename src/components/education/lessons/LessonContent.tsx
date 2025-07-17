
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  Shield,
  Brain,
  AlertTriangle,
  Eye,
  Lightbulb,
  Calculator,
  BarChart3,
  LineChart,
  Trophy,
  Zap,
  Lock
} from 'lucide-react';

interface LessonContentProps {
  lessonId: string;
  onComplete: () => void;
}

const LessonContent: React.FC<LessonContentProps> = ({ lessonId, onComplete }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);

  const getLessonData = (id: string) => {
    switch (id) {
      case 'forex-101':
        return {
          title: 'Complete Forex Trading Mastery - Foundation Level',
          estimatedTime: '2-3 hours',
          sections: [
            {
              title: 'What is Forex Trading? (Deep Dive)',
              content: (
                <div className="space-y-8">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-blue-400 mb-6 flex items-center">
                      <DollarSign className="w-8 h-8 mr-3" />
                      The $7.5 Trillion Daily Market
                    </h3>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      The Foreign Exchange Market (Forex/FX) is the largest financial market in the world, 
                      with over $7.5 trillion traded daily. To put this in perspective, the entire 
                      New York Stock Exchange trades about $200 billion per day. Forex is 37 times larger.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gray-800/50 p-6 rounded-lg">
                        <h4 className="text-xl font-bold text-white mb-4">Market Participants</h4>
                        <ul className="space-y-3 text-gray-300">
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2">•</span>
                            <div>
                              <strong>Central Banks:</strong> Control monetary policy, interest rates
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2">•</span>
                            <div>
                              <strong>Commercial Banks:</strong> 80% of all forex volume
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2">•</span>
                            <div>
                              <strong>Hedge Funds:</strong> $3+ trillion assets under management
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2">•</span>
                            <div>
                              <strong>Retail Traders:</strong> 5-10% of volume (us!)
                            </div>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-800/50 p-6 rounded-lg">
                        <h4 className="text-xl font-bold text-white mb-4">Why Currencies Move</h4>
                        <ul className="space-y-3 text-gray-300">
                          <li className="flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            <div>
                              <strong>Interest Rate Differentials:</strong> Higher rates = stronger currency
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            <div>
                              <strong>Economic Data:</strong> GDP, inflation, employment
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            <div>
                              <strong>Geopolitical Events:</strong> Wars, elections, trade wars
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            <div>
                              <strong>Market Sentiment:</strong> Risk-on vs risk-off
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-purple-400 mb-6">Currency Pairs - The Complete System</h3>
                    
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <Card className="glass-card border-green-500/20">
                        <CardHeader>
                          <CardTitle className="text-green-400">Major Pairs (80% of volume)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                              <span className="font-bold text-white">EUR/USD</span>
                              <span className="text-green-400">28% of volume</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                              <span className="font-bold text-white">USD/JPY</span>
                              <span className="text-green-400">13% of volume</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                              <span className="font-bold text-white">GBP/USD</span>
                              <span className="text-green-400">11% of volume</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                              <span className="font-bold text-white">USD/CHF</span>
                              <span className="text-green-400">6% of volume</span>
                            </div>
                          </div>
                          <div className="bg-green-500/10 p-4 rounded">
                            <p className="text-xs text-green-300">
                              <strong>Why trade majors:</strong> Highest liquidity, tightest spreads, most predictable
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="glass-card border-yellow-500/20">
                        <CardHeader>
                          <CardTitle className="text-yellow-400">Minor Pairs (Cross Pairs)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                              <span className="font-bold text-white">EUR/GBP</span>
                              <span className="text-yellow-400">No USD</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                              <span className="font-bold text-white">EUR/JPY</span>
                              <span className="text-yellow-400">Volatile</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                              <span className="font-bold text-white">GBP/JPY</span>
                              <span className="text-yellow-400">Beast Mode</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                              <span className="font-bold text-white">AUD/CAD</span>
                              <span className="text-yellow-400">Commodity</span>
                            </div>
                          </div>
                          <div className="bg-yellow-500/10 p-4 rounded">
                            <p className="text-xs text-yellow-300">
                              <strong>Cross pairs:</strong> Higher spreads but unique opportunities
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="glass-card border-red-500/20">
                        <CardHeader>
                          <CardTitle className="text-red-400">Exotic Pairs</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                              <span className="font-bold text-white">USD/TRY</span>
                              <span className="text-red-400">Turkish Lira</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                              <span className="font-bold text-white">USD/ZAR</span>
                              <span className="text-red-400">S. African Rand</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                              <span className="font-bold text-white">EUR/NOK</span>
                              <span className="text-red-400">Norwegian Krone</span>
                            </div>
                          </div>
                          <div className="bg-red-500/10 p-4 rounded">
                            <p className="text-xs text-red-300">
                              <strong>Warning:</strong> Wide spreads, low liquidity, unpredictable
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-orange-400 mb-6">Understanding Pips, Spreads & Lot Sizes</h3>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-4">What is a Pip?</h4>
                        <div className="bg-gray-800/50 p-6 rounded-lg mb-4">
                          <p className="text-gray-300 mb-4">
                            A <strong className="text-orange-400">pip</strong> (percentage in point) is the smallest 
                            price move in a currency pair. For most pairs, it's the 4th decimal place.
                          </p>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded">
                              <span>EUR/USD: 1.2000 → 1.2001</span>
                              <span className="text-orange-400 font-bold">+1 pip</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded">
                              <span>GBP/USD: 1.3500 → 1.3485</span>
                              <span className="text-orange-400 font-bold">-15 pips</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded">
                              <span>USD/JPY: 110.00 → 110.50</span>
                              <span className="text-orange-400 font-bold">+50 pips</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-500/10 p-4 rounded">
                          <h5 className="font-bold text-blue-400 mb-2">Pip Value Calculator</h5>
                          <p className="text-sm text-gray-300">
                            Standard Lot (100,000 units): 1 pip = $10<br/>
                            Mini Lot (10,000 units): 1 pip = $1<br/>
                            Micro Lot (1,000 units): 1 pip = $0.10
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-white mb-4">Spreads & Trading Costs</h4>
                        <div className="bg-gray-800/50 p-6 rounded-lg mb-4">
                          <p className="text-gray-300 mb-4">
                            The <strong className="text-red-400">spread</strong> is the difference between 
                            the bid (sell) and ask (buy) price. This is your immediate trading cost.
                          </p>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded">
                              <span>EUR/USD Spread</span>
                              <span className="text-green-400">0.1-0.3 pips</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded">
                              <span>GBP/JPY Spread</span>
                              <span className="text-yellow-400">1-3 pips</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-500/10 rounded">
                              <span>Exotic Pair Spread</span>
                              <span className="text-red-400">5-50 pips</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-red-500/10 p-4 rounded">
                          <h5 className="font-bold text-red-400 mb-2">⚠️ Critical Knowledge</h5>
                          <p className="text-sm text-gray-300">
                            Wide spreads can kill profitability. A 3-pip spread means you need 
                            3+ pips profit just to break even!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-600/20 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-white mb-6">Global Market Sessions Deep Dive</h3>
                    
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/20">
                          <h4 className="text-xl font-bold text-green-400 mb-4">🇬🇧 London Session</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Time:</span>
                              <span className="text-white">3:00 AM - 12:00 PM EST</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Volume:</span>
                              <span className="text-green-400">43% of daily volume</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Best Pairs:</span>
                              <span className="text-white">EUR/USD, GBP/USD</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Avg Daily Range:</span>
                              <span className="text-white">80-120 pips</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-300 mt-4">
                            London is the forex capital. Major news releases, highest volatility, 
                            institutional flow dominates.
                          </p>
                        </div>

                        <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/20">
                          <h4 className="text-xl font-bold text-blue-400 mb-4">🇺🇸 New York Session</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Time:</span>
                              <span className="text-white">8:00 AM - 5:00 PM EST</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Volume:</span>
                              <span className="text-blue-400">19% of daily volume</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Best Pairs:</span>
                              <span className="text-white">USD/CAD, USD/JPY</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Key Events:</span>
                              <span className="text-white">NFP, FOMC, GDP</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-300 mt-4">
                            US economic data drives USD pairs. Overlap with London creates 
                            maximum volatility.
                          </p>
                        </div>

                        <div className="bg-yellow-500/10 p-6 rounded-lg border border-yellow-500/20">
                          <h4 className="text-xl font-bold text-yellow-400 mb-4">🇯🇵 Asian Session</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Time:</span>
                              <span className="text-white">6:00 PM - 3:00 AM EST</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Volume:</span>
                              <span className="text-yellow-400">21% of daily volume</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Best Pairs:</span>
                              <span className="text-white">USD/JPY, AUD/USD</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Character:</span>
                              <span className="text-white">Range-bound</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-300 mt-4">
                            Lower volatility, range trading opportunities. Tokyo fixes 
                            and carry trades dominate.
                          </p>
                        </div>
                      </div>

                      <div className="bg-purple-500/10 p-6 rounded-lg border border-purple-500/20">
                        <h4 className="text-xl font-bold text-purple-400 mb-4">🔥 Session Overlap Strategy</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-bold text-white mb-3">London + New York (8 AM - 12 PM EST)</h5>
                            <ul className="space-y-2 text-sm text-gray-300">
                              <li>• 50%+ of daily volume occurs here</li>
                              <li>• Major breakouts and trend continuations</li>
                              <li>• Highest probability setups</li>
                              <li>• Institutional order flow peaks</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-bold text-white mb-3">Professional Trading Hours</h5>
                            <ul className="space-y-2 text-sm text-gray-300">
                              <li>• <span className="text-green-400">Best:</span> 8 AM - 12 PM EST</li>
                              <li>• <span className="text-yellow-400">Good:</span> 3 AM - 8 AM EST</li>
                              <li>• <span className="text-red-400">Avoid:</span> 12 PM - 6 PM EST</li>
                              <li>• <span className="text-red-400">Dead:</span> 6 PM - 3 AM EST</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: 'Market Psychology & Institutional Flow',
              content: (
                <div className="space-y-8">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-red-400 mb-6">Who Really Moves The Market</h3>
                    
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-6">The 80/20 Rule</h4>
                        <div className="space-y-4">
                          <div className="bg-gray-800/50 p-6 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-gray-300">Institutional Money</span>
                              <span className="text-red-400 font-bold text-xl">80%</span>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-300">
                              <li>• Central Banks (Fed, ECB, BOJ)</li>
                              <li>• Commercial Banks (Goldman, JPM)</li>
                              <li>• Hedge Funds (Bridgewater, etc.)</li>
                              <li>• Sovereign Wealth Funds</li>
                            </ul>
                          </div>
                          
                          <div className="bg-gray-800/50 p-6 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-gray-300">Retail Traders</span>
                              <span className="text-green-400 font-bold text-xl">20%</span>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-300">
                              <li>• Individual traders (us)</li>
                              <li>• Small funds</li>
                              <li>• Prop trading firms</li>
                              <li>• Signal services</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-white mb-6">Smart Money Concepts</h4>
                        <div className="space-y-4">
                          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                            <h5 className="font-bold text-blue-400 mb-2">Liquidity Zones</h5>
                            <p className="text-sm text-gray-300">
                              Banks hunt stop losses above/below obvious levels before making real moves.
                            </p>
                          </div>
                          
                          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                            <h5 className="font-bold text-green-400 mb-2">Order Blocks</h5>
                            <p className="text-sm text-gray-300">
                              Price areas where institutions placed large orders. Price often returns here.
                            </p>
                          </div>
                          
                          <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                            <h5 className="font-bold text-purple-400 mb-2">Fair Value Gaps</h5>
                            <p className="text-sm text-gray-300">
                              Imbalances in price delivery that institutions will eventually fill.
                            </p>
                          </div>
                          
                          <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
                            <h5 className="font-bold text-orange-400 mb-2">Break of Structure</h5>
                            <p className="text-sm text-gray-300">
                              When price breaks previous highs/lows, indicating trend change.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-6">Economic Calendar Mastery</h3>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <Card className="glass-card border-red-500/20">
                        <CardHeader>
                          <CardTitle className="text-red-400">High Impact Events</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="p-3 bg-red-500/10 rounded">
                              <div className="font-bold text-white">Non-Farm Payrolls (NFP)</div>
                              <div className="text-xs text-gray-400">First Friday of month</div>
                              <div className="text-xs text-red-300">Can move USD 100+ pips</div>
                            </div>
                            <div className="p-3 bg-red-500/10 rounded">
                              <div className="font-bold text-white">FOMC Rate Decision</div>
                              <div className="text-xs text-gray-400">8 times per year</div>
                              <div className="text-xs text-red-300">Market maker or breaker</div>
                            </div>
                            <div className="p-3 bg-red-500/10 rounded">
                              <div className="font-bold text-white">CPI (Inflation)</div>
                              <div className="text-xs text-gray-400">Monthly</div>
                              <div className="text-xs text-red-300">Drives rate expectations</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="glass-card border-yellow-500/20">
                        <CardHeader>
                          <CardTitle className="text-yellow-400">Medium Impact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="p-3 bg-yellow-500/10 rounded">
                              <div className="font-bold text-white">GDP Growth</div>
                              <div className="text-xs text-gray-400">Quarterly</div>
                              <div className="text-xs text-yellow-300">Economic health indicator</div>
                            </div>
                            <div className="p-3 bg-yellow-500/10 rounded">
                              <div className="font-bold text-white">Retail Sales</div>
                              <div className="text-xs text-gray-400">Monthly</div>
                              <div className="text-xs text-yellow-300">Consumer spending</div>
                            </div>
                            <div className="p-3 bg-yellow-500/10 rounded">
                              <div className="font-bold text-white">PMI Data</div>
                              <div className="text-xs text-gray-400">Monthly</div>
                              <div className="text-xs text-yellow-300">Manufacturing health</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="glass-card border-green-500/20">
                        <CardHeader>
                          <CardTitle className="text-green-400">Low Impact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="p-3 bg-green-500/10 rounded">
                              <div className="font-bold text-white">Housing Data</div>
                              <div className="text-xs text-gray-400">Monthly</div>
                              <div className="text-xs text-green-300">Minor moves usually</div>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded">
                              <div className="font-bold text-white">Trade Balance</div>
                              <div className="text-xs text-gray-400">Monthly</div>
                              <div className="text-xs text-green-300">Long-term trends</div>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded">
                              <div className="font-bold text-white">Consumer Confidence</div>
                              <div className="text-xs text-gray-400">Monthly</div>
                              <div className="text-xs text-green-300">Sentiment indicator</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-8 bg-gray-800/50 p-6 rounded-lg">
                      <h4 className="text-lg font-bold text-white mb-4">News Trading Strategy</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold text-green-400 mb-3">✅ Do This</h5>
                          <ul className="space-y-2 text-sm text-gray-300">
                            <li>• Check economic calendar daily</li>
                            <li>• Close risky positions before major news</li>
                            <li>• Wait 15-30 min after news for clarity</li>
                            <li>• Trade the reaction, not the news</li>
                            <li>• Use wider stops during news periods</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-red-400 mb-3">❌ Avoid This</h5>
                          <ul className="space-y-2 text-sm text-gray-300">
                            <li>• Never trade during news releases</li>
                            <li>• Don't predict news outcomes</li>
                            <li>• Avoid tight stops before news</li>
                            <li>• Don't chase initial spike/dump</li>
                            <li>• Never hold through FOMC/NFP</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          ],
          quiz: {
            questions: [
              {
                question: "What percentage of daily forex volume occurs during the London session?",
                options: ["25%", "43%", "35%", "50%"],
                correct: 1,
                explanation: "London session accounts for 43% of daily forex volume, making it the most important trading session."
              },
              {
                question: "If EUR/USD moves from 1.2000 to 1.2015, how many pips did it move?",
                options: ["1.5 pips", "15 pips", "150 pips", "0.15 pips"],
                correct: 1,
                explanation: "Each 0.0001 move in EUR/USD equals 1 pip. 1.2015 - 1.2000 = 0.0015 = 15 pips."
              },
              {
                question: "Which event typically creates the most USD volatility?",
                options: ["Housing data", "Non-Farm Payrolls", "Trade balance", "Consumer confidence"],
                correct: 1,
                explanation: "Non-Farm Payrolls (NFP) is released first Friday of each month and can move USD pairs 100+ pips."
              },
              {
                question: "What is a 'Fair Value Gap' in Smart Money Concepts?",
                options: [
                  "A gap between bid and ask prices",
                  "An imbalance in price delivery that needs to be filled",
                  "The difference between major and minor pairs",
                  "A trading strategy for beginners"
                ],
                correct: 1,
                explanation: "Fair Value Gaps are price imbalances where institutional orders created inefficient price delivery, often revisited later."
              }
            ]
          }
        };

      case 'reading-charts':
        return {
          title: 'Professional Chart Analysis Mastery',
          estimatedTime: '3-4 hours',
          sections: [
            {
              title: 'Candlestick Patterns - Complete System',
              content: (
                <div className="space-y-8">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center">
                      <TrendingUp className="w-8 h-8 mr-3" />
                      Japanese Candlestick Mastery
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div className="bg-gray-800/50 p-6 rounded-lg">
                        <h4 className="text-xl font-bold text-white mb-6">Anatomy of a Candle</h4>
                        <div className="flex justify-center mb-6">
                          <div className="relative">
                            {/* Bullish Candle Illustration */}
                            <div className="w-20 h-40 bg-green-500 mx-auto relative rounded-sm">
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-green-500"></div>
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-green-500"></div>
                              <div className="absolute -right-16 top-2 text-xs text-gray-300">High</div>
                              <div className="absolute -left-16 top-8 text-xs text-gray-300">Open</div>
                              <div className="absolute -right-16 bottom-8 text-xs text-gray-300">Close</div>
                              <div className="absolute -left-16 bottom-2 text-xs text-gray-300">Low</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Body:</span>
                            <span className="text-white">Open to Close</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Upper Wick:</span>
                            <span className="text-white">High to Body Top</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Lower Wick:</span>
                            <span className="text-white">Low to Body Bottom</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Green Candle:</span>
                            <span className="text-green-400">Close {">"} Open</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Red Candle:</span>
                            <span className="text-red-400">Open {">"} Close</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 p-6 rounded-lg">
                        <h4 className="text-xl font-bold text-white mb-6">Reading Market Psychology</h4>
                        <div className="space-y-4">
                          <div className="p-4 bg-green-500/10 rounded border border-green-500/20">
                            <h5 className="font-bold text-green-400 mb-2">Large Green Body + Small Wicks</h5>
                            <p className="text-sm text-gray-300">
                              <strong>Psychology:</strong> Buyers dominated completely. Minimal selling pressure. 
                              Strong bullish sentiment.
                            </p>
                          </div>
                          
                          <div className="p-4 bg-red-500/10 rounded border border-red-500/20">
                            <h5 className="font-bold text-red-400 mb-2">Large Red Body + Small Wicks</h5>
                            <p className="text-sm text-gray-300">
                              <strong>Psychology:</strong> Sellers crushed buyers. Panic selling. 
                              Strong bearish sentiment.
                            </p>
                          </div>
                          
                          <div className="p-4 bg-yellow-500/10 rounded border border-yellow-500/20">
                            <h5 className="font-bold text-yellow-400 mb-2">Small Body + Long Wicks</h5>
                            <p className="text-sm text-gray-300">
                              <strong>Psychology:</strong> Indecision. Neither side won. 
                              Battle between buyers and sellers. Reversal possible.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-blue-400 mb-6">Critical Reversal Patterns</h3>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <Card className="glass-card border-green-500/20">
                        <CardHeader>
                          <CardTitle className="text-green-400">Hammer & Doji</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center">
                            <div className="w-8 h-16 bg-green-500 mx-auto relative mb-4">
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-px h-8 bg-green-500"></div>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400">85% Reversal Rate</Badge>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div>
                              <strong className="text-white">Hammer Pattern:</strong>
                              <p className="text-gray-300">Small body, long lower wick. Shows rejection of lower prices.</p>
                            </div>
                            <div>
                              <strong className="text-white">Where to Find:</strong>
                              <p className="text-gray-300">At support levels, end of downtrends</p>
                            </div>
                            <div className="bg-green-500/10 p-2 rounded">
                              <strong className="text-green-400">Entry:</strong> Above hammer high<br/>
                              <strong className="text-green-400">Stop:</strong> Below hammer low
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="glass-card border-red-500/20">
                        <CardHeader>
                          <CardTitle className="text-red-400">Shooting Star</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center">
                            <div className="w-8 h-16 bg-red-500 mx-auto relative mb-4">
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-8 bg-red-500"></div>
                            </div>
                            <Badge className="bg-red-500/20 text-red-400">80% Reversal Rate</Badge>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div>
                              <strong className="text-white">Shooting Star:</strong>
                              <p className="text-gray-300">Small body, long upper wick. Shows rejection of higher prices.</p>
                            </div>
                            <div>
                              <strong className="text-white">Where to Find:</strong>
                              <p className="text-gray-300">At resistance levels, end of uptrends</p>
                            </div>
                            <div className="bg-red-500/10 p-2 rounded">
                              <strong className="text-red-400">Entry:</strong> Below star low<br/>
                              <strong className="text-red-400">Stop:</strong> Above star high
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="glass-card border-purple-500/20">
                        <CardHeader>
                          <CardTitle className="text-purple-400">Engulfing Patterns</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center mb-4">
                            <div className="flex justify-center space-x-2">
                              <div className="w-6 h-12 bg-red-500"></div>
                              <div className="w-8 h-16 bg-green-500"></div>
                            </div>
                            <Badge className="bg-purple-500/20 text-purple-400 mt-2">90% Reversal Rate</Badge>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div>
                              <strong className="text-white">Bullish Engulfing:</strong>
                              <p className="text-gray-300">Large green candle completely covers previous red candle.</p>
                            </div>
                            <div>
                              <strong className="text-white">Psychology:</strong>
                              <p className="text-gray-300">Buyers overwhelm sellers completely</p>
                            </div>
                            <div className="bg-purple-500/10 p-2 rounded">
                              <strong className="text-purple-400">Most Reliable:</strong> At key support/resistance levels
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-orange-400 mb-6">Timeframe Analysis System</h3>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-6">Multi-Timeframe Approach</h4>
                        <div className="space-y-4">
                          <div className="bg-gray-800/50 p-6 rounded-lg">
                            <h5 className="font-bold text-blue-400 mb-3">Higher Timeframe (Daily/4H)</h5>
                            <ul className="space-y-2 text-sm text-gray-300">
                              <li>• <strong>Purpose:</strong> Identify overall trend direction</li>
                              <li>• <strong>Use for:</strong> Major support/resistance levels</li>
                              <li>• <strong>Key patterns:</strong> Weekly/monthly levels</li>
                              <li>• <strong>Psychology:</strong> Where institutions make decisions</li>
                            </ul>
                          </div>
                          
                          <div className="bg-gray-800/50 p-6 rounded-lg">
                            <h5 className="font-bold text-green-400 mb-3">Medium Timeframe (1H/30M)</h5>
                            <ul className="space-y-2 text-sm text-gray-300">
                              <li>• <strong>Purpose:</strong> Entry timing and structure</li>
                              <li>• <strong>Use for:</strong> Break of structure signals</li>
                              <li>• <strong>Key patterns:</strong> Order blocks, FVGs</li>
                              <li>• <strong>Psychology:</strong> Swing trading setups</li>
                            </ul>
                          </div>
                          
                          <div className="bg-gray-800/50 p-6 rounded-lg">
                            <h5 className="font-bold text-yellow-400 mb-3">Lower Timeframe (15M/5M)</h5>
                            <ul className="space-y-2 text-sm text-gray-300">
                              <li>• <strong>Purpose:</strong> Precise entry execution</li>
                              <li>• <strong>Use for:</strong> Fine-tuning entries/exits</li>
                              <li>• <strong>Key patterns:</strong> Micro structures</li>
                              <li>• <strong>Psychology:</strong> Scalping opportunities</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-white mb-6">Professional Trading Setup</h4>
                        <div className="space-y-6">
                          <div className="bg-purple-500/10 p-6 rounded-lg border border-purple-500/20">
                            <h5 className="font-bold text-purple-400 mb-4">The 3-Screen Trading System</h5>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                                <div>
                                  <strong className="text-white">Daily Chart:</strong>
                                  <p className="text-sm text-gray-300">Identify trend direction</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                                <div>
                                  <strong className="text-white">1H Chart:</strong>
                                  <p className="text-sm text-gray-300">Find entry signals in trend direction</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                                <div>
                                  <strong className="text-white">15M Chart:</strong>
                                  <p className="text-sm text-gray-300">Execute with precision</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/20">
                            <h5 className="font-bold text-red-400 mb-4">❌ Common Mistakes</h5>
                            <ul className="space-y-2 text-sm text-gray-300">
                              <li>• Trading against higher timeframe trend</li>
                              <li>• Using only one timeframe</li>
                              <li>• Ignoring daily/weekly levels</li>
                              <li>• Over-analyzing lower timeframes</li>
                              <li>• Changing timeframes mid-trade</li>
                            </ul>
                          </div>

                          <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/20">
                            <h5 className="font-bold text-green-400 mb-4">✅ Pro Tips</h5>
                            <ul className="space-y-2 text-sm text-gray-300">
                              <li>• Always trade WITH the higher timeframe</li>
                              <li>• Use lower timeframes for entry only</li>
                              <li>• Mark key levels from daily chart</li>
                              <li>• Wait for confluence across timeframes</li>
                              <li>• Set alerts on higher timeframe levels</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          ],
          quiz: {
            questions: [
              {
                question: "What does a hammer candlestick pattern indicate?",
                options: [
                  "Continuation of current trend",
                  "Rejection of lower prices and potential reversal up",
                  "High volatility expected",
                  "Market consolidation"
                ],
                correct: 1,
                explanation: "A hammer shows rejection of lower prices with its long lower wick and small body, indicating buyers stepped in strongly."
              },
              {
                question: "In the 3-screen trading system, what is the purpose of the daily chart?",
                options: [
                  "Execute precise entries",
                  "Find exact entry signals",
                  "Identify overall trend direction",
                  "Set stop losses"
                ],
                correct: 2,
                explanation: "The daily chart in the 3-screen system is used to identify the overall trend direction that you should trade with."
              },
              {
                question: "A bullish engulfing pattern has what success rate for reversals?",
                options: ["70%", "80%", "90%", "95%"],
                correct: 2,
                explanation: "Bullish engulfing patterns have approximately a 90% reversal rate when they occur at key support levels."
              },
              {
                question: "What does a small body with long wicks on both sides indicate?",
                options: [
                  "Strong bullish momentum",
                  "Strong bearish momentum",
                  "Market indecision and potential reversal",
                  "Trend continuation"
                ],
                correct: 2,
                explanation: "Small body with long wicks shows indecision - neither buyers nor sellers won, often leading to reversals."
              }
            ]
          }
        };

      // Add similar comprehensive content for other lessons...
      default:
        return {
          title: 'Lesson Not Found',
          estimatedTime: '0 min',
          sections: [
            {
              title: 'Content Not Available',
              content: <div className="text-center p-8">
                <p className="text-gray-400">This lesson content is being prepared.</p>
                <p className="text-sm text-gray-500 mt-2">Please check back soon for comprehensive content.</p>
              </div>
            }
          ],
          quiz: {
            questions: [
              {
                question: "This is a placeholder question",
                options: ["A", "B", "C", "D"],
                correct: 0,
                explanation: "Placeholder explanation"
              }
            ]
          }
        };
    }
  };

  const lesson = getLessonData(lessonId);
  const totalSections = lesson.sections.length;
  const progress = ((currentSection + 1) / totalSections) * 100;

  const handleSectionComplete = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      // Show quiz
      setShowResults(true);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const calculateQuizScore = () => {
    let correct = 0;
    lesson.quiz.questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correct) {
        correct++;
      }
    });
    return (correct / lesson.quiz.questions.length) * 100;
  };

  const canComplete = () => {
    if (lesson.quiz.questions.length === 0) return true;
    return Object.keys(quizAnswers).length === lesson.quiz.questions.length && calculateQuizScore() >= 80;
  };

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <Card className="glass-card border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-purple-400 text-xl mb-2">{lesson.title}</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {lesson.estimatedTime}
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {totalSections} Sections
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  Professional Level
                </div>
              </div>
            </div>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Section {currentSection + 1}/{totalSections}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white font-bold">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Lesson Content */}
      {!showResults ? (
        <Card className="glass-card border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-blue-400 text-xl">
              {lesson.sections[currentSection]?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {lesson.sections[currentSection]?.content}
            
            <div className="flex justify-between items-center pt-6 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
                className="border-gray-600 text-gray-300"
              >
                Previous Section
              </Button>
              
              <Button
                onClick={handleSectionComplete}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {currentSection === totalSections - 1 ? 'Take Quiz' : 'Next Section'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Quiz Section */
        <Card className="glass-card border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-yellow-400 text-xl flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              Knowledge Assessment
            </CardTitle>
            <p className="text-gray-400">Answer all questions correctly to complete this lesson (80% required)</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {lesson.quiz.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="space-y-4">
                <h4 className="text-white font-semibold">
                  {questionIndex + 1}. {question.question}
                </h4>
                <div className="grid gap-3">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = quizAnswers[questionIndex] === optionIndex;
                    const isCorrect = optionIndex === question.correct;
                    const showResult = quizAnswers[questionIndex] !== undefined;
                    
                    return (
                      <button
                        key={optionIndex}
                        onClick={() => handleQuizAnswer(questionIndex, optionIndex)}
                        disabled={showResult}
                        className={`p-4 text-left rounded-lg border transition-colors ${
                          showResult
                            ? isCorrect
                              ? 'bg-green-500/20 border-green-500/50 text-green-300'
                              : isSelected
                              ? 'bg-red-500/20 border-red-500/50 text-red-300'
                              : 'bg-gray-800/50 border-gray-600/50 text-gray-400'
                            : isSelected
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                            : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {quizAnswers[questionIndex] !== undefined && (
                  <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                    <p className="text-blue-300 text-sm">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {Object.keys(quizAnswers).length === lesson.quiz.questions.length && (
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600/50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {calculateQuizScore()}%
                  </div>
                  <div className="text-gray-400 mb-4">
                    {calculateQuizScore() >= 80 ? 'Excellent! You can proceed.' : 'You need 80% to complete this lesson.'}
                  </div>
                  
                  <Button
                    onClick={onComplete}
                    disabled={!canComplete()}
                    className={`${
                      canComplete() 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-600 cursor-not-allowed'
                    } text-white`}
                  >
                    {canComplete() ? (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Complete Lesson
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Need 80% to Complete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LessonContent;
