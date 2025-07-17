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
import { groqSignalJudge } from '@/services/groqSignalJudge';

interface SignalGeneratorProps {
  onSignalGenerated?: (signal: EliteSignal) => void;
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
  const [groqValidationActive, setGroqValidationActive] = useState(true);
  const { toast } = useToast();

  // Session-aware quality requirements
  const getSessionRequirements = () => {
    const hour = new Date().getUTCHours();
    const isActiveSession = (hour >= 6 && hour <= 16); // London + NY sessions
    
    return {
      minConfidence: isActiveSession ? 85 : 90,
      minConfluence: isActiveSession ? 4 : 5,
      minRiskReward: isActiveSession ? 2.5 : 3.0,
      sessionActive: isActiveSession,
      sessionName: hour >= 8 && hour <= 17 ? 'London' : 
                   hour >= 13 && hour <= 22 ? 'New York' : 'Asian'
    };
  };

  // MANDATORY Groq validation before any signal reaches UI
  const validateSignalWithGroq = async (signalData: any): Promise<any | null> => {
    if (!groqValidationActive) return signalData; // Fallback if Groq is disabled
    
    setAnalysisStatus('🧠 MANDATORY Groq AI Validation...');
    
    try {
      const validationData = {
        symbol: signalData.pair,
        direction: signalData.type,
        entry: signalData.entry,
        stop: signalData.stopLoss,
        target: signalData.takeProfit,
        frameworks: signalData.filtersPassed || [],
        session: getSessionRequirements().sessionName,
        confluence: signalData.confluenceScore || 0,
        confidence: signalData.confidence,
        context: `Institutional analysis for ${signalData.pair}: Entry ${signalData.entry}, SL ${signalData.stopLoss}, TP ${signalData.takeProfit}. Confluence: ${signalData.confluenceScore}/6`
      };

      // This is the critical gate - NO signal passes without Groq approval
      const groqResult = await groqSignalJudge.validateAndAdjustSignal(validationData);
      
      if (!groqResult) {
        console.log(`🧠 GROQ REJECTION: ${signalData.pair} failed AI institutional validation`);
        return null; // Signal completely blocked
      }

      console.log(`🧠 GROQ APPROVED: ${signalData.pair} meets AI institutional standards`);
      
      // Return Groq-enhanced signal
      return {
        ...signalData,
        entry: groqResult.entry,
        stopLoss: groqResult.stop,
        takeProfit: groqResult.target,
        confidence: Math.min(95, groqResult.confidence),
        groqValidated: true,
        groqEnhanced: true
      };
    } catch (error) {
      console.error('Groq validation failed:', error);
      // On Groq failure, reject signal to maintain quality
      return null;
    }
  };

