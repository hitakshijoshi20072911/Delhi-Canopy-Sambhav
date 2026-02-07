import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  TreeDeciduous, 
  Thermometer, 
  AlertTriangle, 
  Wind, 
  TreePine,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { useEffect, useState } from "react";

interface KPICardProps {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  icon: string;
  status: 'normal' | 'warning' | 'critical';
  delay?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TreeDeciduous,
  Thermometer,
  AlertTriangle,
  Wind,
  TreePine
};

export function KPICard({ 
  label, 
  value, 
  unit, 
  trend, 
  trendValue, 
  icon, 
  status,
  delay = 0 
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const Icon = iconMap[icon] || TreeDeciduous;

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const statusColors = {
    normal: 'border-primary/30 hover:border-primary/50',
    warning: 'border-warning/30 hover:border-warning/50',
    critical: 'border-destructive/30 hover:border-destructive/50 animate-border-glow'
  };

  const statusGlows = {
    normal: 'shadow-[0_0_20px_hsl(var(--primary)/0.15)]',
    warning: 'shadow-[0_0_20px_hsl(var(--warning)/0.15)]',
    critical: 'shadow-[0_0_20px_hsl(var(--destructive)/0.2)]'
  };

  const iconColors = {
    normal: 'text-primary',
    warning: 'text-warning',
    critical: 'text-destructive'
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' 
    ? (status === 'critical' ? 'text-destructive' : 'text-primary') 
    : trend === 'down' 
    ? (status === 'critical' ? 'text-primary' : 'text-destructive')
    : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-xl p-4 backdrop-blur-xl",
        "bg-card/80 border transition-all duration-300",
        statusColors[status],
        statusGlows[status]
      )}
    >
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Scan line effect for critical */}
      {status === 'critical' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-destructive/50 to-transparent animate-scan-line" />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "p-2 rounded-lg bg-gradient-to-br from-card to-muted/50",
          "border border-border/50"
        )}>
          <Icon className={cn("w-5 h-5", iconColors[status])} />
        </div>
        <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
          <TrendIcon className="w-3 h-3" />
          <span>{Math.abs(trendValue)}{typeof trendValue === 'number' && !unit.includes('%') ? '' : '%'}</span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "text-2xl font-display font-bold tracking-tight",
            status === 'critical' ? 'text-glow' : ''
          )}>
            {displayValue.toFixed(unit === '%' ? 1 : 0)}
          </span>
          <span className="text-sm text-muted-foreground font-tech">{unit}</span>
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-border to-transparent">
        <motion.div 
          className={cn(
            "h-full",
            status === 'critical' ? 'bg-destructive' : status === 'warning' ? 'bg-warning' : 'bg-primary'
          )}
          initial={{ width: '0%' }}
          animate={{ width: `${Math.min((displayValue / value) * 100, 100)}%` }}
          transition={{ duration: 1.5, delay: delay * 0.1 }}
        />
      </div>
    </motion.div>
  );
}
