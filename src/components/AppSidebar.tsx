import {
  LayoutDashboard, Ship, Truck, AlertTriangle, BarChart3,
  Activity, Brain, FileText, Zap, MessageSquare, Shield
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Control Tower", url: "/", icon: LayoutDashboard },
  { title: "Shipment Visibility", url: "/shipments", icon: Ship },
  { title: "Disruption Prediction", url: "/prediction", icon: Brain },
  { title: "Disruption Alerts", url: "/alerts", icon: AlertTriangle },
  { title: "Carrier Intelligence", url: "/carriers", icon: Truck },
  { title: "Scenario Simulator", url: "/simulator", icon: Zap },
  { title: "Resilience Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Compliance & Docs", url: "/documents", icon: FileText },
  { title: "AI Assistant", url: "/assistant", icon: MessageSquare },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">ResiliChain AI</h1>
              <p className="text-[10px] text-sidebar-foreground leading-tight">Supply Chain Control Tower</p>
            </div>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
