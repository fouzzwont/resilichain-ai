import { cn } from "@/lib/utils";
import { getRiskBgClass, getRiskLevel, type Severity } from "@/data/parcels";

interface RiskBadgeProps {
  score?: number;
  level?: Severity;
  showScore?: boolean;
}

const LABELS: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function RiskBadge({ score, level, showScore = false }: RiskBadgeProps) {
  const riskLevel = level ?? (score !== undefined ? getRiskLevel(score) : "low");
  const riskClass = score !== undefined ? getRiskBgClass(score) : `risk-${riskLevel}`;

  return (
    <span className={cn("status-badge", riskClass)}>
      {LABELS[riskLevel]}
      {showScore && score !== undefined ? ` (${score})` : ""}
    </span>
  );
}
