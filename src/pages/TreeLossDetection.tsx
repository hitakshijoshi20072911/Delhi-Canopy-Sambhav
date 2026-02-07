import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { FloatingAIAssistant } from "@/components/ai/FloatingAIAssistant";
import { GlassCard } from "@/components/ui/GlassCard";
import { recentAlerts } from "@/data/mockData";
import { 
  AlertOctagon, 
  TreePine,
  Eye,
  Clock,
  MapPin,
  Camera,
  ChevronLeft,
  ChevronRight,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format, parseISO } from "date-fns";

const TreeLossDetection = () => {
  const [selectedAlert, setSelectedAlert] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);

  const treeLossAlerts = recentAlerts.filter(a => a.type === 'tree_loss');
  const currentAlert = treeLossAlerts[selectedAlert];

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-warning flex items-center justify-center shadow-[0_0_20px_hsl(var(--destructive)/0.5)] animate-pulse">
                <AlertOctagon className="w-5 h-5 text-destructive-foreground" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-wide">
                  <span className="text-destructive">TREE LOSS</span>{" "}
                  <span className="text-muted-foreground">DETECTION</span>
                </h1>
                <p className="text-xs text-muted-foreground font-tech">
                  Satellite Monitoring • Illegal Felling Alerts • Before/After Analysis
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Active Alerts', value: treeLossAlerts.length, color: 'text-destructive' },
              { label: 'Trees Lost (24h)', value: '23', color: 'text-warning' },
              { label: 'Hotspot Zones', value: '5', color: 'text-destructive' },
              { label: 'Detection Rate', value: '94%', color: 'text-primary' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-4"
              >
                <span className="text-xs text-muted-foreground font-tech uppercase">{stat.label}</span>
                <div className={cn("text-2xl font-display font-bold", stat.color)}>{stat.value}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Alert Timeline */}
            <GlassCard className="p-5 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-destructive" />
                <h3 className="text-sm font-display font-semibold">DETECTION TIMELINE</h3>
              </div>

              <div className="space-y-3">
                {treeLossAlerts.map((alert, idx) => (
                  <motion.button
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedAlert(idx)}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left transition-all",
                      selectedAlert === idx
                        ? "bg-destructive/10 border-destructive/30"
                        : "bg-card/30 border-border/30 hover:border-border"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <TreePine className={cn(
                        "w-4 h-4",
                        selectedAlert === idx ? "text-destructive" : "text-muted-foreground"
                      )} />
                      <span className="text-sm font-medium">{alert.ward}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(parseISO(alert.timestamp), 'MMM dd, HH:mm')}
                    </div>
                  </motion.button>
                ))}
              </div>
            </GlassCard>

            {/* Before/After Comparison */}
            <GlassCard className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-secondary" />
                  <h3 className="text-sm font-display font-semibold">SATELLITE COMPARISON</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedAlert(Math.max(0, selectedAlert - 1))}
                    disabled={selectedAlert === 0}
                    className="p-1 rounded hover:bg-card/50 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-tech text-muted-foreground">
                    {selectedAlert + 1} / {treeLossAlerts.length}
                  </span>
                  <button
                    onClick={() => setSelectedAlert(Math.min(treeLossAlerts.length - 1, selectedAlert + 1))}
                    disabled={selectedAlert === treeLossAlerts.length - 1}
                    className="p-1 rounded hover:bg-card/50 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image Comparison Slider */}
              <div className="relative h-[300px] rounded-lg overflow-hidden bg-card/30 border border-border/30 mb-4">
                {/* Before Image (Simulated) */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <TreePine className="w-16 h-16 text-primary mx-auto mb-2" />
                      <span className="text-xs font-tech text-primary uppercase">Before</span>
                      <p className="text-sm text-foreground">Healthy Vegetation</p>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-1 rounded bg-primary/20 border border-primary/30">
                    <span className="text-[10px] font-tech text-primary">BEFORE: 15 Trees</span>
                  </div>
                </div>

                {/* After Image (Simulated) */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-destructive/30 to-destructive/10"
                  style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <AlertOctagon className="w-16 h-16 text-destructive mx-auto mb-2" />
                      <span className="text-xs font-tech text-destructive uppercase">After</span>
                      <p className="text-sm text-foreground">Tree Loss Detected</p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 rounded bg-destructive/20 border border-destructive/30">
                    <span className="text-[10px] font-tech text-destructive">AFTER: 3 Trees</span>
                  </div>
                </div>

                {/* Slider Handle */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-foreground cursor-ew-resize"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card border-2 border-foreground flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>

                {/* Slider Input */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                />

                {/* Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: `
                    linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }} />
              </div>

              {/* Alert Details */}
              {currentAlert && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-destructive mb-1">
                        {currentAlert.severity.toUpperCase()} ALERT: {currentAlert.ward}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {currentAlert.message}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-tech">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {currentAlert.coordinates[0].toFixed(4)}°N, {currentAlert.coordinates[1].toFixed(4)}°E
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(currentAlert.timestamp), 'PPp')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Heatmap Section */}
          <GlassCard className="p-5 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-display font-semibold">ILLEGAL FELLING HOTSPOTS</h3>
            </div>
            <div className="h-[200px] rounded-lg bg-card/30 border border-border/30 relative overflow-hidden">
              {/* Simulated Heatmap */}
              <div className="absolute inset-0" style={{
                background: `
                  radial-gradient(circle at 30% 40%, hsl(0 80% 50% / 0.5) 0%, transparent 20%),
                  radial-gradient(circle at 70% 30%, hsl(0 80% 50% / 0.4) 0%, transparent 15%),
                  radial-gradient(circle at 50% 70%, hsl(45 100% 50% / 0.4) 0%, transparent 18%),
                  radial-gradient(circle at 20% 70%, hsl(0 80% 50% / 0.3) 0%, transparent 12%),
                  radial-gradient(circle at 80% 60%, hsl(45 100% 50% / 0.35) 0%, transparent 14%)
                `
              }} />
              
              {/* Legend */}
              <div className="absolute bottom-3 right-3 flex items-center gap-3 px-3 py-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-[10px] font-tech text-muted-foreground">High Risk</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-[10px] font-tech text-muted-foreground">Medium Risk</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-[10px] font-tech text-muted-foreground">Low Risk</span>
                </div>
              </div>

              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-card/80 backdrop-blur-sm border border-border/50">
                <span className="text-[10px] font-tech text-muted-foreground">NCT DELHI • TREE LOSS HEATMAP</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>

      <FloatingAIAssistant />
    </div>
  );
};

export default TreeLossDetection;
