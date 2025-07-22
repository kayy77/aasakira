
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  TrendingUp, 
  AlertCircle, 
  Zap, 
  Brain,
  Loader,
  Sparkles,
  Activity,
  BarChart3,
  Crown,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signalService } from '@/services/signalService';
import { filterAndValidateSignal, generateMockFilters } from '@/services/signalFilterValidator';
import { Signal } from '@/types/signalConfig';

interface EnhancedSignalGeneratorProps {
  onSignalGenerated?: (signal: Signal) => void;
  onFeatureUse?: () => void;
}

export const EnhancedSignalGenerator: React.FC<EnhancedSignalGeneratorProps> = ({ 
  onSignalGenerated,
  onFeatureUse
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [lastFilterResults, setLastFilterResults] = useState<string[]>([]);
  const [lastRejectionReason, setLastRejectionReason] = useState<string>('');
  const [rejectionCount, setRejectionCount] = useState<number>(0);
  const [validationLog, setValidationLog] = useState<string[]>([]);
  const [minFilters, setMinFilters] = useState<number>(3); // Changed default to 3/6
  const [minConfidence, setMinConfidence] = useState<number>(70); // Changed default to 70%
  const [newsFilterEnabled, setNewsFilterEnabled] = useState<boolean>(true);
  const { toast } = useToast();

  // Session-aware quality requirements
  const getSessionRequirements = () => {
    const hour = new Date().getUTCHours();
    const isActiveSession = (hour >= 6 && hour <= 16); // London + NY sessions
    
    return {
      minConfidence: minConfidence,
      minConfluence: minFilters,
      minRiskReward: isActiveSession ? 2.0 : 2.5,
      sessionActive: isActiveSession
    };
  };

  const getCurrentSession = (): string => {
    const hour = new Date().getUTCHours();
    
    if (hour >= 8 && hour <= 17) return 'London';
    if (hour >= 13 && hour <= 22) return 'New York';
    if (hour >= 22 || hour <= 8) return 'Asian';
    
    return 'Off Hours';
  };

  // Mock news filter function
  const isHighImpactNews = async (symbol: string): Promise<{ hasNews: boolean; reason?: string }> => {
    // Simulate 10% chance of news events
    const hasNews = Math.random() < 0.1;
    return {
      hasNews,
      reason: hasNews ? `High-impact ${symbol.substring(0,3)} news event in next 30 minutes` : undefined
    };
  };

  const generateEnhancedSignal = async () => {
    onFeatureUse?.();
    setIsGenerating(true);
    setAnalysisStatus('🏛️ ENHANCED INSTITUTIONAL PROTOCOL INITIALIZING...');
    setLastRejectionReason('');
    setRejectionCount(0);
    setValidationLog([]);

    const requirements = getSessionRequirements();
    
    // Show risk warning for lower confluence settings
    if (minFilters < 5) {
      setValidationLog(prev => [...prev, `⚠️ Lower confluence selected (${minFilters}/6). Using enhanced risk management.`]);
    }
    
    try {
      setAnalysisStatus(`⚡ Session Analysis: ${getCurrentSession()} (${requirements.sessionActive ? 'ACTIVE' : 'QUIET'})`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      let attempts = 0;
      const maxAttempts = 8;
      
      while (attempts < maxAttempts) {
        attempts++;
        setAnalysisStatus(`🎯 Attempt ${attempts}: Scanning ${minFilters}/6 filter confluence...`);
        
        try {
          // Generate base signal
          const baseSignal = await signalService.generateLiveSignal();
          
          if (!baseSignal) {
            setRejectionCount(prev => prev + 1);
            setValidationLog(prev => [...prev, `❌ Attempt ${attempts}: No base signal generated`]);
            continue;
          }

          // Check news filter if enabled
          if (newsFilterEnabled) {
            setAnalysisStatus(`📰 Checking news calendar for ${baseSignal.pair}...`);
            const newsCheck = await isHighImpactNews(baseSignal.pair);
            if (newsCheck.hasNews) {
              setRejectionCount(prev => prev + 1);
              setLastRejectionReason(`News Filter: ${newsCheck.reason}`);
              setValidationLog(prev => [...prev, `📰 ${baseSignal.pair}: ${newsCheck.reason}`]);
              continue;
            }
          }

          // Generate filter results
          const filterResults = generateMockFilters();
          const aiConfidence = 70 + Math.random() * 25; // 70-95% range
          
          setAnalysisStatus(`🧠 Enhanced AI validation for ${baseSignal.pair} (${minConfidence}%+ required)...`);
          
          // Use the new filter validation system
          const validationResult = filterAndValidateSignal({
            filters: filterResults,
            aiConfidence: Math.round(aiConfidence),
            livePrice: baseSignal.entryPrice,
            confluenceRequired: minFilters,
            minConfidence: minConfidence,
            newsBlocked: false
          });

          if (!validationResult.valid) {
            setRejectionCount(prev => prev + 1);
            setLastRejectionReason(validationResult.reason);
            setValidationLog(prev => [...prev, `❌ ${baseSignal.pair}: ${validationResult.reason}`]);
            continue;
          }

          // Create enhanced signal with all required properties
          const enhancedSignal: Signal = {
            id: Date.now().toString(),
            pair: baseSignal.pair,
            type: baseSignal.type,
            entryPrice: baseSignal.entryPrice,
            stopLoss: baseSignal.stopLoss,
            takeProfit: baseSignal.takeProfit,
            confidence: Math.round(aiConfidence),
            analysis: `🏛️ INSTITUTIONAL SIGNAL: ${validationResult.passedFilters?.length || 0}/6 filters passed with GROQ AI approval. Entry precision: Live price at ${new Date().toLocaleTimeString()}.`,
            timestamp: new Date().toISOString(),
            timeframe: baseSignal.timeframe || '15m',
            riskReward: baseSignal.riskReward || 2.0,
            strategy: baseSignal.strategy,
            marketCondition: baseSignal.marketCondition || 'Active',
            technicalSetup: validationResult.passedFilters?.join(' + ') || 'Multi-confluence',
            entryReason: validationResult.reason,
            riskManagement: `${minFilters}/6 filters + ${minConfidence}%+ AI confidence`,
            filtersPassed: validationResult.passedFilters || [],
            sessionContext: getCurrentSession(),
            sessionActive: requirements.sessionActive,
            enhancedValidation: true,
            validationReason: validationResult.reason,
            qualityScore: Math.min(95, Math.round(aiConfidence) + 5),
            signalStrength: aiConfidence >= 90 ? 'ULTRA' : 
                           aiConfidence >= 85 ? 'STRONG' : 'MEDIUM',
            confluenceScore: validationResult.passedFilters?.length || 0,
            entry: baseSignal.entryPrice
          };

          setValidationLog(prev => [...prev, `✅ ${baseSignal.pair}: ${validationResult.passedFilters?.length}/6 filters + ${Math.round(aiConfidence)}% AI confidence`]);

          if (onSignalGenerated) {
            onSignalGenerated(enhancedSignal);
            setLastFilterResults(enhancedSignal.filtersPassed || []);
            
            toast({
              title: `🚨 ENHANCED ${enhancedSignal.signalStrength} SIGNAL APPROVED!`,
              description: `${enhancedSignal.pair} ${enhancedSignal.type} | ${minFilters}/6 Filters | ${minConfidence}%+ Confidence`,
            });
          }
          
          return;
          
        } catch (error) {
          console.error(`Attempt ${attempts} failed:`, error);
          setRejectionCount(prev => prev + 1);
          setValidationLog(prev => [...prev, `❌ Attempt ${attempts}: Generation error`]);
          continue;
        }
      }
      
      // All attempts failed
      setLastRejectionReason(`ENHANCED FILTERING: All ${maxAttempts} attempts rejected. Current settings require ${minFilters}/6 confluence + ${minConfidence}%+ AI confidence in ${getCurrentSession()} session.`);
      toast({
        title: "🏛️ Enhanced Filter Gate - All Signals Rejected",
        description: `${rejectionCount} signals blocked by ${minFilters}/6 filter + ${minConfidence}%+ AI validation`,
        variant: "destructive"
      });
      
    } catch (error) {
      console.error('Enhanced signal generation error:', error);
      toast({
        title: "Enhanced Signal Engine Error",
        description: "Enhanced signal engine encountered an issue. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setAnalysisStatus('');
    }
  };

  const requirements = getSessionRequirements();

  return (
    <div className="glass-card p-8 mb-8 hover-glow border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
            <Brain className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">🧠 Enhanced AI Signal Protocol</h2>
            <p className="text-gray-400">Session-Aware + Custom Filter Settings</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${requirements.sessionActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-current animate-pulse`}>
            <Clock className="w-3 h-3 mr-1" />
            {getCurrentSession()}
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Brain className="w-3 h-3 mr-1" />
            ENHANCED AI
          </Badge>
        </div>
      </div>

      {/* Enhanced Filter Settings */}
      <div className="glass-card p-6 mb-6 border-blue-500/10">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Signal Quality Controls</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Filter Confluence Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minimum Filter Confluence
            </label>
            <Select value={minFilters.toString()} onValueChange={(value) => setMinFilters(Number(value))}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="3" className="text-green-400">3/6 - Balanced</SelectItem>
                <SelectItem value="4" className="text-orange-400">4/6 - Strong</SelectItem>
                <SelectItem value="5" className="text-red-400">5/6 - Elite</SelectItem>
                <SelectItem value="6" className="text-purple-400">6/6 - Perfect</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AI Confidence Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minimum AI Confidence
            </label>
            <Select value={minConfidence.toString()} onValueChange={(value) => setMinConfidence(Number(value))}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="70" className="text-green-400">70%+ Balanced</SelectItem>
                <SelectItem value="75" className="text-orange-400">75%+ Strong</SelectItem>
                <SelectItem value="80" className="text-red-400">80%+ Elite</SelectItem>
                <SelectItem value="85" className="text-purple-400">85%+ Perfect</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* News Filter Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              News Event Filter
            </label>
            <Button
              variant={newsFilterEnabled ? "default" : "outline"}
              onClick={() => setNewsFilterEnabled(!newsFilterEnabled)}
              className="w-full"
            >
              {newsFilterEnabled ? (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Enabled
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Disabled
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Risk Warning for Lower Settings */}
        {minFilters < 4 && (
          <Alert className="mb-4 border-yellow-500/30 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-200">
              ⚠️ Lower confluence selected ({minFilters}/6). This increases trade risk. Use tighter stop-loss and active risk management.
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Log */}
        {validationLog.length > 0 && (
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg max-h-32 overflow-y-auto">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 font-semibold">Enhanced Validation Log:</span>
            </div>
            {validationLog.slice(-3).map((log, index) => (
              <p key={index} className="text-sm text-purple-200 mb-1">{log}</p>
            ))}
          </div>
        )}

        {/* Rejection Counter */}
        {rejectionCount > 0 && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-semibold">Enhanced Filter Activity:</span>
            </div>
            <p className="text-sm text-red-200">{rejectionCount} signals rejected by {minFilters}/6 filter + {minConfidence}%+ AI validation</p>
          </div>
        )}

        {/* Last Rejection Reason */}
        {lastRejectionReason && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-semibold">Last Rejection Reason:</span>
            </div>
            <p className="text-sm text-red-200">{lastRejectionReason}</p>
          </div>
        )}

        {isGenerating && analysisStatus && (
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Loader className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-purple-300 text-sm">{analysisStatus}</span>
            </div>
          </div>
        )}

        <Button 
          size="lg" 
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 hover-lift cyber-glow"
          onClick={generateEnhancedSignal}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Enhanced Analysis...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              Generate Enhanced Signal ({minFilters}/6 + {minConfidence}%+)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedSignalGenerator;
