import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import {
  Layers,
  TreeDeciduous,
  Thermometer,
  AlertTriangle,
  Target,
  Eye,
  EyeOff,
} from "lucide-react";
import { wardData, recentAlerts, delhiGeoJSON } from "@/data/mockData";

interface MapLayer {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  active: boolean;
}

// Fix for default marker icons in Leaflet with Vite
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

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
            background:
              "conic-gradient(from 0deg, transparent, hsl(155 100% 50% / 0.1), transparent 90deg)",
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
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}

export function InteractiveMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    green?: L.LayerGroup;
    heat?: L.LayerGroup;
    risk?: L.LayerGroup;
    priority?: L.LayerGroup;
  }>({});

  const [layers, setLayers] = useState<MapLayer[]>([
    { id: "green", label: "Green Cover", icon: TreeDeciduous, color: "text-primary", active: true },
    { id: "heat", label: "Heat Stress", icon: Thermometer, color: "text-destructive", active: false },
    { id: "risk", label: "Risk Zones", icon: AlertTriangle, color: "text-warning", active: false },
    { id: "priority", label: "Priority Areas", icon: Target, color: "text-secondary", active: false },
  ]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.209],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark theme tile layer
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
      }
    ).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    // Create layer groups
    const greenLayer = L.layerGroup().addTo(map);
    const heatLayer = L.layerGroup();
    const riskLayer = L.layerGroup();
    const priorityLayer = L.layerGroup();

    layersRef.current = {
      green: greenLayer,
      heat: heatLayer,
      risk: riskLayer,
      priority: priorityLayer,
    };

    // Add Green Cover polygons
    delhiGeoJSON.features.forEach((feature) => {
      const coords = feature.geometry.coordinates[0].map(
        (coord) => [coord[1], coord[0]] as L.LatLngTuple
      );
      
      const greenness = feature.properties.greenCover;
      const opacity = greenness / 100;
      
      L.polygon(coords, {
        color: "hsl(155, 100%, 50%)",
        fillColor: "hsl(155, 100%, 40%)",
        fillOpacity: opacity * 0.6,
        weight: 2,
      })
        .bindPopup(`
          <div style="background: #1a1a2e; padding: 8px; border-radius: 8px; color: white; font-family: monospace;">
            <strong style="color: #00FF9C;">${feature.properties.name}</strong><br/>
            <span style="color: #888;">Green Cover: <span style="color: #00FF9C;">${feature.properties.greenCover}%</span></span>
          </div>
        `)
        .addTo(greenLayer);
    });

    // Add Heat Stress polygons
    delhiGeoJSON.features.forEach((feature) => {
      const coords = feature.geometry.coordinates[0].map(
        (coord) => [coord[1], coord[0]] as L.LatLngTuple
      );
      
      const heat = feature.properties.heatIndex;
      const opacity = heat / 100;
      
      L.polygon(coords, {
        color: "hsl(0, 84%, 60%)",
        fillColor: "hsl(0, 84%, 50%)",
        fillOpacity: opacity * 0.6,
        weight: 2,
      })
        .bindPopup(`
          <div style="background: #1a1a2e; padding: 8px; border-radius: 8px; color: white; font-family: monospace;">
            <strong style="color: #ef4444;">${feature.properties.name}</strong><br/>
            <span style="color: #888;">Heat Index: <span style="color: #ef4444;">${feature.properties.heatIndex}</span></span>
          </div>
        `)
        .addTo(heatLayer);
    });

    // Add Risk Zone markers
    recentAlerts.forEach((alert) => {
      const color =
        alert.severity === "critical"
          ? "#ef4444"
          : alert.severity === "high"
          ? "#f59e0b"
          : "#00FF9C";

      L.circleMarker([alert.coordinates[0], alert.coordinates[1]], {
        radius: alert.severity === "critical" ? 12 : 8,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.4,
      })
        .bindPopup(`
          <div style="background: #1a1a2e; padding: 8px; border-radius: 8px; color: white; font-family: monospace; max-width: 200px;">
            <strong style="color: ${color};">${alert.ward}</strong><br/>
            <span style="color: #888; font-size: 11px;">${alert.message}</span>
          </div>
        `)
        .addTo(riskLayer);
    });

    // Add Priority Area markers
    wardData
      .filter((w) => w.priority === "critical" || w.priority === "high")
      .forEach((ward, index) => {
        // Approximate coordinates for wards
        const lat = 28.55 + Math.random() * 0.25;
        const lng = 77.1 + Math.random() * 0.2;

        L.marker([lat, lng])
          .bindPopup(`
            <div style="background: #1a1a2e; padding: 8px; border-radius: 8px; color: white; font-family: monospace;">
              <strong style="color: #00C2FF;">${ward.name}</strong><br/>
              <span style="color: #888;">Priority: <span style="color: ${ward.priority === 'critical' ? '#ef4444' : '#f59e0b'};">${ward.priority.toUpperCase()}</span></span><br/>
              <span style="color: #888;">Risk Score: ${ward.riskScore}</span>
            </div>
          `)
          .addTo(priorityLayer);
      });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Toggle layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    layers.forEach((layer) => {
      const layerGroup = layersRef.current[layer.id as keyof typeof layersRef.current];
      if (!layerGroup) return;

      if (layer.active) {
        if (!map.hasLayer(layerGroup)) {
          layerGroup.addTo(map);
        }
      } else {
        if (map.hasLayer(layerGroup)) {
          map.removeLayer(layerGroup);
        }
      }
    });
  }, [layers]);

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, active: !layer.active } : layer
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative h-full min-h-[500px] rounded-xl overflow-hidden border border-border/50"
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

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
          <span className="text-[10px] font-tech text-muted-foreground">
            SATELLITE FEED ACTIVE
          </span>
        </div>
      </div>
    </motion.div>
  );
}
