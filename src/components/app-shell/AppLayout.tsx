import { Outlet, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Home, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useState } from "react";
import VipUpgradeModal from "@/components/VipUpgradeModal";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { isPremium } = useSubscription();
  const [vipOpen, setVipOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#050505] text-foreground relative noise-overlay">
        {/* Ambient gold glow behind app */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div
            className="absolute top-0 left-1/3 h-[500px] w-[800px] rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(ellipse, rgba(212,175,55,0.12) 0%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />
        </div>
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 h-14 flex items-center justify-between border-b border-[#D4AF37]/15 bg-[#050505]/80 backdrop-blur-xl px-3">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-[#D4AF37] hover:bg-[#D4AF37]/10" />
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-[10px] tracking-[0.22em] uppercase text-white/40 hover:text-[#F4D03F] transition"
              >
                <Home className="h-3 w-3" />
                Home
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {!isPremium && (
                <Button
                  size="sm"
                  onClick={() => setVipOpen(true)}
                  className="btn-gold h-8 gap-1.5 px-3 text-xs tracking-wider"
                >
                  <Crown className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Inner Circle</span>
                  <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-bold">
                    −50%
                  </span>
                </Button>
              )}

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                      <Avatar className="h-8 w-8 ring-1 ring-[#D4AF37]/40">
                        <AvatarFallback className="bg-[#D4AF37]/15 text-[#F4D03F] border border-[#D4AF37]/30 text-xs font-display font-bold">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="flex-col items-start">
                      <div className="font-medium text-xs">{user.email}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {isPremium ? "VIP Member" : "Free Plan"}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>

          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
      <VipUpgradeModal open={vipOpen} onOpenChange={setVipOpen} />
    </SidebarProvider>
  );
}