
export interface SignalTypeAnalysis {
  signalType: 'continuation' | 'reversal' | 'breakout' | 'retracement';
  confidence: number;
  reasoning: string[];
}

export interface ConfidenceWeights {
  volume_spike: number;
  rsi_divergence: number;
  order_block: number;
  structure: number;
  confluence: number;
  session_timing: number;
}

class ConfidenceEngine {
  
  detectSignalType(signal: any): SignalTypeAnalysis {
    const { filtersPassed, trend15M, entryTrigger } = signal;
    
    // Analyze signal characteristics
    const hasBOS = filtersPassed.some((f: string) => f.includes('BOS') || f.includes('Break of Structure'));
    const hasCHoCH = filtersPassed.some((f: string) => f.includes('CHoCH') || f.includes('Change of Character'));
    const hasRSIDivergence = filtersPassed.some((f: string) => f.includes('RSI') && f.includes('Divergence'));
    const hasVolume = filtersPassed.some((f: string) => f.includes('Volume'));
    const hasFVG = filtersPassed.some((f: string) => f.includes('FVG') || f.includes('Fair Value Gap'));
    
    let signalType: 'continuation' | 'reversal' | 'breakout' | 'retracement';
    let confidence = 60; // Base confidence
    const reasoning: string[] = [];
    
    if (hasCHoCH && hasRSIDivergence && hasVolume) {
      signalType = 'reversal';
      confidence += 20;
      reasoning.push('CHoCH + RSI divergence + volume indicates trend reversal');
    } else if (hasBOS && hasFVG && !hasRSIDivergence) {
      signalType = 'continuation';
      confidence += 15;
      reasoning.push('BOS + FVG without divergence suggests trend continuation');
    } else if (hasBOS && hasVolume) {
      signalType = 'breakout';
      confidence += 18;
      reasoning.push('BOS + volume spike indicates breakout scenario');
    } else {
      signalType = 'retracement';
      confidence += 10;
      reasoning.push('Standard retracement entry setup');
    }
    
    return { signalType, confidence, reasoning };
  }
  
  calculateOptimizedConfidence(signal: any, signalTypeAnalysis: SignalTypeAnalysis): number {
    const { signalType } = signalTypeAnalysis;
    const { confluenceScore, filtersPassed, session } = signal;
    
    // Get signal-type specific weights
    const weights = this.getWeightsForSignalType(signalType);
    
    let finalConfidence = signalTypeAnalysis.confidence;
    
    // Apply weights based on filters passed
    filtersPassed.forEach((filter: string) => {
      if (filter.includes('Volume') && filter.includes('Spike')) {
        finalConfidence += weights.volume_spike;
      }
      if (filter.includes('RSI') && filter.includes('Divergence')) {
        finalConfidence += weights.rsi_divergence;
      }
      if (filter.includes('Order') && filter.includes('Block')) {
        finalConfidence += weights.order_block;
      }
      if (filter.includes('BOS') || filter.includes('CHoCH')) {
        finalConfidence += weights.structure;
      }
    });
    
    // Confluence bonus (this should always add confidence)
    finalConfidence += (confluenceScore * weights.confluence);
    
    // Session timing bonus
    const currentHour = new Date().getUTCHours();
    if (this.isOptimalSession(currentHour, session)) {
      finalConfidence += weights.session_timing;
    }
    
    // Cap confidence between 30-95%
    return Math.min(95, Math.max(30, Math.round(finalConfidence)));
  }
  
  private getWeightsForSignalType(signalType: string): ConfidenceWeights {
    switch (signalType) {
      case 'reversal':
        return {
          volume_spike: 15,      // High weight for reversals
          rsi_divergence: 20,    // Critical for reversals
          order_block: 10,
          structure: 15,
          confluence: 8,         // 8 points per confluence level
          session_timing: 12
        };
      case 'continuation':
        return {
          volume_spike: 5,       // Lower weight for continuations
          rsi_divergence: 5,     // Not expected in continuations
          order_block: 15,       // Higher weight for structure
          structure: 20,         // Critical for continuations
          confluence: 10,        // 10 points per confluence level
          session_timing: 8
        };
      case 'breakout':
        return {
          volume_spike: 20,      // Critical for breakouts
          rsi_divergence: 8,
          order_block: 12,
          structure: 18,
          confluence: 9,
          session_timing: 10
        };
      default: // retracement
        return {
          volume_spike: 10,
          rsi_divergence: 12,
          order_block: 15,
          structure: 15,
          confluence: 8,
          session_timing: 8
        };
    }
  }
  
  private isOptimalSession(currentHour: number, session: string): boolean {
    // London-NY overlap (13-16 UTC) is optimal
    if (currentHour >= 13 && currentHour <= 16) return true;
    
    // London session (8-17 UTC) is good
    if (currentHour >= 8 && currentHour <= 17) return true;
    
    // NY session (13-22 UTC) is acceptable
    if (currentHour >= 13 && currentHour <= 22) return true;
    
    return false;
  }
  
  generateConfidenceExplanation(signal: any, finalConfidence: number, signalTypeAnalysis: SignalTypeAnalysis): string {
    const { signalType, reasoning } = signalTypeAnalysis;
    const { confluenceScore } = signal;
    
    let explanation = `${finalConfidence}% confidence - ${signalType.toUpperCase()} signal. `;
    explanation += reasoning.join('. ') + '. ';
    
    if (confluenceScore >= 5) {
      explanation += `Exceptional confluence (${confluenceScore}/6) supports high confidence. `;
    } else if (confluenceScore >= 4) {
      explanation += `Strong confluence (${confluenceScore}/6) supports entry. `;
    } else {
      explanation += `Moderate confluence (${confluenceScore}/6) - proceed with caution. `;
    }
    
    return explanation;
  }
}

export const confidenceEngine = new ConfidenceEngine();
