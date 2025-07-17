
interface GroqOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

class GroqService {
  private readonly baseUrl = 'https://api.groq.com/openai/v1';
  private apiKey: string | null = null;
  private initialized = false;

  constructor() {
    this.initializeApiKey();
  }

  private async initializeApiKey(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Try to get API key from Supabase edge function or environment
      const response = await fetch('/api/groq-config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }).catch(() => null);

      if (response?.ok) {
        const data = await response.json();
        this.apiKey = data.apiKey;
      } else {
        // Fallback: set the API key directly (temporary solution)
        this.apiKey = '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';
      }
      
      this.initialized = true;
      console.log('🧠 GROQ API KEY CONFIGURED - AI validation is now active');
    } catch (error) {
      console.error('Failed to initialize GROQ API key:', error);
      // Use the provided key as fallback
      this.apiKey = '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';
      this.initialized = true;
    }
  }

  async generateResponse(prompt: string, options: GroqOptions = {}): Promise<string> {
    // Ensure API key is initialized
    if (!this.initialized) {
      await this.initializeApiKey();
    }

    if (!this.apiKey) {
      console.error('❌ GROQ API key not available - signal validation DISABLED');
      throw new Error('Groq API key not configured');
    }

    try {
      console.log('🧠 GROQ API CALL INITIATED - Analyzing signal...');
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || 'mixtral-8x7b-32768',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: options.temperature || 0.1,
          max_tokens: options.max_tokens || 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ GROQ API ERROR ${response.status}:`, errorText);
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const result = data.choices[0]?.message?.content || '';
      
      console.log('✅ GROQ ANALYSIS COMPLETE - Response received');
      return result;
    } catch (error) {
      console.error('❌ Groq API call failed:', error);
      throw error;
    }
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    this.initialized = true;
    console.log('🧠 GROQ API KEY SET MANUALLY - AI validation active');
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.initialized;
  }

  getStatus(): string {
    if (!this.initialized) return 'Initializing...';
    if (!this.apiKey) return 'Not configured';
    return 'Ready';
  }
}

export const groqService = new GroqService();
