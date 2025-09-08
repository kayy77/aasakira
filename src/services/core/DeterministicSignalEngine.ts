// SEV-0 HOTFIX: Deterministic Signal Engine
// Eliminates all random behavior and implements strict production rules

import { v4 as uuidv4 } from 'uuid';
import { brokerPriceAdapter, BrokerPrice } from '../brokerPriceAdapter';
import { groqService } from '../groqService';

export type WhitelistedSymbol = 'NAS100' | 'US30' | 'USDJPY';

export interface MarketData {
  pair: string;
  currentPrice: number;
  timeframe: string;
  session: 'Asia' | 'London' | 'NY';
  candleData?: Array<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
  }>;
}

export interface Candidate {
  symbol: WhitelistedSymbol;
  direction: 'LONG' | 'SHORT';
  entryPlan: { type: 'limit' | 'stop'; price: number };
  sl: number;
  tp1?: number;
  tp2?: number;
  htf: { daily: 'UP' | 'DOWN'; h4: 'UP' | 'DOWN'; h1: 'UP' | 'DOWN' };
  features: {
    sweep: 'none' | 'internal' | 'external_high' | 'external_low';
    bos: boolean;
    displacement_body_ratio: number;
    zone: { type: 'OB' | 'FVG'; unmitigated: boolean; retestPlanned: boolean; quality: number };
    volumeOk: boolean;
    atr: number;
    atrBaseline: number;
  };
  ctx: { session: 'Asia' | 'London' | 'NY'; newsWindow: boolean; spread: number; spreadMed20: number };
  pricing: { engineMid: number; brokerMid: number; tick_ts: number };
  performance: { symbolWinRate20: number };
  tolerances: { priceTolerance: number };
}

export interface SignalResult {
  status: 'SIGNAL' | 'NO_SETUP' | 'ERROR';
  signal?: {
    symbol: WhitelistedSymbol;
    direction: 'BUY' | 'SELL';
    entry: number;
    sl: number;
    tp1: number;
    tp2?: number;
    rr: string;
    score: number;
    risk_tier: 'LOW' | 'MEDIUM';
    session: string;
    groq: 'APPROVE' | 'REJECT';
    reasons: string[];
    id: string;
    timestamp: string;
  };
  message?: string;
  trace_id?: string;
  cause?: string;
  error_code?: string;
}

export class DeterministicSignalEngine {
  // SEV-0 SAFE MODE - Only these symbols during maintenance
  private static readonly WHITELIST: WhitelistedSymbol[] = ['NAS100', 'US30', 'USDJPY'];
  
  // Price tolerance per symbol
  private static readonly PRICE_TOLERANCE: Record<WhitelistedSymbol, number> = {
    'NAS100': 0.75,   // 0.75 points max deviation
    'US30': 1.2,      // 1.2 points max deviation  
    'USDJPY': 0.015,  // 1.5 pips max deviation
  };

  // Confidence thresholds per asset
  private static readonly CONFIDENCE_THRESHOLDS: Record<WhitelistedSymbol, number> = {
    'NAS100': 80,
    'US30': 80,
    'USDJPY': 80
  };

  // Anti-spam cooldowns
  private static lastPublish: Record<string, number> = {};
  private static lastGlobalPublish: number = 0;
  private static readonly PER_SYMBOL_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2h
  private static readonly GLOBAL_COOLDOWN_MS = 30 * 60 * 1000; // 30m

