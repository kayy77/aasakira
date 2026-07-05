import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Signal,
  History,
  Copy,
  Radar,
  Calculator,
  Percent,
  CalendarDays,
  BookOpen,
  GraduationCap,
  Users,
  Trophy,
  CalendarClock,
  Radio,
  PlayCircle,
  Settings,
  Sparkles,
  Link2,
  User,
  ShieldCheck,
  Bell,
  Lock,
  Brain,
  MessageSquare,
  Repeat,
  Users2,
  Activity,
  ShieldAlert,
  BarChart3,
  Cog,
  Shield,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

type Item = {
  title: string;
  url: string;
  icon: any;
  soon?: boolean;
};

type Group = { label: string; items: Item[] };

const GROUPS: Group[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Trading",
    items: [
      { title: "Signal Command", url: "/signals", icon: Signal },
      { title: "Signal History", url: "/signals", icon: History },
      { title: "Trade Review", url: "/trade-review", icon: MessageSquare },
      { title: "Trade Copier", url: "#", icon: Copy, soon: true },
      { title: "Market Scanner", url: "#", icon: Radar, soon: true },
    ],
  },
  {
    label: "Copy Trading",
    items: [
      { title: "Overview", url: "/copy", icon: Repeat },
      { title: "My Accounts", url: "/copy/accounts", icon: Link2 },
      { title: "Masters", url: "/copy/masters", icon: Users2 },
      { title: "Copy Activity", url: "/copy/activity", icon: Activity },
      { title: "Risk Settings", url: "/copy/risk", icon: ShieldAlert },
      { title: "Performance", url: "/copy/performance", icon: BarChart3 },
      { title: "Settings", url: "/copy/settings", icon: Cog },
      { title: "Admin", url: "/copy/admin", icon: Shield },
    ],
  },
  {
    label: "Tools",
    items: [
      { title: "Lot Size Calculator", url: "/tools/lot-size", icon: Calculator },
      { title: "Risk Calculator", url: "#", icon: Percent, soon: true },
      { title: "Economic Calendar", url: "#", icon: CalendarDays, soon: true },
      { title: "Trading Journal", url: "#", icon: BookOpen, soon: true },
    ],
  },
  {
    label: "Academy",
    items: [
      { title: "Beginner", url: "#", icon: GraduationCap, soon: true },
      { title: "Intermediate", url: "#", icon: GraduationCap, soon: true },
      { title: "Advanced", url: "#", icon: GraduationCap, soon: true },
      { title: "Elite", url: "#", icon: Sparkles, soon: true },
    ],
  },
  {
    label: "Community",
    items: [
      { title: "Feed", url: "#", icon: Users, soon: true },
      { title: "Wins & Progress", url: "#", icon: Trophy, soon: true },
      { title: "Events", url: "#", icon: CalendarClock, soon: true },
    ],
  },
  {
    label: "Live",
    items: [
      { title: "Live Sessions", url: "#", icon: Radio, soon: true },
      { title: "Replays", url: "#", icon: PlayCircle, soon: true },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Profile", url: "/account/profile", icon: User },
      { title: "Trading Accounts", url: "/account/trading-accounts", icon: Link2 },
      { title: "Verification", url: "/account/verification", icon: ShieldCheck },
      { title: "Notifications", url: "/account/notifications", icon: Bell },
      { title: "Security", url: "/account/security", icon: Lock },
      { title: "AI Preferences", url: "/account/ai-preferences", icon: Brain },
      { title: "Billing", url: "#", icon: Settings, soon: true },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  const isActive = (url: string) => url !== "#" && pathname === url;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[#D4AF37]/15 bg-[#050505]"
    >
      <SidebarHeader className="px-4 py-5 border-b border-[#D4AF37]/10">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[#F4D03F] via-[#D4AF37] to-[#8B6914] gold-glow-sm flex items-center justify-center">
              <span className="font-display text-xs font-bold text-black">A</span>
            </div>
            <span className="font-display text-base font-bold tracking-[0.28em] gold-text">
              AASAKIRA
            </span>
          </div>
        ) : (
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[#F4D03F] via-[#D4AF37] to-[#8B6914] gold-glow-sm flex items-center justify-center mx-auto">
            <span className="font-display text-xs font-bold text-black">A</span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.28em] text-[#D4AF37]/60 font-medium">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const disabled = item.soon;
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={`${group.label}-${item.title}`}>
                      <SidebarMenuButton
                        asChild={!disabled}
                        isActive={active}
                        tooltip={item.title}
                        className={
                          disabled
                            ? "opacity-50 cursor-not-allowed pointer-events-none"
                            : active
                            ? "bg-[#D4AF37]/10 text-[#F4D03F] border-l-2 border-[#D4AF37] gold-glow-sm"
                            : "hover:bg-[#D4AF37]/5 hover:text-[#F4D03F] transition-all"
                        }
                      >
                        {disabled ? (
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-white/40" />
                            {!collapsed && (
                              <>
                                <span className="flex-1 text-white/55 text-[13px]">{item.title}</span>
                                <Badge
                                  variant="outline"
                                  className="text-[8px] py-0 px-1.5 h-4 border-[#D4AF37]/30 text-[#D4AF37]/70 tracking-widest uppercase"
                                >
                                  Soon
                                </Badge>
                              </>
                            )}
                          </div>
                        ) : (
                          <NavLink to={item.url} className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${active ? "text-[#F4D03F]" : ""}`} />
                            {!collapsed && <span className="text-[13px] tracking-wide">{item.title}</span>}
                          </NavLink>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;