import { AppLayout } from "@/components/AppLayout";
import { scenarioTemplates, shipments, type ScenarioTemplate, type Shipment } from "@/data/mockData";
import { RiskBadge } from "@/components/RiskBadge";
import { useState } from "react";
import { Zap, Play, RotateCcw, AlertTriangle, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimResult {
  scenario: ScenarioTemplate;
  impactedShipments: (Shipment & { newRisk: number; addedDelay: number })[];
  totalImpacted: number;
  avgAddedDelay: number;
  mitigationPlan: string[];
}

function runSimulation(scenario: ScenarioTemplate): SimResult {
  const impacted = shipments
    .filter(s => {
      if (scenario.params.carrier && s.carrier === scenario.params.carrier) return true;
      if (scenario.params.route && s.route.includes(scenario.params.route)) return true;
      if (scenario.params.region && s.region.includes(scenario.params.region)) return true;
      if (scenario.params.port && (s.origin.includes(scenario.params.port) || s.destination.includes(scenario.params.port) || s.currentLocation.includes(scenario.params.port))) return true;
      if (!scenario.params.carrier && !scenario.params.route && !scenario.params.region && !scenario.params.port) return Math.random() > 0.6;
      return false;
    })
    .map(s => ({
      ...s,
      newRisk: Math.min(100, s.riskScore + Math.floor(Math.random() * 30 + 15)),
      addedDelay: Math.floor(Math.random() * 48 + 12),
    }));

  const mitigations: Record<string, string[]> = {
    'SC-01': ['Divert affected vessels to Visakhapatnam or Tuticorin', 'Activate inland transport for last-mile', 'Pre-position inventory at alternate warehouse'],
    'SC-02': ['Reroute via Cape of Good Hope for critical cargo', 'Activate air freight for time-sensitive shipments', 'Notify all downstream buyers of delay estimates'],
    'SC-03': ['Switch to Maersk or Hapag-Lloyd for active bookings', 'Negotiate emergency capacity with backup carriers', 'Activate safety stock at destination warehouses'],
    'SC-04': ['Pre-clear documentation digitally', 'Redirect to UK/Scandinavian ports', 'Activate bonded warehouse storage'],
    'SC-05': ['Consolidate shipments to reduce voyages', 'Switch low-priority cargo to rail', 'Renegotiate fuel surcharge contracts'],
    'SC-06': ['Activate FabricWorld Ltd as alternate supplier', 'Redirect existing inventory from regional warehouse', 'Place emergency orders with secondary tier suppliers'],
    'SC-07': ['Hold departures until storm passes', 'Divert active vessels to safe ports', 'Activate weather insurance claims process'],
    'SC-08': ['Reroute via Suez Canal', 'Activate naval corridor coordination', 'Pre-position backup inventory at destination'],
  };

  return {
    scenario,
    impactedShipments: impacted,
    totalImpacted: impacted.length,
    avgAddedDelay: impacted.length > 0 ? Math.round(impacted.reduce((a, s) => a + s.addedDelay, 0) / impacted.length) : 0,
    mitigationPlan: mitigations[scenario.id] || ['Activate contingency protocol', 'Notify stakeholders', 'Monitor situation'],
  };
}

export default function SimulatorPage() {
  const [result, setResult] = useState<SimResult | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = (sc: ScenarioTemplate) => {
    setRunning(true);
    setTimeout(() => {
      setResult(runSimulation(sc));
      setRunning(false);
    }, 1200);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Scenario Simulator
          </h1>
          <p className="text-sm text-muted-foreground">Simulate disruption events and evaluate supply chain resilience</p>
        </div>

        {/* Scenario Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenarioTemplates.map(sc => (
            <button
              key={sc.id}
              onClick={() => handleRun(sc)}
              disabled={running}
              className="bg-card border border-border rounded-lg p-4 text-left hover:border-primary/50 hover:bg-accent/30 transition-colors disabled:opacity-50"
            >
              <div className="text-2xl mb-2">{sc.icon}</div>
              <h3 className="text-sm font-semibold text-card-foreground mb-1">{sc.name}</h3>
              <p className="text-[11px] text-muted-foreground">{sc.description}</p>
            </button>
          ))}
        </div>

        {/* Loading */}
        {running && (
          <div className="bg-card border border-primary/30 rounded-lg p-8 text-center space-y-3">
            <div className="h-8 w-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-card-foreground">Running disruption simulation...</p>
            <p className="text-xs text-muted-foreground">Analyzing impact across supply chain network</p>
          </div>
        )}

        {/* Results */}
        {result && !running && (
          <div className="space-y-4">
            <div className="bg-card border border-warning/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                    <span className="text-lg">{result.scenario.icon}</span>
                    {result.scenario.name} — Simulation Results
                  </h3>
                  <p className="text-xs text-muted-foreground">{result.scenario.description}</p>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setResult(null)}>
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="kpi-card border-destructive/20">
                  <p className="text-xs text-muted-foreground">Impacted Shipments</p>
                  <p className="text-2xl font-bold text-destructive">{result.totalImpacted}</p>
                </div>
                <div className="kpi-card border-warning/20">
                  <p className="text-xs text-muted-foreground">Avg Added Delay</p>
                  <p className="text-2xl font-bold text-warning">+{result.avgAddedDelay}h</p>
                </div>
                <div className="kpi-card">
                  <p className="text-xs text-muted-foreground">Of Total Fleet</p>
                  <p className="text-2xl font-bold text-card-foreground">{Math.round(result.totalImpacted / shipments.length * 100)}%</p>
                </div>
              </div>

              {/* Impacted Shipments */}
              {result.impactedShipments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-card-foreground mb-2">Impacted Shipments</h4>
                  <div className="space-y-1.5">
                    {result.impactedShipments.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-primary">{s.id}</span>
                          <span className="text-card-foreground truncate max-w-[120px]">{s.cargo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Risk: {s.riskScore}→</span>
                          <RiskBadge score={s.newRisk} showScore />
                          <span className="text-warning font-medium">+{s.addedDelay}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mitigation Plan */}
              <div className="bg-primary/10 rounded-md p-3">
                <p className="text-[10px] text-primary uppercase font-semibold mb-1.5">⚡ Suggested Mitigation Plan</p>
                <ol className="space-y-1">
                  {result.mitigationPlan.map((m, i) => (
                    <li key={i} className="text-xs text-card-foreground flex items-start gap-2">
                      <span className="text-primary font-semibold">{i + 1}.</span> {m}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
