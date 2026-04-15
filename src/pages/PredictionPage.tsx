import { AppLayout } from "@/components/AppLayout";
import { RiskBadge } from "@/components/RiskBadge";
import { shipments, getRiskLevel } from "@/data/mockData";
import { Brain, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Zap, Target, BarChart3 } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function PredictionPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedByRisk = [...shipments].sort((a, b) => b.riskScore - a.riskScore);
  const criticals = sortedByRisk.filter(s => s.riskScore >= 75);
  const highs = sortedByRisk.filter(s => s.riskScore >= 50 && s.riskScore < 75);
  const avgConfidence = Math.round(shipments.reduce((a, s) => a + s.confidenceLevel, 0) / shipments.length);
  const avgDisruption = Math.round(shipments.reduce((a, s) => a + s.disruptionProbability, 0) / shipments.length);

  const riskDistribution = [
    { range: '0-25', count: shipments.filter(s => s.riskScore < 25).length, fill: 'hsl(152,55%,40%)' },
    { range: '25-50', count: shipments.filter(s => s.riskScore >= 25 && s.riskScore < 50).length, fill: 'hsl(38,85%,50%)' },
    { range: '50-75', count: shipments.filter(s => s.riskScore >= 50 && s.riskScore < 75).length, fill: 'hsl(25,80%,50%)' },
    { range: '75-100', count: shipments.filter(s => s.riskScore >= 75).length, fill: 'hsl(0,62%,50%)' },
  ];

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Disruption Prediction Engine
          </h1>
          <p className="text-sm text-muted-foreground">AI-powered risk scoring, delay prediction, and root cause analysis</p>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="kpi-card">
            <p className="text-xs text-muted-foreground mb-1">Avg Disruption Probability</p>
            <p className="text-2xl font-bold text-foreground">{avgDisruption}%</p>
          </div>
          <div className="kpi-card">
            <p className="text-xs text-muted-foreground mb-1">Model Confidence</p>
            <p className="text-2xl font-bold text-foreground">{avgConfidence}%</p>
          </div>
          <div className="kpi-card border-destructive/30 bg-destructive/5">
            <p className="text-xs text-muted-foreground mb-1">Critical Predictions</p>
            <p className="text-2xl font-bold text-destructive">{criticals.length}</p>
          </div>
          <div className="kpi-card border-warning/30 bg-warning/5">
            <p className="text-xs text-muted-foreground mb-1">High-Risk Predictions</p>
            <p className="text-2xl font-bold text-warning">{highs.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Risk Distribution Chart */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Risk Score Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskDistribution.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Prediction Cards */}
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">AI Predictions by Shipment</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {sortedByRisk.map(s => {
                const expanded = expandedId === s.id;
                return (
                  <div key={s.id} className="bg-card border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedId(expanded ? null : s.id)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold" style={{
                        color: s.riskScore >= 75 ? 'hsl(0,62%,50%)' : s.riskScore >= 50 ? 'hsl(25,80%,50%)' : s.riskScore >= 25 ? 'hsl(38,85%,50%)' : 'hsl(152,55%,40%)'
                      }}>
                        {s.riskScore}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-primary">{s.id}</span>
                          <span className="text-xs text-card-foreground font-medium truncate">{s.cargo}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{s.disruptionCause || 'No disruption detected'}</p>
                      </div>
                      <RiskBadge score={s.riskScore} />
                      <span className="text-xs text-muted-foreground">{s.disruptionProbability}%</span>
                      {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    {expanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-border space-y-3">
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Risk Score', value: `${s.riskScore}/100`, icon: Target },
                            { label: 'Disruption Prob.', value: `${s.disruptionProbability}%`, icon: BarChart3 },
                            { label: 'Predicted Delay', value: `+${s.predictedDelayHours}h`, icon: TrendingUp },
                            { label: 'Confidence', value: `${s.confidenceLevel}%`, icon: Zap },
                          ].map(m => (
                            <div key={m.label} className="p-2 bg-muted/50 rounded text-center">
                              <m.icon className="h-3 w-3 mx-auto text-primary mb-1" />
                              <p className="text-sm font-bold text-card-foreground">{m.value}</p>
                              <p className="text-[9px] text-muted-foreground">{m.label}</p>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs space-y-1.5">
                          <div><span className="text-muted-foreground">Root Cause:</span> <span className="text-card-foreground">{s.disruptionCause}</span></div>
                          <div><span className="text-muted-foreground">Impact:</span> <span className="text-card-foreground">{s.businessImpact}</span></div>
                          <div><span className="text-muted-foreground">Route:</span> <span className="text-card-foreground">{s.route}</span></div>
                          <div><span className="text-muted-foreground">Severity:</span> <RiskBadge score={s.riskScore} showScore /></div>
                        </div>
                        <div className="bg-primary/10 rounded-md p-2.5">
                          <p className="text-[10px] text-primary uppercase font-semibold mb-0.5">⚡ AI Recommendation</p>
                          <p className="text-xs text-card-foreground">{s.recommendedAction}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
