import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchGeoJSON } from "@/services/canopyAPI";

export interface MapWard {
  id: string;
  name: string;
  zone: string;
  coordinates: [number, number][][];
  centroid: [number, number];
  greenCover: number;
  heatIndex: number;
  riskScore: number;
  priority: string;
  ndviValue: number;
  landSurfaceTemp: number;
}

export interface MapAlert {
  id: string;
  type: string;
  severity: string;
  wardName: string;
  message: string;
  coordinates: [number, number];
  timestamp: string;
  isActive: boolean;
}

export function useMapData() {
  const [wards, setWards] = useState<MapWard[]>([]);
  const [alerts, setAlerts] = useState<MapAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMapData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch wards with their latest metrics
      const { data: wardsData, error: wardsError } = await supabase
        .from("wards")
        .select(`
          id,
          name,
          zone,
          boundary,
          centroid,
          ndvi_scores (
            ndvi_value,
            green_cover_percent
          ),
          heat_indices (
            heat_index,
            land_surface_temp
          ),
          risk_assessments (
            overall_risk_score,
            priority
          )
        `)
        .order("ward_number");

      if (wardsError) throw wardsError;

      // Transform ward data for map consumption
      const transformedWards: MapWard[] = (wardsData || []).map((ward: any) => {
        const latestNdvi = ward.ndvi_scores?.[0];
        const latestHeat = ward.heat_indices?.[0];
        const latestRisk = ward.risk_assessments?.[0];

        return {
          id: ward.id,
          name: ward.name,
          zone: ward.zone,
          coordinates: ward.boundary?.coordinates || [],
          centroid: ward.centroid?.coordinates || [77.209, 28.6139],
          greenCover: latestNdvi?.green_cover_percent || 20,
          heatIndex: latestHeat?.heat_index || 60,
          riskScore: latestRisk?.overall_risk_score || 50,
          priority: latestRisk?.priority || "medium",
          ndviValue: latestNdvi?.ndvi_value || 0.2,
          landSurfaceTemp: latestHeat?.land_surface_temp || 35,
        };
      });

      setWards(transformedWards);

      // Fetch active alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from("alerts")
        .select(`
          id,
          alert_type,
          severity,
          message,
          location,
          location_description,
          detected_at,
          is_active,
          wards (name)
        `)
        .eq("is_active", true)
        .order("detected_at", { ascending: false })
        .limit(50);

      if (alertsError) throw alertsError;

      // Transform alerts data
      const transformedAlerts: MapAlert[] = (alertsData || []).map((alert: any) => ({
        id: alert.id,
        type: alert.alert_type,
        severity: alert.severity,
        wardName: alert.wards?.name || alert.location_description,
        message: alert.message,
        coordinates: alert.location?.coordinates 
          ? [alert.location.coordinates[1], alert.location.coordinates[0]] 
          : [28.6139, 77.209],
        timestamp: alert.detected_at,
        isActive: alert.is_active,
      }));

      setAlerts(transformedAlerts);
    } catch (err) {
      console.error("Error fetching map data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch map data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  return {
    wards,
    alerts,
    isLoading,
    error,
    refresh: fetchMapData,
  };
}

// Hook to get GeoJSON data from API
export function useGeoJSON(layer: string = "all") {
  const [geoJSON, setGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchGeoJSON(layer);
      setGeoJSON(data);
    } catch (err) {
      console.error("Error fetching GeoJSON:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch GeoJSON");
    } finally {
      setIsLoading(false);
    }
  }, [layer]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { geoJSON, isLoading, error, refresh: fetchData };
}
