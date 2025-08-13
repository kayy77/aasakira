// 🎯 MULTI-PASS SIGNAL ENGINE - Deep Institutional Scanning
// Pass 1: Quick Filter → Pass 2: Deep Scan → Pass 3: Micro-Entry + Backtest

import { powerfulGroqAnalyzer, PowerfulGroqResult } from './PowerfulGroqAnalyzer';
import { realtimeBacktester, BacktestResult } from './RealtimeBacktester';
import { multiAIConsensus, ConsensusResult } from './MultiAIConsensus';
import { chartGenerator } from './ChartGenerator';

export interface PassOneFilter {
  symbol: string;
  currentPrice: number;
  baselineChecks: {
    atrSufficient: boolean;
    spreadAcceptable: boolean;
    sessionOptimal: boolean;
    newsRiskLow: boolean;
    liquidityPresent: boolean;
  };
  score: number;
  passed: boolean;
}

export interface PassTwoDeepScan {
  symbol: string;
  institutionalConfluence: {
    breakOfStructure: boolean;
    orderBlockPresent: boolean;
    fairValueGapAligned: boolean;
    liquiditySweep: boolean;
    multiTimeframeAlignment: boolean;
  };
  technicalScore: number;
  groqAnalysis: PowerfulGroqResult;
  passed: boolean;
}

export interface PassThreeMicroEntry {
  symbol: string;
  microTiming: {
    m1Confirmation: boolean;
    m5Confirmation: boolean;
    entryPrecision: 'EXACT' | 'NEAR' | 'APPROXIMATE';
    executionMethod: 'LIMIT' | 'MARKET' | 'STOP' | 'DELAYED';
  };
  backtestValidation: BacktestResult;
  consensusValidation: ConsensusResult;
  finalScore: number;
  passed: boolean;
}

export interface MultiPassResult {
  passOne: PassOneFilter[];
  passTwo: PassTwoDeepScan[];
  passThree: PassThreeMicroEntry[];
  finalSignal?: {
    symbol: string;
    direction: 'BUY' | 'SELL';
    entry: number;
    stopLoss: number;
    takeProfit: number;
    riskReward: number;
    confidence: number;
    riskProfile: 'LOW' | 'MEDIUM' | 'HIGH';
    institutionalGrade: 'ELITE' | 'STRONG' | 'DECENT';
    chartUrl?: string;
    executionWindow: {
      optimal: boolean;
      expiryMinutes: number;
      entryMethod: string;
    };
    backtest: {
      winRate: number;
      avgRR: number;
      sampleSize: number;
      confidence: number;
    };
    aiConsensus: {
      score: number;
      agreement: number;
      primaryModel: string;
      shadowModels: string[];
    };
  };
  processingStats: {
    totalSymbolsScanned: number;
    passOneFiltered: number;
    passTwoFiltered: number;
    finalCandidates: number;
    processingTimeMs: number;
    highestScore: number;
  };
  warnings: string[];
}

