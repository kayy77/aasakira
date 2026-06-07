import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import AccountLayout from "./_AccountLayout";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("user_profiles")
        .select("username, phone_number, country")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setUsername(data.username || "");
        setPhone(data.phone_number || "");
        setCountry(data.country || "");
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await (supabase as any)
      .from("user_profiles")
      .upsert({ user_id: user.id, username, phone_number: phone, country }, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated" });
  };

  return (
    <AccountLayout title="Profile" subtitle="Your trader identity inside AASAKIRA.">
      <Card className="lux-glass p-6 max-w-2xl">
        {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" /> : (
          <div className="space-y-5">
            <Field label="Email" value={user?.email ?? ""} disabled />
            <div>
              <Label className="text-xs tracking-widest uppercase text-white/55">Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-2 bg-black/40 border-white/10" />
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-white/55">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 bg-black/40 border-white/10" />
            </div>
            <div>
              <Label className="text-xs tracking-widest uppercase text-white/55">Country</Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-2 bg-black/40 border-white/10" />
            </div>
            <Button onClick={save} disabled={saving} className="btn-gold rounded-full px-6 py-2.5 text-xs tracking-widest uppercase">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />} Save changes
            </Button>
          </div>
        )}
      </Card>
    </AccountLayout>
  );
}

function Field({ label, value, disabled }: { label: string; value: string; disabled?: boolean }) {
  return (
    <div>
      <Label className="text-xs tracking-widest uppercase text-white/55">{label}</Label>
      <Input value={value} disabled={disabled} readOnly={disabled} className="mt-2 bg-black/40 border-white/10 opacity-60" />
    </div>
  );
}