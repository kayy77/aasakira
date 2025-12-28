import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AuthGuard from '@/components/AuthGuard';
import SetupForm from '@/components/setup-scanner/SetupForm';
import ScannerFilters from '@/components/setup-scanner/ScannerFilters';
import SetupCard from '@/components/setup-scanner/SetupCard';
import SetupDetailDrawer from '@/components/setup-scanner/SetupDetailDrawer';
import { supabase } from '@/integrations/supabase/client';
import { 
  evaluateConfirmationLayers, 
  calculateGrade, 
  generateTradePlan, 
  generateWarnings,
  generateKeyReason,
  type ScannerResult,
  type SetupGrade 
} from '@/services/setupScannerEngine';

export interface TradeSetup {
  id?: string;
  user_id?: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  entry_reason: string;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  timeframe: string;
  risk_percentage: number;
  market_structure: 'bullish' | 'bearish' | 'ranging' | 'transition';
  liquidity_sweep: 'confirmed' | 'anticipated' | 'none';
  session_context: 'london' | 'newyork' | 'asia' | 'london_ny_overlap' | 'off_hours';
  htf_bias?: 'bullish' | 'bearish' | 'neutral';
  screenshot_url?: string;
  ai_score?: number;
  ai_feedback?: any;
  status: 'PENDING' | 'ANALYZED' | 'SAVED_TO_JOURNAL';
}

const SetupScanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [showForm, setShowForm] = useState(false);
  const [setups, setSetups] = useState<ScannerResult[]>([]);
  const [selectedSetup, setSelectedSetup] = useState<ScannerResult | null>(null);
  const [filters, setFilters] = useState({
    asset: 'all',
    session: 'all',
    setupType: 'all',
    minGrade: 'C' as SetupGrade,
    minConfidence: 50
  });

  // Load setups from database
  useEffect(() => {
    if (user) {
      loadSetups();
    }
  }, [user]);

  const loadSetups = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('trade_setups')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'ANALYZED')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Failed to load setups:', error);
      return;
    }
    
    // Convert database setups to ScannerResult format
    const scannerResults: ScannerResult[] = (data || []).map(setup => {
      const feedback = setup.ai_feedback as Record<string, any> | null;
      const v1Context = feedback?.v1_context || {};
      
      const layers = evaluateConfirmationLayers({
        direction: setup.direction as 'BUY' | 'SELL',
        market_structure: v1Context.market_structure || 'bullish',
        liquidity_sweep: v1Context.liquidity_sweep || 'none',
        session_context: v1Context.session_context || 'london',
        entry_price: setup.entry_price || 0,
        stop_loss: setup.stop_loss,
        take_profit: setup.take_profit,
        timeframe: setup.timeframe || '1H'
      });
      
      const { grade, score } = calculateGrade(layers);
      const tradePlan = generateTradePlan({
        entry_price: setup.entry_price || 0,
        stop_loss: setup.stop_loss,
        take_profit: setup.take_profit,
        direction: setup.direction as 'BUY' | 'SELL',
        pair: setup.pair
      });
      const warnings = generateWarnings({
        direction: setup.direction as 'BUY' | 'SELL',
        market_structure: v1Context.market_structure || 'bullish',
        session_context: v1Context.session_context || 'london'
      });
      
      return {
        id: setup.id,
        pair: setup.pair,
        direction: setup.direction as 'BUY' | 'SELL',
        grade,
        confidenceScore: setup.ai_score || score,
        layers,
        tradePlan,
        warnings,
        keyReason: generateKeyReason(layers),
        detectedAt: new Date(setup.created_at),
        timeDecay: 100
      };
    });
    
    setSetups(scannerResults);
  };

  const handleAnalysisComplete = async (setup: TradeSetup) => {
    setShowForm(false);
    await loadSetups();
    toast({
      title: "Setup Analyzed!",
      description: `${setup.pair} ${setup.direction} - Grade: ${setup.ai_feedback?.institutional_grade || 'B'}`
    });
  };

  const handleSaveToJournal = async (setup: ScannerResult) => {
    if (!user) return;
    
    try {
      const journalEntry = {
        user_id: user.id,
        pair: setup.pair,
        direction: setup.direction.toLowerCase(),
        entry_price: setup.tradePlan.entryZone.min,
        entry_time: new Date().toISOString(),
        strategy: `Scanner Grade ${setup.grade}`,
        status: 'PLANNED',
        notes: `Grade: ${setup.grade} | Confidence: ${setup.confidenceScore}%\n\nKey: ${setup.keyReason}`
      };

      const { error } = await supabase
        .from('journal_entries')
        .insert(journalEntry);

      if (error) throw error;

      toast({
        title: "Saved to Journal!",
        description: `${setup.pair} setup saved successfully`
      });
      
      setSelectedSetup(null);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Could not save to journal",
        variant: "destructive"
      });
    }
  };

  // Filter setups
  const gradeOrder: SetupGrade[] = ['A+', 'A', 'B', 'C', 'D'];
  const filteredSetups = setups.filter(setup => {
    // Grade filter
    const minGradeIdx = gradeOrder.indexOf(filters.minGrade);
    const setupGradeIdx = gradeOrder.indexOf(setup.grade);
    if (setupGradeIdx > minGradeIdx) return false;
    
    // Confidence filter
    if (setup.confidenceScore < filters.minConfidence) return false;
    
    // Asset filter
    if (filters.asset !== 'all') {
      if (filters.asset === 'gold' && setup.pair !== 'XAUUSD') return false;
      if (filters.asset === 'forex' && (setup.pair === 'XAUUSD' || setup.pair.includes('BTC') || setup.pair.includes('ETH'))) return false;
      if (filters.asset === 'crypto' && !setup.pair.includes('BTC') && !setup.pair.includes('ETH')) return false;
    }
    
    return true;
  });

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center gap-2">
                <Scan className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-bold">Setup Scanner</h1>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowForm(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Setup
            </Button>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {showForm ? (
            <div className="max-w-2xl mx-auto">
              <SetupForm onAnalysisComplete={handleAnalysisComplete} />
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              {/* Left: Filters */}
              <div className="col-span-12 lg:col-span-3">
                <ScannerFilters 
                  filters={filters} 
                  onFiltersChange={setFilters} 
                />
              </div>
              
              {/* Center: Live Feed */}
              <div className={`col-span-12 ${selectedSetup ? 'lg:col-span-5' : 'lg:col-span-9'}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-muted-foreground">
                      {filteredSetups.length} Setups
                    </h2>
                  </div>
                  
                  {filteredSetups.length === 0 ? (
                    <div className="text-center py-12">
                      <Scan className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Setups Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Add your first trading setup to get AI-powered analysis
                      </p>
                      <Button onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Setup
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {filteredSetups.map((setup) => (
                        <SetupCard
                          key={setup.id}
                          setup={setup}
                          onClick={() => setSelectedSetup(setup)}
                          isSelected={selectedSetup?.id === setup.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right: Detail Drawer */}
              {selectedSetup && (
                <div className="hidden lg:block lg:col-span-4">
                  <SetupDetailDrawer
                    setup={selectedSetup}
                    onClose={() => setSelectedSetup(null)}
                    onSaveToJournal={handleSaveToJournal}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Mobile Detail Drawer */}
        {selectedSetup && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md">
              <SetupDetailDrawer
                setup={selectedSetup}
                onClose={() => setSelectedSetup(null)}
                onSaveToJournal={handleSaveToJournal}
              />
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default SetupScanner;
