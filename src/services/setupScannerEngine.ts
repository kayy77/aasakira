// 🔥 SETUP SCANNER ENGINE - Multi-Layer Confirmation & Grading System

export interface ConfirmationLayer {
  name: string;
  passed: boolean;
  score: number;
  reason: string;
  weight: number;
}

export interface TradePlan {
  entryZone: { min: number; max: number };
  stopLossZone: { min: number; max: number };
  tpLadder: { level: number; price: number; probability: string }[];
  invalidationRule: string;
}

export interface ContextWarning {
  type: 'htf_trend' | 'volume' | 'news' | 'session' | 'spread' | 'volatility';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export type SetupGrade = 'A+' | 'A' | 'B' | 'C' | 'D';

export interface ScannerResult {
  id: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  grade: SetupGrade;
  confidenceScore: number;
  layers: ConfirmationLayer[];
  tradePlan: TradePlan;
  warnings: ContextWarning[];
  keyReason: string;
  detectedAt: Date;
  timeDecay: number; // 0-100, higher = fresher
}

// Multi-layer confirmation system
export function evaluateConfirmationLayers(setup: {
  direction: 'BUY' | 'SELL';
  market_structure: string;
  liquidity_sweep: string;
  session_context: string;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  timeframe: string;
  htf_bias?: string;
}): ConfirmationLayer[] {
  const layers: ConfirmationLayer[] = [];
  
  // Layer 1: Market Structure Alignment (Weight: 25%)
  const structureAligned = 
    (setup.direction === 'BUY' && setup.market_structure === 'bullish') ||
    (setup.direction === 'SELL' && setup.market_structure === 'bearish');
  
  layers.push({
    name: 'Market Structure',
    passed: structureAligned,
    score: structureAligned ? 100 : setup.market_structure === 'transition' ? 50 : 20,
    reason: structureAligned 
      ? `Direction aligned with ${setup.market_structure} structure`
      : `Trading against ${setup.market_structure} structure`,
    weight: 25
  });

  // Layer 2: Liquidity Context (Weight: 20%)
  const liquidityScore = setup.liquidity_sweep === 'confirmed' ? 100 
    : setup.liquidity_sweep === 'anticipated' ? 60 : 30;
  
  layers.push({
    name: 'Liquidity Context',
    passed: setup.liquidity_sweep !== 'none',
    score: liquidityScore,
    reason: setup.liquidity_sweep === 'confirmed' 
      ? 'Liquidity sweep confirmed - strong reversal probability'
      : setup.liquidity_sweep === 'anticipated'
      ? 'Anticipating liquidity sweep - monitor for confirmation'
      : 'No clear liquidity sweep identified',
    weight: 20
  });

  // Layer 3: HTF Bias Alignment (Weight: 20%)
  const htfAligned = setup.htf_bias 
    ? (setup.direction === 'BUY' && setup.htf_bias === 'bullish') ||
      (setup.direction === 'SELL' && setup.htf_bias === 'bearish')
    : setup.market_structure === 'bullish' || setup.market_structure === 'bearish';
  
  layers.push({
    name: 'HTF Bias',
    passed: htfAligned,
    score: htfAligned ? 100 : 30,
    reason: htfAligned 
      ? 'Higher timeframe confirms directional bias'
      : 'Potential counter-trend trade - higher risk',
    weight: 20
  });

  // Layer 4: Key Levels (Weight: 15%)
  const rr = calculateRR(setup.entry_price, setup.stop_loss, setup.take_profit, setup.direction);
  const keyLevelsValid = rr >= 1.5;
  
  layers.push({
    name: 'Key Levels & R:R',
    passed: keyLevelsValid,
    score: rr >= 3 ? 100 : rr >= 2 ? 85 : rr >= 1.5 ? 70 : rr >= 1 ? 40 : 20,
    reason: keyLevelsValid 
      ? `${rr.toFixed(1)}:1 R:R meets institutional standards`
      : `${rr.toFixed(1)}:1 R:R below 1.5:1 minimum`,
    weight: 15
  });

  // Layer 5: Session Timing (Weight: 20%)
  const optimalSessions = ['london', 'newyork', 'london_ny_overlap'];
  const sessionOptimal = optimalSessions.includes(setup.session_context);
  
  layers.push({
    name: 'Session Timing',
    passed: sessionOptimal,
    score: setup.session_context === 'london_ny_overlap' ? 100 
      : sessionOptimal ? 85 
      : setup.session_context === 'asia' ? 50 : 30,
    reason: sessionOptimal 
      ? `${setup.session_context.replace('_', ' ')} session - optimal liquidity`
      : `${setup.session_context} session - reduced liquidity`,
    weight: 20
  });

  return layers;
}

// Calculate grade from layers
export function calculateGrade(layers: ConfirmationLayer[]): { grade: SetupGrade; score: number } {
  const weightedScore = layers.reduce((sum, layer) => 
    sum + (layer.score * layer.weight / 100), 0
  );
  
  const passedCount = layers.filter(l => l.passed).length;
  
  let grade: SetupGrade;
  if (weightedScore >= 90 && passedCount === layers.length) {
    grade = 'A+';
  } else if (weightedScore >= 80 && passedCount >= 4) {
    grade = 'A';
  } else if (weightedScore >= 65 && passedCount >= 3) {
    grade = 'B';
  } else if (weightedScore >= 50 && passedCount >= 2) {
    grade = 'C';
  } else {
    grade = 'D';
  }
  
  return { grade, score: Math.round(weightedScore) };
}

// Generate trade plan from setup
export function generateTradePlan(setup: {
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  direction: 'BUY' | 'SELL';
  pair: string;
}): TradePlan {
  const { entry_price, stop_loss, take_profit, direction, pair } = setup;
  
  const pipMultiplier = pair.includes('JPY') ? 100 : pair === 'XAUUSD' ? 10 : 10000;
  const risk = Math.abs(entry_price - stop_loss);
  const reward = Math.abs(take_profit - entry_price);
  
  // Entry zone (±5 pips from target)
  const entryBuffer = 5 / pipMultiplier;
  const entryZone = {
    min: direction === 'BUY' ? entry_price - entryBuffer : entry_price + entryBuffer,
    max: direction === 'BUY' ? entry_price + entryBuffer * 0.5 : entry_price - entryBuffer * 0.5
  };
  
  // SL zone (±3 pips buffer)
  const slBuffer = 3 / pipMultiplier;
  const stopLossZone = {
    min: direction === 'BUY' ? stop_loss - slBuffer : stop_loss + slBuffer,
    max: stop_loss
  };
  
  // TP ladder (3 levels: 1R, 2R, full TP)
  const tp1 = direction === 'BUY' 
    ? entry_price + risk 
    : entry_price - risk;
  const tp2 = direction === 'BUY'
    ? entry_price + (risk * 2)
    : entry_price - (risk * 2);
  
  const tpLadder = [
    { level: 1, price: tp1, probability: '70%' },
    { level: 2, price: tp2, probability: '50%' },
    { level: 3, price: take_profit, probability: '35%' }
  ];
  
  // Invalidation rule
  const invalidationRule = direction === 'BUY'
    ? `Close immediately if price closes below ${stop_loss.toFixed(5)} on ${setup.pair}`
    : `Close immediately if price closes above ${stop_loss.toFixed(5)} on ${setup.pair}`;
  
  return { entryZone, stopLossZone, tpLadder, invalidationRule };
}

// Generate context warnings
export function generateWarnings(setup: {
  direction: 'BUY' | 'SELL';
  market_structure: string;
  session_context: string;
  htf_bias?: string;
}): ContextWarning[] {
  const warnings: ContextWarning[] = [];
  
  // HTF trend warning
  if (setup.htf_bias && 
      ((setup.direction === 'BUY' && setup.htf_bias === 'bearish') ||
       (setup.direction === 'SELL' && setup.htf_bias === 'bullish'))) {
    warnings.push({
      type: 'htf_trend',
      severity: 'high',
      message: `Trading against ${setup.htf_bias} HTF trend`
    });
  }
  
  // Session warning
  if (setup.session_context === 'off_hours') {
    warnings.push({
      type: 'session',
      severity: 'medium',
      message: 'Low liquidity period - wider spreads expected'
    });
  }
  
  if (setup.session_context === 'asia' && setup.market_structure !== 'ranging') {
    warnings.push({
      type: 'session',
      severity: 'low',
      message: 'Asian session - reduced volatility for major pairs'
    });
  }
  
  // Structure warning
  if (setup.market_structure === 'transition') {
    warnings.push({
      type: 'volatility',
      severity: 'medium',
      message: 'Market in transition - structure unclear'
    });
  }
  
  if (setup.market_structure === 'ranging') {
    warnings.push({
      type: 'volatility',
      severity: 'low',
      message: 'Ranging market - expect false breakouts'
    });
  }
  
  return warnings;
}

// Calculate R:R
function calculateRR(entry: number, sl: number, tp: number, direction: 'BUY' | 'SELL'): number {
  if (direction === 'BUY') {
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    return risk > 0 ? reward / risk : 0;
  } else {
    const risk = Math.abs(sl - entry);
    const reward = Math.abs(entry - tp);
    return risk > 0 ? reward / risk : 0;
  }
}

// Calculate time decay (0-100, higher = fresher)
export function calculateTimeDecay(detectedAt: Date): number {
  const now = new Date();
  const ageMinutes = (now.getTime() - detectedAt.getTime()) / (1000 * 60);
  
  // Setup is "stale" after 60 minutes
  if (ageMinutes <= 5) return 100;
  if (ageMinutes <= 15) return 85;
  if (ageMinutes <= 30) return 65;
  if (ageMinutes <= 60) return 40;
  return Math.max(10, 40 - Math.floor((ageMinutes - 60) / 10));
}

// Get grade color
export function getGradeColor(grade: SetupGrade): string {
  switch (grade) {
    case 'A+': return 'text-emerald-500';
    case 'A': return 'text-green-500';
    case 'B': return 'text-yellow-500';
    case 'C': return 'text-orange-500';
    case 'D': return 'text-red-500';
  }
}

// Get grade background
export function getGradeBg(grade: SetupGrade): string {
  switch (grade) {
    case 'A+': return 'bg-emerald-500/20 border-emerald-500/50';
    case 'A': return 'bg-green-500/20 border-green-500/50';
    case 'B': return 'bg-yellow-500/20 border-yellow-500/50';
    case 'C': return 'bg-orange-500/20 border-orange-500/50';
    case 'D': return 'bg-red-500/20 border-red-500/50';
  }
}

// Generate key reason (1 liner)
export function generateKeyReason(layers: ConfirmationLayer[]): string {
  const strongest = layers
    .filter(l => l.passed)
    .sort((a, b) => b.score * b.weight - a.score * a.weight)[0];
  
  return strongest?.reason || 'Review setup details';
}
