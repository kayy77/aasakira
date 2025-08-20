// FVG Confirmation Engine - Institutional Entry Upgrade System
// Implements the FVG Confirmation Rule for higher win-rate entries

import { DeterministicFilters, Candle } from './orchestrator/DeterministicFilters';

export interface FVGConfirmationState {
  stage: 'DETECTED' | 'CONFIRMED' | 'RETESTING' | 'READY' | 'EXPIRED';
  message: string;
  fvgZone?: {
    high: number;
    low: number;
    direction: 'bullish' | 'bearish';
    strength: number;
  };
  entryTrigger?: {
    ready: boolean;
    price: number;
    reason: string;
  };
  timeframe: string;
}

export interface FVGValidationResult {
  valid: boolean;
  confirmationState: FVGConfirmationState;
  institutionalReady: boolean;
  skipTrade: boolean;
  reason: string;
}

export class FVGConfirmationEngine {
  
  /**
   * 🎯 Main FVG Confirmation Validator
   * Implements the institutional FVG confirmation rule before allowing entries
   */
  static validateFVGEntry(
    symbol: string,
    candles1H: Candle[],
    candles4H: Candle[],
    currentPrice: number,
    direction: 'BUY' | 'SELL',
    atr: number
  ): FVGValidationResult {
    
    console.log(`🔍 FVG Confirmation Check: ${symbol} ${direction} at ${currentPrice}`);
    
    // Step 1: Detect FVG on higher timeframes (1H / 4H)
    const fvg1H = DeterministicFilters.detectFVG(candles1H, atr);
    const fvg4H = DeterministicFilters.detectFVG(candles4H, atr);
    
    // Prioritize 4H FVG over 1H for institutional strength
    const primaryFVG = fvg4H.valid ? fvg4H : fvg1H;
    const timeframe = fvg4H.valid ? '4H' : '1H';
    
    if (!primaryFVG.valid) {
      return {
        valid: false,
        confirmationState: {
          stage: 'DETECTED',
          message: '⏳ No valid FVG detected on higher timeframes. Waiting for setup...',
          timeframe
        },
        institutionalReady: false,
        skipTrade: true,
        reason: 'NO_FVG_DETECTED'
      };
    }
    
    // Get the strongest FVG zone for validation
    const strongestZone = primaryFVG.zones.reduce((strongest, zone) => 
      zone.strength > strongest.strength ? zone : strongest
    );
    
    const fvgHigh = Math.max(strongestZone.from, strongestZone.to);
    const fvgLow = Math.min(strongestZone.from, strongestZone.to);
    const fvgDirection = strongestZone.from < strongestZone.to ? 'bullish' : 'bearish';
    
    console.log(`📊 FVG Zone Found: ${fvgDirection} ${fvgLow} - ${fvgHigh} (${timeframe})`);
    
    // Step 2: Check confirmation stage from enhanced FVG detection
    const confirmationStage = primaryFVG.confirmationStage || 'DETECTED';
    
    // Step 3: Validate directional alignment
    if ((direction === 'BUY' && fvgDirection !== 'bullish') ||
        (direction === 'SELL' && fvgDirection !== 'bearish')) {
      return {
        valid: false,
        confirmationState: {
          stage: 'DETECTED',
          message: `⚠️ Direction mismatch: ${direction} signal but ${fvgDirection} FVG`,
          fvgZone: {
            high: fvgHigh,
            low: fvgLow,
            direction: fvgDirection,
            strength: strongestZone.strength
          },
          timeframe
        },
        institutionalReady: false,
        skipTrade: true,
        reason: 'DIRECTION_MISMATCH'
      };
    }
    
    // Step 4: Implement the FVG Confirmation Rule
    switch (confirmationStage) {
      case 'DETECTED':
        return {
          valid: false,
          confirmationState: {
            stage: 'DETECTED',
            message: `🔍 FVG Detected: Waiting for candle close ${direction === 'BUY' ? 'above' : 'below'} FVG zone...`,
            fvgZone: {
              high: fvgHigh,
              low: fvgLow,
              direction: fvgDirection,
              strength: strongestZone.strength
            },
            timeframe
          },
          institutionalReady: false,
          skipTrade: true,
          reason: 'WAITING_FOR_CONFIRMATION'
        };
        
      case 'CONFIRMED':
        return {
          valid: false,
          confirmationState: {
            stage: 'CONFIRMED',
            message: `✅ FVG Confirmed: Waiting for retest/recap of FVG zone for entry...`,
            fvgZone: {
              high: fvgHigh,
              low: fvgLow,
              direction: fvgDirection,
              strength: strongestZone.strength
            },
            timeframe
          },
          institutionalReady: false,
          skipTrade: true,
          reason: 'WAITING_FOR_RETEST'
        };
        
      case 'RETESTING':
        // Check if current price is in retest zone
        const inRetestZone = currentPrice >= fvgLow && currentPrice <= fvgHigh;
        
        if (!inRetestZone) {
          return {
            valid: false,
            confirmationState: {
              stage: 'RETESTING',
              message: `🎯 FVG Retest Phase: Price not in optimal entry zone. Current: ${currentPrice}, Zone: ${fvgLow}-${fvgHigh}`,
              fvgZone: {
                high: fvgHigh,
                low: fvgLow,
                direction: fvgDirection,
                strength: strongestZone.strength
              },
              timeframe
            },
            institutionalReady: false,
            skipTrade: true,
            reason: 'NOT_IN_RETEST_ZONE'
          };
        }
        
        return {
          valid: false,
          confirmationState: {
            stage: 'RETESTING',
            message: `🎯 FVG Retest Detected: Price in zone but waiting for micro confirmation...`,
            fvgZone: {
              high: fvgHigh,
              low: fvgLow,
              direction: fvgDirection,
              strength: strongestZone.strength
            },
            entryTrigger: {
              ready: false,
              price: currentPrice,
              reason: 'Waiting for LTF confirmation'
            },
            timeframe
          },
          institutionalReady: false,
          skipTrade: true,
          reason: 'AWAITING_MICRO_CONFIRMATION'
        };
        
      case 'READY':
        // Final validation: Price must be in optimal entry zone
        const inEntryZone = currentPrice >= fvgLow && currentPrice <= fvgHigh;
        
        if (!inEntryZone) {
          return {
            valid: false,
            confirmationState: {
              stage: 'EXPIRED',
              message: `❌ FVG Entry Expired: Price moved outside optimal zone`,
              fvgZone: {
                high: fvgHigh,
                low: fvgLow,
                direction: fvgDirection,
                strength: strongestZone.strength
              },
              timeframe
            },
            institutionalReady: false,
            skipTrade: true,
            reason: 'ENTRY_ZONE_EXPIRED'
          };
        }
        
        // 🚀 INSTITUTIONAL ENTRY APPROVED
        return {
          valid: true,
          confirmationState: {
            stage: 'READY',
            message: `🚀 INSTITUTIONAL ENTRY READY: FVG confirmed + retested. High probability setup!`,
            fvgZone: {
              high: fvgHigh,
              low: fvgLow,
              direction: fvgDirection,
              strength: strongestZone.strength
            },
            entryTrigger: {
              ready: true,
              price: currentPrice,
              reason: 'FVG confirmation + retest complete'
            },
            timeframe
          },
          institutionalReady: true,
          skipTrade: false,
          reason: 'INSTITUTIONAL_SETUP_CONFIRMED'
        };
        
      default:
        return {
          valid: false,
          confirmationState: {
            stage: 'DETECTED',
            message: `⏸️ Unknown confirmation stage: ${confirmationStage}`,
            timeframe
          },
          institutionalReady: false,
          skipTrade: true,
          reason: 'UNKNOWN_STAGE'
        };
    }
  }
  
