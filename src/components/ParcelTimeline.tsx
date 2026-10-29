import { MILESTONE_LABELS, formatDateTime, hoursSince, type Parcel } from "@/data/parcels";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

const DOT_STYLES: Record<string, string> = {
  delivered: "bg-success",
  returned: "bg-destructive",
  customs_hold: "bg-warning",
  delivery_attempt: "bg-destructive",
  customs_released: "bg-success",
  out_for_delivery: "bg-primary",
  note: "bg-info",
};

export function ParcelTimeline({ parcel }: { parcel: Parcel }) {
  const events = [...parcel.events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
  const staleHours = hoursSince(parcel.lastEventAt);
  const currentException =
    parcel.exception && parcel.exception.status !== "resolved" ? parcel.exception : undefined;
  const stale =
    staleHours >= 72 &&
    parcel.status !== "delivered" &&
    parcel.status !== "returned" &&
    (!currentException || currentException.type === "stale_tracking");

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-card-foreground">Tracking timeline</h3>
        <span className="text-[11px] text-muted-foreground">
          {events.length} events · last {formatDateTime(parcel.lastEventAt)}
        </span>
      </div>

      {stale && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            No new carrier scan for {Math.floor(staleHours / 24)} days. Stale tracking is the
            strongest signal for a lost handoff.
          </span>
        </div>
      )}

      <ol className="relative ml-1.5 border-l border-border">
        {events.map((event) => {
          const dot = event.isException
            ? "bg-destructive"
            : DOT_STYLES[event.milestone] ?? "bg-primary";
          return (
            <li key={event.id} className="relative pb-5 pl-5 last:pb-0">
              <span
                className={cn(
                  "absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-card",
                  dot,
                )}
              />
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-xs font-semibold text-card-foreground">
                  {MILESTONE_LABELS[event.milestone]}
                </span>
                {event.source !== "carrier_scan" && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                    {event.source}
                  </span>
                )}
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {formatDateTime(event.at)}
                </span>
              </div>
              <p className={cn("mt-0.5 text-xs", event.isException ? "text-destructive" : "text-muted-foreground")}>
                {event.description}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {event.carrier} · {event.location}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
