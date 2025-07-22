
import { FilterResult, SignalInput, FilterValidationResult } from '@/types/signalConfig';
import { getMinAIConfidence } from '@/utils/signalValidator';

export function filterAndValidateSignal(input: SignalInput): FilterValidationResult {
  const {
    filters,
    aiConfidence,
    livePrice,
    confluenceRequired,
    minConfidence,
    newsBlocked,
  } = input;

  const filterArray = [
    filters.smc,
    filters.liquiditySweep,
    filters.fvg,
    filters.volumeSpike,
    filters.sessionTiming,
    filters.rsiDivergence,
  ];

  const confluenceScore = filterArray.filter(Boolean).length;

  // ⛔ 1. News Filter Blocker
  if (newsBlocked) {
    return {
      valid: false,
      reason: "Blocked due to high-impact news event detected.",
    };
  }

  // ⛔ 2. Price Validation
  if (!livePrice || isNaN(livePrice) || livePrice <= 0) {
    return {
      valid: false,
      reason: "Invalid or missing live price. Signal rejected for safety.",
    };
  }

  // ⛔ 3. Dynamic Confidence Check
  const dynamicMinConfidence = Math.min(minConfidence, getMinAIConfidence(confluenceScore));
  if (aiConfidence < dynamicMinConfidence) {
    return {
      valid: false,
      reason: `AI confidence ${aiConfidence}% below minimum ${dynamicMinConfidence}% for ${confluenceScore}/6 confluence`,
    };
  }

  // ⛔ 4. Confluence Check with Fallback
  if (confluenceScore < confluenceRequired) {
    // Allow 3/6 signals as last resort with proper warnings
    if (confluenceScore >= 3 && aiConfidence >= getMinAIConfidence(3)) {
      const filterNames = ['SMC', 'Liquidity Sweep', 'FVG', 'Volume Spike', 'Session Timing', 'RSI Divergence'];
      const passedFilterNames = filterArray
        .map((passed, index) => passed ? filterNames[index] : null)
        .filter(Boolean);
      
      return {
        valid: true,
        reason: `⚠️ Last resort signal: ${confluenceScore}/6 filters (${passedFilterNames.join(', ')}) + ${aiConfidence}% AI confidence`,
        passedFilters: passedFilterNames,
      };
    }
    
    const filterNames = ['SMC', 'Liquidity Sweep', 'FVG', 'Volume Spike', 'Session Timing', 'RSI Divergence'];
    const passedFilterNames = filterArray
      .map((passed, index) => passed ? filterNames[index] : null)
      .filter(Boolean);
    
    return {
      valid: false,
      reason: `Only ${confluenceScore}/${confluenceRequired} filters passed: ${passedFilterNames.join(', ')}`,
    };
  }

  // ✅ PASS
  const filterNames = ['SMC', 'Liquidity Sweep', 'FVG', 'Volume Spike', 'Session Timing', 'RSI Divergence'];
  const passedFilterNames = filterArray
    .map((passed, index) => passed ? filterNames[index] : null)
    .filter(Boolean);

  return {
    valid: true,
    reason: `Signal approved: ${confluenceScore}/6 filters (${passedFilterNames.join(', ')}) + ${aiConfidence}% AI confidence`,
    passedFilters: passedFilterNames,
  };
}

// Generate realistic filter results for testing
export function generateMockFilters(): FilterResult {
  return {
    smc: Math.random() > 0.4, // 60% chance
    liquiditySweep: Math.random() > 0.5, // 50% chance
    fvg: Math.random() > 0.6, // 40% chance
    volumeSpike: Math.random() > 0.3, // 70% chance
    sessionTiming: Math.random() > 0.4, // 60% chance
    rsiDivergence: Math.random() > 0.7, // 30% chance
  };
}
