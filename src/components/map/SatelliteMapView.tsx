import { useEffect, useRef, useState, useCallback } from "react";
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
  Satellite,
  Clock,
  Play,
  Pause,
} from "lucide-react";
import { DELHI_WARD_BOUNDARIES, getAlertLocations } from "@/data/delhiWardBoundaries";
import { Slider } from "@/components/ui/slider";

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
      <div className="absolute inset-0 opacity-20">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-[1px] bg-primary/30"
            style={{ top: `${i * 3.33}%` }}
          />
        ))}
      </div>

      {/* Radar sweep */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-full h-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent, hsl(155 100% 50% / 0.08), transparent 120deg)",
          }}
        />
      </div>

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-10 h-10 border-l-2 border-t-2 border-primary/60" />
      <div className="absolute top-4 right-4 w-10 h-10 border-r-2 border-t-2 border-primary/60" />
      <div className="absolute bottom-4 left-4 w-10 h-10 border-l-2 border-b-2 border-primary/60" />
      <div className="absolute bottom-4 right-4 w-10 h-10 border-r-2 border-b-2 border-primary/60" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(hsl(155 100% 50% / 0.4) 1px, transparent 1px),
            linear-gradient(90deg, hsl(155 100% 50% / 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)"
        }}
      />
    </div>
  );
}

