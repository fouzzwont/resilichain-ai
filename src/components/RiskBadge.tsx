import { cn } from "@/lib/utils";
import { getRiskLevel, getRiskBgClass, type RiskLevel } from "@/data/mockData";

interface RiskBadgeProps {
  score?: number;
  level?: RiskLevel;
  showScore?: boolean;
}

export function RiskBadge({ score, level, showScore = false }: RiskBadgeProps) {
  const riskLevel = level || (score !== undefined ? getRiskLevel(score) : 'low');
  const riskClass = score !== undefined ? getRiskBgClass(score) : `risk-${riskLevel}`;
  const labels: Record<RiskLevel, string> = {
    low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical'
  };

  return (
    <span className={cn("status-badge", riskClass)}>
      {labels[riskLevel]}{showScore && score !== undefined ? ` (${score})` : ''}
    </span>
  );
}
