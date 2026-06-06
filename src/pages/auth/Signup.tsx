import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import AuthShell from "./AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(128),
});

export default function Signup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/onboarding";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: "Check your details", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { emailRedirectTo: `${window.location.origin}/onboarding` },
      });
      if (error) throw error;
      toast({
        title: "Account created",
        description: data.session
          ? "Welcome to AASAKIRA."
          : "Check your email to verify your account, then sign in.",
      });
      if (data.session) {
        navigate(next, { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err: any) {
      toast({
        title: "Sign up failed",
        description: err?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create Your Trading Workspace"
      subtitle="Sign signals, verify your account, unlock AASAKIRA."
      footer={
        <>
          Already a member?{" "}
          <Link to="/login" className="text-[#F4D03F] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs tracking-wider uppercase text-white/60">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/10 focus-visible:border-[#D4AF37]/50" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs tracking-wider uppercase text-white/60">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/40 border-white/10 focus-visible:border-[#D4AF37]/50" />
          <p className="text-[10px] text-white/40 mt-1">Minimum 8 characters.</p>
        </div>
        <Button type="submit" disabled={loading} className="btn-gold w-full h-11 mt-2 tracking-widest uppercase text-xs">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}