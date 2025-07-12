
import { geminiService } from '@/services/geminiService';

interface UserTradingProfile {
  level: 'beginner' | 'intermediate' | 'advanced';
  preferredStyle: 'scalping' | 'swing' | 'position' | 'daytrading' | 'unknown';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'unknown';
  focusAreas: string[];
  progressStage: number; // 1-10 scale
  lastStrategy: string;
}

const getUserProfile = (userId: string): UserTradingProfile => {
  const saved = localStorage.getItem(`trading_profile_${userId}`);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    level: 'beginner',
    preferredStyle: 'unknown',
    riskTolerance: 'unknown',
    focusAreas: [],
    progressStage: 1,
    lastStrategy: ''
  };
};

const saveUserProfile = (userId: string, profile: UserTradingProfile) => {
  localStorage.setItem(`trading_profile_${userId}`, JSON.stringify(profile));
};

const analyzeUserMessage = (message: string): Partial<UserTradingProfile> => {
  const lower = message.toLowerCase();
  const updates: Partial<UserTradingProfile> = {};
  
  // Detect trading style preferences
  if (lower.includes('scalp') || lower.includes('quick') || lower.includes('fast')) {
    updates.preferredStyle = 'scalping';
  } else if (lower.includes('swing') || lower.includes('days') || lower.includes('week')) {
    updates.preferredStyle = 'swing';
  } else if (lower.includes('position') || lower.includes('long term') || lower.includes('month')) {
    updates.preferredStyle = 'position';
  } else if (lower.includes('day trad') || lower.includes('intraday')) {
    updates.preferredStyle = 'daytrading';
  }
  
  // Detect risk tolerance
  if (lower.includes('conservative') || lower.includes('safe') || lower.includes('low risk')) {
    updates.riskTolerance = 'conservative';
  } else if (lower.includes('aggressive') || lower.includes('high risk') || lower.includes('risky')) {
    updates.riskTolerance = 'aggressive';
  } else if (lower.includes('moderate') || lower.includes('balanced')) {
    updates.riskTolerance = 'moderate';
  }
  
  return updates;
};

