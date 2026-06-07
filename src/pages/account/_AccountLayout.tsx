import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { User, Link2, ShieldCheck, Bell, Lock, Brain } from "lucide-react";

const tabs = [
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/trading-accounts", label: "Trading Accounts", icon: Link2 },
  { to: "/account/verification", label: "Verification", icon: ShieldCheck },
  { to: "/account/notifications", label: "Notifications", icon: Bell },
  { to: "/account/security", label: "Security", icon: Lock },
  { to: "/account/ai-preferences", label: "AI Preferences", icon: Brain },
];

export default function AccountLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37]/70">Account</div>
          <h1 className="mt-2 font-display text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-white/55">{subtitle}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
          <nav className="space-y-1">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition ${
                    isActive
                      ? "bg-[#D4AF37]/10 text-[#F4D03F] border-l-2 border-[#D4AF37]"
                      : "text-white/60 hover:text-white hover:bg-white/[0.03]"
                  }`
                }
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </NavLink>
            ))}
          </nav>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}