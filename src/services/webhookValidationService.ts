import { supabase } from "@/integrations/supabase/client";

interface SignalValidationRequest {
  symbol: string;
  direction: "buy" | "sell";
  entry: number;
  stop: number;
  target: number;
  livePrice: number;
  session: string;
  smartMoneySentiment?: "buy" | "sell" | "neutral";
  liquidityZones?: number[];
  fvgZones?: number[];
  volumeSpike: boolean;
  rsiValue: number;
  confidence: number;
  filtersPassed: string[];
}

interface ValidationResponse {
  valid: boolean;
  adjustments: string[];
  warnings: string[];
  enhancedConfidence?: number;
  suggestedTP?: number;
  suggestedSL?: number;
}

export class WebhookValidationService {
  // Fixed: VITE_ env vars not supported by Lovable - using hardcoded Supabase URL
  private static readonly WEBHOOK_URL = `https://tnfxxtnfpoavnsabjrii.supabase.co/functions/v1/signal-webhook-validator`;

  static async validateSignal(signal: SignalValidationRequest): Promise<ValidationResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(signal),
      });

      if (!response.ok) {
        throw new Error(`Webhook validation failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Webhook validation error:', error);
      
      // Fallback to local validation if webhook fails
      return this.fallbackValidation(signal);
    }
  }

  private static fallbackValidation(signal: SignalValidationRequest): ValidationResponse {
    const adjustments: string[] = [];
    const warnings: string[] = [];
    let valid = true;

    // Basic fallback validation rules
    const riskReward = Math.abs(signal.target - signal.entry) / Math.abs(signal.stop - signal.entry);
    
    if (riskReward < 1.8) {
      adjustments.push("Risk/Reward below institutional standard");
      valid = false;
    }

    if (signal.filtersPassed.length < 3) {
      adjustments.push("Insufficient filter confluence");
      valid = false;
    }

    const rsiNeutral = signal.rsiValue > 45 && signal.rsiValue < 55;
    if (rsiNeutral && !signal.filtersPassed.includes("RSI Divergence")) {
      adjustments.push("RSI neutral without divergence");
      valid = false;
    }

    if (["Sydney", "Tokyo"].includes(signal.session) && signal.filtersPassed.length < 5) {
      adjustments.push("Dead session requires elite confluence");
      valid = false;
    }

    return {
      valid,
      adjustments,
      warnings,
    };
  }

  // MetaAPI Integration for trade tracking
  static async trackSignalPerformance(signal: {
    symbol: string;
    direction: string;
    entry: number;
    stop: number;
    target: number;
    confidence: number;
  }): Promise<void> {
    try {
      // Log signal performance to user activities for now
      // In production, this would integrate with MetaAPI
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('user_activities')
          .insert({
            user_id: user.id,
            activity_type: 'signal_generated',
            data: {
              ...signal,
              timestamp: new Date().toISOString(),
              status: 'pending'
            }
          });
      }

    } catch (error) {
      console.error('Signal tracking error:', error);
    }
  }

  // Smart Money Sentiment Integration
  static async getMarketSentiment(symbol: string): Promise<"buy" | "sell" | "neutral"> {
    try {
      // This could integrate with Santiment, CoinGlass, or similar APIs
      // For now, return neutral as placeholder
      return "neutral";
    } catch (error) {
      console.error('Sentiment API error:', error);
      return "neutral";
    }
  }

  // Real-time news integration
  static async checkMacroEvents(symbol: string): Promise<{
    hasRedFolderEvent: boolean;
    eventDescription?: string;
  }> {
    try {
      // This would integrate with economic calendar APIs
      // For now, return no events
      return { hasRedFolderEvent: false };
    } catch (error) {
      console.error('Macro events check error:', error);
      return { hasRedFolderEvent: false };
    }
  }
}