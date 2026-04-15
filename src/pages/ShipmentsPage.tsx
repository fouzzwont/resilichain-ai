import { AppLayout } from "@/components/AppLayout";
import { RiskBadge } from "@/components/RiskBadge";
import { shipments, getStatusLabel, getRiskLevel, type Shipment } from "@/data/mockData";
import { useState } from "react";
import { Search, Filter, X, Ship, MapPin, Clock, AlertTriangle, Brain, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function ShipmentsPage() {
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Shipment | null>(null);

  const filtered = shipments.filter(s => {
    if (search && !s.id.toLowerCase().includes(search.toLowerCase()) && !s.cargo.toLowerCase().includes(search.toLowerCase()) && !s.carrier.toLowerCase().includes(search.toLowerCase())) return false;
    if (modeFilter !== "all" && s.mode !== modeFilter) return false;
    if (riskFilter !== "all") {
      const level = getRiskLevel(s.riskScore);
      if (riskFilter !== level) return false;
    }
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Live Shipment Visibility</h1>
          <p className="text-sm text-muted-foreground">{shipments.length} active shipments across global network</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search by ID, cargo, carrier..." className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={modeFilter} onValueChange={setModeFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Mode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="sea">Sea</SelectItem>
              <SelectItem value="air">Air</SelectItem>
              <SelectItem value="road">Road</SelectItem>
              <SelectItem value="rail">Rail</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Risk" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-transit">In Transit</SelectItem>
              <SelectItem value="at-port">At Port</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="customs-hold">Customs Hold</SelectItem>
              <SelectItem value="at-warehouse">At Warehouse</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{filtered.length} results</span>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {['ID', 'Cargo', 'Origin → Dest', 'Mode', 'Carrier', 'Status', 'ETA', 'Delay', 'Risk', 'Action', ''].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} onClick={() => setSelected(s)} className="border-b border-border hover:bg-muted/30 cursor-pointer">
                    <td className="px-3 py-2 text-xs font-mono font-medium text-primary">{s.id}</td>
                    <td className="px-3 py-2 text-xs max-w-[120px] truncate">{s.cargo}</td>
                    <td className="px-3 py-2 text-xs max-w-[160px] truncate text-muted-foreground">{s.origin} → {s.destination}</td>
                    <td className="px-3 py-2"><span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s.mode}</span></td>
                    <td className="px-3 py-2 text-xs truncate max-w-[100px]">{s.carrier}</td>
                    <td className="px-3 py-2"><span className={`status-badge ${s.status === 'delayed' ? 'risk-high' : s.status === 'customs-hold' ? 'risk-medium' : 'risk-low'}`}>{getStatusLabel(s.status)}</span></td>
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{new Date(s.predictedEta).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</td>
                    <td className="px-3 py-2 text-xs font-medium">{s.predictedDelayHours > 0 ? `+${s.predictedDelayHours}h` : '—'}</td>
                    <td className="px-3 py-2"><RiskBadge score={s.riskScore} showScore /></td>
                    <td className="px-3 py-2 text-xs text-primary max-w-[120px] truncate">{s.recommendedAction.split(';')[0]}</td>
                    <td className="px-3 py-2"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && <ShipmentDetail shipment={selected} />}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}

function ShipmentDetail({ shipment: s }: { shipment: Shipment }) {
  const stages = ['Departed', 'In Transit', 'At Port', 'Customs', 'Last Mile', 'Delivered'];
  const currentStageIdx = s.status === 'delayed' ? 1 : s.status === 'at-port' ? 2 : s.status === 'customs-hold' ? 3 : s.status === 'at-warehouse' ? 4 : s.status === 'delivered' ? 5 : 1;

  return (
    <div className="space-y-5 pt-2">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Ship className="h-5 w-5 text-primary" />
          {s.id} — {s.cargo}
        </SheetTitle>
      </SheetHeader>

      {/* Status */}
      <div className="flex items-center gap-3">
        <RiskBadge score={s.riskScore} showScore />
        <span className={`status-badge ${s.status === 'delayed' ? 'risk-high' : 'risk-low'}`}>{getStatusLabel(s.status)}</span>
        {s.temperatureFlag && <span className="status-badge risk-medium">🌡️ Temp Alert</span>}
        {s.customsFlag && <span className="status-badge risk-medium">📋 Customs Flag</span>}
      </div>

      {/* Timeline */}
      <div className="bg-muted/50 rounded-lg p-3">
        <h4 className="text-xs font-semibold text-foreground mb-3">Shipment Timeline</h4>
        <div className="flex items-center gap-1">
          {stages.map((stage, i) => (
            <div key={stage} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-2 w-full rounded-full ${i < currentStageIdx ? 'bg-primary' : i === currentStageIdx ? 'bg-primary animate-pulse-glow' : 'bg-border'}`} />
              <span className="text-[9px] text-muted-foreground text-center">{stage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Route Info */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Origin', value: s.origin, icon: MapPin },
          { label: 'Destination', value: s.destination, icon: MapPin },
          { label: 'Current Location', value: s.currentLocation, icon: MapPin },
          { label: 'Mode', value: s.mode.toUpperCase(), icon: Ship },
          { label: 'Carrier', value: s.carrier, icon: Ship },
          { label: 'Supplier', value: s.supplier, icon: Ship },
          { label: 'Planned ETA', value: new Date(s.plannedEta).toLocaleDateString(), icon: Clock },
          { label: 'Predicted ETA', value: new Date(s.predictedEta).toLocaleDateString(), icon: Clock },
        ].map(item => (
          <div key={item.label} className="p-2 bg-muted/30 rounded-md">
            <p className="text-[10px] text-muted-foreground uppercase">{item.label}</p>
            <p className="text-xs font-medium text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      {/* AI Prediction */}
      <div className="bg-accent/50 border border-primary/20 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-semibold text-foreground">AI Disruption Analysis</h4>
          <span className="text-[10px] text-muted-foreground ml-auto">{s.confidenceLevel}% confidence</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-card rounded">
            <p className="text-lg font-bold text-foreground">{s.riskScore}</p>
            <p className="text-[10px] text-muted-foreground">Risk Score</p>
          </div>
          <div className="text-center p-2 bg-card rounded">
            <p className="text-lg font-bold text-foreground">{s.disruptionProbability}%</p>
            <p className="text-[10px] text-muted-foreground">Disruption Prob.</p>
          </div>
          <div className="text-center p-2 bg-card rounded">
            <p className="text-lg font-bold text-foreground">+{s.predictedDelayHours}h</p>
            <p className="text-[10px] text-muted-foreground">Predicted Delay</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Root Cause</p>
          <p className="text-xs text-foreground">{s.disruptionCause}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Business Impact</p>
          <p className="text-xs text-foreground">{s.businessImpact}</p>
        </div>
        <div className="bg-primary/10 rounded-md p-2">
          <p className="text-[10px] text-primary uppercase font-semibold mb-0.5">⚡ Recommended Action</p>
          <p className="text-xs text-foreground">{s.recommendedAction}</p>
        </div>
      </div>

      {/* Route */}
      <div>
        <h4 className="text-xs font-semibold text-foreground mb-1">Route</h4>
        <p className="text-xs text-muted-foreground">{s.route}</p>
      </div>
    </div>
  );
}
