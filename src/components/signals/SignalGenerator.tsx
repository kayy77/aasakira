
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { eliteSignalEngine, EliteSignal } from '@/services/eliteSignalEngine';
import { trueLivePriceService } from '@/services/trueLivePriceService';
import { signalService } from '@/services/signalService';
import { enhancedSignalValidator, SignalValidationInput } from '@/services/enhancedSignalValidator';
import { Signal } from '@/types/signalConfig';

interface SignalGeneratorProps {
  onSignalGenerated?: (signal: Signal) => void;
  onFeatureUse?: () => void;
}

export const SignalGenerator: React.FC<SignalGeneratorProps> = ({ 
  onSignalGenerated,
  onFeatureUse
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [lastFilterResults, setLastFilterResults] = useState<string[]>([]);
  const [lastRejectionReason, setLastRejectionReason] = useState<string>('');
  const [rejectionCount, setRejectionCount] = useState<number>(0);
  const [validationLog, setValidationLog] = useState<string[]>([]);
  const { toast } = useToast();

  // Session-aware quality requirements
  const getSessionRequirements = () => {
    const hour = new Date().getUTCHours();
    const isActiveSession = (hour >= 6 && hour <= 16); // London + NY sessions
    
    return {
      minConfidence: isActiveSession ? 75 : 80,
      minConfluence: isActiveSession ? 5 : 6,
      minRiskReward: isActiveSession ? 2.0 : 2.5,
      sessionActive: isActiveSession,
      sessionName: hour >= 8 && hour <= 17 ? 'London' : 
                   hour >= 13 && hour <= 22 ? 'New York' : 'Asian'
    };
  };

  const generateEnhancedSignal = async () => {
    onFeatureUse?.();
    setIsGenerating(true);
    setAnalysisStatus('🏛️ ENHANCED INSTITUTIONAL VALIDATION PROTOCOL INITIALIZING...');
    setLastRejectionReason('');
    setRejectionCount(0);
    setValidationLog([]);

    const requirements = getSessionRequirements();
    
    try {
      setAnalysisStatus(`⚡ Session: ${requirements.sessionName} (${requirements.sessionActive ? 'ACTIVE' : 'QUIET'}) - Enhanced validation required`);
      await new Promise(resolve => setTimeout(resolve, 1500));

      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        attempts++;
        setAnalysisStatus(`🎯 Attempt ${attempts}: Enhanced institutional analysis...`);
        
        try {
          // Generate base signal
          const baseSignal = await signalService.generateLiveSignal();
          
          if (!baseSignal) {
            setRejectionCount(prev => prev + 1);
            continue;
          }

          // Prepare validation input with proper type conversion
          const validationInput: SignalValidationInput = {
            pair: baseSignal.pair,
            entry: typeof baseSignal.entry === 'string' ? parseFloat(baseSignal.entry) : baseSignal.entry,
            stopLoss: typeof baseSignal.stopLoss === 'string' ? parseFloat(baseSignal.stopLoss) : baseSignal.stopLoss,
            takeProfit: typeof baseSignal.takeProfit === 'string' ? parseFloat(baseSignal.takeProfit) : baseSignal.takeProfit,
            confidence: baseSignal.confidence,
            rrr: (baseSignal.riskReward || 2.0) as number,
            confluenceScore: baseSignal.confluenceScore || 0,
            filtersPassed: baseSignal.filtersPassed || [],
            session: requirements.sessionName,
            timeframe: '15m'
          };

          setAnalysisStatus(`🧠 Enhanced AI validation for ${baseSignal.pair}...`);
          
          // ENHANCED VALIDATION WITH LOCAL + GROQ
          const validationResult = await enhancedSignalValidator.validateWithSessionContext(validationInput);
          
          if (!validationResult.isValid) {
            setRejectionCount(prev => prev + 1);
            setLastRejectionReason(validationResult.reason);
            setValidationLog(prev => [...prev, `❌ ${baseSignal.pair}: ${validationResult.reason}`]);
            continue;
          }

          // SUCCESS - Signal approved by enhanced validation
          const enhancedSignal: Signal = {
            ...baseSignal,
            sessionContext: requirements.sessionName,
            sessionActive: requirements.sessionActive,
            enhancedValidation: true,
            validationReason: validationResult.reason,
            qualityScore: Math.min(96, baseSignal.confidence + 5),
            signalStrength: baseSignal.confidence >= 90 ? 'ULTRA' : 
                           baseSignal.confidence >= 85 ? 'STRONG' : 'MEDIUM',
            riskReward: (baseSignal.riskReward || 2.0) as number
          };

          setValidationLog(prev => [...prev, `✅ ${baseSignal.pair}: ${validationResult.reason}`]);

          if (onSignalGenerated) {
            onSignalGenerated(enhancedSignal);
            setLastFilterResults(enhancedSignal.filtersPassed || []);
            
            toast({
              title: `🚨 ENHANCED ${enhancedSignal.signalStrength} SIGNAL APPROVED!`,
              description: `${enhancedSignal.pair} ${enhancedSignal.type} | AI Validated | Session: ${requirements.sessionName}`,
            });
          }
          
          console.log(`✅ ENHANCED VALIDATED SIGNAL: ${enhancedSignal.pair} passed rigorous validation`);
          return;
          
        } catch (error) {
          console.error(`Enhanced attempt ${attempts} failed:`, error);
          setRejectionCount(prev => prev + 1);
          continue;
        }
      }
      
      // All attempts exhausted
      setLastRejectionReason(`ENHANCED VALIDATION: All ${maxAttempts} attempts rejected. Current ${requirements.sessionName} session requires enhanced institutional validation with BOS+FVG, ${requirements.minConfidence}%+ confidence, ${requirements.minConfluence}/6+ confluence, and AI approval.`);
      
      toast({
        title: "🏛️ Enhanced Validation Gate - All Signals Rejected",
        description: `${rejectionCount} signals blocked by enhanced institutional validation`,
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
            <Crown className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">🧠 Enhanced Institutional Signal Protocol</h2>
            <p className="text-gray-400">Local + AI Validation | BOS+FVG Required</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${requirements.sessionActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-current animate-pulse`}>
            <Activity className="w-3 h-3 mr-1" />
            {requirements.sessionName}
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Brain className="w-3 h-3 mr-1" />
            AI ENHANCED
          </Badge>
        </div>
      </div>

      {/* Enhanced Requirements Display */}
      <div className="glass-card p-6 mb-6 border-purple-500/10">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Enhanced Validation Requirements</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="glass-card p-3 text-center border-red-500/20">
            <div className="text-sm text-red-400 font-semibold">Min Confidence</div>
            <div className="text-xs text-gray-400">{requirements.minConfidence}% Required</div>
          </div>
          <div className="glass-card p-3 text-center border-orange-500/20">
            <div className="text-sm text-orange-400 font-semibold">Min Confluence</div>
            <div className="text-xs text-gray-400">{requirements.minConfluence}/6 Filters</div>
          </div>
          <div className="glass-card p-3 text-center border-yellow-500/20">
            <div className="text-sm text-yellow-400 font-semibold">Required Filters</div>
            <div className="text-xs text-gray-400">BOS + FVG</div>
          </div>
          <div className="glass-card p-3 text-center border-blue-500/20">
            <div className="text-sm text-blue-400 font-semibold">AI Validation</div>
            <div className="text-xs text-gray-400">MANDATORY</div>
          </div>
        </div>

        <Alert className="mb-6 border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <strong>ENHANCED VALIDATION:</strong> Every signal must pass local validation (75%+ confidence, 2:1+ R:R, BOS+FVG required) AND AI institutional reasoning. Current {requirements.sessionName} session requires {requirements.minConfidence}%+ confidence and {requirements.minConfluence}+ filters.
          </AlertDescription>
        </Alert>

        {/* Validation Log */}
        {validationLog.length > 0 && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg max-h-32 overflow-y-auto">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 font-semibold">Enhanced Validation Log:</span>
            </div>
            {validationLog.slice(-5).map((log, index) => (
              <p key={index} className="text-sm text-blue-200 mb-1">{log}</p>
            ))}
          </div>
        )}

        {/* Rejection Counter */}
        {rejectionCount > 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-semibold">Enhanced Filter Activity:</span>
            </div>
            <p className="text-sm text-red-200">{rejectionCount} signals rejected by enhanced validation system</p>
          </div>
        )}

        {/* Last Rejection Reason */}
        {lastRejectionReason && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-semibold">Enhanced Validation Status:</span>
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
              Enhanced Analysis + AI...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              Generate Enhanced Signal
            </>
          )}
        </Button>
      </div>

      {/* Enhanced Signal Strength Guide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-red-500/20">
          <Crown className="w-6 h-6 text-red-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">ULTRA (90%+)</h4>
          <p className="text-sm text-gray-400">Perfect setup</p>
          <p className="text-xs text-red-400">AI + BOS + FVG</p>
        </div>
        <div className="glass-card p-4 border-orange-500/20">
          <Zap className="w-6 h-6 text-orange-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">STRONG (85%+)</h4>
          <p className="text-sm text-gray-400">Elite confluence</p>
          <p className="text-xs text-orange-400">AI + Structure</p>
        </div>
        <div className="glass-card p-4 border-yellow-500/20">
          <Target className="w-6 h-6 text-yellow-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">MEDIUM (75%+)</h4>
          <p className="text-sm text-gray-400">Institutional grade</p>
          <p className="text-xs text-yellow-400">Local validated</p>
        </div>
        <div className="glass-card p-4 border-gray-500/20">
          <BarChart3 className="w-6 h-6 text-gray-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">REJECTED (&lt;75%)</h4>
          <p className="text-sm text-gray-400">Below threshold</p>
          <p className="text-xs text-gray-400">Signal blocked</p>
        </div>
      </div>
    </div>
  );
};

export default SignalGenerator;
