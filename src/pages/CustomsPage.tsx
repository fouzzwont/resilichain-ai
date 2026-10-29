import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  FileCheck2,
  FileWarning,
  Landmark,
  Search,
  Timer,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { useWorkspace } from "@/state/WorkspaceProvider";
import {
  formatDate,
  formatDateTime,
  formatUsd,
  hoursSince,
  type CustomsStatus,
} from "@/data/parcels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<CustomsStatus, string> = {
  pending: "Not yet filed",
  held: "Held",
  duty_due: "Duty due",
  cleared: "Cleared",
};

const STATUS_STYLES: Record<CustomsStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  held: "bg-warning/15 text-warning",
  duty_due: "bg-destructive/15 text-destructive",
  cleared: "bg-success/15 text-success",
};

type Tab = "action" | "cleared" | "all";

export default function CustomsPage() {
  const { parcels, metrics } = useWorkspace();
  const [tab, setTab] = useState<Tab>("action");
  const [query, setQuery] = useState("");

  const customsParcels = useMemo(
    () => parcels.filter((parcel) => parcel.customs.status !== "pending"),
    [parcels],
  );

  const clearedThisWeek = useMemo(
    () =>
      customsParcels.filter(
        (parcel) =>
          parcel.customs.status === "cleared" &&
          parcel.customs.clearedAt &&
          hoursSince(parcel.customs.clearedAt) <= 24 * 7,
      ),
    [customsParcels],
  );

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return customsParcels
      .filter((parcel) => {
        if (tab === "action" && parcel.customs.status !== "held" && parcel.customs.status !== "duty_due") {
          return false;
        }
        if (tab === "cleared" && parcel.customs.status !== "cleared") return false;
        if (!search) return true;
        return (
          parcel.id.toLowerCase().includes(search) ||
          parcel.customer.name.toLowerCase().includes(search) ||
          (parcel.customs.entryNumber ?? "").toLowerCase().includes(search)
        );
      })
      .sort((a, b) => {
        const rank = (status: CustomsStatus) => (status === "duty_due" ? 0 : status === "held" ? 1 : 2);
        const diff = rank(a.customs.status) - rank(b.customs.status);
        if (diff !== 0) return diff;
        return new Date(a.promisedBy).getTime() - new Date(b.promisedBy).getTime();
      });
  }, [customsParcels, query, tab]);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Customs & duties</h1>
          <p className="text-sm text-muted-foreground">
            Held parcels, missing documents, and duty payments across the US import gateway
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <KpiCard
            title="Held at customs"
            value={metrics.customsHeld}
            subtitle={`${formatUsd(
              parcels
                .filter((parcel) => parcel.customs.status === "held")
                .reduce((sum, parcel) => sum + parcel.declaredValueUsd, 0),
            )} declared value`}
            icon={Landmark}
            variant="warning"
          />
          <KpiCard
            title="Duty due"
            value={metrics.dutyDue}
            subtitle={formatUsd(
              parcels
                .filter((parcel) => parcel.customs.status === "duty_due")
                .reduce((sum, parcel) => sum + parcel.customs.dutyUsd + parcel.customs.taxUsd, 0),
            )}
            icon={FileWarning}
            variant="critical"
          />
          <KpiCard
            title="Missing documents"
            value={metrics.missingDocs}
            subtitle="blocking release"
            icon={FileCheck2}
            variant="warning"
          />
          <KpiCard
            title="Avg customs dwell"
            value={`${metrics.avgCustomsDwellDays}d`}
            subtitle="held parcels"
            icon={Timer}
          />
          <KpiCard
            title="Cleared this week"
            value={clearedThisWeek.length}
            subtitle={`${metrics.resolvedExceptions} exceptions resolved`}
            icon={CheckCircle2}
            variant="success"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-border bg-card p-0.5">
            {(
              [
                ["action", "Action needed"],
                ["cleared", "Cleared"],
                ["all", "All cases"],
              ] as Array<[Tab, string]>
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  tab === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search parcel, customer, entry number..."
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Parcel", "Customs case", "Status", "Duty + tax", "Documents", "Held since", "Dwell", ""].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((parcel) => {
                  const dwell = parcel.customs.heldSince
                    ? Math.max(0, Math.floor(hoursSince(parcel.customs.heldSince) / 24))
                    : 0;
                  return (
                    <tr key={parcel.id} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                      <td className="px-3 py-3">
                        <Link to={`/parcels/${parcel.id}`} className="font-mono text-xs font-medium text-primary">
                          {parcel.id}
                        </Link>
                        <p className="text-[11px] text-muted-foreground">
                          {parcel.destinationCity}, {parcel.destinationState}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs text-card-foreground">{parcel.product}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {parcel.customs.entryNumber ?? "Not filed"}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn("status-badge", STATUS_STYLES[parcel.customs.status])}>
                          {STATUS_LABELS[parcel.customs.status]}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {formatUsd(parcel.customs.dutyUsd + parcel.customs.taxUsd)}
                      </td>
                      <td className="px-3 py-3">
                        {parcel.customs.missingDocs.length > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            {parcel.customs.missingDocs.map((doc) => (
                              <span key={doc} className="text-[11px] text-warning">
                                {doc}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Complete</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {parcel.customs.heldSince ? formatDate(parcel.customs.heldSince) : "—"}
                        {parcel.customs.clearedAt && parcel.customs.status === "cleared" && (
                          <p className="text-[11px] text-success">
                            Cleared {formatDateTime(parcel.customs.clearedAt)}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "text-xs",
                            dwell >= 3 ? "font-medium text-warning" : "text-muted-foreground",
                          )}
                        >
                          {parcel.customs.heldSince ? `${dwell}d` : "—"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                          <Link to={`/parcels/${parcel.id}`}>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <p className="text-sm font-medium">No customs cases in this view</p>
              <p className="text-xs text-muted-foreground">
                Switch to “All cases” to see cleared entries, or reset the demo workspace.
              </p>
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Customs statuses are simulated. In production, entry numbers, duty amounts, and document requests would
          arrive from a broker or carrier customs API.
        </p>
      </div>
    </AppLayout>
  );
}
