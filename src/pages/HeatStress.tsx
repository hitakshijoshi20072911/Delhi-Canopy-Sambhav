import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { FloatingAIAssistant } from "@/components/ai/FloatingAIAssistant";
import { GlassCard } from "@/components/ui/GlassCard";
import { HeatScatterChart } from "@/components/charts/HeatScatterChart";
import { ChartErrorBoundary } from "@/components/ui/ChartErrorBoundary";
import { wardData, monthlyHeatData } from "@/data/mockData";
import { 
  Thermometer, 
  AlertTriangle,
  MapPin,
  Flame,
  Wind
} from "lucide-react";
import { cn } from "@/lib/utils";

const HeatStress = () => {
  const avgHeatIndex = wardData.reduce((sum, w) => sum + w.heatIndex, 0) / wardData.length;
  const criticalZones = wardData.filter(w => w.heatIndex > 85).length;
  const maxHeat = Math.max(...wardData.map(w => w.heatIndex));
  const sortedByHeat = [...wardData].sort((a, b) => b.heatIndex - a.heatIndex);

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navigation />
      
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-[1600px]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-warning flex items-center justify-center shadow-[0_0_20px_hsl(var(--destructive)/0.5)]">
                <Thermometer className="w-5 h-5 text-destructive-foreground" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-wide">
                  <span className="text-destructive">HEAT</span>{" "}
                  <span className="text-muted-foreground">STRESS ANALYZER</span>
                </h1>
                <p className="text-xs text-muted-foreground font-tech">
                  Urban Heat Islands • Temperature Mapping • Vulnerability Assessment
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Avg Heat Index', value: avgHeatIndex.toFixed(0), icon: Thermometer, color: 'text-warning' },
              { label: 'Critical Zones', value: criticalZones, icon: AlertTriangle, color: 'text-destructive' },
              { label: 'Peak Temperature', value: `${maxHeat}°`, icon: Flame, color: 'text-destructive' },
              { label: 'Cooling Potential', value: '-4.2°C', icon: Wind, color: 'text-secondary' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "glass-card p-4",
                  stat.color === 'text-destructive' && "border-destructive/30"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                  <span className="text-xs text-muted-foreground font-tech uppercase">{stat.label}</span>
                </div>
                <span className={cn("text-2xl font-display font-bold", stat.color)}>{stat.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Heat vs Green Cover - Advanced Scatter Chart */}
            <ChartErrorBoundary componentName="Correlation Chart" fallbackHeight="h-[340px]">
              <HeatScatterChart />
            </ChartErrorBoundary>

            {/* Monthly Trend - Simple Bar Chart */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-4 h-4 text-warning" />
                <h3 className="text-sm font-display font-semibold">MONTHLY HEAT TREND</h3>
              </div>
              <div className="flex items-end justify-between h-[280px] gap-1 px-2 pb-6">
                {monthlyHeatData.map((data, index) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center h-[230px]">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(data.avgTemp / 50) * 100}%` }}
                        transition={{ delay: index * 0.05, duration: 0.5 }}
                        className={cn(
                          "w-full max-w-6 rounded-t",
                          data.avgTemp > 40 ? "bg-gradient-to-t from-destructive/50 to-destructive" 
                          : data.avgTemp > 30 ? "bg-gradient-to-t from-warning/50 to-warning"
                          : "bg-gradient-to-t from-primary/50 to-primary"
                        )}
                      />
                    </div>
                    <span className="text-[8px] font-tech text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Vulnerability Ranking */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-display font-semibold">HEAT VULNERABILITY RANKING</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedByHeat.slice(0, 6).map((ward, idx) => (
                  <motion.div
                    key={ward.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      ward.heatIndex > 90 
                        ? "bg-destructive/10 border-destructive/30 animate-pulse" 
                        : ward.heatIndex > 80 
                        ? "bg-warning/10 border-warning/30"
                        : "bg-card/50 border-border/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{ward.name}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        ward.heatIndex > 90 
                          ? "bg-destructive/20 text-destructive" 
                          : "bg-warning/20 text-warning"
                      )}>
                        #{idx + 1}
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground font-tech">Heat Index</p>
                        <span className={cn(
                          "text-2xl font-display font-bold",
                          ward.heatIndex > 90 ? "text-destructive" : "text-warning"
                        )}>
                          {ward.heatIndex}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-tech">Green Cover</p>
                        <span className="text-lg font-tech text-primary">{ward.greenCover}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </GlassCard>
        </div>
      </main>

      <FloatingAIAssistant />
    </div>
  );
};

export default HeatStress;