  /**
   * Generate signal with deterministic logic - NO RANDOM BEHAVIOR
   */
  async generateSignal(): Promise<SignalResult> {
    const traceId = uuidv4();
    
    try {
      console.log(`🎯 SEV-0 Deterministic Engine [${traceId}]`);
      console.log(`🔒 Whitelisted symbols only:`, DeterministicSignalEngine.WHITELIST);
      
      // Check global throttle first
      const now = Date.now();
      if (now - DeterministicSignalEngine.lastGlobalPublish < DeterministicSignalEngine.GLOBAL_COOLDOWN_MS) {
        return { 
          status: 'NO_SETUP', 
          message: 'Signals paused for maintenance — investigating data integrity.',
          trace_id: traceId 
        };
      }
      
      // Scan in priority order
      for (const symbol of DeterministicSignalEngine.WHITELIST) {
        try {
          // Get fresh broker price - NO CACHE
          const brokerPrice = await brokerPriceAdapter.getBrokerPrice(symbol);
          if (!brokerPrice) {
            console.warn(`❌ No broker price for ${symbol}`);
            continue;
          }

          // Assert tick freshness
          this.assertFreshTick(brokerPrice, symbol);

          // Build candidate with real market data
          const candidate = await this.buildCandidate(symbol, brokerPrice);
          if (!candidate) continue;

          // Hard blockers - no exceptions
          const blockReason = this.hardBlocker(candidate);
          if (blockReason) {
            console.log(`❌ ${symbol} blocked: ${blockReason}`);
            continue;
          }

          // Deterministic confidence scoring
          const score = this.scoreDeterministic(candidate);
          const threshold = DeterministicSignalEngine.CONFIDENCE_THRESHOLDS[symbol];
          
          if (score < threshold) {
            console.log(`📊 ${symbol} score ${score} < threshold ${threshold}`);
            continue;
          }

          // Check cooldowns
          const symbolLastPublish = DeterministicSignalEngine.lastPublish[symbol] || 0;
          if (now - symbolLastPublish < DeterministicSignalEngine.PER_SYMBOL_COOLDOWN_MS) {
            console.log(`⏰ ${symbol} in cooldown`);
            continue;
          }

          // Groq final judge with strict validation
          const groqDecision = await this.groqFinalJudge(candidate, score, traceId);
          
          if (groqDecision.decision !== 'APPROVE') {
            console.log(`🧠 Groq rejected ${symbol}: ${groqDecision.reasons.join(', ')}`);
            continue;
          }

          // Generate final signal
          const signal = this.buildSignal(candidate, score, groqDecision, traceId);
          
          // Update cooldowns
          DeterministicSignalEngine.lastPublish[symbol] = now;
          DeterministicSignalEngine.lastGlobalPublish = now;
          
          console.log(`✅ SEV-0 Signal generated: ${symbol} ${candidate.direction} @ ${score}`);
          return { status: 'SIGNAL', signal };

        } catch (symbolError) {
          const errorMessage = symbolError instanceof Error ? symbolError.message : 'unknown_error';
          console.error(`❌ ${symbol} scan failed [${traceId}]: ${errorMessage}`);
          
          const errorCode = this.categorizeError(errorMessage);
          console.warn(`🚨 Structured Error: [${traceId}] ${errorCode} - ${symbol} - ${errorMessage}`);
          continue;
        }
      }

      // No valid signals found
      console.log('📊 SEV-0: No high-probability setup found');
      return { 
        status: 'NO_SETUP', 
        message: 'No high-probability setups meet current criteria.',
        trace_id: traceId 
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = this.categorizeError(errorMessage);
      
      console.error(`❌ SEV-0 Engine error [${traceId}]: ${errorCode} - ${errorMessage}`, error);
      
      return {
        status: 'ERROR',
        trace_id: traceId,
        message: this.getHumanReadableError(errorCode),
        cause: errorMessage,
        error_code: errorCode
      };
    }
  }

  /**
   * Assert tick freshness - strict 8s rule
   */
  private assertFreshTick(tick: BrokerPrice, symbol: string): void {
    if (!tick || !tick.timestamp) {
      throw new Error(`no_tick:${symbol}:Missing tick data`);
    }

    const age = Date.now() - tick.timestamp;
    if (age > 8000) {
      throw new Error(`stale_tick:${symbol}:Tick age ${age}ms exceeds 8s limit`);
    }
  }

  /**
   * Hard blockers (no exceptions) - deterministic rules
   */
  private hardBlocker(c: Candidate): string | null {
    const isIndex = (s: string) => s === 'NAS100' || s === 'US30';

    // Session validation
    if (isIndex(c.symbol) && c.ctx.session !== 'NY') {
      return 'index_outside_ny';
    }
    
    if (!isIndex(c.symbol) && !['London', 'NY'].includes(c.ctx.session) && 
        !(c.symbol === 'USDJPY' && c.ctx.session === 'Asia')) {
      return 'fx_bad_session';
    }

    // News/holiday gate
    if (c.ctx.newsWindow) {
      return 'news_window';
    }

    // HTF alignment lock
    const align = c.htf.daily === c.htf.h4 && c.htf.h4 === c.htf.h1;
    if (!align) {
      return 'htf_mismatch';
    }

    // Price integrity
    if (Math.abs(c.pricing.engineMid - c.pricing.brokerMid) > c.tolerances.priceTolerance) {
      return 'price_tolerance';
    }

    // Structure clarity
    if (c.features.sweep === 'none' || !c.features.bos) {
      return 'no_sweep_or_bos';
    }

    // Displacement + zone quality
    if (c.features.displacement_body_ratio < 0.6) {
      return 'weak_displacement';
    }
    
    if (!c.features.zone.unmitigated || !c.features.zone.retestPlanned) {
      return 'no_quality_zone';
    }

    // Volatility/market quality
    if (c.features.atr < c.features.atrBaseline) {
      return 'atr_below_baseline';
    }
    
    if (c.ctx.spread > 1.5 * c.ctx.spreadMed20) {
      return 'spread_wide';
    }

    return null; // Passed all hard blockers
  }

  /**
   * Deterministic confidence scoring - NO RANDOM VALUES
   */
  private scoreDeterministic(c: Candidate): number {
    let s = 0;
    
    // HTF alignment (30 points)
    const align = c.htf.daily === c.htf.h4 && c.htf.h4 === c.htf.h1;
    s += align ? 30 : 0;
    
    // Sweep quality (20 points max)
    if (c.features.sweep.startsWith('external')) {
      s += 20;
    } else if (c.features.sweep === 'internal') {
      s += 10;
    }
    
    // Displacement strength (15 points max)
    s += Math.min(15, Math.round(c.features.displacement_body_ratio * 15));
    
    // Zone quality (15 points max)  
    s += Math.min(15, Math.round(Math.max(c.features.zone.quality, 0) * 15));
    
    // Session bonus (10 points)
    s += ['NY', 'London'].includes(c.ctx.session) ? 10 : 0;
    
    // Market conditions (5 points)
    s += (c.ctx.spread <= 1.5 * c.ctx.spreadMed20 && !c.ctx.newsWindow) ? 5 : 0;
    
    // Performance modifier (5 points max, can be negative)
    if (c.performance.symbolWinRate20 > 0.6) {
      s += 5;
    } else if (c.performance.symbolWinRate20 < 0.45) {
      s -= 5;
    }
    
    return Math.max(0, Math.min(100, s));
  }

  /**
   * Build candidate with real market analysis - NO RANDOM DATA
   */
  private async buildCandidate(symbol: WhitelistedSymbol, brokerPrice: BrokerPrice): Promise<Candidate | null> {
    const session = this.getCurrentSession();
    const isIndex = symbol === 'NAS100' || symbol === 'US30';
    
    // Quick session filter
    if (isIndex && session !== 'NY') return null;
    if (!isIndex && session === 'Asia' && symbol !== 'USDJPY') return null;

    const engineMid = brokerPrice.mid;
    const brokerMid = brokerPrice.mid;
    
    // TODO: Replace with actual market data analysis
    // For now, return null to force NO_SETUP until real analysis is implemented
    if (process.env.NODE_ENV === 'production') {
      console.log(`⚠️ Production mode: Real market analysis not yet implemented for ${symbol}`);
      return null;
    }

    // Development: Generate realistic test candidate
    const tolerance = DeterministicSignalEngine.PRICE_TOLERANCE[symbol];
    
    return {
      symbol,
      direction: 'LONG', // Deterministic direction
      entryPlan: { type: 'limit', price: engineMid },
      sl: engineMid * 0.999,
      tp1: engineMid * 1.002,
      htf: {
        daily: 'UP',
        h4: 'UP', 
        h1: 'UP'
      },
      features: {
        sweep: 'external_high',
        bos: true,
        displacement_body_ratio: 0.7,
        zone: {
          type: 'OB',
          unmitigated: true,
          retestPlanned: true,
          quality: 0.8
        },
        volumeOk: true,
        atr: 0.002,
        atrBaseline: 0.0015
      },
      ctx: {
        session,
        newsWindow: false,
        spread: 0.8,
        spreadMed20: 1.2
      },
      pricing: { 
        engineMid, 
        brokerMid, 
        tick_ts: brokerPrice.timestamp 
      },
      performance: { 
        symbolWinRate20: 0.65 
      },
      tolerances: { 
        priceTolerance: tolerance 
      }
    };
  }

  /**
   * Groq final judge with strict JSON schema validation
   */
  private async groqFinalJudge(candidate: Candidate, score: number, traceId: string): Promise<{
    decision: 'APPROVE' | 'REJECT';
    risk_tier: 'LOW' | 'MEDIUM' | 'NONE';
    reasons: string[];
  }> {
    try {
      const systemPrompt = `You are the final trade quality gate. Output JSON only.
Given the structured candidate JSON and precomputed score, return either APPROVE or REJECT.

STRICT RULES (ZERO TOLERANCE):
- Reject if HTF (daily/h4/h1) are not unanimous in direction.
- Reject if no external liquidity sweep (external_high/external_low).
- Reject if no BOS/displacement >= 0.6 body ratio.
- Reject if candidate.ctx.newsWindow === true.
- Reject if pricing engine_mid vs broker_mid delta > tolerance.
- Reject if price tick timestamp is older than 8 seconds.

If APPROVE, return risk_tier: LOW|MEDIUM and list of short reasons.
If REJECT, return reasons array explaining the top 3 blockers.

Return exactly:
{"decision":"APPROVE"|"REJECT","risk_tier":"LOW"|"MEDIUM"|"NONE","reasons":["..."]}`;

      const userPayload = JSON.stringify({ 
        candidate, 
        score, 
        timestamp: Date.now(),
        trace_id: traceId
      });

      const groqResponse = await groqService.generateResponse(
        `${systemPrompt}\n\nCandidate data: ${userPayload}`,
        { model: 'llama-3.1-8b-instant', temperature: 0.0, max_tokens: 200 }
      );

      // Parse and validate JSON response
      let parsedResponse;
      try {
        const jsonMatch = groqResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in Groq response');
        }
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('❌ Groq JSON parse error:', parseError);
        throw new Error(`groq_parse_error:${parseError.message}`);
      }

      // Validate required fields
      if (!parsedResponse.decision || !parsedResponse.reasons) {
        throw new Error('groq_parse_error:Missing required fields');
      }

      if (!['APPROVE', 'REJECT'].includes(parsedResponse.decision)) {
        throw new Error('groq_parse_error:Invalid decision value');
      }

      return {
        decision: parsedResponse.decision,
        risk_tier: parsedResponse.risk_tier || 'NONE',
        reasons: Array.isArray(parsedResponse.reasons) ? parsedResponse.reasons : [parsedResponse.reasons]
      };

    } catch (error) {
      console.error('❌ Groq judge failed:', error);
      // SEV-0 FALLBACK: Always reject on error
      return { 
        decision: 'REJECT', 
        risk_tier: 'NONE', 
        reasons: [`Groq error: ${error.message}`] 
      };
    }
  }

