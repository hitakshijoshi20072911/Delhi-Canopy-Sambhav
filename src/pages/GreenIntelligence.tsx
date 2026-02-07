import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { FloatingAIAssistant } from "@/components/ai/FloatingAIAssistant";
import { GlassCard } from "@/components/ui/GlassCard";
import { GreenCoverBarChart } from "@/components/charts/GreenCoverBarChart";
import { ChartErrorBoundary } from "@/components/ui/ChartErrorBoundary";
import { wardData } from "@/data/mockData";
import { 
  TreeDeciduous, 
  TrendingUp, 
  TrendingDown,
  Target,
  Leaf
} from "lucide-react";
import { cn } from "@/lib/utils";

const GreenIntelligence = () => {
  const sortedByGreen = [...wardData].sort((a, b) => a.greenCover - b.greenCover);
  const avgGreenCover = wardData.reduce((sum, w) => sum + w.greenCover, 0) / wardData.length;
  const deficitZones = wardData.filter(w => w.greenCover < 20).length;
  const healthyZones = wardData.filter(w => w.greenCover >= 30).length;

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
                <TreeDeciduous className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-wide">
                  <span className="text-glow">GREEN</span>{" "}
                  <span className="text-muted-foreground">INTELLIGENCE</span>
                </h1>
                <p className="text-xs text-muted-foreground font-tech">
                  Vegetation Analytics • Coverage Mapping • Deficit Analysis
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Avg Green Cover', value: `${avgGreenCover.toFixed(1)}%`, icon: Leaf, color: 'text-primary' },
              { label: 'Deficit Zones', value: deficitZones, icon: TrendingDown, color: 'text-destructive' },
              { label: 'Healthy Zones', value: healthyZones, icon: TrendingUp, color: 'text-primary' },
              { label: 'Total CO₂ Offset', value: '4,341t', icon: Target, color: 'text-secondary' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                  <span className="text-xs text-muted-foreground font-tech uppercase">{stat.label}</span>
                </div>
                <span className={cn("text-2xl font-display font-bold", stat.color)}>{stat.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Green Cover Chart - Using Recharts with Error Boundary */}
            <ChartErrorBoundary componentName="Green Cover Chart" fallbackHeight="h-[340px]">
              <GreenCoverBarChart />
            </ChartErrorBoundary>

            {/* Priority Zones */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-secondary" />
                <h3 className="text-sm font-display font-semibold">PLANTATION PRIORITY ZONES</h3>
              </div>
              <div className="space-y-3">
                {sortedByGreen.slice(0, 6).map((ward, idx) => (
                  <motion.div
                    key={ward.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/30"
                  >
                    <span className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                      ward.greenCover < 15 ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                    )}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{ward.name}</p>
                      <p className="text-xs text-muted-foreground font-tech">
                        Deficit: {(30 - ward.greenCover).toFixed(0)}% below target
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-lg font-display font-bold",
                        ward.greenCover < 15 ? 'text-destructive' : 'text-warning'
                      )}>
                        {ward.greenCover}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* AI Summary */}
          <GlassCard className="p-5 glow-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <TreeDeciduous className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-display font-semibold text-glow mb-2">AI VEGETATION SUMMARY</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Analysis indicates <span className="text-destructive font-bold">{deficitZones} zones</span> are critically below the 20% green cover threshold. 
                  Priority intervention is recommended for <span className="text-warning font-bold">Sadar Bazaar</span> and <span className="text-warning font-bold">Karol Bagh</span> zones, 
                  which show severe vegetation deficiency correlating with high heat stress indices. 
                  Immediate plantation of approximately <span className="text-primary font-bold">2,400 trees</span> could reduce local temperatures by up to 3.5°C.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>

      <FloatingAIAssistant />
    </div>
  );
};

export default GreenIntelligence;