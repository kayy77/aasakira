
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { ConsensusResult } from '@/services/multiAIConsensusEngine';

interface EnhancedAIConsensusDisplayProps {
  consensus: ConsensusResult;
  className?: string;
}

const EnhancedAIConsensusDisplay: React.FC<EnhancedAIConsensusDisplayProps> = ({ 
  consensus, 
  className = "" 
}) => {
  const getConsensusIcon = () => {
    if (consensus.confidence_score >= 4) return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    if (consensus.confidence_score >= 3) return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  const getConsensusColor = () => {
    if (consensus.confidence_score >= 4) return 'border-green-500/30 bg-green-500/10';
    if (consensus.confidence_score >= 3) return 'border-yellow-500/30 bg-yellow-500/10';
    return 'border-red-500/30 bg-red-500/10';
  };

  const getVerdictBadge = () => {
    if (consensus.verdict === 'APPROVED' && consensus.confidence_score >= 4) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          🔥 Elite Verified
        </Badge>
      );
    }
    if (consensus.verdict === 'APPROVED') {
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          ✅ AI Approved
        </Badge>
      );
    }
    if (consensus.verdict === 'LOW_CONSENSUS') {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          🔶 Mixed Verdict
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        ⚠️ Low Confidence
      </Badge>
    );
  };

  const aiModels = Object.entries(consensus.ai_votes);
  const avgConfidence = aiModels.reduce((sum, [, vote]) => sum + vote.rating, 0) / aiModels.length;

  return (
    <Card className={`${getConsensusColor()} border-2 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-white">Multi-AI Consensus</span>
          </div>
          {getVerdictBadge()}
        </div>

        <div className="space-y-3">
          {/* AI Agreement Score */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300">AI Agreement:</span>
            <div className="flex items-center gap-2">
              {getConsensusIcon()}
              <span className="font-bold text-white">
                {consensus.confidence_score}/5 Models ({Math.round(avgConfidence)}% avg)
              </span>
            </div>
          </div>

          {/* Consensus Strength */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Strength:</span>
            <Badge variant="outline" className={`
              ${consensus.confidence_score >= 4 ? 'border-green-500/30 text-green-400' :
                consensus.confidence_score >= 3 ? 'border-yellow-500/30 text-yellow-400' :
                'border-red-500/30 text-red-400'}
            `}>
              {consensus.consensus_strength}
            </Badge>
          </div>

          {/* Individual AI Model Scores */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-300">Individual AI Scores:</div>
            <div className="grid grid-cols-1 gap-1">
              {aiModels.map(([modelName, vote]) => (
                <div key={modelName} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 capitalize">{modelName}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{vote.rating}/10</span>
                    <Badge className={`text-xs px-2 py-0 ${
                      vote.verdict === 'Elite' || vote.verdict === 'Strong' 
                        ? 'bg-green-500/20 text-green-400' 
                        : vote.verdict === 'Moderate'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {vote.verdict}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary Quote */}
          {consensus.ai_votes.groq?.summary && (
            <div className="bg-gray-800/30 rounded p-2 mt-3">
              <div className="text-xs text-gray-400 mb-1">AI Summary:</div>
              <div className="text-sm text-gray-300 italic">
                "{consensus.ai_votes.groq.summary}"
              </div>
            </div>
          )}

          {/* Multi-AI Verdict */}
          <div className="border-t border-gray-700 pt-2 mt-3">
            <div className="text-xs text-gray-400 mb-1">Final Verdict:</div>
            <div className="text-sm text-white font-medium">
              {consensus.multi_ai_verdict}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAIConsensusDisplay;
