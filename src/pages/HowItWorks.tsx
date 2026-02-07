import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { FloatingAIAssistant } from "@/components/ai/FloatingAIAssistant";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Satellite, 
  Database, 
  Brain, 
  Thermometer,
  TreeDeciduous,
  Building2,
  ArrowRight,
  Zap,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    title: 'Satellite Data Collection',
    description: 'High-resolution satellite imagery captured every 24 hours covering entire NCT Delhi region.',
    icon: Satellite,
    color: 'from-secondary to-secondary/50',
    details: ['Landsat 8/9 Integration', 'Sentinel-2 Multi-spectral', 'MODIS Real-time Feed']
  },
  {
    id: 2,
    title: 'Climate Data Processing',
    description: 'Integration of temperature, humidity, and weather data from IoT sensors and weather stations.',
    icon: Database,
    color: 'from-primary to-primary/50',
    details: ['IMD Weather Data', 'IoT Sensor Network', 'Historical Climate Records']
  },
  {
    id: 3,
    title: 'AI Risk Analysis',
    description: 'Deep learning models analyze patterns to detect anomalies, predict risks, and identify hotspots.',
    icon: Brain,
    color: 'from-secondary to-primary',
    details: ['CNN Image Analysis', 'LSTM Time Series', 'Anomaly Detection']
  },
  {
    id: 4,
    title: 'Urban Heat Intelligence',
    description: 'Real-time urban heat island mapping with correlation analysis between vegetation and temperature.',
    icon: Thermometer,
    color: 'from-destructive to-warning',
    details: ['Surface Temperature', 'Heat Island Detection', 'Cooling Potential']
  },
  {
    id: 5,
    title: 'Plantation Strategy',
    description: 'AI-generated recommendations for optimal tree plantation locations and species selection.',
    icon: TreeDeciduous,
    color: 'from-primary to-primary/50',
    details: ['Species Selection', 'Location Optimization', 'Impact Prediction']
  },
  {
    id: 6,
    title: 'Governance Pipeline',
    description: 'Automated report generation and action routing to relevant government authorities.',
    icon: Building2,
    color: 'from-warning to-warning/50',
    details: ['Auto Reports', 'Authority Routing', 'Action Tracking']
  }
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navigation />
      
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-[1200px]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-tech text-primary">SYSTEM ARCHITECTURE</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-wide mb-4">
              <span className="text-glow">HOW IT</span>{" "}
              <span className="text-muted-foreground">WORKS</span>
            </h1>
            <p className="text-muted-foreground font-tech max-w-2xl mx-auto">
              DelhiCanopy combines satellite imagery, climate data, and AI analytics to create 
              a comprehensive urban green intelligence system.
            </p>
          </motion.div>

          {/* Flow Diagram */}
          <div className="relative">
            {/* Connection Lines */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-secondary/50 to-primary/50 -translate-x-1/2 hidden lg:block" />

            <div className="space-y-8 lg:space-y-0">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className={cn(
                    "relative",
                    "lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center",
                    idx % 2 === 1 && "lg:flex-row-reverse"
                  )}
                >
                  {/* Card */}
                  <div className={cn(
                    "relative",
                    idx % 2 === 1 && "lg:col-start-2"
                  )}>
                    <GlassCard className="p-6 hover:scale-[1.02] transition-transform duration-300">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                          `bg-gradient-to-br ${step.color}`,
                          "shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                        )}>
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                              {step.id}
                            </span>
                            <h3 className="text-lg font-display font-bold">{step.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {step.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {step.details.map((detail, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-card/50 border border-border/50 text-xs font-tech text-muted-foreground"
                              >
                                <CheckCircle2 className="w-3 h-3 text-primary" />
                                {detail}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </GlassCard>

                    {/* Arrow to next */}
                    {idx < steps.length - 1 && (
                      <div className="flex justify-center py-4 lg:hidden">
                        <ArrowRight className="w-6 h-6 text-primary rotate-90" />
                      </div>
                    )}
                  </div>

                  {/* Center Node */}
                  <div className={cn(
                    "hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                    "w-4 h-4 rounded-full bg-primary",
                    "shadow-[0_0_20px_hsl(var(--primary))]",
                    "z-10"
                  )}>
                    <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50" />
                  </div>

                  {/* Empty column for alternating layout */}
                  <div className={cn(
                    "hidden lg:block",
                    idx % 2 === 1 && "lg:col-start-1 lg:row-start-1"
                  )} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-16"
          >
            <GlassCard className="p-6 text-center">
              <h3 className="text-sm font-display font-semibold mb-4">TECHNOLOGY STACK</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  'React', 'TensorFlow', 'Mapbox', 'PostgreSQL', 
                  'Python', 'GeoServer', 'Kafka', 'Kubernetes'
                ].map((tech, idx) => (
                  <span
                    key={tech}
                    className="px-4 py-2 rounded-lg bg-card/50 border border-border/50 text-sm font-tech text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all cursor-default"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 p-4 rounded-lg bg-card/30 border border-border/30 text-center"
          >
            <p className="text-xs text-muted-foreground font-tech">
              <span className="text-primary">ℹ</span> This is a simulation prototype demonstrating the potential of AI-driven urban climate intelligence. 
              Actual implementation would require integration with government satellite feeds and IoT infrastructure.
            </p>
          </motion.div>
        </div>
      </main>

      <FloatingAIAssistant />
    </div>
  );
};

export default HowItWorks;
