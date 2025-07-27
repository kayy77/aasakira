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

  async generateMultiStrategySignal(symbol: string, livePrice: number, timeframe: string = '15m'): Promise<any> {
    const currentDateTime = new Date().toISOString();
    
    const groqPrompt = `
You are a multi-strategy institutional AI analyst generating one best possible trade signal based on current price and recent market context.

Strategies to scan for:
- Smart Money Concepts (SMC)
- Liquidity sweep traps
- Fair Value Gap (FVG)
- RSI divergence
- Volume spike anomalies
- Trend continuation or reversal based on market sessions
- News impact if known (guess if urgent move)

Instructions:
1. Scan all strategies.
2. Choose the strongest signal that exists NOW.
3. Label the signal strength: "Strong", "Medium", or "Weak"
4. If signal is weak, still generate it — say it's the best available but weak.
5. Include exact entry price, SL, TP1, TP2, and reason.
6. Include strategy used in generation and why it was chosen.

Market: ${symbol}
Live Price: ${livePrice}
Time: ${currentDateTime}
Timeframe: ${timeframe}

Output Format (JSON only):
{
  "symbol": "${symbol}",
  "strength": "Strong | Medium | Weak",
  "entry": ${livePrice},
  "sl": ${livePrice * 0.995},
  "tp1": ${livePrice * 1.01},
  "tp2": ${livePrice * 1.02},
  "strategy": "SMC + RSI Divergence",
  "reason": "Liquidity sweep + divergence at key zone"
}`;

    try {
      const response = await this.generateResponse(groqPrompt, {
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
      
      // Fallback signal
      return {
        symbol,
        strength: "Weak",
        entry: livePrice,
        sl: livePrice * 0.995,
        tp1: livePrice * 1.01,
        tp2: livePrice * 1.02,
        strategy: "Fallback Analysis",
        reason: "Market conditions unclear, basic technical setup"
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