  /**
   * Build final signal object
   */
  private buildSignal(candidate: Candidate, score: number, groqDecision: any, traceId: string) {
    const rr = candidate.tp1 ? 
      `1:${Math.round((Math.abs(candidate.tp1 - candidate.entryPlan.price) / Math.abs(candidate.sl - candidate.entryPlan.price)) * 10) / 10}` : 
      '1:1';

    return {
      symbol: candidate.symbol,
      direction: candidate.direction === 'LONG' ? 'BUY' as const : 'SELL' as const,
      entry: candidate.entryPlan.price,
      sl: candidate.sl,
      tp1: candidate.tp1 || candidate.entryPlan.price * 1.001,
      tp2: candidate.tp2,
      rr,
      score,
      risk_tier: groqDecision.risk_tier,
      session: candidate.ctx.session,
      groq: groqDecision.decision,
      reasons: groqDecision.reasons,
      id: `det_sev0_${traceId}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Error categorization for monitoring
   */
  private categorizeError(errorMessage: string): string {
    if (errorMessage.includes('no_tick') || errorMessage.includes('no_fresh_feed')) {
      return 'no_fresh_tick';
    }
    if (errorMessage.includes('stale_tick')) {
      return 'stale_tick';
    }
    if (errorMessage.includes('groq_parse_error')) {
      return 'groq_parse_error';
    }
    if (errorMessage.includes('price_tolerance')) {
      return 'price_tolerance';
    }
    return 'unknown_error';
  }

  private getHumanReadableError(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'no_fresh_tick': 'Price feed unavailable - market may be closed',
      'stale_tick': 'Price data too old - live feed issue detected',
      'groq_parse_error': 'Signal validation failed - analysis error',
      'price_tolerance': 'Price mismatch detected - broker sync issue',
      'unknown_error': 'System error - please try again'
    };
    return errorMessages[errorCode] || 'Signal generation failed';
  }

  private getCurrentSession(): 'Asia' | 'London' | 'NY' {
    const hour = new Date().getUTCHours();
    if (hour >= 0 && hour < 8) return 'Asia';
    if (hour >= 8 && hour < 16) return 'London'; 
    return 'NY';
  }
}

export const deterministicSignalEngine = new DeterministicSignalEngine();