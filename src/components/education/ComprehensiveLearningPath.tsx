
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  Lock,
  Star,
  MessageSquare,
  Play,
  Award,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Lightbulb,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import InteractiveQuizGenerator from './InteractiveQuizGenerator';
import VisualLessonCard from './VisualLessonCard';
import LessonContent from './LessonContent';

interface ComprehensiveLearningPathProps {
  onAskMentor?: (prompt: string) => void;
}

interface LearningMission {
  id: string;
  title: string;
  description: string;
  keyPoints: string[];
  learningObjectives: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  stage: number;
  prerequisites: string[];
  completed: boolean;
  score?: number;
  content?: string;
  mentorPrompt: string;
}

interface LearningStage {
  id: number;
  title: string;
  description: string;
  duration: string;
  missions: LearningMission[];
  completed: boolean;
}

// Sample learning data
const sampleLearningStages: LearningStage[] = [
  {
    id: 1,
    title: "Trading Foundations",
    description: "Master the absolute basics - what trading really is",
    duration: "1 Week",
    completed: false,
    missions: [
      {
        id: "1-1",
        title: "What Actually Is Trading?",
        description: "Master what actually is trading? concepts",
        keyPoints: [
          "Trading is buying and selling financial instruments to profit from price movements",
          "Markets exist for stocks, forex, crypto, commodities, and more",
          "Traders make money from the difference between buy and sell prices",
          "Risk management is crucial - you can lose money as well as make it"
        ],
        learningObjectives: [
          "Understand what trading fundamentally is",
          "Learn about different types of markets",
          "Grasp the concept of profit and loss",
          "Recognize the importance of risk management"
        ],
        difficulty: "Beginner",
        estimatedTime: "15 minutes",
        stage: 1,
        prerequisites: [],
        completed: false,
        mentorPrompt: "I'm learning about what trading is. Can you explain the basics and help me understand how traders make money?",
        content: `
# What Actually Is Trading?

## Introduction
Trading is the act of buying and selling financial instruments with the goal of making a profit from price movements. It's one of the oldest forms of business, but modern electronic trading has made it accessible to everyone.

## Core Concepts

**What is Trading?**
- Trading involves buying an asset at one price and selling it at a higher price (or vice versa)
- The difference between your buy and sell price is your profit or loss
- Traders don't usually own assets long-term - they're looking for short to medium-term price movements

**Types of Markets:**
1. **Stock Market** - Buying shares in companies
2. **Forex Market** - Trading currencies (EUR/USD, GBP/JPY, etc.)
3. **Cryptocurrency** - Digital assets like Bitcoin, Ethereum
4. **Commodities** - Gold, oil, wheat, coffee
5. **Indices** - Baskets of stocks like S&P 500

**How Do Traders Make Money?**
- **Going Long**: Buy low, sell high (traditional approach)
- **Going Short**: Sell high, buy low (betting prices will fall)
- **Scalping**: Many small profits throughout the day
- **Swing Trading**: Hold positions for days to weeks
- **Position Trading**: Hold for months to years

## Key Principles

**Risk vs Reward**
Every trade has potential for both profit and loss. Successful traders:
- Never risk more than they can afford to lose
- Use stop-losses to limit downside
- Aim for trades where potential profit exceeds potential loss

**Market Psychology**
Markets are driven by human emotions:
- **Fear** causes selling and price drops
- **Greed** causes buying and price rises
- **News and events** create volatility
- Understanding crowd psychology gives you an edge

## Important Warnings

⚠️ **Trading Risks:**
- You can lose money, potentially all of it
- Most new traders lose money initially
- It requires discipline, education, and practice
- Never trade with money you can't afford to lose

💡 **Success Factors:**
- Education and continuous learning
- Risk management and discipline
- Emotional control
- Realistic expectations
- Practice with demo accounts first

## Your Next Steps

1. **Learn the terminology** - Every profession has its language
2. **Understand different markets** - Find what interests you most  
3. **Study risk management** - This is more important than making profits
4. **Practice on demos** - Learn without risking real money
5. **Develop a trading plan** - Random trading leads to losses

Remember: Trading is a skill that takes time to develop. Most professionals study for years before becoming consistently profitable. Take your time, be patient with yourself, and never stop learning.
        `
      },
      {
        id: "1-2", 
        title: "Market Types & Sessions",
        description: "Learn about different markets and when they're active",
        keyPoints: [
          "Different markets have different characteristics and trading hours",
          "Forex markets are open 24/5, stock markets have set hours",
          "Market sessions affect volatility and trading opportunities",
          "Understanding market structure helps time your trades"
        ],
        learningObjectives: [
          "Identify major market types and their characteristics",
          "Understand market trading sessions and their impact",
          "Learn when markets are most active",
          "Recognize how different sessions affect price movement"
        ],
        difficulty: "Beginner",
        estimatedTime: "20 minutes",
        stage: 1,
        prerequisites: ["1-1"],
        completed: false,
        mentorPrompt: "I want to understand different market types and when the best times to trade are. Can you help me with market sessions?",
        content: `
# Market Types & Trading Sessions

## Major Market Types

**1. Forex (Foreign Exchange)**
- Largest financial market in the world
- $7+ trillion daily volume
- Open 24 hours, 5 days a week
- Major pairs: EUR/USD, GBP/USD, USD/JPY, USD/CHF
- High liquidity and tight spreads

**2. Stock Markets**
- Individual company shares
- NYSE, NASDAQ, LSE, etc.
- Set trading hours (9:30 AM - 4:00 PM EST for US)
- Influenced by company earnings, news, economic data
- Can buy individual stocks or ETFs

**3. Cryptocurrency**
- Digital assets like Bitcoin, Ethereum
- Open 24/7 including weekends
- High volatility
- Newer market with evolving regulations
- Can be very profitable but also very risky

**4. Commodities**
- Physical goods: Gold, Silver, Oil, Coffee, Wheat
- Affected by supply/demand, weather, geopolitics
- Different trading hours for different commodities
- Often used as inflation hedges

## Trading Sessions Explained

**Forex Market Sessions:**

🌏 **Asian Session (Sydney/Tokyo)**
- Time: 7 PM - 4 AM EST
- Active pairs: USD/JPY, AUD/USD, NZD/USD
- Generally lower volatility
- Good for range trading strategies

🌍 **European Session (London)**
- Time: 3 AM - 12 PM EST  
- Active pairs: EUR/USD, GBP/USD, EUR/GBP
- Highest volume session
- Major news releases often occur here

🌎 **American Session (New York)**
- Time: 8 AM - 5 PM EST
- Active pairs: USD/CAD, USD/CHF, major USD pairs
- Overlaps with European session create high volatility
- US economic data releases

**Session Overlaps = Opportunity**
- London/New York (8 AM - 12 PM EST): Highest volatility
- Sydney/Tokyo (7 PM - 2 AM EST): Moderate activity
- During overlaps, more traders = more movement = more opportunities

## Stock Market Sessions

**Pre-Market Trading**
- 4:00 AM - 9:30 AM EST
- Lower volume, wider spreads
- Reactions to overnight news
- More volatile price movements

**Regular Trading Hours**
- 9:30 AM - 4:00 PM EST
- Highest volume and liquidity
- Best time for most retail traders
- Earnings releases often before or after hours

**After-Hours Trading**
- 4:00 PM - 8:00 PM EST
- Lower volume, higher spreads
- Reactions to earnings, news
- Can see significant price gaps

## Choosing Your Market

**Consider These Factors:**

📊 **Time Availability**
- When can you actively monitor trades?
- Forex: Flexible, 24/5 trading
- Stocks: Set hours, need to be available during market hours

💰 **Capital Requirements**
- Forex: Can start with smaller amounts due to leverage
- Stocks: May need more capital for diversification
- Crypto: Can start very small

📈 **Risk Tolerance**
- Crypto: Highest volatility
- Stocks: Moderate, depends on stock choice
- Forex: Generally lower volatility than crypto

🎯 **Interest & Knowledge**
- Trade what you understand
- Follow markets you're genuinely interested in
- Easier to stay motivated and learn

## Key Takeaways

1. **Match your schedule** - Trade when you can be attentive
2. **Start with one market** - Master one before expanding
3. **Use session overlaps** - Higher volatility = more opportunities
4. **Respect market hours** - Lower volume = higher risk
5. **Paper trade first** - Practice timing without risking money

Your goal is to find the market and session that fits your lifestyle, risk tolerance, and interests. There's no "best" market - only what's best for YOU.
        `
      },
      {
        id: "1-3",
        title: "Basic Trading Terminology",
        description: "Essential terms every trader needs to know",
        keyPoints: [
          "Learn key trading terms like spread, pip, lot, leverage",
          "Understand order types: market, limit, stop orders",
          "Know position terminology: long, short, margin",
          "Grasp risk management terms: stop loss, take profit"
        ],
        learningObjectives: [
          "Master essential trading vocabulary",
          "Understand different order types and when to use them",
          "Learn position management terminology",
          "Comprehend risk management concepts"
        ],
        difficulty: "Beginner",
        estimatedTime: "25 minutes",
        stage: 1,
        prerequisites: ["1-1", "1-2"],
        completed: false,
        mentorPrompt: "I need to learn the basic trading terminology. Can you help me understand terms like spread, pips, leverage, and different order types?",
        content: `
# Basic Trading Terminology

## Essential Price Terms

**Bid and Ask**
- **Bid**: The price buyers are willing to pay
- **Ask**: The price sellers are asking for
- **Spread**: The difference between bid and ask
- Example: EUR/USD Bid: 1.1850, Ask: 1.1852, Spread: 2 pips

**Pip (Point in Percentage)**
- Smallest price movement in most currency pairs
- For most pairs: 4th decimal place (0.0001)
- For JPY pairs: 2nd decimal place (0.01)
- Example: EUR/USD moves from 1.1850 to 1.1851 = 1 pip move

**Spread Types**
- **Fixed Spread**: Stays the same regardless of market conditions
- **Variable Spread**: Changes based on market volatility and liquidity
- **Tight Spread**: Small difference (good for trading)
- **Wide Spread**: Large difference (harder to profit)

## Order Types

**Market Orders**
- Buy or sell immediately at current market price
- Guaranteed execution
- Price not guaranteed (slippage possible)
- Use when: You want immediate entry/exit

**Limit Orders**
- Buy/sell only at specified price or better
- Guaranteed price if filled
- Execution not guaranteed
- Use when: You want a specific entry price

**Stop Orders (Stop Loss)**
- Becomes market order when price hits your level
- Used to limit losses on existing positions
- Example: Buy EUR/USD at 1.1800, set stop loss at 1.1750
- Protects you from losing more than 50 pips

**Take Profit Orders**
- Automatically close profitable positions
- Lock in gains at predetermined level
- Example: Buy at 1.1800, set take profit at 1.1900
- Secures 100 pip profit if reached

## Position Types

**Long Position**
- Buying an asset expecting price to rise
- Profit when price goes up
- "Going long" or "buying"
- Example: Buy EUR/USD expecting EUR to strengthen

**Short Position**
- Selling an asset expecting price to fall
- Profit when price goes down
- "Going short" or "selling"
- Example: Sell GBP/USD expecting GBP to weaken

**Position Size**
- Amount of currency/shares you're trading
- **Standard Lot**: 100,000 units of base currency
- **Mini Lot**: 10,000 units
- **Micro Lot**: 1,000 units
- **Nano Lot**: 100 units

## Leverage and Margin

**Leverage**
- Borrowing money to increase position size
- Expressed as ratio (1:100, 1:500, etc.)
- 1:100 means $1 controls $100 worth of currency
- Amplifies both profits AND losses

**Margin**
- Money required to open leveraged position
- **Required Margin**: Minimum needed to open trade
- **Free Margin**: Available money for new trades
- **Margin Level**: (Equity/Used Margin) × 100

**Margin Call**
- Warning when account equity falls too low
- Broker may close positions to prevent further losses
- Avoid by proper risk management

## Risk Management Terms

**Stop Loss**
- Maximum loss you're willing to accept
- Always set before entering trade
- Typically 1-3% of account balance per trade
- Example: $10,000 account, risk $200 per trade maximum

**Risk-Reward Ratio**
- Compares potential profit to potential loss
- 1:2 means risk $50 to potentially make $100
- Good traders aim for 1:2 or better ratios
- Helps ensure long-term profitability

**Drawdown**
- Peak-to-trough decline in account value
- **Maximum Drawdown**: Largest loss from peak
- Normal part of trading
- Good traders limit drawdown to 10-20%

## Chart and Analysis Terms

**Candlestick**
- Shows open, high, low, close prices
- **Body**: Difference between open and close
- **Wicks/Shadows**: High and low extremes
- Green/white = bullish, Red/black = bearish

**Timeframes**
- Duration each candle represents
- **M1**: 1 minute, **M5**: 5 minutes, **H1**: 1 hour
- **H4**: 4 hours, **D1**: Daily, **W1**: Weekly
- Higher timeframes = longer-term view

**Support and Resistance**
- **Support**: Price level where buying interest emerges
- **Resistance**: Price level where selling pressure increases
- Price tends to bounce off these levels
- Key concepts for entry and exit timing

## Common Trading Phrases

**Bull/Bullish**: Expecting prices to rise
**Bear/Bearish**: Expecting prices to fall
**Sideways/Ranging**: Price moving without clear direction
**Breakout**: Price moving beyond support/resistance
**Pullback**: Temporary price reversal in trending market
**Consolidation**: Price moving in tight range

## Account Terms

**Balance**: Total money in your account
**Equity**: Balance + unrealized profit/loss
**Free Margin**: Money available for new trades
**Used Margin**: Money tied up in open positions
**Floating P&L**: Unrealized profit or loss on open trades

## Practice Exercise

Before moving on, make sure you understand:
1. What's the spread on EUR/USD if bid=1.1850, ask=1.1852?
2. If you buy EUR/USD at 1.1800 with stop loss at 1.1750, what's your risk in pips?
3. What's the difference between a market order and limit order?
4. If you use 1:100 leverage to buy $10,000 worth of EUR/USD, how much margin is required?

**Answers:**
1. 2 pips (1.1852 - 1.1850 = 0.0002)
2. 50 pips risk (1.1800 - 1.1750 = 0.0050)
3. Market order executes immediately; limit order waits for your specified price
4. $100 margin required ($10,000 ÷ 100 = $100)

Understanding these terms is crucial. They form the foundation of all trading communication and education. Take time to memorize them - you'll use them every day as a trader.
        `
      },
      {
        id: "1-4",
        title: "Risk Management Basics",
        description: "Learn to protect your capital with proper risk management",
        keyPoints: [
          "Never risk more than 1-2% of account per trade",
          "Always use stop losses to limit downside",
          "Position sizing determines how much you can lose",
          "Risk-reward ratios help ensure long-term profitability"
        ],
        learningObjectives: [
          "Understand the 1-2% rule for position sizing",
          "Learn how to calculate proper stop loss levels",
          "Master risk-reward ratio concepts",
          "Develop a personal risk management plan"
        ],
        difficulty: "Beginner",
        estimatedTime: "30 minutes",
        stage: 1,
        prerequisites: ["1-1", "1-2", "1-3"],
        completed: false,
        mentorPrompt: "I want to learn about risk management in trading. How do I protect my capital and calculate proper position sizes?",
        content: `
# Risk Management Basics

## The Foundation of Successful Trading

Risk management isn't just important - it's EVERYTHING. You can have the best trading strategy in the world, but without proper risk management, you'll eventually lose everything. This lesson will teach you how to protect your capital and trade for the long term.

## The 1-2% Rule

**Why 1-2%?**
- Protects you from catastrophic losses
- Allows for inevitable losing streaks
- Keeps emotions manageable
- Ensures longevity in trading

**How It Works:**
If you have a $10,000 account:
- 1% risk = $100 maximum loss per trade
- 2% risk = $200 maximum loss per trade
- Even 10 losing trades in a row = only 10-20% drawdown

**Common Mistake:**
New traders often risk 10-20% per trade thinking they'll make money faster. This approach leads to blown accounts. Professional traders typically risk 0.5-1% per trade.

## Position Sizing Formula

**The Calculation:**
Position Size = (Account Risk ÷ Pip Risk) ÷ Pip Value

**Example:**
- Account: $10,000
- Risk per trade: 1% = $100
- EUR/USD trade with 50 pip stop loss
- Pip value for standard lot: $10
- Position Size = $100 ÷ (50 × $10) = 0.2 lots

**Different Account Sizes:**
- $1,000 account, 1% risk = $10 per trade
- $5,000 account, 1% risk = $50 per trade  
- $50,000 account, 1% risk = $500 per trade

## Stop Loss Strategies

**Technical Stop Losses**
- Place below support (for long trades)
- Place above resistance (for short trades)
- Use recent swing highs/lows
- Respect chart structure

**Percentage Stop Losses**
- Fixed percentage from entry price
- Example: 2% below entry for long trades
- Simple but may not respect market structure
- Good for beginners

**ATR (Average True Range) Stop Losses**
- Based on recent market volatility
- ATR shows average price movement
- Set stop at 1.5-2x ATR from entry
- Adapts to changing market conditions

**Time-Based Stops**
- Exit if trade doesn't move as expected within timeframe
- Prevents capital from being tied up
- Good for swing trading strategies
- Example: Exit if no progress after 3 days

## Risk-Reward Ratios

**What Is Risk-Reward?**
Risk-Reward Ratio = Potential Profit ÷ Potential Loss

**Examples:**
- Risk 50 pips to make 100 pips = 1:2 ratio
- Risk 30 pips to make 90 pips = 1:3 ratio
- Risk 100 pips to make 50 pips = 2:1 ratio (BAD!)

**Why It Matters:**
With 1:2 risk-reward, you only need to be right 40% of the time to be profitable:
- 10 trades: 6 losses (-$600), 4 wins (+$1,200) = +$600 profit
- Even with more losses than wins, you're profitable

**Minimum Ratios:**
- Beginners: Aim for 1:2 minimum
- Experienced: Can use 1:1.5 with higher win rate
- Never accept worse than 1:1 consistently

## Money Management Rules

**The 6% Rule**
- Never have more than 6% of account at risk across all open trades
- If each trade risks 2%, maximum 3 trades open
- Prevents overexposure to market

**Scaling In/Out**
- **Scaling In**: Adding to winning positions
- **Scaling Out**: Taking partial profits
- Reduces risk while maximizing profits
- Example: Close 50% at 1:1, let rest run to 1:3

**Account Growth Strategy**
- Start with consistent small profits
- Don't increase risk until account grows
- Compound gains over time
- Example: $10K → $11K = increase position size proportionally

## Emotional Aspects of Risk Management

**Why Traders Ignore Risk Management:**
- Fear of missing out (FOMO)
- Revenge trading after losses
- Overconfidence after wins
- Impatience for quick profits

**Psychological Benefits of Proper Risk:**
- Less stress and anxiety
- Ability to think clearly
- Confidence in your system
- Longevity in trading career

**The Trader's Equation:**
Profits = (Average Win × Win Rate) - (Average Loss × Loss Rate)

You can be profitable with:
- High win rate + small profits
- Low win rate + large profits
- The key is controlling the average loss!

## Building Your Risk Management Plan

**Step 1: Define Your Risk Tolerance**
- How much can you afford to lose without affecting your lifestyle?
- What percentage of that amount represents your trading account?
- What's your maximum acceptable drawdown?

**Step 2: Set Your Rules**
- Maximum risk per trade (1-2% recommended)
- Maximum risk across all trades (6% recommended)  
- Minimum risk-reward ratio (1:2 recommended)
- Maximum number of concurrent trades

**Step 3: Position Sizing Method**
- Choose your preferred calculation method
- Use position sizing calculator or spreadsheet
- Never deviate from calculated size
- Adjust only when account size changes

**Step 4: Stop Loss Strategy**
- Define how you'll set stops (technical, percentage, ATR)
- Never move stop loss against you
- Honor your stops without exception
- Review and adjust strategy based on results

## Common Risk Management Mistakes

**Moving Stop Losses**
- Never move stop loss to increase risk
- Only move in your favor to lock profits
- Honor your original risk assessment

**Revenge Trading**
- Don't increase size after losses
- Stick to your plan regardless of recent results
- Take breaks after emotional trades

**Ignoring Correlation**
- Don't trade highly correlated pairs simultaneously
- EUR/USD and GBP/USD often move together
- This effectively doubles your risk

**Position Size Creep**
- Don't gradually increase size without reason
- Stick to your calculated position size
- Only increase when account grows proportionally

## Risk Management Checklist

Before EVERY trade, ask yourself:
- [ ] How much am I risking on this trade?
- [ ] Is it within my 1-2% limit?
- [ ] Where is my stop loss?
- [ ] What's my risk-reward ratio?
- [ ] What's my total account risk across all trades?
- [ ] Am I emotionally ready for this trade?

## The Reality Check

**Truth About Trading:**
- Most traders lose money initially
- Risk management is what separates winners from losers
- You will have losing streaks - plan for them
- Protecting capital is more important than making profits

**Your Goal:**
Stay in the game long enough to develop skill and experience. Risk management ensures you don't blow up your account while learning.

Remember: **You can't make money if you don't have money to trade with.** Risk management keeps you in the game.
        `
      }
    ]
  },
  {
    id: 2,
    title: "Chart Analysis Fundamentals", 
    description: "Learn to read charts and identify key patterns",
    duration: "2 Weeks",
    completed: false,
    missions: [
      {
        id: "2-1",
        title: "Reading Candlestick Charts",
        description: "Master the art of reading price action through candlesticks",
        keyPoints: [
          "Understand candlestick anatomy: body, wicks, shadows",
          "Learn bullish vs bearish candlestick patterns",
          "Recognize reversal and continuation patterns",
          "Use candlesticks for entry and exit timing"
        ],
        learningObjectives: [
          "Identify different candlestick components",
          "Recognize basic single and multi-candle patterns",
          "Understand what candlesticks reveal about market psychology",
          "Apply candlestick analysis to real trading decisions"
        ],
        difficulty: "Beginner",
        estimatedTime: "45 minutes",
        stage: 2,
        prerequisites: ["1-4"],
        completed: false,
        mentorPrompt: "I want to learn how to read candlestick charts. Can you explain the patterns and what they tell us about market sentiment?",
        content: "This lesson covers candlestick chart reading fundamentals..."
      }
    ]
  }
];

