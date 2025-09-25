import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, BarChart3, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import SetupForm from '@/components/setup-scanner/SetupForm';
import AnalysisResult from '@/components/setup-scanner/AnalysisResult';

export interface TradeSetup {
  id?: string;
  user_id?: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  entry_reason: string;
  stop_loss: number;
  take_profit: number;
  timeframe: string;
  risk_percentage: number;
  screenshot_url?: string;
  ai_score?: number;
  ai_feedback?: any;
  status: 'PENDING' | 'ANALYZED' | 'SAVED_TO_JOURNAL';
}

const SetupScanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'form' | 'analysis'>('form');
  const [analysisResult, setAnalysisResult] = useState<TradeSetup | null>(null);

  const handleAnalysisComplete = (result: TradeSetup) => {
    setAnalysisResult(result);
    setCurrentStep('analysis');
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setAnalysisResult(null);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Setup Scanner
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Upload your trading setup and get AI-powered analysis with actionable feedback
            </p>
          </div>

          {/* Feature Cards */}
          {currentStep === 'form' && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-primary/20">
                <CardHeader className="text-center pb-3">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Get detailed risk-to-reward analysis and position sizing recommendations
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-accent/20">
                <CardHeader className="text-center pb-3">
                  <BarChart3 className="h-8 w-8 text-accent mx-auto mb-2" />
                  <CardTitle className="text-lg">Technical Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    AI analyzes your chart for confluence, support/resistance levels
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-secondary/20">
                <CardHeader className="text-center pb-3">
                  <Target className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <CardTitle className="text-lg">Improvement Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Receive personalized suggestions to enhance your trading setups
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="space-y-8">
            {currentStep === 'form' ? (
              <SetupForm onAnalysisComplete={handleAnalysisComplete} />
            ) : (
              <AnalysisResult 
                setup={analysisResult} 
                onBackToForm={handleBackToForm}
              />
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default SetupScanner;