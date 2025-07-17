
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TestTube, CheckCircle, XCircle, Loader } from 'lucide-react';
import { groqTestService } from '@/services/groqTestService';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  details: string;
  error?: string;
}

const GroqTestPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [quickStatus, setQuickStatus] = useState<string>('');

  const runQuickTest = async () => {
    setIsRunning(true);
    try {
      const status = await groqTestService.quickStatusCheck();
      setQuickStatus(status);
    } catch (error) {
      setQuickStatus(`❌ Test Failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    try {
      const results = await groqTestService.runFullTest();
      setTestResults(results);
    } catch (error) {
      console.error('Full test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status.includes('✅')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (status.includes('❌')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  const passCount = testResults.filter(r => r.status === 'PASS').length;
  const totalCount = testResults.length;

  return (
    <Card className="bg-gray-900/50 border border-purple-500/30 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">🧠 GROQ AI Test Panel</h3>
          <p className="text-gray-400 text-sm">Verify GROQ integration is working correctly</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Quick Status */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={runQuickTest}
            disabled={isRunning}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Quick Status Check
              </>
            )}
          </Button>
          
          {quickStatus && (
            <Badge className={getStatusColor(quickStatus)}>
              {quickStatus}
            </Badge>
          )}
        </div>

        {/* Full Test */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={runFullTest}
            disabled={isRunning}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isRunning ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Run Full GROQ Test Suite
              </>
            )}
          </Button>
          
          {testResults.length > 0 && (
            <Badge className={passCount === totalCount ? 
              'bg-green-500/20 text-green-400 border-green-500/30' :
              'bg-red-500/20 text-red-400 border-red-500/30'
            }>
              {passCount}/{totalCount} Tests Passed
            </Badge>
          )}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3 mt-6">
            <h4 className="text-white font-semibold">Test Results:</h4>
            {testResults.map((result, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.status === 'PASS' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-white font-medium">{result.test}</span>
                  <Badge className={result.status === 'PASS' ? 
                    'bg-green-500/20 text-green-400 border-green-500/30' :
                    'bg-red-500/20 text-red-400 border-red-500/30'
                  }>
                    {result.status}
                  </Badge>
                </div>
                
                <p className="text-gray-300 text-sm mb-2">{result.details}</p>
                
                {result.error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                    <p className="text-red-300 text-xs font-mono">{result.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
          <h4 className="text-blue-400 font-semibold mb-2">How to Use:</h4>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• <strong>Quick Status:</strong> Fast check if GROQ is ready</li>
            <li>• <strong>Full Test Suite:</strong> Comprehensive validation of all GROQ components</li>
            <li>• <strong>All tests must pass</strong> for signals to be properly validated by AI</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default GroqTestPanel;
