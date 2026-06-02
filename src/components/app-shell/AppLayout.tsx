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
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 h-14 flex items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur px-3">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
              >
                <Home className="h-3.5 w-3.5" />
                Marketing site
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {!isPremium && (
                <Button
                  size="sm"
                  onClick={() => setVipOpen(true)}
                  className="h-8 gap-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 border-0 font-semibold"
                >
                  <Crown className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Upgrade to VIP</span>
                  <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-bold">
                    −50%
                  </span>
                </Button>
              )}

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary border border-primary/30 text-xs">
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