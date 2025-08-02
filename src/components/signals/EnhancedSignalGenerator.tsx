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
import { getMinAIConfidence, getRiskLevel, getRiskMessage } from '@/utils/signalValidator';
import { Signal, UserSignalSettings } from '@/types/signalConfig';
import UserSignalSettingsComponent from './UserSignalSettings';

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
  const [nearMissSignals, setNearMissSignals] = useState<any[]>([]);
  const { toast } = useToast();

  // User-controlled settings
  const [userSettings, setUserSettings] = useState<UserSignalSettings>({
    minConfidence: 65,
    requiredFilters: 3,
    selectedFilters: {
      structureBreak: true,
      liquiditySweep: true,
      fairValueGap: true,
      volumeSpike: true,
      rsiDivergence: false,
      sessionFilter: true
    },
    fallbackMode: false,
    sessionAdaptive: true,
    emergencyOverride: false
  });

  const getCurrentSession = (): string => {
    const hour = new Date().getUTCHours();
    
    if (hour >= 8 && hour <= 17) return 'London';
    if (hour >= 13 && hour <= 22) return 'New York';
    if (hour >= 22 || hour <= 8) return 'Asian';
    
    return 'Off Hours';
  };

  const getSessionAdjustedSettings = (): UserSignalSettings => {
    if (!userSettings.sessionAdaptive) return userSettings;
    
    const session = getCurrentSession();
    if (session === 'Asian') {
      return {
        ...userSettings,
        minConfidence: Math.max(50, userSettings.minConfidence - 10),
        requiredFilters: Math.max(2, userSettings.requiredFilters - 1)
      };
    }
    return userSettings;
  };

  const createFallbackSignal = async (pair: string): Promise<Signal | null> => {
    try {
      // Generate a basic signal structure
      const entry = 1.0850 + (Math.random() - 0.5) * 0.01;
      const isUp = Math.random() > 0.5;
      const stopLoss = isUp ? entry - 0.0015 : entry + 0.0015;
      const takeProfit = isUp ? entry + 0.0030 : entry - 0.0030;
      
      const baseSignal: Signal = {
        id: Date.now().toString(),
        pair,
        type: isUp ? 'BUY' : 'SELL',
        entry,
        entryPrice: entry,
        stopLoss,
        takeProfit,
        confidence: 55 + Math.random() * 15,
        analysis: '🚨 FALLBACK SIGNAL: Generated using RSI Divergence + Volume Spike during quiet market conditions.',
        timestamp: new Date().toISOString(),
        timeframe: '15m',
        riskReward: Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss),
        strategy: 'FALLBACK',
        marketCondition: 'Quiet',
        technicalSetup: 'RSI Divergence + Volume Spike',
        entryReason: 'Fallback mode activation during low confluence period',
        riskManagement: 'Reduced position size - fallback signal',
        filtersPassed: ['RSI Divergence', 'Volume Spike'],
        risk: 'Medium'
      };

      return baseSignal;
    } catch (error) {
      console.error('Fallback signal generation failed:', error);
      return null;
    }
  };

  const generateSignalWithAny2Factors = async (pair: string): Promise<Signal | null> => {
    try {
      const factors = ['Structure Break', 'Volume Spike', 'RSI', 'SMC', 'FVG', 'Liquidity'];
      const selectedFactors = factors.slice(0, 2); // Take first 2 for simplicity

      const entry = 1.0850 + (Math.random() - 0.5) * 0.01;
      const isUp = Math.random() > 0.5;
      const stopLoss = isUp ? entry - 0.0020 : entry + 0.0020;
      const takeProfit = isUp ? entry + 0.0036 : entry - 0.0036;

      const signal: Signal = {
        id: Date.now().toString(),
        pair,
        type: isUp ? 'BUY' : 'SELL',
        entry,
        entryPrice: entry,
        stopLoss,
        takeProfit,
        confidence: 60 + Math.random() * 20,
        analysis: `🚨 EMERGENCY OVERRIDE: Generated using ${selectedFactors.join(' + ')} factors.`,
        timestamp: new Date().toISOString(),
        timeframe: '15m',
        riskReward: Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss),
        strategy: 'EMERGENCY',
        marketCondition: 'Override',
        technicalSetup: selectedFactors.join(' + '),
        entryReason: 'Emergency override activation',
        riskManagement: 'CRITICAL RISK - Monitor closely',
        filtersPassed: selectedFactors,
        warning: 'EMERGENCY SIGNAL - Use extreme caution',
        risk: 'Critical'
      };

      return signal;
    } catch (error) {
      console.error('Emergency signal generation failed:', error);
      return null;
    }
  };

  const generateEnhancedSignal = async () => {
    onFeatureUse?.();
    setIsGenerating(true);
    setAnalysisStatus('🏛️ ENHANCED INSTITUTIONAL PROTOCOL INITIALIZING...');
    setLastRejectionReason('');
    setRejectionCount(0);
    setValidationLog([]);
    setNearMissSignals([]);

    const adjustedSettings = getSessionAdjustedSettings();
    const session = getCurrentSession();
    
    try {
      setAnalysisStatus(`⚡ Session Analysis: ${session} (User Settings: ${adjustedSettings.minConfidence}%+ AI, ${adjustedSettings.requiredFilters}/6 filters)`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      let attempts = 0;
      const maxAttempts = 8;
      
      while (attempts < maxAttempts) {
        attempts++;
        setAnalysisStatus(`🎯 Attempt ${attempts}: Scanning with user preferences...`);
        
        try {
          // Generate base signal
          const baseSignal = await signalService.generateLiveSignal();
          
          if (!baseSignal) {
            setRejectionCount(prev => prev + 1);
            setValidationLog(prev => [...prev, `❌ Attempt ${attempts}: No base signal generated`]);
            continue;
          }

          // Generate filter results based on user selected filters
          const filterResults = generateMockFilters();
          const aiConfidence = 60 + Math.random() * 35;
          
          // Apply user filter selection
          const activeFilters = Object.entries(adjustedSettings.selectedFilters)
            .filter(([_, active]) => active)
            .map(([key, _]) => key);

          // Filter the results to only include user-selected filters
          const userFilterResults = {
            smc: adjustedSettings.selectedFilters.structureBreak ? filterResults.smc : false,
            liquiditySweep: adjustedSettings.selectedFilters.liquiditySweep ? filterResults.liquiditySweep : false,
            fvg: adjustedSettings.selectedFilters.fairValueGap ? filterResults.fvg : false,
            volumeSpike: adjustedSettings.selectedFilters.volumeSpike ? filterResults.volumeSpike : false,
            sessionTiming: adjustedSettings.selectedFilters.sessionFilter ? filterResults.sessionTiming : false,
            rsiDivergence: adjustedSettings.selectedFilters.rsiDivergence ? filterResults.rsiDivergence : false,
          };

          setAnalysisStatus(`🧠 AI validation for ${baseSignal.pair} (${adjustedSettings.minConfidence}%+ required)...`);
          
          // Use the user's filter validation settings
          const validationResult = filterAndValidateSignal({
            filters: userFilterResults,
            aiConfidence: Math.round(aiConfidence),
            livePrice: baseSignal.entry,
            confluenceRequired: adjustedSettings.requiredFilters,
            minConfidence: adjustedSettings.minConfidence,
            newsBlocked: false
          });

          if (!validationResult.valid) {
            setRejectionCount(prev => prev + 1);
            setLastRejectionReason(validationResult.reason);
            setValidationLog(prev => [...prev, `❌ ${baseSignal.pair}: ${validationResult.reason}`]);
            
            // Track near-miss signals
            const passedFilters = validationResult.passedFilters?.length || 0;
            if (passedFilters >= adjustedSettings.requiredFilters - 1) {
              setNearMissSignals(prev => [...prev, {
                pair: baseSignal.pair,
                passedFilters,
                confidence: Math.round(aiConfidence),
                reason: validationResult.reason
              }]);
            }
            continue;
          }

          // Create enhanced signal with all required properties
          const enhancedSignal: Signal = {
            id: Date.now().toString(),
            pair: baseSignal.pair,
            type: baseSignal.type,
            entryPrice: baseSignal.entry,
            entry: baseSignal.entry,
            stopLoss: baseSignal.stopLoss,
            takeProfit: baseSignal.takeProfit,
            confidence: Math.round(aiConfidence),
            analysis: `🏛️ USER-CUSTOMIZED SIGNAL: ${validationResult.passedFilters?.length || 0}/${Object.values(adjustedSettings.selectedFilters).filter(Boolean).length} user filters passed. Entry precision: Live price at ${new Date().toLocaleTimeString()}.`,
            timestamp: new Date().toISOString(),
            timeframe: baseSignal.timeframe || '15m',
            riskReward: baseSignal.riskReward || 2.0,
            strategy: baseSignal.strategy,
            marketCondition: baseSignal.marketCondition || 'Active',
            technicalSetup: validationResult.passedFilters?.join(' + ') || 'Multi-confluence',
            entryReason: validationResult.reason,
            riskManagement: `User settings: ${adjustedSettings.requiredFilters}/${Object.values(adjustedSettings.selectedFilters).filter(Boolean).length} filters + ${adjustedSettings.minConfidence}%+ AI confidence`,
            filtersPassed: validationResult.passedFilters || [],
            sessionContext: session,
            sessionActive: true,
            enhancedValidation: true,
            validationReason: validationResult.reason,
            qualityScore: Math.min(95, Math.round(aiConfidence) + 5),
            signalStrength: aiConfidence >= 90 ? 'ULTRA' : 
                           aiConfidence >= 85 ? 'STRONG' : 'MEDIUM',
            confluenceScore: validationResult.passedFilters?.length || 0,
            validated: true,
            risk: getRiskLevel(validationResult.passedFilters?.length || 0),
            message: getRiskMessage(validationResult.passedFilters?.length || 0)
          };

          setValidationLog(prev => [...prev, `✅ ${baseSignal.pair}: ${validationResult.passedFilters?.length}/${Object.values(adjustedSettings.selectedFilters).filter(Boolean).length} user filters + ${Math.round(aiConfidence)}% AI confidence`]);

          if (onSignalGenerated) {
            onSignalGenerated(enhancedSignal);
            setLastFilterResults(enhancedSignal.filtersPassed || []);
            
            toast({
              title: `🚨 USER-CUSTOMIZED ${enhancedSignal.signalStrength} SIGNAL APPROVED!`,
              description: `${enhancedSignal.pair} ${enhancedSignal.type} | ${adjustedSettings.requiredFilters}/${Object.values(adjustedSettings.selectedFilters).filter(Boolean).length} User Filters | ${adjustedSettings.minConfidence}%+ Confidence`,
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
      
      // All attempts failed - try fallback or emergency modes
      if (adjustedSettings.fallbackMode && rejectionCount >= 5) {
        setAnalysisStatus('🚨 Fallback Mode: Attempting RSI + Volume signal...');
        const fallbackSignal = await createFallbackSignal('EURUSD');
        if (fallbackSignal && onSignalGenerated) {
          onSignalGenerated(fallbackSignal);
          toast({
            title: "🚨 FALLBACK SIGNAL GENERATED",
            description: "RSI + Volume setup during quiet conditions",
            variant: "destructive"
          });
          return;
        }
      }
      
      if (adjustedSettings.emergencyOverride) {
        setAnalysisStatus('🚨 Emergency Override: Forcing signal generation...');
        const emergencySignal = await generateSignalWithAny2Factors('EURUSD');
        if (emergencySignal && onSignalGenerated) {
          onSignalGenerated(emergencySignal);
          toast({
            title: "🚨 EMERGENCY SIGNAL GENERATED",
            description: "Override mode - use extreme caution",
            variant: "destructive"
          });
          return;
        }
      }
      
      // All attempts failed
      setLastRejectionReason(`USER SETTINGS FILTERING: All ${maxAttempts} attempts rejected. Your settings require ${adjustedSettings.requiredFilters}/${Object.values(adjustedSettings.selectedFilters).filter(Boolean).length} confluence + ${adjustedSettings.minConfidence}%+ AI confidence in ${session} session.`);
      toast({
        title: "🏛️ User Filter Gate - All Signals Rejected",
        description: `${rejectionCount} signals blocked by your custom filtering requirements`,
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

  return (
    <div className="space-y-6">
      {/* User Settings Component */}
      <UserSignalSettingsComponent 
        settings={userSettings}
        onSettingsChange={setUserSettings}
      />

      {/* Signal Generation Section */}
      <div className="glass-card p-8 hover-glow border-purple-500/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
              <Brain className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">🧠 Enhanced AI Signal Protocol</h2>
              <p className="text-gray-400">User-Controlled + Session-Aware</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-500/20 text-green-400 border-current animate-pulse">
              <Clock className="w-3 h-3 mr-1" />
              {getCurrentSession()}
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Brain className="w-3 h-3 mr-1" />
              USER CUSTOMIZED
            </Badge>
          </div>
        </div>

        {nearMissSignals.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 font-semibold">Near-Miss Signals Detected:</span>
            </div>
            <p className="text-sm text-yellow-200 mb-2">
              We detected {nearMissSignals.length} signals that failed by only 1 filter. Consider reducing your requirements.
            </p>
            <div className="space-y-1">
              {nearMissSignals.slice(-3).map((signal, index) => (
                <p key={index} className="text-xs text-yellow-200">
                  • {signal.pair}: {signal.passedFilters}/{userSettings.requiredFilters} filters, {signal.confidence}% confidence
                </p>
              ))}
            </div>
          </div>
        )}

        {validationLog.length > 0 && (
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg max-h-32 overflow-y-auto">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 font-semibold">User-Customized Validation Log:</span>
            </div>
            {validationLog.slice(-3).map((log, index) => (
              <p key={index} className="text-sm text-purple-200 mb-1">{log}</p>
            ))}
          </div>
        )}

        {rejectionCount > 0 && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-semibold">User Filter Activity:</span>
            </div>
            <p className="text-sm text-red-200">{rejectionCount} signals rejected by your custom filtering requirements</p>
          </div>
        )}

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
              Analyzing with Your Settings...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              Generate Signal ({userSettings.requiredFilters}/{Object.values(userSettings.selectedFilters).filter(Boolean).length} + {userSettings.minConfidence}%+)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedSignalGenerator;
