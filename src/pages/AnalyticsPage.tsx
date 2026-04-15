import { AppLayout } from "@/components/AppLayout";
import { shipments, carriers, alerts } from "@/data/mockData";
import { BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ['hsl(192,70%,45%)', 'hsl(152,55%,40%)', 'hsl(38,85%,50%)', 'hsl(0,62%,50%)', 'hsl(210,65%,50%)', 'hsl(270,50%,55%)'];

export default function AnalyticsPage() {
  const performanceTrend = [
    { week: 'W10', onTime: 78, delayed: 22 },
    { week: 'W11', onTime: 82, delayed: 18 },
    { week: 'W12', onTime: 75, delayed: 25 },
    { week: 'W13', onTime: 80, delayed: 20 },
    { week: 'W14', onTime: 71, delayed: 29 },
    { week: 'W15', onTime: 73, delayed: 27 },
  ];

  const carrierComparison = carriers.map(c => ({ name: c.name.split(' ')[0], score: c.performanceScore, onTime: c.onTimeRate }));

  const incidentTypes = [
    { name: 'Port Congestion', value: 8 },
    { name: 'Weather', value: 6 },
    { name: 'Customs Delay', value: 5 },
    { name: 'Carrier Issues', value: 7 },
    { name: 'Geopolitical', value: 3 },
    { name: 'Cold Chain', value: 4 },
  ];

  const regionRisk = [
    { region: 'Asia-Europe', risk: 62 },
    { region: 'Asia-Americas', risk: 72 },
    { region: 'Intra-Asia', risk: 48 },
    { region: 'Europe-Americas', risk: 22 },
    { region: 'Africa', risk: 55 },
    { region: 'Middle East', risk: 58 },
  ];

  const exportCSV = () => {
    const headers = 'ID,Cargo,Origin,Destination,Risk Score,Delay Hours,Status\n';
    const rows = shipments.map(s => `${s.id},${s.cargo},${s.origin},${s.destination},${s.riskScore},${s.predictedDelayHours},${s.status}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'resilichain-analytics.csv'; a.click();
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Resilience Analytics
            </h1>
            <p className="text-sm text-muted-foreground">Shipment performance, disruption trends, and risk distribution</p>
          </div>
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={exportCSV}>
            <Download className="h-3 w-3 mr-1" /> Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Performance Trend */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">On-Time vs Delayed Rate (%)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="onTime" stroke="hsl(152,55%,40%)" strokeWidth={2} name="On-Time %" />
                <Line type="monotone" dataKey="delayed" stroke="hsl(0,62%,50%)" strokeWidth={2} name="Delayed %" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Carrier Comparison */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Carrier Performance</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={carrierComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="onTime" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="On-Time %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Incident Types */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Incident Type Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={incidentTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {incidentTypes.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Region Risk */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Regional Risk Summary</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={regionRisk} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="region" type="category" width={100} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="risk" fill="hsl(var(--warning))" radius={[0, 4, 4, 0]} name="Risk Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
