
import React from 'react';
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
  Lightbulb
} from 'lucide-react';

interface LessonContentProps {
  lessonId: string;
  onComplete: () => void;
}

const LessonContent: React.FC<LessonContentProps> = ({ lessonId, onComplete }) => {
  const getLessonData = (id: string) => {
    switch (id) {
      case 'forex-101':
        return {
          title: 'What is Forex Trading?',
          content: (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
                  <DollarSign className="w-6 h-6 mr-2" />
                  The Currency Exchange Market
                </h3>
                <p className="text-gray-300 mb-4">
                  Forex (Foreign Exchange) is the world's largest financial market where currencies are traded 24/5. 
                  Think of it like a giant currency exchange booth - but instead of exchanging holiday money, 
                  you're betting whether one currency will get stronger or weaker against another.
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Simple Example:</h4>
                  <p className="text-gray-300">
                    EUR/USD = 1.2000 means 1 Euro = 1.20 US Dollars. If you think the Euro will get stronger, 
                    you BUY. If you think it will get weaker, you SELL.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="glass-card border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-green-400 text-lg">Currency Pairs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-300">
                      <li><span className="text-white font-semibold">EUR/USD</span> - Euro vs US Dollar</li>
                      <li><span className="text-white font-semibold">GBP/USD</span> - British Pound vs USD</li>
                      <li><span className="text-white font-semibold">USD/JPY</span> - US Dollar vs Japanese Yen</li>
                      <li><span className="text-white font-semibold">AUD/USD</span> - Australian Dollar vs USD</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="glass-card border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-purple-400 text-lg">Market Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-300">
                      <li><span className="text-white font-semibold">London:</span> 3 AM - 12 PM EST</li>
                      <li><span className="text-white font-semibold">New York:</span> 8 AM - 5 PM EST</li>
                      <li><span className="text-white font-semibold">Best Times:</span> Overlap periods</li>
                      <li><span className="text-white font-semibold">Avoid:</span> Weekends & major holidays</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                <h4 className="font-bold text-yellow-400 mb-3 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Key Takeaway
                </h4>
                <p className="text-gray-300">
                  Forex is about currency strength relationships. You're not just buying a currency - 
                  you're betting that it will perform better than another currency over time.
                </p>
              </div>
            </div>
          ),
          quiz: {
            question: "What does EUR/USD = 1.2000 mean?",
            options: [
              "1 Euro equals 1.20 US Dollars",
              "1 US Dollar equals 1.20 Euros", 
              "You need 1.20 Euros to buy 1 Dollar",
              "The market is closed"
            ],
            correct: 0,
            explanation: "EUR/USD = 1.2000 means 1 Euro equals 1.20 US Dollars. The first currency (EUR) is the base, the second (USD) is the quote."
          }
        };

      case 'reading-charts':
        return {
          title: 'Reading Your First Chart',
          content: (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  Understanding Candlesticks
                </h3>
                <p className="text-gray-300 mb-4">
                  Candlesticks show you 4 key pieces of information for any time period: Open, High, Low, Close. 
                  Think of each candle as a mini story of what happened during that time.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-green-400">Bullish (Green) Candle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="w-8 h-16 bg-green-500 mx-auto relative">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-2 bg-green-500"></div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-px h-2 bg-green-500"></div>
                      </div>
                      <ul className="text-sm text-gray-300">
                        <li><span className="text-white">Close</span> > Open</li>
                        <li><span className="text-white">Body:</span> Open to Close</li>
                        <li><span className="text-white">Wicks:</span> High and Low points</li>
                        <li><span className="text-green-400">Buyers</span> were in control</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-red-500/20">
                  <CardHeader>
                    <CardTitle className="text-red-400">Bearish (Red) Candle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="w-8 h-16 bg-red-500 mx-auto relative">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-2 bg-red-500"></div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-px h-2 bg-red-500"></div>
                      </div>
                      <ul className="text-sm text-gray-300">
                        <li><span className="text-white">Open</span> > Close</li>
                        <li><span className="text-white">Body:</span> Close to Open</li>
                        <li><span className="text-white">Wicks:</span> High and Low points</li>
                        <li><span className="text-red-400">Sellers</span> were in control</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h4 className="font-bold text-blue-400 mb-3">Timeframes Explained</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-white font-semibold">1M</div>
                    <div className="text-xs text-gray-400">1 Minute</div>
                    <div className="text-xs text-gray-500">Scalping</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">15M</div>
                    <div className="text-xs text-gray-400">15 Minutes</div>
                    <div className="text-xs text-gray-500">Short-term</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">1H</div>
                    <div className="text-xs text-gray-400">1 Hour</div>
                    <div className="text-xs text-gray-500">Swing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">1D</div>
                    <div className="text-xs text-gray-400">Daily</div>
                    <div className="text-xs text-gray-500">Long-term</div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
                <h4 className="font-bold text-purple-400 mb-3 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  What to Look For
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• <span className="text-white">Long green candles</span> = Strong buying pressure</li>
                  <li>• <span className="text-white">Long red candles</span> = Strong selling pressure</li>
                  <li>• <span className="text-white">Small bodies, long wicks</span> = Indecision</li>
                  <li>• <span className="text-white">Series of same color</span> = Trend formation</li>
                </ul>
              </div>
            </div>
          ),
          quiz: {
            question: "What does a long green candle with small wicks tell you?",
            options: [
              "Strong buying pressure with little selling",
              "Strong selling pressure", 
              "Market indecision",
              "The market is about to reverse"
            ],
            correct: 0,
            explanation: "A long green candle with small wicks shows strong buying pressure. Buyers dominated the entire period with minimal selling attempts."
          }
        };

      case 'basic-analysis':
        return {
          title: 'Support and Resistance',
          content: (
            <div className="space-y-6">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                  <Target className="w-6 h-6 mr-2" />
                  Key Levels That Matter
                </h3>
                <p className="text-gray-300 mb-4">
                  Support and Resistance are like invisible floors and ceilings in the market. 
                  Think of them as psychological levels where traders make decisions.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-green-400">Support Level</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <div className="text-4xl">📈</div>
                      <div className="text-sm text-gray-400 mt-2">Price bounces UP</div>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Price level where buying interest appears</li>
                      <li>• Acts like a "floor" for price</li>
                      <li>• More tests = stronger level</li>
                      <li>• When broken = becomes resistance</li>
                    </ul>
                    <div className="bg-green-500/10 p-3 rounded">
                      <p className="text-xs text-green-300">
                        <strong>Example:</strong> EUR/USD keeps bouncing off 1.2000. 
                        That's a support level!
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-red-500/20">
                  <CardHeader>
                    <CardTitle className="text-red-400">Resistance Level</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <div className="text-4xl">📉</div>
                      <div className="text-sm text-gray-400 mt-2">Price bounces DOWN</div>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Price level where selling interest appears</li>
                      <li>• Acts like a "ceiling" for price</li>
                      <li>• More tests = stronger level</li>
                      <li>• When broken = becomes support</li>
                    </ul>
                    <div className="bg-red-500/10 p-3 rounded">
                      <p className="text-xs text-red-300">
                        <strong>Example:</strong> GBP/USD keeps getting rejected at 1.3500. 
                        That's resistance!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h4 className="font-bold text-blue-400 mb-4">How to Identify These Levels</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-400 font-bold">1</span>
                    </div>
                    <h5 className="font-semibold text-white mb-1">Look Left</h5>
                    <p className="text-xs text-gray-400">Find where price previously bounced multiple times</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-400 font-bold">2</span>
                    </div>
                    <h5 className="font-semibold text-white mb-1">Draw Lines</h5>
                    <p className="text-xs text-gray-400">Connect the highs (resistance) or lows (support)</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-400 font-bold">3</span>
                    </div>
                    <h5 className="font-semibold text-white mb-1">Watch Reactions</h5>
                    <p className="text-xs text-gray-400">See how price reacts when it hits these levels again</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                <h4 className="font-bold text-yellow-400 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Trading These Levels
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                    <div>
                      <p className="text-white font-medium">Buy at Support</p>
                      <p className="text-gray-400 text-sm">When price approaches support and shows signs of bouncing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                    <div>
                      <p className="text-white font-medium">Sell at Resistance</p>
                      <p className="text-gray-400 text-sm">When price approaches resistance and shows signs of rejection</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">!</div>
                    <div>
                      <p className="text-white font-medium">Breakout Trading</p>
                      <p className="text-gray-400 text-sm">Trade in the direction when these levels are clearly broken</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
          quiz: {
            question: "If EUR/USD breaks below a major support level, what typically happens?",
            options: [
              "That support level becomes new resistance",
              "The price immediately reverses back up",
              "The support level gets stronger", 
              "Nothing changes"
            ],
            correct: 0,
            explanation: "When support is broken, it often becomes new resistance. This is called a 'role reversal' - sellers will now use that level to enter short positions."
          }
        };

      case 'risk-basics':
        return {
          title: 'Risk Management Fundamentals',
          content: (
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-2" />
                  The Most Important Lesson
                </h3>
                <p className="text-gray-300 mb-4">
                  Risk management isn't about making money - it's about NOT LOSING money. 
                  You can be right only 40% of the time and still be profitable with proper risk management.
                </p>
                <div className="bg-red-500/20 p-4 rounded-lg">
                  <p className="text-red-300 font-semibold text-center">
                    "Rule #1: Never lose money. Rule #2: Never forget rule #1." - Warren Buffett
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card border-yellow-500/20">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">The 1% Rule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300 text-sm">
                      Never risk more than 1% of your account on a single trade.
                    </p>
                    <div className="bg-yellow-500/10 p-4 rounded">
                      <p className="text-white font-semibold mb-2">Example:</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>Account: $1,000</li>
                        <li>Max Risk: $10 (1%)</li>
                        <li>Can lose 100 trades in a row</li>
                        <li>Still have money to trade!</li>
                      </ul>
                    </div>
                    <div className="text-xs text-gray-400">
                      This rule keeps you in the game long enough to become profitable.
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-blue-400">Stop Losses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300 text-sm">
                      Your exit plan BEFORE you enter. Non-negotiable.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Entry:</span>
                        <span className="text-white">1.2000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-red-400 text-sm">Stop Loss:</span>
                        <span className="text-red-400">1.1950</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 text-sm">Take Profit:</span>
                        <span className="text-green-400">1.2100</span>
                      </div>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded">
                      <p className="text-xs text-blue-300">
                        Risk: 50 pips | Reward: 100 pips | RR: 1:2
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <h4 className="font-bold text-green-400 mb-4">Position Sizing Calculator</h4>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">$1000</div>
                    <div className="text-gray-400 text-sm">Account Size</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">1%</div>
                    <div className="text-gray-400 text-sm">Risk Per Trade</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">$10</div>
                    <div className="text-gray-400 text-sm">Max Loss</div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-800/50 rounded">
                  <p className="text-white font-semibold mb-2">Formula:</p>
                  <p className="text-gray-300 text-sm">
                    Position Size = (Account × Risk%) ÷ (Entry - Stop Loss)
                  </p>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
                <h4 className="font-bold text-purple-400 mb-3">Risk Management Rules</h4>
                <div className="space-y-3">
                  {[
                    "Never risk more than 1% per trade",
                    "Always set stop loss BEFORE entering",
                    "Don't move stop loss against you",
                    "Take partial profits at key levels",
                    "Don't revenge trade after losses",
                    "Keep emotions out of position sizing"
                  ].map((rule, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-purple-400 text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-gray-300">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ),
          quiz: {
            question: "You have a $2000 account. Following the 1% rule, what's the maximum you should risk per trade?",
            options: [
              "$20",
              "$200", 
              "$100",
              "$50"
            ],
            correct: 0,
            explanation: "$2000 × 1% = $20. This is your maximum risk per trade, regardless of how confident you feel about the setup."
          }
        };

      case 'market-sessions':
        return {
          title: 'Trading Sessions & Times',
          content: (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2" />
                  When Markets Come Alive
                </h3>
                <p className="text-gray-300 mb-4">
                  Forex markets are open 24/5, but not all hours are equal. Knowing when to trade 
                  can make the difference between profit and frustration.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="glass-card border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-green-400 text-center">London Session</CardTitle>
                    <p className="text-center text-gray-400">3:00 AM - 12:00 PM EST</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🇬🇧</div>
                      <Badge className="bg-green-500/20 text-green-400">Most Active</Badge>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Highest volatility</li>
                      <li>• Major news releases</li>
                      <li>• Best for EUR, GBP pairs</li>
                      <li>• Institutional trading</li>
                    </ul>
                    <div className="bg-green-500/10 p-3 rounded">
                      <p className="text-xs text-green-300">
                        <strong>Best For:</strong> Professional traders, major moves
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-blue-400 text-center">New York Session</CardTitle>
                    <p className="text-center text-gray-400">8:00 AM - 5:00 PM EST</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🇺🇸</div>
                      <Badge className="bg-blue-500/20 text-blue-400">High Volume</Badge>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• USD pairs dominate</li>
                      <li>• Economic data releases</li>
                      <li>• Afternoon slowdown</li>
                      <li>• Overlap with London</li>
                    </ul>
                    <div className="bg-blue-500/10 p-3 rounded">
                      <p className="text-xs text-blue-300">
                        <strong>Best For:</strong> USD trades, follow-through
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-yellow-500/20">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 text-center">Asian Session</CardTitle>
                    <p className="text-center text-gray-400">6:00 PM - 3:00 AM EST</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🇯🇵</div>
                      <Badge className="bg-yellow-500/20 text-yellow-400">Lower Volume</Badge>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Quieter movements</li>
                      <li>• JPY, AUD, NZD focus</li>
                      <li>• Range-bound trading</li>
                      <li>• Carry trade unwinds</li>
                    </ul>
                    <div className="bg-yellow-500/10 p-3 rounded">
                      <p className="text-xs text-yellow-300">
                        <strong>Best For:</strong> Range trading, patience
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
                <h4 className="font-bold text-purple-400 mb-4">Session Overlap Magic</h4>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-2">London + New York (8 AM - 12 PM EST)</h5>
                    <p className="text-gray-300 text-sm mb-2">The Golden Hours</p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Highest volatility of the day</li>
                      <li>• Major breakouts and trends</li>
                      <li>• Best liquidity for all pairs</li>
                      <li>• Most profitable opportunities</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-2">Asian + London (3 AM - 4 AM EST)</h5>
                    <p className="text-gray-300 text-sm mb-2">The Early Bird Window</p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• London open volatility</li>
                      <li>• Gap trading opportunities</li>
                      <li>• Short-lived but intense</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <h4 className="font-bold text-red-400 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Times to Avoid Trading
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Low Volume Periods</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Friday after 12 PM EST</li>
                      <li>• Sunday evening (gaps)</li>
                      <li>• Major holidays</li>
                      <li>• Summer doldrums (August)</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">High Risk Periods</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• 15 min before major news</li>
                      <li>• Central bank meetings</li>
                      <li>• NFP Friday mornings</li>
                      <li>• Market close Fridays</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ),
          quiz: {
            question: "What is the best time for maximum volatility and trading opportunities?",
            options: [
              "London + New York overlap (8 AM - 12 PM EST)",
              "Asian session only",
              "Friday afternoons", 
              "Sunday evenings"
            ],
            correct: 0,
            explanation: "The London + New York overlap (8 AM - 12 PM EST) offers the highest volatility, best liquidity, and most trading opportunities as both major sessions are active."
          }
        };

      case 'first-strategy':
        return {
          title: 'Your First Trading Strategy',
          content: (
            <div className="space-y-6">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center">
                  <Brain className="w-6 h-6 mr-2" />
                  The Support/Resistance Bounce Strategy
                </h3>
                <p className="text-gray-300 mb-4">
                  This is a simple, proven strategy that combines everything you've learned. 
                  It's designed for beginners but used by professionals.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-green-400">The Setup</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <span className="text-white">Identify strong S/R level</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <span className="text-white">Wait for price to approach</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <span className="text-white">Look for rejection signals</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                        <span className="text-white">Enter in bounce direction</span>
                      </div>
                    </div>
                    <div className="bg-green-500/10 p-3 rounded">
                      <p className="text-xs text-green-300">
                        <strong>Key:</strong> Wait for confirmation before entering
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-blue-400">Entry Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-white font-semibold text-sm">At Support (Buy):</h5>
                        <ul className="text-xs text-gray-300 space-y-1 ml-3">
                          <li>• Price touches support level</li>
                          <li>• See bullish rejection candle</li>
                          <li>• Enter on next candle open</li>
                          <li>• Stop loss below support</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-white font-semibold text-sm">At Resistance (Sell):</h5>
                        <ul className="text-xs text-gray-300 space-y-1 ml-3">
                          <li>• Price touches resistance level</li>
                          <li>• See bearish rejection candle</li>
                          <li>• Enter on next candle open</li>
                          <li>• Stop loss above resistance</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                <h4 className="font-bold text-yellow-400 mb-4">Complete Trade Example</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Trade Setup:</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pair:</span>
                        <span className="text-white">EUR/USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Support:</span>
                        <span className="text-white">1.2000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Entry:</span>
                        <span className="text-green-400">1.2010</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Stop Loss:</span>
                        <span className="text-red-400">1.1980</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Take Profit:</span>
                        <span className="text-green-400">1.2070</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Risk Analysis:</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk:</span>
                        <span className="text-red-400">30 pips</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reward:</span>
                        <span className="text-green-400">60 pips</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">RR Ratio:</span>
                        <span className="text-purple-400">1:2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Win Rate Needed:</span>
                        <span className="text-white">34%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6">
                <h4 className="font-bold text-orange-400 mb-4">Advanced Tips</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-semibold mb-2">Improve Success Rate:</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Trade during London/NY overlap</li>
                      <li>• Look for multiple timeframe confluence</li>
                      <li>• Avoid trading into major news</li>
                      <li>• Use previous day high/low as levels</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold mb-2">Trade Management:</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Move to breakeven at 1:1 RR</li>
                      <li>• Take partial profits at resistance</li>
                      <li>• Trail stop loss in strong trends</li>
                      <li>• Never move stop loss against you</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <h4 className="font-bold text-red-400 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Common Mistakes to Avoid
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Entering without confirmation</li>
                    <li>• Ignoring session timing</li>
                    <li>• Risking more than 1%</li>
                    <li>• Moving stop loss when losing</li>
                  </ul>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Taking profits too early</li>
                    <li>• Trading weak S/R levels</li>
                    <li>• Forcing trades when bored</li>
                    <li>• Not respecting the plan</li>
                  </ul>
                </div>
              </div>
            </div>
          ),
          quiz: {
            question: "In the Support/Resistance Bounce strategy, when should you enter a buy trade?",
            options: [
              "After seeing a bullish rejection candle at support",
              "As soon as price touches support",
              "When price is falling towards support", 
              "Only when you're 100% certain"
            ],
            correct: 0,
            explanation: "Wait for confirmation! Enter after seeing a bullish rejection candle at support. This shows the level is holding and buyers are stepping in."
          }
        };

      default:
        return {
          title: 'Lesson Not Found',
          content: <div>Lesson content not available</div>,
          quiz: {
            question: "Default question",
            options: ["A", "B", "C", "D"],
            correct: 0,
            explanation: "Default explanation"
          }
        };
    }
  };

  const lesson = getLessonData(lessonId);

  return (
    <Card className="glass-card border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-purple-400 text-xl">{lesson.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {lesson.content}
        
        {/* Quiz Section */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <h4 className="font-bold text-blue-400 mb-4">Knowledge Check</h4>
          <div className="space-y-4">
            <p className="text-white font-medium">{lesson.quiz.question}</p>
            <div className="space-y-2">
              {lesson.quiz.options.map((option, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 rounded-lg bg-gray-800/50 hover:bg-blue-500/20 transition-colors border border-gray-700 hover:border-blue-500/50"
                >
                  <span className="text-gray-300">{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={onComplete}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete Lesson
        </Button>
      </CardContent>
    </Card>
  );
};

export default LessonContent;
