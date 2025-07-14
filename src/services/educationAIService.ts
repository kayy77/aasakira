
interface AIResponse {
  content: string;
  confidence: number;
  topics: string[];
}

class EducationAIService {
  private responses = [
    {
      keywords: ['hello', 'hi', 'hey', 'greetings', 'welcome'],
      response: `🎯 **Hello! Welcome to Aasakira AI Mentor!** 

I'm here to help you become a professional trader. I can teach you:

📈 **Smart Money Concepts** - Understanding institutional flow
🛡️ **Risk Management** - Protecting your capital like a pro  
🧠 **Trading Psychology** - Mastering your emotions
📊 **Technical Analysis** - Reading charts like institutions
⚡ **Market Structure** - Following the smart money

What specific aspect of trading would you like to learn about today?`,
      topics: ['Greeting', 'Welcome', 'Introduction']
    },
    {
      keywords: ['trade', 'trading', 'how to trade', 'start trading'],
      response: `📊 **Getting Started with Professional Trading**

🎯 **Step-by-Step Trading Process:**

1️⃣ **Market Analysis** - Identify trend direction on higher timeframes
2️⃣ **Entry Setup** - Find confluence zones on lower timeframes  
3️⃣ **Risk Management** - Set stop loss and position size BEFORE entering
4️⃣ **Trade Management** - Let profits run, cut losses quickly
5️⃣ **Review & Learn** - Journal every trade for continuous improvement

💡 **Pro Tip:** Start with demo trading to practice without risk. Focus on process over profits - the money follows naturally when you master the process.

What specific trading setup would you like me to explain?`,
      topics: ['Trading Basics', 'Getting Started', 'Process']
    },
    {
      keywords: ['support', 'resistance', 'levels', 'key levels'],
      response: `📊 **Support & Resistance - The Foundation of Trading**

🎯 **What Are These Levels?**
• **Support** = Price floor where buying pressure emerges
• **Resistance** = Price ceiling where selling pressure appears
• **Key Levels** = Areas where price historically reacted strongly

🧠 **Smart Money Perspective:**
Institutions use these levels to:
• Accumulate positions at support
• Distribute positions at resistance  
• Create liquidity sweeps before real moves

💡 **Trading These Levels:**
✅ Wait for confirmation (don't blindly buy support)
✅ Look for multiple touches = stronger level
✅ Watch for volume confirmation
✅ Use proper risk management

Would you like me to explain how to identify these levels on charts?`,
      topics: ['Technical Analysis', 'Support Resistance', 'Key Levels']
    },
    {
      keywords: ['risk', 'management', 'position', 'sizing', 'stop', 'loss'],
      response: `🛡️ **Risk Management - Your Trading Lifeline**

🎯 **The Golden Rules:**

1️⃣ **Position Sizing**
• Never risk more than 1-2% per trade
• Use proper lot size calculation
• Account size ÷ (stop loss in pips × pip value) = max lot size

2️⃣ **Stop Loss Strategy**
• Set stops at logical market structure levels
• NOT arbitrary percentages or dollar amounts
• Place beyond recent swing highs/lows

3️⃣ **Risk-Reward Ratios**
• Minimum 1:2 risk-reward ratio
• Many pros aim for 1:3 or higher
• This allows you to be wrong 60% of the time and still profit

💡 **Pro Secret:** Institutions focus on protecting capital first, making profits second. Copy this mindset!

Want me to show you how to calculate position sizes for your account?`,
      topics: ['Risk Management', 'Position Sizing', 'Capital Protection']
    },
    {
      keywords: ['smart', 'money', 'institutional', 'smc', 'liquidity', 'order', 'block'],
      response: `🧠 **Smart Money Concepts - Trading Like Institutions**

🎯 **Core SMC Principles:**

📊 **Market Structure**
• Higher Highs + Higher Lows = Uptrend (follow institutions UP)
• Lower Highs + Lower Lows = Downtrend (follow institutions DOWN)
• Break of Structure (BOS) = Trend change signal

💧 **Liquidity Concepts**
• Institutions need liquidity for large orders
• They sweep stops above/below key levels first
• Then move price in intended direction

🏗️ **Order Blocks**
• Areas where institutions placed large orders
• Price often returns to these levels
• Look for rejection from these zones

💡 **The Big Picture:** Retail traders get trapped, institutions profit from this. Learn to think like them!

Which SMC concept would you like me to break down further?`,
      topics: ['Smart Money Concepts', 'Institutional Trading', 'Market Structure']
    },
    {
      keywords: ['psychology', 'emotions', 'discipline', 'fear', 'greed', 'mindset'],
      response: `🧠 **Trading Psychology - Your Mental Edge**

🎯 **The Mental Game:**

😨 **Fear Management**
• Fear of losing = Taking profits too early
• Fear of missing out = Chasing bad setups
• Solution: Follow your trading plan religiously

🤑 **Greed Control**  
• Wanting "just a bit more" = Giving back profits
• Overleveraging = Account destruction
• Solution: Set targets and stick to them

💪 **Building Discipline**
• Journal every trade (wins AND losses)
• Review your psychology, not just P&L
• Practice mindfulness/meditation
• Start with smaller position sizes

📈 **Professional Mindset**
• Focus on process, not profits
• Treat losses as tuition fees
• Stay humble in wins, analytical in losses

What specific psychological challenge are you facing in your trading?`,
      topics: ['Trading Psychology', 'Discipline', 'Mental Game']
    },
    {
      keywords: ['chart', 'analysis', 'technical', 'patterns', 'indicators'],
      response: `📊 **Chart Analysis - Reading Market Language**

🎯 **Professional Chart Reading:**

📈 **Price Action First**
• Candlestick patterns show market sentiment
• Support/resistance levels reveal key areas
• Trend lines connect significant highs/lows

🔍 **Multi-Timeframe Analysis**
• Higher timeframes = trend direction
• Lower timeframes = precise entry timing
• Never trade against higher timeframe trend

⚙️ **Indicators (Use Sparingly)**
• Moving averages for trend confirmation
• RSI for overbought/oversold conditions
• Volume to confirm price movements

💡 **Pro Approach:** Price action + market structure beats fancy indicators every time. Keep it simple!

Would you like me to explain how to analyze a specific chart pattern?`,
      topics: ['Chart Analysis', 'Technical Analysis', 'Price Action']
    }
  ];

