
import { groqService } from './groqService';
import { groqSignalJudge } from './groqSignalJudge';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  details: string;
  error?: string;
}

class GroqTestService {
  async runFullTest(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    console.log('🧪 STARTING COMPREHENSIVE GROQ TEST SUITE...');
    console.log('=' .repeat(60));

    // Test 1: Service Configuration
    try {
      const configured = groqService.isConfigured();
      results.push({
        test: 'GROQ Service Configuration',
        status: configured ? 'PASS' : 'FAIL',
        details: configured ? 'API key configured and service ready' : 'Service not properly configured'
      });
    } catch (error) {
      results.push({
        test: 'GROQ Service Configuration',
        status: 'FAIL',
        details: 'Configuration check failed',
        error: error.message
      });
    }

    // Test 2: API Connection
    try {
      const connectionTest = await groqService.testConnection();
      results.push({
        test: 'GROQ API Connection',
        status: connectionTest ? 'PASS' : 'FAIL',
        details: connectionTest ? 'Successfully connected to GROQ API' : 'Failed to connect to GROQ API'
      });
    } catch (error) {
      results.push({
        test: 'GROQ API Connection',
        status: 'FAIL',
        details: 'API connection test failed',
        error: error.message
      });
    }

    // Test 3: Signal Judge Functionality
    try {
      const judgeTest = await groqSignalJudge.testGroqJudge();
      results.push({
        test: 'GROQ Signal Judge',
        status: judgeTest ? 'PASS' : 'FAIL',
        details: judgeTest ? 'Signal evaluation working correctly' : 'Signal evaluation failed'
      });
    } catch (error) {
      results.push({
        test: 'GROQ Signal Judge',
        status: 'FAIL',
        details: 'Signal judge test failed',
        error: error.message
      });
    }

    // Test 4: End-to-End Signal Validation
    try {
      const testSignal = {
        symbol: 'GBPUSD',
        direction: 'SELL' as const,
        entry: 1.2500,
        stop: 1.2550,
        target: 1.2400,
        frameworks: ['Fair Value Gap', 'Liquidity Sweep'],
        session: 'London',
        rsi: 65,
        volume: 'Medium',
        context: 'End-to-end test signal',
        confluence: 3,
        confidence: 78
      };

      const validationResult = await groqSignalJudge.validateAndAdjustSignal(testSignal);
      
      results.push({
        test: 'End-to-End Signal Validation',
        status: 'PASS',
        details: validationResult ? 
          `Signal processed: ${validationResult.symbol} ${validationResult.direction} with ${validationResult.confidence}% confidence` :
          'Signal was rejected by GROQ institutional standards'
      });
    } catch (error) {
      results.push({
        test: 'End-to-End Signal Validation',
        status: 'FAIL',
        details: 'Full signal validation pipeline failed',
        error: error.message
      });
    }

    // Log results
    console.log('🧪 GROQ TEST SUITE COMPLETED');
    console.log('=' .repeat(60));
    
    results.forEach(result => {
      const emoji = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${emoji} ${result.test}: ${result.status}`);
      console.log(`   ${result.details}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    });

    const passCount = results.filter(r => r.status === 'PASS').length;
    const totalCount = results.length;
    
    console.log(`📊 TEST SUMMARY: ${passCount}/${totalCount} tests passed`);
    console.log('=' .repeat(60));

    return results;
  }

  async quickStatusCheck(): Promise<string> {
    try {
      const configured = groqService.isConfigured();
      if (!configured) return '❌ GROQ Not Configured';

      const connected = await groqService.testConnection();
      if (!connected) return '❌ GROQ API Connection Failed';

      return '✅ GROQ Fully Operational';
    } catch (error) {
      return `❌ GROQ Error: ${error.message}`;
    }
  }
}

export const groqTestService = new GroqTestService();