export function SatelliteMapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    green?: L.LayerGroup;
    heat?: L.LayerGroup;
    risk?: L.LayerGroup;
    priority?: L.LayerGroup;
    satellite?: L.TileLayer;
  }>({});

  const [layers, setLayers] = useState<MapLayer[]>([
    { id: "green", label: "NDVI Layer", icon: TreeDeciduous, color: "text-primary", active: true },
    { id: "heat", label: "Heat Stress", icon: Thermometer, color: "text-destructive", active: false },
    { id: "risk", label: "Risk Zones", icon: AlertTriangle, color: "text-warning", active: false },
    { id: "priority", label: "Priority Areas", icon: Target, color: "text-secondary", active: false },
  ]);

  const [hoveredWard, setHoveredWard] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState(11);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.209]);
  const [timeSlider, setTimeSlider] = useState([11]); // Current month
  const [isPlaying, setIsPlaying] = useState(false);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Auto-play time slider
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setTimeSlider(prev => [(prev[0] + 1) % 12]);
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Color functions
  const getGreenColor = useCallback((greenCover: number) => {
    if (greenCover > 35) return { color: "#00FF9C", fillColor: "#00FF9C", opacity: 0.7 };
    if (greenCover > 20) return { color: "#22c55e", fillColor: "#22c55e", opacity: 0.5 };
    if (greenCover > 10) return { color: "#eab308", fillColor: "#eab308", opacity: 0.4 };
    return { color: "#ef4444", fillColor: "#ef4444", opacity: 0.5 };
  }, []);

  const getHeatColor = useCallback((heatIndex: number) => {
    if (heatIndex > 85) return { color: "#dc2626", fillColor: "#dc2626", opacity: 0.7 };
    if (heatIndex > 70) return { color: "#f97316", fillColor: "#f97316", opacity: 0.6 };
    if (heatIndex > 55) return { color: "#eab308", fillColor: "#eab308", opacity: 0.5 };
    return { color: "#22c55e", fillColor: "#22c55e", opacity: 0.4 };
  }, []);

  const getRiskColor = useCallback((riskScore: number) => {
    if (riskScore > 80) return "#ef4444";
    if (riskScore > 60) return "#f97316";
    if (riskScore > 40) return "#eab308";
    return "#22c55e";
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map with satellite view
    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.209],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
    });

    // Satellite tile layer (Esri World Imagery)
    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
      }
    ).addTo(map);

    // Dark overlay for better visualization
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        opacity: 0.7,
      }
    ).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;
    layersRef.current.satellite = satelliteLayer;

    // Create layer groups
    const greenLayer = L.layerGroup().addTo(map);
    const heatLayer = L.layerGroup();
    const riskLayer = L.layerGroup();
    const priorityLayer = L.layerGroup();

    layersRef.current = {
      ...layersRef.current,
      green: greenLayer,
      heat: heatLayer,
      risk: riskLayer,
      priority: priorityLayer,
    };

    // Add Green Cover (NDVI) polygons
    DELHI_WARD_BOUNDARIES.forEach((ward) => {
      const coords = ward.coordinates[0].map(
        (coord) => [coord[1], coord[0]] as L.LatLngTuple
      );
      
      const style = getGreenColor(ward.greenCover);
      
      const polygon = L.polygon(coords, {
        color: style.color,
        fillColor: style.fillColor,
        fillOpacity: style.opacity * 0.6,
        weight: 2,
      });

      polygon.bindPopup(`
        <div style="background: rgba(10, 15, 30, 0.95); padding: 12px; border-radius: 8px; color: white; font-family: 'Space Grotesk', monospace; min-width: 180px; border: 1px solid rgba(0, 255, 156, 0.3);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${style.color}; box-shadow: 0 0 10px ${style.color};"></div>
            <strong style="color: #00FF9C; font-size: 14px;">${ward.name}</strong>
          </div>
          <div style="color: #888; font-size: 11px; margin-bottom: 8px;">${ward.zone}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <div style="color: #666; font-size: 10px;">NDVI Score</div>
              <div style="color: #00FF9C; font-size: 16px; font-weight: bold;">${(ward.greenCover / 100 * 0.7 + 0.05).toFixed(2)}</div>
            </div>
            <div>
              <div style="color: #666; font-size: 10px;">Green Cover</div>
              <div style="color: #00FF9C; font-size: 16px; font-weight: bold;">${ward.greenCover}%</div>
            </div>
          </div>
        </div>
      `);

      polygon.on('mouseover', () => setHoveredWard(ward.name));
      polygon.on('mouseout', () => setHoveredWard(null));

      polygon.addTo(greenLayer);
    });

    // Add Heat Stress polygons
    DELHI_WARD_BOUNDARIES.forEach((ward) => {
      const coords = ward.coordinates[0].map(
        (coord) => [coord[1], coord[0]] as L.LatLngTuple
      );
      
      const style = getHeatColor(ward.heatIndex);
      
      const polygon = L.polygon(coords, {
        color: style.color,
        fillColor: style.fillColor,
        fillOpacity: style.opacity * 0.6,
        weight: 2,
      });

      polygon.bindPopup(`
        <div style="background: rgba(10, 15, 30, 0.95); padding: 12px; border-radius: 8px; color: white; font-family: 'Space Grotesk', monospace; min-width: 180px; border: 1px solid rgba(239, 68, 68, 0.3);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${style.color}; box-shadow: 0 0 10px ${style.color};"></div>
            <strong style="color: #ef4444; font-size: 14px;">${ward.name}</strong>
          </div>
          <div style="color: #888; font-size: 11px; margin-bottom: 8px;">${ward.zone}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <div style="color: #666; font-size: 10px;">Heat Index</div>
              <div style="color: #ef4444; font-size: 16px; font-weight: bold;">${ward.heatIndex}/100</div>
            </div>
            <div>
              <div style="color: #666; font-size: 10px;">LST</div>
              <div style="color: #ef4444; font-size: 16px; font-weight: bold;">${(30 + ward.heatIndex * 0.18).toFixed(1)}°C</div>
            </div>
          </div>
        </div>
      `);

      polygon.addTo(heatLayer);
    });

    // Add Risk Zone markers
    const alertLocations = getAlertLocations();
    alertLocations
      .filter(loc => loc.riskScore > 60)
      .forEach((alert) => {
        const color = getRiskColor(alert.riskScore);

        L.circleMarker(alert.coordinates, {
          radius: alert.riskScore > 80 ? 14 : 10,
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.5,
        })
          .bindPopup(`
            <div style="background: rgba(10, 15, 30, 0.95); padding: 12px; border-radius: 8px; color: white; font-family: 'Space Grotesk', monospace; min-width: 160px; border: 1px solid ${color}40;">
              <strong style="color: ${color}; font-size: 14px;">${alert.name}</strong>
              <div style="margin-top: 8px;">
                <div style="color: #666; font-size: 10px;">Risk Score</div>
                <div style="color: ${color}; font-size: 18px; font-weight: bold;">${alert.riskScore}/100</div>
              </div>
              <div style="margin-top: 4px; padding: 4px 8px; background: ${color}20; border-radius: 4px; text-align: center;">
                <span style="color: ${color}; font-size: 10px; font-weight: bold;">
                  ${alert.riskScore > 80 ? '⚠️ CRITICAL ZONE' : '⚡ HIGH RISK'}
                </span>
              </div>
            </div>
          `)
          .addTo(riskLayer);
      });

    // Add Priority Area markers (critical and high priority wards)
    DELHI_WARD_BOUNDARIES
      .filter(w => w.riskScore > 70 || w.greenCover < 15)
      .forEach((ward) => {
        const priorityLevel = ward.riskScore > 85 ? "CRITICAL" : ward.riskScore > 70 ? "HIGH" : "MEDIUM";
        const color = priorityLevel === "CRITICAL" ? "#ef4444" : priorityLevel === "HIGH" ? "#f59e0b" : "#00C2FF";

        L.marker([ward.centroid[1], ward.centroid[0]])
          .bindPopup(`
            <div style="background: rgba(10, 15, 30, 0.95); padding: 12px; border-radius: 8px; color: white; font-family: 'Space Grotesk', monospace; border: 1px solid ${color}40;">
              <strong style="color: #00C2FF; font-size: 14px;">${ward.name}</strong>
              <div style="margin-top: 8px; display: flex; gap: 12px;">
                <div>
                  <div style="color: #666; font-size: 10px;">Priority</div>
                  <div style="color: ${color}; font-size: 12px; font-weight: bold;">${priorityLevel}</div>
                </div>
                <div>
                  <div style="color: #666; font-size: 10px;">Risk Score</div>
                  <div style="color: #fff; font-size: 12px;">${ward.riskScore}</div>
                </div>
              </div>
              <div style="margin-top: 8px; padding: 6px; background: rgba(0, 194, 255, 0.1); border-radius: 4px;">
                <div style="color: #00C2FF; font-size: 10px;">Recommended: ${Math.round(ward.riskScore * 5)} trees</div>
              </div>
            </div>
          `)
          .addTo(priorityLayer);
      });

    // Track map state
    map.on('zoomend', () => setMapZoom(map.getZoom()));
    map.on('moveend', () => {
      const center = map.getCenter();
      setMapCenter([center.lat, center.lng]);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [getGreenColor, getHeatColor, getRiskColor]);

  // Toggle layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    layers.forEach((layer) => {
      const layerGroup = layersRef.current[layer.id as keyof typeof layersRef.current];
      if (!layerGroup || layerGroup instanceof L.TileLayer) return;

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

      {/* Time Slider */}
      <div className="absolute bottom-20 left-4 right-4 z-[1001] max-w-md mx-auto">
        <div className="glass-card p-3">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary/30 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3 text-primary" />
              ) : (
                <Play className="w-3 h-3 text-primary ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <Slider
                value={timeSlider}
                onValueChange={setTimeSlider}
                max={11}
                step={1}
                className="[&>span:first-child]:bg-muted [&>span:first-child>span]:bg-primary"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-tech text-primary min-w-[32px]">
                {months[timeSlider[0]]} 2024
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Coordinates Display */}
      <div className="absolute bottom-4 left-4 z-[1001]">
        <div className="glass-card px-3 py-2 flex items-center gap-4">
          <div className="text-[10px] font-tech text-muted-foreground">
            <span className="text-primary">LAT:</span> {mapCenter[0].toFixed(4)}°N
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="text-[10px] font-tech text-muted-foreground">
            <span className="text-primary">LNG:</span> {mapCenter[1].toFixed(4)}°E
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="text-[10px] font-tech text-muted-foreground">
            <span className="text-primary">ZOOM:</span> {mapZoom}x
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-[1001]">
        <div className="glass-card px-3 py-2 flex items-center gap-2">
          <Satellite className="w-4 h-4 text-primary" />
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping" />
          </div>
          <span className="text-[10px] font-tech text-muted-foreground">
            ESRI SATELLITE FEED • LIVE
          </span>
        </div>
      </div>

      {/* Hovered Ward Info */}
      {hoveredWard && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001]"
        >
          <div className="glass-card px-4 py-2">
            <span className="text-sm font-display font-semibold text-primary">{hoveredWard}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
