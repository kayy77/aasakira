import type { Lesson } from "./beginner";
import { mk } from "./build";

export const ELITE_MODULES = [
  "Prop Firm Mastery",
  "Psychology Under Size",
  "Performance Systems",
  "Scaling Capital",
  "Professional Operations",
] as const;

const M = ELITE_MODULES;

export const ELITE_LESSONS: Lesson[] = [
  mk("e01-prop-rules", M[0], "Reading Prop Firm Rules Like a Lawyer", "Daily drawdown, trailing drawdown and the clauses that fail accounts.", 18,
    [
      ["Drawdown types", "Static drawdown is measured from the starting balance. Trailing drawdown follows your equity high. Daily drawdown may be balance- or equity-based and resets at a set server time."],
      ["Hidden clauses", "Consistency rules, news restrictions, minimum trading days, lot caps and weekend holding bans fail more accounts than bad trades.", "Read every clause and write down the three most likely to fail you."],
      ["Equity versus balance", "If daily loss is equity-based, floating losses count. A trade in profit that reverses can breach you without closing."],
    ],
    ["Know static, trailing and daily drawdown.", "Hidden clauses fail many accounts.", "Equity-based limits count floating losses.", "Note the reset time."],
    "Rule sheet", ["Pick your prop firm.", "Write a one-page summary of every rule.", "Highlight the three most dangerous clauses."],
    [
      ["Trailing drawdown follows…", ["Starting balance", "Your equity high", "The daily open", "Nothing"], 1, "It trails peak equity."],
      ["Equity-based daily loss includes…", ["Only closed trades", "Floating losses", "Commissions only", "Swaps only"], 1, "Open P&L counts."],
      ["Many accounts fail because of…", ["Clauses traders did not read", "Too few trades", "Good risk", "Small size"], 0, "Rules, not markets, fail them."],
    ]),
  mk("e02-challenge-plan", M[0], "Engineering a Challenge Pass", "Risk schedules designed around the target and the limits.", 17,
    [
      ["Work backwards", "With an 8% target and 5% daily / 10% overall limits, risking 0.5–1% per trade gives room for a realistic losing streak while still reaching the target."],
      ["Risk schedule", "Start at base risk, reduce after drawdown, and reduce again as you approach the target. Protect the pass rather than racing to it.", "Time is not your enemy on most challenges; drawdown is."],
      ["Daily stop", "Set a personal daily stop well inside the firm's, e.g. 2% when the firm allows 5%."],
    ],
    ["Plan backwards from target and limits.", "Base risk 0.5–1%.", "Reduce near the target.", "Personal daily stop inside the firm's."],
    "Build a schedule", ["Write base, reduced and near-target risk levels.", "Set your personal daily stop.", "Simulate a 6-loss streak and check you survive."],
    [
      ["The main enemy on most challenges is…", ["Time", "Drawdown", "Spread", "Weekends"], 1, "Breaching limits ends the challenge."],
      ["Near the target you should…", ["Increase risk", "Reduce risk", "Stop journalling", "Trade news"], 1, "Protect the pass."],
      ["A personal daily stop should be…", ["Wider than the firm's", "Inside the firm's", "Absent", "Equal to target"], 1, "It gives buffer."],
    ]),
  mk("e03-funded-phase", M[0], "Managing a Funded Account", "Behaviour change from challenge to payout.", 15,
    [
      ["Different objective", "In the challenge you chase a target; when funded you protect capital and harvest consistent payouts."],
      ["Payout rhythm", "Withdraw on schedule. Unwithdrawn profits are still at risk and inflate the sense of a safety buffer.", "Treat each payout cycle as a fresh small challenge."],
      ["Lower risk", "Many funded traders cut risk to 0.25–0.5% per trade to prioritise longevity."],
    ],
    ["Funded means protect, not chase.", "Withdraw on schedule.", "Unwithdrawn profit is at risk.", "Lower risk extends longevity."],
    "Funded rules", ["Write your funded-account risk and payout plan.", "Set calendar reminders for each payout date.", "Review after two cycles."],
    [
      ["The funded objective is…", ["Hit a target fast", "Protect capital and harvest payouts", "Max leverage", "Trade more pairs"], 1, "Longevity pays."],
      ["Unwithdrawn profit is…", ["Safe", "Still at risk", "Taxed twice", "Irrelevant"], 1, "It can be lost."],
      ["Typical funded risk per trade is…", ["5%", "0.25–0.5%", "10%", "0%"], 1, "Lower risk for longevity."],
    ]),
  mk("e04-multi-account", M[0], "Running Multiple Prop Accounts", "Scaling across firms without multiplying mistakes.", 16,
    [
      ["Why diversify firms", "Firm-specific risk — rule changes, payout delays, insolvency — is real. Spreading capital across reputable firms reduces it."],
      ["Copying across accounts", "Copying one signal to many accounts multiplies a single error. Ensure total combined risk respects your personal limits.", "Five accounts on one bad trade is one very large bad trade."],
      ["Admin", "Track each account's rules, reset times and payout dates in a single sheet."],
    ],
    ["Firm risk is real.", "Spread across reputable firms.", "Copying multiplies errors.", "Centralise account admin."],
    "Account register", ["List every account with firm, size and rules.", "Add reset times and payout dates.", "Calculate combined risk per trade."],
    [
      ["Copying one trade to five accounts is…", ["Diversified", "One larger trade", "Hedged", "Risk-free"], 1, "Same idea, more exposure."],
      ["Firm-specific risk includes…", ["Rule changes and payout delays", "Only spread", "Your strategy", "Nothing"], 0, "Operational risk matters."],
      ["Account admin should be…", ["In your head", "Centralised in one sheet", "Ignored", "Handled by the firm"], 1, "Clarity prevents breaches."],
    ]),

  mk("e05-size-psychology", M[1], "Why Size Changes Behaviour", "The neuroscience of risk and the money-versus-R mindset.", 16,
    [
      ["Loss aversion", "Losses feel roughly twice as painful as equivalent gains feel good. Larger size amplifies this, causing early exits and moved stops."],
      ["Thinking in R", "Express every result in R multiples, not currency. A 1R loss is the same event at £50 or £5,000.", "Hide currency P&L on your platform if you can."],
      ["Gradual exposure", "Increase size in small steps and only after a stable period at the current level."],
    ],
    ["Losses hurt about twice as much.", "Size amplifies emotion.", "Think in R, not currency.", "Scale size gradually."],
    "R-only week", ["Hide currency P&L for one week.", "Journal results only in R.", "Note any change in your exits."],
    [
      ["Loss aversion means losses feel…", ["Equal to gains", "About twice as painful", "Pleasant", "Irrelevant"], 1, "A well-documented bias."],
      ["Thinking in R helps by…", ["Normalising outcomes across size", "Increasing size", "Removing losses", "Raising leverage"], 0, "It detaches from money."],
      ["Size should increase…", ["Suddenly", "Gradually after stability", "After a big loss", "Daily"], 1, "Small steps reduce shock."],
    ]),
  mk("e06-tilt", M[1], "Recognising and Stopping Tilt", "Early warning signs and hard circuit breakers.", 14,
    [
      ["Signs of tilt", "Revenge entries, skipping the checklist, increasing size after a loss, and trading outside your windows are classic signs."],
      ["Circuit breakers", "Two consecutive losses or hitting your daily stop ends the session. Close the platform, not just the chart.", "Your rules must be decided when calm, because you cannot decide them on tilt."],
      ["Recovery routine", "Walk, write a short note on what happened, and do not return until the next session."],
    ],
    ["Know your tilt signs.", "Hard stop after defined losses.", "Close the platform.", "Have a recovery routine."],
    "Tilt plan", ["List your three personal tilt signs.", "Write your circuit-breaker rules.", "Put them on a card beside your screen."],
    [
      ["A classic tilt sign is…", ["Following the checklist", "Increasing size after a loss", "Journalling", "Taking breaks"], 1, "Revenge sizing is tilt."],
      ["Circuit-breaker rules should be set…", ["During tilt", "When calm", "Never", "By your broker"], 1, "Calm decisions are better."],
      ["After hitting the daily stop you should…", ["Switch pairs", "End the session", "Double size", "Remove stops"], 1, "The day is over."],
    ]),
  mk("e07-process-goals", M[1], "Process Goals Over Outcome Goals", "Measuring what you control.", 13,
    [
      ["The problem with P&L goals", "Daily P&L targets encourage forcing trades and holding losers. Outcomes are partly random in the short run."],
      ["Process goals", "Score each session on checklist compliance, risk adherence and journal completion. These are fully within your control.", "A perfect-process losing day is a good day."],
      ["Linking to outcomes", "Over months, process scores and results converge. Track both and look for the correlation."],
    ],
    ["P&L goals encourage forcing.", "Score process daily.", "Perfect process can still lose.", "Process and results converge over time."],
    "Process score", ["Create a 10-point process scorecard.", "Score every session for two weeks.", "Compare scores with results."],
    [
      ["Daily P&L targets often encourage…", ["Patience", "Forcing trades", "Better risk", "Journalling"], 1, "Pressure to hit a number."],
      ["A process goal is…", ["Make £500 today", "Follow the checklist on every trade", "Win 80%", "Double the account"], 1, "It is controllable."],
      ["A perfect-process losing day is…", ["A failure", "A good day", "Impossible", "A reason to stop"], 1, "Variance is not error."],
    ]),
  mk("e08-routine", M[1], "The Professional Daily Routine", "Pre-market, execution and post-market structure.", 15,
    [
      ["Pre-market", "Review calendar, mark levels, set bias and invalidation, confirm risk budget. Finish before the session opens."],
      ["Execution", "Only act on pre-planned scenarios. Unplanned trades are logged as rule breaks.", "If you are deciding during the move, you are reacting, not trading."],
      ["Post-market", "Journal every trade with screenshots, score your process, and note one lesson."],
    ],
    ["Plan before the open.", "Execute only planned scenarios.", "Log unplanned trades as breaks.", "Journal and score after."],
    "Routine template", ["Write your pre-, during- and post-market checklist.", "Follow it for five days.", "Remove any step you never use."],
    [
      ["Pre-market work should finish…", ["After the open", "Before the session opens", "At lunch", "Never"], 1, "Plan before you act."],
      ["An unplanned trade is logged as…", ["A great trade", "A rule break", "Nothing", "A hedge"], 1, "Accountability."],
      ["Post-market includes…", ["Journalling and process scoring", "More trading", "Deleting losses", "Nothing"], 0, "Review closes the loop."],
    ]),

  mk("e09-journal-analytics", M[2], "Advanced Journal Analytics", "Slicing your data to find your real edge.", 17,
    [
      ["Dimensions", "Slice by setup, instrument, session, day of week, entry model, emotional state and grade."],
      ["Finding the edge", "Usually a small subset produces most of the profit. Remove the rest and results often improve immediately.", "Your edge is probably narrower than you think — and stronger."],
      ["Using AASAKIRA tools", "The journal and AI Coach surface these patterns from your history automatically."],
    ],
    ["Slice across many dimensions.", "A small subset drives profit.", "Cut the rest.", "Use the journal tools."],
    "Pareto analysis", ["Export 100 trades.", "Find the 20% producing the most R.", "Write a rule restricting you to them."],
    [
      ["Profit usually comes from…", ["All trades equally", "A small subset", "Random trades", "Losing trades"], 1, "Pareto applies to trading."],
      ["Useful slice dimensions include…", ["Session and setup", "Font size", "Broker logo", "Screen colour"], 0, "Context dimensions reveal edge."],
      ["Removing weak subsets often…", ["Hurts results", "Improves results", "Has no effect", "Breaks rules"], 1, "Less noise, more edge."],
    ]),
  mk("e10-coaching-feedback", M[2], "Building Feedback Loops", "Mentors, peers and structured review.", 14,
    [
      ["Why external feedback", "You cannot see your own blind spots. A mentor or peer reviewing your trades catches patterns you rationalise."],
      ["Structured review", "Share trades with plan, screenshot and outcome. Ask reviewers to grade process, not result.", "Ask 'what did I not see?' rather than 'was I right?'"],
      ["Accountability", "Weekly check-ins with a fixed agenda keep you honest."],
    ],
    ["You cannot see your blind spots.", "Get process-focused reviews.", "Ask what you missed.", "Hold weekly check-ins."],
    "Review partner", ["Find a review partner in the community.", "Exchange five trades each.", "Agree a weekly check-in time."],
    [
      ["Reviewers should grade…", ["Process", "Only P&L", "Your broker", "Screen setup"], 0, "Process is controllable."],
      ["A useful review question is…", ["What did I not see?", "Was I right?", "How much did I make?", "Who else won?"], 0, "It targets blind spots."],
      ["Weekly check-ins provide…", ["Accountability", "Signals", "Leverage", "Rebates"], 0, "Structure keeps you honest."],
    ]),
  mk("e11-health", M[2], "Sleep, Health and Decision Quality", "The physiology of good trading decisions.", 12,
    [
      ["Sleep", "Sleep deprivation impairs risk assessment similarly to alcohol. Trading on four hours' sleep is trading impaired."],
      ["Exercise and nutrition", "Regular exercise improves stress tolerance; stable blood sugar avoids mid-session lapses.", "Your body is part of your trading system."],
      ["Readiness check", "Rate sleep, stress and focus out of 5 before each session; below a threshold, trade reduced size or not at all."],
    ],
    ["Poor sleep impairs risk judgement.", "Exercise improves stress tolerance.", "Your body is part of the system.", "Use a readiness check."],
    "Readiness log", ["Rate sleep, stress and focus before each session for two weeks.", "Record results alongside.", "Find your readiness threshold."],
    [
      ["Sleep deprivation affects judgement similarly to…", ["Caffeine", "Alcohol", "Exercise", "Nothing"], 1, "Research shows comparable impairment."],
      ["Below your readiness threshold you should…", ["Trade bigger", "Reduce size or skip", "Ignore it", "Add pairs"], 1, "Protect decision quality."],
      ["A readiness check rates…", ["Sleep, stress and focus", "Spread", "News", "Lot size"], 0, "Physiological state."],
    ]),
  mk("e12-reviews", M[2], "Quarterly Performance Reviews", "Strategic review at fund-manager level.", 16,
    [
      ["Scope", "Quarterly reviews cover strategy performance, risk compliance, capital allocation, goals and personal development."],
      ["Output", "Produce a short written report with three keeps, three changes and one experiment for the next quarter.", "Write it as if presenting to an investor."],
      ["Archiving", "Keep every report; reading a year of them reveals your real trajectory."],
    ],
    ["Review strategy, risk and capital quarterly.", "Output keeps, changes and one experiment.", "Write for an investor.", "Archive every report."],
    "Quarterly report", ["Draft a one-page review of last quarter.", "List three keeps and three changes.", "Define one experiment."],
    [
      ["A quarterly review should end with…", ["Nothing", "Keeps, changes and an experiment", "A bigger lot size", "A new broker"], 1, "Actionable outputs."],
      ["Write the report as if for…", ["Social media", "An investor", "No one", "Your broker"], 1, "Raises standards."],
      ["Archived reports reveal…", ["Your real trajectory", "Spreads", "Signals", "News"], 0, "Long-term perspective."],
    ]),

  mk("e13-scaling-plan", M[3], "A Rules-Based Scaling Plan", "Increasing size only on evidence.", 15,
    [
      ["Scaling triggers", "Increase risk or capital only after hitting predefined criteria: e.g. three positive months, drawdown under 6%, process score above 85%."],
      ["Step sizes", "Increase by 25% at most per step, and step back down after a defined drawdown.", "Scale on evidence, not excitement."],
      ["Documentation", "Write the plan in advance so a good week cannot talk you into early scaling."],
    ],
    ["Scale on predefined criteria.", "Step up by 25% at most.", "Step down after drawdown.", "Write the plan in advance."],
    "Scaling rules", ["Write your scaling criteria.", "Define step-up and step-down rules.", "Add them to your trading plan."],
    [
      ["Scaling should be triggered by…", ["A great day", "Predefined criteria", "Social pressure", "Boredom"], 1, "Evidence-based."],
      ["A sensible maximum step is…", ["100%", "25%", "500%", "0%"], 1, "Gradual increases."],
      ["After a defined drawdown you should…", ["Step down", "Step up", "Ignore it", "Remove stops"], 0, "Protect capital."],
    ]),
  mk("e14-capital-allocation", M[3], "Allocating Capital Across Strategies", "Running more than one edge.", 16,
    [
      ["Why multiple strategies", "Uncorrelated strategies smooth the equity curve: a trend strategy and a range strategy rarely lose together."],
      ["Allocation", "Allocate risk by each strategy's stability and drawdown, not by recent returns.", "Chasing last month's best strategy is how allocation goes wrong."],
      ["Rebalancing", "Review allocation quarterly using rolling metrics."],
    ],
    ["Uncorrelated strategies smooth equity.", "Allocate by stability, not recent returns.", "Avoid chasing.", "Rebalance quarterly."],
    "Allocation table", ["List your strategies with drawdown and expectancy.", "Assign risk weights.", "Check correlation between their returns."],
    [
      ["Uncorrelated strategies…", ["Smooth the equity curve", "Double risk", "Are useless", "Always lose together"], 0, "Diversification of returns."],
      ["Allocation should be based on…", ["Last month's returns", "Stability and drawdown", "Gut feel", "Popularity"], 1, "Robust metrics."],
      ["Allocation should be reviewed…", ["Hourly", "Quarterly", "Never", "After each trade"], 1, "Periodic rebalancing."],
    ]),
  mk("e15-capital-management", M[3], "Managing Other People's Money", "Responsibility, regulation and transparency.", 17,
    [
      ["Regulation", "Managing third-party capital is regulated in most jurisdictions, including the UK. Seek proper authorisation or work within a regulated structure."],
      ["Transparency", "Verified track records (e.g. MyFxBook, broker statements) and clear risk disclosures are non-negotiable.", "Never promise returns. Describe process, risk and verified history."],
      ["Mandate discipline", "Agree a written mandate covering risk limits, instruments and reporting, then stick to it."],
    ],
    ["Third-party money is regulated.", "Use verified records.", "Never promise returns.", "Work to a written mandate."],
    "Mandate draft", ["Draft a sample mandate with risk limits and instruments.", "Add a reporting schedule.", "List the regulatory questions you would need answered."],
    [
      ["Managing others' money in the UK is…", ["Unregulated", "Regulated", "Only for banks", "Illegal always"], 1, "Authorisation is required."],
      ["You should never…", ["Show verified records", "Promise returns", "Disclose risk", "Report monthly"], 1, "Guarantees are misleading."],
      ["A mandate defines…", ["Risk limits, instruments and reporting", "Your lunch break", "Your broker's logo", "Nothing"], 0, "Clear boundaries."],
    ]),
  mk("e16-tax-records", M[3], "Records, Tax and Compliance", "Keeping the paperwork of a professional.", 13,
    [
      ["Records", "Keep statements, payouts, fees and journal exports organised by tax year."],
      ["Tax treatment", "Treatment differs by product and country — spread betting, CFDs and prop payouts may be taxed differently in the UK.", "Get advice from a qualified accountant; this lesson is not tax advice."],
      ["Audit readiness", "If you can produce any trade, payout or fee within five minutes, your records are good enough."],
    ],
    ["Organise records by tax year.", "Products are taxed differently.", "Seek qualified advice.", "Be audit-ready."],
    "Records folder", ["Create a folder per tax year.", "Download all statements and payout confirmations.", "Book a consultation with an accountant if needed."],
    [
      ["Records should be organised by…", ["Colour", "Tax year", "Pair", "Mood"], 1, "Aligns with reporting."],
      ["Tax treatment depends on…", ["Product and country", "Time of day", "Lot size only", "Nothing"], 0, "It varies."],
      ["This lesson is…", ["Tax advice", "Not tax advice", "A legal contract", "Mandatory"], 1, "Seek a qualified accountant."],
    ]),

  mk("e17-infrastructure", M[4], "Trading Infrastructure", "Platforms, VPS, redundancy and data.", 14,
    [
      ["Core stack", "A reliable platform, a backup device, a stable connection with a mobile backup, and a VPS for anything automated."],
      ["Redundancy", "Know how to close every position from your phone in under a minute.", "Test your backup before you need it."],
      ["Data quality", "Use a consistent price feed for analysis so levels match your execution venue."],
    ],
    ["Build a reliable core stack.", "Have backup connectivity.", "Practise emergency closes.", "Use consistent data."],
    "Failure drill", ["Simulate a home internet failure.", "Close a demo position from your phone.", "Time it and fix any delays."],
    [
      ["A key redundancy skill is…", ["Closing positions from your phone quickly", "Using more monitors", "Changing indicators", "Adding pairs"], 0, "Emergency control."],
      ["Backups should be…", ["Tested in advance", "Assumed to work", "Avoided", "Shared"], 0, "Untested backups fail."],
      ["Analysis data should…", ["Match your execution venue", "Come from anywhere", "Be delayed", "Ignore spreads"], 0, "Consistent levels."],
    ]),
  mk("e18-automation", M[4], "Semi-Automation and Copy Infrastructure", "Using tools without surrendering judgement.", 16,
    [
      ["What to automate", "Alerts, position sizing, journal capture and trade management rules are excellent automation candidates."],
      ["Copy trading", "When copying to followers, the risk engine, emergency stop and per-follower limits must be in place before scaling.", "Automation scales mistakes as efficiently as it scales edge."],
      ["Human oversight", "Review automated behaviour daily and keep a manual override."],
    ],
    ["Automate repeatable tasks.", "Risk controls before scale.", "Automation scales mistakes too.", "Keep manual oversight."],
    "Automation audit", ["List tasks you repeat daily.", "Mark which could be automated safely.", "Define the manual override for each."],
    [
      ["Good automation candidates include…", ["Alerts and sizing", "Your bias", "Your goals", "Your sleep"], 0, "Repeatable tasks."],
      ["Before scaling copy trading you need…", ["Risk limits and an emergency stop", "More followers", "Higher leverage", "Nothing"], 0, "Controls first."],
      ["Automation scales…", ["Only edge", "Both edge and mistakes", "Nothing", "Only profits"], 1, "It is neutral."],
    ]),
  mk("e19-brand-integrity", M[4], "Reputation and Integrity", "Building a trading reputation that lasts.", 13,
    [
      ["Verified over claimed", "Publish verified results, including losing periods. Selective screenshots destroy trust once discovered."],
      ["Responsible communication", "Avoid guarantees and hype. Explain risk clearly to anyone following you.", "Your reputation compounds like capital — and can be lost faster."],
      ["Community standards", "Credit others, admit mistakes publicly and correct errors quickly."],
    ],
    ["Publish verified results.", "Show losing periods.", "No guarantees or hype.", "Admit and correct mistakes."],
    "Integrity audit", ["Review anything you have posted about results.", "Remove unverifiable claims.", "Add risk disclaimers where needed."],
    [
      ["Trust is built by…", ["Selective screenshots", "Verified results including losses", "Guarantees", "Hype"], 1, "Full transparency."],
      ["Responsible communication avoids…", ["Risk disclosures", "Guarantees", "Verified stats", "Corrections"], 1, "No promises."],
      ["Mistakes should be…", ["Hidden", "Admitted and corrected", "Deleted", "Blamed on others"], 1, "Integrity compounds."],
    ]),
  mk("e20-career", M[4], "The Long Game: A Trading Career", "Designing a sustainable, decades-long practice.", 15,
    [
      ["Longevity", "The traders who last treat it as a profession: steady risk, continuous learning, and protection of health and capital."],
      ["Evolution", "Markets change; your playbook must too. Expect to retire and replace strategies over years.", "Survive first. Compounding does the rest."],
      ["Purpose", "Define why you trade beyond money — mastery, independence, provision — and revisit it when motivation dips."],
    ],
    ["Treat trading as a profession.", "Expect strategies to evolve.", "Survival enables compounding.", "Know your purpose."],
    "Five-year plan", ["Write where you want your trading to be in five years.", "List the skills and capital milestones needed.", "Set a yearly review date."],
    [
      ["Long-term success relies first on…", ["Survival", "Max leverage", "One perfect strategy", "Luck"], 0, "Staying in the game."],
      ["Strategies over years should be…", ["Never changed", "Evolved and replaced as needed", "Copied from others", "Ignored"], 1, "Markets change."],
      ["A clear purpose helps when…", ["Motivation dips", "Spreads widen", "Markets close", "Never"], 0, "It sustains effort."],
    ]),
];

export const TOTAL_ELITE_LESSONS = ELITE_LESSONS.length;
