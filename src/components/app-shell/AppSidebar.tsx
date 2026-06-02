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
  CreditCard,
  Sparkles,
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
      { title: "Live Signals", url: "/live-signals", icon: Signal },
      { title: "Signal History", url: "/live-signals", icon: History },
      { title: "Trade Copier", url: "#", icon: Copy, soon: true },
      { title: "Market Scanner", url: "#", icon: Radar, soon: true },
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
      { title: "Settings", url: "#", icon: Settings, soon: true },
      { title: "Billing", url: "/pricing", icon: CreditCard },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  const isActive = (url: string) => url !== "#" && pathname === url;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarHeader className="px-4 py-4">
        {!collapsed ? (
          <span className="text-lg font-bold tracking-wide gradient-text">
            AASAKIRA
          </span>
        ) : (
          <span className="text-lg font-bold gradient-text">A</span>
        )}
      </SidebarHeader>
      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const disabled = item.soon;
                  return (
                    <SidebarMenuItem key={`${group.label}-${item.title}`}>
                      <SidebarMenuButton
                        asChild={!disabled}
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                        className={
                          disabled
                            ? "opacity-60 cursor-not-allowed pointer-events-none"
                            : ""
                        }
                      >
                        {disabled ? (
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {!collapsed && (
                              <>
                                <span className="flex-1">{item.title}</span>
                                <Badge
                                  variant="outline"
                                  className="text-[9px] py-0 px-1 h-4 border-border/60 text-muted-foreground"
                                >
                                  Soon
                                </Badge>
                              </>
                            )}
                          </div>
                        ) : (
                          <NavLink to={item.url} className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {!collapsed && <span>{item.title}</span>}
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