export const ComprehensiveLearningPath: React.FC<ComprehensiveLearningPathProps> = ({ onAskMentor }) => {
  const [stages, setStages] = useState<LearningStage[]>(sampleLearningStages);
  const [currentStage, setCurrentStage] = useState(1);
  const [selectedMission, setSelectedMission] = useState<LearningMission | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLessonContent, setShowLessonContent] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const startMission = (mission: LearningMission) => {
    if (!isMissionUnlocked(mission)) {
      toast({
        title: "Mission Locked",
        description: "Complete previous missions to unlock this one.",
        variant: "destructive"
      });
      return;
    }

    setSelectedMission(mission);
    setShowLessonContent(true);
    setLessonCompleted(false);
    setQuizMode(false);
    setShowResults(false);
  };

  const handleLessonComplete = () => {
    setLessonCompleted(true);
    toast({
      title: "Lesson Complete! 📚",
      description: "Great job! Now take the quiz to test your knowledge.",
    });
  };

  const startQuiz = () => {
    if (!lessonCompleted) {
      toast({
        title: "Complete the Lesson First",
        description: "You need to finish reading the lesson before taking the quiz.",
        variant: "destructive"
      });
      return;
    }
    setQuizMode(true);
    setShowLessonContent(false);
    setShowResults(false);
  };

  const handleQuizComplete = (score: number) => {
    if (!selectedMission) return;
    
    setShowResults(true);
    setQuizMode(false);
    
    // Update mission completion
    selectedMission.completed = true;
    selectedMission.score = score;
    
    // Update stages state
    setStages(prevStages => 
      prevStages.map(stage => ({
        ...stage,
        missions: stage.missions.map(m => 
          m.id === selectedMission.id ? { ...m, completed: true, score } : m
        )
      }))
    );
    
    toast({
      title: score >= 80 ? "Mission Complete! 🎉" : score >= 60 ? "Good Progress! 📚" : "Keep Learning! 💪",
      description: `You scored ${score}%. ${
        score >= 80 ? "Excellent work! Moving to next mission." :
        score >= 60 ? "Good job! Review and continue." :
        "Study the material again and retake the quiz."
      }`,
      variant: score >= 60 ? "default" : "destructive"
    });
  };

  const askMentor = (mission: LearningMission) => {
    if (onAskMentor) {
      onAskMentor(mission.mentorPrompt);
    }
    toast({
      title: "AI Mentor Activated",
      description: "Your question has been sent to the AI mentor!",
    });
  };

  const isMissionUnlocked = (mission: LearningMission): boolean => {
    if (mission.prerequisites.length === 0) return true;
    
    return mission.prerequisites.every(prereqId => {
      const prereqMission = stages
        .flatMap(stage => stage.missions)
        .find(m => m.id === prereqId);
      return prereqMission?.completed || false;
    });
  };

  const getStageProgress = (stage: LearningStage): number => {
    const completedMissions = stage.missions.filter(m => m.completed).length;
    return (completedMissions / stage.missions.length) * 100;
  };

  const getOverallProgress = (): number => {
    const totalMissions = stages.reduce((sum, stage) => sum + stage.missions.length, 0);
    const completedMissions = stages.reduce(
      (sum, stage) => sum + stage.missions.filter(m => m.completed).length, 
      0
    );
    return totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;
  };

  const getVisualType = (missionTitle: string) => {
    if (missionTitle.toLowerCase().includes('chart') || missionTitle.toLowerCase().includes('candlestick')) {
      return 'chart';
    } else if (missionTitle.toLowerCase().includes('psychology') || missionTitle.toLowerCase().includes('mindset')) {
      return 'psychology';
    } else if (missionTitle.toLowerCase().includes('strategy') || missionTitle.toLowerCase().includes('smc')) {
      return 'strategy';
    }
    return 'concept';
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="glass-card border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            6-Month Professional Trading Mastery
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold">
              COMPLETE JOURNEY
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30">
              <div className="text-3xl font-bold text-purple-400 mb-1">{getOverallProgress().toFixed(0)}%</div>
              <div className="text-sm text-gray-400">Progress</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
              <div className="text-3xl font-bold text-green-400 mb-1">{stages.filter(s => s.completed).length}</div>
              <div className="text-sm text-gray-400">Stages Done</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {stages.reduce((sum, stage) => sum + stage.missions.filter(m => m.completed).length, 0)}
              </div>
              <div className="text-sm text-gray-400">Missions Complete</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
              <div className="text-3xl font-bold text-yellow-400 mb-1">{currentStage}</div>
              <div className="text-sm text-gray-400">Current Stage</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Journey Progress</span>
              <span>{getOverallProgress().toFixed(0)}% Complete</span>
            </div>
            <Progress value={getOverallProgress()} className="h-3 bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${getOverallProgress()}%` }}
              />
            </Progress>
          </div>

          {/* Motivational Quote */}
          <div className="text-center p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-2">Remember: Trading Mastery Takes Time</h3>
            <p className="text-gray-300 text-lg mb-2">
              "You will not get rich quick. But you will get rich if you're obsessed with improving."
            </p>
            <p className="text-gray-400 text-sm">
              Take notes, practice daily, and never stop learning. Every professional trader started exactly where you are now.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedMission ? 'mission' : 'stages'} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
          <TabsTrigger 
            value="stages" 
            onClick={() => setSelectedMission(null)}
            className="flex items-center gap-2 data-[state=active]:bg-purple-600"
          >
            <BookOpen className="w-4 h-4" />
            Learning Stages
          </TabsTrigger>
          <TabsTrigger 
            value="mission" 
            disabled={!selectedMission}
            className="flex items-center gap-2 data-[state=active]:bg-blue-600"
          >
            <Target className="w-4 h-4" />
            Current Mission
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stages">
          <div className="space-y-6">
            {stages.map((stage, index) => (
              <Card key={stage.id} className={`glass-card transition-all duration-300 hover:border-purple-400/40 ${
                currentStage === stage.id ? 'border-purple-500/50 bg-purple-500/5 shadow-lg shadow-purple-500/20' : 'border-gray-700/50'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                        stage.completed ? 'bg-green-500/20 text-green-400 border-2 border-green-500' : 
                        currentStage === stage.id ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-500' : 
                        'bg-gray-500/20 text-gray-400 border-2 border-gray-500'
                      }`}>
                        {stage.completed ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : currentStage === stage.id ? (
                          <Play className="w-8 h-8" />
                        ) : (
                          stage.id
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">Stage {stage.id}: {stage.title}</h3>
                        <p className="text-gray-400 text-lg">{stage.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">{stage.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-sm mb-2">
                        {stage.missions.filter(m => m.completed).length}/{stage.missions.length} Complete
                      </Badge>
                      <div className="text-sm text-gray-400">
                        {getStageProgress(stage).toFixed(0)}% Done
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-4">
                    <Progress value={getStageProgress(stage)} className="h-2" />
                  </div>

                  {/* Visual Learning Cards */}
                  <div className="grid gap-4 mb-6">
                    {stage.missions.map((mission) => (
                      <VisualLessonCard
                        key={mission.id}
                        title={mission.title}
                        description={mission.description}
                        keyPoints={mission.keyPoints}
                        visualType={getVisualType(mission.title)}
                        difficulty={mission.difficulty}
                      />
                    ))}
                  </div>

                  {/* Mission List */}
                  <div className="grid gap-3">
                    {stage.missions.map((mission, missionIndex) => (
                      <div
                        key={mission.id}
                        className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:border-purple-400/40 hover:bg-purple-500/5 ${
                          mission.completed ? 'border-green-500/40 bg-green-500/5' :
                          isMissionUnlocked(mission) ? 'border-purple-500/30 bg-purple-500/5' :
                          'border-gray-600/30 bg-gray-800/20 opacity-60'
                        }`}
                        onClick={() => isMissionUnlocked(mission) && startMission(mission)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                              mission.completed ? 'bg-green-500/20 text-green-400' :
                              isMissionUnlocked(mission) ? 'bg-purple-500/20 text-purple-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {mission.completed ? <CheckCircle className="w-6 h-6" /> : missionIndex + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-white text-lg group-hover:text-purple-300 transition-colors">
                                {mission.title}
                              </h4>
                              <p className="text-gray-400 text-sm mt-1">{mission.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge className={
                              mission.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              mission.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border-red-500/30'
                            }>
                              {mission.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {mission.estimatedTime}
                            </Badge>
                            {mission.completed && mission.score && (
                              <Badge className="bg-green-500/20 text-green-400 font-bold">
                                {mission.score}%
                              </Badge>
                            )}
                            {isMissionUnlocked(mission) ? (
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                            ) : (
                              <Lock className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mission">
          {selectedMission && (
            <div className="space-y-6">
              {/* Mission Header */}
              <Card className="glass-card border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Target className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">{selectedMission.title}</h2>
                        <p className="text-gray-400 text-lg">Stage {selectedMission.stage} • {selectedMission.estimatedTime}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => askMentor(selectedMission)}
                      variant="outline"
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ask Mentor
                    </Button>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Lesson Content */}
              {showLessonContent && !quizMode && !showResults && (
                <LessonContent
                  title={selectedMission.title}
                  content={selectedMission.content || "Lesson content is being prepared..."}
                  keyPoints={selectedMission.keyPoints}
                  learningObjectives={selectedMission.learningObjectives}
                  onComplete={handleLessonComplete}
                  onAskMentor={() => askMentor(selectedMission)}
                />
              )}

              {/* Interactive Quiz */}
              {quizMode && !showResults && (
                <InteractiveQuizGenerator
                  missionTitle={selectedMission.title}
                  keyPoints={selectedMission.keyPoints}
                  learningObjectives={selectedMission.learningObjectives}
                  onComplete={handleQuizComplete}
                  onAskMentor={() => askMentor(selectedMission)}
                />
              )}

              {/* Quiz Results */}
              {showResults && (
                <Card className="glass-card border-green-500/30 bg-gradient-to-r from-green-900/20 to-emerald-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400">
                      <Trophy className="w-6 h-6" />
                      Mission Complete!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-6">
                      <div className="text-6xl font-bold text-green-400">
                        {selectedMission.score}%
                      </div>
                      <div className="max-w-2xl mx-auto">
                        <p className="text-gray-300 text-lg mb-4">
                          {selectedMission.score && selectedMission.score >= 80 ? 
                            "🎉 Outstanding work! You've mastered this concept and are ready to move forward." :
                            selectedMission.score && selectedMission.score >= 60 ?
                            "👏 Good progress! You understand the basics. Review any unclear areas and continue." :
                            "💪 Keep learning! This topic needs more review. Don't give up - every pro started here."
                          }
                        </p>
                        
                        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                          <p className="text-gray-400 text-sm italic">
                            "Remember: You will not get rich quick. But you will get rich if you're obsessed with improving. 
                            Every wrong answer is a step closer to mastery."
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 justify-center">
                        <Button
                          onClick={() => setSelectedMission(null)}
                          className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
                        >
                          <Star className="w-5 h-5 mr-2" />
                          Continue Journey
                        </Button>
                        {!lessonCompleted && (
                          <Button
                            onClick={() => {
                              setShowLessonContent(true);
                              setShowResults(false);
                              setQuizMode(false);
                            }}
                            variant="outline"
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 px-8 py-3"
                          >
                            <BookOpen className="w-5 h-5 mr-2" />
                            Review Lesson
                          </Button>
                        )}
                        <Button
                          onClick={() => askMentor(selectedMission)}
                          variant="outline"
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 px-8 py-3"
                        >
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Ask Mentor
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons - shown when lesson content is displayed */}
              {showLessonContent && !quizMode && !showResults && (
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={startQuiz}
                        className={`px-8 py-3 text-lg ${
                          lessonCompleted 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-gray-600 cursor-not-allowed opacity-50'
                        }`}
                        disabled={!lessonCompleted}
                      >
                        <Award className="w-5 h-5 mr-2" />
                        Take Mission Quiz
                      </Button>
                      <Button
                        onClick={() => askMentor(selectedMission)}
                        variant="outline"
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 px-8 py-3"
                      >
                        <Brain className="w-5 h-5 mr-2" />
                        Ask Questions
                      </Button>
                    </div>
                    {!lessonCompleted && (
                      <p className="text-center text-gray-400 text-sm mt-4">
                        Complete the lesson above to unlock the quiz
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveLearningPath;
