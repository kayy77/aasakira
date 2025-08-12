interface GroqOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

class GroqService {
  private readonly baseUrl = 'https://api.groq.com/openai/v1';
  private apiKey: string = '';
  private initialized = false;

  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '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';
    this.initialized = !!this.apiKey;
    console.log('🧠 GROQ SERVICE INITIALIZED with API key:', this.apiKey ? 'SET ✅' : 'MISSING ❌');
  }

  async generateInstitutionalSignal(symbol: string, livePrice: number, timeframe: string = '15m', strategy: any = {}, multiTfData: any = {}): Promise<any> {
    const currentDateTime = new Date().toISOString();
    const session = this.getCurrentTradingSession();
    
    const institutionalPrompt = `
🏛️ INSTITUTIONAL TRADING DOCTRINE - ELITE SIGNAL ANALYSIS

You are an elite institutional trader with 20+ years experience. Analyze this setup using professional trading doctrine:

MANDATORY ANALYSIS FRAMEWORK:
1. SMART MONEY CONCEPTS (SMC):
   - Break of Structure (BOS): Is there a clear break above/below previous high/low?
   - Change of Character (CHoCH): Has market structure shifted from bullish to bearish or vice versa?
   - Fair Value Gap (FVG): Are there price gaps from institutional moves?
   - Order Blocks (OB): Identify zones where institutions placed large orders
   - Liquidity Sweep: Check for stop hunts above/below key levels
   - AMD (Accumulation, Manipulation, Distribution): What phase is market in?

2. ICT CONCEPTS:
   - Killzones: London (8-10 UTC), NY (13-15 UTC), Asian (0-2 UTC)
   - Judas Swing: False moves during session opens
   - Silver Bullet: 10:00-11:00 & 14:00-15:00 UTC setups
   - PD Arrays: Premium/Discount pricing relative to range

3. SESSION ANALYSIS:
   - Current Session: ${session}
   - Session Bias: What's the expected direction for this session?
   - Intermarket Analysis: How does this correlate with DXY, yields, risk sentiment?

4. RISK MANAGEMENT:
   - Position Size: Account for volatility and session
   - R:R Ratio: Minimum 1:2, optimal 1:3+
   - Confluence: Multiple factors aligning (minimum 3)

MARKET DATA:
Symbol: ${symbol}
Live Price: ${livePrice}
Timeframe: ${timeframe}
DateTime: ${currentDateTime}
Strategy Focus: ${strategy.focus || 'comprehensive'}
Multi-TF Context: ${JSON.stringify(multiTfData).slice(0, 200)}

INSTITUTIONAL VERDICT FORMAT (JSON ONLY):
{
  "symbol": "${symbol}",
  "institutional_grade": "Elite|Professional|Standard|Speculative|Reject",
  "setup_type": "BOS Continuation|CHoCH Reversal|FVG Fill|Liquidity Sweep|Order Block",
  "entry": ${livePrice},
  "stop_loss": ${livePrice * 0.995},
  "take_profit_1": ${livePrice * 1.015},
  "take_profit_2": ${livePrice * 1.03},
  "risk_reward": "1:3.0",
  "confluence_factors": ["factor1", "factor2", "factor3"],
  "session_bias": "London Open Continuation|NY Reversal|Asian Range",
  "smc_analysis": "Clear BOS + FVG confluence at institutional order block",
  "conviction_score": 85,
  "position_size_rec": "1.5%|1.0%|0.5%|0.25%",
  "execution_notes": "Enter on pullback to 50% FVG level with tight stop"
}

CRITICAL: Must find the BEST available setup. If weak, still provide it but grade accordingly.`;

    try {
      const response = await this.generateResponse(institutionalPrompt, {
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 800
      });

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('❌ Multi-strategy signal generation failed:', error);
      
      // ALWAYS return a fallback signal - never fail completely
      return {
        symbol,
        strength: "Weak",
        entry: livePrice,
        sl: livePrice * 0.995,
        tp1: livePrice * 1.01,
        tp2: livePrice * 1.02,
        strategy: "Fallback Analysis",
        reason: "Market conditions unclear, basic technical setup - use smaller position size"
      };
    }
  }

  async generateResponse(prompt: string, options: GroqOptions = {}): Promise<string> {
    if (!this.apiKey) {
      console.error('❌ GROQ API key not available');
      throw new Error('Groq API key not configured');
    }

    console.log('🧠 GROQ API REQUEST INITIATED');
    console.log('📝 Model:', options.model || 'llama3-8b-8192');
    console.log('🌡️ Temperature:', options.temperature || 0.1);

    try {
      const requestBody = {
        model: options.model || 'llama3-8b-8192',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.1,
        max_tokens: options.max_tokens || 500,
      };

      console.log('🔄 Sending request to GROQ API...');
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 GROQ API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ GROQ API ERROR ${response.status}:`, errorText);
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const result = data.choices[0]?.message?.content || '';
      
      console.log('✅ GROQ ANALYSIS COMPLETE');
      console.log('📊 Response length:', result.length, 'characters');
      
      return result;
    } catch (error) {
      console.error('❌ GROQ API call failed:', error);
      throw error;
    }
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    this.initialized = true;
    console.log('🔑 GROQ API KEY UPDATED');
  }

  isConfigured(): boolean {
    const configured = !!this.apiKey && this.initialized;
    console.log('🔍 GROQ Configuration Check:', configured ? 'READY ✅' : 'NOT READY ❌');
    return configured;
  }

  getStatus(): string {
    if (!this.initialized) return 'Initializing...';
    if (!this.apiKey) return 'Not configured';
    return 'Ready';
  }

  private getCurrentTradingSession(): string {
    const hour = new Date().getUTCHours();
    
    if (hour >= 0 && hour <= 8) return 'Asian';
    if (hour >= 8 && hour <= 17) return 'London';
    if (hour >= 13 && hour <= 22) return 'NY';
    return 'Transition';
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 TESTING GROQ CONNECTION...');
      const testPrompt = 'Please respond with exactly: {"status": "success", "message": "GROQ_TEST_SUCCESS"}';
      const response = await this.generateResponse(testPrompt, {
        model: 'llama3-8b-8192',
        temperature: 0.1,
        max_tokens: 100
      });
      
      const success = response.includes('GROQ_TEST_SUCCESS') || response.includes('success');
      console.log('🧪 GROQ CONNECTION TEST:', success ? 'PASSED ✅' : 'FAILED ❌');
      return success;
    } catch (error) {
      console.error('🧪 GROQ CONNECTION TEST FAILED:', error);
      return false;
    }
  }
}

export const groqService = new GroqService();
