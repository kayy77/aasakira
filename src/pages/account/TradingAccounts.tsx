import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Activity,
  Brain,
  CheckCircle2,
  LineChart,
  Shield,
  Sparkles,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ConnectTradingAccountFlow from "@/components/trading-accounts/ConnectTradingAccountFlow";
import { LinkIcon, ExternalLink } from "lucide-react";

export default function TradingAccounts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFlow, setShowFlow] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("trading_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setAccounts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const handleSync = async (id: string) => {
    setSyncing(id);
    try {
      const { data, error } = await supabase.functions.invoke("trading-account-sync", {
        body: { account_id: id },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast({ title: "Account synced", description: "Latest data imported." });
      await load();
    } catch (err: any) {
      toast({ title: "Sync failed", description: err?.message, variant: "destructive" });
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm("Disconnect this trading account? Historical data will be removed.")) return;
    const { error } = await supabase.from("trading_accounts").delete().eq("id", id);
    if (error) {
      toast({ title: "Couldn't disconnect", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Disconnected" });
    await load();
  };

  if (showFlow) {
    return (
      <ConnectTradingAccountFlow
        onClose={() => setShowFlow(false)}
        onComplete={async () => {
          setShowFlow(false);
          await load();
        }}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8 pb-6 border-b border-[#D4AF37]/15">
        <div className="flex items-center gap-3 text-[10px] tracking-[0.32em] uppercase text-[#D4AF37] mb-3">
          <span className="h-px w-8 bg-[#D4AF37]/50" />
          Settings · Trading Accounts
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Trading Account <span className="gold-text">Connections</span>
        </h1>
        <p className="text-sm text-white/55 mt-2 max-w-xl">
          Connect your trading account so AASAKIRA can analyze your performance and surface personalized insights.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
        </div>
      ) : accounts.length === 0 ? (
        <>
          <MyfxbookConnectCard />
          <div className="h-4" />
          <IntroCard onConnect={() => setShowFlow(true)} />
        </>
      ) : (
        <div className="space-y-4">
          <MyfxbookConnectCard />
          {accounts.map((a) => (
            <Card key={a.id} className="lux-glass border-[#D4AF37]/15">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-[#F4D03F]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-display text-lg font-semibold">{a.account_name}</div>
                      <Badge
                        variant="outline"
                        className={
                          a.status === "active"
                            ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10 text-[10px] tracking-widest"
                            : a.status === "error"
                            ? "border-rose-500/40 text-rose-300 bg-rose-500/10 text-[10px] tracking-widest"
                            : "border-white/20 text-white/60 text-[10px] tracking-widest"
                        }
                      >
                        {a.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-white/55 mt-1 font-mono-pro">
                      {[a.broker, a.account_login, a.server, a.currency].filter(Boolean).join(" · ")}
                    </div>
                    {a.last_sync_at && (
                      <div className="text-[10px] text-white/40 mt-1 tracking-wider uppercase">
                        Last sync · {new Date(a.last_sync_at).toLocaleString()}
                      </div>
                    )}
                    {a.last_error && (
                      <div className="text-[11px] text-rose-300 mt-1">{a.last_error}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(a.id)}
                    disabled={syncing === a.id}
                    className="border-[#D4AF37]/30 hover:bg-[#D4AF37]/10"
                  >
                    {syncing === a.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    <span className="ml-1.5">Sync</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(a.id)}
                    className="text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button onClick={() => setShowFlow(true)} className="btn-gold w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1.5" />
            Connect another account
          </Button>
        </div>
      )}
    </div>
  );
}

function IntroCard({ onConnect }: { onConnect: () => void }) {
  const benefits = [
    { icon: LineChart, text: "Personal performance analytics" },
    { icon: Brain, text: "AI-powered trading insights" },
    { icon: Shield, text: "Risk analysis" },
    { icon: Sparkles, text: "Trader Score" },
    { icon: CheckCircle2, text: "Automated performance reviews" },
    { icon: Activity, text: "Progress tracking" },
  ];
  return (
    <Card className="lux-glass border-[#D4AF37]/20 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <CardContent className="p-8 sm:p-10 relative">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
          Want to connect your <span className="gold-text">trading account?</span>
        </h2>
        <p className="text-sm text-white/60 mt-3 max-w-xl">
          Connect your trading account to unlock the full AASAKIRA intelligence layer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-7">
          {benefits.map((b) => {
            const I = b.icon;
            return (
              <div key={b.text} className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5">
                <I className="h-3.5 w-3.5 text-[#F4D03F]" />
                <span className="text-sm text-white/80">{b.text}</span>
              </div>
            );
          })}
        </div>

        <Button onClick={onConnect} className="btn-gold mt-8 h-11 px-6 tracking-widest uppercase text-xs">
          Connect Trading Account
        </Button>
      </CardContent>
    </Card>
  );
}