export class MultiPassSignalEngine {
  private readonly watchlist = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 
    'USDCAD', 'NZDUSD', 'EURJPY', 'GBPJPY', 'EURGBP'
  ];

  async executeMultiPassScan(): Promise<MultiPassResult> {
    const startTime = Date.now();
    console.log('🚀 MultiPass: Starting comprehensive institutional scan...');

    try {
      // PASS 1: Quick Baseline Filter (All Pairs)
      console.log('📊 Pass 1: Baseline filtering across all pairs...');
      const passOneResults = await this.executePassOne();
      const passOnePassed = passOneResults.filter(r => r.passed);
      
      console.log(`✅ Pass 1 Complete: ${passOnePassed.length}/${passOneResults.length} pairs passed`);

      // PASS 2: Deep Technical Analysis (Filtered Pairs)
      console.log('🔬 Pass 2: Deep institutional confluence scan...');
      const passTwoResults = await this.executePassTwo(passOnePassed);
      const passTwoPassed = passTwoResults.filter(r => r.passed);
      
      console.log(`✅ Pass 2 Complete: ${passTwoPassed.length}/${passTwoResults.length} pairs passed`);

      // PASS 3: Micro-Entry + Backtest Validation (Top Candidates)
      console.log('🎯 Pass 3: Micro-timing and backtest validation...');
      const passThreeResults = await this.executePassThree(passTwoPassed);
      const finalCandidates = passThreeResults.filter(r => r.passed);
      
      console.log(`✅ Pass 3 Complete: ${finalCandidates.length} final candidates`);

      // Select Best Signal
      const finalSignal = this.selectBestSignal(finalCandidates, passTwoResults);
      
      const processingTime = Date.now() - startTime;
      
      return {
        passOne: passOneResults,
        passTwo: passTwoResults,
        passThree: passThreeResults,
        finalSignal,
        processingStats: {
          totalSymbolsScanned: this.watchlist.length,
          passOneFiltered: passOnePassed.length,
          passTwoFiltered: passTwoPassed.length,
          finalCandidates: finalCandidates.length,
          processingTimeMs: processingTime,
          highestScore: Math.max(...passThreeResults.map(r => r.finalScore), 0)
        },
        warnings: this.generateWarnings(passOneResults, passTwoResults, passThreeResults)
      };

    } catch (error) {
      console.error('MultiPass scan error:', error);
      return this.createEmergencyResult();
    }
  }

  private async executePassOne(): Promise<PassOneFilter[]> {
    const results: PassOneFilter[] = [];
    
    for (const symbol of this.watchlist) {
      const currentPrice = this.getCurrentPrice(symbol);
      
      const baselineChecks = {
        atrSufficient: this.checkATRSufficient(symbol),
        spreadAcceptable: this.checkSpreadAcceptable(symbol),
        sessionOptimal: this.checkSessionOptimal(),
        newsRiskLow: this.checkNewsRiskLow(symbol),
        liquidityPresent: this.checkLiquidityPresent(symbol)
      };
      
      const score = this.calculatePassOneScore(baselineChecks);
      const passed = score >= 75 && Object.values(baselineChecks).every(Boolean);
      
      results.push({
        symbol,
        currentPrice,
        baselineChecks,
        score,
        passed
      });
    }
    
    return results.sort((a, b) => b.score - a.score);
  }

  private async executePassTwo(candidates: PassOneFilter[]): Promise<PassTwoDeepScan[]> {
    const results: PassTwoDeepScan[] = [];
    
    for (const candidate of candidates) {
      console.log(`🔍 Deep scanning ${candidate.symbol}...`);
      
      try {
        // Get comprehensive Groq analysis
        const groqAnalysis = await powerfulGroqAnalyzer.performInstitutionalAnalysis(
          candidate.symbol,
          candidate.currentPrice
        );
        
        // Evaluate institutional confluence
        const institutionalConfluence = {
          breakOfStructure: groqAnalysis.microstructure.breakOfStructure.occurred,
          orderBlockPresent: groqAnalysis.liquidityMapping.orderBlocks.some(ob => !ob.tested),
          fairValueGapAligned: groqAnalysis.liquidityMapping.fairValueGaps.some(fvg => !fvg.filled),
          liquiditySweep: groqAnalysis.microstructure.liquiditySweep.detected,
          multiTimeframeAlignment: this.checkMultiTimeframeAlignment(groqAnalysis)
        };
        
        const technicalScore = this.calculateTechnicalScore(
          institutionalConfluence,
          groqAnalysis
        );
        
        const passed = technicalScore >= 80 && 
                      groqAnalysis.institutionalGrade !== 'REJECT' &&
                      groqAnalysis.institutionalGrade !== 'WEAK';
        
        results.push({
          symbol: candidate.symbol,
          institutionalConfluence,
          technicalScore,
          groqAnalysis,
          passed
        });
        
      } catch (error) {
        console.error(`Error scanning ${candidate.symbol}:`, error);
        // Add failed result
        results.push({
          symbol: candidate.symbol,
          institutionalConfluence: {
            breakOfStructure: false,
            orderBlockPresent: false,
            fairValueGapAligned: false,
            liquiditySweep: false,
            multiTimeframeAlignment: false
          },
          technicalScore: 0,
          groqAnalysis: this.createFailsafeGroqResult(candidate.symbol),
          passed: false
        });
      }
    }
    
    return results.sort((a, b) => b.technicalScore - a.technicalScore);
  }

  private async executePassThree(candidates: PassTwoDeepScan[]): Promise<PassThreeMicroEntry[]> {
    const results: PassThreeMicroEntry[] = [];
    
    // Limit to top 3 candidates for intensive analysis
    const topCandidates = candidates.slice(0, 3);
    
    for (const candidate of topCandidates) {
      console.log(`🎯 Micro-analysis for ${candidate.symbol}...`);
      
      try {
        // Micro-timing analysis
        const microTiming = this.analyzeMicroTiming(candidate);
        
        // Backtest validation
        const backtestResult = await realtimeBacktester.validateSignalPattern(
          candidate.symbol,
          candidate.groqAnalysis.signal?.direction || 'BUY',
          candidate.groqAnalysis.marketContext.session
        );
        
        // Multi-AI consensus check
        const consensusResult = await multiAIConsensus.validateSignal({
          symbol: candidate.symbol,
          direction: candidate.groqAnalysis.signal?.direction || 'BUY',
          entry: candidate.groqAnalysis.signal?.entry || 1.0856,
          confidence: candidate.groqAnalysis.signal?.confidence || 75,
          reasoning: candidate.groqAnalysis.reasoning
        });
        
        const finalScore = this.calculateFinalScore(
          candidate.technicalScore,
          microTiming,
          backtestResult,
          consensusResult
        );
        
        const passed = finalScore >= 85 && 
                      backtestResult.winRate >= 65 &&
                      consensusResult.agreement >= 0.7;
        
        results.push({
          symbol: candidate.symbol,
          microTiming,
          backtestValidation: backtestResult,
          consensusValidation: consensusResult,
          finalScore,
          passed
        });
        
      } catch (error) {
        console.error(`Error in micro-analysis for ${candidate.symbol}:`, error);
      }
    }
    
    return results.sort((a, b) => b.finalScore - a.finalScore);
  }

  private selectBestSignal(
    finalCandidates: PassThreeMicroEntry[],
    passTwoResults: PassTwoDeepScan[]
  ): MultiPassResult['finalSignal'] | undefined {
    
    if (finalCandidates.length === 0) {
      console.log('❌ No signals passed all three passes');
      return undefined;
    }
    
    // Get the highest scoring candidate
    const best = finalCandidates[0];
    const groqData = passTwoResults.find(p => p.symbol === best.symbol);
    
    if (!groqData?.groqAnalysis.signal) {
      console.log('❌ Best candidate missing signal data');
      return undefined;
    }
    
    const signal = groqData.groqAnalysis.signal;
    
    // Generate risk profile
    const riskProfile = this.calculateRiskProfile(
      best.finalScore,
      best.backtestValidation,
      groqData.groqAnalysis
    );
    
    console.log(`🎯 FINAL SIGNAL: ${signal.symbol} ${signal.direction} @ ${signal.entry}`);
    
    return {
      symbol: signal.symbol,
      direction: signal.direction,
      entry: signal.entry,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
      riskReward: signal.riskReward,
      confidence: signal.confidence,
      riskProfile,
      institutionalGrade: groqData.groqAnalysis.institutionalGrade as 'ELITE' | 'STRONG' | 'DECENT',
      chartUrl: undefined, // Will be generated by chart service
      executionWindow: {
        optimal: groqData.groqAnalysis.executionWindow.optimal,
        expiryMinutes: groqData.groqAnalysis.executionWindow.expiryMinutes,
        entryMethod: best.microTiming.executionMethod
      },
      backtest: {
        winRate: best.backtestValidation.winRate,
        avgRR: best.backtestValidation.averageRR,
        sampleSize: best.backtestValidation.sampleSize,
        confidence: best.backtestValidation.confidence
      },
      aiConsensus: {
        score: best.consensusValidation.finalScore,
        agreement: best.consensusValidation.agreement,
        primaryModel: 'PowerfulGroq',
        shadowModels: best.consensusValidation.modelResults.map(m => m.model)
      }
    };
  }

  // Helper Methods
  private getCurrentPrice(symbol: string): number {
    const prices = {
      'EURUSD': 1.0856, 'GBPUSD': 1.2645, 'USDJPY': 149.85,
      'USDCHF': 0.8756, 'AUDUSD': 0.6487, 'USDCAD': 1.3654,
      'NZDUSD': 0.5987, 'EURJPY': 162.45, 'GBPJPY': 189.32, 'EURGBP': 0.8587
    };
    return prices[symbol as keyof typeof prices] || 1.0000;
  }

  private checkATRSufficient(symbol: string): boolean {
    const atrMap: Record<string, number> = {
      'EURUSD': 45, 'GBPUSD': 85, 'USDJPY': 65, 'USDCHF': 40,
      'AUDUSD': 55, 'USDCAD': 50, 'NZDUSD': 60, 'EURJPY': 75,
      'GBPJPY': 120, 'EURGBP': 35
    };
    return (atrMap[symbol] || 30) >= 30; // Minimum 30 pips ATR
  }

  private checkSpreadAcceptable(symbol: string): boolean {
    const spreadMap: Record<string, number> = {
      'EURUSD': 0.8, 'GBPUSD': 1.2, 'USDJPY': 0.6, 'USDCHF': 1.0,
      'AUDUSD': 1.0, 'USDCAD': 1.0, 'NZDUSD': 1.5, 'EURJPY': 1.5,
      'GBPJPY': 2.0, 'EURGBP': 1.0
    };
    return (spreadMap[symbol] || 2.0) <= 2.0;
  }

  private checkSessionOptimal(): boolean {
    const hour = new Date().getUTCHours();
    return (hour >= 8 && hour <= 17); // London + NY sessions
  }

  private checkNewsRiskLow(symbol: string): boolean {
    // Simulate news risk check
    return Math.random() > 0.2; // 80% chance of low news risk
  }

  private checkLiquidityPresent(symbol: string): boolean {
    const majorPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF'];
    return majorPairs.includes(symbol) || Math.random() > 0.3;
  }

  private calculatePassOneScore(checks: PassOneFilter['baselineChecks']): number {
    const weights = {
      atrSufficient: 20,
      spreadAcceptable: 15,
      sessionOptimal: 25,
      newsRiskLow: 20,
      liquidityPresent: 20
    };
    
    return Object.entries(checks).reduce((score, [key, passed]) => {
      return score + (passed ? weights[key as keyof typeof weights] : 0);
    }, 0);
  }

  private checkMultiTimeframeAlignment(groq: PowerfulGroqResult): boolean {
    // Check if multiple timeframes show alignment
    const h4Levels = groq.liquidityMapping.timeframes.H4.length;
    const h1Levels = groq.liquidityMapping.timeframes.H1.length;
    const m15Levels = groq.liquidityMapping.timeframes.M15.length;
    
    return h4Levels > 0 && h1Levels > 0 && m15Levels > 0;
  }

  private calculateTechnicalScore(
    confluence: PassTwoDeepScan['institutionalConfluence'],
    groq: PowerfulGroqResult
  ): number {
    let score = 0;
    
    // Confluence scoring
    if (confluence.breakOfStructure) score += 25;
    if (confluence.orderBlockPresent) score += 20;
    if (confluence.fairValueGapAligned) score += 15;
    if (confluence.liquiditySweep) score += 20;
    if (confluence.multiTimeframeAlignment) score += 20;
    
    // Groq grade bonus
    switch (groq.institutionalGrade) {
      case 'ELITE': score += 20; break;
      case 'STRONG': score += 15; break;
      case 'DECENT': score += 10; break;
      default: score += 0;
    }
    
    return Math.min(score, 100);
  }

  private analyzeMicroTiming(candidate: PassTwoDeepScan): PassThreeMicroEntry['microTiming'] {
    const microstructure = candidate.groqAnalysis.microstructure;
    
    return {
      m1Confirmation: microstructure.microTiming.m1Confirmed,
      m5Confirmation: microstructure.microTiming.m5Confirmed,
      entryPrecision: microstructure.retestEntry.quality === 'PERFECT' ? 'EXACT' :
                     microstructure.retestEntry.quality === 'GOOD' ? 'NEAR' : 'APPROXIMATE',
      executionMethod: microstructure.microTiming.entryMethod === 'WAIT' ? 'DELAYED' : microstructure.microTiming.entryMethod as 'MARKET' | 'LIMIT' | 'STOP'
    };
  }

  private calculateFinalScore(
    technicalScore: number,
    microTiming: PassThreeMicroEntry['microTiming'],
    backtest: BacktestResult,
    consensus: ConsensusResult
  ): number {
    let score = technicalScore * 0.4; // 40% from technical
    
    // Micro-timing bonus
    if (microTiming.m1Confirmation && microTiming.m5Confirmation) score += 15;
    if (microTiming.entryPrecision === 'EXACT') score += 10;
    
    // Backtest performance
    score += (backtest.winRate - 50) * 0.5; // Scale win rate above 50%
    
    // Consensus agreement
    score += consensus.agreement * 20;
    
    return Math.min(score, 100);
  }

  private calculateRiskProfile(
    finalScore: number,
    backtest: BacktestResult,
    groq: PowerfulGroqResult
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (finalScore >= 90 && backtest.winRate >= 70 && groq.institutionalGrade === 'ELITE') {
      return 'LOW';
    }
    if (finalScore >= 80 && backtest.winRate >= 60) {
      return 'MEDIUM';
    }
    return 'HIGH';
  }

  private generateWarnings(
    passOne: PassOneFilter[],
    passTwo: PassTwoDeepScan[],
    passThree: PassThreeMicroEntry[]
  ): string[] {
    const warnings: string[] = [];
    
    const passOneFailures = passOne.filter(p => !p.passed);
    if (passOneFailures.length === passOne.length) {
      warnings.push('All pairs failed baseline filters - market conditions may be unfavorable');
    }
    
    const passTwoFailures = passTwo.filter(p => !p.passed);
    if (passTwoFailures.length === passTwo.length) {
      warnings.push('No pairs showed sufficient institutional confluence');
    }
    
    if (passThree.length === 0) {
      warnings.push('No candidates advanced to micro-timing analysis');
    }
    
    const lowBacktestPerformance = passThree.filter(p => p.backtestValidation.winRate < 60);
    if (lowBacktestPerformance.length > 0) {
      warnings.push('Some candidates showed poor historical performance');
    }
    
    return warnings;
  }

  private createFailsafeGroqResult(symbol: string): PowerfulGroqResult {
    // Return minimal groq result for error cases
    return {
      marketContext: {
        session: 'ASIA',
        volatilityRating: 'LOW',
        liquidityLevel: 'THIN',
        newsRisk: 'NONE',
        timeToNextSession: 120,
        optimalTradingWindow: false,
        institutionalActivity: 'QUIET'
      },
      liquidityMapping: {
        symbol,
        timeframes: { H4: [], H1: [], M15: [], M5: [] },
        freshLiquidityZones: [],
        orderBlocks: [],
        fairValueGaps: [],
        liquiditySweepTargets: []
      },
      orderFlow: {
        volumeSpikes: [],
        deltaImbalances: [],
        momentumShifts: [],
        atrNormalization: { current: 0, average: 0, normalized: 0, tradable: false },
        institutionalFootprint: 'ABSENT'
      },
      microstructure: {
        breakOfStructure: { occurred: false, direction: 'BULLISH', timeframe: 'M15', candleIndex: 0 },
        retestEntry: { setup: false, quality: 'WEAK', entryPrice: 0, confirmationCandle: false },
        liquiditySweep: { detected: false, sweepType: 'BUYSIDE', rejectionWick: false, wickSize: 0 },
        microTiming: { m1Confirmed: false, m5Confirmed: false, entryMethod: 'WAIT', urgency: 'WAIT_RETEST' }
      },
      institutionalGrade: 'REJECT',
      reasoning: ['Analysis failed'],
      warnings: ['Error in analysis'],
      executionWindow: { optimal: false, expiryMinutes: 0, delayTriggers: ['ERROR'] }
    };
  }

  private createEmergencyResult(): MultiPassResult {
    return {
      passOne: [],
      passTwo: [],
      passThree: [],
      processingStats: {
        totalSymbolsScanned: 0,
        passOneFiltered: 0,
        passTwoFiltered: 0,
        finalCandidates: 0,
        processingTimeMs: 0,
        highestScore: 0
      },
      warnings: ['Emergency fallback - scan failed']
    };
  }
}

export const multiPassSignalEngine = new MultiPassSignalEngine();