export const useAIResponses = () => {
  const generatePersonalizedPrompt = (message: string, userId: string): string => {
    const profile = getUserProfile(userId);
    const updates = analyzeUserMessage(message);
    
    // Update and save profile
    const updatedProfile = { ...profile, ...updates };
    saveUserProfile(userId, updatedProfile);
    
    return `You are Aasakira 2.0, an elite AI trading mentor powered by Google Gemini. You specialize in developing traders from complete beginners to professional level using proven strategies.

CURRENT USER PROFILE:
- Level: ${updatedProfile.level}
- Trading Style: ${updatedProfile.preferredStyle}
- Risk Tolerance: ${updatedProfile.riskTolerance}
- Progress Stage: ${updatedProfile.progressStage}/10
- Previous Strategy Focus: ${updatedProfile.lastStrategy || 'None yet'}

CORE TRADING STRATEGIES TO TEACH:
1. **Breakout + Retest Strategy**: Identify clean breaks of structure, wait for retest of broken level, enter on confirmation
2. **Trend Continuation with Confluence**: Use higher timeframe trend + multiple confirmations (moving averages, support/resistance, momentum)
3. **Smart Money Concepts**: Understand institutional order flow, liquidity sweeps, fair value gaps

USER MESSAGE: ${message}

INSTRUCTIONS:
- Personalize your response based on their current level and style preferences
- If they're a beginner (stage 1-3), focus on fundamentals and risk management
- If intermediate (stage 4-7), introduce more advanced concepts and strategy refinement
- If advanced (stage 8-10), discuss psychology, advanced confluences, and market structure
- Always explain the "WHY" behind each concept - never just give rules
- Provide specific, actionable steps they can practice
- If discussing a trade setup, explain entry, stop loss, take profit, and risk management
- Use emojis and clear formatting for engagement
- End with a question to keep the conversation flowing and assess their understanding

Remember: You're building a professional trader, not just teaching random tips. Each response should build on their previous knowledge and move them toward consistent profitability.`;
  };

  const generateBasicResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('breakout') || lowerQuestion.includes('retest')) {
      return `🎯 **Breakout + Retest Strategy** - One of the most reliable setups!

📈 **How it works:**
1. **Identify the Level**: Look for obvious support/resistance that price has respected multiple times
2. **Clean Break**: Wait for a decisive break with strong momentum (not just a wick)
3. **Patience for Retest**: Most breakouts will retest the broken level - this is your entry opportunity
4. **Confirmation**: Enter when price shows rejection at the retest (reversal candle, higher low formation)

⚡ **Entry Rules:**
• Entry: On confirmation of retest rejection
• Stop Loss: Below the retest low (for bullish breakout)
• Take Profit: Next significant resistance level
• Risk-Reward: Minimum 1:2 ratio

🧠 **Why it works**: Institutions often push price through levels to grab liquidity, then price returns to test if the break was legitimate. This gives retail traders a high-probability entry point.

What type of timeframes are you most interested in trading? This will help me tailor the strategy specifics for your style! 📊`;
    }
    
    if (lowerQuestion.includes('trend') || lowerQuestion.includes('confluence')) {
      return `📈 **Trend Continuation with Confluence** - The professional's approach!

🔍 **Multi-Timeframe Analysis:**
1. **Higher Timeframe Bias**: Identify the main trend (Daily/4H)
2. **Lower Timeframe Entry**: Find precise entries on 1H/15M in trend direction
3. **Confluence Factors**: Stack multiple confirmations

✅ **Key Confluences to Stack:**
• **Moving Averages**: Price above 20/50/200 EMA for uptrend
• **Support/Resistance**: Entering near significant levels
• **Momentum**: RSI showing strength in trend direction
• **Volume**: Increasing volume in trend direction
• **Market Structure**: Higher highs/higher lows pattern

🎯 **Setup Example (Bullish):**
• Daily trend: Uptrend above 200 EMA
• 1H: Pullback to 50 EMA support
• Entry: Bullish engulfing candle at EMA
• Stop: Below the EMA with buffer
• Target: Next swing high resistance

💡 **Pro Tip**: Never trade against the higher timeframe trend unless you see major reversal signals. The trend is your friend until it clearly ends!

What's your experience level with multiple timeframe analysis? Are you completely new to this concept? 🤔`;
    }

    if (lowerQuestion.includes('smart money') || lowerQuestion.includes('institutional')) {
      return `🏦 **Smart Money Concepts** - Think like the institutions!

💰 **Understanding Institutional Flow:**
Institutions (banks, hedge funds) move markets. They need liquidity to fill large orders, so they:
1. **Sweep Liquidity**: Push price to obvious levels where retail stops are
2. **Create Fair Value Gaps**: Leave imbalances when moving price aggressively  
3. **Establish Order Blocks**: Areas where they placed significant orders

🎯 **Key Concepts:**
• **Liquidity Sweeps**: Price quickly hits obvious highs/lows then reverses
• **Order Blocks**: Strong directional candles where institutions entered
• **Fair Value Gaps (FVG)**: Gaps in price that often get filled later
• **Break of Structure (BOS)**: When price breaks previous swing points

📊 **How to Trade It:**
1. **Identify Liquidity**: Where are obvious stop losses? (swing highs/lows)
2. **Wait for Sweep**: Price quickly takes out those levels
3. **Find Order Block**: Look for the last strong move before the sweep
4. **Enter on Retest**: When price returns to that order block area

⚠️ **Important**: This is advanced stuff! Master basic support/resistance and trend analysis first.

Are you familiar with reading institutional footprints on charts, or is this completely new territory for you? 🔍`;
    }
    
    return `🚀 **Welcome to Professional Trading Education!**

I'm here to guide you from beginner to professional trader using proven strategies that actually work in live markets.

📚 **Core Strategies I'll Teach You:**
• **Breakout + Retest**: High-probability entries after structure breaks
• **Trend Continuation**: Multi-timeframe confluence trading
• **Smart Money Concepts**: Understanding institutional order flow

🎯 **Let's Start With You:**
To give you the most valuable guidance, I need to understand your current situation:

1. **Experience Level**: Complete beginner, some knowledge, or experienced?
2. **Trading Style Interest**: Quick scalps, swing trades, or long-term positions?
3. **Risk Comfort**: Conservative and safe, or willing to take calculated risks?
4. **Time Available**: How much time can you dedicate to learning/trading daily?

💡 **Remember**: Professional trading is about consistency, not home runs. We'll build your skills systematically, focusing on risk management and psychology alongside technical skills.

What's your current experience with trading? Let's create a personalized learning path for you! 📈`;
  };

  const generateAIResponse = async (message: string, userId?: string): Promise<string> => {
    if (!userId) {
      return generateBasicResponse(message);
    }

    try {
      const personalizedPrompt = generatePersonalizedPrompt(message, userId);
      return await geminiService.generateTradingResponse(personalizedPrompt);
    } catch (error) {
      console.error('Error generating personalized AI response:', error);
      return generateBasicResponse(message);
    }
  };

  return { 
    generateAIResponse, 
    generateBasicResponse,
    getUserProfile: (userId: string) => getUserProfile(userId),
    saveUserProfile: (userId: string, profile: UserTradingProfile) => saveUserProfile(userId, profile)
  };
};
