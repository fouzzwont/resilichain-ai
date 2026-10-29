import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Copy,
  Globe2,
  Mail,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { useWorkspace } from "@/state/WorkspaceProvider";
import {
  EXCEPTION_LABELS,
  formatDate,
  formatDateTime,
  formatUsd,
  type ExceptionStatus,
  type Parcel,
} from "@/data/parcels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "drafts" | "sent" | "all";

const STATUS_STYLES: Record<ExceptionStatus, string> = {
  open: "bg-destructive/15 text-destructive",
  in_progress: "bg-warning/15 text-warning",
  resolved: "bg-success/15 text-success",
};

export default function CommsPage() {
  const { parcels, metrics, sendMessage } = useWorkspace();
  const [tab, setTab] = useState<Tab>("drafts");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const messages = useMemo(
    () =>
      parcels
        .filter((parcel): parcel is Parcel & { message: NonNullable<Parcel["message"]> } => Boolean(parcel.message))
        .sort((a, b) => {
          if (a.message.status !== b.message.status) return a.message.status === "draft" ? -1 : 1;
          return new Date(b.message.createdAt).getTime() - new Date(a.message.createdAt).getTime();
        }),
    [parcels],
  );

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return messages.filter((parcel) => {
      if (tab === "drafts" && parcel.message.status !== "draft") return false;
      if (tab === "sent" && parcel.message.status !== "sent") return false;
      if (!search) return true;
      return (
        parcel.id.toLowerCase().includes(search) ||
        parcel.customer.name.toLowerCase().includes(search) ||
        parcel.message.subject.toLowerCase().includes(search) ||
        parcel.message.body.toLowerCase().includes(search)
      );
    });
  }, [messages, query, tab]);

  const selected = filtered.find((parcel) => parcel.id === selectedId) ?? filtered[0];

  const spanishCount = messages.filter((parcel) => parcel.message.language === "es").length;

  const copy = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(`${selected.message.subject}\n\n${selected.message.body}`);
      toast.success("Message copied to clipboard");
    } catch {
      toast.error("Clipboard unavailable in this browser");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Customer comms</h1>
          <p className="text-sm text-muted-foreground">
            Proactive exception updates — drafted from parcel context, sent before the customer asks
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard
            title="Drafts ready"
            value={metrics.draftMessages}
            subtitle="need review or send"
            icon={Mail}
            variant="warning"
          />
          <KpiCard
            title="Sent updates"
            value={metrics.sentMessages}
            subtitle="across the workspace"
            icon={Send}
            variant="success"
          />
          <KpiCard
            title="Localized messages"
            value={spanishCount}
            subtitle="Spanish templates"
            icon={Globe2}
          />
          <KpiCard
            title="WISMO deflected"
            value={metrics.wismoTicketsDeflected}
            subtitle="estimated, resolved exceptions"
            icon={MessageSquare}
            variant="success"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-border bg-card p-0.5">
            {(
              [
                ["drafts", `Drafts (${metrics.draftMessages})`],
                ["sent", `Sent (${metrics.sentMessages})`],
                ["all", "All"],
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
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customer or message..."
            className="h-8 max-w-xs text-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card px-6 py-16 text-center">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <p className="text-sm font-medium">Nothing here — the queue is clear</p>
            <p className="text-xs text-muted-foreground">
              Resolve an exception or switch tabs to see sent customer updates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="max-h-[640px] space-y-2 overflow-auto rounded-lg border border-border bg-card p-2 lg:col-span-2">
              {filtered.map((parcel) => {
                const active = selected?.id === parcel.id;
                return (
                  <button
                    key={parcel.id}
                    onClick={() => setSelectedId(parcel.id)}
                    className={cn(
                      "w-full rounded-md border px-3 py-2.5 text-left transition-colors",
                      active
                        ? "border-primary/40 bg-primary/5"
                        : "border-transparent hover:bg-muted/60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-medium text-primary">{parcel.id}</span>
                      <span className="flex items-center gap-1">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                          {parcel.message.language}
                        </span>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide",
                            parcel.message.status === "sent"
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning",
                          )}
                        >
                          {parcel.message.status}
                        </span>
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs font-medium text-card-foreground">
                      {parcel.message.subject}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {parcel.customer.name} · {parcel.destinationCity}, {parcel.destinationState}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {parcel.exception ? EXCEPTION_LABELS[parcel.exception.type] : "Parcel update"} ·{" "}
                      {formatDate(parcel.message.createdAt)}
                    </p>
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className="space-y-4 lg:col-span-3">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/parcels/${selected.id}`}
                          className="font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          {selected.id}
                        </Link>
                        {selected.exception && (
                          <span className={cn("status-badge", STATUS_STYLES[selected.exception.status])}>
                            {selected.exception.status.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-card-foreground">
                        {selected.message.subject}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        To {selected.customer.name} · {selected.customer.email} ·{" "}
                        {selected.message.channel.toUpperCase()}
                      </p>
                    </div>
                    <span className="status-badge bg-muted text-muted-foreground">
                      {selected.message.language === "es" ? "Español" : "English"}
                    </span>
                  </div>

                  <pre className="mt-3 max-h-[340px] overflow-auto whitespace-pre-wrap rounded-md bg-muted/50 p-4 font-sans text-xs leading-relaxed text-card-foreground">
                    {selected.message.body}
                  </pre>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] text-muted-foreground">
                      Drafted {formatDateTime(selected.message.createdAt)}
                      {selected.message.sentAt ? ` · sent ${formatDateTime(selected.message.sentAt)}` : ""}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={copy}>
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </Button>
                      {selected.message.status === "draft" ? (
                        <Button
                          size="sm"
                          className="h-7 text-[11px]"
                          onClick={() => {
                            sendMessage(selected.id);
                            toast.success("Customer update sent", {
                              description: `${selected.id} · ${selected.customer.name}`,
                            });
                          }}
                        >
                          <Send className="mr-1 h-3 w-3" />
                          Send update
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                          <CheckCircle2 className="h-3 w-3" />
                          Sent
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-card p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Parcel context
                    </p>
                    <p className="mt-1 text-xs font-medium text-card-foreground">{selected.product}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {selected.originHub} → {selected.destinationCity}, {selected.destinationState}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Promised {formatDate(selected.promisedBy)} · {formatUsd(selected.declaredValueUsd)}
                    </p>
                    <Link
                      to={`/parcels/${selected.id}`}
                      className="mt-2 inline-block text-[11px] font-medium text-primary hover:underline"
                    >
                      Open parcel timeline →
                    </Link>
                  </div>
                  <div className="rounded-lg border border-primary/25 bg-primary/5 p-3">
                    <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-primary">
                      <Sparkles className="h-3 w-3" />
                      Why this message
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {selected.exception
                        ? selected.exception.reason
                        : "The parcel is moving normally; no proactive update is needed."}
                    </p>
                    {selected.exception && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Exposure {formatUsd(selected.exception.exposureUsd)} · recommended:{" "}
                        {selected.exception.recommendedAction.label}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          Messages are generated templates for the demo. In production, sending would route through Postmark,
          Klaviyo, or WhatsApp with merchant-approved tone and language rules.
        </p>
      </div>
    </AppLayout>
  );
}