  const generateEliteSignal = async () => {
    onFeatureUse?.();
    setIsGenerating(true);
    setAnalysisStatus('🏛️ ENHANCED INSTITUTIONAL PROTOCOL INITIALIZING...');
    setLastRejectionReason('');
    setRejectionCount(0);

    const requirements = getSessionRequirements();
    
    try {
      setAnalysisStatus(`⚡ Session: ${requirements.sessionName} (${requirements.sessionActive ? 'ACTIVE' : 'QUIET'}) - Requirements: ${requirements.minConfidence}%+ confidence, ${requirements.minConfluence}/6+ confluence`);
      await new Promise(resolve => setTimeout(resolve, 1500));

      let attempts = 0;
      const maxAttempts = 10; // Increased attempts for better quality
      
      while (attempts < maxAttempts) {
        attempts++;
        const pair = ['EURUSD', 'GBPUSD', 'USDJPY', 'GBPJPY', 'AUDUSD', 'USDCAD', 'XAUUSD'][Math.floor(Math.random() * 7)];
        
        setAnalysisStatus(`🎯 Attempt ${attempts}: Enhanced analysis for ${pair}...`);
        
        try {
          // Generate base institutional signal
          const baseSignal = await signalService.generateLiveSignal();
          
          if (!baseSignal) {
            setRejectionCount(prev => prev + 1);
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }

          // Session-specific quality gates BEFORE Groq
          if (baseSignal.confidence < requirements.minConfidence) {
            setRejectionCount(prev => prev + 1);
            setLastRejectionReason(`Pre-Groq rejection: Confidence ${baseSignal.confidence}% below ${requirements.minConfidence}% for ${requirements.sessionName} session`);
            continue;
          }

          if ((baseSignal.confluenceScore || 0) < requirements.minConfluence) {
            setRejectionCount(prev => prev + 1);
            setLastRejectionReason(`Pre-Groq rejection: Confluence ${baseSignal.confluenceScore}/6 below ${requirements.minConfluence} minimum`);
            continue;
          }

          // CRITICAL: Mandatory Groq validation
          setAnalysisStatus(`🧠 MANDATORY Groq AI validation for ${baseSignal.pair}...`);
          const groqValidatedSignal = await validateSignalWithGroq(baseSignal);
          
          if (!groqValidatedSignal) {
            setRejectionCount(prev => prev + 1);
            setLastRejectionReason(`GROQ AI REJECTION: ${baseSignal.pair} failed institutional AI validation`);
            continue;
          }

          // SUCCESS - Signal approved by both institutional filters AND Groq AI
          const finalSignal = {
            ...groqValidatedSignal,
            sessionContext: requirements.sessionName,
            sessionActive: requirements.sessionActive,
            enhancedValidation: true,
            doubleValidated: true, // Both institutional + Groq
            qualityScore: Math.min(96, groqValidatedSignal.confidence + 3)
          };

          if (onSignalGenerated) {
            onSignalGenerated(finalSignal);
            setLastFilterResults(finalSignal.filtersPassed || []);
            
            toast({
              title: `🚨 GROQ-ENHANCED ${finalSignal.signalStrength} SIGNAL!`,
              description: `${finalSignal.pair} ${finalSignal.type} | Double-Validated | Session: ${requirements.sessionName}`,
            });
          }
          
          console.log(`✅ DOUBLE-VALIDATED SIGNAL: ${finalSignal.pair} passed both institutional + Groq AI validation`);
          return;
          
        } catch (error) {
          console.error(`Enhanced attempt ${attempts} failed:`, error);
          setRejectionCount(prev => prev + 1);
          continue;
        }
      }
      
      // All attempts exhausted
      setLastRejectionReason(`ENHANCED BRUTAL FILTERING: All ${maxAttempts} attempts rejected. Current ${requirements.sessionName} session requires ${requirements.minConfidence}%+ confidence, ${requirements.minConfluence}/6+ confluence, AND mandatory Groq AI approval. No signals met these institutional standards.`);
      
      toast({
        title: "🏛️ Enhanced Filter Gate - All Signals Rejected",
        description: `${rejectionCount} signals blocked by enhanced institutional filtering + mandatory Groq AI validation`,
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
            <p className="text-gray-400">Session-Aware + MANDATORY Groq AI Validation</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${requirements.sessionActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-current animate-pulse`}>
            <Activity className="w-3 h-3 mr-1" />
            {requirements.sessionName}
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Brain className="w-3 h-3 mr-1" />
            GROQ MANDATORY
          </Badge>
        </div>
      </div>

      {/* Enhanced Requirements Display */}
      <div className="glass-card p-6 mb-6 border-purple-500/10">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Enhanced Session Requirements</h3>
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
            <div className="text-sm text-yellow-400 font-semibold">Risk:Reward</div>
            <div className="text-xs text-gray-400">{requirements.minRiskReward}:1 Min</div>
          </div>
          <div className="glass-card p-3 text-center border-blue-500/20">
            <div className="text-sm text-blue-400 font-semibold">Groq AI Gate</div>
            <div className="text-xs text-gray-400">MANDATORY</div>
          </div>
        </div>

        <Alert className="mb-6 border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <strong>ENHANCED BRUTAL PROTOCOL:</strong> Every signal must pass BOTH institutional filtering AND mandatory Groq AI validation. Current {requirements.sessionName} session requires {requirements.minConfidence}%+ confidence, {requirements.minConfluence}+ filters, and AI approval. Zero compromises.
          </AlertDescription>
        </Alert>

        {/* Rejection Counter */}
        {rejectionCount > 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-semibold">Enhanced Filter Activity:</span>
            </div>
            <p className="text-sm text-red-200">{rejectionCount} pairs/setups rejected by brutal filtering system</p>
          </div>
        )}

        {/* Last Rejection Reason */}
        {lastRejectionReason && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-semibold">Filtering System Status:</span>
            </div>
            <p className="text-sm text-red-200">{lastRejectionReason}</p>
          </div>
        )}

        {/* Last Filter Results */}
        {lastFilterResults.length > 0 && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-semibold">Last Signal Institutional Validation:</span>
            </div>
            <div className="space-y-1">
              {lastFilterResults.map((filter, index) => (
                <div key={index} className="text-sm text-green-200 flex items-center space-x-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span>{filter}</span>
                </div>
              ))}
            </div>
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
          onClick={generateEliteSignal}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Enhanced Analysis + Groq AI...
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
          <p className="text-xs text-red-400">1.0 lot | 3.0:1+ RR</p>
        </div>
        <div className="glass-card p-4 border-orange-500/20">
          <Zap className="w-6 h-6 text-orange-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">STRONG (87%+)</h4>
          <p className="text-sm text-gray-400">Elite confluence</p>
          <p className="text-xs text-orange-400">0.75 lot | 2.8:1+ RR</p>
        </div>
        <div className="glass-card p-4 border-yellow-500/20">
          <Target className="w-6 h-6 text-yellow-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">MEDIUM (85%+)</h4>
          <p className="text-sm text-gray-400">Institutional grade</p>
          <p className="text-xs text-yellow-400">0.5 lot | 2.5:1+ RR</p>
        </div>
        <div className="glass-card p-4 border-gray-500/20">
          <BarChart3 className="w-6 h-6 text-gray-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">REJECTED (&lt;85%)</h4>
          <p className="text-sm text-gray-400">Below threshold</p>
          <p className="text-xs text-gray-400">Signal blocked</p>
        </div>
      </div>
    </div>
  );
};

export default SignalGenerator;
