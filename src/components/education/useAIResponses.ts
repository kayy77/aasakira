
import { geminiService } from '@/services/geminiService';

export const useAIResponses = () => {
  const generateBasicResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('forex') || lowerQuestion.includes('trading')) {
      return "Forex trading involves buying and selling currency pairs to profit from exchange rate fluctuations. The forex market is the largest financial market globally, operating 24/5.\n\nKey concepts:\n• Currency pairs (EUR/USD, GBP/USD, etc.)\n• Pip movements and spreads\n• Leverage and margin\n• Market sessions (London, New York, Tokyo)\n\nWould you like me to explain any of these concepts in more detail?";
    }
    
    if (lowerQuestion.includes('risk') || lowerQuestion.includes('management')) {
      return "Risk management is crucial for long-term trading success. Here are the key principles:\n\n🎯 Position Sizing: Never risk more than 1-2% per trade\n📊 Stop Losses: Always set stop losses before entering\n⚖️ Risk-Reward Ratio: Aim for at least 1:2 ratio\n📈 Diversification: Don't put all trades in one basket\n🧠 Psychology: Manage emotions and stick to your plan\n\nRemember: Protecting your capital is more important than making profits!";
    }
    
    if (lowerQuestion.includes('candlestick') || lowerQuestion.includes('patterns')) {
      return "Candlestick patterns reveal market psychology and potential price movements:\n\n🕯️ **Reversal Patterns:**\n• Doji - Indecision\n• Hammer - Bullish reversal\n• Shooting Star - Bearish reversal\n• Engulfing patterns\n\n📈 **Continuation Patterns:**\n• Spinning tops\n• Marubozu candles\n• Three white soldiers\n\nEach candle tells a story of the battle between buyers and sellers. Would you like me to explain any specific pattern?";
    }
    
    if (lowerQuestion.includes('leverage')) {
      return "Leverage allows you to control larger positions with smaller capital, but it's a double-edged sword:\n\n⚡ **How it works:**\n• 1:100 leverage = $1 controls $100\n• Amplifies both profits AND losses\n• Margin requirements vary by broker\n\n⚠️ **Risks:**\n• Can wipe out accounts quickly\n• Margin calls and stop-outs\n• Emotional pressure increases\n\n💡 **Best practices:**\n• Start with low leverage (1:10 or 1:20)\n• Never use maximum leverage\n• Understand margin requirements\n\nRemember: Leverage is a tool, not a strategy!";
    }
    
    if (lowerQuestion.includes('journal') || lowerQuestion.includes('track')) {
      return "A trading journal is your path to consistent profitability! Here's what to track:\n\n📝 **Trade Details:**\n• Entry/exit prices and times\n• Position size and risk amount\n• Stop loss and take profit levels\n• Market conditions and setup\n\n🧠 **Psychology:**\n• Emotions before/during/after trade\n• What you learned from each trade\n• Mistakes and improvements\n\n📊 **Performance Metrics:**\n• Win rate and risk-reward ratios\n• Monthly/weekly performance\n• Drawdown periods\n\nWould you like me to help you set up a trading journal structure?";
    }
    
    if (lowerQuestion.includes('backtest') || lowerQuestion.includes('strategy')) {
      return "Backtesting validates your trading strategies using historical data:\n\n🔍 **What to test:**\n• Entry and exit rules\n• Risk management parameters\n• Different market conditions\n• Various timeframes\n\n📈 **Key metrics to analyze:**\n• Total return and max drawdown\n• Win rate and average win/loss\n• Sharpe ratio and profit factor\n• Number of trades and consistency\n\n⚠️ **Important notes:**\n• Past performance ≠ future results\n• Account for spreads and slippage\n• Test on out-of-sample data\n• Consider market regime changes\n\nReady to backtest a strategy? I can guide you through the process!";
    }
    
    return "That's a great question! I'm here to help you master trading concepts, risk management, technical analysis, and trading psychology.\n\nTry asking me about:\n• Forex basics and currency pairs\n• Risk management strategies\n• Technical analysis and chart patterns\n• Trading psychology and discipline\n• Market structure and smart money concepts\n\nWhat specific area would you like to explore?";
  };

  const generateAIResponse = async (message: string): Promise<string> => {
    try {
      return await geminiService.generateTradingResponse(message);
    } catch (error) {
      console.error('Error generating AI response:', error);
      return generateBasicResponse(message);
    }
  };

  return { generateAIResponse, generateBasicResponse };
};
