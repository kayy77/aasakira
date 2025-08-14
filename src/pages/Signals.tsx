import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import FeatureGate from '@/components/FeatureGate';
import EnhancedSignalsDashboard from '@/components/signals/EnhancedSignalsDashboard';
import { useSignalEngine } from '@/hooks/useSignalEngine';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Signals = () => {
  const isMobile = useIsMobile();
  const signalEngine = useSignalEngine();
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      {isMobile ? <MobileNavigation /> : <Navigation />}
      
      <div className="relative z-10 pt-16 md:pt-20 lg:pt-24 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-4 md:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold gradient-text mb-2 md:mb-3 lg:mb-4">
              🎯 Enhanced Signal Engine
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-2 md:px-4">
              Enhanced institutional signals with multi-layer confluence, pullback entries, and improved price accuracy
            </p>
            <div className={`flex justify-center gap-1 sm:gap-2 md:gap-4 mt-2 md:mt-3 lg:mt-4 ${
              isMobile ? 'flex-wrap px-2' : ''
            }`}>
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className={isMobile ? 'text-xs' : ''}>Zero Garbage Signals</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className={isMobile ? 'text-xs' : ''}>Pullback Entries Only</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className={isMobile ? 'text-xs' : ''}>Hidden SL Zones</span>
              </div>
            </div>
          </div>

          <FeatureGate feature="signals" featureName="Enhanced Signal Engine">
            <div className="space-y-6">
              {/* Enhanced Signal Quality Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-orange-400">
                    {signalEngine.stats.elite}
                  </div>
                  <div className="text-sm text-white/70">🔥 Elite Signals</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-blue-400">
                    {signalEngine.stats.normal}
                  </div>
                  <div className="text-sm text-white/70">⚡ Normal Signals</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-yellow-400">
                    {signalEngine.stats.caution}
                  </div>
                  <div className="text-sm text-white/70">⚠️ Caution Signals</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-green-400">
                    {Math.round(signalEngine.averageConfluence)}%
                  </div>
                  <div className="text-sm text-white/70">📊 Avg Confluence</div>
                </div>
              </div>

              {/* Enhanced Signal Scanner Controls */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">🎯 Enhanced Signal Scanner</h2>
                    <p className="text-white/70">Multi-layer confluence with improved accuracy</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-white/70">
                      Scans: {signalEngine.scanCount} | Success: {Math.round(signalEngine.successRate)}%
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      signalEngine.isScanning 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {signalEngine.isScanning ? '🔍 SCANNING' : '⏸️ PAUSED'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => signalEngine.startAutoScanning(20)}
                    disabled={signalEngine.isScanning}
                    variant="default"
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    🎯 Start Enhanced Scanner
                  </Button>
                  <Button
                    onClick={signalEngine.stopScanning}
                    disabled={!signalEngine.isScanning}
                    variant="destructive"
                    size="lg"
                  >
                    ⏹️ Stop Scanner
                  </Button>
                  <Button
                    onClick={signalEngine.generateSignal}
                    variant="outline"
                    size="lg"
                  >
                    🔄 Manual Scan
                  </Button>
                  <Button
                    onClick={signalEngine.clearHistory}
                    variant="ghost"
                    size="lg"
                  >
                    🗑️ Clear History
                  </Button>
                </div>
              </div>

              {/* Enhanced Current Signal Display */}
              {signalEngine.currentSignal && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  {signalEngine.currentSignal.status === 'approved' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {signalEngine.currentSignal.signalType === 'ELITE' ? '🔥' :
                             signalEngine.currentSignal.signalType === 'CAUTION' ? '⚠️' : '⚡'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-white">
                                {signalEngine.currentSignal.pair}
                              </span>
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                signalEngine.currentSignal.direction === 'BUY' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {signalEngine.currentSignal.direction}
                              </span>
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                signalEngine.currentSignal.signalType === 'ELITE' ? 'bg-orange-500/20 text-orange-400' :
                                signalEngine.currentSignal.signalType === 'CAUTION' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {signalEngine.currentSignal.signalType}
                              </span>
                            </div>
                            <div className="text-white/70">
                              RR: {signalEngine.currentSignal.riskReward}:1 | 
                              Confluence: {signalEngine.currentSignal.confluenceScore}/5
                              {signalEngine.currentSignal.sessionWarning && ' | ⚠️ Sub-optimal session'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-mono">Entry: {signalEngine.currentSignal.entry?.toFixed(5)}</div>
                          <div className="text-red-400 font-mono">SL: {signalEngine.currentSignal.stopLoss?.toFixed(5)}</div>
                          <div className="text-green-400 font-mono">TP: {signalEngine.currentSignal.takeProfit?.toFixed(5)}</div>
                        </div>
                      </div>
                      
                      {/* Confluence Factors */}
                      {signalEngine.currentSignal.confluenceFactors && (
                        <div className="grid grid-cols-5 gap-2 text-xs">
                          {Object.entries(signalEngine.currentSignal.confluenceFactors).map(([key, value]) => (
                            <div key={key} className={`flex items-center gap-1 ${value ? 'text-green-400' : 'text-red-400'}`}>
                              <span>{value ? '✅' : '❌'}</span>
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Entry Method & Metadata */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-white/70">
                          📍 {signalEngine.currentSignal.entryMethod?.replace(/_/g, ' ')} | 
                          Pullback: {signalEngine.currentSignal.metadata?.pullbackLevel ? `${(signalEngine.currentSignal.metadata.pullbackLevel * 100).toFixed(1)}%` : 'N/A'}
                        </div>
                        <div className="text-white/70">
                          Volume: {signalEngine.currentSignal.metadata?.volumeProfile} | 
                          Session: {signalEngine.currentSignal.metadata?.sessionScore}%
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">❌</div>
                      <div className="text-lg font-medium text-white mb-1">Signal Rejected</div>
                      <div className="text-white/70">
                        {signalEngine.currentSignal.reason}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Signal History */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Signals</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {signalEngine.signalHistory.slice(0, 10).map((signal, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      signal.status === 'approved' 
                        ? 'bg-green-500/5 border-green-500/20' 
                        : 'bg-red-500/5 border-red-500/20'
                    }`}>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{signal.pair}</span>
                          {signal.direction && (
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              signal.direction === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {signal.direction}
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            signal.signalType === 'ELITE' ? 'bg-orange-500/20 text-orange-400' :
                            signal.signalType === 'CAUTION' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {signal.signalType}
                          </span>
                        </div>
                        <div className="text-white/70">
                          {signal.status === 'approved' ? `RR: ${signal.riskReward} | C: ${signal.confluenceScore}/5` : signal.reason}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FeatureGate>
        </div>
      </div>
    </div>
  );
};


export default Signals;