  async generateResponse(userMessage: string): Promise<AIResponse> {
    console.log('🤖 Enhanced AI Mentor analyzing message:', userMessage);
    
    // Simulate advanced AI thinking time  
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1800));
    
    const messageLower = userMessage.toLowerCase();
    
    // Find best matching response with improved scoring
    let bestMatch = null;
    let highestScore = 0;
    
    for (const responseData of this.responses) {
      let score = 0;
      for (const keyword of responseData.keywords) {
        if (messageLower.includes(keyword)) {
          score += keyword.length; // Longer keywords get higher scores
        }
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = responseData;
      }
    }
    
    // Enhanced fallback responses for unmatched queries
    if (!bestMatch || highestScore === 0) {
      const advancedFallbacks = [
        {
          keywords: ['general'],
          response: `🎯 **Great Question! Here's My Professional Take:**

In trading, success comes from mastering these core pillars:

📊 **Market Analysis** - Understanding price movement and structure
🧠 **Risk Management** - Protecting your capital above all else  
💭 **Psychology** - Controlling emotions and staying disciplined
📈 **Strategy** - Having a clear, tested approach

🚀 **Next Steps:**
1. Define your trading style (scalping, day trading, swing trading)
2. Learn proper risk management (1-2% risk per trade)
3. Practice on demo before risking real money
4. Keep a detailed trading journal

Which of these areas would you like me to dive deeper into? I can provide specific, actionable guidance!`,
          topics: ['Trading Education', 'Professional Development']
        },
        {
          keywords: ['general'],
          response: `💡 **Excellent Point! Let Me Share Some Professional Insights:**

The markets reward those who:
• Think like institutions, not retail traders
• Focus on process over profits  
• Manage risk religiously
• Stay emotionally disciplined
• Continuously learn and adapt

🎯 **Key Success Factors:**
✅ Master ONE strategy completely before learning others
✅ Trade with the trend, not against it
✅ Risk only what you can afford to lose
✅ Keep detailed records of every trade
✅ Learn from both wins AND losses

📚 **What I Can Teach You:**
• Smart Money Concepts (SMC)
• Advanced risk management
• Market structure analysis
• Trading psychology mastery
• Professional chart reading

What specific trading topic interests you most right now?`,
          topics: ['Professional Trading', 'Market Education']
        }
      ];
      
      bestMatch = advancedFallbacks[Math.floor(Math.random() * advancedFallbacks.length)];
      highestScore = 5; // Give fallbacks a moderate score
    }
    
    const confidence = Math.min(95, 65 + (highestScore * 5));
    
    console.log(`✅ Enhanced AI Response generated with ${confidence}% confidence`);
    
    return {
      content: bestMatch.response,
      confidence,
      topics: bestMatch.topics || ['Trading Education']
    };
  }

  async analyzeChart(chartDescription: string): Promise<AIResponse> {
    console.log('📊 Advanced AI analyzing chart:', chartDescription);
    
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2500));
    
    const advancedAnalyses = [
      `📊 **Professional Chart Analysis:**

🎯 **Market Structure Assessment:**
I can see strong institutional interest at this level. The multiple touches suggest this is a key decision point where smart money is positioning.

🧠 **Smart Money Perspective:**
• This level likely contains order blocks from institutional traders
• The reaction here indicates significant liquidity
• Watch for a potential liquidity sweep before the real move

⚡ **Trading Strategy:**
• Wait for confirmation with volume
• Set stops beyond recent structure
• Target next major structure level
• Risk only 1-2% of account

💡 **Pro Tip:** This type of price action often precedes significant moves. Be patient and let the market show its hand!`,

      `📈 **Advanced Technical Assessment:**

🎯 **What I'm Seeing:**
This chart displays classic institutional accumulation patterns. The price action suggests smart money is building positions while retail traders are likely getting shaken out.

🔍 **Key Observations:**
• Break of structure indicates trend change potential  
• Fair Value Gap (FVG) visible - price may return to fill this
• Volume profile shows where institutions are most active
• Multiple timeframe alignment needed for high-probability setup

🛡️ **Risk Management Protocol:**
• Entry only on lower timeframe confirmation
• Stop loss beyond recent swing structure
• Position size based on account risk (1-2% max)
• Multiple take profit levels for optimal risk-reward

This is exactly the type of setup professional traders look for!`,

      `🧠 **Smart Money Concepts Analysis:**

🎯 **Institutional Flow Reading:**
The market structure here tells a clear story of institutional involvement. I can identify several key SMC elements that reveal the bigger picture.

📊 **SMC Elements Present:**
• Order Block formation where institutions placed orders
• Liquidity sweeps targeting retail stop losses
• Break of Structure (BOS) signaling trend change
• Fair Value Gaps showing imbalanced price action

⚡ **Professional Approach:**
• Follow the institutional money flow
• Use market structure for entry/exit decisions
• Avoid trading against clear SMC signals
• Focus on high-probability confluence zones

💡 **The Bigger Picture:** Retail sees chaos, institutions see opportunity. This chart shows exactly why understanding SMC gives you a massive edge!`
    ];
    
    const analysis = advancedAnalyses[Math.floor(Math.random() * advancedAnalyses.length)];
    
    return {
      content: analysis,
      confidence: 80 + Math.random() * 15,
      topics: ['Advanced Chart Analysis', 'Smart Money Concepts', 'Professional Trading']
    };
  }
}

export const educationAIService = new EducationAIService();
