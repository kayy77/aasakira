// Institutional Trading Doctrine for Enhanced Signal Engine
// Deep SMC/ICT knowledge base for AI decision making

export interface TradingDoctrine {
  marketStructure: MarketStructureRules;
  liquidityRules: LiquidityRules;
  sessionBehavior: SessionBehavior;
  confluenceWeights: ConfluenceWeights;
  riskManagement: RiskManagementRules;
}

export interface MarketStructureRules {
  bos: {
    definition: string;
    validation: string[];
    invalidation: string[];
    sessionSpecific: Record<string, string>;
  };
  choch: {
    definition: string;
    identification: string[];
    timeframes: string[];
  };
  orderBlocks: {
    definition: string;
    validation: string[];
    invalidation: string[];
    freshness: string;
  };
}

export interface LiquidityRules {
  sweeps: {
    internal: string;
    external: string;
    sessionTiming: Record<string, string[]>;
  };
  fvg: {
    types: string[];
    entry: string[];
    invalidation: string[];
  };
  premiumDiscount: {
    zones: string[];
    identification: string[];
  };
}

export interface SessionBehavior {
  london: {
    characteristics: string[];
    primaryPairs: string[];
    killzone: string;
    behavior: string[];
  };
  newYork: {
    characteristics: string[];
    primaryPairs: string[];
    killzone: string;
    behavior: string[];
  };
  asian: {
    characteristics: string[];
    primaryPairs: string[];
    killzone: string;
    behavior: string[];
  };
}

export interface ConfluenceWeights {
  primary: Record<string, number>;
  secondary: Record<string, number>;
  sessionModifiers: Record<string, Record<string, number>>;
}

export interface RiskManagementRules {
  rrRequirements: Record<string, number>;
  positionSizing: string[];
  tradeManagement: string[];
}

