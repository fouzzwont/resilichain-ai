import { AppLayout } from "@/components/AppLayout";
import { RiskBadge } from "@/components/RiskBadge";
import { carriers, suppliers } from "@/data/mockData";
import { Truck, TrendingUp, TrendingDown, Minus, Users, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const trendIcon = (t: string) => {
  if (t === 'improving') return <TrendingUp className="h-3 w-3 text-success" />;
  if (t === 'declining') return <TrendingDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

export default function CarriersPage() {
  const carrierChartData = carriers.map(c => ({ name: c.name.split(' ')[0], score: c.performanceScore, delay: c.avgDelay }));

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Carrier & Supplier Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">Performance scoring, reliability trends, and alternate recommendations</p>
        </div>

        {/* Carrier Performance Chart */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Carrier Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={carrierChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Score" />
              <Bar dataKey="delay" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="Avg Delay (h)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Carrier Cards */}
        <h3 className="text-sm font-semibold text-foreground">Carrier Profiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {carriers.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-card-foreground">{c.name}</h4>
                <RiskBadge level={c.riskLevel} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-1.5 bg-muted/50 rounded">
                  <p className="text-lg font-bold text-card-foreground">{c.performanceScore}</p>
                  <p className="text-[9px] text-muted-foreground">Score</p>
                </div>
                <div className="p-1.5 bg-muted/50 rounded">
                  <p className="text-lg font-bold text-card-foreground">{c.onTimeRate}%</p>
                  <p className="text-[9px] text-muted-foreground">On-Time</p>
                </div>
                <div className="p-1.5 bg-muted/50 rounded">
                  <p className="text-lg font-bold text-card-foreground">{c.avgDelay}h</p>
                  <p className="text-[9px] text-muted-foreground">Avg Delay</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{c.incidentCount} incidents</span>
                <span className="flex items-center gap-1">{trendIcon(c.reliabilityTrend)} {c.reliabilityTrend}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Lanes: {c.lanes.join(', ')}</p>
            </div>
          ))}
        </div>

        {/* Suppliers */}
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 pt-2">
          <Users className="h-4 w-4 text-primary" /> Supplier Intelligence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {suppliers.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-card-foreground">{s.name}</h4>
                <RiskBadge level={s.riskLevel} />
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span>Reliability: <strong>{s.reliabilityScore}</strong></span>
                <span>Incidents: <strong>{s.incidentCount}</strong></span>
              </div>
              <p className="text-[10px] text-muted-foreground">Region: {s.region}</p>
              {s.alternates.length > 0 && (
                <p className="text-[10px] text-primary">Alt: {s.alternates.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