  /**
   * 🎯 Calculate enhanced stop loss placement outside FVG zone
   * Prevents fake stop-outs by placing SL beyond the FVG structure
   */
  static calculateFVGStopLoss(
    direction: 'BUY' | 'SELL',
    entry: number,
    fvgHigh: number,
    fvgLow: number,
    atr: number,
    buffer: number = 0.3 // 30% ATR buffer
  ): number {
    const atrBuffer = atr * buffer;
    
    if (direction === 'BUY') {
      // For BUY: Place SL below FVG low with buffer
      return fvgLow - atrBuffer;
    } else {
      // For SELL: Place SL above FVG high with buffer
      return fvgHigh + atrBuffer;
    }
  }
  
  /**
   * 🎯 Generate live FVG status updates for users
   */
  static generateFVGStatusUpdate(symbol: string, state: FVGConfirmationState): string {
    const stageEmojis = {
      'DETECTED': '🔍',
      'CONFIRMED': '✅',
      'RETESTING': '🎯',
      'READY': '🚀',
      'EXPIRED': '❌'
    };
    
    const emoji = stageEmojis[state.stage];
    const timeframeTag = `[${state.timeframe}]`;
    
    return `${emoji} ${timeframeTag} ${symbol}: ${state.message}`;
  }
}

// Export singleton instance
export const fvgConfirmationEngine = new FVGConfirmationEngine();