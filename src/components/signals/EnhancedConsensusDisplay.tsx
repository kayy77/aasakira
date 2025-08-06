import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface EnhancedConsensusDisplayProps {
  aiAnalysis: {
    direction: string;
    weightedConfidence: number;
    averageEV: number;
    averageRR: number;
    consensusStrength: string;
    topModel: string;
    modelAgreement: number;
    conflictingModels: string[];
    reasoning: string;
    groqOverride?: boolean;
  };
  signalStrength: string;
  finalGrade: string;
  processingStages?: {
    structuralPass: boolean;
    aiConsensusPass: boolean;
    outcomePass: boolean;
    finalApproved: boolean;
  };
  debugInfo?: {
    structuralDebug: string;
    aiDebug: string;
    outcomeDebug: string;
  };
}

export const EnhancedConsensusDisplay = ({ 
  aiAnalysis, 
  signalStrength,
  finalGrade,
  processingStages,
  debugInfo 
}: EnhancedConsensusDisplayProps) => {
  // FIXED: Groq Override Display - Show exceptional signals in GREEN
  const renderGroqOverride = () => {
    if (!aiAnalysis.groqOverride) return null;
    
    const isExceptional = aiAnalysis.reasoning?.toLowerCase().includes('exceptional');
    const isElite = aiAnalysis.reasoning?.toLowerCase().includes('elite');
    
    return (
      <div className={`p-3 rounded-lg border-2 ${
        isExceptional ? 'bg-green-50 border-green-300' : 
        isElite ? 'bg-blue-50 border-blue-300' : 
        'bg-yellow-50 border-yellow-300'
      }`}>
        <div className="flex items-center gap-2">
          <Badge className={`${
            isExceptional ? 'bg-green-500 text-white' : 
            isElite ? 'bg-blue-500 text-white' : 
            'bg-yellow-500 text-black'
          }`}>
            🔥 GROQ OVERRIDE
          </Badge>
          <Badge className={`${
            isExceptional ? 'bg-green-600 text-white' : 
            isElite ? 'bg-blue-600 text-white' : 
            'bg-yellow-600 text-white'
          }`}>
            {isExceptional ? 'EXCEPTIONAL' : isElite ? 'ELITE' : 'STRONG'}
          </Badge>
        </div>
        <p className={`text-sm mt-2 ${
          isExceptional ? 'text-green-800' : 
          isElite ? 'text-blue-800' : 
          'text-yellow-800'
        }`}>
          {aiAnalysis.reasoning}
        </p>
      </div>
    );
  };

  return (
    <Card className="w-full border-amber-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">🧠 AI Multi-Model Consensus</CardTitle>
          <div className="flex items-center gap-2">
            {/* FIXED: Signal Grade Display */}
            <Badge className={`${
              finalGrade === 'A' ? 'bg-green-500 text-white' :
              finalGrade === 'B' ? 'bg-blue-500 text-white' :
              finalGrade === 'C' ? 'bg-yellow-500 text-black' :
              'bg-red-500 text-white'
            }`}>
              Grade {finalGrade}
            </Badge>
            
            {/* Consensus Strength Badge */}
            <Badge className={`${
              aiAnalysis.consensusStrength === 'STRONG' ? 'bg-green-500 text-white' :
              aiAnalysis.consensusStrength === 'MODERATE' ? 'bg-yellow-500 text-black' :
              aiAnalysis.consensusStrength === 'WEAK' ? 'bg-orange-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {aiAnalysis.consensusStrength}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Groq Override Display */}
        {renderGroqOverride()}
        
        {/* AI Consensus Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Direction</div>
            <Badge className={`${
              aiAnalysis.direction === 'BUY' ? 'bg-green-500 text-white' :
              aiAnalysis.direction === 'SELL' ? 'bg-red-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {aiAnalysis.direction}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Agreement</div>
            <div className="text-lg font-semibold">
              {Math.round(aiAnalysis.modelAgreement)}%
            </div>
          </div>
        </div>

        {/* Model Performance Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Confidence</div>
            <div className="text-sm font-semibold">{Math.round(aiAnalysis.weightedConfidence)}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Expected Value</div>
            <div className="text-sm font-semibold">+{aiAnalysis.averageEV.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Risk:Reward</div>
            <div className="text-sm font-semibold">{aiAnalysis.averageRR.toFixed(1)}:1</div>
          </div>
        </div>

        {/* Processing Stages Status */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Validation Stages</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-1 ${
              processingStages?.structuralPass ? 'text-green-600' : 'text-red-600'
            }`}>
              {processingStages?.structuralPass ? '✅' : '❌'} Structural Analysis
            </div>
            <div className={`flex items-center gap-1 ${
              processingStages?.aiConsensusPass ? 'text-green-600' : 'text-red-600'
            }`}>
              {processingStages?.aiConsensusPass ? '✅' : '❌'} AI Consensus
            </div>
            <div className={`flex items-center gap-1 ${
              processingStages?.outcomePass ? 'text-green-600' : 'text-red-600'
            }`}>
              {processingStages?.outcomePass ? '✅' : '❌'} Outcome Prediction
            </div>
            <div className={`flex items-center gap-1 ${
              processingStages?.finalApproved ? 'text-green-600' : 'text-red-600'
            }`}>
              {processingStages?.finalApproved ? '✅' : '❌'} Final Approval
            </div>
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="space-y-2">
          <div className="text-sm font-medium">AI Analysis</div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {aiAnalysis.reasoning}
          </p>
        </div>

        {/* Debug Information */}
        {debugInfo && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Debug Information
            </summary>
            <div className="mt-2 space-y-1 text-muted-foreground">
              <div>Structural: {debugInfo.structuralDebug}</div>
              <div>AI: {debugInfo.aiDebug}</div>
              <div>Outcome: {debugInfo.outcomeDebug}</div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
};
