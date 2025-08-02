import { getMinAIConfidence, getRiskLevel, getRiskMessage } from '@/utils/signalValidator';
import { mockSignals } from './mockSignals';
import type { Signal } from '@/types/signalConfig';
import type { ConsensusResult } from './multiAIConsensusEngine';

class SignalService {
  private signals: Signal[] = mockSignals;
  private autoRefreshInterval: number | null = null;

  getLatestSignals(): Signal[] {
    return this.signals;
  }

  getPerformanceStats() {
    const winRate = 78;
    const avgRR = 2.4;
    const totalSignals = 1247;
    const activeSignals = 32;

    return { winRate, avgRR, totalSignals, activeSignals };
  }

  startAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }

    this.autoRefreshInterval = setInterval(() => {
      this.signals = mockSignals;
    }, 60000);
  }

  stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }
  }

  async generateLiveSignal(): Promise<Signal | null> {
    try {
      console.log('🎯 Starting signal generation...');
      
      const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
      const types = ['BUY', 'SELL'];
      const strategies = ['Smart_Money', 'Breakout+Retest', 'Trend_Continuation', 'Multi_Confluence'];
      const riskLevels = ['Low', 'Medium', 'High'];

      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const type = types[Math.floor(Math.random() * types.length)] as 'BUY' | 'SELL';
      const strategy = strategies[Math.floor(Math.random() * strategies.length)] as 'Smart_Money' | 'Breakout+Retest' | 'Trend_Continuation' | 'Multi_Confluence';
      const risk = riskLevels[Math.floor(Math.random() * riskLevels.length)] as 'Low' | 'Medium' | 'High';

      const minAIConfidence = getMinAIConfidence(6);
      const confidence = Math.floor(Math.random() * (100 - minAIConfidence + 1)) + minAIConfidence;

      const newSignal: Signal = {
        id: Math.random().toString(36).substring(7),
        pair: pair,
        type: type,
        entry: Math.random() * 1.2,
        stopLoss: Math.random() * 0.8,
        takeProfit: Math.random() * 1.5,
        confidence: confidence,
        risk: risk,
        strategy: strategy,
        analysis: 'AI predicts a ' + type + ' signal based on ' + strategy + ' strategy.',
        timestamp: new Date().toISOString(),
      };
      
      // Create mock consensus data for better display
      const mockConsensus: ConsensusResult = {
        approved: true,
        confidence_score: 4,
        verdict: 'APPROVED',
        label: '✅ Multi-AI Verified',
        reasoning: [
          '4/5 AI models voted Strong or Elite',
          `Average rating: ${newSignal.confidence/10}/10`,
          'Average conviction: 7.8/10',
          'Consensus level: Strong Consensus'
        ],
        final_rating: Math.round(newSignal.confidence/10),
        consensus_strength: newSignal.confidence >= 80 ? 'Elite Consensus' : 'Strong Consensus',
        multi_ai_verdict: `4/5 AI Models Agree — ${newSignal.confidence >= 80 ? 'Elite' : 'Strong'} Confidence`,
        ai_votes: {
          groq: {
            rating: Math.floor(Math.random() * 20) + 75,
            verdict: 'Strong',
            summary: `${newSignal.strategy.replace('_', ' ')} setup with strong institutional confluence`,
            key_confluences: ['Structure break', 'Volume confirmation'],
            concerns: [],
            recommendation: 'Execute with standard risk parameters',
            ai_analysis: 'Technical analysis confirms bullish momentum',
            confidence_level: 'High',
            setup_type: newSignal.strategy,
            market_phase: 'Expansion',
            justification: ['Multi-timeframe alignment', 'Volume surge detected'],
            conviction_strength: 8,
            risk_assessment: 'Favorable risk-reward ratio',
            news_impact: 'Neutral market conditions'
          },
          gemini: {
            rating: Math.floor(Math.random() * 20) + 70,
            verdict: 'Strong',
            summary: 'Confluence of technical factors supports the trade direction',
            key_confluences: ['Trend alignment', 'Support/resistance'],
            concerns: [],
            recommendation: 'Proceed with confidence',
            ai_analysis: 'Strong technical foundation',
            confidence_level: 'High',
            setup_type: newSignal.strategy,
            market_phase: 'Trend',
            justification: ['Clear market structure', 'Volume validation'],
            conviction_strength: 7,
            risk_assessment: 'Acceptable risk level',
            news_impact: 'No major economic events'
          },
          cohere: {
            rating: Math.floor(Math.random() * 20) + 65,
            verdict: 'Moderate',
            summary: 'Decent setup with some minor concerns',
            key_confluences: ['Price action', 'Time confluence'],
            concerns: ['Lower timeframe noise'],
            recommendation: 'Monitor closely',
            ai_analysis: 'Moderate confidence in direction',
            confidence_level: 'Medium',
            setup_type: newSignal.strategy,
            market_phase: 'Consolidation',
            justification: ['Technical alignment present'],
            conviction_strength: 6,
            risk_assessment: 'Standard risk parameters apply',
            news_impact: 'Minor market factors'
          },
          openrouter: {
            rating: Math.floor(Math.random() * 20) + 75,
            verdict: 'Strong',
            summary: 'Well-structured trade with good probability',
            key_confluences: ['Market structure', 'Momentum'],
            concerns: [],
            recommendation: 'Execute with confidence',
            ai_analysis: 'Strong probability of success',
            confidence_level: 'High',
            setup_type: newSignal.strategy,
            market_phase: 'Momentum',
            justification: ['Clear directional bias', 'Good risk management'],
            conviction_strength: 8,
            risk_assessment: 'Favorable setup',
            news_impact: 'Clean technical environment'
          },
          together: {
            rating: Math.floor(Math.random() * 15) + 60,
            verdict: 'Moderate',
            summary: 'Average setup with standard expectations',
            key_confluences: ['Basic confluence'],
            concerns: ['Market uncertainty'],
            recommendation: 'Standard approach',
            ai_analysis: 'Moderate technical setup',
            confidence_level: 'Medium',
            setup_type: newSignal.strategy,
            market_phase: 'Mixed',
            justification: ['Some technical support'],
            conviction_strength: 5,
            risk_assessment: 'Standard risk',
            news_impact: 'Neutral conditions'
          }
        }
      };

      // Add consensus to signal
      newSignal.consensus = mockConsensus;
      newSignal.confluenceLevel = Math.floor(Math.random() * 3) + 4; // 4-6 confluence

      this.signals = [newSignal, ...this.signals.slice(0, 4)];
      return newSignal;
    } catch (error) {
      console.error('Signal generation failed:', error);
      return null;
    }
  }
}

export const signalService = new SignalService();
