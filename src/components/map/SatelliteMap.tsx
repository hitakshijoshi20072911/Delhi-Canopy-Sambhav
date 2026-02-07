import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Layers, 
  TreeDeciduous, 
  Thermometer, 
  AlertTriangle,
  Target,
  Eye,
  EyeOff,
  MapPin
} from "lucide-react";

interface MapLayer {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  active: boolean;
}

function ScanOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1000]">
      {/* Scan lines */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-[1px] bg-primary/20"
            style={{ top: `${i * 5}%` }}
          />
        ))}
      </div>
      
      {/* Radar sweep */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-full h-full"
          style={{
            background: "conic-gradient(from 0deg, transparent, hsl(155 100% 50% / 0.1), transparent 90deg)"
          }}
        />
      </div>

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/50" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/50" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/50" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/50" />

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(155 100% 50% / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(155 100% 50% / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}

// Simple map placeholder that works without leaflet for now
function SimpleMapView({ layers }: { layers: MapLayer[] }) {
  return (
    <div className="relative w-full h-full bg-[#0a0a12] rounded-lg overflow-hidden">
      {/* Map background with simulated satellite view */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 50%, hsl(220 30% 12%) 0%, hsl(220 40% 6%) 100%)
          `
        }}
      />
      
      {/* Simulated map grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(hsl(155 100% 50% / 0.2) 1px, transparent 1px),
            linear-gradient(90deg, hsl(155 100% 50% / 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* City outline representation */}
      <div className="absolute inset-8 border border-primary/20 rounded-lg" />
      
      {/* Simulated zones */}
      <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-primary/20 blur-xl" />
      <div className="absolute top-1/3 right-1/3 w-24 h-24 rounded-full bg-primary/30 blur-xl" />
      <div className="absolute bottom-1/4 left-1/3 w-20 h-20 rounded-full bg-warning/20 blur-xl" />
      <div className="absolute bottom-1/3 right-1/4 w-12 h-12 rounded-full bg-destructive/20 blur-xl" />

      {/* Map pins */}
      {[
        { top: '30%', left: '40%', color: 'text-primary' },
        { top: '45%', left: '55%', color: 'text-warning' },
        { top: '60%', left: '35%', color: 'text-destructive' },
        { top: '35%', left: '65%', color: 'text-primary' },
      ].map((pin, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: idx * 0.2 }}
          className="absolute"
          style={{ top: pin.top, left: pin.left }}
        >
          <MapPin className={cn("w-6 h-6 drop-shadow-lg", pin.color)} />
          <div className={cn("absolute inset-0 animate-ping opacity-50")}>
            <MapPin className={cn("w-6 h-6", pin.color)} />
          </div>
        </motion.div>
      ))}

      {/* Delhi label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-lg font-display font-bold text-primary/50">DELHI NCT</p>
        <p className="text-[10px] font-tech text-muted-foreground">SATELLITE VIEW</p>
      </div>

      {/* Heat overlay */}
      {layers.find(l => l.id === 'heat')?.active && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 50% 40%, hsl(0 80% 50% / 0.3) 0%, transparent 30%),
              radial-gradient(circle at 30% 60%, hsl(30 80% 50% / 0.25) 0%, transparent 25%),
              radial-gradient(circle at 70% 50%, hsl(0 80% 50% / 0.2) 0%, transparent 20%)
            `
          }}
        />
      )}

      {/* Green cover overlay */}
      {layers.find(l => l.id === 'green')?.active && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, hsl(155 80% 40% / 0.25) 0%, transparent 20%),
              radial-gradient(circle at 80% 70%, hsl(155 80% 40% / 0.3) 0%, transparent 25%),
              radial-gradient(circle at 60% 20%, hsl(155 80% 40% / 0.2) 0%, transparent 15%)
            `
          }}
        />
      )}
    </div>
  );
}

export function SatelliteMap() {
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'green', label: 'Green Cover', icon: TreeDeciduous, color: 'text-primary', active: true },
    { id: 'heat', label: 'Heat Stress', icon: Thermometer, color: 'text-destructive', active: false },
    { id: 'risk', label: 'Risk Zones', icon: AlertTriangle, color: 'text-warning', active: false },
    { id: 'priority', label: 'Priority Areas', icon: Target, color: 'text-secondary', active: false },
  ]);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, active: !layer.active } : layer
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative h-full min-h-[500px] rounded-xl overflow-hidden border border-border/50"
    >
      {/* Map View */}
      <SimpleMapView layers={layers} />

      {/* Scan Overlay */}
      <ScanOverlay />

      {/* Layer Controls */}
      <div className="absolute top-4 left-4 z-[1001]">
        <div className="glass-card p-3 space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-xs font-display font-semibold">MAP LAYERS</span>
          </div>
          {layers.map((layer) => {
            const Icon = layer.icon;
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1.5 rounded-md transition-all duration-200",
                  "text-xs font-medium",
                  layer.active 
                    ? "bg-primary/10 text-foreground border border-primary/30" 
                    : "text-muted-foreground hover:bg-card/50"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", layer.active ? layer.color : "")} />
                <span className="flex-1 text-left">{layer.label}</span>
                {layer.active ? (
                  <Eye className="w-3 h-3 text-primary" />
                ) : (
                  <EyeOff className="w-3 h-3 opacity-50" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coordinates Display */}
      <div className="absolute bottom-4 left-4 z-[1001]">
        <div className="glass-card px-3 py-2 flex items-center gap-4">
          <div className="text-[10px] font-tech text-muted-foreground">
            <span className="text-primary">LAT:</span> 28.6139°N
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="text-[10px] font-tech text-muted-foreground">
            <span className="text-primary">LNG:</span> 77.2090°E
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="text-[10px] font-tech text-muted-foreground">
            <span className="text-primary">ZOOM:</span> 11x
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-[1001]">
        <div className="glass-card px-3 py-2 flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping" />
          </div>
          <span className="text-[10px] font-tech text-muted-foreground">SATELLITE FEED ACTIVE</span>
        </div>
      </div>
    </motion.div>
  );
}