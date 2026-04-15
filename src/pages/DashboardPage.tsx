import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { RiskBadge } from "@/components/RiskBadge";
import { shipments, alerts, carriers, getRiskLevel } from "@/data/mockData";
import {
  Ship, AlertTriangle, Clock, TrendingUp, Anchor, Users, Shield, Activity,
  CheckCircle, XCircle, Timer
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useNavigate } from "react-router-dom";

const riskTrend = [
  { day: 'Apr 9', low: 8, medium: 5, high: 3, critical: 1 },
  { day: 'Apr 10', low: 9, medium: 4, high: 4, critical: 1 },
  { day: 'Apr 11', low: 7, medium: 6, high: 3, critical: 2 },
  { day: 'Apr 12', low: 8, medium: 5, high: 4, critical: 2 },
  { day: 'Apr 13', low: 7, medium: 6, high: 5, critical: 2 },
  { day: 'Apr 14', low: 6, medium: 5, high: 5, critical: 3 },
  { day: 'Apr 15', low: 7, medium: 6, high: 4, critical: 2 },
];

const disruptionCauses = [
  { name: 'Port Congestion', value: 6 },
  { name: 'Weather', value: 4 },
  { name: 'Carrier Issues', value: 5 },
  { name: 'Customs Delay', value: 4 },
  { name: 'Geopolitical', value: 2 },
  { name: 'Cold Chain', value: 3 },
];

const COLORS = ['hsl(192,70%,45%)', 'hsl(152,55%,40%)', 'hsl(38,85%,50%)', 'hsl(0,62%,50%)', 'hsl(210,65%,50%)', 'hsl(270,50%,55%)'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const totalShipments = shipments.length;
  const onTime = shipments.filter(s => s.riskScore < 25).length;
  const delayed = shipments.filter(s => s.status === 'delayed').length;
  const highRisk = shipments.filter(s => s.riskScore >= 50).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
  const avgDelay = Math.round(shipments.reduce((a, s) => a + s.predictedDelayHours, 0) / totalShipments);
  const avgCarrierScore = Math.round(carriers.reduce((a, c) => a + c.performanceScore, 0) / carriers.length);
  const networkHealth = Math.round(100 - (highRisk / totalShipments) * 100);

  const activeAlerts = alerts.filter(a => a.status === 'active').slice(0, 5);
  const topRiskShipments = [...shipments].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  const statusDist = [
    { name: 'In Transit', value: shipments.filter(s => s.status === 'in-transit').length },
    { name: 'At Port', value: shipments.filter(s => s.status === 'at-port').length },
    { name: 'Delayed', value: shipments.filter(s => s.status === 'delayed').length },
    { name: 'At Warehouse', value: shipments.filter(s => s.status === 'at-warehouse').length },
  ];

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Control Tower Dashboard</h1>
            <p className="text-sm text-muted-foreground">Real-time supply chain visibility & disruption intelligence</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
              <Activity className="h-3 w-3 animate-pulse-glow" />
              Network Online
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <KpiCard title="Active Shipments" value={totalShipments} icon={Ship} subtitle="across 14 routes" />
          <KpiCard title="On-Time" value={onTime} icon={CheckCircle} variant="success" subtitle={`${Math.round(onTime/totalShipments*100)}% rate`} />
          <KpiCard title="Delayed" value={delayed} icon={XCircle} variant="warning" subtitle="action required" />
          <KpiCard title="High-Risk" value={highRisk} icon={AlertTriangle} variant="critical" subtitle="above score 50" />
          <KpiCard title="Critical Alerts" value={criticalAlerts} icon={AlertTriangle} variant="critical" subtitle="immediate action" />
          <KpiCard title="Avg Predicted Delay" value={`${avgDelay}h`} icon={Clock} subtitle="across fleet" />
          <KpiCard title="Port Incidents" value={6} icon={Anchor} variant="warning" subtitle="congestion events" />
          <KpiCard title="Supplier Risks" value={3} icon={Users} variant="warning" subtitle="below threshold" />
          <KpiCard title="Carrier Score" value={avgCarrierScore} icon={TrendingUp} subtitle="fleet average" />
          <KpiCard title="Network Health" value={`${networkHealth}%`} icon={Shield} variant={networkHealth > 70 ? 'success' : 'warning'} subtitle="overall score" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Risk Trend */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Risk Trend (7-Day)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={riskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="hsl(0,62%,50%)" fill="hsl(0,62%,50%)" fillOpacity={0.6} />
                <Area type="monotone" dataKey="high" stackId="1" stroke="hsl(25,80%,50%)" fill="hsl(25,80%,50%)" fillOpacity={0.5} />
                <Area type="monotone" dataKey="medium" stackId="1" stroke="hsl(38,85%,55%)" fill="hsl(38,85%,55%)" fillOpacity={0.4} />
                <Area type="monotone" dataKey="low" stackId="1" stroke="hsl(152,55%,45%)" fill="hsl(152,55%,45%)" fillOpacity={0.3} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Shipment Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disruption Causes + Top Risk Shipments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Disruption Causes</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={disruptionCauses} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Risk Shipments */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Top Risk Shipments</h3>
            <div className="space-y-2">
              {topRiskShipments.map(s => (
                <button
                  key={s.id}
                  onClick={() => navigate('/shipments')}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted text-left"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-card-foreground truncate">{s.id} — {s.cargo}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{s.disruptionCause}</div>
                  </div>
                  <RiskBadge score={s.riskScore} showScore />
                </button>
              ))}
            </div>
          </div>

          {/* Live Alerts */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-card-foreground">Live Alerts</h3>
              <button onClick={() => navigate('/alerts')} className="text-xs text-primary hover:underline">View all</button>
            </div>
            <div className="space-y-2">
              {activeAlerts.map(a => (
                <div key={a.id} className="p-2 rounded-md border border-border hover:bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <RiskBadge level={a.severity} />
                    <span className="text-[10px] text-muted-foreground">{new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-card-foreground leading-snug">{a.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