export const INSTITUTIONAL_TRADING_DOCTRINE: TradingDoctrine = {
  marketStructure: {
    bos: {
      definition: "Break of Structure (BOS) occurs when price breaks the most recent swing high (bullish BOS) or swing low (bearish BOS) with momentum and volume confirmation.",
      validation: [
        "Previous swing high/low clearly defined with at least 3 touches or reactions",
        "Break must exceed previous structure by minimum 5-10 pips",
        "Volume spike on break candle (20%+ above average)",
        "No immediate reversal back into previous range within 2-3 candles",
        "Multiple timeframe alignment (M15 break confirmed on H1)"
      ],
      invalidation: [
        "False break with immediate reversal",
        "Break occurs during low liquidity periods (Asian consolidation)",
        "No volume confirmation",
        "Conflicting signals on higher timeframes"
      ],
      sessionSpecific: {
        "London": "Focus on GBP/EUR pairs. Strong BOS often occurs during 8-10 AM GMT. Look for overnight liquidity sweeps before confirmation.",
        "NewYork": "USD pairs dominate. BOS during 13-15 GMT (overlap) has highest follow-through. News-driven breaks require extra caution.",
        "Asian": "JPY pairs and AUD. BOS is weaker but range breaks can provide clean entries. Focus on 2-6 GMT period."
      }
    },
    choch: {
      definition: "Change of Character (CHoCH) indicates trend reversal when market structure shifts from bullish to bearish or vice versa through swing failure.",
      identification: [
        "Failure to make new high/low in trending market",
        "Break of last internal structure level",
        "Shift in order flow and momentum",
        "Previous support becomes resistance or vice versa"
      ],
      timeframes: [
        "Daily: Major trend reversals",
        "H4: Swing reversals within daily trend",
        "H1: Intraday trend changes",
        "M15: Scalping structure shifts"
      ]
    },
    orderBlocks: {
      definition: "Order Block (OB) is the last bullish candle before bearish movement (bearish OB) or last bearish candle before bullish movement (bullish OB). Represents institutional order clusters.",
      validation: [
        "Strong momentum candle with large body relative to wick",
        "Clear directional move away from the block (20+ pip move minimum)",
        "Volume spike on the order block candle",
        "No overlap with previous order blocks",
        "Located at significant structure levels"
      ],
      invalidation: [
        "Price wicks through and closes above/below the block",
        "Multiple retests without respect",
        "Block older than 48 hours in lower timeframes",
        "Located in choppy, non-trending conditions"
      ],
      freshness: "M15 blocks valid for 24-48 hours, H1 blocks valid for 3-7 days, H4 blocks valid for 1-4 weeks"
    }
  },
  liquidityRules: {
    sweeps: {
      internal: "Sweep of internal liquidity targets stops within recent trading range. Lower probability but good for continuation trades.",
      external: "Sweep of external liquidity beyond recent highs/lows. Higher probability reversal signal, especially with immediate rejection.",
      sessionTiming: {
        "London": ["Overnight high/low sweeps at 7-9 GMT", "Previous day high/low targeting"],
        "NewYork": ["London high/low sweeps at 12-14 GMT", "Weekly/monthly level targeting"],
        "Asian": ["Previous session high/low sweeps", "Range boundary hunting during 0-6 GMT"]
      }
    },
    fvg: {
      types: [
        "Bullish FVG: Gap between candle 1 high and candle 3 low (bullish imbalance)",
        "Bearish FVG: Gap between candle 1 low and candle 3 high (bearish imbalance)",
        "Continuation FVG: In trend direction",
        "Reversal FVG: Against current trend at extremes"
      ],
      entry: [
        "Wait for 50-75% retracement into FVG",
        "Look for rejection from FVG boundaries",
        "Confirm with momentum indicators (RSI, MACD)",
        "Higher timeframe bias must align"
      ],
      invalidation: [
        "Full fill of FVG (100% retracement)",
        "Multiple retests without reaction",
        "Conflicting higher timeframe structure"
      ]
    },
    premiumDiscount: {
      zones: [
        "Premium: Upper 25% of range (sell zone in bearish bias)",
        "Equilibrium: Middle 50% of range (caution zone)",
        "Discount: Lower 25% of range (buy zone in bullish bias)"
      ],
      identification: [
        "Use previous week/month high-low for daily bias",
        "Use previous day high-low for intraday bias",
        "Use session high-low for scalping bias"
      ]
    }
  },
  sessionBehavior: {
    london: {
      characteristics: [
        "Highest volume and volatility for EUR/GBP pairs",
        "Trend continuation from Asian session or reversal",
        "Major news releases drive momentum",
        "Liquidity targeting from overnight levels"
      ],
      primaryPairs: ["GBPUSD", "EURUSD", "EURGBP", "GBPJPY", "EURJPY"],
      killzone: "8:00-10:00 GMT (London Open)",
      behavior: [
        "Initial sweep of overnight highs/lows",
        "Strong directional moves 8-12 GMT",
        "Profit-taking before NY overlap",
        "Range formation during 11-13 GMT transition"
      ]
    },
    newYork: {
      characteristics: [
        "USD pairs dominate with high volatility",
        "News-driven markets (NFP, FOMC, GDP)",
        "Institutional flows and algorithmic trading",
        "Overlap with London creates maximum volume"
      ],
      primaryPairs: ["GBPUSD", "EURUSD", "USDJPY", "USDCAD", "XAUUSD", "NAS100", "SPX500"],
      killzone: "13:00-15:00 GMT (NY Open + London Overlap)",
      behavior: [
        "London high/low sweeps at open",
        "Trend continuation or reversal based on US data",
        "Algorithm-driven moves at 13:30 GMT",
        "Late session profit-taking 20-22 GMT"
      ]
    },
    asian: {
      characteristics: [
        "Lower volatility and range-bound markets",
        "JPY pairs and commodity currencies active",
        "Respect for technical levels",
        "Setup formation for London session"
      ],
      primaryPairs: ["USDJPY", "AUDUSD", "NZDUSD", "AUDJPY", "EURJPY"],
      killzone: "2:00-5:00 GMT (Tokyo Session)",
      behavior: [
        "Consolidation within NY session range",
        "Technical level testing and validation",
        "Breakout setups form for London",
        "Low-probability trend continuation"
      ]
    }
  },
  confluenceWeights: {
    primary: {
      "market_structure_break": 25,
      "liquidity_sweep": 20,
      "order_block_respect": 18,
      "fair_value_gap": 15,
      "session_alignment": 12,
      "multiple_timeframe": 10
    },
    secondary: {
      "volume_confirmation": 8,
      "momentum_indicators": 6,
      "news_bias": 5,
      "previous_level_reaction": 4,
      "time_of_day": 3
    },
    sessionModifiers: {
      "London": {
        "gbp_pairs": 1.3,
        "eur_pairs": 1.2,
        "liquidity_sweeps": 1.4,
        "news_events": 1.5
      },
      "NewYork": {
        "usd_pairs": 1.4,
        "indices": 1.3,
        "gold": 1.2,
        "algorithm_times": 1.6
      },
      "Asian": {
        "jpy_pairs": 1.2,
        "range_trading": 1.3,
        "technical_levels": 1.4,
        "breakout_setups": 0.8
      }
    }
  },
  riskManagement: {
    rrRequirements: {
      "scalping": 1.5,
      "intraday": 2.0,
      "swing": 3.0,
      "position": 4.0
    },
    positionSizing: [
      "Risk 1-2% of account per trade maximum",
      "Reduce size during high-impact news",
      "Increase size only with multiple confluence",
      "Never risk more than 6% across all open trades"
    ],
    tradeManagement: [
      "Move to breakeven at 1:1 RR",
      "Take partial profits at 1.5:1 and 2:1",
      "Trail stop-loss using structure levels",
      "Close all positions before major news if uncertain"
    ]
  }
};

