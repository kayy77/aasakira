
import { FilterResult, SignalInput, FilterValidationResult } from '@/types/signalConfig';

export function generateMockFilters(): FilterResult {
  return {
    smc: Math.random() > 0.4, // 60% pass rate
    liquiditySweep: Math.random() > 0.5, // 50% pass rate
    fvg: Math.random() > 0.3, // 70% pass rate
    volumeSpike: Math.random() > 0.4, // 60% pass rate
    sessionTiming: Math.random() > 0.2, // 80% pass rate
    rsiDivergence: Math.random() > 0.6, // 40% pass rate
  };
}

export function filterAndValidateSignal(input: SignalInput): FilterValidationResult {
  const { filters, aiConfidence, confluenceRequired, minConfidence } = input;
  
  // Count passed filters
  const passedFilters = Object.entries(filters)
    .filter(([_, passed]) => passed)
    .map(([name, _]) => name);
  
  // Check confluence requirement
  if (passedFilters.length < confluenceRequired) {
    return {
      valid: false,
      reason: `Confluence failed: ${passedFilters.length}/${confluenceRequired} filters passed`,
      passedFilters
    };
  }
  
  // Check AI confidence
  if (aiConfidence < minConfidence) {
    return {
      valid: false,
      reason: `AI confidence ${aiConfidence}% below minimum ${minConfidence}%`,
      passedFilters
    };
  }
  
  // Signal is valid
  return {
    valid: true,
    reason: `Signal approved: ${passedFilters.length}/${Object.keys(filters).length} filters + ${aiConfidence}% AI confidence`,
    passedFilters
  };
}
