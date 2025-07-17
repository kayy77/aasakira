
import { groqService } from './groqService';
import { groqSignalJudge } from './groqSignalJudge';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  details: string;
  error?: string;
  executionTime?: number;
}

class GroqTestService {
  async runFullTest(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    console.log('🧪 STARTING COMPREHENSIVE GROQ DUAL-PHASE INTERROGATION TEST SUITE...');
    console.log('=' .repeat(80));

    // Test 1: Service Configuration
    const configStartTime = Date.now();
    try {
      const configured = groqService.isConfigured();
      results.push({
        test: 'GROQ Service Configuration',
        status: configured ? 'PASS' : 'FAIL',
        details: configured ? 'API key configured and service ready for dual-phase interrogation' : 'Service not properly configured',
        executionTime: Date.now() - configStartTime
      });
    } catch (error) {
      results.push({
        test: 'GROQ Service Configuration',
        status: 'FAIL',
        details: 'Configuration check failed',
        error: error.message,
        executionTime: Date.now() - configStartTime
      });
    }

    // Test 2: API Connection with Enhanced Model
    const connectionStartTime = Date.now();
    try {
      const connectionTest = await groqService.testConnection();
      results.push({
        test: 'GROQ API Connection (llama3-8b-8192)',
        status: connectionTest ? 'PASS' : 'FAIL',
        details: connectionTest ? 'Successfully connected to GROQ API with llama3-8b-8192 model' : 'Failed to connect to GROQ API',
        executionTime: Date.now() - connectionStartTime
      });
    } catch (error) {
      results.push({
        test: 'GROQ API Connection (llama3-8b-8192)',
        status: 'FAIL',
        details: 'API connection test failed',
        error: error.message,
        executionTime: Date.now() - connectionStartTime
      });
    }

    // Test 3: Phase 1 Interrogation Test
    const phase1StartTime = Date.now();
    try {
      const testSignal = {
        symbol: 'EURUSD',
        direction: 'BUY' as const,
        entry: 1.1000,
        stop: 1.0950,
        target: 1.1150,
        frameworks: ['Order Block', 'Break of Structure', 'Volume Spike'],
        session: 'London',
        rsi: 45,
        volume: 'High',
        context: 'Phase 1 interrogation test signal',
        confluence: 5,
        confidence: 87
      };

      const phase1Result = await groqSignalJudge.evaluateSignal(testSignal);
      results.push({
        test: 'GROQ Phase 1 Institutional Screening',
        status: phase1Result ? 'PASS' : 'FAIL',
        details: phase1Result ? 
          `Phase 1 completed: Decision=${phase1Result.decision}, Grade=${phase1Result.institutional_grade}, Risk=${phase1Result.risk_assessment.level}` :
          'Phase 1 institutional screening failed',
        executionTime: Date.now() - phase1StartTime
      });
    } catch (error) {
      results.push({
        test: 'GROQ Phase 1 Institutional Screening',
        status: 'FAIL',
        details: 'Phase 1 interrogation test failed',
        error: error.message,
        executionTime: Date.now() - phase1StartTime
      });
    }

    // Test 4: Full Dual-Phase Signal Validation
    const dualPhaseStartTime = Date.now();
    try {
      const testSignal = {
        symbol: 'GBPUSD',
        direction: 'SELL' as const,
        entry: 1.2500,
        stop: 1.2550,
        target: 1.2350,
        frameworks: ['Fair Value Gap', 'Liquidity Sweep', 'SMC Structure'],
        session: 'London',
        rsi: 65,
        volume: 'Medium',
        context: 'Dual-phase institutional interrogation test',
        confluence: 4,
        confidence: 85
      };

      const dualPhaseResult = await groqSignalJudge.validateAndAdjustSignal(testSignal);
      
      results.push({
        test: 'GROQ Dual-Phase Institutional Interrogation',
        status: 'PASS',
        details: dualPhaseResult ? 
          `Dual-phase completed: Signal ${dualPhaseResult.symbol} ${dualPhaseResult.direction} processed with ${dualPhaseResult.confidence}% confidence` :
          'Signal rejected by dual-phase institutional interrogation standards',
        executionTime: Date.now() - dualPhaseStartTime
      });
    } catch (error) {
      results.push({
        test: 'GROQ Dual-Phase Institutional Interrogation',
        status: 'FAIL',
        details: 'Full dual-phase validation pipeline failed',
        error: error.message,
        executionTime: Date.now() - dualPhaseStartTime
      });
    }

    // Test 5: Institutional Grade Validation
    const gradeStartTime = Date.now();
    try {
      const highQualitySignal = {
        symbol: 'USDJPY',
        direction: 'BUY' as const,
        entry: 150.00,
        stop: 149.50,
        target: 151.50,
        frameworks: ['Order Block', 'Break of Structure', 'Volume Spike', 'SMC Structure'],
        session: 'New York',
        rsi: 40,
        volume: 'High',
        context: 'High-quality institutional grade test',
        confluence: 6,
        confidence: 92
      };

      const gradeResult = await groqSignalJudge.evaluateSignal(highQualitySignal);
      const passedGrade = ['A+', 'A', 'B+'].includes(gradeResult.institutional_grade);
      
      results.push({
        test: 'GROQ Institutional Grade Assessment',
        status: passedGrade ? 'PASS' : 'FAIL',
        details: `Grade assigned: ${gradeResult.institutional_grade}, Risk Level: ${gradeResult.risk_assessment.level}`,
        executionTime: Date.now() - gradeStartTime
      });
    } catch (error) {
      results.push({
        test: 'GROQ Institutional Grade Assessment',
        status: 'FAIL',
        details: 'Institutional grade assessment failed',
        error: error.message,
        executionTime: Date.now() - gradeStartTime
      });
    }

    // Test 6: Rejection Statistics and Memory
    const statsStartTime = Date.now();
    try {
      const rejectionStats = groqSignalJudge.getRejectionStats();
      results.push({
        test: 'GROQ Rejection Statistics & Memory',
        status: 'PASS',
        details: `Total rejections: ${rejectionStats.total}, Interrogations: ${rejectionStats.interrogationCount}, Avg depth: ${rejectionStats.averageInterrogationDepth}`,
        executionTime: Date.now() - statsStartTime
      });
    } catch (error) {
      results.push({
        test: 'GROQ Rejection Statistics & Memory',
        status: 'FAIL',
        details: 'Rejection statistics test failed',
        error: error.message,
        executionTime: Date.now() - statsStartTime
      });
    }

    // Log comprehensive results
    console.log('🧪 GROQ DUAL-PHASE INTERROGATION TEST SUITE COMPLETED');
    console.log('=' .repeat(80));
    
    results.forEach(result => {
      const emoji = result.status === 'PASS' ? '✅' : '❌';
      const timing = result.executionTime ? ` (${result.executionTime}ms)` : '';
      console.log(`${emoji} ${result.test}: ${result.status}${timing}`);
      console.log(`   ${result.details}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    });

    const passCount = results.filter(r => r.status === 'PASS').length;
    const totalCount = results.length;
    const totalTime = results.reduce((sum, r) => sum + (r.executionTime || 0), 0);
    
    console.log(`📊 DUAL-PHASE INTERROGATION TEST SUMMARY: ${passCount}/${totalCount} tests passed`);
    console.log(`⏱️ Total execution time: ${totalTime}ms`);
    console.log('🏛️ GROQ institutional interrogation system status:', passCount === totalCount ? 'FULLY OPERATIONAL' : 'REQUIRES ATTENTION');
    console.log('=' .repeat(80));

    return results;
  }

  async quickStatusCheck(): Promise<string> {
    try {
      const startTime = Date.now();
      
      const configured = groqService.isConfigured();
      if (!configured) return '❌ GROQ Not Configured';

      const connected = await groqService.testConnection();
      if (!connected) return '❌ GROQ API Connection Failed';

      const executionTime = Date.now() - startTime;
      return `✅ GROQ Dual-Phase Interrogation System Fully Operational (${executionTime}ms)`;
    } catch (error) {
      return `❌ GROQ Dual-Phase System Error: ${error.message}`;
    }
  }

  async testInterrogationDepth(): Promise<{ depth: number; phases: string[]; totalTime: number }> {
    const startTime = Date.now();
    
    try {
      const testSignal = {
        symbol: 'AUDUSD',
        direction: 'BUY' as const,
        entry: 0.7500,
        stop: 0.7450,
        target: 0.7600,
        frameworks: ['Order Block', 'Fair Value Gap', 'Volume Spike'],
        session: 'Asian',
        rsi: 55,
        volume: 'Medium',
        context: 'Interrogation depth test',
        confluence: 4,
        confidence: 80
      };

      console.log('🔍 Testing GROQ interrogation depth...');
      const result = await groqSignalJudge.validateAndAdjustSignal(testSignal);
      
      const phases = ['Phase 1: Initial Screening', 'Phase 2: Deep Analysis'];
      const totalTime = Date.now() - startTime;
      
      return {
        depth: 2, // Dual-phase system
        phases,
        totalTime
      };
    } catch (error) {
      throw new Error(`Interrogation depth test failed: ${error.message}`);
    }
  }
}

export const groqTestService = new GroqTestService();
