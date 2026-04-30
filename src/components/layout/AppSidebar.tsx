import {
  LayoutDashboard,
  BookOpen,
  FileBarChart,
  FileText,
  Zap,
  MessageCircle,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BoardsSidebarSection } from "./BoardsSidebarSection";
import emploiaHorizontalBranco from "../../../img/emploia-horizontal-branco@2x.png";

// Top navigation - before Boards
const topNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
];

// Bottom navigation - after Boards
const bottomNavItems = [
  { title: "Wiki", url: "/wiki", icon: BookOpen },
  { title: "Comunicações", url: "/comunicacoes", icon: MessageCircle },
  { title: "Relatórios", url: "/relatorios", icon: FileBarChart },
];

const toolsNavItems = [
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "Automações", url: "/automacoes", icon: Zap },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const renderNavItems = (items: typeof topNavItems) => (
    <SidebarMenu className="space-y-0.5">
      {items.map((item) => {
        const active = isActive(item.url);
        const Icon = item.icon;
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={item.title}
              className={cn(
                "group rounded-xl transition-all duration-200 h-9 px-3 border border-transparent hover:border-white/5",
                active
                  ? "bg-transparent text-white font-medium"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <NavLink to={item.url} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors border",
                    active
                      ? "border-transparent bg-[#3F1757] text-[#CBC5EA]"
                      : "border-transparent text-white/40 group-hover:text-white/80"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm">{item.title}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar
      collapsible="none"
      className={cn(
        "m-2 min-h-[calc(100svh-1rem)] w-[var(--sidebar-width)] shrink-0 rounded-xl overflow-hidden",
        "border border-white/10 dark:border-white/5",
        "shadow-lg shadow-black/5 dark:shadow-black/20",
        "text-[#E8DAB2]"
      )}
      style={{ backgroundColor: "#1E1E1E" }}
    >
      {/* Logo Header */}
      <SidebarHeader className="h-14 flex items-center justify-center border-b border-white/10 px-2">
        <div className="flex items-center justify-center">
          <img
            src={emploiaHorizontalBranco}
            alt="emplo.ia"
            className="h-6 w-auto object-contain"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 overflow-y-auto">
        {/* Top Navigation - Dashboard */}
        <SidebarGroup>
          <SidebarGroupContent>
            {renderNavItems(topNavItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Boards Section (Collapsible) */}
        <BoardsSidebarSection />

        {/* Bottom Navigation - Wiki, Reports */}
        <SidebarGroup>
          <SidebarGroupContent>
            {renderNavItems(bottomNavItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-3 bg-sidebar-border/50" />

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupContent>
            {renderNavItems(toolsNavItems)}
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  );
}
