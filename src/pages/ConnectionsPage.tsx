import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  CircleDashed,
  Database,
  Globe2,
  Landmark,
  MessageSquare,
  Package,
  Plug,
  Radar,
  ShieldCheck,
  Store,
  Truck,
  Warehouse,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useWorkspace } from "@/state/WorkspaceProvider";
import { formatDateTime } from "@/data/parcels";
import { cn } from "@/lib/utils";

const LOOP = [
  {
    title: "Order + address",
    detail: "Storefront webhook creates the parcel record and promise date.",
    icon: Store,
  },
  {
    title: "Tracking ingestion",
    detail: "Carrier APIs and aggregators normalize scans into milestones.",
    icon: Radar,
  },
  {
    title: "Exception detection",
    detail: "Rules plus a risk score surface holds, stale scans, and duty gaps.",
    icon: ShieldCheck,
  },
  {
    title: "Customer update",
    detail: "A contextual draft is reviewed and sent before the customer asks.",
    icon: MessageSquare,
  },
  {
    title: "Resolution + learning",
    detail: "Outcome updates exposure, resolution time, and future thresholds.",
    icon: CheckCircle2,
  },
];

const CONNECTORS = [
  {
    name: "Storefront",
    examples: "Shopify · WooCommerce · custom API",
    role: "Creates the parcel and owns the customer promise",
    data: "Order value, SKU, HS code, address, shipping service, promise date",
    icon: Store,
    status: "Simulated",
    accent: "bg-primary/10 text-primary",
  },
  {
    name: "Origin carriers",
    examples: "YunExpress · 4PX · Cainiao · DHL eCommerce · SF Express",
    role: "First-mile pickup, export clearance, and linehaul",
    data: "Pickup scans, export status, handoff events, tracking numbers",
    icon: Truck,
    status: "Simulated",
    accent: "bg-info/10 text-info",
  },
  {
    name: "Last-mile carriers",
    examples: "USPS · UPS",
    role: "Import handoff, delivery attempts, and final delivery",
    data: "Import scan, out-for-delivery, delivery attempt, proof of delivery",
    icon: Package,
    status: "Simulated",
    accent: "bg-success/10 text-success",
  },
  {
    name: "Tracking aggregators",
    examples: "AfterShip · 17TRACK",
    role: "One normalized event stream across carrier APIs",
    data: "Milestone mapping, exception codes, stale-scan detection",
    icon: Radar,
    status: "Simulated",
    accent: "bg-warning/10 text-warning",
  },
  {
    name: "Customs broker",
    examples: "ClearPoint · regional brokers",
    role: "Entry filing, document requests, duty and tax collection",
    data: "Entry number, hold reason, missing documents, duty amount",
    icon: Landmark,
    status: "Simulated",
    accent: "bg-critical/10 text-critical",
  },
  {
    name: "Customer comms",
    examples: "Postmark · Klaviyo · WhatsApp",
    role: "Sends approved updates in the customer's language",
    data: "Delivery status, reply intent, template performance",
    icon: MessageSquare,
    status: "Simulated",
    accent: "bg-primary/10 text-primary",
  },
  {
    name: "Warehouse / 3PL",
    examples: "US 3PL · returns processor",
    role: "Domestic reship and returns disposition",
    data: "Available stock, reship ETA, return condition, refund trigger",
    icon: Warehouse,
    status: "Planned",
    accent: "bg-muted text-muted-foreground",
  },
  {
    name: "Data warehouse",
    examples: "BigQuery · Postgres · dbt",
    role: "Keeps the audit trail and evaluates intervention lift",
    data: "Parcel history, action log, outcomes, control-group metrics",
    icon: Database,
    status: "Planned",
    accent: "bg-muted text-muted-foreground",
  },
];

const ROADMAP = [
  {
    phase: "Now",
    title: "Seeded operating slice",
    detail: "Exception queue, parcel timeline, customs queue, comms drafts, impact ledger. All local, no credentials.",
    state: "done",
  },
  {
    phase: "Next",
    title: "Read-only tracking ingestion",
    detail: "Connect one aggregator and one origin carrier. Normalize events; keep actions manual.",
    state: "next",
  },
  {
    phase: "Then",
    title: "Customs + comms integrations",
    detail: "Broker document requests and Postmark/WhatsApp sending with merchant approval rules.",
    state: "later",
  },
  {
    phase: "Later",
    title: "Measured interventions",
    detail: "Holdout groups, resolution-time targets, and cost-per-exception benchmarks.",
    state: "later",
  },
];

