import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AccountLayout from "./_AccountLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Security() {
  const { toast } = useToast();
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const update = async () => {
    if (pw.length < 8) return toast({ title: "Min 8 characters", variant: "destructive" });
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Password updated" }); setPw(""); }
  };

  return (
    <AccountLayout title="Security" subtitle="Account protection and session control.">
      <Card className="lux-glass p-6 max-w-xl space-y-4">
        <Label className="text-xs tracking-widest uppercase text-white/55">New password</Label>
        <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="bg-black/40 border-white/10" />
        <Button onClick={update} disabled={loading} className="btn-gold rounded-full px-6 py-2.5 text-xs tracking-widest uppercase">
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />} Update password
        </Button>
      </Card>
    </AccountLayout>
  );
}