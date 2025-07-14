import { supabase } from '@/integrations/supabase/client';

interface ChartGenerationRequest {
  prompt: string;
  chartType: 'smc_analysis' | 'price_action' | 'technical_indicator' | 'trading_strategy';
  timeframe?: string;
  pair?: string;
}

interface GenerationResponse {
  imageUrl?: string;
  videoUrl?: string;
  status: 'success' | 'error' | 'processing';
  predictionId?: string;
  error?: string;
}

class ReplicateService {
  private readonly baseUrl = 'https://tnfxxtnfpoavnsabjrii.supabase.co/functions/v1';
  private readonly rateLimitKey = 'replicate_api_calls';
  private readonly maxCallsPerHour = 50; // Conservative limit for free plan

  private async checkRateLimit(): Promise<boolean> {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    const calls = JSON.parse(localStorage.getItem(this.rateLimitKey) || '[]');
    const recentCalls = calls.filter((timestamp: number) => timestamp > hourAgo);
    
    if (recentCalls.length >= this.maxCallsPerHour) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    recentCalls.push(now);
    localStorage.setItem(this.rateLimitKey, JSON.stringify(recentCalls));
    return true;
  }

  async generateTradingChart(request: ChartGenerationRequest): Promise<GenerationResponse> {
    try {
      await this.checkRateLimit();

      const enhancedPrompt = this.enhancePromptForTrading(request);
      
      const { data, error } = await supabase.functions.invoke('generate-chart-visual', {
        body: {
          prompt: enhancedPrompt,
          model: 'black-forest-labs/flux-schnell',
          parameters: {
            width: 1024,
            height: 768,
            num_inference_steps: 4,
            guidance_scale: 3.5
          }
        }
      });

      if (error) throw error;

      return {
        imageUrl: data.output?.[0],
        status: 'success'
      };
    } catch (error) {
      console.error('Replicate chart generation error:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Chart generation failed'
      };
    }
  }

  async generateSMCDiagram(analysis: string, zones: any[]): Promise<GenerationResponse> {
    try {
      await this.checkRateLimit();

      const prompt = `Professional smart money concepts (SMC) trading chart diagram showing:
        ${analysis}
        
        Chart elements to include:
        - Order blocks marked in blue rectangles
        - Break of structure (BOS) with trend lines
        - Fair value gaps (FVG) highlighted
        - Liquidity zones marked
        - Entry and stop loss levels clearly marked
        - Clean price action on dark background
        - Professional forex chart style
        - Institutional trading zones highlighted`;

      const { data, error } = await supabase.functions.invoke('generate-chart-visual', {
        body: {
          prompt,
          model: 'black-forest-labs/flux-schnell'
        }
      });

      if (error) throw error;

      return {
        imageUrl: data.output?.[0],
        status: 'success'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'SMC diagram generation failed'
      };
    }
  }

  private enhancePromptForTrading(request: ChartGenerationRequest): string {
    const basePrompts = {
      smc_analysis: `Professional smart money concepts trading chart analysis for ${request.pair || 'EUR/USD'} ${request.timeframe || '1H'} timeframe. 
        Show: order blocks, break of structure, fair value gaps, liquidity zones, institutional price action. 
        Dark theme, clean professional forex chart style.`,
      
      price_action: `Clean price action trading chart for ${request.pair || 'forex'} showing key support/resistance levels, 
        trend lines, candlestick patterns. Professional trading platform style, dark background.`,
      
      technical_indicator: `Technical analysis chart with indicators overlay for ${request.pair || 'trading pair'}. 
        Include moving averages, RSI, MACD. Clean professional trading view style.`,
      
      trading_strategy: `Complete trading strategy visualization showing entry points, stop loss, take profit levels. 
        Professional institutional trading chart style with clear annotations.`
    };

    return `${basePrompts[request.chartType]} ${request.prompt}. Ultra high resolution, professional quality.`;
  }

  async getRemainingCalls(): Promise<number> {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    const calls = JSON.parse(localStorage.getItem(this.rateLimitKey) || '[]');
    const recentCalls = calls.filter((timestamp: number) => timestamp > hourAgo);
    
    return Math.max(0, this.maxCallsPerHour - recentCalls.length);
  }
}

export const replicateService = new ReplicateService();
export type { ChartGenerationRequest, GenerationResponse };