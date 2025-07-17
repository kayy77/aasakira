
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
    
    console.log('🧪 STARTING GROQ TEST SUITE...');

    // Test 1: Service Configuration
    const configStartTime = Date.now();
    try {
      const configured = groqService.isConfigured();
      results.push({
        test: 'GROQ Service Configuration',
        status: configured ? 'PASS' : 'FAIL',
        details: configured ? 'Service configured and ready' : 'Service not configured',
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

    // Test 2: API Connection
    const connectionStartTime = Date.now();
    try {
      const connectionTest = await groqService.testConnection();
      results.push({
        test: 'GROQ API Connection',
        status: connectionTest ? 'PASS' : 'FAIL',
        details: connectionTest ? 'Successfully connected to GROQ API' : 'Failed to connect to GROQ API',
        executionTime: Date.now() - connectionStartTime
      });
    } catch (error) {
      results.push({
        test: 'GROQ API Connection',
        status: 'FAIL',
        details: 'API connection test failed',
        error: error.message,
        executionTime: Date.now() - connectionStartTime
      });
    }

    // Test 3: Signal Judge Test
    const judgeStartTime = Date.now();
    try {
      const judgeTest = await groqSignalJudge.testGroqJudge();
      results.push({
        test: 'GROQ Signal Judge',
        status: judgeTest ? 'PASS' : 'FAIL',
        details: judgeTest ? 'Signal evaluation working correctly' : 'Signal evaluation failed',
        executionTime: Date.now() - judgeStartTime
      });
    } catch (error) {
      results.push({
        test: 'GROQ Signal Judge',
        status: 'FAIL',
        details: 'Signal evaluation failed',
        error: error.message,
        executionTime: Date.now() - judgeStartTime
      });
    }

    // Test 4: Full Signal Validation
    const validationStartTime = Date.now();
    try {
      const testSignal = {
        symbol: 'GBPUSD',
        direction: 'SELL' as const,
        entry: 1.2500,
        stop: 1.2550,
        target: 1.2350,
        frameworks: ['Fair Value Gap', 'Liquidity Sweep'],
        session: 'London',
        rsi: 65,
        volume: 'Medium',
        context: 'Full validation test',
        confluence: 4,
        confidence: 85
      };

      const validationResult = await groqSignalJudge.validateAndAdjustSignal(testSignal);
      
      results.push({
        test: 'GROQ Signal Validation',
        status: 'PASS',
        details: validationResult ? 
          `Signal processed successfully: ${validationResult.symbol} ${validationResult.direction}` :
          'Signal rejected by validation (this is normal)',
        executionTime: Date.now() - validationStartTime
      });
    } catch (error) {
      results.push({
        test: 'GROQ Signal Validation',
        status: 'FAIL',
        details: 'Full validation pipeline failed',
        error: error.message,
        executionTime: Date.now() - validationStartTime
      });
    }

    // Log results
    console.log('🧪 GROQ TEST SUITE COMPLETED');
    
    results.forEach(result => {
      const emoji = result.status === 'PASS' ? '✅' : '❌';
      const timing = result.executionTime ? ` (${result.executionTime}ms)` : '';
      console.log(`${emoji} ${result.test}: ${result.status}${timing}`);
      console.log(`   ${result.details}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    const passCount = results.filter(r => r.status === 'PASS').length;
    const totalCount = results.length;
    
    console.log(`📊 TEST SUMMARY: ${passCount}/${totalCount} tests passed`);

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
      return `✅ GROQ System Operational (${executionTime}ms)`;
    } catch (error) {
      return `❌ GROQ System Error: ${error.message}`;
    }
  }
}

export const groqTestService = new GroqTestService();
