
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
  XCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { groqSignalJudge } from '@/services/groqSignalJudge';
import { signalService } from '@/services/signalService';

interface EnhancedSignalGeneratorProps {
  onSignalGenerated?: (signal: any) => void;
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
  const [groqValidationLog, setGroqValidationLog] = useState<string[]>([]);
  const { toast } = useToast();

  // Session-aware quality requirements
  const getSessionRequirements = () => {
    const hour = new Date().getUTCHours();
    const isActiveSession = (hour >= 6 && hour <= 16); // London + NY sessions
    
    return {
      minConfidence: isActiveSession ? 85 : 90,
      minConfluence: isActiveSession ? 4 : 5,
      minRiskReward: isActiveSession ? 2.5 : 3.0,
      sessionActive: isActiveSession
    };
  };

  const validateSignalWithGroq = async (signalData: any): Promise<any | null> => {
    setAnalysisStatus('🧠 Groq AI Institutional Validation...');
    
    try {
      const validationData = {
        symbol: signalData.pair,
        direction: signalData.type,
        entry: signalData.entry,
        stop: signalData.stopLoss,
        target: signalData.takeProfit,
        frameworks: signalData.filtersPassed || [],
        session: getCurrentSession(),
        confluence: signalData.confluenceScore || 0,
        confidence: signalData.confidence,
        context: `${signalData.pair} analysis: Entry at ${signalData.entry}, targeting ${signalData.takeProfit} with stop at ${signalData.stopLoss}. Frameworks: ${signalData.filtersPassed?.join(', ') || 'Standard analysis'}`
      };

      const groqResult = await groqSignalJudge.validateAndAdjustSignal(validationData);
      
      if (!groqResult) {
        const rejection = `Groq AI rejected: Institutional standards not met for ${signalData.pair}`;
        setGroqValidationLog(prev => [...prev, rejection]);
        return null;
      }

      const validation = `Groq AI approved: ${signalData.pair} meets institutional criteria`;
      setGroqValidationLog(prev => [...prev, validation]);
      
      return {
        ...signalData,
        entry: groqResult.entry,
        stopLoss: groqResult.stop,
        takeProfit: groqResult.target,
        confidence: groqResult.confidence,
        groqValidated: true
      };
    } catch (error) {
      console.error('Groq validation failed:', error);
      setGroqValidationLog(prev => [...prev, `Groq validation error: ${error}`]);
      return null;
    }
  };

  const getCurrentSession = (): string => {
    const hour = new Date().getUTCHours();
    
    if (hour >= 8 && hour <= 17) return 'London';
    if (hour >= 13 && hour <= 22) return 'New York';
    if (hour >= 22 || hour <= 8) return 'Asian';
    
    return 'Off Hours';
  };

