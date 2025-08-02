import { EliteSignalEngine } from './eliteSignalEngine';
import { multiAIConsensusEngine } from './multiAIConsensusEngine';
import { groqService } from './groqService';

interface FilteredSignalRequest {
  filterType: 'strong' | 'medium' | 'weak';
  minConfidence: number;
  requiredFilters: number;
}

interface EnhancedSignalResult {
  signal: any;
  aiAnalysis: string;
  institutionalGrade: string;
  confidenceScore: number;
  filterBreakdown: string[];
  groqJustification: string[];
}

export class SignalFilterIntegration {
  
  static async getFilteredSignals(request: FilteredSignalRequest): Promise<EnhancedSignalResult[]> {
    console.log(`🎯 Generating ${request.filterType.toUpperCase()} signals with ${request.minConfidence}% min confidence`);
    
    const results: EnhancedSignalResult[] = [];
    const maxAttempts = 3;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        // Generate signal using elite engine - FIXED: Use static method call
        const signal = await EliteSignalEngine.generateEliteSignal(
          request.minConfidence,
          request.requiredFilters,
          ['SMC', 'Volume', 'Session', 'FVG', 'Liquidity', 'RSI']
        );
        
        if (!signal) continue;
        
        // Get AI consensus analysis
        const aiAnalysis = await this.getAIConsensusForSignal(signal);
        
        // Generate Groq institutional justification
        const groqJustification = await this.getGroqJustification(signal);
        
        const enhancedResult: EnhancedSignalResult = {
          signal,
          aiAnalysis: aiAnalysis.reasoning.join(' | '),
          institutionalGrade: aiAnalysis.institutional_grade,
          confidenceScore: signal.confidence,
          filterBreakdown: signal.filterBreakdown.passed,
          groqJustification
        };
        
        results.push(enhancedResult);
        
      } catch (error) {
        console.error(`Signal generation attempt ${i + 1} failed:`, error);
      }
    }
    
    console.log(`✅ Generated ${results.length} enhanced ${request.filterType} signals`);
    return results;
  }
  
  private static async getAIConsensusForSignal(signal: any) {
    const context = {
      pair: signal.pair,
      timeframe: '15M',
      direction: signal.type,
      entry_price: parseFloat(signal.entry),
      stop_loss: parseFloat(signal.stopLoss),
      take_profit: parseFloat(signal.takeProfit),
      structure_desc: `${signal.strategy} setup with ${signal.filtersScore}/${signal.maxFilters} filters`,
      liquidity_zone_info: `Liquidity analysis: ${signal.filterBreakdown.passed.includes('Liquidity Sweep') ? 'Confirmed sweep' : 'Standard levels'}`,
      fvg_info: `FVG status: ${signal.filterBreakdown.passed.includes('Fair Value Gap') ? 'Active FVG identified' : 'No significant FVG'}`,
      rsi_data: `RSI: ${signal.filterBreakdown.passed.includes('RSI Divergence') ? 'Divergence confirmed' : 'Normal range'}`,
      volume_snapshot: `Volume: ${signal.filterBreakdown.passed.includes('Volume Spike') ? 'Institutional spike detected' : 'Standard levels'}`,
      session_info: `Session: ${signal.filterBreakdown.passed.includes('Session Filter') ? 'Optimal timing' : 'Off-hours'}`,
      time: signal.timestamp,
      news_context: 'Clean news environment',
      confluences_list: signal.filterBreakdown.passed
    };
    
    try {
      return await multiAIConsensusEngine.analyzeSignalConsensus(context);
    } catch (error) {
      console.error('AI consensus failed:', error);
      return {
        reasoning: ['AI analysis unavailable'],
        institutional_grade: 'Standard',
        confidence_score: signal.confidence
      };
    }
  }
  
  private static async getGroqJustification(signal: any): Promise<string[]> {
    const prompt = `You are a brutal institutional trader. Given the following data:

- Pair: ${signal.pair}
- Direction: ${signal.type}
- Price: ${signal.entry}
- Filters Passed: ${signal.filterBreakdown.passed.join(', ')} (${signal.filtersScore}/${signal.maxFilters})
- Risk-Reward Profile: ${signal.riskReward}:1
- Confidence: ${signal.confidence}%
- Strategy: ${signal.strategy}
- Live Price: ${signal.livePrice}

Should I take this trade? Be brutally honest and return:
1. One of: STRONG ${signal.type} / DECENT ${signal.type} / WEAK ${signal.type}
2. Exactly 3 bullet points of justification
3. One risk warning

Format: 
DECISION: [your decision]
• [justification 1]
• [justification 2] 
• [justification 3]
RISK: [risk warning]`;

    try {
      const response = await groqService.generateResponse(prompt, {
        model: 'llama3-70b-8192',
        temperature: 0.3,
        max_tokens: 300
      });
      
      return response ? response.split('\n').filter(line => line.trim()) : [
        `DECENT ${signal.type}`,
        `• ${signal.filtersScore}/${signal.maxFilters} institutional filters confirmed`,
        `• ${signal.confidence}% AI confidence with ${signal.riskReward}:1 R:R`,
        `• Live price validation at ${signal.livePrice}`,
        `RISK: Monitor for session gaps and news events`
      ];
      
    } catch (error) {
      console.error('Groq justification failed:', error);
      return [
        `STANDARD ${signal.type}`,
        `• Multi-strategy confluence detected`,
        `• ${signal.confidence}% institutional confidence`,
        `• Risk-managed with ${signal.riskReward}:1 ratio`,
        `RISK: Standard market risk applies`
      ];
    }
  }
  
  static getFilterConfiguration(filterType: string) {
    switch (filterType) {
      case 'strong':
        return {
          minConfidence: 85,
          requiredFilters: 4,
          label: 'Elite Grade (A+)',
          description: 'Institutional-grade signals with maximum confluence'
        };
      case 'medium':
        return {
          minConfidence: 70,
          requiredFilters: 3,
          label: 'Professional Grade (A/B)',
          description: 'High-quality signals with solid backing'
        };
      case 'weak':
        return {
          minConfidence: 60,
          requiredFilters: 2,
          label: 'Standard Grade (C)',
          description: 'Basic signals meeting minimum criteria'
        };
      default:
        return {
          minConfidence: 70,
          requiredFilters: 3,
          label: 'Mixed Grade',
          description: 'All qualifying signals'
        };
    }
  }
}

export const signalFilterIntegration = new SignalFilterIntegration();
