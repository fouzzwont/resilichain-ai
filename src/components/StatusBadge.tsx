import { cn } from "@/lib/utils";
import {
  PARCEL_STATUS_LABELS,
  type ExceptionStatus,
  type ParcelStatus,
  type Severity,
} from "@/data/parcels";

const PARCEL_STYLES: Record<ParcelStatus, string> = {
  in_transit: "bg-info/15 text-info",
  customs: "bg-warning/15 text-warning",
  out_for_delivery: "bg-primary/15 text-primary",
  delivered: "bg-success/15 text-success",
  exception: "bg-destructive/15 text-destructive",
  returned: "bg-muted text-muted-foreground",
};

const EXCEPTION_STYLES: Record<ExceptionStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-destructive/15 text-destructive" },
  in_progress: { label: "In progress", className: "bg-warning/15 text-warning" },
  resolved: { label: "Resolved", className: "bg-success/15 text-success" },
};

const SEVERITY_STYLES: Record<Severity, string> = {
  low: "risk-low",
  medium: "risk-medium",
  high: "risk-high",
  critical: "risk-critical",
};

const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function ParcelStatusBadge({ status }: { status: ParcelStatus }) {
  return (
    <span className={cn("status-badge", PARCEL_STYLES[status])}>
      {PARCEL_STATUS_LABELS[status]}
    </span>
  );
}

export function ExceptionStatusBadge({ status }: { status: ExceptionStatus }) {
  const style = EXCEPTION_STYLES[status];
  return <span className={cn("status-badge", style.className)}>{style.label}</span>;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={cn("status-badge", SEVERITY_STYLES[severity])}>
      {SEVERITY_LABELS[severity]}
    </span>
  );
}
