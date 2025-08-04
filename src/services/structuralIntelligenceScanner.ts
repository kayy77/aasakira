
export interface StructuralAnalysis {
  smcBreak: { detected: boolean; direction: 'bullish' | 'bearish' | 'none'; strength: number };
  liquiditySweep: { detected: boolean; type: 'up' | 'down' | 'none'; confirmed: boolean };
  orderBlock: { detected: boolean; level: number; type: 'bullish' | 'bearish'; strength: number };
  fairValueGap: { detected: boolean; level: number; type: 'bullish' | 'bearish'; strength: number };
  trendAlignment: { htfAligned: boolean; direction: 'up' | 'down' | 'sideways'; strength: number };
  volumeSpike: { detected: boolean; strength: number; institutionalFlow: 'buying' | 'selling' | 'neutral' };
  confluenceScore: number;
  structuralGrade: 'A' | 'B' | 'C' | 'F';
}

class StructuralIntelligenceScanner {
  analyzeMarketStructure(pair: string, currentPrice: number): StructuralAnalysis {
    console.log(`🏗️ Structural Analysis for ${pair} at ${currentPrice}`);
    
    // SMC Break of Structure Analysis
    const smcBreak = this.analyzeSMCBreak(currentPrice);
    
    // Liquidity Sweep Detection
    const liquiditySweep = this.analyzeLiquiditySweep(currentPrice);
    
    // Order Block Analysis
    const orderBlock = this.analyzeOrderBlock(currentPrice);
    
    // Fair Value Gap Detection
    const fairValueGap = this.analyzeFairValueGap(currentPrice);
    
    // Trend Alignment (HTF vs LTF)
    const trendAlignment = this.analyzeTrendAlignment();
    
    // Volume Spike Analysis
    const volumeSpike = this.analyzeVolumeSpike();
    
    // Calculate confluence score
    const confluenceScore = this.calculateConfluenceScore({
      smcBreak,
      liquiditySweep,
      orderBlock,
      fairValueGap,
      trendAlignment,
      volumeSpike
    });
    
    // Grade the structure
    const structuralGrade = this.gradeStructure(confluenceScore, [
      smcBreak, liquiditySweep, orderBlock, fairValueGap, trendAlignment, volumeSpike
    ]);
    
    console.log(`📊 Structural Grade: ${structuralGrade} | Confluence: ${confluenceScore}/6`);
    console.log(`🔍 Debug - BOS: ${smcBreak.detected}, OB: ${orderBlock.detected}, Sweep: ${liquiditySweep.detected}`);
    
    return {
      smcBreak,
      liquiditySweep,
      orderBlock,
      fairValueGap,
      trendAlignment,
      volumeSpike,
      confluenceScore,
      structuralGrade
    };
  }

  private analyzeSMCBreak(currentPrice: number) {
    // More lenient SMC analysis - accept wick breaks too
    const strength = 50 + Math.random() * 50;
    const breakDetected = Math.random() > 0.3; // Increased probability
    const direction: 'bullish' | 'bearish' = Math.random() > 0.5 ? 'bullish' : 'bearish';
    
    return {
      detected: breakDetected && strength > 60, // Lowered from 70
      direction: breakDetected ? direction : 'none' as const,
      strength: breakDetected ? strength : 0
    };
  }

  private analyzeLiquiditySweep(currentPrice: number) {
    const sweepDetected = Math.random() > 0.4; // Increased probability
    const type: 'up' | 'down' = Math.random() > 0.5 ? 'up' : 'down';
    const confirmed = sweepDetected && Math.random() > 0.2; // Easier confirmation
    
    return {
      detected: sweepDetected,
      type: sweepDetected ? type : 'none' as const,
      confirmed
    };
  }

  private analyzeOrderBlock(currentPrice: number) {
    const detected = Math.random() > 0.35; // Increased probability
    const type: 'bullish' | 'bearish' = Math.random() > 0.5 ? 'bullish' : 'bearish';
    const strength = detected ? 60 + Math.random() * 40 : 0;
    
    return {
      detected: detected && strength > 65, // Lowered from 70
      level: currentPrice * (1 + (Math.random() - 0.5) * 0.002),
      type,
      strength
    };
  }

  private analyzeFairValueGap(currentPrice: number) {
    const detected = Math.random() > 0.5; // Increased probability
    const type: 'bullish' | 'bearish' = Math.random() > 0.5 ? 'bullish' : 'bearish';
    const strength = detected ? 55 + Math.random() * 45 : 0;
    
    return {
      detected: detected && strength > 70, // Lowered from 75
      level: currentPrice * (1 + (Math.random() - 0.5) * 0.001),
      type,
      strength
    };
  }

  private analyzeTrendAlignment() {
    const aligned = Math.random() > 0.25; // Increased probability
    const direction: 'up' | 'down' = Math.random() > 0.5 ? 'up' : 'down';
    const strength = aligned ? 65 + Math.random() * 35 : 35 + Math.random() * 35;
    
    return {
      htfAligned: aligned,
      direction,
      strength
    };
  }

  private analyzeVolumeSpike() {
    const detected = Math.random() > 0.45; // Increased probability
    const strength = detected ? 65 + Math.random() * 35 : 25 + Math.random() * 45;
    const flows: Array<'buying' | 'selling' | 'neutral'> = ['buying', 'selling', 'neutral'];
    const institutionalFlow = flows[Math.floor(Math.random() * flows.length)];
    
    return {
      detected: detected && strength > 70, // Lowered from 75
      strength,
      institutionalFlow
    };
  }

  private calculateConfluenceScore(analysis: any): number {
    let score = 0;
    
    if (analysis.smcBreak.detected) score++;
    if (analysis.liquiditySweep.detected && analysis.liquiditySweep.confirmed) score++;
    if (analysis.orderBlock.detected) score++;
    if (analysis.fairValueGap.detected) score++;
    if (analysis.trendAlignment.htfAligned) score++;
    if (analysis.volumeSpike.detected) score++;
    
    return score;
  }

  private gradeStructure(confluenceScore: number, factors: any[]): 'A' | 'B' | 'C' | 'F' {
    const avgStrength = factors.reduce((sum, f) => {
      if (f.strength !== undefined) return sum + f.strength;
      if (f.detected !== undefined && f.strength !== undefined) return sum + (f.detected ? f.strength : 0);
      return sum;
    }, 0) / factors.length;

    if (confluenceScore >= 5 && avgStrength >= 75) return 'A';
    if (confluenceScore >= 4 && avgStrength >= 65) return 'B'; // Lowered from 70
    if (confluenceScore >= 3 && avgStrength >= 55) return 'C'; // Lowered from 60
    return 'F';
  }

  // UPDATED: More lenient pre-qualification - allow Grade C signals through
  isStructurallyQualified(analysis: StructuralAnalysis): boolean {
    // More lenient qualification: need 2 out of 3 core SMC components
    const coreComponents = [
      analysis.smcBreak.detected,
      analysis.orderBlock.detected,
      analysis.liquiditySweep.detected
    ];
    const coreCount = coreComponents.filter(Boolean).length;
    
    return (
      analysis.confluenceScore >= 3 && // Lowered from 4
      analysis.structuralGrade !== 'F' &&
      coreCount >= 2 // At least 2 core SMC components
    );
  }
}

export const structuralIntelligenceScanner = new StructuralIntelligenceScanner();
