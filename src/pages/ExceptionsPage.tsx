import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  DollarSign,
  Info,
  PackageSearch,
  RotateCcw,
  ShieldAlert,
  Timer,
  TrendingDown,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { ExceptionStatusBadge, SeverityBadge } from "@/components/StatusBadge";
import { useWorkspace } from "@/state/WorkspaceProvider";
import {
  EXCEPTION_LABELS,
  daysFromNow,
  formatDate,
  formatUsd,
  promiseLabel,
  sortExceptions,
} from "@/data/parcels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ExceptionsPage() {
  const { records, metrics, resetWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("active");

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return sortExceptions(records).filter(({ parcel, exception }) => {
      if (status === "active" && exception.status === "resolved") return false;
      if (status !== "all" && status !== "active" && exception.status !== status) return false;
      if (severity !== "all" && exception.severity !== severity) return false;
      if (type !== "all" && exception.type !== type) return false;
      if (!search) return true;
      return (
        parcel.id.toLowerCase().includes(search) ||
        parcel.orderId.toLowerCase().includes(search) ||
        parcel.customer.name.toLowerCase().includes(search) ||
        parcel.destinationCity.toLowerCase().includes(search) ||
        exception.title.toLowerCase().includes(search)
      );
    });
  }, [records, query, severity, type, status]);

  const reset = () => {
    resetWorkspace();
    toast.success("Demo workspace regenerated", {
      description: "A fresh set of seeded parcels and exceptions is ready.",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Exception desk</h1>
            <p className="text-sm text-muted-foreground">
              Cross-border parcels that need a decision, ranked by promise risk and exposure
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-badge bg-info/15 text-info">Demo workspace</span>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={reset}>
              <RotateCcw className="mr-1.5 h-3 w-3" />
              Reset demo
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-info/25 bg-info/5 px-3 py-2.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
          <p>
            This is a synthetic workspace for {metrics.totalParcels} parcels on the China → US corridor. Names,
            tracking numbers, and carrier events are generated from a fixed seed.{" "}
            <Link to="/connections" className="font-medium text-primary underline-offset-2 hover:underline">
              See how real connectors would work
            </Link>
            .
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            title="Open exceptions"
            value={metrics.openExceptions}
            subtitle={`${metrics.inProgressExceptions} in progress`}
            icon={AlertTriangle}
            variant="critical"
          />
          <KpiCard
            title="Critical"
            value={metrics.criticalExceptions}
            subtitle="need action today"
            icon={ShieldAlert}
            variant="critical"
          />
          <KpiCard
            title="Exposure at risk"
            value={formatUsd(metrics.exposureAtRiskUsd)}
            subtitle="refund + reship + support"
            icon={DollarSign}
            variant="warning"
          />
          <KpiCard
            title="Promise at risk"
            value={metrics.promiseAtRisk}
            subtitle={`${metrics.activeParcels} active parcels`}
            icon={Clock}
            variant="warning"
          />
          <KpiCard
            title="In customs"
            value={metrics.customsHeld + metrics.dutyDue}
            subtitle={`${metrics.missingDocs} missing documents`}
            icon={PackageSearch}
          />
          <KpiCard
            title="Avg resolution"
            value={`${metrics.avgResolutionHours}h`}
            subtitle={`${metrics.resolvedExceptions} resolved`}
            icon={Timer}
            variant="success"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <PackageSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search parcel, order, customer, city..."
              className="h-8 pl-8 text-sm"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-[132px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="open">Open only</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="all">All statuses</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="h-8 w-[124px] text-xs">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 w-[156px] text-xs">
              <SelectValue placeholder="Exception type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(EXCEPTION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Parcel", "Exception", "Severity", "Promise", "Exposure", "Status", ""].map((heading) => (
                    <th
                      key={heading}
                      className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ parcel, exception }) => {
                  const overdue = daysFromNow(parcel.promisedBy) < 0;
                  return (
                    <tr
                      key={parcel.id}
                      onClick={() => navigate(`/parcels/${parcel.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          navigate(`/parcels/${parcel.id}`);
                        }
                      }}
                      tabIndex={0}
                      role="link"
                      className="cursor-pointer border-b border-border/70 transition-colors last:border-0 hover:bg-muted/40 focus:bg-muted/50 focus:outline-none"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                            {parcel.destinationState}
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-xs font-medium text-primary">{parcel.id}</p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {parcel.customer.name} · {parcel.destinationCity}, {parcel.destinationState}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[280px] px-3 py-3">
                        <p className="truncate text-xs font-medium text-card-foreground">{exception.title}</p>
                        <p className="text-[11px] text-muted-foreground">{EXCEPTION_LABELS[exception.type]}</p>
                      </td>
                      <td className="px-3 py-3">
                        <SeverityBadge severity={exception.severity} />
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs text-card-foreground">{formatDate(parcel.promisedBy)}</p>
                        <p className={overdue ? "text-[11px] font-medium text-destructive" : "text-[11px] text-muted-foreground"}>
                          {promiseLabel(parcel.promisedBy)}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs font-semibold text-card-foreground">{formatUsd(exception.exposureUsd)}</p>
                        <p className="text-[11px] text-muted-foreground">potential</p>
                      </td>
                      <td className="px-3 py-3">
                        <ExceptionStatusBadge status={exception.status} />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <div className="rounded-full bg-success/10 p-3 text-success">
                <TrendingDown className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">No exceptions match these filters</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Try clearing the search or switching the status filter to see resolved exceptions.
              </p>
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          {filtered.length} of {records.length} exceptions shown · sorted by status, severity, and promise risk.
        </p>
      </div>
    </AppLayout>
  );
}