export class InstitutionalKnowledgeBase {
  static getSessionSpecificPrompt(session: 'London' | 'NewYork' | 'Asian', pair: string): string {
    const sessionData = INSTITUTIONAL_TRADING_DOCTRINE.sessionBehavior[session.toLowerCase() as keyof typeof INSTITUTIONAL_TRADING_DOCTRINE.sessionBehavior];
    
    return `
SESSION CONTEXT: ${session} Session
ACTIVE KILLZONE: ${sessionData.killzone}
PRIMARY PAIRS: ${sessionData.primaryPairs.join(', ')}

CURRENT ANALYSIS PAIR: ${pair}
SESSION CHARACTERISTICS:
${sessionData.characteristics.map(c => `• ${c}`).join('\n')}

EXPECTED BEHAVIOR:
${sessionData.behavior.map(b => `• ${b}`).join('\n')}

CONFLUENCE REQUIREMENTS FOR ${session.toUpperCase()}:
- Market Structure: ${INSTITUTIONAL_TRADING_DOCTRINE.confluenceWeights.primary.market_structure_break}% weight
- Liquidity Analysis: ${INSTITUTIONAL_TRADING_DOCTRINE.confluenceWeights.primary.liquidity_sweep}% weight  
- Order Block Validation: ${INSTITUTIONAL_TRADING_DOCTRINE.confluenceWeights.primary.order_block_respect}% weight
- Fair Value Gap: ${INSTITUTIONAL_TRADING_DOCTRINE.confluenceWeights.primary.fair_value_gap}% weight
- Session Timing: ${INSTITUTIONAL_TRADING_DOCTRINE.confluenceWeights.primary.session_alignment}% weight

RISK MANAGEMENT:
- Minimum RR: ${INSTITUTIONAL_TRADING_DOCTRINE.riskManagement.rrRequirements.intraday}:1
- Position Management: Move to BE at 1:1, partial TP at 1.5:1 and 2:1
- Structure-based stop loss placement only

You are an institutional trader with 15+ years of SMC/ICT experience. Analyze this setup with the depth and precision of a prop firm senior trader.
    `.trim();
  }

  static getConfluenceChecklist(): string[] {
    return [
      "✅ Market Structure Break confirmed (BOS/CHoCH with volume)",
      "✅ Liquidity Sweep identified (internal/external with rejection)",
      "✅ Order Block validation (fresh, untested, good location)",
      "✅ Fair Value Gap present (50-75% entry zone available)",
      "✅ Session timing optimal (within killzone or setup period)",
      "✅ Multiple timeframe alignment (M15/H1/H4 agreement)",
      "✅ Volume confirmation (20%+ spike on key levels)",
      "✅ Momentum indicators aligned (RSI/MACD supporting)",
      "✅ Premium/Discount zone appropriate for bias",
      "✅ Risk-Reward minimum 2:1 with structure-based levels"
    ];
  }

  static getSessionPriority(session: 'London' | 'NewYork' | 'Asian'): string[] {
    return INSTITUTIONAL_TRADING_DOCTRINE.sessionBehavior[session.toLowerCase() as keyof typeof INSTITUTIONAL_TRADING_DOCTRINE.sessionBehavior].primaryPairs;
  }
}