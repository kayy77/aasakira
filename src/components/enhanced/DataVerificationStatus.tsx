import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Activity, 
  Clock, 
  RefreshCw, 
  ExternalLink,
  Target,
  Zap
} from 'lucide-react';

interface SourceStatus {
  source_name: string;
  last_check: string;
  status: 'ACTIVE' | 'FAILED' | 'DEGRADED';
  error_message?: string;
  events_count: number;
  response_time_ms?: number;
}

interface VerificationResult {
  event_title: string;
  event_currency: string;
  matches_count: number;
  sources: string[];
  conflicts: string[];
  consensus_score: number;
  verified_at: string;
}

const DataVerificationStatus: React.FC = () => {
  const [sources, setSources] = useState<SourceStatus[]>([]);
  const [verifications, setVerifications] = useState<VerificationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [stats, setStats] = useState({
    sourcesActive: 0,
    totalSources: 0,
    lastUpdate: null as string | null
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVerificationStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchVerificationStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('data-verification-engine', {
        body: { action: 'status' }
      });

      if (error) throw error;

      setSources(data.heartbeats || []);
      setVerifications(data.verifications || []);
      setStats({
        sourcesActive: data.sourcesActive || 0,
        totalSources: data.totalSources || 0,
        lastUpdate: data.lastUpdate
      });
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const runVerification = async () => {
    try {
      setVerifying(true);
      
      const { data, error } = await supabase.functions.invoke('data-verification-engine', {
        body: { action: 'cross-check' }
      });

      if (error) throw error;

      toast({
        title: "🔍 Cross-Verification Complete",
        description: `${data.eventsVerified} events verified, ${data.highConfidenceEvents} high-confidence matches from ${data.sourcesUsed.length} sources`,
      });

      await fetchVerificationStatus();
    } catch (error) {
      console.error('Verification failed:', error);
      toast({
        title: "Verification Failed",
        description: "Unable to perform cross-verification",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'DEGRADED': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'DEGRADED': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'FAILED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatLastUpdate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading verification status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <CardTitle>Data Verification Status</CardTitle>
              <Badge variant="secondary" className="ml-2">Real-Time</Badge>
            </div>
            <Button 
              onClick={runVerification}
              disabled={verifying}
              size="sm"
              className="gap-2"
            >
              {verifying ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Target className="w-4 h-4" />
              )}
              Cross-Verify Now
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.sourcesActive}</div>
              <div className="text-sm text-muted-foreground">Active Sources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{verifications.filter(v => v.consensus_score >= 0.8).length}</div>
              <div className="text-sm text-muted-foreground">High Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{verifications.filter(v => v.conflicts.length > 0).length}</div>
              <div className="text-sm text-muted-foreground">Conflicts Detected</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Source Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Data Source Heartbeat
            {stats.lastUpdate && (
              <Badge variant="outline" className="text-xs">
                Updated {formatLastUpdate(stats.lastUpdate)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {sources.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No source data available</p>
              </div>
            ) : (
              sources.map((source) => (
                <div key={source.source_name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(source.status)}
                    <div>
                      <div className="font-medium">{source.source_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {source.events_count} events
                        {source.response_time_ms && ` • ${source.response_time_ms}ms`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getStatusColor(source.status)} border`}>
                      {source.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {formatLastUpdate(source.last_check)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Verifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Recent Cross-Verifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {verifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No verification data available</p>
              </div>
            ) : (
              verifications.slice(0, 5).map((verification, index) => (
                <div key={index} className="p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{verification.event_title}</div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`text-xs ${
                          verification.consensus_score >= 0.9 ? 'bg-green-500/20 text-green-400' :
                          verification.consensus_score >= 0.7 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        } border`}
                      >
                        {Math.round(verification.consensus_score * 100)}% consensus
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>{verification.matches_count} sources matched</span>
                      <span>{verification.event_currency}</span>
                      {verification.conflicts.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {verification.conflicts.length} conflicts
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {verification.sources.map((source) => (
                        <Badge key={source} variant="secondary" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {verification.conflicts.length > 0 && (
                    <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                      <div className="text-sm text-red-400">
                        <strong>Conflicts:</strong> {verification.conflicts.join('; ')}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transparency Badge */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">Full Transparency</div>
                <div className="text-sm text-muted-foreground">
                  Data sourced from {sources.filter(s => s.status === 'ACTIVE').length} live providers with cross-verification
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last updated: {stats.lastUpdate ? formatLastUpdate(stats.lastUpdate) : 'Never'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataVerificationStatus;