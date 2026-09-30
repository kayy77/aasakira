import type { Lesson } from "./beginner";
import { mk } from "./build";

export const INTERMEDIATE_MODULES = [
  "Market Structure",
  "Liquidity",
  "Sessions & Timing",
  "Multi-Timeframe Execution",
  "Trade Management",
] as const;

const M = INTERMEDIATE_MODULES;

export const INTERMEDIATE_LESSONS: Lesson[] = [
  mk("i01-swing-structure", M[0], "Defining Swing Structure Objectively", "Rules for marking swing highs and lows so two traders see the same chart.", 16,
    [
      ["Why objectivity matters", "Most structural disagreement comes from marking swings by feel. A rule-based definition — for example, a swing high is a candle with a lower high on each side, confirmed by a close beyond the prior swing — lets you backtest and journal consistently.", "If you cannot write your swing rule in one sentence, you do not have one."],
      ["Internal versus external structure", "External structure is the major swing range on your working timeframe. Internal structure is the smaller sequence inside it. Trade direction comes from external structure; entries are refined on internal structure."],
      ["Common marking errors", "Marking every wick, ignoring gaps across session opens, and redrawing swings after the fact all corrupt your read. Mark once, in real time, and leave the marks alone.", "Redrawing structure after price moves is hindsight, not analysis."],
    ],
    ["Use a written, repeatable swing definition.", "Direction comes from external structure.", "Entries are refined on internal structure.", "Never redraw swings in hindsight."],
    "Mark twenty swings", ["Open XAUUSD on H1 and mark the last twenty swing points using your written rule.", "Label each as external or internal.", "Screenshot and save it to your journal for later comparison."],
    [
      ["What decides trade direction?", ["Internal structure", "External structure", "The last candle", "An indicator"], 1, "External structure defines the dominant range and bias."],
      ["Why write a swing rule?", ["It looks professional", "It makes marking repeatable and testable", "Brokers require it", "It removes all losses"], 1, "A written rule allows consistent backtesting and journalling."],
      ["Redrawing swings after price moves is…", ["Good practice", "Hindsight bias", "Required for accuracy", "Only allowed on H4"], 1, "It distorts your record of what was actually visible."],
    ]),
  mk("i02-bos-choch", M[0], "Break of Structure and Change of Character", "Separating continuation breaks from genuine shifts in order flow.", 18,
    [
      ["Break of structure", "A break of structure (BOS) is a candle close beyond the most recent external swing in the direction of the trend. It confirms continuation and moves your protected low or high."],
      ["Change of character", "A change of character (CHoCH) is the first close against the trend beyond the swing that produced the last BOS. It is an early warning, not an automatic reversal signal.", "A CHoCH on M5 inside an H4 uptrend is usually a pullback, not a reversal."],
      ["Wicks versus closes", "Wicks through a level often represent liquidity being taken. Requiring a body close filters many false breaks at the cost of slightly later confirmation."],
    ],
    ["BOS confirms continuation.", "CHoCH is a warning, not a reversal guarantee.", "Prefer body closes over wicks.", "Always read breaks relative to the higher timeframe."],
    "Label breaks", ["On US30 M15, label every BOS and CHoCH from the last three sessions.", "Note which CHoCHs led to real reversals.", "Record the hit rate in your journal."],
    [
      ["A CHoCH is best treated as…", ["A guaranteed reversal", "An early warning", "Irrelevant", "A BOS"], 1, "It flags possible change; confirmation is still needed."],
      ["Why require a body close?", ["It filters liquidity wicks", "It is faster", "It shows volume", "It is a broker rule"], 0, "Wicks often sweep liquidity without a genuine break."],
      ["A BOS moves your…", ["Take profit", "Protected swing", "Lot size", "Session"], 1, "The new protected swing becomes the invalidation reference."],
    ]),
  mk("i03-premium-discount", M[0], "Premium, Discount and Equilibrium", "Using the dealing range to decide where to buy and where to sell.", 14,
    [
      ["The dealing range", "Take the current external swing low to swing high. The midpoint is equilibrium. Above it is premium, below it is discount."],
      ["Buying cheap, selling expensive", "In an uptrend, look for longs in discount. In a downtrend, look for shorts in premium. Entering longs in premium compresses your reward-to-risk and raises failure rates.", "Location often matters more than the entry pattern."],
      ["Refining with internal ranges", "Once a pullback forms, draw a new internal range to find discount within discount. This is how you tighten stops without guessing."],
    ],
    ["Equilibrium is the 50% of the dealing range.", "Buy in discount, sell in premium.", "Refine with internal ranges.", "Poor location destroys reward-to-risk."],
    "Grade your location", ["Review your last ten trades.", "Mark whether each entry was in premium or discount of the range.", "Compare results between the two groups."],
    [
      ["In an uptrend you should prefer longs in…", ["Premium", "Discount", "Equilibrium only", "Any zone"], 1, "Discount offers better price and reward-to-risk."],
      ["Equilibrium is…", ["The session open", "The 50% of the dealing range", "The daily close", "A moving average"], 1, "It is the midpoint of the swing range."],
      ["Why refine with internal ranges?", ["To tighten stops objectively", "To add indicators", "To trade more often", "To avoid journalling"], 0, "Internal ranges give a structured smaller location."],
    ]),
  mk("i04-trend-phases", M[0], "Trend Phases: Expansion, Retracement, Consolidation", "Identifying which phase the market is in and which strategies suit it.", 15,
    [
      ["Three phases", "Markets alternate between expansion (impulsive moves), retracement (pullbacks against the move) and consolidation (ranges). Each phase rewards different behaviour."],
      ["Matching strategy to phase", "Breakout entries work in the transition from consolidation to expansion. Pullback entries work in retracement. Mean reversion works inside consolidation.", "Most losing streaks come from running one strategy in every phase."],
      ["Spotting the transition", "Contracting candle ranges and overlapping bodies signal consolidation. Large displacement candles with little overlap signal expansion."],
    ],
    ["Identify the phase before choosing a setup.", "Pullbacks suit retracements.", "Mean reversion suits ranges.", "Displacement signals expansion."],
    "Phase log", ["For five days, note the phase of XAUUSD at the London open.", "Record which setup would have fitted.", "Compare with what actually happened."],
    [
      ["Overlapping bodies and shrinking ranges suggest…", ["Expansion", "Consolidation", "A BOS", "A news spike"], 1, "Overlap and contraction indicate a range."],
      ["Mean reversion is best suited to…", ["Expansion", "Consolidation", "Gaps", "News"], 1, "Ranges revert to the mean."],
      ["A common cause of losing streaks is…", ["Journalling", "Using one strategy in every phase", "Small size", "Stops"], 1, "Strategies must match the market phase."],
    ]),

  mk("i05-liquidity-pools", M[1], "Where Liquidity Rests", "Equal highs, equal lows, trendlines and the orders clustered around them.", 17,
    [
      ["Liquidity defined", "Liquidity is resting orders: stops and pending entries. Larger participants need it to fill size, so price is drawn towards it."],
      ["Obvious pools", "Equal highs and lows, prior day high and low, session extremes and clean trendlines all attract stops. The more obvious the level, the more orders sit there.", "If a level looks perfect to you, it looks perfect to everyone — including those who will run it."],
      ["Buy-side and sell-side", "Buy-side liquidity sits above highs (short stops, buy stops). Sell-side liquidity sits below lows. Price typically seeks one before delivering to the other."],
    ],
    ["Liquidity is clustered resting orders.", "Obvious levels hold the most stops.", "Buy-side sits above highs, sell-side below lows.", "Price often seeks one side before the other."],
    "Map the pools", ["On the H1 chart, mark prior day high and low and any equal highs or lows.", "Label buy-side and sell-side.", "Watch which is taken first during the next session."],
    [
      ["Buy-side liquidity sits…", ["Below lows", "Above highs", "At the open", "At equilibrium"], 1, "Short stops and buy stops rest above highs."],
      ["Why are obvious levels attractive to large players?", ["They hold many resting orders", "They are round numbers only", "Brokers mark them", "They never break"], 0, "Size needs liquidity to fill."],
      ["Equal lows usually hold…", ["Buy-side liquidity", "Sell-side liquidity", "No orders", "Only limit buys"], 1, "Stops of longs rest below equal lows."],
    ]),
  mk("i06-sweeps", M[1], "Liquidity Sweeps and Stop Runs", "Telling a sweep-and-reverse apart from a genuine breakout.", 18,
    [
      ["Anatomy of a sweep", "A sweep trades through a liquidity level, fills orders, then closes back inside the prior range. The wick is the footprint of that fill."],
      ["Sweep versus breakout", "A breakout closes beyond the level and holds on retest. A sweep rejects quickly and shifts internal structure the other way.", "Wait for the internal CHoCH after a sweep before acting."],
      ["Context filters", "Sweeps into higher-timeframe premium or discount, during active sessions, carry more weight than random midday wicks."],
    ],
    ["A sweep takes liquidity then closes back inside.", "Breakouts hold on retest.", "Confirm sweeps with an internal CHoCH.", "Higher-timeframe location adds weight."],
    "Sweep study", ["Find five sweeps of the prior day high or low on XAUUSD.", "Note whether an internal CHoCH followed.", "Record the move that followed each."],
    [
      ["A sweep usually closes…", ["Beyond the level", "Back inside the range", "At equilibrium", "At the high of day"], 1, "Rejection back inside is the defining feature."],
      ["What confirms a sweep entry?", ["An internal CHoCH", "An RSI cross", "A round number", "Time of day alone"], 0, "Structure shift confirms intent."],
      ["A breakout typically…", ["Rejects immediately", "Holds on retest", "Has no close", "Only happens at night"], 1, "Acceptance beyond the level defines a breakout."],
    ]),
  mk("i07-inducement", M[1], "Inducement and Engineered Liquidity", "How minor structure lures early entries before the real move.", 16,
    [
      ["What inducement is", "Inducement is a minor swing that invites early traders to enter before price reaches the true point of interest. Their stops become fuel."],
      ["Recognising it", "Look for a small internal high or low sitting just before your zone. If price has not taken it yet, your zone is more likely to be reached cleanly after it is.", "No inducement taken, no entry — a useful discipline filter."],
      ["Practical use", "Use inducement as a timing tool: wait for it to be swept before arming limit orders at your zone."],
    ],
    ["Inducement lures early entries.", "Their stops fuel the move into your zone.", "Wait for inducement to be taken.", "Use it as a timing filter."],
    "Find inducement", ["Mark three recent zones you traded.", "Identify whether inducement existed before each.", "Compare outcomes when it was taken versus not."],
    [
      ["Inducement is best described as…", ["A major swing", "A minor swing that lures early entries", "A news event", "A moving average"], 1, "It invites premature positions."],
      ["A useful rule is…", ["Enter before inducement", "Wait for inducement to be taken", "Ignore it", "Double size at inducement"], 1, "Taken inducement improves zone quality."],
      ["Stops of early traders become…", ["Irrelevant", "Fuel for the move", "Profit for you automatically", "Hidden"], 1, "Their stops are liquidity."],
    ]),
  mk("i08-imbalance", M[1], "Imbalance and Fair Value Gaps", "Reading displacement and the gaps it leaves behind.", 17,
    [
      ["Displacement", "Displacement is a strong one-directional move with large bodies and small wicks. It shows aggressive orders overwhelming the other side."],
      ["Fair value gaps", "A fair value gap is a three-candle pattern where the first and third candles' wicks do not overlap. Price often returns to rebalance part of that gap.", "Not every gap fills. Gaps with the higher-timeframe trend are far more reliable."],
      ["Using gaps for entries", "Combine a gap with discount or premium location and a liquidity sweep. The gap alone is a location, not a signal."],
    ],
    ["Displacement reveals aggression.", "FVGs are three-candle inefficiencies.", "Trade gaps with the higher-timeframe trend.", "A gap is a location, not a signal."],
    "Gap audit", ["Mark ten FVGs on H1.", "Record how many were revisited within 24 hours.", "Note which were with-trend."],
    [
      ["A fair value gap involves how many candles?", ["Two", "Three", "Five", "One"], 1, "It is defined across three candles."],
      ["The most reliable gaps are…", ["Against trend", "With the higher-timeframe trend", "On M1 only", "At weekends"], 1, "Trend alignment raises reliability."],
      ["A gap on its own is…", ["A full signal", "A location", "Useless", "A stop level"], 1, "It needs confluence to become a trade."],
    ]),

  mk("i09-session-profiles", M[2], "Asia, London and New York Profiles", "How each session typically behaves and why it matters.", 15,
    [
      ["Asia", "Asia often builds a range with lower volatility. That range becomes a liquidity reference for the sessions that follow."],
      ["London", "London frequently sweeps one side of the Asian range and sets the day's first directional leg.", "The Asian high or low taken at London open is one of the most repeatable intraday patterns."],
      ["New York", "New York can continue London's move or reverse it, especially around the US data releases and the London close overlap."],
    ],
    ["Asia builds ranges.", "London often sweeps Asia and sets direction.", "New York continues or reverses.", "Session extremes are liquidity references."],
    "Session journal", ["For one week, record the Asian range on XAUUSD.", "Note which side London took.", "Note whether New York continued or reversed."],
    [
      ["Asia is typically…", ["Most volatile", "Range-building", "Closed", "Trend-only"], 1, "Lower volatility builds ranges."],
      ["London commonly…", ["Ignores Asia", "Sweeps one side of the Asian range", "Only reverses", "Trades no gold"], 1, "The Asian extremes are key liquidity."],
      ["New York may…", ["Continue or reverse London", "Always continue", "Always reverse", "Only range"], 0, "Both behaviours are common."],
    ]),
  mk("i10-killzones", M[2], "Kill Zones and Time-Based Filters", "Restricting execution to the windows where your edge lives.", 13,
    [
      ["Why time matters", "Volume is not uniform. Most displacement happens in a few hours around session opens. Trading outside them increases noise."],
      ["Defining your windows", "A common approach is London open (07:00–10:00 UK) and New York open (12:30–15:30 UK). Adjust to your own journal data.", "Your windows should come from your statistics, not from a video."],
      ["Enforcing the filter", "Set alerts only inside your windows and close the platform outside them. Time filters are one of the simplest ways to cut overtrading."],
    ],
    ["Volume clusters around session opens.", "Define windows from your own data.", "Only trade inside your windows.", "Time filters cut overtrading."],
    "Time-tag your trades", ["Export your last 30 trades.", "Tag each by hour of entry.", "Identify your best and worst windows."],
    [
      ["Why use time windows?", ["Volume is uneven through the day", "Brokers require it", "Spreads are fixed", "To trade more"], 0, "Edge concentrates where volume is."],
      ["Your windows should come from…", ["Social media", "Your journal statistics", "Random choice", "Indicators"], 1, "Personal data beats generic rules."],
      ["A simple way to enforce windows is…", ["Trading all day", "Closing the platform outside them", "Using more pairs", "Removing stops"], 1, "Remove the temptation."],
    ]),
  mk("i11-news", M[2], "Trading Around High-Impact News", "CPI, NFP and FOMC: when to stand aside and when to engage.", 16,
    [
      ["Why news is different", "High-impact releases widen spreads, create slippage and can move gold or indices hundreds of pips in seconds. Normal stop placement assumptions break."],
      ["Stand-aside rules", "A sensible default: no new entries 15 minutes either side of red-folder events, and reduce size on open positions or move to breakeven.", "Missing a news move costs nothing. Being slipped through your stop costs real money."],
      ["Post-news structure", "After the initial spike, price often retraces into the displacement. Treat the post-news range like any other structure once spreads normalise."],
    ],
    ["News widens spreads and causes slippage.", "Stand aside around red-folder releases.", "Protect open positions before events.", "Trade post-news structure once spreads settle."],
    "Build a news routine", ["Check the economic calendar every Sunday.", "List red-folder events for XAUUSD and US30.", "Write your stand-aside window for each."],
    [
      ["A sensible default around red-folder news is…", ["Max size", "No new entries either side", "Remove stops", "Trade M1 scalps"], 1, "Avoid spread and slippage risk."],
      ["What commonly happens after the initial spike?", ["Price stops moving", "A retrace into the displacement", "Markets close", "Spreads tighten instantly"], 1, "Retracements into displacement are common."],
      ["Missing a news move costs…", ["Your account", "Nothing", "A fee", "Your stop"], 1, "Opportunity cost is not a loss."],
    ]),
  mk("i12-weekly-profile", M[2], "Weekly Profiles and the Daily Bias", "Using the week's likely shape to set a daily directional lean.", 15,
    [
      ["Weekly tendencies", "Many weeks form their high or low early (Monday–Tuesday) and expand midweek. Knowing typical profiles helps you avoid chasing on Thursday what formed on Tuesday."],
      ["Forming a daily bias", "Combine the weekly profile, the previous day's close relative to its range, and the nearest untaken liquidity to set a lean.", "A bias is a hypothesis. It must be allowed to fail."],
      ["Invalidation", "Write the level that would invalidate your bias before the session. If it breaks, you flip to neutral, not to the opposite bias automatically."],
    ],
    ["Weekly highs and lows often form early.", "Bias uses profile, close and liquidity.", "A bias is a testable hypothesis.", "Pre-define invalidation."],
    "Daily bias sheet", ["Each morning for a week, write your bias and invalidation.", "Record the outcome at day end.", "Calculate your bias accuracy."],
    [
      ["A bias should be treated as…", ["A certainty", "A hypothesis", "Irrelevant", "A signal"], 1, "It can and should be allowed to fail."],
      ["If invalidation breaks you should…", ["Flip to the opposite bias", "Go neutral", "Add size", "Ignore it"], 1, "Neutral until a new picture forms."],
      ["Weekly highs or lows often form…", ["On Friday only", "Early in the week", "Never", "At weekends"], 1, "Early-week extremes are common."],
    ]),

  mk("i13-top-down", M[3], "Top-Down Analysis Workflow", "A fixed sequence from weekly to entry timeframe.", 18,
    [
      ["The sequence", "Weekly and daily set context and draw on liquidity. H4 and H1 define the dealing range and point of interest. M15 and M5 handle entry confirmation."],
      ["Keeping it consistent", "Run the same checklist in the same order each session. Consistency makes your journal comparable across weeks.", "Skipping the higher timeframe to save time is the most expensive shortcut in trading."],
      ["Resolving conflict", "When timeframes disagree, the higher timeframe wins for direction, and you reduce size or wait for alignment."],
    ],
    ["Higher timeframes set context.", "Middle timeframes define the zone.", "Lower timeframes confirm entries.", "Higher timeframe wins conflicts."],
    "Write your checklist", ["Write a six-step top-down checklist.", "Use it before every trade for one week.", "Refine any step you consistently skip."],
    [
      ["Which timeframe wins a directional conflict?", ["Lower", "Higher", "Whichever is newest", "M1"], 1, "Higher timeframe context dominates."],
      ["Entry confirmation usually happens on…", ["Weekly", "M15/M5", "Monthly", "Daily"], 1, "Lower timeframes refine execution."],
      ["Why keep the same order each time?", ["Comparable journal data", "It looks tidy", "Brokers require it", "It is faster"], 0, "Consistency enables review."],
    ]),
  mk("i14-poi", M[3], "Selecting a Point of Interest", "Choosing the one zone worth your capital from many candidates.", 16,
    [
      ["Candidate zones", "Order blocks, fair value gaps and breaker blocks all produce candidates. On any chart there are too many to trade."],
      ["Grading criteria", "Grade each by: alignment with higher-timeframe bias, location in premium or discount, whether it caused a BOS, and whether liquidity rests in front of it.", "Trade A-grade zones only. B-grade zones are where drawdowns are born."],
      ["Refinement", "Once selected, refine on a lower timeframe to the specific candle that initiated displacement."],
    ],
    ["There are always too many zones.", "Grade on bias, location, BOS and liquidity.", "Trade only A-grade zones.", "Refine to the initiating candle."],
    "Grade five zones", ["Mark five zones on H1 for tomorrow.", "Score each on the four criteria.", "Only arm alerts at the top-scoring zone."],
    [
      ["A strong POI usually…", ["Caused a BOS", "Is against bias", "Is at equilibrium", "Is random"], 0, "Zones that broke structure show intent."],
      ["Liquidity resting in front of a zone…", ["Weakens it", "Can fuel the move into it", "Is irrelevant", "Cancels it"], 1, "It draws price to the zone."],
      ["Refinement means…", ["Adding indicators", "Dropping to a lower timeframe to find the initiating candle", "Widening the stop", "Trading more zones"], 1, "It tightens risk objectively."],
    ]),
  mk("i15-entry-models", M[3], "Entry Models: Limit, Confirmation and Break-Retest", "Three ways to enter and the trade-offs of each.", 17,
    [
      ["Limit entries", "Resting orders at the zone give the best price and tightest stop but lower win rates, because some zones fail without warning."],
      ["Confirmation entries", "Waiting for a lower-timeframe CHoCH inside the zone raises win rate but widens the stop or reduces reward.", "Neither model is superior. Pick one per setup type and track it separately."],
      ["Break and retest", "Entering on the retest of a broken level suits breakout conditions and trending sessions."],
    ],
    ["Limits: best price, lower win rate.", "Confirmation: higher win rate, worse price.", "Break-retest suits trends.", "Track each model separately."],
    "Model comparison", ["Take your last 20 setups.", "Simulate each with a limit and a confirmation entry.", "Compare expectancy."],
    [
      ["Limit entries generally offer…", ["Worse price", "Best price and tighter stops", "Guaranteed wins", "No risk"], 1, "At the cost of more failed zones."],
      ["Confirmation entries typically…", ["Raise win rate", "Lower win rate", "Remove stops", "Only work on news"], 0, "At the cost of price."],
      ["Why track models separately?", ["To measure each model's expectancy", "It is required", "To trade more", "No reason"], 0, "Blended stats hide which model works."],
    ]),
  mk("i16-stops-targets", M[3], "Structural Stops and Liquidity Targets", "Placing stops where the idea is wrong and targets where orders rest.", 15,
    [
      ["Structural stops", "Your stop belongs beyond the level that invalidates the idea, plus a spread buffer — not at a fixed pip count."],
      ["Liquidity targets", "Targets should sit just before opposing liquidity: the next equal highs, prior day high, or session extreme.", "Set targets slightly in front of the level; everyone else is targeting the exact price."],
      ["Checking the maths", "If the structural stop and liquidity target produce under 1:2, skip the trade or wait for a better location."],
    ],
    ["Stop beyond invalidation plus buffer.", "Target just before opposing liquidity.", "Require at least 1:2 by default.", "Fixed pip stops ignore structure."],
    "Re-plan old trades", ["Take five recent trades.", "Re-place stops and targets structurally.", "Compare the new R:R with what you took."],
    [
      ["A stop should sit…", ["At a fixed 20 pips", "Beyond invalidation plus buffer", "At entry", "At a round number only"], 1, "It must reflect where the idea fails."],
      ["Targets are best placed…", ["Just before opposing liquidity", "Far beyond it", "At equilibrium only", "Randomly"], 0, "Front-run the crowd slightly."],
      ["If R:R is below 1:2 you should…", ["Double size", "Skip or wait", "Remove the stop", "Take it anyway"], 1, "Protect expectancy."],
    ]),

  mk("i17-partials", M[4], "Partials, Breakeven and Scaling Out", "Managing open trades without cutting winners short.", 15,
    [
      ["Partial profits", "Taking a portion at TP1 locks in gains and reduces emotional pressure. AASAKIRA records a trade as a win once any TP is hit."],
      ["Breakeven timing", "Moving to breakeven too early is a hidden cost: normal retracements stop you out before the move completes.", "Move to breakeven after a structural BOS in your favour, not after a fixed number of pips."],
      ["Scaling plans", "Write your scale-out plan before entry, e.g. 50% at TP1, 30% at TP2, 20% runner. Deciding in the moment invites fear."],
    ],
    ["Partials reduce pressure and lock gains.", "Early breakeven is a hidden cost.", "Move to breakeven on structure.", "Pre-write your scale-out plan."],
    "Management plan", ["Write a scale-out plan for your main setup.", "Apply it to the next five trades.", "Record how much it changed your results."],
    [
      ["When should you move to breakeven?", ["After 5 pips", "After a structural BOS in your favour", "Immediately", "Never"], 1, "Structure-based management avoids noise stop-outs."],
      ["Deciding partials in the moment tends to…", ["Improve results", "Invite fear-based decisions", "Have no effect", "Remove risk"], 1, "Pre-planning removes emotion."],
      ["Early breakeven often…", ["Guarantees profit", "Stops you out on normal retracements", "Increases size", "Is free"], 1, "It has a real opportunity cost."],
    ]),
  mk("i18-trailing", M[4], "Trailing Stops by Structure", "Letting runners work by trailing behind confirmed swings.", 13,
    [
      ["Why trail by structure", "Fixed pip trails get hit by ordinary volatility. Trailing behind each new protected swing respects the market's rhythm."],
      ["The method", "After each BOS in your favour, move the stop beyond the swing that produced it. Do nothing between breaks.", "Doing nothing between breaks is the hardest and most profitable part."],
      ["When to stop trailing", "Close the runner at the higher-timeframe liquidity target or on a CHoCH against you."],
    ],
    ["Trail behind protected swings.", "Only move stops after a BOS.", "Do nothing between breaks.", "Exit at target or on CHoCH."],
    "Trail replay", ["Replay three winning trades.", "Apply a structural trail.", "Compare with how you actually exited."],
    [
      ["Structural trailing moves the stop…", ["Every candle", "After each BOS", "Randomly", "Never"], 1, "It follows confirmed structure."],
      ["A runner should be closed on…", ["A CHoCH against you or at target", "The first red candle", "Lunch", "Any wick"], 0, "Those signal the move is done."],
      ["Fixed pip trails often…", ["Respect structure", "Get hit by normal volatility", "Never trigger", "Increase R:R"], 1, "They ignore market rhythm."],
    ]),
  mk("i19-correlation", M[4], "Correlation and Exposure Stacking", "Avoiding hidden double risk across related instruments.", 14,
    [
      ["Correlated instruments", "XAUUSD often moves inversely to the US dollar. US30, NAS100 and SPX500 usually move together. Being long all three indices is one trade at triple size."],
      ["Measuring exposure", "Group open positions by underlying driver (USD, US equities, risk sentiment) and sum the risk per group.", "Cap total risk per driver, not just per trade."],
      ["Practical limits", "A simple rule: maximum 2% total open risk per correlated group, regardless of how many tickets that involves."],
    ],
    ["Correlated trades multiply risk.", "Group positions by driver.", "Cap risk per driver.", "One idea across three indices is one trade."],
    "Exposure audit", ["List every position from your last busy week.", "Group them by driver.", "Find the peak combined risk per group."],
    [
      ["Long US30, NAS100 and SPX500 together is…", ["Diversified", "Effectively one trade at triple size", "Hedged", "Risk-free"], 1, "They share the same driver."],
      ["Exposure should be capped…", ["Per trade only", "Per correlated driver", "Never", "Per broker"], 1, "Driver-level caps prevent stacking."],
      ["Gold often moves inversely to…", ["Oil", "The US dollar", "Bitcoin", "The yen only"], 1, "A strong USD tends to weigh on gold."],
    ]),
  mk("i20-review", M[4], "The Intermediate Review Cycle", "Turning a month of trades into specific rule changes.", 16,
    [
      ["Monthly review", "Export the month's trades and group them by setup, session and entry model. Look for the one grouping that is clearly negative."],
      ["One change at a time", "Change a single rule per month. Changing five things makes it impossible to know what helped.", "Small, isolated changes compound. Overhauls reset your data."],
      ["Documenting the change", "Write the rule, the reason and the date in your journal so next month's review can measure it."],
    ],
    ["Review monthly by setup, session and model.", "Find the clearly negative group.", "Change one rule at a time.", "Document every change."],
    "Run a monthly review", ["Export last month's trades from your journal.", "Group by setup and session.", "Write one rule change with its reason and date."],
    [
      ["How many rules should you change per review?", ["As many as possible", "One", "None ever", "Five"], 1, "Isolated changes can be measured."],
      ["Grouping trades helps you…", ["Hide losses", "Find the clearly negative subset", "Trade more", "Skip journalling"], 1, "Patterns emerge in groups."],
      ["Why document the date of a change?", ["To measure its effect later", "For fun", "It is a legal need", "No reason"], 0, "You can compare before and after."],
    ]),
];

export const TOTAL_INTERMEDIATE_LESSONS = INTERMEDIATE_LESSONS.length;