export default function ConnectionsPage() {
  const { generatedAt, seed, metrics } = useWorkspace();

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">How it connects</h1>
          <p className="text-sm text-muted-foreground">
            The operating loop, the integrations it depends on, and what is honestly simulated today
          </p>
        </div>

        <div className="rounded-lg border border-info/25 bg-info/5 p-4">
          <div className="flex items-start gap-2">
            <Plug className="mt-0.5 h-4 w-4 shrink-0 text-info" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-card-foreground">This is a portfolio product, not a live deployment.</p>
              <p className="mt-1">
                Every parcel in this workspace is synthetic — generated from seed {seed} on{" "}
                {formatDateTime(generatedAt)}. Names, tracking numbers, customs entries, and carrier scans are
                fabricated for demonstration. No customer data, carrier credentials, or live APIs are used.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-card-foreground">The exception operating loop</h2>
          <p className="text-[11px] text-muted-foreground">
            ParcelDesk sits between the storefront, carriers, brokers, and the customer.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-5">
            {LOOP.map((step, index) => (
              <div key={step.title} className="relative flex items-start gap-2 rounded-md border border-border p-3">
                <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                  <step.icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-card-foreground">{step.title}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{step.detail}</p>
                </div>
                {index < LOOP.length - 1 && (
                  <ArrowRight className="absolute -right-2 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground md:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-card-foreground">Integration surface</h2>
            <span className="text-[11px] text-muted-foreground">8 connectors · 6 simulated · 2 planned</span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {CONNECTORS.map((connector) => (
              <div key={connector.name} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className={cn("rounded-md p-1.5", connector.accent)}>
                    <connector.icon className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      "status-badge",
                      connector.status === "Simulated"
                        ? "bg-info/10 text-info"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {connector.status}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-card-foreground">{connector.name}</p>
                <p className="text-[10px] text-muted-foreground">{connector.examples}</p>
                <p className="mt-2 text-[11px] text-card-foreground">{connector.role}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{connector.data}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              What is real vs simulated
            </h2>
            <div className="mt-3 space-y-3 text-xs">
              <div>
                <p className="font-medium text-card-foreground">Real in this demo</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  <li className="flex gap-1.5">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                    Domain model: parcels, events, customs cases, exceptions, actions, messages.
                  </li>
                  <li className="flex gap-1.5">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                    Deterministic seeded data with realistic corridor, carrier, and exception mix.
                  </li>
                  <li className="flex gap-1.5">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                    Working queue actions: acknowledge, resolve, send update, reset workspace.
                  </li>
                  <li className="flex gap-1.5">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                    Impact math derives from the same records, so actions change the metrics.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-card-foreground">Simulated</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  <li className="flex gap-1.5">
                    <CircleDashed className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                    Carrier scans, customs outcomes, and delivery attempts.
                  </li>
                  <li className="flex gap-1.5">
                    <CircleDashed className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                    Customer names, emails, addresses, and order values.
                  </li>
                  <li className="flex gap-1.5">
                    <CircleDashed className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                    Message sending (no email, SMS, or WhatsApp is actually sent).
                  </li>
                  <li className="flex gap-1.5">
                    <CircleDashed className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                    Exposure, WISMO deflection, and support-cost assumptions.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
              <Database className="h-4 w-4 text-muted-foreground" />
              Data & methods
            </h2>
            <div className="mt-3 space-y-3 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-card-foreground">Generator.</span> A seeded PRNG creates 220
                parcels across six China → US carrier chains, then walks each parcel through a timeline. About one
                in five parcels hits an exception scenario; some are pre-resolved so the impact ledger has history.
              </p>
              <p>
                <span className="font-medium text-card-foreground">Risk score.</span> Severity base + promise
                proximity + stale-scan penalty + declared-value escalation. It is deliberately transparent, not a
                trained model.
              </p>
              <p>
                <span className="font-medium text-card-foreground">Exposure.</span> Declared value + shipping +
                an assumed reship/support cost. Duty cases add the duty and tax amount. A planning estimate, not an
                accounting figure.
              </p>
              <p>
                <span className="font-medium text-card-foreground">Why this corridor.</span> China → US parcels
                concentrate the product's hardest problems: document gaps, de minimis and duty changes, carrier
                handoffs, and customers who expect a domestic experience.
              </p>
              <p className="rounded-md bg-muted/50 p-2 text-[11px]">
                Current workspace: {metrics.totalParcels} parcels · {metrics.openExceptions} open exceptions ·{" "}
                {metrics.resolvedExceptions} resolved · {metrics.customsHeld + metrics.dutyDue} in customs.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
              <Boxes className="h-4 w-4 text-muted-foreground" />
              Production path
            </h2>
            <span className="text-[11px] text-muted-foreground">Start narrow, then earn the automation</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
            {ROADMAP.map((item) => (
              <div key={item.phase} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {item.phase}
                  </span>
                  {item.state === "done" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <CircleDashed className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <p className="mt-1 text-xs font-medium text-card-foreground">{item.title}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
            <Globe2 className="h-4 w-4 text-muted-foreground" />
            Why this is a defensible product slice
          </h2>
          <div className="mt-2 grid grid-cols-1 gap-3 text-xs text-muted-foreground md:grid-cols-3">
            <p>
              <span className="font-medium text-card-foreground">Specific user.</span> A 1–20 person DTC ops team
              shipping 200–2,000 cross-border parcels a month, not a global enterprise control tower.
            </p>
            <p>
              <span className="font-medium text-card-foreground">Specific job.</span> Decide what to do next when a
              parcel breaks, then tell the customer before they open a ticket.
            </p>
            <p>
              <span className="font-medium text-card-foreground">Specific proof.</span> Resolution time, exposure
              protected, on-time recovery, and WISMO deflection — measured on the same records the operator
              touches.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