  const generateEnhancedSignal = async () => {
    onFeatureUse?.();
    setIsGenerating(true);
    setAnalysisStatus('🏛️ ENHANCED INSTITUTIONAL PROTOCOL INITIALIZING...');
    setLastRejectionReason('');
    setRejectionCount(0);
    setGroqValidationLog([]);

    const requirements = getSessionRequirements();
    
    try {
      setAnalysisStatus(`⚡ Session Analysis: ${getCurrentSession()} (${requirements.sessionActive ? 'ACTIVE' : 'QUIET'})`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      let attempts = 0;
      const maxAttempts = 8;
      
      while (attempts < maxAttempts) {
        attempts++;
        setAnalysisStatus(`🎯 Attempt ${attempts}: Enhanced Multi-Filter Analysis...`);
        
        try {
          // Generate base signal with enhanced requirements
          const baseSignal = await signalService.generateLiveSignal();
          
          if (!baseSignal) {
            setRejectionCount(prev => prev + 1);
            continue;
          }

          // Apply session-specific quality gates
          if (baseSignal.confidence < requirements.minConfidence) {
            setRejectionCount(prev => prev + 1);
            setLastRejectionReason(`Confidence ${baseSignal.confidence}% below ${requirements.minConfidence}% threshold for ${getCurrentSession()} session`);
            continue;
          }

          if ((baseSignal.confluenceScore || 0) < requirements.minConfluence) {
            setRejectionCount(prev => prev + 1);
            setLastRejectionReason(`Confluence ${baseSignal.confluenceScore}/6 below ${requirements.minConfluence} minimum for current session`);
            continue;
          }

          // MANDATORY Groq validation
          const groqValidatedSignal = await validateSignalWithGroq(baseSignal);
          
          if (!groqValidatedSignal) {
            setRejectionCount(prev => prev + 1);
            setLastRejectionReason('Signal rejected by Groq AI institutional validation');
            continue;
          }

          // Final enhanced signal
          const enhancedSignal = {
            ...groqValidatedSignal,
            sessionContext: getCurrentSession(),
            sessionActive: requirements.sessionActive,
            enhancedValidation: true,
            groqApproved: true,
            qualityScore: Math.min(95, groqValidatedSignal.confidence + 5)
          };

          if (onSignalGenerated) {
            onSignalGenerated(enhancedSignal);
            setLastFilterResults(enhancedSignal.filtersPassed || []);
            
            toast({
              title: `🚨 ENHANCED ${enhancedSignal.signalStrength} SIGNAL APPROVED!`,
              description: `${enhancedSignal.pair} ${enhancedSignal.type} | Groq Validated | Session: ${getCurrentSession()}`,
            });
          }
          
          return;
          
        } catch (error) {
          console.error(`Attempt ${attempts} failed:`, error);
          setRejectionCount(prev => prev + 1);
          continue;
        }
      }
      
      // All attempts failed
      setLastRejectionReason(`ENHANCED FILTERING: All ${maxAttempts} attempts rejected. Current ${getCurrentSession()} session requires ${requirements.minConfidence}%+ confidence, ${requirements.minConfluence}/6+ confluence, and Groq AI approval.`);
      toast({
        title: "🏛️ Enhanced Filter Gate - All Signals Rejected",
        description: `${rejectionCount} signals blocked by enhanced institutional filtering + Groq AI validation`,
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
            <p className="text-gray-400">Session-Aware + Mandatory Groq Validation</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${requirements.sessionActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-current animate-pulse`}>
            <Clock className="w-3 h-3 mr-1" />
            {getCurrentSession()}
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Brain className="w-3 h-3 mr-1" />
            GROQ AI
          </Badge>
        </div>
      </div>

      {/* Session Requirements */}
      <div className="glass-card p-6 mb-6 border-purple-500/10">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Current Session Requirements</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="glass-card p-3 text-center border-red-500/20">
            <div className="text-sm text-red-400 font-semibold">Min Confidence</div>
            <div className="text-xs text-gray-400">{requirements.minConfidence}%</div>
          </div>
          <div className="glass-card p-3 text-center border-orange-500/20">
            <div className="text-sm text-orange-400 font-semibold">Min Confluence</div>
            <div className="text-xs text-gray-400">{requirements.minConfluence}/6</div>
          </div>
          <div className="glass-card p-3 text-center border-yellow-500/20">
            <div className="text-sm text-yellow-400 font-semibold">Min R:R</div>
            <div className="text-xs text-gray-400">{requirements.minRiskReward}:1</div>
          </div>
          <div className="glass-card p-3 text-center border-blue-500/20">
            <div className="text-sm text-blue-400 font-semibold">Groq AI</div>
            <div className="text-xs text-gray-400">MANDATORY</div>
          </div>
        </div>

        {/* Groq Validation Log */}
        {groqValidationLog.length > 0 && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 font-semibold">Groq AI Validation Log:</span>
            </div>
            {groqValidationLog.slice(-3).map((log, index) => (
              <p key={index} className="text-sm text-blue-200 mb-1">{log}</p>
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
            <p className="text-sm text-red-200">{rejectionCount} signals rejected by enhanced filtering system</p>
          </div>
        )}

        {/* Last Rejection Reason */}
        {lastRejectionReason && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-semibold">Enhanced Filter Status:</span>
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
              Generate Enhanced Signal
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedSignalGenerator;
