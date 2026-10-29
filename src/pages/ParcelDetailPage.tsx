import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  DollarSign,
  FileWarning,
  Mail,
  MapPin,
  Package,
  Send,
  ShieldAlert,
  Sparkles,
  Timer,
  Truck,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ParcelTimeline } from "@/components/ParcelTimeline";
import { ExceptionStatusBadge, ParcelStatusBadge, SeverityBadge } from "@/components/StatusBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { useWorkspace } from "@/state/WorkspaceProvider";
import {
  EXCEPTION_LABELS,
  daysFromNow,
  formatDate,
  formatDateTime,
  formatUsd,
  getRiskLevel,
  hoursSince,
  promiseLabel,
} from "@/data/parcels";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CUSTOMS_LABELS: Record<string, string> = {
  pending: "Not yet at customs",
  held: "Held at customs",
  duty_due: "Duties due",
  cleared: "Cleared",
};

const CUSTOMS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  held: "bg-warning/15 text-warning",
  duty_due: "bg-destructive/15 text-destructive",
  cleared: "bg-success/15 text-success",
};

export default function ParcelDetailPage() {
  const { parcelId } = useParams();
  const { getParcel, markInProgress, resolveException, sendMessage } = useWorkspace();
  const parcel = parcelId ? getParcel(parcelId) : undefined;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [note, setNote] = useState("");

  const riskLevel = useMemo(() => (parcel ? getRiskLevel(parcel.riskScore) : "low"), [parcel]);

  if (!parcel) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Package className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Parcel not found</h1>
          <p className="text-sm text-muted-foreground">This parcel is not part of the current demo workspace.</p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/parcels">Back to parcels</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const exception = parcel.exception;
  const activeException = exception && exception.status !== "resolved";
  const dueIn = daysFromNow(parcel.promisedBy);
  const customsDwell = parcel.customs.heldSince
    ? Math.max(0, Math.floor(hoursSince(parcel.customs.heldSince) / 24))
    : 0;

  const copyMessage = async () => {
    if (!parcel.message) return;
    try {
      await navigator.clipboard.writeText(`${parcel.message.subject}\n\n${parcel.message.body}`);
      toast.success("Message copied to clipboard");
    } catch {
      toast.error("Clipboard unavailable in this browser");
    }
  };

  const confirmResolve = () => {
    resolveException(parcel.id, note.trim());
    setDialogOpen(false);
    setNote("");
    toast.success("Exception resolved", {
      description: `${parcel.id} moved out of the active queue.`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to exception desk
          </Link>
          <div className="flex items-center gap-2">
            <span className="status-badge bg-info/15 text-info">Synthetic parcel</span>
            <RiskBadge score={parcel.riskScore} showScore />
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-xl font-bold text-foreground">{parcel.id}</h1>
              <ParcelStatusBadge status={parcel.status} />
              {exception && <SeverityBadge severity={exception.severity} />}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {parcel.product} · Order {parcel.orderId} · {parcel.trackingNumber}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {parcel.originHub} → {parcel.destinationCity}, {parcel.destinationState}
              </span>
              <span className="inline-flex items-center gap-1">
                <Truck className="h-3 w-3" />
                {parcel.carrierChain.join(" → ")}
              </span>
              <span className="inline-flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {parcel.service}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-right">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Promised</p>
              <p className="text-sm font-semibold text-card-foreground">{formatDate(parcel.promisedBy)}</p>
              <p className={cn("text-[11px]", dueIn < 0 ? "text-destructive" : "text-muted-foreground")}>
                {promiseLabel(parcel.promisedBy)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Predicted</p>
              <p className="text-sm font-semibold text-card-foreground">{formatDate(parcel.predictedBy)}</p>
              <p className="text-[11px] text-muted-foreground">
                {parcel.predictedDelayHours > 0 ? `+${Math.round(parcel.predictedDelayHours)}h vs promise` : "On promise"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Exposure</p>
              <p className={cn("text-sm font-semibold", activeException ? "text-destructive" : "text-card-foreground")}>
                {formatUsd(parcel.exposureUsd)}
              </p>
              <p className="text-[11px] text-muted-foreground">{activeException ? "at risk" : "no open risk"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {exception ? (
              <div
                className={cn(
                  "rounded-lg border bg-card p-4",
                  activeException ? "border-destructive/30" : "border-success/30",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 rounded-md p-2",
                        activeException ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success",
                      )}
                    >
                      {activeException ? <ShieldAlert className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">{exception.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{exception.reason}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {EXCEPTION_LABELS[exception.type]} · detected {formatDateTime(exception.detectedAt)}
                        {exception.resolvedAt ? ` · resolved ${formatDateTime(exception.resolvedAt)}` : ""}
                      </p>
                    </div>
                  </div>
                  <ExceptionStatusBadge status={exception.status} />
                </div>

                {exception.resolutionNote && (
                  <div className="mt-3 rounded-md border border-success/20 bg-success/5 px-3 py-2 text-xs text-success">
                    {exception.resolutionNote}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Exposure</p>
                    <p className="text-sm font-semibold">{formatUsd(exception.exposureUsd)}</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Confidence</p>
                    <p className="text-sm font-semibold">{Math.round(exception.recommendedAction.confidence * 100)}%</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Action cost</p>
                    <p className="text-sm font-semibold">{formatUsd(exception.recommendedAction.costUsd)}</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">SLA</p>
                    <p className="text-sm font-semibold">{exception.recommendedAction.slaHours}h</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                <div>
                  <p className="text-sm font-semibold text-card-foreground">No open exception</p>
                  <p className="text-xs text-muted-foreground">
                    This parcel is moving normally. Keep monitoring the next carrier handoff.
                  </p>
                </div>
              </div>
            )}

            <ParcelTimeline parcel={parcel} />
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Next best action
              </div>
              {exception ? (
                <>
                  <p className="mt-2 text-sm font-semibold text-card-foreground">
                    {exception.recommendedAction.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{exception.recommendedAction.detail}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/15">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round(exception.recommendedAction.confidence * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {Math.round(exception.recommendedAction.confidence * 100)}% confidence ·{" "}
                    {formatUsd(exception.recommendedAction.costUsd)} cost · {exception.recommendedAction.slaHours}h SLA
                  </p>

                  {activeException ? (
                    <div className="mt-3 flex flex-col gap-2">
                      <Button
                        size="sm"
                        className="h-8 text-xs"
                        disabled={exception.status === "in_progress"}
                        onClick={() => {
                          markInProgress(parcel.id);
                          toast.success("Exception marked in progress");
                        }}
                      >
                        {exception.status === "in_progress" ? "In progress" : "Mark in progress"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => {
                          setNote(exception.recommendedAction.label);
                          setDialogOpen(true);
                        }}
                      >
                        Resolve exception
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-3 rounded-md bg-success/10 px-2 py-1.5 text-[11px] font-medium text-success">
                      Resolved · {exception.resolutionNote}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  No intervention needed. The model will flag the parcel again if a scan goes stale or a customs
                  event appears.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
                  <FileWarning className="h-4 w-4 text-muted-foreground" />
                  Customs & duties
                </h3>
                <span className={cn("status-badge", CUSTOMS_STYLES[parcel.customs.status])}>
                  {CUSTOMS_LABELS[parcel.customs.status]}
                </span>
              </div>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Entry</dt>
                  <dd className="font-mono text-[11px]">{parcel.customs.entryNumber ?? "Not filed"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Broker</dt>
                  <dd className="text-right">{parcel.customs.broker}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Duty + tax</dt>
                  <dd>{formatUsd(parcel.customs.dutyUsd + parcel.customs.taxUsd)}</dd>
                </div>
                {parcel.customs.heldSince && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Dwell</dt>
                    <dd className={cn(customsDwell >= 3 && "font-medium text-warning")}>{customsDwell} days</dd>
                  </div>
                )}
              </dl>

              {parcel.customs.missingDocs.length > 0 && parcel.customs.status !== "cleared" && (
                <div className="mt-3 rounded-md border border-warning/30 bg-warning/5 p-2">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-warning">Missing documents</p>
                  <ul className="mt-1 list-inside list-disc text-[11px] text-muted-foreground">
                    {parcel.customs.missingDocs.map((doc) => (
                      <li key={doc}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button variant="outline" size="sm" className="mt-3 h-7 w-full text-[11px]" asChild>
                <Link to="/customs">Open customs queue</Link>
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Customer update
                </h3>
                {parcel.message && (
                  <span className="status-badge bg-muted text-muted-foreground">
                    {parcel.message.language.toUpperCase()}
                  </span>
                )}
              </div>

              {parcel.message ? (
                <>
                  <p className="mt-2 text-xs font-medium text-card-foreground">{parcel.message.subject}</p>
                  <pre className="mt-2 max-h-[220px] overflow-auto whitespace-pre-wrap rounded-md bg-muted/50 p-3 font-sans text-[11px] leading-relaxed text-muted-foreground">
                    {parcel.message.body}
                  </pre>
                  {parcel.message.status === "sent" ? (
                    <p className="mt-2 flex items-center gap-1 text-[11px] text-success">
                      <CheckCircle2 className="h-3 w-3" />
                      Sent {parcel.message.sentAt ? formatDateTime(parcel.message.sentAt) : "earlier"}
                    </p>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" className="h-7 flex-1 text-[11px]" onClick={() => sendMessage(parcel.id)}>
                        <Send className="mr-1 h-3 w-3" />
                        Send update
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={copyMessage}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  No customer update drafted for this parcel yet. Messages are generated for parcels with active
                  exceptions.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
                <Package className="h-4 w-4 text-muted-foreground" />
                Parcel facts
              </h3>
              <dl className="mt-3 space-y-2 text-xs">
                {[
                  ["Product", parcel.product],
                  ["Category", parcel.category],
                  ["HS code", parcel.hsCode],
                  ["Declared value", formatUsd(parcel.declaredValueUsd)],
                  ["Shipping paid", formatUsd(parcel.shippingCostUsd)],
                  ["Weight", `${parcel.weightKg} kg`],
                  ["Shipped", formatDate(parcel.shippedAt)],
                  ["Promised", formatDate(parcel.promisedBy)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right text-card-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
                <p className="font-medium text-card-foreground">{parcel.customer.name}</p>
                <p>{parcel.customer.email}</p>
                <p>{parcel.customer.address}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[11px] text-muted-foreground">
          <span>
            Risk level: <span className="font-medium text-card-foreground">{riskLevel}</span> · last scan{" "}
            {formatDateTime(parcel.lastEventAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Exposure model: order value + shipping + reship/support cost
          </span>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve exception for {parcel.id}</DialogTitle>
            <DialogDescription>
              This records the resolution, clears the exception from the active queue, and adds an audit note to
              the parcel timeline.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            placeholder="What did you do? e.g. Sent corrected invoice with HS code to the broker."
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={confirmResolve}>
              Resolve exception
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
