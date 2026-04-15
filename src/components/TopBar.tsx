import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, Moon, Sun, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { alerts } from "@/data/mockData";
import { Input } from "@/components/ui/input";

export function TopBar() {
  const [dark, setDark] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [dark]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const activeAlerts = alerts.filter(a => a.status === 'active').length;

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-3 gap-3 shrink-0">
      <SidebarTrigger className="shrink-0" />

      <div className="flex items-center gap-2 text-primary font-semibold text-sm">
        <Activity className="h-4 w-4 animate-pulse-glow" />
        <span className="hidden sm:inline">LIVE</span>
      </div>

      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search shipments, alerts, carriers..." className="pl-8 h-8 text-sm bg-muted border-0" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground hidden md:block">
          Last synced: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        <button
          onClick={() => setDark(!dark)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button className="relative p-1.5 rounded-md hover:bg-muted text-muted-foreground">
          <Bell className="h-4 w-4" />
          {activeAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-medium">
              {activeAlerts}
            </span>
          )}
        </button>

        <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
          RC
        </div>
      </div>
    </header>
  );
}
