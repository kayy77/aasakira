export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  explain: string;
};

export type LessonSection = {
  heading: string;
  body: string;
  callout?: string;
};

export type Lesson = {
  id: string;
  module: string;
  title: string;
  summary: string;
  minutes: number;
  videoTitle: string;
  sections: LessonSection[];
  keyTakeaways: string[];
  task: { title: string; steps: string[] };
  quiz: QuizQuestion[];
};

export const BEGINNER_MODULES = [
  "Foundations",
  "Market Mechanics",
  "Risk & Capital",
  "Reading Price",
  "Execution & Discipline",
] as const;

export const BEGINNER_LESSONS: Lesson[] = [
  {
    id: "b01-what-is-trading",
    module: "Foundations",
    title: "What Trading Actually Is",
    summary: "Speculation, liquidity and why someone is always on the other side of your trade.",
    minutes: 8,
    videoTitle: "Intro: the trader's job description",
    sections: [
      {
        heading: "You are pricing risk, not predicting the future",
        body:
          "A trade is an agreement to take on risk at a price you believe is favourable. You are never certain. The professional's edge is not knowing what happens next — it is making sure the payoff is skewed in their favour over hundreds of attempts.",
      },
      {
        heading: "Every trade has a counterparty",
        body:
          "When you buy, someone sells. Banks, funds, market makers and retail traders all meet in the same order book. Retail flow is a small fraction of volume, which is why price frequently moves against crowded, obvious positions.",
        callout:
          "If a trade idea feels obvious and effortless, ask who is taking the other side and why they would be happy to.",
      },
      {
        heading: "Income vs. account growth",
        body:
          "Beginners try to earn a salary from a small account. That forces oversized risk and destroys the account. Your first year goal is process consistency and capital preservation — returns follow competence, not the other way around.",
      },
    ],
    keyTakeaways: [
      "Trading is probability management, not prediction.",
      "Liquidity is provided by someone with an opposing view.",
      "Preserve capital first; growth is a by-product of good process.",
    ],
    task: {
      title: "Write your trading mandate",
      steps: [
        "In one paragraph, state why you are trading and what a realistic 12-month outcome looks like.",
        "Write the maximum amount of money you are willing to lose in total before you stop.",
        "Save it somewhere you will re-read before every session.",
      ],
    },
    quiz: [
      {
        q: "What is the primary job of a trader?",
        options: [
          "Predict the next candle correctly",
          "Manage risk so that the payoff is favourable over many trades",
          "Find a strategy that never loses",
          "Trade as often as possible",
        ],
        answer: 1,
        explain: "Edge comes from repeated favourable payoffs, not from being right on any single trade.",
      },
      {
        q: "Why should a beginner avoid treating trading as monthly income?",
        options: [
          "Because markets are closed most of the year",
          "Because it forces oversized risk on a small account",
          "Because brokers block frequent withdrawals",
          "Because taxes are higher",
        ],
        answer: 1,
        explain: "Income pressure pushes position sizes beyond what the account can survive.",
      },
    ],
  },
  {
    id: "b02-markets-and-instruments",
    module: "Foundations",
    title: "Markets and Instruments",
    summary: "Forex, indices, metals and crypto — how they differ in behaviour, cost and hours.",
    minutes: 9,
    videoTitle: "Choosing the right market for your schedule",
    sections: [
      {
        heading: "Forex pairs",
        body:
          "Currencies trade in pairs. EURUSD is the euro priced in dollars. Majors (EURUSD, GBPUSD, USDJPY) are the cheapest to trade and the most liquid. Exotics have wide spreads and erratic behaviour — avoid them while learning.",
      },
      {
        heading: "Indices and metals",
        body:
          "US30, NAS100 and SPX500 track baskets of equities and move fastest around the US cash open. XAUUSD (gold) behaves like a currency and a safe haven at the same time, and reacts violently to US data and yields.",
      },
      {
        heading: "Crypto",
        body:
          "Trades 24/7 with no session structure and larger overnight gaps in sentiment. Higher volatility means your position size must be smaller for the same monetary risk.",
        callout:
          "Pick two instruments and learn their personality deeply. Instrument hopping is the fastest way to stay a beginner forever.",
      },
    ],
    keyTakeaways: [
      "Majors are cheapest and most forgiving for beginners.",
      "Indices concentrate their movement around the US open.",
      "Volatility must be offset with smaller position size, not avoided.",
    ],
    task: {
      title: "Choose your two instruments",
      steps: [
        "List the hours you can realistically be at the screen.",
        "Match those hours to an instrument's most active session.",
        "Commit to those two instruments for the next 90 days.",
      ],
    },
    quiz: [
      {
        q: "Why are exotic currency pairs unsuitable for beginners?",
        options: [
          "They are illegal in most countries",
          "Wide spreads and erratic behaviour increase cost and noise",
          "They only trade on weekends",
          "Brokers do not offer them",
        ],
        answer: 1,
        explain: "Cost and unpredictability make learning far harder on exotics.",
      },
      {
        q: "When do US indices typically see their strongest movement?",
        options: ["Asian session", "Around the US cash open", "Weekends", "Late Friday evening"],
        answer: 1,
        explain: "Index volume and range concentrate around the US cash open.",
      },
    ],
  },
  {
    id: "b03-broker-and-platform",
    module: "Foundations",
    title: "Brokers, Platforms and Order Types",
    summary: "Spread, commission, swap and the four orders you actually need.",
    minutes: 10,
    videoTitle: "Platform walkthrough: placing your first order safely",
    sections: [
      {
        heading: "What a broker charges you",
        body:
          "Spread is the gap between bid and ask, paid on entry. Commission is a flat fee per lot on raw-spread accounts. Swap is the overnight financing cost. Together they are your fixed cost of doing business — a strategy must clear them before it can profit.",
      },
      {
        heading: "The four orders",
        body:
          "Market order fills now at the current price. Limit order waits for a better price. Stop order triggers once price passes a level. Stop loss and take profit are attached exits. Beginners should attach a stop loss on every order at the moment of entry.",
        callout: "No stop loss, no trade. There are no exceptions to this rule while you are learning.",
      },
      {
        heading: "Slippage and execution",
        body:
          "Around news, your fill may differ from your requested price. This is normal. It is also why placing stops immediately behind a round number or news release is risky.",
      },
    ],
    keyTakeaways: [
      "Spread + commission + swap is your break-even hurdle.",
      "Attach the stop loss at entry, never afterwards.",
      "Expect slippage during high-impact news.",
    ],
    task: {
      title: "Cost audit",
      steps: [
        "Find your broker's typical spread and commission for your two instruments.",
        "Convert that cost into pips per round trip.",
        "Note how many pips your average trade must earn just to break even.",
      ],
    },
    quiz: [
      {
        q: "Which order fills immediately at the current price?",
        options: ["Limit order", "Stop order", "Market order", "Trailing order"],
        answer: 2,
        explain: "A market order executes at the best available price right now.",
      },
      {
        q: "When should a stop loss be placed?",
        options: [
          "After the trade moves into profit",
          "At the moment of entry",
          "Only on losing trades",
          "At the end of the day",
        ],
        answer: 1,
        explain: "The stop defines the risk, so it must exist before the trade can hurt you.",
      },
    ],
  },
  {
    id: "b04-pips-lots-leverage",
    module: "Foundations",
    title: "Pips, Lots and Leverage",
    summary: "The arithmetic every trade depends on — and why leverage is not risk.",
    minutes: 11,
    videoTitle: "The maths behind position size",
    sections: [
      {
        heading: "Pips and points",
        body:
          "On most FX pairs a pip is 0.0001. On JPY pairs it is 0.01. On XAUUSD a 0.01 move is one pip on this platform, and on BTCUSD a 0.1 move. Knowing the unit is essential or every risk calculation will be wrong.",
      },
      {
        heading: "Lot sizes",
        body:
          "One standard lot is 100,000 units — roughly $10 per pip on USD-quoted majors. A mini lot is 0.1 ($1/pip) and a micro lot is 0.01 ($0.10/pip). Your lot size is an output of your risk, never a preference.",
      },
      {
        heading: "Leverage is not risk",
        body:
          "Leverage determines margin required, not how much you can lose. A 0.01 lot trade on 1:500 leverage risks the same money as on 1:30 leverage. Risk is decided by stop distance multiplied by lot size.",
        callout: "Risk = stop distance in pips x value per pip. Leverage does not appear in that formula.",
      },
    ],
    keyTakeaways: [
      "Pip value differs per instrument — check before sizing.",
      "Lot size is derived from risk, not chosen by feel.",
      "Leverage affects margin, not loss size.",
    ],
    task: {
      title: "Size three trades by hand",
      steps: [
        "Assume a £1,000 account risking 1% (£10).",
        "Calculate the lot size for a 20-pip, a 50-pip and a 100-pip stop.",
        "Check your answers against the Lot Size Calculator in Tools.",
      ],
    },
    quiz: [
      {
        q: "A trade risks £10 with a 50-pip stop. What is the correct value per pip?",
        options: ["£0.20", "£0.50", "£2.00", "£5.00"],
        answer: 0,
        explain: "£10 / 50 pips = £0.20 per pip.",
      },
      {
        q: "Increasing leverage from 1:30 to 1:500 with the same lot size and stop...",
        options: [
          "Increases the money at risk",
          "Decreases the money at risk",
          "Leaves the money at risk unchanged",
          "Removes the need for a stop loss",
        ],
        answer: 2,
        explain: "Leverage changes margin required, not the loss on the stop.",
      },
    ],
  },
  {
    id: "b05-candlesticks",
    module: "Market Mechanics",
    title: "Reading Candlesticks Properly",
    summary: "Body, wick, close — what a candle really tells you about the auction.",
    minutes: 9,
    videoTitle: "Candles as a record of conflict",
    sections: [
      {
        heading: "Anatomy",
        body:
          "Each candle shows open, high, low and close for its period. The body is the net result; the wicks show rejected territory. A long upper wick means price was pushed there and sellers rejected it.",
      },
      {
        heading: "The close matters most",
        body:
          "Intrabar movement is noise. Professionals wait for a close because the close is where the market agreed value sat when the period ended. Reacting before the close is the most common beginner error.",
        callout: "Never treat an unclosed candle as confirmation. It can and will change shape.",
      },
      {
        heading: "Context over pattern",
        body:
          "A bullish engulfing candle at the top of an extended rally is not the same signal as the identical candle at a well-tested support level. Patterns mean nothing without location.",
      },
    ],
    keyTakeaways: [
      "Wicks show rejection; bodies show acceptance.",
      "Wait for the close before acting.",
      "Location makes a pattern meaningful.",
    ],
    task: {
      title: "Wick study",
      steps: [
        "Open the daily chart of one of your instruments.",
        "Mark the ten largest wicks of the last three months.",
        "Note what happened in the following three candles after each.",
      ],
    },
    quiz: [
      {
        q: "What does a long upper wick indicate?",
        options: [
          "Buyers fully controlled the period",
          "Price reached higher and was rejected by sellers",
          "The candle is invalid",
          "A guaranteed reversal",
        ],
        answer: 1,
        explain: "The wick marks territory the market tested and refused to accept.",
      },
      {
        q: "Why wait for a candle to close?",
        options: [
          "Brokers require it",
          "Because an open candle's shape can still change entirely",
          "Because spreads are lower after the close",
          "It is not necessary",
        ],
        answer: 1,
        explain: "Unclosed candles routinely reverse their appearance before the period ends.",
      },
    ],
  },
  {
    id: "b06-timeframes",
    module: "Market Mechanics",
    title: "Timeframes and Top-Down Analysis",
    summary: "How higher timeframes set direction and lower timeframes set entries.",
    minutes: 10,
    videoTitle: "Building a top-down routine",
    sections: [
      {
        heading: "The three-timeframe stack",
        body:
          "Use a higher timeframe for bias (daily or 4H), a middle timeframe to locate the level (1H), and a lower timeframe to time entry (15M or 5M). Each level answers a different question.",
      },
      {
        heading: "Conflict resolution",
        body:
          "When the daily is bullish and the 15M is bearish, the 15M move is usually a pullback inside the higher trend. The larger timeframe wins on direction because it carries more participation.",
        callout: "Trade in the direction of the timeframe holding the most money — it is always the bigger one.",
      },
      {
        heading: "Do not over-stack",
        body:
          "More charts is not more clarity. Three timeframes is enough. Beyond that, you will always find a chart that agrees with the trade you already want to take.",
      },
    ],
    keyTakeaways: [
      "Bias from higher, level from middle, entry from lower.",
      "Higher timeframes dominate direction.",
      "Three timeframes maximum.",
    ],
    task: {
      title: "Build your top-down template",
      steps: [
        "Save a chart layout with your three chosen timeframes.",
        "Write the one question each timeframe answers.",
        "Run the routine on both instruments for five consecutive days.",
      ],
    },
    quiz: [
      {
        q: "The daily is in an uptrend but the 15M is falling. Most likely?",
        options: [
          "The uptrend is over",
          "A pullback within the higher-timeframe uptrend",
          "The chart is broken",
          "Time to short aggressively",
        ],
        answer: 1,
        explain: "Lower-timeframe counter moves are usually pullbacks inside the dominant trend.",
      },
      {
        q: "Why avoid using six timeframes?",
        options: [
          "Platforms cannot display them",
          "You will always find one that confirms your bias",
          "It uses too much memory",
          "Spreads increase",
        ],
        answer: 1,
        explain: "Excess timeframes enable confirmation bias rather than clarity.",
      },
    ],
  },
  {
    id: "b07-support-resistance",
    module: "Reading Price",
    title: "Support, Resistance and Zones",
    summary: "Why levels are areas, not lines, and how to mark them without cluttering the chart.",
    minutes: 9,
    videoTitle: "Marking levels that actually matter",
    sections: [
      {
        heading: "Levels are zones",
        body:
          "Price rarely respects an exact number. Mark a band covering the wick cluster and the body cluster. A zone acknowledges that participants entered across a range of prices.",
      },
      {
        heading: "Quality criteria",
        body:
          "A strong level was formed on a sharp reaction, was respected more than once, and is visible on the higher timeframe. Weak levels come from slow, overlapping, low-volatility price action.",
        callout: "Five great levels beat fifty average ones. If your chart looks like a spider web, delete half.",
      },
      {
        heading: "Flips",
        body:
          "Broken resistance frequently becomes support and vice versa. These flip levels are among the highest-probability areas for a beginner to trade because they show a clear change in who is in control.",
      },
    ],
    keyTakeaways: [
      "Draw zones, not lines.",
      "Prefer levels with sharp reactions and higher-timeframe visibility.",
      "Flipped levels signal a genuine control change.",
    ],
    task: {
      title: "Five-level chart",
      steps: [
        "Clear all drawings from one instrument's 4H chart.",
        "Mark only the five most significant zones.",
        "Justify each in one sentence in your journal.",
      ],
    },
    quiz: [
      {
        q: "What makes a support zone higher quality?",
        options: [
          "It is a perfectly round number",
          "Sharp reaction, multiple respects, visible on higher timeframe",
          "It was drawn recently",
          "It appears only on the 1-minute chart",
        ],
        answer: 1,
        explain: "Reaction strength, repetition and higher-timeframe visibility define quality.",
      },
      {
        q: "What is a 'flip' level?",
        options: [
          "A level that disappears after a week",
          "Former resistance now acting as support (or vice versa)",
          "A level drawn upside down",
          "An indicator setting",
        ],
        answer: 1,
        explain: "A break and retest of a level flips its role.",
      },
    ],
  },
  {
    id: "b08-trends-structure",
    module: "Reading Price",
    title: "Trends and Market Structure",
    summary: "Higher highs, lower lows, and identifying a genuine break of structure.",
    minutes: 11,
    videoTitle: "Structure mapping from scratch",
    sections: [
      {
        heading: "Defining the trend",
        body:
          "An uptrend makes higher highs and higher lows. A downtrend makes lower highs and lower lows. Anything else is a range, and ranges are where most beginner accounts are damaged.",
      },
      {
        heading: "Break of structure",
        body:
          "A trend changes when the most recent swing point is broken on a closing basis and price fails to reclaim it. A wick through a level is not a break — it is often a liquidity grab.",
        callout: "Closes break structure. Wicks collect stop losses.",
      },
      {
        heading: "Ranges",
        body:
          "In a range, the edges are the opportunity and the middle is a trap. If you cannot clearly define the trend, mark the range boundaries and wait for a decisive close outside them.",
      },
    ],
    keyTakeaways: [
      "Trend = sequence of swing highs and lows.",
      "Structure breaks on closes, not wicks.",
      "Trade range edges, never range middles.",
    ],
    task: {
      title: "Structure mapping",
      steps: [
        "Mark every swing high and low on the 4H chart for the last two months.",
        "Label each segment: uptrend, downtrend or range.",
        "Circle each genuine break of structure.",
      ],
    },
    quiz: [
      {
        q: "A downtrend is defined by...",
        options: [
          "A red daily candle",
          "Lower highs and lower lows",
          "Price below a moving average only",
          "Negative news",
        ],
        answer: 1,
        explain: "Structure, not colour or news, defines the trend.",
      },
      {
        q: "Price wicks below the last swing low then closes above it. This is...",
        options: [
          "A confirmed break of structure",
          "Most likely a liquidity grab, not a break",
          "Irrelevant",
          "A reason to double position size",
        ],
        answer: 1,
        explain: "Without a close beyond the level, structure is intact.",
      },
    ],
  },
  {
    id: "b09-liquidity-basics",
    module: "Reading Price",
    title: "Liquidity and Stop Hunts",
    summary: "Where retail stops sit and why price keeps visiting those exact areas.",
    minutes: 10,
    videoTitle: "Seeing the market through liquidity",
    sections: [
      {
        heading: "Where stops cluster",
        body:
          "Stops gather just beyond obvious swing highs and lows, round numbers and trendlines. Large participants need those resting orders to fill their size — so price is frequently drawn toward them.",
      },
      {
        heading: "The sweep pattern",
        body:
          "A sweep is a fast push beyond a level followed by an immediate rejection back inside. It shows the level was targeted for liquidity rather than genuinely broken.",
        callout: "Place your stop where it is protected by structure, not where everyone else places theirs.",
      },
      {
        heading: "Trading after the sweep",
        body:
          "A safer beginner approach is to wait for the sweep to complete and then trade the reclaim, rather than entering before the obvious level is taken.",
      },
    ],
    keyTakeaways: [
      "Obvious levels are magnets because stops rest there.",
      "A sweep is a push beyond plus immediate rejection.",
      "Trade after the sweep, not into it.",
    ],
    task: {
      title: "Sweep hunt",
      steps: [
        "Find five sweeps of a prior swing high or low on your instrument.",
        "Screenshot each one.",
        "Record what price did over the next ten candles.",
      ],
    },
    quiz: [
      {
        q: "Why does price often move beyond obvious swing highs?",
        options: [
          "Charting software errors",
          "Resting stop orders there provide liquidity for large participants",
          "Brokers manipulate every chart",
          "Random chance only",
        ],
        answer: 1,
        explain: "Clustered stops are a pool of liquidity that attracts price.",
      },
      {
        q: "What defines a liquidity sweep?",
        options: [
          "A slow drift through a level",
          "A push beyond a level with immediate rejection back inside",
          "Any red candle",
          "A gap on the weekly open",
        ],
        answer: 1,
        explain: "The immediate rejection is what distinguishes a sweep from a break.",
      },
    ],
  },
  {
    id: "b10-sessions",
    module: "Market Mechanics",
    title: "Sessions, Volatility and Timing",
    summary: "Asia, London and New York — when your instrument actually moves.",
    minutes: 8,
    videoTitle: "Choosing your trading window",
    sections: [
      {
        heading: "The three sessions",
        body:
          "Asia is typically quiet and range-bound, building the liquidity that London later takes. London brings the first large expansion. New York adds US data and the equity open, often reversing or extending the London move.",
      },
      {
        heading: "Pick one window",
        body:
          "Trading all day guarantees fatigue and low-quality decisions. Choose a two to three hour window that matches your instrument and protect it.",
        callout: "Consistency of when you trade is as important as what you trade.",
      },
      {
        heading: "Low-liquidity danger",
        body:
          "Late Friday, the daily rollover and holiday periods produce widened spreads and unreliable moves. Standing aside during these windows is an edge in itself.",
      },
    ],
    keyTakeaways: [
      "Asia builds liquidity; London and New York spend it.",
      "One consistent window beats all-day screen time.",
      "Avoid thin liquidity periods entirely.",
    ],
    task: {
      title: "Session profile",
      steps: [
        "Record the high-to-low range of each session for your instrument over ten days.",
        "Identify which session produces the largest consistent range.",
        "Set that as your trading window.",
      ],
    },
    quiz: [
      {
        q: "The Asian session is typically characterised by...",
        options: [
          "Extreme volatility",
          "Quieter, range-bound conditions that build liquidity",
          "The highest spreads of the week",
          "No trading activity at all",
        ],
        answer: 1,
        explain: "Asia usually ranges, creating the highs and lows London later targets.",
      },
      {
        q: "Why avoid trading late on Friday?",
        options: [
          "Markets are closed",
          "Thin liquidity widens spreads and distorts moves",
          "Brokers charge double",
          "Signals stop working on Fridays",
        ],
        answer: 1,
        explain: "Thin conditions make price behaviour unreliable.",
      },
    ],
  },
  {
    id: "b11-risk-per-trade",
    module: "Risk & Capital",
    title: "Risk Per Trade and Survival Maths",
    summary: "Why 1% survives and 10% does not, shown with the drawdown recovery table.",
    minutes: 10,
    videoTitle: "The maths of staying in the game",
    sections: [
      {
        heading: "The fixed fractional rule",
        body:
          "Risk a fixed small percentage of the account on every trade — 0.5% to 1% while learning. Losses then shrink automatically as the account shrinks, which is what keeps you solvent through a bad run.",
      },
      {
        heading: "Recovery is asymmetric",
        body:
          "A 10% drawdown needs 11% to recover. A 50% drawdown needs 100%. An 80% drawdown needs 400%. Deep drawdowns are mathematically close to fatal, which is why avoiding them outranks any profit target.",
        callout: "Ten consecutive losses at 1% leaves you down about 9.6%. At 10% risk it leaves you down 65%.",
      },
      {
        heading: "Losing streaks are normal",
        body:
          "With a 50% win rate, a run of six losses will happen regularly across a few hundred trades. Your risk must be sized so that a normal streak is uncomfortable, never catastrophic.",
      },
    ],
    keyTakeaways: [
      "Risk 0.5–1% per trade while learning.",
      "Recovery from drawdown is exponentially harder than the loss.",
      "Long losing streaks are statistically expected.",
    ],
    task: {
      title: "Streak stress test",
      steps: [
        "Calculate your balance after eight consecutive losses at 1% risk.",
        "Repeat the calculation at 5% risk.",
        "Write down which of those two outcomes you could trade through calmly.",
      ],
    },
    quiz: [
      {
        q: "What gain is required to recover from a 50% drawdown?",
        options: ["50%", "75%", "100%", "150%"],
        answer: 2,
        explain: "Halving the account requires doubling what remains to get back to level.",
      },
      {
        q: "What is the main benefit of fixed fractional risk?",
        options: [
          "It guarantees profit",
          "Losses shrink automatically as the account shrinks",
          "It removes the need for a stop loss",
          "It increases leverage",
        ],
        answer: 1,
        explain: "Percentage-based risk self-adjusts and protects the account during losing runs.",
      },
    ],
  },
  {
    id: "b12-position-sizing",
    module: "Risk & Capital",
    title: "Position Sizing in Practice",
    summary: "Turning account size, stop distance and pip value into a lot size, every time.",
    minutes: 10,
    videoTitle: "Sizing a live trade end to end",
    sections: [
      {
        heading: "The formula",
        body:
          "Lot size = (account balance x risk %) / (stop distance in pips x pip value per lot). Work in this order every time: find the level, set the stop, then calculate the size. Never pick a size first.",
      },
      {
        heading: "Wide stops are fine",
        body:
          "A wide stop is not more risk if the size is reduced accordingly. Tightening stops to trade bigger is the single most common way beginners get stopped out of correct ideas.",
        callout: "The stop belongs where the idea is wrong — not where your preferred lot size becomes affordable.",
      },
      {
        heading: "Use the calculator",
        body:
          "The Lot Size Calculator in Tools does this instantly. Calculating by hand a few dozen times first will make the outputs intuitive rather than mysterious.",
      },
    ],
    keyTakeaways: [
      "Level, then stop, then size — always that order.",
      "Wide stops with smaller size carry identical risk.",
      "Never tighten a stop to justify a bigger position.",
    ],
    task: {
      title: "Ten sizing reps",
      steps: [
        "Take ten historical setups on your instrument.",
        "For each, define the invalidation level and stop distance.",
        "Calculate the lot size at 1% risk and verify with the calculator.",
      ],
    },
    quiz: [
      {
        q: "Correct order of operations when sizing a trade?",
        options: [
          "Size, then stop, then level",
          "Level, then stop, then size",
          "Stop, then size, then level",
          "Any order works",
        ],
        answer: 1,
        explain: "The structure defines the stop; the stop defines the size.",
      },
      {
        q: "Doubling stop distance while halving lot size...",
        options: [
          "Doubles the risk",
          "Halves the risk",
          "Keeps monetary risk the same",
          "Removes the risk",
        ],
        answer: 2,
        explain: "Risk is stop distance multiplied by value per pip; the two changes cancel out.",
      },
    ],
  },
  {
    id: "b13-risk-reward",
    module: "Risk & Capital",
    title: "Risk-to-Reward and Expectancy",
    summary: "Why win rate alone is meaningless and how expectancy decides your outcome.",
    minutes: 11,
    videoTitle: "Expectancy explained with real numbers",
    sections: [
      {
        heading: "R multiples",
        body:
          "Express every result in R, where 1R is the amount risked. A trade that gains three times the risk is +3R. This makes results comparable across instruments and account sizes.",
      },
      {
        heading: "Expectancy",
        body:
          "Expectancy = (win rate x average win in R) − (loss rate x average loss in R). At 40% win rate with 2R winners you make 0.4 x 2 − 0.6 x 1 = +0.2R per trade. A 70% win rate with 0.3R winners loses money.",
        callout: "A losing trader with a high win rate is extremely common. Judge systems by expectancy only.",
      },
      {
        heading: "Realistic targets",
        body:
          "Do not force 5R targets onto a market that only ranges 1.5R. The structure decides the target; you decide whether that target justifies the risk.",
      },
    ],
    keyTakeaways: [
      "Measure everything in R.",
      "Expectancy, not win rate, determines profitability.",
      "Targets must come from structure, not wishes.",
    ],
    task: {
      title: "Expectancy calculation",
      steps: [
        "Take any 20 past trades (demo counts).",
        "Convert each result into R.",
        "Compute your expectancy per trade and write the number down.",
      ],
    },
    quiz: [
      {
        q: "40% win rate, average win 2R, average loss 1R. Expectancy per trade?",
        options: ["−0.2R", "+0.2R", "+0.8R", "+1.0R"],
        answer: 1,
        explain: "(0.4 x 2) − (0.6 x 1) = 0.8 − 0.6 = +0.2R.",
      },
      {
        q: "A 75% win rate system can still lose money because...",
        options: [
          "Brokers cancel winners",
          "Losses may be far larger than the wins",
          "Win rate is never accurate",
          "It cannot lose money",
        ],
        answer: 1,
        explain: "Large losses easily outweigh frequent small wins.",
      },
    ],
  },
  {
    id: "b14-stop-placement",
    module: "Risk & Capital",
    title: "Stop Loss and Take Profit Placement",
    summary: "Structural invalidation, spread buffers and partial exits.",
    minutes: 9,
    videoTitle: "Placing exits that survive noise",
    sections: [
      {
        heading: "Structural stops",
        body:
          "The stop belongs beyond the point that proves the idea wrong — below the swing low for a long, above the swing high for a short — plus a small buffer for spread and noise.",
      },
      {
        heading: "Targets",
        body:
          "Set the first target at the nearest opposing liquidity or structure. If that target does not offer at least 1.5R after costs, the trade is not worth taking.",
        callout: "If the nearest obstacle is closer than 1.5R, skip the trade. Cost discipline is free edge.",
      },
      {
        heading: "Partials and breakeven",
        body:
          "Taking partial profit at 1R and moving the stop to breakeven reduces stress but also caps large winners. Choose one approach and apply it consistently so your data stays comparable.",
      },
    ],
    keyTakeaways: [
      "Stops go beyond invalidation plus a buffer.",
      "Skip trades where the first obstacle is under 1.5R.",
      "Apply one exit policy consistently.",
    ],
    task: {
      title: "Exit policy document",
      steps: [
        "Write your rule for stop placement in one sentence.",
        "Write your rule for first target in one sentence.",
        "Write your rule for partials and breakeven in one sentence.",
      ],
    },
    quiz: [
      {
        q: "Where should a long trade's stop sit?",
        options: [
          "A fixed 10 pips away",
          "Below the swing low that invalidates the idea, plus a buffer",
          "At the round number above entry",
          "Wherever the platform defaults",
        ],
        answer: 1,
        explain: "The stop must sit beyond the level that proves the idea wrong.",
      },
      {
        q: "The nearest structure gives only 0.8R. You should...",
        options: [
          "Take the trade with a wider target anyway",
          "Skip the trade",
          "Remove the stop loss",
          "Double the size",
        ],
        answer: 1,
        explain: "Without adequate reward for the risk, the trade has no edge.",
      },
    ],
  },
  {
    id: "b15-trading-plan",
    module: "Execution & Discipline",
    title: "Building Your Trading Plan",
    summary: "A one-page plan that tells you exactly what to do and what to ignore.",
    minutes: 12,
    videoTitle: "Writing a plan you will actually follow",
    sections: [
      {
        heading: "What a plan must contain",
        body:
          "Instruments, session window, higher-timeframe bias rules, entry criteria, stop rule, target rule, risk per trade, maximum trades per day and daily loss limit. If it does not fit on one page, you will not follow it.",
      },
      {
        heading: "Binary criteria",
        body:
          "Every rule must be answerable yes or no. 'Strong momentum' is not a rule. 'Price closed above the 4H swing high' is. Vague plans always collapse into improvisation.",
        callout: "If two traders reading your plan would disagree about whether to take a trade, the rule is too vague.",
      },
      {
        heading: "Review cycle",
        body:
          "Do not change the plan mid-week. Review it every 20 trades using your journal data, change one variable at a time, and record why you changed it.",
      },
    ],
    keyTakeaways: [
      "One page, binary rules, no ambiguity.",
      "Include daily loss limits and trade caps.",
      "Review every 20 trades, change one thing at a time.",
    ],
    task: {
      title: "Draft your one-page plan",
      steps: [
        "Write the nine required sections listed in this lesson.",
        "Test each rule for a clean yes/no answer.",
        "Pin it beside your screen before your next session.",
      ],
    },
    quiz: [
      {
        q: "Which is a properly written entry rule?",
        options: [
          "Enter when momentum looks strong",
          "Enter when price closes above the 4H swing high after a sweep of the prior low",
          "Enter when it feels right",
          "Enter when the news is bullish",
        ],
        answer: 1,
        explain: "It is specific, observable and answerable yes or no.",
      },
      {
        q: "When should the plan be reviewed?",
        options: [
          "After every losing trade",
          "On a fixed cycle such as every 20 trades",
          "Never",
          "Daily",
        ],
        answer: 1,
        explain: "Reviewing on a fixed sample prevents emotional rule-changing.",
      },
    ],
  },
  {
    id: "b16-journaling",
    module: "Execution & Discipline",
    title: "Journaling and Reviewing Trades",
    summary: "The data that turns random screen time into measurable improvement.",
    minutes: 9,
    videoTitle: "A review routine that finds your leaks",
    sections: [
      {
        heading: "What to record",
        body:
          "Instrument, date and session, setup name, entry, stop, target, result in R, whether the plan was followed, a screenshot before and after, and one sentence on your emotional state.",
      },
      {
        heading: "Rule adherence is the key metric",
        body:
          "Track the percentage of trades that followed your plan separately from profit. A profitable rule-break is still a failure because it teaches a habit that will eventually cost far more.",
        callout: "Grade the decision, not the outcome. Good decisions with bad outcomes are still good decisions.",
      },
      {
        heading: "Weekly review",
        body:
          "Each week, sort trades by setup and by session. Your worst-performing combinations are your first candidates for removal — cutting a losing bucket is faster than finding a new edge.",
      },
    ],
    keyTakeaways: [
      "Log every trade including the ones you skipped.",
      "Track rule adherence separately from P&L.",
      "Cut your worst bucket before adding new setups.",
    ],
    task: {
      title: "Start your journal",
      steps: [
        "Create a log with the fields listed in this lesson.",
        "Enter your last ten trades retroactively.",
        "Mark each as plan-followed or not.",
      ],
    },
    quiz: [
      {
        q: "A trade broke your rules but made money. How is it graded?",
        options: [
          "A win, no issue",
          "A process failure despite the profit",
          "Excluded from the journal",
          "A reason to change the plan",
        ],
        answer: 1,
        explain: "Rewarding rule-breaks reinforces habits that eventually cause large losses.",
      },
      {
        q: "What is the fastest way to improve using journal data?",
        options: [
          "Add more setups",
          "Remove the worst-performing setup or session bucket",
          "Increase risk on winners",
          "Trade more frequently",
        ],
        answer: 1,
        explain: "Cutting the biggest leak improves expectancy immediately.",
      },
    ],
  },
  {
    id: "b17-psychology",
    module: "Execution & Discipline",
    title: "Trading Psychology Fundamentals",
    summary: "Fear, greed, revenge trading and the systems that beat willpower.",
    minutes: 10,
    videoTitle: "Designing around your own emotions",
    sections: [
      {
        heading: "The four failure states",
        body:
          "Revenge trading after a loss, fear of entry after a loss streak, greed through oversizing after wins, and boredom trading in dead markets. Nearly every blown account traces back to one of these four.",
      },
      {
        heading: "Rules beat willpower",
        body:
          "Do not try to feel calmer. Build constraints: a daily loss limit that ends your session, a maximum number of trades, and a mandatory cool-off after two consecutive losses.",
        callout: "Two losses in a row means you stop for the day. Write it into the plan and enforce it.",
      },
      {
        heading: "Detach from the single outcome",
        body:
          "Focus on completing a block of 20 trades according to plan. Judging yourself on one trade produces exactly the emotional volatility that destroys accounts.",
      },
    ],
    keyTakeaways: [
      "Revenge, fear, greed and boredom cause most failures.",
      "Hard constraints outperform willpower.",
      "Evaluate in blocks of trades, not single results.",
    ],
    task: {
      title: "Write your circuit breakers",
      steps: [
        "Set a daily loss limit in percent.",
        "Set a maximum number of trades per day.",
        "Set a mandatory stop rule after consecutive losses.",
      ],
    },
    quiz: [
      {
        q: "Best defence against revenge trading?",
        options: [
          "Trying harder to stay calm",
          "A hard daily loss limit that ends the session",
          "Increasing position size to recover faster",
          "Switching instruments",
        ],
        answer: 1,
        explain: "Pre-committed constraints work when emotional control fails.",
      },
      {
        q: "How should performance be evaluated?",
        options: [
          "Trade by trade",
          "Over a block of trades such as 20",
          "Daily P&L only",
          "By comparing to other traders",
        ],
        answer: 1,
        explain: "Only a sample of trades reveals whether the process works.",
      },
    ],
  },
  {
    id: "b18-news-events",
    module: "Market Mechanics",
    title: "News, Data and the Economic Calendar",
    summary: "NFP, CPI and central bank days — trade around them, not into them.",
    minutes: 9,
    videoTitle: "Using the calendar defensively",
    sections: [
      {
        heading: "The events that matter",
        body:
          "Interest rate decisions, CPI inflation data, Non-Farm Payrolls and central bank press conferences move currencies, gold and indices the most. Check the calendar before every session without exception.",
      },
      {
        heading: "Why not to trade the release",
        body:
          "Spreads widen dramatically, slippage is severe and stops fill at prices far from your level. The initial move frequently reverses within minutes.",
        callout: "Beginners should be flat 15 minutes before and 15 minutes after any high-impact release.",
      },
      {
        heading: "The opportunity after",
        body:
          "Once volatility settles, the post-news trend is often cleaner and more directional than anything the rest of the day offers. Patience converts a hazard into an edge.",
      },
    ],
    keyTakeaways: [
      "Rate decisions, CPI and NFP dominate volatility.",
      "Be flat across high-impact releases while learning.",
      "The cleaner opportunity is usually after the dust settles.",
    ],
    task: {
      title: "Calendar routine",
      steps: [
        "Bookmark an economic calendar filtered to high impact.",
        "Note the high-impact events for the coming week for your instruments.",
        "Block those times out of your trading window.",
      ],
    },
    quiz: [
      {
        q: "Why avoid holding through a high-impact release as a beginner?",
        options: [
          "Trading is prohibited then",
          "Widened spreads and slippage make stops unreliable",
          "Prices never move on news",
          "Brokers charge extra commission",
        ],
        answer: 1,
        explain: "Execution quality collapses during the release.",
      },
      {
        q: "Which is a high-impact event?",
        options: [
          "A central bank interest rate decision",
          "A minor regional survey",
          "A bank holiday in a small country",
          "A company dividend",
        ],
        answer: 0,
        explain: "Rate decisions move currencies, gold and indices sharply.",
      },
    ],
  },
  {
    id: "b19-demo-to-live",
    module: "Execution & Discipline",
    title: "From Demo to Live Capital",
    summary: "Backtesting, forward testing and the criteria that prove you are ready.",
    minutes: 10,
    videoTitle: "Your path to funded, safely",
    sections: [
      {
        heading: "Backtest first",
        body:
          "Run your plan across at least 100 historical setups, recording every result in R. This gives you a reference expectancy before a single pound is at risk.",
      },
      {
        heading: "Then forward test",
        body:
          "Trade the plan live on demo for at least 30 trades, at the same times and with the same size logic you will use live. Demo conditions should mirror live exactly, or the data is worthless.",
        callout:
          "Go-live criteria: 30+ forward trades, positive expectancy, and 90%+ rule adherence. Miss one and you are not ready.",
      },
      {
        heading: "Start smaller than feels serious",
        body:
          "Your first live account should be small enough that a full drawdown changes nothing in your life. Live psychology is different from demo, and this is where you pay to learn that.",
      },
    ],
    keyTakeaways: [
      "100 backtested setups before forward testing.",
      "30+ forward trades with 90% rule adherence before going live.",
      "First live account should be genuinely small.",
    ],
    task: {
      title: "Set your go-live gate",
      steps: [
        "Write the three numeric criteria you must hit before trading live.",
        "Record your current progress against each.",
        "Commit to not going live until all three are met.",
      ],
    },
    quiz: [
      {
        q: "A sensible go-live requirement is...",
        options: [
          "One profitable week",
          "30+ forward-tested trades with positive expectancy and high rule adherence",
          "Watching enough videos",
          "A large deposit",
        ],
        answer: 1,
        explain: "Only a meaningful sample with disciplined execution proves readiness.",
      },
      {
        q: "Why start with a small live account?",
        options: [
          "Brokers require it",
          "Live psychology differs from demo and this lesson has a price",
          "Small accounts have lower spreads",
          "It is not necessary",
        ],
        answer: 1,
        explain: "Real money changes behaviour; learn that cheaply.",
      },
    ],
  },
  {
    id: "b20-first-90-days",
    module: "Execution & Discipline",
    title: "Your First 90 Days",
    summary: "A week-by-week operating routine to carry into the intermediate track.",
    minutes: 11,
    videoTitle: "The 90-day operating plan",
    sections: [
      {
        heading: "Days 1–30: mechanics",
        body:
          "Two instruments, one session, one setup. No live money. Mark structure daily, log every setup you see whether or not you take it. The goal is recognition speed, not profit.",
      },
      {
        heading: "Days 31–60: execution",
        body:
          "Forward test the full plan on demo with correct position sizing. Track rule adherence as your primary metric. Review every 20 trades and change at most one variable.",
      },
      {
        heading: "Days 61–90: pressure",
        body:
          "Go live at minimum size if the go-live criteria are met. Keep the same routine, the same session and the same setup. Only after 90 consistent days should you consider adding a second setup.",
        callout: "One setup, mastered, outperforms ten setups half-known. Depth beats variety for your whole first year.",
      },
    ],
    keyTakeaways: [
      "Month one is recognition, month two is execution, month three is pressure.",
      "Rule adherence is the metric that matters throughout.",
      "Add complexity only after 90 consistent days.",
    ],
    task: {
      title: "Build your 90-day schedule",
      steps: [
        "Write the three monthly objectives into your calendar.",
        "Schedule your weekly review slot as a recurring appointment.",
        "Set a reminder at day 90 to assess whether to add a second setup.",
      ],
    },
    quiz: [
      {
        q: "What is the main goal of the first 30 days?",
        options: [
          "Maximum profit",
          "Fast, accurate recognition of your setup and structure",
          "Testing many strategies",
          "Building the largest possible account",
        ],
        answer: 1,
        explain: "Recognition speed and consistency come before any profit objective.",
      },
      {
        q: "When should you add a second setup?",
        options: [
          "Immediately",
          "After roughly 90 consistent days with the first one",
          "After the first losing week",
          "Never",
        ],
        answer: 1,
        explain: "Depth on one setup beats shallow familiarity with many.",
      },
    ],
  },
];

export const TOTAL_BEGINNER_LESSONS = BEGINNER_LESSONS.length;

export function getLesson(id: string) {
  return BEGINNER_LESSONS.find((l) => l.id === id);
}

export function getLessonIndex(id: string) {
  return BEGINNER_LESSONS.findIndex((l) => l.id === id);
}
