
interface AIResponse {
  content: string;
  confidence: number;
  topics: string[];
}

class EducationAIService {
  private responses = [
    {
      keywords: ['support', 'resistance', 'level'],
      response: "Support and resistance levels are crucial price points where buying or selling pressure tends to emerge. Support acts as a floor where price tends to bounce, while resistance acts as a ceiling where price tends to reverse. These levels are formed by previous price action and represent areas of significant trader interest.",
      topics: ['Technical Analysis', 'Price Action']
    },
    {
      keywords: ['risk', 'management', 'position', 'sizing'],
      response: "Risk management is the foundation of successful trading. Never risk more than 1-2% of your account on any single trade. Use proper position sizing, set stop losses before entering trades, and maintain a risk-reward ratio of at least 1:2. Remember: protecting your capital is more important than making profits.",
      topics: ['Risk Management', 'Money Management']
    },
    {
      keywords: ['smart', 'money', 'institutional', 'liquidity'],
      response: "Smart Money Concepts focus on understanding how institutional traders move the market. Look for liquidity sweeps, fair value gaps (FVGs), and order blocks. Institutions often create false breakouts to grab liquidity before moving price in the intended direction. Follow the smart money, not the retail crowd.",
      topics: ['Smart Money Concepts', 'Market Structure']
    },
    {
      keywords: ['psychology', 'emotion', 'discipline', 'fear', 'greed'],
      response: "Trading psychology is often the difference between success and failure. Fear and greed are your biggest enemies. Develop a trading plan and stick to it. Don't chase trades or revenge trade after losses. Keep a trading journal to identify emotional patterns and work on mental discipline through meditation and proper risk management.",
      topics: ['Trading Psychology', 'Discipline']
    },
    {
      keywords: ['trend', 'momentum', 'direction'],
      response: "The trend is your friend! Identify the overall market direction using higher timeframes, then look for entries in the direction of the trend on lower timeframes. Use moving averages, trendlines, and market structure to determine trend direction. Remember: it's easier to go with the flow than against it.",
      topics: ['Trend Analysis', 'Market Direction']
    },
    {
      keywords: ['entry', 'exit', 'timing'],
      response: "Timing is everything in trading. Look for confluence of multiple factors before entering: trend direction, support/resistance levels, momentum indicators, and volume confirmation. For exits, stick to your predetermined targets and stop losses. Don't let emotions override your trading plan.",
      topics: ['Entry Strategy', 'Exit Strategy']
    },
    {
      keywords: ['chart', 'pattern', 'analysis'],
      response: "Chart patterns tell the story of market sentiment. Learn to identify key patterns like double tops/bottoms, head and shoulders, triangles, and flags. But remember: patterns work best when combined with volume analysis and market context. Always confirm patterns with price action before trading.",
      topics: ['Chart Patterns', 'Technical Analysis']
    }
  ];

  async generateResponse(userMessage: string): Promise<AIResponse> {
    console.log('🤖 AI Mentor analyzing message:', userMessage);
    
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const messageLower = userMessage.toLowerCase();
    
    // Find best matching response
    let bestMatch = this.responses[0];
    let highestScore = 0;
    
    for (const responseData of this.responses) {
      let score = 0;
      for (const keyword of responseData.keywords) {
        if (messageLower.includes(keyword)) {
          score += 1;
        }
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = responseData;
      }
    }
    
    // If no keywords match, provide a general trading response
    if (highestScore === 0) {
      const generalResponses = [
        {
          response: "That's a great question! In trading, continuous learning is key. Focus on understanding market structure, proper risk management, and developing a disciplined approach. What specific aspect of trading would you like to explore further?",
          topics: ['General Trading', 'Education']
        },
        {
          response: "Excellent point! The markets are constantly evolving, so it's important to adapt your strategy. Remember the core principles: follow the trend, manage your risk, and stay disciplined. Which trading concept would you like me to explain in more detail?",
          topics: ['Market Analysis', 'Strategy']
        },
        {
          response: "Great observation! Professional traders focus on process over profits. Develop a solid trading plan, backtest your strategies, and keep detailed records. Consistent execution of a proven plan beats trying to predict every market move.",
          topics: ['Professional Trading', 'Planning']
        }
      ];
      
      bestMatch = generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
    
    const confidence = Math.min(90, 60 + (highestScore * 10));
    
    console.log(`✅ AI Response generated with ${confidence}% confidence`);
    
    return {
      content: bestMatch.response,
      confidence,
      topics: bestMatch.topics || ['Trading Education']
    };
  }

  async analyzeChart(chartDescription: string): Promise<AIResponse> {
    console.log('📊 AI analyzing chart:', chartDescription);
    
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    
    const analyses = [
      "I can see strong support forming at this level. The multiple touches suggest institutional interest. Look for a potential bounce here, but wait for confirmation with volume and price action before entering.",
      "This chart shows a clear break of structure to the upside. The previous resistance has now become support. This is a bullish sign, but watch for a retest of the breakout level for a lower-risk entry.",
      "The price action here indicates accumulation by smart money. Notice how the selling pressure is being absorbed. This could be setting up for a significant move higher once the accumulation phase completes.",
      "I see a potential fair value gap (FVG) in this area. These gaps often act as magnets for price. The market may return to fill this gap before continuing in the primary trend direction.",
      "This looks like a liquidity sweep pattern. The sharp move likely grabbed stop losses before reversing. This is classic smart money behavior - creating false signals to trap retail traders."
    ];
    
    const analysis = analyses[Math.floor(Math.random() * analyses.length)];
    
    return {
      content: analysis,
      confidence: 75 + Math.random() * 20,
      topics: ['Chart Analysis', 'Technical Analysis', 'Market Structure']
    };
  }
}

export const educationAIService = new EducationAIService();
