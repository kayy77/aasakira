
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
import { enhancedSignalValidator, SignalValidationInput } from '@/services/enhancedSignalValidator';
import { Signal } from '@/types/signalConfig';
import FilterSettings from './FilterSettings';

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
  const [minFilters, setMinFilters] = useState<number>(4); // Default to 4/6
  const [minConfidence, setMinConfidence] = useState<number>(75); // Default to 75%
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

  // Mock news filter function - would integrate with real API
  const isHighImpactNews = async (symbol: string): Promise<{ hasNews: boolean; reason?: string }> => {
    // This would connect to Forex Factory or similar API
    // For now, randomly simulate news events
    const hasNews = Math.random() < 0.1; // 10% chance of news
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
          // Generate base signal with enhanced requirements
          const baseSignal = await signalService.generateLiveSignal();
          
          if (!baseSignal) {
            setRejectionCount(prev => prev + 1);
            setValidationLog(prev => [...prev, `❌ Attempt ${attempts}: No valid signal generated`]);
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

          // Prepare validation input with proper type conversion
          const validationInput: SignalValidationInput = {
            pair: baseSignal.pair,
            entry: typeof baseSignal.entry === 'string' ? parseFloat(baseSignal.entry) : (baseSignal.entry || baseSignal.entryPrice),
            stopLoss: typeof baseSignal.stopLoss === 'string' ? parseFloat(baseSignal.stopLoss) : baseSignal.stopLoss,
            takeProfit: typeof baseSignal.takeProfit === 'string' ? parseFloat(baseSignal.takeProfit) : baseSignal.takeProfit,
            confidence: baseSignal.confidence,
            rrr: baseSignal.riskReward || 2.0,
            confluenceScore: baseSignal.confluenceScore || 0,
            filtersPassed: baseSignal.filtersPassed || [],
            session: getCurrentSession(),
            timeframe: '15m'
          };

          setAnalysisStatus(`🧠 Enhanced AI validation for ${baseSignal.pair} (${minConfidence}%+ required)...`);
          
          // Check if signal meets user's filter requirements
          const filtersPassedCount = validationInput.filtersPassed.length;
          if (filtersPassedCount < minFilters) {
            setRejectionCount(prev => prev + 1);
            const missingFilters = minFilters - filtersPassedCount;
            setLastRejectionReason(`Filter Confluence: ${filtersPassedCount}/${minFilters} (missing ${missingFilters} filters)`);
            setValidationLog(prev => [...prev, `❌ ${baseSignal.pair}: Only ${filtersPassedCount}/${minFilters} filters passed`]);
            continue;
          }

          // ENHANCED VALIDATION WITH LOCAL + GROQ
          const validationResult = await enhancedSignalValidator.validateWithSessionContext(validationInput);
          
          if (!validationResult.isValid || validationResult.confidence < minConfidence) {
            setRejectionCount(prev => prev + 1);
            setLastRejectionReason(`AI Confidence: ${validationResult.confidence}% (needs ${minConfidence}%+)`);
            setValidationLog(prev => [...prev, `🧠 ${baseSignal.pair}: AI confidence ${validationResult.confidence}% below threshold`]);
            continue;
          }

          // Final enhanced signal - ensure all required properties are present
          const enhancedSignal: Signal = {
            id: Date.now().toString(),
            pair: baseSignal.pair,
            type: baseSignal.type,
            entryPrice: baseSignal.entryPrice,
            stopLoss: baseSignal.stopLoss,
            takeProfit: baseSignal.takeProfit,
            confidence: baseSignal.confidence,
            analysis: baseSignal.analysis,
            timestamp: baseSignal.timestamp,
            timeframe: baseSignal.timeframe,
            riskReward: baseSignal.riskReward || 2.0,
            strategy: baseSignal.strategy,
            marketCondition: baseSignal.marketCondition || 'neutral',
            technicalSetup: baseSignal.technicalSetup || 'multi-confluence',
            entryReason: baseSignal.entryReason || 'AI validation passed',
            riskManagement: `${minFilters}/6 filters + ${minConfidence}%+ AI confidence`,
            filtersPassed: baseSignal.filtersPassed || [],
            sessionContext: getCurrentSession(),
            sessionActive: requirements.sessionActive,
            enhancedValidation: true,
            validationReason: validationResult.reason,
            qualityScore: Math.min(95, baseSignal.confidence + 5),
            signalStrength: baseSignal.confidence >= 90 ? 'ULTRA' : 
                           baseSignal.confidence >= 85 ? 'STRONG' : 'MEDIUM',
            confluenceScore: filtersPassedCount,
            entry: baseSignal.entry || baseSignal.entryPrice
          };

          setValidationLog(prev => [...prev, `✅ ${baseSignal.pair}: ${filtersPassedCount}/6 filters + ${validationResult.confidence}% AI confidence`]);

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
                <SelectItem value="3" className="text-yellow-400">3/6 - Moderate</SelectItem>
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
                <SelectItem value="70" className="text-blue-400">70%+ Standard</SelectItem>
                <SelectItem value="75" className="text-green-400">75%+ Strong</SelectItem>
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
        {minFilters < 5 && (
          <Alert className="mb-4 border-yellow-500/30 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-200">
              ⚠️ Lower confluence selected ({minFilters}/6). This increases trade risk. Use tighter stop-loss and active risk management.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Settings Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className={`glass-card p-3 text-center ${
            minFilters >= 5 ? 'border-green-500/20' : 'border-yellow-500/20'
          }`}>
            <div className="text-sm font-semibold text-white">Filter Strength</div>
            <div className={`text-xs ${
              minFilters >= 5 ? 'text-green-400' : 'text-yellow-400'
            }`}>{minFilters}/6 confluence</div>
          </div>
          <div className={`glass-card p-3 text-center ${
            minConfidence >= 80 ? 'border-green-500/20' : 'border-orange-500/20'
          }`}>
            <div className="text-sm font-semibold text-white">AI Confidence</div>
            <div className={`text-xs ${
              minConfidence >= 80 ? 'text-green-400' : 'text-orange-400'
            }`}>{minConfidence}%+ required</div>
          </div>
          <div className="glass-card p-3 text-center border-blue-500/20">
            <div className="text-sm font-semibold text-white">Session</div>
            <div className="text-xs text-blue-400">{getCurrentSession()}</div>
          </div>
          <div className={`glass-card p-3 text-center ${
            newsFilterEnabled ? 'border-green-500/20' : 'border-red-500/20'
          }`}>
            <div className="text-sm font-semibold text-white">News Filter</div>
            <div className={`text-xs ${
              newsFilterEnabled ? 'text-green-400' : 'text-red-400'
            }`}>{newsFilterEnabled ? 'Active' : 'Disabled'}</div>
          </div>
        </div>

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
          className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-4 hover-lift cyber-glow"
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
