import { AppLayout } from "@/components/AppLayout";
import { FileText, Download, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const documents = [
  { id: 'DOC-001', name: 'Bill of Lading — SH-2401', type: 'Bill of Lading', shipment: 'SH-2401', status: 'verified', date: '2026-04-10' },
  { id: 'DOC-002', name: 'Commercial Invoice — SH-2402', type: 'Invoice', shipment: 'SH-2402', status: 'pending', date: '2026-04-08' },
  { id: 'DOC-003', name: 'Certificate of Origin — SH-2404', type: 'Certificate', shipment: 'SH-2404', status: 'verified', date: '2026-04-06' },
  { id: 'DOC-004', name: 'Customs Declaration — SH-2407', type: 'Customs', shipment: 'SH-2407', status: 'flagged', date: '2026-04-07' },
  { id: 'DOC-005', name: 'Packing List — SH-2412', type: 'Packing List', shipment: 'SH-2412', status: 'verified', date: '2026-04-04' },
  { id: 'DOC-006', name: 'Phytosanitary Certificate — SH-2410', type: 'Certificate', shipment: 'SH-2410', status: 'pending', date: '2026-04-13' },
  { id: 'DOC-007', name: 'Hazmat Declaration — SH-2407', type: 'Hazmat', shipment: 'SH-2407', status: 'flagged', date: '2026-04-07' },
  { id: 'DOC-008', name: 'Insurance Certificate — SH-2415', type: 'Insurance', shipment: 'SH-2415', status: 'verified', date: '2026-04-08' },
  { id: 'DOC-009', name: 'Export License — SH-2422', type: 'License', shipment: 'SH-2422', status: 'pending', date: '2026-04-15' },
  { id: 'DOC-010', name: 'Temperature Log — SH-2406', type: 'Compliance', shipment: 'SH-2406', status: 'verified', date: '2026-04-09' },
];

export default function DocumentsPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Compliance & Trade Documents
          </h1>
          <p className="text-sm text-muted-foreground">Document tracking, compliance verification, and customs clearance status</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="kpi-card border-success/20 bg-success/5">
            <p className="text-xs text-muted-foreground">Verified</p>
            <p className="text-2xl font-bold text-success">{documents.filter(d => d.status === 'verified').length}</p>
          </div>
          <div className="kpi-card border-warning/20 bg-warning/5">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning">{documents.filter(d => d.status === 'pending').length}</p>
          </div>
          <div className="kpi-card border-destructive/20 bg-destructive/5">
            <p className="text-xs text-muted-foreground">Flagged</p>
            <p className="text-2xl font-bold text-destructive">{documents.filter(d => d.status === 'flagged').length}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['ID', 'Document', 'Type', 'Shipment', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map(d => (
                <tr key={d.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-3 py-2 text-xs font-mono text-primary">{d.id}</td>
                  <td className="px-3 py-2 text-xs font-medium text-card-foreground">{d.name}</td>
                  <td className="px-3 py-2"><span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{d.type}</span></td>
                  <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{d.shipment}</td>
                  <td className="px-3 py-2">
                    <span className={`status-badge ${d.status === 'verified' ? 'risk-low' : d.status === 'pending' ? 'risk-medium' : 'risk-critical'}`}>
                      {d.status === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {d.status === 'flagged' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {d.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{d.date}</td>
                  <td className="px-3 py-2">
                    <Button size="sm" variant="ghost" className="h-6 text-[10px]">
                      <Download className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
