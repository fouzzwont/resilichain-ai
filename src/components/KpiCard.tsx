import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  variant?: 'default' | 'warning' | 'critical' | 'success';
}

const variantStyles = {
  default: 'border-border',
  warning: 'border-warning/30 bg-warning/5',
  critical: 'border-destructive/30 bg-destructive/5',
  success: 'border-success/30 bg-success/5',
};

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  warning: 'bg-warning/15 text-warning',
  critical: 'bg-destructive/15 text-destructive',
  success: 'bg-success/15 text-success',
};

export function KpiCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: KpiCardProps) {
  return (
    <div className={cn("kpi-card", variantStyles[variant])}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className={cn("p-1.5 rounded-md", iconStyles[variant])}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-card-foreground">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        {trend && (
          <span className={cn("text-xs font-medium", trend.positive ? "text-success" : "text-destructive")}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
