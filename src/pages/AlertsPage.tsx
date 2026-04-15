import { AppLayout } from "@/components/AppLayout";
import { RiskBadge } from "@/components/RiskBadge";
import { alerts, type Alert } from "@/data/mockData";
import { useState } from "react";
import { AlertTriangle, CheckCircle, Eye, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function AlertsPage() {
  const [data, setData] = useState(alerts);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = data.filter(a => {
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });

  const handleAction = (id: string, action: 'acknowledged' | 'resolved') => {
    setData(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
  };

  const active = data.filter(a => a.status === 'active').length;
  const acknowledged = data.filter(a => a.status === 'acknowledged').length;
  const resolved = data.filter(a => a.status === 'resolved').length;

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Disruption Alerts Center
          </h1>
          <p className="text-sm text-muted-foreground">Real-time alerts with AI-powered impact analysis and recommendations</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="kpi-card border-destructive/20 bg-destructive/5">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-destructive">{active}</p>
          </div>
          <div className="kpi-card border-warning/20 bg-warning/5">
            <p className="text-xs text-muted-foreground">Acknowledged</p>
            <p className="text-2xl font-bold text-warning">{acknowledged}</p>
          </div>
          <div className="kpi-card border-success/20 bg-success/5">
            <p className="text-xs text-muted-foreground">Resolved</p>
            <p className="text-2xl font-bold text-success">{resolved}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{filtered.length} alerts</span>
        </div>

        {/* Alert Cards */}
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className={`bg-card border rounded-lg p-4 space-y-3 ${a.severity === 'critical' ? 'border-destructive/40' : a.severity === 'high' ? 'border-warning/40' : 'border-border'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <RiskBadge level={a.severity} />
                    <span className={`status-badge ${a.status === 'active' ? 'risk-critical' : a.status === 'acknowledged' ? 'risk-medium' : 'risk-low'}`}>{a.status}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-card-foreground">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-muted/50 rounded">
                  <p className="text-[10px] text-muted-foreground uppercase">Cause</p>
                  <p className="font-medium text-card-foreground">{a.cause}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <p className="text-[10px] text-muted-foreground uppercase">Route</p>
                  <p className="font-medium text-card-foreground truncate">{a.route}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <p className="text-[10px] text-muted-foreground uppercase">Business Impact</p>
                  <p className="font-medium text-card-foreground">{a.businessImpact}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <p className="text-[10px] text-muted-foreground uppercase">Affected</p>
                  <p className="font-medium text-primary">{a.affectedShipments.join(', ')}</p>
                </div>
              </div>

              <div className="bg-primary/10 rounded-md p-2.5">
                <p className="text-[10px] text-primary uppercase font-semibold mb-0.5">⚡ Recommended Action</p>
                <p className="text-xs text-card-foreground">{a.recommendedAction}</p>
              </div>

              {a.status === 'active' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAction(a.id, 'acknowledged')}>
                    <Eye className="h-3 w-3 mr-1" /> Acknowledge
                  </Button>
                  <Button size="sm" className="h-7 text-xs" onClick={() => handleAction(a.id, 'resolved')}>
                    <CheckCircle className="h-3 w-3 mr-1" /> Resolve
                  </Button>
                </div>
              )}
              {a.status === 'acknowledged' && (
                <Button size="sm" className="h-7 text-xs" onClick={() => handleAction(a.id, 'resolved')}>
                  <CheckCircle className="h-3 w-3 mr-1" /> Resolve
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
