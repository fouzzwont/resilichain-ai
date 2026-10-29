import { useMemo } from "react";
import { Link } from "react-router-dom";
import { addDays, differenceInHours, eachWeekOfInterval, format, startOfWeek } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Info,
  MessageSquare,
  ShieldCheck,
  Timer,
  TrendingUp,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { useWorkspace } from "@/state/WorkspaceProvider";
import {
  EXCEPTION_LABELS,
  EXCEPTION_SHORT_LABELS,
  formatDate,
  formatDateTime,
  formatUsd,
  getExceptionRecords,
  type ExceptionType,
} from "@/data/parcels";

const COLORS = {
  primary: "hsl(var(--primary))",
  success: "hsl(152, 55%, 40%)",
  warning: "hsl(38, 92%, 50%)",
  critical: "hsl(0, 72%, 51%)",
  muted: "hsl(var(--muted-foreground))",
};

const chartTooltip = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

export default function ImpactPage() {
  const { parcels, metrics, generatedAt, seed } = useWorkspace();
  const records = useMemo(() => getExceptionRecords(parcels), [parcels]);
  const now = useMemo(() => new Date(), []);

  const weekly = useMemo(() => {
    const delivered = parcels.filter((parcel) => parcel.status === "delivered" && parcel.deliveredAt);
    if (delivered.length === 0) return [];
    const earliest = delivered.reduce((min, parcel) => {
      const value = new Date(parcel.deliveredAt as string).getTime();
      return value < min ? value : min;
    }, Number.POSITIVE_INFINITY);
    const start = startOfWeek(new Date(earliest), { weekStartsOn: 1 });
    const end = startOfWeek(now, { weekStartsOn: 1 });
    const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).slice(-6);

    return weeks.map((week) => {
      const weekEnd = addDays(week, 7);
      const rows = delivered.filter((parcel) => {
        const deliveredAt = new Date(parcel.deliveredAt as string);
        return deliveredAt >= week && deliveredAt < weekEnd;
      });
      const onTime = rows.filter(
        (parcel) =>
          new Date(parcel.deliveredAt as string).getTime() <= new Date(parcel.promisedBy).getTime(),
      ).length;
      return {
        week: format(week, "MMM d"),
        onTime: rows.length > 0 ? Math.round((onTime / rows.length) * 100) : null,
        delivered: rows.length,
      };
    });
  }, [parcels, now]);

  const exceptionMix = useMemo(
    () =>
      Object.keys(EXCEPTION_LABELS)
        .map((type) => {
          const rows = records.filter((record) => record.exception.type === type);
          return {
            type: EXCEPTION_SHORT_LABELS[type as ExceptionType],
            open: rows.filter((record) => record.exception.status !== "resolved").length,
            resolved: rows.filter((record) => record.exception.status === "resolved").length,
          };
        })
        .filter((row) => row.open + row.resolved > 0),
    [records],
  );

  const exposureByType = useMemo(() => {
    const map = new Map<string, number>();
    records
      .filter((record) => record.exception.status !== "resolved")
      .forEach((record) => {
        const label = EXCEPTION_SHORT_LABELS[record.exception.type];
        map.set(label, (map.get(label) ?? 0) + record.exception.exposureUsd);
      });
    return Array.from(map.entries())
      .map(([type, exposure]) => ({ type, exposure }))
      .sort((a, b) => b.exposure - a.exposure);
  }, [records]);

  const outcomes = useMemo(
    () => [
      { name: "Open", value: records.filter((r) => r.exception.status === "open").length, fill: COLORS.critical },
      {
        name: "In progress",
        value: records.filter((r) => r.exception.status === "in_progress").length,
        fill: COLORS.warning,
      },
      {
        name: "Resolved",
        value: records.filter((r) => r.exception.status === "resolved").length,
        fill: COLORS.success,
      },
    ],
    [records],
  );

  const resolvedLedger = useMemo(
    () =>
      records
        .filter((record) => record.exception.status === "resolved" && record.exception.resolvedAt)
        .sort(
          (a, b) =>
            new Date(b.exception.resolvedAt as string).getTime() -
            new Date(a.exception.resolvedAt as string).getTime(),
        )
        .slice(0, 6),
    [records],
  );

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-foreground">Impact</h1>
            <p className="text-sm text-muted-foreground">
              What the exception desk protected — exposure, resolution speed, and promise performance
            </p>
          </div>
          <span className="status-badge bg-info/15 text-info">Demo estimates</span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            title="Exposure protected"
            value={formatUsd(metrics.exposureProtectedUsd)}
            subtitle="resolved exceptions"
            icon={ShieldCheck}
            variant="success"
          />
          <KpiCard
            title="Resolved"
            value={metrics.resolvedExceptions}
            subtitle="exception records"
            icon={CheckCircle2}
            variant="success"
          />
          <KpiCard
            title="Avg resolution"
            value={`${metrics.avgResolutionHours}h`}
            subtitle="detected → resolved"
            icon={Timer}
          />
          <KpiCard
            title="On-time rate"
            value={`${metrics.onTimeRate}%`}
            subtitle={`${metrics.deliveredOnTime}/${metrics.deliveredParcels} delivered`}
            icon={TrendingUp}
          />
          <KpiCard
            title="WISMO deflected"
            value={metrics.wismoTicketsDeflected}
            subtitle="estimated tickets"
            icon={MessageSquare}
          />
          <KpiCard
            title="Support cost avoided"
            value={formatUsd(metrics.supportCostAvoidedUsd)}
            subtitle="estimated, $18/ticket"
            icon={DollarSign}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4 xl:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">On-time delivery trend</h3>
                <p className="text-[11px] text-muted-foreground">Delivered parcels by promise week</p>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {metrics.deliveredParcels} delivered
              </span>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: COLORS.muted }} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: COLORS.muted }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={chartTooltip}
                  formatter={(value: number | null, name: string) =>
                    name === "onTime" ? [`${value ?? 0}%`, "On time"] : [value ?? 0, "Delivered"]
                  }
                />
                <Line
                  type="monotone"
                  dataKey="onTime"
                  stroke={COLORS.success}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                  isAnimationActive={false}
                  name="onTime"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-card-foreground">Exception outcomes</h3>
            <p className="text-[11px] text-muted-foreground">All records in the workspace</p>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={outcomes}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {outcomes.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-card-foreground">Exception mix</h3>
            <p className="text-[11px] text-muted-foreground">Open vs resolved by type</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={exceptionMix} margin={{ top: 12, right: 4, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 9, fill: COLORS.muted }}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={58}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: COLORS.muted }} />
                <Tooltip contentStyle={chartTooltip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="open"
                  stackId="a"
                  fill={COLORS.critical}
                  name="Open"
                  radius={[0, 0, 0, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="resolved"
                  stackId="a"
                  fill={COLORS.success}
                  name="Resolved"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-card-foreground">Open exposure by cause</h3>
            <p className="text-[11px] text-muted-foreground">Potential refund, reship, and support cost</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={exposureByType} layout="vertical" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: COLORS.muted }}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis
                  dataKey="type"
                  type="category"
                  width={92}
                  tick={{ fontSize: 10, fill: COLORS.muted }}
                />
                <Tooltip
                  contentStyle={chartTooltip}
                  formatter={(value: number) => [formatUsd(value), "Exposure"]}
                />
                <Bar
                  dataKey="exposure"
                  fill={COLORS.warning}
                  radius={[0, 4, 4, 0]}
                  name="Exposure"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Resolution ledger</h3>
              <p className="text-[11px] text-muted-foreground">Most recent resolved exceptions and protected exposure</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              Open exception desk
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Parcel", "Type", "Detected", "Resolved", "Hours", "Exposure protected", "Note"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {resolvedLedger.map(({ parcel, exception }) => (
                  <tr key={exception.id} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-2.5">
                      <Link to={`/parcels/${parcel.id}`} className="font-mono text-[11px] text-primary hover:underline">
                        {parcel.id}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-[11px]">{EXCEPTION_LABELS[exception.type]}</td>
                    <td className="px-3 py-2.5 text-[11px] text-muted-foreground">
                      {formatDate(exception.detectedAt)}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-muted-foreground">
                      {exception.resolvedAt ? formatDateTime(exception.resolvedAt) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-[11px]">
                      {exception.resolvedAt
                        ? `${differenceInHours(new Date(exception.resolvedAt), new Date(exception.detectedAt))}h`
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] font-medium">{formatUsd(exception.exposureUsd)}</td>
                    <td className="max-w-[220px] truncate px-3 py-2.5 text-[11px] text-muted-foreground">
                      {exception.resolutionNote ?? "—"}
                    </td>
                  </tr>
                ))}
                {resolvedLedger.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">
                      No resolved exceptions yet. Resolve one from the exception desk to populate this ledger.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-info/25 bg-info/5 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="font-medium text-card-foreground">How these numbers are calculated</p>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  <span className="text-card-foreground">Exposure</span> = declared value + shipping paid + an
                  assumed reship/support cost. It is a planning estimate, not an accounting figure.
                </li>
                <li>
                  <span className="text-card-foreground">Exposure protected</span> sums the exposure of resolved
                  exceptions. It assumes the intervention prevented a refund or reship, which should be validated
                  against a control group in production.
                </li>
                <li>
                  <span className="text-card-foreground">WISMO deflection</span> assumes 1.7 inbound tickets per
                  resolved exception at $18 per ticket. Both are illustrative assumptions for the demo.
                </li>
                <li>
                  <span className="text-card-foreground">On-time rate</span> compares delivered timestamp with the
                  original promise date. Late-but-delivered parcels count as late.
                </li>
              </ul>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px]">
                <span>Seed {seed}</span>
                <span>Generated {formatDateTime(generatedAt)}</span>
                <span>220 synthetic parcels, China → US corridor</span>
                <Link to="/connections" className="font-medium text-primary hover:underline">
                  See the data & connector plan →
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {metrics.activeParcels} active parcels
          </span>
          <span>{metrics.deliveredParcels} delivered</span>
          <span>{metrics.returnedParcels} returned</span>
          <span>{metrics.customsHeld + metrics.dutyDue} in customs</span>
          <span className="ml-auto">All figures are synthetic and for portfolio demonstration only.</span>
        </div>
      </div>
    </AppLayout>
  );
}
