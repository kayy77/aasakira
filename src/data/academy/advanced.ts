import type { Lesson } from "./beginner";
import { mk } from "./build";

export const ADVANCED_MODULES = [
  "Institutional Order Flow",
  "Volume & Auction Theory",
  "Intermarket Analysis",
  "Portfolio Risk",
  "Systematic Edge",
] as const;

const M = ADVANCED_MODULES;

export const ADVANCED_LESSONS: Lesson[] = [
  mk("a01-who-moves-markets", M[0], "Who Actually Moves Markets", "Banks, funds, market makers and the flows behind price.", 18,
    [
      ["Participant map", "Central banks, commercial hedgers, macro funds, systematic CTAs and market makers each trade for different reasons and on different horizons. Retail flow is a small fraction of volume."],
      ["Motive drives behaviour", "A hedger buys regardless of price; a CTA buys because a trend signal fired; a market maker wants to stay flat. Reading price means inferring which motive is active.", "Ask who must trade here, not who wants to."],
      ["Implications", "Moves driven by forced flow (rebalancing, hedging, stop cascades) tend to be fast and extend further than discretionary moves."],
    ],
    ["Participants trade for different motives.", "Forced flow moves price hardest.", "Retail is a small share of volume.", "Infer the active motive from behaviour."],
    "Participant notes", ["Pick one large XAUUSD move from last month.", "Research what news or flow drove it.", "Write which participant type was likely dominant."],
    [
      ["Which flow tends to extend furthest?", ["Discretionary", "Forced flow", "Retail", "Random"], 1, "Forced participants trade regardless of price."],
      ["A market maker generally wants to…", ["Hold large directional risk", "Stay close to flat", "Only buy", "Trade news"], 1, "They earn the spread, not direction."],
      ["A useful question is…", ["Who must trade here?", "What does Twitter think?", "What colour is the candle?", "Which broker is cheapest?"], 0, "Necessity beats preference."],
    ]),
  mk("a02-order-blocks", M[0], "Order Blocks: Evidence, Not Mythology", "When order blocks hold, when they fail, and how to test them.", 19,
    [
      ["Definition", "An order block is the last opposing candle before displacement that broke structure. The theory is that unfilled orders remain there."],
      ["Testing the claim", "Backtest a strict definition over at least 100 instances. Many traders find raw order blocks hold little better than random; the edge appears only with filters.", "Treat every popular concept as a hypothesis until your own data supports it."],
      ["Useful filters", "Higher-timeframe alignment, an untaken liquidity pool before the block, and a fair value gap created by the displacement each tend to improve hold rates."],
    ],
    ["Order blocks are hypotheses.", "Test with a strict definition.", "Filters create the edge.", "Use at least 100 samples."],
    "Order block backtest", ["Define an order block in one sentence.", "Log 50 instances on H1 gold.", "Record hold rate with and without a trend filter."],
    [
      ["An order block is…", ["Any candle", "The last opposing candle before displacement", "A round number", "A moving average"], 1, "That is the standard definition."],
      ["How should popular concepts be treated?", ["As facts", "As hypotheses to test", "As scams", "As indicators"], 1, "Your data decides."],
      ["Which filter often improves hold rates?", ["Higher-timeframe alignment", "Trading at weekends", "Larger size", "Removing stops"], 0, "Context matters."],
    ]),
  mk("a03-market-maker-model", M[0], "Accumulation, Manipulation, Distribution", "The three-phase model and its practical limits.", 17,
    [
      ["The model", "Price consolidates (accumulation), makes a false move to take liquidity (manipulation), then delivers in the true direction (distribution)."],
      ["Applying it intraday", "Asia accumulates, the London open manipulates, and London/New York distribute. This is a template, not a law.", "Use the model to frame scenarios, never to justify forcing a trade."],
      ["Failure modes", "On trend days there is no manipulation; on range days there is no distribution. Recognise them early and stand aside."],
    ],
    ["Three phases: accumulate, manipulate, distribute.", "Maps loosely to sessions.", "It is a template, not a law.", "Know the days it fails."],
    "Phase tagging", ["Tag ten trading days as fitting the model or not.", "Note the session timings of each phase.", "Calculate how often it fit."],
    [
      ["The manipulation phase typically…", ["Takes liquidity with a false move", "Is the real trend", "Never happens", "Is accumulation"], 0, "It is the stop run before delivery."],
      ["On a pure trend day the model…", ["Fits perfectly", "Often lacks a manipulation phase", "Always reverses", "Is mandatory"], 1, "Trend days skip the false move."],
      ["The model should be used to…", ["Force trades", "Frame scenarios", "Replace risk rules", "Predict news"], 1, "It is a framing tool."],
    ]),
  mk("a04-smt-divergence", M[0], "Correlated Divergence (SMT)", "Using disagreement between related markets as a signal.", 16,
    [
      ["The idea", "When two correlated instruments diverge at a liquidity level — one makes a new high, the other fails — it can signal weakness in the move."],
      ["Pairs to watch", "US30 versus NAS100, XAUUSD versus XAGUSD, EURUSD versus GBPUSD. Divergence is more meaningful at major session extremes.", "Divergence is confluence, not a trigger."],
      ["Execution", "Combine divergence with a sweep and internal CHoCH on the stronger instrument before entering."],
    ],
    ["Divergence shows a move lacking breadth.", "Use correlated pairs.", "Most meaningful at key extremes.", "Confluence, not trigger."],
    "Spot divergences", ["Overlay US30 and NAS100 on M15.", "Find three divergences at session highs or lows.", "Record what followed."],
    [
      ["SMT divergence compares…", ["Two correlated markets", "Two timeframes", "Two brokers", "Price and RSI"], 0, "It relies on correlation."],
      ["Divergence is best used as…", ["A standalone trigger", "Confluence", "A stop", "A target"], 1, "Combine with structure."],
      ["Which pair is commonly used?", ["Gold and silver", "Gold and wheat", "US30 and JPY", "Oil and BTC"], 0, "They are closely related."],
    ]),

  mk("a05-auction-theory", M[1], "Auction Market Theory", "Markets as two-way auctions seeking value.", 18,
    [
      ["Price advertises, time regulates", "Markets move to facilitate trade. Price probes higher or lower until it finds the other side; time spent at a price confirms acceptance."],
      ["Balance and imbalance", "Balanced markets rotate around value. Imbalanced markets trend to find new value.", "Acceptance outside value means a new auction; rejection means return to value."],
      ["Practical reading", "Fast moves through a level with little time spent signal rejection or initiative; slow, overlapping trade signals acceptance."],
    ],
    ["Markets are two-way auctions.", "Time confirms acceptance.", "Balance rotates, imbalance trends.", "Rejection returns price to value."],
    "Acceptance study", ["Mark yesterday's value area on US30.", "Note whether today accepted or rejected outside it.", "Record the session outcome."],
    [
      ["Time spent at a price indicates…", ["Rejection", "Acceptance", "Nothing", "A gap"], 1, "Time regulates acceptance."],
      ["An imbalanced market tends to…", ["Rotate", "Trend to find new value", "Close", "Freeze"], 1, "It seeks new value."],
      ["Rejection outside value often leads to…", ["A return to value", "A new trend", "Halted trading", "Wider spreads"], 0, "Failed auctions revert."],
    ]),
  mk("a06-volume-profile", M[1], "Volume Profile: POC and Value Area", "Reading where the market did business.", 17,
    [
      ["Components", "The point of control (POC) is the price with most volume. The value area holds roughly 70% of volume. Low-volume nodes are prices traded through quickly."],
      ["Using nodes", "High-volume nodes act as magnets and support; low-volume nodes are often traversed rapidly.", "Spot FX has no central volume; use tick volume or futures data as a proxy."],
      ["Session profiles", "Comparing today's developing value with yesterday's tells you whether the market is migrating or balancing."],
    ],
    ["POC is the highest-volume price.", "Value area holds about 70% of volume.", "Low-volume nodes are traversed fast.", "Spot FX volume is a proxy."],
    "Profile mapping", ["Apply a session volume profile to gold futures.", "Mark POC, VAH and VAL.", "Note how price reacted next session."],
    [
      ["The POC is…", ["The high of day", "The price with most volume", "The open", "The 50% level"], 1, "Point of control is peak volume."],
      ["Low-volume nodes are usually…", ["Strong support", "Traversed quickly", "Ignored by price", "The POC"], 1, "Little business was done there."],
      ["Spot FX volume data is…", ["Centralised", "A proxy at best", "Exact", "Unavailable everywhere"], 1, "Spot is decentralised."],
    ]),
  mk("a07-vwap", M[1], "VWAP and Anchored VWAP", "The institutional benchmark and how to use it.", 15,
    [
      ["Why VWAP matters", "Execution desks are often measured against VWAP. Price above it suggests buyers in control for the session; below suggests sellers."],
      ["Anchored VWAP", "Anchoring VWAP to a significant event — a swing low, a news candle — shows the average cost of everyone who traded since then.", "Anchor to events that changed behaviour, not to arbitrary candles."],
      ["Trading it", "Pullbacks to VWAP in a trending session are frequent continuation entries; repeated failure to reclaim it signals weakness."],
    ],
    ["VWAP is an execution benchmark.", "Above or below shows session control.", "Anchor to meaningful events.", "VWAP pullbacks suit trends."],
    "Anchor practice", ["Anchor VWAP to last week's low on XAUUSD.", "Mark every touch.", "Record whether each held."],
    [
      ["Anchored VWAP shows…", ["Average cost since the anchor", "The POC", "Spread", "Volatility"], 0, "It averages from the anchor point."],
      ["Price below session VWAP suggests…", ["Buyers in control", "Sellers in control", "No information", "A holiday"], 1, "Below average price favours sellers."],
      ["Good anchors are…", ["Random candles", "Events that changed behaviour", "Every hour", "Moving averages"], 1, "Meaningful events matter."],
    ]),
  mk("a08-delta", M[1], "Delta, Absorption and Exhaustion", "Reading aggressive versus passive orders.", 18,
    [
      ["Delta", "Delta is aggressive buying volume minus aggressive selling volume. Rising price with rising delta shows genuine demand."],
      ["Absorption", "When heavy aggressive selling hits a level but price will not fall, passive buyers are absorbing. That often precedes reversal.", "Absorption is visible only in futures order flow, not on a standard candle chart."],
      ["Exhaustion", "A final burst of aggressive volume with no follow-through at an extreme often marks the end of a move."],
    ],
    ["Delta measures aggression.", "Absorption is effort without result.", "Exhaustion is a final failed burst.", "Requires futures order-flow data."],
    "Footprint review", ["Open a footprint chart on gold futures (GC).", "Find one absorption event.", "Screenshot and annotate it."],
    [
      ["Absorption looks like…", ["Heavy selling with no price drop", "Price falling fast", "Low volume", "A gap"], 0, "Effort without result."],
      ["Delta is…", ["Total volume", "Aggressive buys minus aggressive sells", "Spread", "Open interest"], 1, "It nets aggression."],
      ["Exhaustion often appears…", ["Mid-range", "At extremes with no follow-through", "During Asia only", "Never"], 1, "The last buyers or sellers run out."],
    ]),

  mk("a09-dollar-gold", M[2], "The Dollar, Yields and Gold", "The macro drivers behind XAUUSD.", 18,
    [
      ["Real yields", "Gold pays no yield, so rising real (inflation-adjusted) yields raise the opportunity cost of holding it. Falling real yields tend to support gold."],
      ["The dollar", "Gold is priced in dollars; a stronger DXY usually weighs on it, though the relationship breaks during crises when both can rise.", "Correlations shift with regime. Check them, do not assume them."],
      ["Central bank demand", "Sustained official-sector buying can override short-term yield moves, which is part of why gold has decoupled at times."],
    ],
    ["Real yields drive gold's opportunity cost.", "A strong dollar usually weighs on gold.", "Crisis regimes break correlations.", "Central bank buying matters."],
    "Driver dashboard", ["Chart XAUUSD, DXY and US 10-year real yields together.", "Note the last three divergences.", "Write what explained each."],
    [
      ["Rising real yields usually…", ["Support gold", "Weigh on gold", "Have no effect", "Close markets"], 1, "Opportunity cost rises."],
      ["Gold and the dollar can both rise during…", ["Crises", "Every Monday", "Never", "Low volatility"], 0, "Safe-haven demand lifts both."],
      ["Correlations should be…", ["Assumed permanent", "Checked regularly", "Ignored", "Fixed at -1"], 1, "Regimes change."],
    ]),
  mk("a10-indices-rates", M[2], "Equity Indices and Rate Expectations", "Why US30 and NAS100 react to bonds and the Fed.", 16,
    [
      ["Discount rates", "Equity valuations depend on discounting future earnings. Higher expected rates reduce present value, hitting growth-heavy NAS100 harder than US30."],
      ["Fed path", "Markets price the expected rate path via futures. Surprises versus that pricing — not the decision itself — move indices.", "Trade the surprise relative to expectations, not the headline."],
      ["Earnings season", "Index constituents reporting can dominate macro for weeks; check the calendar for heavyweight names."],
    ],
    ["Higher rates reduce equity present value.", "NAS100 is more rate-sensitive.", "Surprise versus pricing moves markets.", "Watch earnings season."],
    "Expectation tracker", ["Before the next Fed meeting, note market-implied odds.", "Record the outcome and index reaction.", "Explain the reaction relative to expectations."],
    [
      ["Which index is usually more rate-sensitive?", ["US30", "NAS100", "Both equal", "Neither"], 1, "Growth stocks depend more on distant earnings."],
      ["Markets mostly react to…", ["The headline only", "The surprise versus expectations", "Social media", "The time of day"], 1, "Priced-in news moves little."],
      ["Higher expected rates tend to…", ["Raise valuations", "Lower present value of earnings", "Have no effect", "Raise gold"], 1, "Discounting increases."],
    ]),
  mk("a11-risk-sentiment", M[2], "Risk-On, Risk-Off Regimes", "Reading the market's appetite for risk across assets.", 15,
    [
      ["Indicators", "Risk-off: JPY and CHF strengthen, equities fall, VIX rises, gold often bid. Risk-on: the reverse, with commodity currencies and indices firm."],
      ["Regime awareness", "Setups that work in risk-on (buying index dips) can fail badly in risk-off.", "Identify the regime before choosing which setups to trade."],
      ["Fast checks", "A quick five-chart scan — SPX, VIX, USDJPY, AUDUSD, gold — gives a regime read in under a minute."],
    ],
    ["Risk-off lifts JPY, CHF and VIX.", "Risk-on lifts indices and AUD.", "Setups depend on regime.", "Use a five-chart scan."],
    "Daily regime scan", ["Build a five-chart workspace.", "Label each day risk-on or risk-off for a week.", "Compare with how your setups performed."],
    [
      ["In risk-off, VIX usually…", ["Falls", "Rises", "Stays flat", "Disappears"], 1, "Fear increases implied volatility."],
      ["Buying index dips tends to work best in…", ["Risk-on", "Risk-off", "Holidays", "Any regime equally"], 0, "Appetite supports dips."],
      ["JPY typically strengthens in…", ["Risk-on", "Risk-off", "Bull markets only", "Never"], 1, "It is a funding and safe-haven currency."],
    ]),
  mk("a12-cot-positioning", M[2], "Positioning Data and Crowding", "Using COT and sentiment to spot crowded trades.", 16,
    [
      ["COT reports", "The weekly Commitments of Traders report shows futures positioning by category. Extreme speculative positioning signals crowding."],
      ["Contrarian use", "Crowded trades unwind violently when catalysts appear. Extremes are context for risk, not timing signals.", "A crowded trade can stay crowded for months."],
      ["Retail sentiment", "Broker sentiment ratios are often contrarian at extremes, but should be combined with structure."],
    ],
    ["COT shows positioning by category.", "Extremes signal crowding.", "Crowding is context, not timing.", "Retail ratios are contrarian at extremes."],
    "Positioning check", ["Download the latest COT for gold.", "Compare speculative net longs to a 3-year range.", "Note whether it is at an extreme."],
    [
      ["The COT report is released…", ["Daily", "Weekly", "Yearly", "Hourly"], 1, "It is published weekly."],
      ["Extreme positioning is best used as…", ["A precise entry trigger", "Risk context", "Irrelevant", "A guarantee"], 1, "It shows vulnerability, not timing."],
      ["Crowded trades unwind…", ["Gently", "Violently on catalysts", "Never", "Only on weekends"], 1, "Everyone exits at once."],
    ]),

  mk("a13-position-sizing", M[3], "Volatility-Adjusted Position Sizing", "Sizing by ATR so each trade carries equal risk.", 16,
    [
      ["Why adjust", "A 20-pip stop on gold in a quiet week is very different from one in a volatile week. Fixed lot sizes create unequal risk."],
      ["ATR method", "Base stop distance on a multiple of ATR, then compute lot size so the monetary risk stays fixed.", "Equal risk per trade makes your statistics meaningful."],
      ["Using the calculator", "AASAKIRA's lot size tool converts stop distance and risk percentage into lots for gold, indices and FX."],
    ],
    ["Fixed lots create unequal risk.", "Use ATR to set stop distance.", "Keep monetary risk constant.", "Equal risk makes stats meaningful."],
    "ATR sizing", ["Note today's H1 ATR on XAUUSD.", "Set a stop at 1.5× ATR.", "Calculate lots for 0.5% risk using the lot size tool."],
    [
      ["Why use ATR for stops?", ["It adapts to volatility", "It is a broker rule", "It removes losses", "It is fixed"], 0, "It scales with conditions."],
      ["Monetary risk per trade should be…", ["Variable", "Constant", "Random", "Maximised"], 1, "Consistency enables analysis."],
      ["Fixed lots in changing volatility cause…", ["Equal risk", "Unequal risk", "No risk", "Higher win rate"], 1, "Stop distance changes the risk."],
    ]),
  mk("a14-drawdown-maths", M[3], "The Mathematics of Drawdown", "Why recovery is harder than loss, and how to plan for it.", 15,
    [
      ["Asymmetry", "A 10% loss needs 11.1% to recover; 25% needs 33%; 50% needs 100%. Deep drawdowns are mathematically crippling."],
      ["Expected streaks", "With a 50% win rate, a run of 7 losses over 500 trades is likely. Your size must survive the streaks your stats predict.", "Plan for the streak you will get, not the one you hope for."],
      ["Drawdown rules", "Cut size by half after a defined drawdown (e.g. 5%) and restore only after recovering half of it."],
    ],
    ["Recovery requires more than the loss.", "Losing streaks are statistically expected.", "Size for the worst likely streak.", "Reduce size during drawdown."],
    "Streak simulation", ["Use your win rate to estimate the longest expected losing streak over 300 trades.", "Calculate the drawdown at your current risk.", "Adjust risk if it exceeds 15%."],
    [
      ["A 50% loss needs what gain to recover?", ["50%", "100%", "75%", "25%"], 1, "Half the capital must double."],
      ["Losing streaks should be…", ["Ignored", "Planned for", "Impossible", "Rare at any win rate"], 1, "They are statistically expected."],
      ["A sensible drawdown response is…", ["Double size", "Cut size", "Stop journalling", "Remove stops"], 1, "Protect capital first."],
    ]),
  mk("a15-kelly", M[3], "Expectancy and the Kelly Criterion", "Sizing from edge, and why traders use a fraction of Kelly.", 18,
    [
      ["Expectancy", "Expectancy = (win rate × average win) − (loss rate × average loss). A positive number in R is the precondition for any sizing model."],
      ["Kelly", "Kelly gives the size that maximises long-run growth given your edge. Full Kelly is extremely volatile and assumes your stats are exact.", "Use a quarter or half Kelly at most; your edge estimate is always noisy."],
      ["Practical ceiling", "For most discretionary traders this lands at 0.5–1% risk per trade, consistent with standard prudence."],
    ],
    ["Expectancy must be positive first.", "Kelly maximises growth in theory.", "Full Kelly is too volatile.", "Use fractional Kelly."],
    "Compute your edge", ["Calculate expectancy in R from your last 50 trades.", "Compute full Kelly.", "Compare quarter Kelly with your current risk."],
    [
      ["Expectancy combines…", ["Win rate and average win/loss", "Spread and swap", "Lot size and leverage", "Time and price"], 0, "That is the formula."],
      ["Why use fractional Kelly?", ["Edge estimates are noisy", "It is required by law", "It increases volatility", "No reason"], 0, "Overestimating edge with full Kelly is ruinous."],
      ["Sizing requires first…", ["Positive expectancy", "High leverage", "Many pairs", "A VPS"], 0, "Without edge, no size is correct."],
    ]),
  mk("a16-portfolio-heat", M[3], "Portfolio Heat and Risk Budgets", "Managing total open risk across the book.", 14,
    [
      ["Portfolio heat", "Heat is the total risk if every open stop were hit at once. It is the number that blows accounts, not the single-trade figure."],
      ["Budgets", "Set daily, weekly and open-heat limits, e.g. 3% open heat, 2% daily loss, 5% weekly loss.", "When a budget is hit, the day or week is over. No exceptions."],
      ["Correlation adjustment", "Count correlated positions at full weight; heat on three index longs is triple, not diversified."],
    ],
    ["Heat is total open risk.", "Set daily, weekly and open limits.", "A hit budget ends the period.", "Correlated positions add fully."],
    "Set your budgets", ["Write your open heat, daily and weekly loss limits.", "Add them to your trading plan.", "Review compliance at week end."],
    [
      ["Portfolio heat is…", ["One trade's risk", "Total risk if all stops hit", "Spread cost", "Profit target"], 1, "It sums open risk."],
      ["When a daily budget is hit you should…", ["Trade bigger", "Stop for the day", "Switch pairs", "Remove stops"], 1, "The rule protects you from tilt."],
      ["Three correlated index longs count as…", ["Diversified", "Roughly triple exposure", "Hedged", "Zero"], 1, "They share one driver."],
    ]),

  mk("a17-backtesting", M[4], "Rigorous Backtesting", "Avoiding the biases that make backtests lie.", 19,
    [
      ["Common biases", "Look-ahead bias, survivorship bias, curve-fitting and cherry-picked samples all inflate backtests."],
      ["Process", "Define rules before testing, test on one period, validate on an unseen period, and log every instance — including the ugly ones.", "If you adjusted the rules after seeing results, the test is in-sample only."],
      ["Sample size", "Aim for at least 100 trades per setup before trusting the statistics."],
    ],
    ["Biases inflate backtests.", "Fix rules before testing.", "Validate out of sample.", "Use 100+ trades."],
    "Out-of-sample test", ["Write rules for one setup.", "Test on 2024 data.", "Validate untouched on 2025 data and compare."],
    [
      ["Adjusting rules after seeing results creates…", ["Out-of-sample proof", "Curve-fitting", "Lower risk", "Higher edge"], 1, "Fitting to known data."],
      ["Out-of-sample testing uses…", ["The same data", "Unseen data", "Live trades only", "Indicators"], 1, "It checks robustness."],
      ["A reasonable minimum sample is…", ["10", "100", "3", "1,000,000"], 1, "Small samples mislead."],
    ]),
  mk("a18-metrics", M[4], "Performance Metrics That Matter", "Profit factor, expectancy, Sharpe and MAE/MFE.", 16,
    [
      ["Core metrics", "Profit factor (gross wins ÷ gross losses), expectancy in R, max drawdown and Sharpe ratio together describe a strategy far better than win rate."],
      ["MAE and MFE", "Maximum adverse and favourable excursion show how far trades went against and for you. They reveal whether stops are too tight or targets too close.", "Win rate alone is the most misleading number in trading."],
      ["Benchmarks", "A profit factor above 1.5 with a meaningful sample is solid for discretionary trading."],
    ],
    ["Win rate alone misleads.", "Use profit factor and expectancy.", "MAE/MFE tune stops and targets.", "Profit factor above 1.5 is solid."],
    "Metric sheet", ["Compute profit factor and expectancy from your journal.", "Record MAE and MFE for 20 trades.", "Decide whether to adjust stops or targets."],
    [
      ["Profit factor is…", ["Wins ÷ losses count", "Gross wins ÷ gross losses", "Win rate × R", "Sharpe ÷ 2"], 1, "It compares gross money won to lost."],
      ["MFE helps you judge…", ["Whether targets are too close", "Spread", "Swap", "Broker quality"], 0, "It shows unrealised potential."],
      ["The most misleading single metric is…", ["Expectancy", "Win rate", "Drawdown", "Profit factor"], 1, "It ignores win and loss size."],
    ]),
  mk("a19-edge-decay", M[4], "Edge Decay and Regime Change", "Detecting when a strategy stops working.", 15,
    [
      ["Why edges decay", "Markets adapt, volatility regimes shift and crowded strategies get arbitraged away."],
      ["Monitoring", "Track rolling 30-trade expectancy. A drop beyond the range seen in backtests is a warning; two consecutive windows is a signal.", "Distinguish a normal drawdown from decay using your historical distribution."],
      ["Response", "Reduce size, return to testing, and check whether the regime (volatility, trend strength) has changed."],
    ],
    ["Edges decay as markets adapt.", "Track rolling expectancy.", "Compare against historical ranges.", "Reduce size and retest on warnings."],
    "Rolling expectancy", ["Compute rolling 30-trade expectancy for your main setup.", "Plot it.", "Mark any windows outside the backtested range."],
    [
      ["Rolling expectancy helps detect…", ["Spread changes", "Edge decay", "Broker outages", "News"], 1, "It shows performance drift."],
      ["On a decay warning you should…", ["Increase size", "Reduce size and retest", "Ignore it", "Switch brokers"], 1, "Protect capital while investigating."],
      ["Normal drawdown versus decay is judged by…", ["Feelings", "Historical distribution", "Social media", "Time of day"], 1, "Compare with your data."],
    ]),
  mk("a20-playbook", M[4], "Building a Written Playbook", "Codifying your best setups into a reference document.", 17,
    [
      ["What a playbook is", "A playbook documents each setup: context, trigger, entry, stop, targets, management, and annotated examples of A-grade and failed trades."],
      ["Why it works", "Writing forces clarity, and reviewing it before each session anchors you to tested behaviour rather than impulse.", "If a trade is not in the playbook, it is not a trade."],
      ["Maintenance", "Update the playbook only after monthly reviews, with dated changes."],
    ],
    ["A playbook documents every setup.", "Include annotated examples.", "Review before each session.", "Update only after reviews."],
    "Write one play", ["Choose your best setup.", "Document all seven fields with three examples.", "Read it before every session next week."],
    [
      ["A playbook entry should include…", ["Only the entry", "Context, trigger, stop, targets and examples", "Just screenshots", "Indicator settings only"], 1, "Complete specification."],
      ["A trade not in the playbook is…", ["Fine if it feels right", "Not a trade", "Double size", "Mandatory"], 1, "That is the discipline rule."],
      ["The playbook should be updated…", ["Daily on impulse", "After monthly reviews", "Never", "After each loss"], 1, "Changes must be evidence-based."],
    ]),
];

export const TOTAL_ADVANCED_LESSONS = ADVANCED_LESSONS.length;
