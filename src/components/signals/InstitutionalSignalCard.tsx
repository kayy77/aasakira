
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { ConsensusSignalResult } from "@/services/enhancedMultiAIConsensus";

interface InstitutionalSignalCardProps {
  signal: ConsensusSignalResult;
  onTakeSignal?: () => void;
  onRejectSignal?: () => void;
}

export function InstitutionalSignalCard({ signal, onTakeSignal, onRejectSignal }: InstitutionalSignalCardProps) {
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'STRONG': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'WEAK': return 'bg-orange-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getGradeColor = (grade: string) => {
    if (['A+', 'A'].includes(grade)) return 'text-green-600 bg-green-50';
    if (['B+', 'B'].includes(grade)) return 'text-blue-600 bg-blue-50';
    if (['C+', 'C'].includes(grade)) return 'text-yellow-600 bg-yellow-50';
    if (grade === 'D') return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'TAKE': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REDUCE_SIZE': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'WATCH_ONLY': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const isRejected = signal.overallVerdict === 'REJECTED' || signal.finalGrade === 'F';

  return (
    <Card className={`w-full max-w-md ${isRejected ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {signal.direction === 'BULLISH' ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            {signal.direction} Signal
          </CardTitle>
          <Badge className={`${getVerdictColor(signal.overallVerdict)} text-white`}>
            {signal.overallVerdict}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getGradeColor(signal.finalGrade)}>
            Grade: {signal.finalGrade}
          </Badge>
          <Badge variant="outline">
            R:R {signal.averageRR.toFixed(1)}:1
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Institutional Grade */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">Institutional Assessment</span>
            <Badge variant="outline">{signal.consensusCount}/5 AI Models</Badge>
          </div>
          <p className="text-sm text-gray-700">{signal.institutionalGrade}</p>
        </div>

        {/* AI Task Results Summary */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">AI Analysis Breakdown</h4>
          <div className="grid grid-cols-2 gap-2">
            {signal.aiTaskResults?.map((result: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                <span className="font-medium">{result.model}</span>
                <Badge 
                  variant={result.verdict === 'PASS' ? 'default' : result.verdict === 'WEAK' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {result.verdict}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-lg font-bold text-blue-600">
              {signal.weightedConfidence.toFixed(0)}%
            </div>
            <div className="text-xs text-blue-600">Confidence</div>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <div className="text-lg font-bold text-green-600">
              {signal.averageEV >= 0 ? '+' : ''}{signal.averageEV.toFixed(2)}
            </div>
            <div className="text-xs text-green-600">Expected Value</div>
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <div className="text-lg font-bold text-purple-600">
              {signal.averageRR.toFixed(1)}:1
            </div>
            <div className="text-xs text-purple-600">Risk:Reward</div>
          </div>
        </div>

        {/* Deep Analysis Reasoning */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Analysis Summary</h4>
          <p className="text-xs text-gray-700 leading-relaxed">
            {signal.deepAnalysisReasoning}
          </p>
        </div>

        {/* Processing Stages */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2 rounded text-xs text-center ${
            signal.processingStages.structuralPass ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            Structure: {signal.processingStages.structuralPass ? '✓' : '✗'}
          </div>
          <div className={`p-2 rounded text-xs text-center ${
            signal.processingStages.aiConsensusPass ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            Consensus: {signal.processingStages.aiConsensusPass ? '✓' : '✗'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {!isRejected && signal.recommendation === 'TAKE' && (
            <Button 
              onClick={onTakeSignal}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Take Signal
            </Button>
          )}
          
          {!isRejected && signal.recommendation === 'REDUCE_SIZE' && (
            <Button 
              onClick={onTakeSignal}
              variant="outline" 
              className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Reduced Size
            </Button>
          )}
          
          {!isRejected && signal.recommendation === 'WATCH_ONLY' && (
            <Button variant="outline" className="flex-1">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Watch Only
            </Button>
          )}
          
          {isRejected && (
            <Button variant="destructive" disabled className="flex-1">
              <XCircle className="h-4 w-4 mr-2" />
              Signal Rejected
            </Button>
          )}
          
          <div className="flex items-center">
            {getRecommendationIcon(signal.recommendation)}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          {signal.recommendation} • {signal.institutionalGrade}
        </div>
      </CardContent>
    </Card>
  );
}
