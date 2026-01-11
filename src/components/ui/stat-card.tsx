import { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, subtitle, icon: Icon, trend, variant = 'default' }, ref) => {
    const variantStyles = {
      default: 'before:bg-primary',
      primary: 'before:bg-primary',
      success: 'before:bg-success',
      warning: 'before:bg-warning',
    };

    return (
      <div ref={ref} className={`stat-card border border-border/50 ${variantStyles[variant]}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p className={`mt-2 text-sm font-medium ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last semester
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';

export default StatCard;
