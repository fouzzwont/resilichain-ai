import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, Moon, Sun, Activity, Globe2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/state/WorkspaceProvider";
import { PARCEL_STATUS_LABELS } from "@/data/parcels";
import { cn } from "@/lib/utils";

export function TopBar() {
  const [dark, setDark] = useState(true);
  const [time, setTime] = useState(new Date());
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { parcels, metrics } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const results = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (search.length < 2) return [];
    return parcels
      .filter(
        (parcel) =>
          parcel.id.toLowerCase().includes(search) ||
          parcel.orderId.toLowerCase().includes(search) ||
          parcel.trackingNumber.toLowerCase().includes(search) ||
          parcel.customer.name.toLowerCase().includes(search) ||
          parcel.product.toLowerCase().includes(search) ||
          parcel.destinationCity.toLowerCase().includes(search),
      )
      .slice(0, 6);
  }, [parcels, query]);

  const goToParcel = (id: string) => {
    navigate(`/parcels/${id}`);
    setQuery("");
    setSearchOpen(false);
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-3 gap-3 shrink-0">
      <SidebarTrigger className="shrink-0" />

      <div className="flex items-center gap-2 text-primary font-semibold text-sm">
        <Activity className="h-4 w-4 animate-pulse-glow" />
        <span className="hidden sm:inline text-[11px] uppercase tracking-wider">Demo</span>
      </div>

      <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground lg:flex">
        <Globe2 className="h-3.5 w-3.5" />
        <span>China → US parcels</span>
      </div>

      <form
        className="flex-1 max-w-md mx-auto"
        onSubmit={(event) => {
          event.preventDefault();
          if (results[0]) goToParcel(results[0].id);
          else if (query.trim()) navigate(`/parcels?q=${encodeURIComponent(query.trim())}`);
        }}
      >
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 140)}
            placeholder="Search parcels, customers, tracking..."
            className="pl-8 h-8 text-sm bg-muted border-0"
          />
          {searchOpen && query.trim().length >= 2 && (
            <div
              className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-border bg-popover shadow-lg"
              onMouseDown={(event) => event.preventDefault()}
            >
              {results.length > 0 ? (
                results.map((parcel) => (
                  <button
                    key={parcel.id}
                    type="button"
                    onClick={() => goToParcel(parcel.id)}
                    className="flex w-full items-center justify-between gap-3 border-b border-border/60 px-3 py-2 text-left last:border-0 hover:bg-muted"
                  >
                    <span className="min-w-0">
                      <span className="font-mono text-[11px] font-medium text-primary">{parcel.id}</span>
                      <span className="ml-2 truncate text-xs text-card-foreground">{parcel.customer.name}</span>
                      <span className="block truncate text-[10px] text-muted-foreground">
                        {parcel.product} · {parcel.destinationCity}, {parcel.destinationState}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "status-badge shrink-0",
                        parcel.status === "delivered"
                          ? "bg-success/15 text-success"
                          : parcel.status === "exception"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {PARCEL_STATUS_LABELS[parcel.status]}
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-3 text-xs text-muted-foreground">
                  No parcel matches “{query.trim()}”.
                </p>
              )}
            </div>
          )}
        </div>
      </form>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground hidden md:block">
          Demo clock: {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>

        <button
          onClick={() => setDark(!dark)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          title="Toggle theme"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          onClick={() => navigate("/")}
          className="relative p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          title="Open exception desk"
        >
          <Bell className="h-4 w-4" />
          {metrics.openExceptions > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-destructive px-1 text-destructive-foreground text-[10px] flex items-center justify-center font-medium">
              {metrics.openExceptions}
            </span>
          )}
        </button>

        <div
          className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-semibold"
          title="Aster & Oak — demo workspace"
        >
          AO
        </div>
      </div>
    </header>
  );
}
