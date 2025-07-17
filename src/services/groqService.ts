
interface GroqOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

class GroqService {
  private readonly baseUrl = 'https://api.groq.com/openai/v1';
  private apiKey: string = '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';
  private initialized = true;

  constructor() {
    console.log('🧠 GROQ SERVICE INITIALIZED with API key:', this.apiKey ? 'SET ✅' : 'MISSING ❌');
  }

  async generateResponse(prompt: string, options: GroqOptions = {}): Promise<string> {
    if (!this.apiKey) {
      console.error('❌ GROQ API key not available - signal validation BLOCKED');
      throw new Error('Groq API key not configured - cannot validate signals');
    }

    console.log('🧠 GROQ API REQUEST INITIATED');
    console.log('📝 Model:', options.model || 'mixtral-8x7b-32768');
    console.log('🌡️ Temperature:', options.temperature || 0.1);
    console.log('📄 Prompt length:', prompt.length, 'characters');

    try {
      const requestBody = {
        model: options.model || 'mixtral-8x7b-32768',
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
      console.log('🎯 First 200 chars:', result.substring(0, 200) + '...');
      
      return result;
    } catch (error) {
      console.error('❌ GROQ API call failed:', error);
      throw error;
    }
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    this.initialized = true;
    console.log('🔑 GROQ API KEY UPDATED - Service ready for validation');
  }

  isConfigured(): boolean {
    const configured = !!this.apiKey && this.initialized;
    console.log('🔍 GROQ Configuration Check:', configured ? 'READY ✅' : 'NOT READY ❌');
    return configured;
  }

  getStatus(): string {
    if (!this.initialized) return 'Initializing...';
    if (!this.apiKey) return 'Not configured';
    return 'Ready - AI Validation Active';
  }

  // Test method to verify GROQ is working
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 TESTING GROQ CONNECTION...');
      const testPrompt = 'Respond with "GROQ_TEST_SUCCESS" if you can see this message.';
      const response = await this.generateResponse(testPrompt, {
        model: 'mixtral-8x7b-32768',
        temperature: 0.1,
        max_tokens: 50
      });
      
      const success = response.includes('GROQ_TEST_SUCCESS');
      console.log('🧪 GROQ CONNECTION TEST:', success ? 'PASSED ✅' : 'FAILED ❌');
      console.log('🧪 Response:', response);
      return success;
    } catch (error) {
      console.error('🧪 GROQ CONNECTION TEST FAILED:', error);
      return false;
    }
  }
}

export const groqService = new GroqService();
